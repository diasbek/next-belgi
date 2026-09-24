#!/usr/bin/env npx tsx
/**
 * One-shot: import OpenAI credentials from takleef llm_gateway into Belgi.
 *
 * Usage:
 *   TAKLEEF_OPENAI_API_KEY=sk-... TAKLEEF_OPENAI_MODEL=gpt-4.1 \
 *     npx tsx --env-file=.env.local scripts/import-openai-from-takleef.ts
 *
 * Or pipe JSON from SQL (no key in argv history):
 *   echo '{"api_key":"...","model":"gpt-4.1"}' | \
 *     npx tsx --env-file=.env.local scripts/import-openai-from-takleef.ts --stdin
 *
 * Never commits secrets. Does not log the api_key.
 */
import { saveIntegration } from "../src/lib/integrations/store";

async function readPayload(): Promise<{ api_key: string; model: string }> {
  if (process.argv.includes("--stdin")) {
    const chunks: Buffer[] = [];
    for await (const c of process.stdin) chunks.push(c as Buffer);
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    const parsed = JSON.parse(raw) as { api_key?: string; model?: string };
    if (!parsed.api_key?.trim()) throw new Error("stdin_missing_api_key");
    return {
      api_key: parsed.api_key.trim(),
      model: parsed.model?.trim() || "gpt-4.1",
    };
  }

  const api_key = process.env.TAKLEEF_OPENAI_API_KEY?.trim();
  if (!api_key) {
    throw new Error(
      "Set TAKLEEF_OPENAI_API_KEY or pass JSON on stdin with --stdin",
    );
  }
  return {
    api_key,
    model: process.env.TAKLEEF_OPENAI_MODEL?.trim() || "gpt-4.1",
  };
}

async function main() {
  const { api_key, model } = await readPayload();
  const result = await saveIntegration(
    "openai",
    { mode: "live", api_key, model },
    { enabled: true },
  );
  if (!result.ok) {
    console.error("save_failed", result.error);
    process.exit(1);
  }
  console.log(
    JSON.stringify({
      ok: true,
      provider: "openai",
      mode: "live",
      model,
      keyLen: api_key.length,
      keyPrefix: api_key.slice(0, 7),
    }),
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
