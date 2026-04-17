import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logAnalysis, incrementAwarenessScore } from "@/lib/cyber-db";
import { cookies } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { type, content } = await req.json();
    const cookieStore = await cookies();
    const email = cookieStore.get("userEmail")?.value;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Setup Gemini Model Prompt
    // Requires JSON output.
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are a world-class cybersecurity expert. Analyze the following user-submitted ${type}:
    CONTENT: "${content}"
    
    Classify it into one of these categories: "Phishing", "Malware", "Social Engineering", or "Safe".
    Determine the severity: "Low", "Medium", or "High" (If Safe, severity is "Low").
    Provide a plain-English explanation of why the content is dangerous (or safe), pointing out specific red flags.
    Provide actionable recommendation advice (1 sentence).

    Return ONLY a valid JSON object matching exactly this schema, without markdown formatting if mime type handles it:
    {
      "classification": "Phishing" | "Malware" | "Social Engineering" | "Safe",
      "severity": "Low" | "Medium" | "High",
      "confidenceScore": number, // 0-100 indicating how confident you are
      "iocs": string[], // Indicators of compromise (e.g., specific sketchy URLs, sender mismatches, urgent keywords)
      "explanation": "string",
      "recommendations": "string"
    }`;

    // Note: If GEMINI_API_KEY is missing during hackathon local dev, return dummy data to prevent crashes
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Using mock response.");
      const mockClass = content.toLowerCase().includes("http") ? "Phishing" : "Safe";
      const result = {
        classification: mockClass,
        severity: mockClass === "Safe" ? "Low" : "High",
        confidenceScore: mockClass === "Safe" ? 99 : 87,
        iocs: mockClass === "Safe" ? [] : ["Suspicious wording", "Unknown sender"],
        explanation: "This is a mocked response because GEMINI_API_KEY is missing.",
        recommendations: "Please add GEMINI_API_KEY to .env to enable real analysis."
      };
      await logAnalysis(email, content, type, result.classification, result.severity, result.explanation, result.recommendations);
      await incrementAwarenessScore(email, 10);
      return NextResponse.json(result);
    }

    let result;
    try {
      const aiResult = await model.generateContent(prompt);
      const textResp = aiResult.response.text();
      const cleanText = textResp.replace(/```json/gi, "").replace(/```/gi, "").trim();
      result = JSON.parse(cleanText);
    } catch (apiError: any) {
      if (apiError.message?.includes("429") || apiError.message?.includes("503") || apiError.status === 429 || apiError.status === 503) {
        console.warn("Gemini API rate limit or service unavailable. Falling back to mock response.");
        const mockClass = content.toLowerCase().includes("http") ? "Phishing" : "Safe";
        result = {
          classification: mockClass,
          severity: mockClass === "Safe" ? "Low" : "High",
          confidenceScore: mockClass === "Safe" ? 99 : 87,
          iocs: mockClass === "Safe" ? [] : ["Suspicious link or wording detected"],
          explanation: "FALLBACK MODE: The AI rate limit was exceeded (429). This is a safe simulated response.",
          recommendations: "Please try again later when the quota resets."
        };
      } else {
        throw apiError; // rethrow other errors
      }
    }

    // Save to DB and increase score
    await logAnalysis(email, content, type, result.classification, result.severity, result.explanation, result.recommendations);
    
    // Reward the user 10 points for taking action to analyze
    await incrementAwarenessScore(email, 10);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze Error:", error);
    return NextResponse.json({ error: "Failed to analyze the threat. " + ((error as Error).message || "") }, { status: 500 });
  }
}
