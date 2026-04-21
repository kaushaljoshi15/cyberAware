import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Fallback
      return NextResponse.json({
        type: "email",
        title: "Urgent Password Reset (Fallback)",
        sender: "security@accounts-google.com",
        content: "Dear User, your account has been compromised. Please click the link below to verify your identity immediately.\n\n[http://accounts.google-security-update.com/login]",
        isPhishing: true,
        explanation: "This is a fallback response because GROQ_API_KEY is missing. Domain is fake."
      });
    }

    const groq = new Groq({ apiKey });

    const prompt = `You are a world-class cybersecurity expert designing training scenarios for a Security Operations Center (SOC) dashboard.
Generate a single, completely random and highly realistic workplace communication scenario. 
Randomly decide if the communication is a malicious attack (phishing/social engineering/malware) or a safe, expected communication.
Randomly decide whether the communication type is an "email", "sms" (text message), or "messaging" (Slack/Teams).

For SMS and messaging, format the sender and content appropriately (e.g. phone numbers for SMS, handles for messaging, short punchy text). For emails, use email formatting. Ensure maximum variety so the user never sees similar prompts.

Return ONLY a perfectly formatted JSON object matching this exact schema:
{
  "type": "email" | "sms" | "messaging",
  "title": "string (A brief subject line or summary of the message)",
  "sender": "string (An email address, phone number, or network handle)",
  "content": "string (The actual multiline payload or message)",
  "isPhishing": boolean (true if malicious, false if benign),
  "explanation": "string (A detailed post-incident security explanation of why this was flagged as an attack, or why it is structurally safe. Point out technical indicators like domain typos, urgency, formatting.)"
}`;

    // Temperature is higher here (0.8) to ensure unique, creative generation each time.
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.8, 
      response_format: { type: "json_object" },
    });

    const textResp = chatCompletion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(textResp);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Groq Scenario Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate scenario." }, { status: 500 });
  }
}
