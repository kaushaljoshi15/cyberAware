import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // 1. Capture the attacker's details
  const attackerIp = req.headers.get("x-forwarded-for") || "Unknown IP";
  const userAgent = req.headers.get("user-agent") || "Unknown Device";

  console.warn(`[HONEYPOT TRIGGERED] Unauthorized access attempt from IP: ${attackerIp} | UA: ${userAgent}`);

  // 2. Log the attack to your Prisma database so it appears on the Global Intel Feed
  await prisma.analysisLog.create({
    data: {
      user_email: "HONEYPOT_SYSTEM", // System generated
      content: `Unauthorized scan detected from IP: ${attackerIp}`,
      type: "Active Defense: Intrusion Attempt",
      classification: "Honeypot Triggered",
      severity: "High",
      explanation: `An automated scanner or malicious actor attempted to access a restricted administrative database override endpoint.`,
      recommendations: `Block IP ${attackerIp} at the firewall level immediately.`,
    }
  });

  // 3. Fake a response to waste the hacker's time (Tarpitting)
  return NextResponse.json(
    { error: "ACCESS DENIED. Your IP has been logged and reported to the authorities." }, 
    { status: 403 }
  );
}
