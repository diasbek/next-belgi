import { createServiceSupabaseClient } from "@/lib/supabase/client";
import type { ActivityClassification } from "./types";

function canUseCache(): boolean {
  return Boolean(
    (process.env.SUPABASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

export async function getCachedClassification(
  inputHash: string,
): Promise<ActivityClassification | null> {
  if (!canUseCache()) return null;

  try {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("activity_classifications")
      .select("result, model")
      .eq("input_hash", inputHash)
      .maybeSingle();

    if (error || !data?.result) return null;

    const result = data.result as ActivityClassification;
    return {
      ...result,
      source: "cache",
      model: typeof data.model === "string" ? data.model : result.model,
    };
  } catch (error) {
    console.warn("[classify:cache:read]", error);
    return null;
  }
}

export async function setCachedClassification(
  inputHash: string,
  classification: ActivityClassification,
): Promise<void> {
  if (!canUseCache()) return;
  if (classification.source === "fallback") return;

  try {
    const supabase = createServiceSupabaseClient();
    const { error } = await supabase.from("activity_classifications").upsert(
      {
        input_hash: inputHash,
        locale: classification.locale,
        activity_raw: classification.activityRaw,
        result: {
          ...classification,
          source: "openai",
        },
        model: classification.model ?? null,
      },
      { onConflict: "input_hash" },
    );

    if (error) {
      console.warn("[classify:cache:write]", error.message);
    }
  } catch (error) {
    console.warn("[classify:cache:write]", error);
  }
}
