import { DashStatCard } from "@/components/molecules/DashChrome";
import { cn } from "@/lib/cn";

export function StatGrid({
  items,
  className,
}: {
  items: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <DashStatCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
        />
      ))}
    </div>
  );
}
