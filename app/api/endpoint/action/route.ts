import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alertId, action } = body;

    if (!alertId || !action) {
      return NextResponse.json({ error: "Missing alertId or action" }, { status: 400 });
    }

    const validActions = ["DELETE_ORDERED", "IGNORED", "DELETED"];
    if (!validActions.includes(action)) {
       return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const alert = await prisma.endpointAlert.update({
      where: { id: alertId },
      data: { status: action }
    });

    return NextResponse.json({ success: true, status: alert.status });
  } catch (error) {
    console.error("Action Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
