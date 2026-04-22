import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { logAnalysis, incrementAwarenessScore } from "@/lib/cyber-db";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
// Zod schema for input validation
const analyzeSchema = z.object({
  type: z.enum(["url", "text", "file_hash"]),
  content: z.string().max(15000), // Max 15k characters!
  filename: z.string().optional(),
});

// In-Memory Rate Limiter Map
// Structure: Map<IP, { count: number, resetTime: number }>
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Max 5 requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function POST(req: Request) {
  try {
    // 1. RATE LIMITING
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    
    if (now > rateData.resetTime) {
      rateData.count = 0;
      rateData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    }
    
    rateData.count += 1;
    rateLimitMap.set(ip, rateData);

    if (rateData.count > RATE_LIMIT_MAX) {
      return NextResponse.json({ 
        error: "Rate limit exceeded. Maximum 5 analysis requests per minute per IP to prevent DDoS." 
      }, { status: 429 });
    }

    // 2. INPUT VALIDATION (Zod)
    const json = await req.json();
    const parseResult = analyzeSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid data payload structure." }, { status: 400 });
    }

    const { type, content, filename } = parseResult.data;
    
    const cookieStore = await cookies();
    const email = cookieStore.get("userEmail")?.value;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 3. VIRUSTOTAL FILE HASH PATH
    if (type === "file_hash") {
      const cachedResult = await prisma.threatIntelligenceCache.findUnique({
        where: { fileHash: content }
      });

      let isMalicious = false;
      let explanation = "";
      
      if (cachedResult) {
        console.log("CACHE HIT: Bypassing VirusTotal API");
        isMalicious = cachedResult.isMalware;
        explanation = `CACHE HIT: Retrieved from local Prisma Threat Intelligence Cache. ${cachedResult.maliciousVotes} vendors out of ${cachedResult.totalVendors} flagged this file.`;
      } else {
        console.log("CACHE MISS: Contacting VirusTotal Network...");
        const vtApiKey = process.env.VIRUSTOTAL_API_KEY;
        if (!vtApiKey) {
          console.warn("No VirusTotal API Key provided in .env");
          isMalicious = content.match(/^[0-9a-c]/i) !== null || Boolean(filename && (filename.toLowerCase().includes("eicar") || filename.toLowerCase().includes("malware")));
          explanation = "Simulated Fallback. Please add VIRUSTOTAL_API_KEY to .env to use the real API.";
        } else {
          console.log(`[VirusTotal API] Calling API for hash: ${content}`);
          const vtResponse = await fetch(`https://www.virustotal.com/api/v3/files/${content}`, {
            method: "GET",
            headers: { "x-apikey": vtApiKey },
          });

          if (vtResponse.status === 429) {
            return NextResponse.json({ error: "Global threat intelligence network saturated. Please try again later." }, { status: 429 });
          }

          if (vtResponse.status === 404) {
             explanation = "Hash not found in global databases. File appears unknown/safe.";
             isMalicious = false;
          } else {
             const vtData = await vtResponse.json();
             const stats = vtData.data?.attributes?.last_analysis_stats || { malicious: 0, suspicious: 0, undetected: 0, harmless: 0 };
             isMalicious = stats.malicious > 0 || stats.suspicious > 0;
             explanation = `LIVE API SCAN: ${stats.malicious} vendors out of ${stats.malicious + stats.undetected + stats.harmless + stats.suspicious} flagged this file.`;
             
             await prisma.threatIntelligenceCache.create({
               data: {
                 fileHash: content,
                 maliciousVotes: stats.malicious,
                 totalVendors: stats.malicious + stats.undetected + stats.harmless + stats.suspicious,
                 isMalware: isMalicious
               }
             });
          }
        }
      }

      const result = {
        classification: isMalicious ? "Malware" : "Safe",
        severity: isMalicious ? "High" : "Low",
        confidenceScore: isMalicious ? 98 : 100,
        iocs: isMalicious ? [`Signature Matched Globally`, `SHA-256: ${content}`] : [],
        explanation,
        recommendations: isMalicious 
          ? "Do NOT execute this file. Immediately quarantine and contact the security team." 
          : "File is safe for general use."
      };
      
      await logAnalysis(email, content, type, result.classification, result.severity, result.explanation, result.recommendations);
      await incrementAwarenessScore(email, 10);
      return NextResponse.json(result);
    }

    // 4. GROQ AI PATH for URLs and Text
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("GROQ_API_KEY is missing. Using mock response.");
      const mockClass = content.toLowerCase().includes("http") ? "Phishing" : "Safe";
      const result = {
        classification: mockClass,
        severity: mockClass === "Safe" ? "Low" : "High",
        confidenceScore: mockClass === "Safe" ? 99 : 85,
        iocs: mockClass === "Safe" ? [] : ["Suspicious heuristic keywords detected"],
        explanation: "This is a mocked response because GROQ_API_KEY is missing.",
        recommendations: "Please add GROQ_API_KEY to .env to enable real analysis."
      };
      await logAnalysis(email, content, type, result.classification, result.severity, result.explanation, result.recommendations);
      await incrementAwarenessScore(email, 10);
      return NextResponse.json(result);
    }

    const groq = new Groq({ apiKey });

    // Content is already safely bounded by Zod (max 15000)
    const prompt = `You are a world-class cybersecurity expert and an elite SOC Analyst. Analyze the following user-submitted ${type}:
    CONTENT: "${content}"
    
    CRITICAL CLASSIFICATION RULES:
    1. "Safe": The content is a standard, benign communication.
    2. "Phishing": Contains deceptive elements designed to steal data.
    3. "Social Engineering": Relies on psychological manipulation rather than pure technical attacks.
    4. "Malware": Explicitly attempts to distribute malicious payloads.
    
    Classify it into one of these categories: "Phishing", "Malware", "Social Engineering", or "Safe".
    Determine the severity: "Low", "Medium", or "High" (If Safe, severity is "Low").
    Provide a plain-English explanation of why the content is dangerous (or safe), pointing out specific red flags.
    Provide actionable recommendation advice (1 sentence).

    Return ONLY a valid JSON object matching exactly this schema:
    {
      "classification": "Phishing" | "Malware" | "Social Engineering" | "Safe",
      "severity": "Low" | "Medium" | "High",
      "confidenceScore": number,
      "iocs": string[],
      "mitreTactic": "string (e.g., Initial Access, Execution)",
      "mitreTechniqueId": "string (e.g., T1566)",
      "explanation": "string",
      "recommendations": "string"
    }`;

    // Call Groq Llama 3
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const textResp = chatCompletion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(textResp);

    await logAnalysis(email, content, type, result.classification, result.severity, result.explanation, result.recommendations);
    await incrementAwarenessScore(email, 10);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Analyze Route Error:", error);
    
    // Check if it's a Groq Rate Limit Error (429)
    if (error?.status === 429 || error?.error?.error?.message?.includes("Rate limit")) {
      return NextResponse.json({ 
        error: "Threat intelligence engine is cooling down. Please wait 10 seconds and try again." 
      }, { status: 429 });
    }

    return NextResponse.json({ error: "Failed to analyze the threat." }, { status: 500 });
  }
}
