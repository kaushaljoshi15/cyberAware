import { NextResponse } from "next/server";
import { logSimulation, incrementAwarenessScore } from "@/lib/cyber-db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { scenarioName, success } = await req.json();
    const cookieStore = await cookies();
    const email = cookieStore.get("userEmail")?.value;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await logSimulation(email, scenarioName, success);
    
    // Reward points for correct identification
    if (success) {
      await incrementAwarenessScore(email, 25);
    } else {
      // Small penalty or no points
      await incrementAwarenessScore(email, -5);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log simulation." }, { status: 500 });
  }
}
