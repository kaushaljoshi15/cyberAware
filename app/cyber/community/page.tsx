import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getGlobalLeaderboard, getGlobalIntelFeed, getCommunityBriefing, getUserRole, getCommunityMessages } from "@/lib/cyber-db";
import CommunityClient from "./CommunityClient";

export default async function CommunityPage() {
  const cookieStore = await cookies();
  const email = cookieStore.get("userEmail")?.value;
  
  if (!email) {
    redirect("/login");
  }
  
  const leaderboard = await getGlobalLeaderboard();
  const intelFeed = await getGlobalIntelFeed();
  const briefing = await getCommunityBriefing();
  const userRole = await getUserRole(email);
  const initialMessages = await getCommunityMessages(email);

  return (
    <CommunityClient 
      leaderboard={leaderboard} 
      intelFeed={intelFeed} 
      briefing={briefing}
      userRole={userRole}
      initialMessages={initialMessages}
    />
  );
}
