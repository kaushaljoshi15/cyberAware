import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hostname, filepath, filehash, classification, severity } = body;

    if (!hostname || !filepath || !filehash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const alert = await prisma.endpointAlert.create({
      data: {
        hostname,
        filepath,
        filehash,
        classification: classification || "Malware Detected",
        severity: severity || "CRITICAL",
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, alertId: alert.id });
  } catch (error) {
    console.error("Report Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
