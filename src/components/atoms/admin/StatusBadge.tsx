import { cn } from "@/lib/cn";

const tones = {
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
  warning: "bg-warning/20 text-ink",
  neutral: "bg-[#e8eae4] text-ink-muted",
  info: "bg-lime text-ink",
} as const;

export type StatusTone = keyof typeof tones;

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusToneFromValue(value: string): StatusTone {
  const v = value.toLowerCase();
  if (["paid", "active", "sent", "ok", "success"].includes(v)) return "success";
  if (["failed", "revoked", "error", "danger"].includes(v)) return "danger";
  if (["pending", "new", "queued", "warning"].includes(v)) return "warning";
  if (["preview", "mock", "info"].includes(v)) return "info";
  return "neutral";
}
