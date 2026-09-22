import { getServiceDb } from "./client";
import type {
  LeadInsert,
  LeadStatus,
  MediaAssetInsert,
  NotificationLogInsert,
  OtpChallengeInsert,
  TrademarkCheckInsert,
} from "./types";

export async function insertLead(input: LeadInsert): Promise<boolean> {
  const db = getServiceDb();
  if (!db) return false;

  const { error } = await db.from("leads").insert({
    id: input.id,
    type: input.type,
    locale: input.locale ?? "uz",
    page_url: input.pageUrl ?? null,
    utm: input.utm ?? {},
    request_id: input.requestId ?? null,
    payload: input.payload,
    user_id: input.userId ?? null,
    status: input.status ?? "new",
  });

  if (error) {
    console.warn("[db:leads:insert]", error.message);
    return false;
  }
  return true;
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<boolean> {
  const db = getServiceDb();
  if (!db) return false;

  const { error } = await db.from("leads").update({ status }).eq("id", id);
  if (error) {
    console.warn("[db:leads:update]", error.message);
    return false;
  }
  return true;
}

export async function insertTrademarkCheck(
  input: TrademarkCheckInsert,
): Promise<string | null> {
  const db = getServiceDb();
  if (!db) return null;
  const client = db;

  async function write(
    classificationSource: TrademarkCheckInsert["classificationSource"],
  ) {
    return client
      .from("trademark_checks")
      .insert({
        user_id: input.userId ?? null,
        query: input.query,
        activity_raw: input.activityRaw,
        activity_normalized: input.activityNormalized ?? null,
        locale: input.locale ?? "uz",
        nice_classes: input.niceClasses,
        classification_source: classificationSource ?? null,
        report: input.report,
        source: input.source,
        verification_code: input.verificationCode ?? null,
        payload_hash: input.payloadHash ?? null,
        conclusion_doc: input.conclusionDoc ?? null,
      })
      .select("id")
      .maybeSingle();
  }

  let { data, error } = await write(input.classificationSource);

  // Older DBs only allow openai|cache|fallback — retry with a compatible value
  // until migration 20260923010000_check_classification_sources is applied.
  if (
    error &&
    /classification_source_check/i.test(error.message) &&
    (input.classificationSource === "catalog" ||
      input.classificationSource === "catalog+openai")
  ) {
    const fallback =
      input.classificationSource === "catalog" ? "cache" : "openai";
    console.warn(
      "[db:trademark_checks:insert] remapping classification_source",
      input.classificationSource,
      "→",
      fallback,
    );
    ({ data, error } = await write(fallback));
  }

  // Until 20260923020000_check_verification is applied, PostgREST rejects unknown columns.
  if (
    error &&
    /verification_code|payload_hash|conclusion_doc|verification_revoked|PGRST204|schema cache/i.test(
      error.message,
    )
  ) {
    console.warn(
      "[db:trademark_checks:insert] verification columns missing — inserting without them",
    );
    const retry = await client
      .from("trademark_checks")
      .insert({
        user_id: input.userId ?? null,
        query: input.query,
        activity_raw: input.activityRaw,
        activity_normalized: input.activityNormalized ?? null,
        locale: input.locale ?? "uz",
        nice_classes: input.niceClasses,
        classification_source: input.classificationSource ?? null,
        report: input.report,
        source: input.source,
      })
      .select("id")
      .maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.warn("[db:trademark_checks:insert]", error.message);
    return null;
  }
  return typeof data?.id === "string" ? data.id : null;
}

export async function insertNotificationLog(
  input: NotificationLogInsert,
): Promise<boolean> {
  const db = getServiceDb();
  if (!db) return false;

  const { error } = await db.from("notification_log").insert({
    provider: input.provider,
    kind: input.kind,
    destination: input.destination ?? null,
    status: input.status,
    provider_message_id: input.providerMessageId ?? null,
    meta: input.meta ?? {},
  });

  if (error) {
    console.warn("[db:notification_log:insert]", error.message);
    return false;
  }
  return true;
}

export async function insertOtpChallenge(
  input: OtpChallengeInsert,
): Promise<string | null> {
  const db = getServiceDb();
  if (!db) return null;

  const { data, error } = await db
    .from("otp_challenges")
    .insert({
      channel: input.channel,
      destination: input.destination,
      code_hash: input.codeHash,
      expires_at: input.expiresAt,
      max_attempts: input.maxAttempts ?? 5,
      ip: input.ip ?? null,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.warn("[db:otp_challenges:insert]", error.message);
    return null;
  }
  return typeof data?.id === "string" ? data.id : null;
}

export async function insertMediaAsset(
  input: MediaAssetInsert,
): Promise<string | null> {
  const db = getServiceDb();
  if (!db) return null;

  const { data, error } = await db
    .from("media_assets")
    .insert({
      bucket: input.bucket ?? "images",
      path: input.path,
      mime: input.mime ?? null,
      size_bytes: input.sizeBytes ?? null,
      uploaded_by: input.uploadedBy ?? null,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.warn("[db:media_assets:insert]", error.message);
    return null;
  }
  return typeof data?.id === "string" ? data.id : null;
}
