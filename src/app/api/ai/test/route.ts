import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Temporary debug endpoint — DELETE before launch
export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 503 });
  }

  const keyPrefix = apiKey.slice(0, 15);

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 10,
      messages: [{ role: "user", content: "Say: ok" }],
    });

    return NextResponse.json({
      ok: true,
      keyPrefix,
      model: "claude-3-5-haiku-20241022",
      response: message.content,
    });
  } catch (err) {
    const error = err as Error & { status?: number; error?: unknown };
    return NextResponse.json({
      ok: false,
      keyPrefix,
      errorType: error.constructor.name,
      errorMessage: error.message,
      errorStatus: error.status,
      errorBody: error.error,
    });
  }
}
