export type LeadType = "contact" | "lawyer" | "check";
export type LeadStatus = "new" | "sent" | "failed";

export type ClassificationSource = "openai" | "cache" | "fallback";
export type CheckSource = "mock" | "upstream";

export type NotificationProvider = "resend" | "eskiz" | "telegram";
export type NotificationKind = "lead" | "otp" | "report" | "system";
export type NotificationStatus = "queued" | "sent" | "failed";

export type OtpChannel = "sms" | "email";

export interface LeadInsert {
  id: string;
  type: LeadType;
  locale?: string;
  pageUrl?: string;
  utm?: Record<string, string>;
  requestId?: string | null;
  payload: Record<string, unknown>;
  userId?: string | null;
  status?: LeadStatus;
}

export interface TrademarkCheckInsert {
  userId?: string | null;
  query: string;
  activityRaw: string;
  activityNormalized?: string | null;
  locale?: string;
  niceClasses: unknown;
  classificationSource?: ClassificationSource | null;
  report: unknown;
  source: CheckSource;
}

export interface NotificationLogInsert {
  provider: NotificationProvider;
  kind: NotificationKind;
  destination?: string | null;
  status: NotificationStatus;
  providerMessageId?: string | null;
  meta?: Record<string, unknown>;
}

export interface OtpChallengeInsert {
  channel: OtpChannel;
  destination: string;
  codeHash: string;
  expiresAt: string;
  maxAttempts?: number;
  ip?: string | null;
}

export interface MediaAssetInsert {
  bucket?: string;
  path: string;
  mime?: string | null;
  sizeBytes?: number | null;
  uploadedBy?: string | null;
}
