import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const alertId = searchParams.get('alertId');

  if (!alertId) {
    return NextResponse.json({ error: "Missing alertId" }, { status: 400 });
  }

  try {
    const alert = await prisma.endpointAlert.findUnique({
      where: { id: alertId }
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ status: alert.status });
  } catch (error) {
    console.error("Poll Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
