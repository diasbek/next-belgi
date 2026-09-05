"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { Button } from "@/components/atoms/Button";
import { fieldInput } from "@/styles/ui";

type UserRow = {
  id: string;
  full_name: string | null;
  role: string;
  balance: number;
  email?: string | null;
};

export function AdminUsersTable({
  locale,
  users,
}: {
  locale: Locale;
  users: UserRow[];
}) {
  const copy = getAppCopy(locale);
  const [deltaByUser, setDeltaByUser] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function adjust(userId: string) {
    const delta = Number(deltaByUser[userId] || 0);
    if (!delta) return;
    setMessage(null);
    const res = await fetch("/api/admin/credits/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, delta, note: "admin UI" }),
    });
    const json = (await res.json()) as { ok?: boolean; balance?: number; error?: string };
    if (json.ok) {
      setMessage(`OK → ${json.balance}`);
      window.location.reload();
    } else {
      setMessage(json.error || "error");
    }
  }

  return (
    <div>
      {message ? <p className="mb-3 text-sm text-ink-muted">{message}</p> : null}
      <ul className="divide-y divide-black/5 border-y border-black/5">
        {users.map((u) => (
          <li key={u.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">
                {u.full_name || u.email || u.id.slice(0, 8)}
              </p>
              <p className="text-sm text-ink-muted">
                {copy.adminUsers.role}: {u.role} · {copy.adminUsers.balance}:{" "}
                {u.balance}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className={`${fieldInput} !min-h-11 w-24`}
                type="number"
                placeholder="+5"
                value={deltaByUser[u.id] || ""}
                onChange={(e) =>
                  setDeltaByUser((prev) => ({
                    ...prev,
                    [u.id]: e.target.value,
                  }))
                }
              />
              <Button type="button" onClick={() => void adjust(u.id)}>
                {copy.adminUsers.adjust}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
