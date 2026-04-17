import { getAwarenessScore, getAnalysisHistory } from "@/lib/cyber-db";
import CyberDashboardClient from "./CyberDashboardClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function CyberDashboard() {
  const cookieStore = await cookies();
  const email = cookieStore.get("userEmail")?.value;
  
  if (!email) {
    redirect("/login");
  }
  
  // Fetch from DB
  const score = await getAwarenessScore(email);
  const history = await getAnalysisHistory(email);

  return <CyberDashboardClient initialScore={score} initialHistory={history} />;
}
