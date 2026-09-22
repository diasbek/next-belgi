import { cn } from "@/lib/cn";

const controlClass =
  "min-h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary/30";

export function AdminField({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)} htmlFor={htmlFor}>
      <span className="mb-1.5 block text-sm text-ink-muted">{label}</span>
      {children}
      {hint && !error ? (
        <span className="mt-1 block text-xs text-ink-muted">{hint}</span>
      ) : null}
      {error ? (
        <span className="mt-1 block text-xs text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function AdminInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return <input {...props} className={cn(controlClass, props.className)} />;
}

export function AdminSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return <select {...props} className={cn(controlClass, props.className)} />;
}

export function AdminTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cn(controlClass, "min-h-24 py-2", props.className)}
    />
  );
}

export { controlClass as adminControlClass };
