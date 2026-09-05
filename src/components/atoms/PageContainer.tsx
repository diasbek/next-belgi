import { cn } from "@/lib/cn";
import { pageContainer } from "@/styles/ui";

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(pageContainer, className)}>{children}</div>;
}
