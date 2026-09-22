"use client";

import { useEffect, useState } from "react";
import { IconSearch } from "@/components/atoms/DashIcons";
import { cn } from "@/lib/cn";

export function SearchField({
  value,
  onChange,
  placeholder,
  className,
  debounceMs = 200,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, debounceMs);
    return () => clearTimeout(t);
  }, [local, value, onChange, debounceMs]);

  return (
    <label className={cn("relative block min-w-0", className)}>
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted">
        <IconSearch />
      </span>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-xl border border-black/10 bg-white py-2.5 pr-3 pl-10 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary/30"
      />
    </label>
  );
}
