import { prisma } from './prisma';
import Groq from "groq-sdk";

export async function initCyberDb() {
  // Deprecated: Prisma automatically handles schema initialization via `db push`
  return;
}

export async function getAwarenessScore(email: string) {
  let record = await prisma.userAwarenessScore.findUnique({
    where: { user_email: email }
  });
  
  if (!record) {
    record = await prisma.userAwarenessScore.create({
      data: { user_email: email, score: 0 }
    });
  }
  
  return record.score ?? 0;
}

export async function incrementAwarenessScore(email: string, points: number = 10) {
  const record = await prisma.userAwarenessScore.upsert({
    where: { user_email: email },
    update: { score: { increment: points }, updated_at: new Date() },
    create: { user_email: email, score: points }
  });
  
  return record.score ?? 0;
}

export async function logAnalysis(email: string, content: string, type: string, classification: string, severity: string, explanation: string, recommendations: string) {
  await prisma.analysisLog.create({
    data: {
      user_email: email,
      content,
      type,
      classification,
      severity,
      explanation,
      recommendations
    }
  });
}

export async function getAnalysisHistory(email: string) {
  return await prisma.analysisLog.findMany({
    where: { user_email: email },
    orderBy: { created_at: 'desc' },
    take: 50
  });
}

export async function logSimulation(email: string, scenarioName: string, success: boolean) {
  await prisma.simulation.create({
    data: {
      user_email: email,
      scenario_name: scenarioName,
      success
    }
  });
}

// ==========================================
// COMMUNITY HUB FEATURES
// ==========================================

export async function getGlobalLeaderboard() {
  const topScores = await prisma.userAwarenessScore.findMany({
    orderBy: { score: 'desc' },
    take: 10
  });

  const emails = topScores.map(s => s.user_email);
  
  const users = await prisma.users.findMany({
    where: { email: { in: emails } },
    select: { email: true, name: true }
  });

  return topScores.map(score => {
    const user = users.find(u => u.email === score.user_email);
    return {
      name: user ? user.name : 'Unknown Operative',
      score: score.score,
      updated_at: score.updated_at?.toISOString() || null
    };
  });
}

export async function getGlobalIntelFeed() {
  const logs = await prisma.analysisLog.findMany({
    orderBy: { created_at: 'desc' },
    take: 15,
    select: {
      id: true,
      type: true,
      classification: true,
      severity: true,
      created_at: true,
      // Intentionally omitting user_email and content to preserve user privacy
    }
  });

  // Convert Date objects to ISO strings for safe Next.js Server-to-Client prop passing 
  return logs.map(log => ({
    ...log,
    created_at: log.created_at ? log.created_at.toISOString() : new Date().toISOString()
  }));
}

export async function getCommunityBriefing() {
  const recentLogs = await getGlobalIntelFeed();
  
  if (recentLogs.length === 0) return "No threats have been intercepted yet. The network is secure.";

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return "GROQ_API_KEY missing. Unable to generate daily intelligence briefing.";

  const threatString = recentLogs.map(l => `${l.type}: ${l.classification} (${l.severity})`).join(", ");

  const groq = new Groq({ apiKey });

  const prompt = `You are the AI Director of a global cybersecurity network.
Here are the 15 most recent threats intercepted by your community: ${threatString}
Write a strict, professional 2-sentence SITREP (Situation Report) summarizing the current threat landscape based ONLY on these threats. Keep it brief, serious, and do not use robotic cliches.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
    });
    return chatCompletion.choices[0]?.message?.content || "SITREP generation failed.";
  } catch (e) {
    console.error("Groq Briefing Error:", e);
    return "Intelligence feed currently saturated. Briefing unavailable.";
  }
}

export async function getUserRole(email: string) {
  const user = await prisma.users.findUnique({
    where: { email },
    select: { role: true }
  });
  return user?.role || "volunteer";
}

export async function getCommunityMessages(currentUserEmail: string) {
  const role = await getUserRole(currentUserEmail);
  const isAdmin = role === 'admin';

  const messages = await prisma.communityMessage.findMany({
    orderBy: { created_at: 'desc' },
    take: 50
  });

  let userNames: Record<string, string> = {};
  if (isAdmin) {
    const allUsers = await prisma.users.findMany({
      select: { email: true, name: true }
    });
    allUsers.forEach(u => userNames[u.email] = u.name);
  }

  return messages.reverse().map(m => ({
    id: m.id,
    content: m.content,
    created_at: m.created_at?.toISOString() || new Date().toISOString(),
    author: isAdmin ? (userNames[m.user_email] || m.user_email) : 'Anonymous Operative',
    isAdminView: isAdmin,
    isMine: m.user_email === currentUserEmail
  }));
}

