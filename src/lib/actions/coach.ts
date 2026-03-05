"use server";

import { createClient } from "@/lib/supabase/server";
import type { AiContextType } from "@/lib/supabase/types";

export async function createConversation(
  contextType: AiContextType = "general",
  contextId?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      user_id: user.id,
      context_type: contextType,
      context_id: contextId ?? null,
    })
    .select("id, context_type, context_id, created_at")
    .single();

  if (error) {
    return { error: "Kunde inte skapa samtal." };
  }

  return { data };
}

export async function getConversations(limit: number = 20) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("ai_conversations")
    .select("id, context_type, context_id, summary, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: "Kunde inte hämta samtal." };
  }

  return { data };
}

export async function getConversationMessages(conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("ai_messages")
    .select("id, role, content, metadata, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return { error: "Kunde inte hämta meddelanden." };
  }

  return { data };
}
