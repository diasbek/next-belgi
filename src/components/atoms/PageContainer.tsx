import { cn } from "@/lib/cn";
import {
  contentMeasureClass,
  pageContainer,
  type ContentMeasure,
} from "@/styles/ui";

/**
 * Site shell: one horizontal grid for header / sections / footer.
 * Use `measure` for inner content width — never put ad-hoc max-w on the shell.
 */
export function PageContainer({
  children,
  className,
  measure = "full",
  innerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  measure?: ContentMeasure;
  innerClassName?: string;
}) {
  return (
    <div className={cn(pageContainer, className)}>
      {measure === "full" ? (
        children
      ) : (
        <div className={cn(contentMeasureClass[measure], innerClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}
