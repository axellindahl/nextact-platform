import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

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
    const anthropic = createAnthropic({ apiKey });
    const { text } = await generateText({
      model: anthropic("claude-3-5-haiku-20241022"),
      messages: [{ role: "user", content: "Say: ok" }],
      maxTokens: 10,
    });

    return NextResponse.json({
      ok: true,
      keyPrefix,
      model: "claude-3-5-haiku-20241022",
      response: text,
    });
  } catch (err) {
    const error = err as Error & { status?: number; responseBody?: string; cause?: unknown };
    return NextResponse.json({
      ok: false,
      keyPrefix,
      errorType: error.constructor.name,
      errorMessage: error.message,
      errorStatus: error.status,
      errorResponseBody: error.responseBody,
      errorCause: String(error.cause ?? ""),
    });
  }
}
