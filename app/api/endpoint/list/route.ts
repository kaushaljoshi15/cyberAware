import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const alerts = await prisma.endpointAlert.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("List Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
