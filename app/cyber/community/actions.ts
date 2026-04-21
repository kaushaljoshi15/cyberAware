"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendCommunityMessage(content: string) {
  if (!content || content.trim() === "") return { success: false, error: "Empty message" };

  const cookieStore = await cookies();
  const email = cookieStore.get("userEmail")?.value;

  if (!email) return { success: false, error: "Unauthorized" };

  try {
    await prisma.communityMessage.create({
      data: {
        user_email: email,
        content: content.trim(),
      }
    });

    revalidatePath("/cyber/community");
    return { success: true };
  } catch (error) {
    console.error("Failed to send message:", error);
    return { success: false, error: "Database error" };
  }
}

import { getCommunityMessages, getGlobalIntelFeed } from "@/lib/cyber-db";

export async function fetchLatestMessages() {
  const cookieStore = await cookies();
  const email = cookieStore.get("userEmail")?.value;
  
  if (!email) return [];
  
  try {
    return await getCommunityMessages(email);
  } catch (e) {
    console.error("Failed to fetch messages:", e);
    return [];
  }
}

export async function fetchLatestIntelFeed() {
  try {
    return await getGlobalIntelFeed();
  } catch (e) {
    console.error("Failed to fetch intel feed:", e);
    return [];
  }
}
