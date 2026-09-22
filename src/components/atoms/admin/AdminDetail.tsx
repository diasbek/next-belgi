export function AdminJsonBlock({
  value,
  className,
}: {
  value: unknown;
  className?: string;
}) {
  let text: string;
  try {
    text = JSON.stringify(value, null, 2);
  } catch {
    text = String(value);
  }
  return (
    <pre
      className={
        className ??
        "overflow-x-auto rounded-xl bg-[#f3f4f1] p-3 text-xs leading-relaxed text-ink"
      }
    >
      {text}
    </pre>
  );
}

export function AdminDetailRows({
  rows,
}: {
  rows: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <dl className="m-0 space-y-3 text-sm">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-xs text-ink-muted">{row.label}</dt>
          <dd className="mt-0.5 m-0 break-all text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
