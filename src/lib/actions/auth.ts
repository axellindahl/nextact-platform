"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  magicLinkSchema,
  registerSchema,
} from "@/lib/validations/auth";

export type AuthResult = {
  error?: string;
  success?: boolean;
};

export async function loginWithPassword(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Fel e-post eller l\u00f6senord. F\u00f6rs\u00f6k igen." };
  }

  redirect("/dashboard");
}

export async function loginWithMagicLink(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const raw = { email: formData.get("email") };

  const parsed = magicLinkSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: "Kunde inte skicka magisk l\u00e4nk. F\u00f6rs\u00f6k igen.",
    };
  }

  return { success: true };
}

export async function loginWithOAuth(provider: "google" | "apple") {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return { error: "Kunde inte starta inloggning. F\u00f6rs\u00f6k igen." };
  }

  redirect(data.url);
}

export async function register(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    sport: formData.get("sport"),
    ageBracket: formData.get("ageBracket"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        display_name: parsed.data.displayName,
        sport: parsed.data.sport,
        age_bracket: parsed.data.ageBracket,
      },
    },
  });

  if (error) {
    return { error: "Registreringen misslyckades. F\u00f6rs\u00f6k igen." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/logga-in");
}
