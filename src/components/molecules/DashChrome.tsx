import { cn } from "@/lib/cn";

export function DashStatCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between rounded-2xl border border-black/5 bg-white px-4 py-4 shadow-[0_1px_2px_rgb(26_28_24/0.04)] sm:px-5 sm:py-5",
        className,
      )}
    >
      <div className="min-w-0 pr-2">
        <p className="m-0 text-xs text-ink-muted sm:text-sm">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink sm:mt-2 sm:text-3xl">
          {value}
        </p>
      </div>
      {icon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime text-ink sm:h-10 sm:w-10">
          {icon}
        </span>
      ) : null}
    </div>
  );
}

export function DashPageHeader({
  title,
  lead,
  action,
}: {
  title: string;
  lead?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="m-0 font-display text-[clamp(1.5rem,3vw,1.875rem)] font-semibold tracking-[-0.02em] text-ink">
          {title}
        </h1>
        {lead ? (
          <p className="mt-1 max-w-xl text-sm text-ink-muted sm:text-base">
            {lead}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="w-full shrink-0 sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export function DashPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgb(26_28_24/0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
