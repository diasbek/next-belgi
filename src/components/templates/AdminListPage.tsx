import {
  DashPageHeader,
  DashPanel,
} from "@/components/molecules/DashChrome";
import { ErrorBanner } from "@/components/molecules/admin/ErrorBanner";
import { EmptyState } from "@/components/molecules/admin/EmptyState";
import { cn } from "@/lib/cn";

export function AdminListPage({
  title,
  lead,
  badge,
  action,
  stats,
  filters,
  dbUnavailable,
  dbUnavailableMessage,
  empty,
  children,
  footer,
  className,
}: {
  title: string;
  lead?: string;
  badge?: string | number;
  action?: React.ReactNode;
  stats?: React.ReactNode;
  filters?: React.ReactNode;
  dbUnavailable?: boolean;
  dbUnavailableMessage?: string;
  empty?: { title: string; lead?: string } | null;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <DashPageHeader
        title={title}
        lead={lead}
        badge={badge}
        action={action}
      />
      {dbUnavailable ? (
        <ErrorBanner className="mb-5">
          {dbUnavailableMessage ?? "Database is not configured."}
        </ErrorBanner>
      ) : null}
      {stats}
      {filters ? <div className="mb-4">{filters}</div> : null}
      <DashPanel>
        {empty ? (
          <EmptyState title={empty.title} lead={empty.lead} />
        ) : (
          children
        )}
        {footer && !empty ? footer : null}
      </DashPanel>
    </div>
  );
}
