"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deckCopy } from "@/data/deck";
import { fieldInput } from "@/styles/ui";
import { Button } from "@/components/atoms/Button";

export function DeckUnlockForm() {
  const copy = deckCopy;
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    const res = await fetch("/api/deck/unlock/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError(true);
      return;
    }
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-lime via-white to-surface-muted px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8"
      >
        <p className="m-0 font-display text-2xl font-semibold tracking-tight text-ink">
          {copy.gateTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {copy.gateLead}
        </p>
        <label className="mt-6 block text-xs font-medium uppercase tracking-[0.04em] text-ink-muted">
          {copy.gatePassword}
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${fieldInput} mt-1.5`}
            required
            disabled={pending}
          />
        </label>
        {error ? (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {copy.gateError}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          className="mt-5 w-full"
          disabled={pending || !password}
        >
          {copy.gateSubmit}
        </Button>
      </form>
    </div>
  );
}
