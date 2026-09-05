import { toast } from "react-toastify";
import type { Locale } from "@/i18n/config";
import { trackEvent } from "@/lib/analytics/events";
import { formErrorMessage, readUtm } from "./utils";

export type LeadType = "contact" | "lawyer" | "check";

interface SubmitLeadOptions {
  type: LeadType;
  locale: Locale;
  requestId: string;
  website?: string;
  data: Record<string, unknown>;
  successTitle: string;
  successText: string;
  eventPrefix: string;
}

export async function submitLead({
  type,
  locale,
  requestId,
  website = "",
  data,
  successTitle,
  successText,
  eventPrefix,
}: SubmitLeadOptions): Promise<{ id: string } | null> {
  trackEvent(`${eventPrefix}_submit_attempt`);

  try {
    const res = await fetch("/api/leads/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        locale,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        utm: readUtm(),
        requestId,
        website,
        data,
      }),
    });
    const json = (await res.json()) as { id?: string; error?: string };
    if (!res.ok || !json.id) {
      throw new Error(json.error || "submit_failed");
    }

    trackEvent(`${eventPrefix}_submit_success`);
    toast.success(`${successTitle}. ID: ${json.id}\n${successText}`);
    return { id: json.id };
  } catch {
    trackEvent(`${eventPrefix}_submit_error`);
    toast.error(formErrorMessage(locale));
    return null;
  }
}
