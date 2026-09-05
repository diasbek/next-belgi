"use client";

import { Fragment, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { Button } from "@/components/atoms/Button";
import { DashPanel } from "@/components/molecules/DashChrome";
import { IconSearch } from "@/components/atoms/DashIcons";
import { fieldInput } from "@/styles/ui";
import { cn } from "@/lib/cn";

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
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deltaByUser, setDeltaByUser] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && statusFilter !== "active") return false;
      if (!query) return true;
      const hay = `${u.full_name || ""} ${u.email || ""} ${u.id}`.toLowerCase();
      return hay.includes(query);
    });
  }, [users, q, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  async function adjust(userId: string) {
    const delta = Number(deltaByUser[userId] || 0);
    if (!delta) return;
    setMessage(null);
    const res = await fetch("/api/admin/credits/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, delta, note: "admin UI" }),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      balance?: number;
      error?: string;
    };
    if (json.ok) {
      setMessage(`OK → ${json.balance}`);
      window.location.reload();
    } else {
      setMessage(json.error || "error");
    }
  }

  function roleLabel(role: string) {
    return role === "admin"
      ? copy.adminUsers.roleAdmin
      : copy.adminUsers.roleUser;
  }

  function creditFields(userId: string) {
    return (
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1">
          <span className="mb-1.5 block text-sm text-ink-muted">
            {copy.adminUsers.adjust}
          </span>
          <input
            className={`${fieldInput} !min-h-10`}
            type="number"
            placeholder="5"
            value={deltaByUser[userId] || ""}
            onChange={(e) =>
              setDeltaByUser((prev) => ({
                ...prev,
                [userId]: e.target.value,
              }))
            }
          />
        </label>
        <Button
          type="button"
          className="!min-h-10 shrink-0"
          onClick={() => void adjust(userId)}
        >
          {copy.adminUsers.adjust}
        </Button>
      </div>
    );
  }

  const filters = (
    <div className="flex flex-col gap-3 p-4">
      <label className="relative min-w-0">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
          <IconSearch />
        </span>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder={copy.adminUsers.searchPlaceholder}
          className={`${fieldInput} !min-h-11 pl-10`}
        />
      </label>
      <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className={`${fieldInput} !min-h-11 w-full md:w-40`}
        >
          <option value="all">{copy.adminUsers.allRoles}</option>
          <option value="admin">{copy.adminUsers.roleAdmin}</option>
          <option value="user">{copy.adminUsers.roleUser}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className={`${fieldInput} !min-h-11 w-full md:w-40`}
        >
          <option value="all">{copy.adminUsers.allStatuses}</option>
          <option value="active">{copy.adminUsers.statusActive}</option>
        </select>
      </div>
    </div>
  );

  const pagination = (
    <div className="flex flex-col gap-3 px-1 py-3 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between md:border-t md:border-black/5 md:px-4">
      <p className="m-0">
        {copy.adminUsers.shown
          .replace("{shown}", String(pageRows.length))
          .replace("{total}", String(filtered.length))}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded-lg px-2.5 py-1.5 hover:bg-black/[0.04] disabled:opacity-40"
          disabled={currentPage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ‹
        </button>
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-lime px-2 font-medium text-ink">
          {currentPage}
        </span>
        <button
          type="button"
          className="rounded-lg px-2.5 py-1.5 hover:bg-black/[0.04] disabled:opacity-40"
          disabled={currentPage >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          ›
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <DashPanel className="md:overflow-hidden">
        <div className="border-b border-black/5 md:border-b">{filters}</div>

        {message ? (
          <p className="border-b border-black/5 px-4 py-2 text-sm text-ink-muted">
            {message}
          </p>
        ) : null}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-ink-muted">
                <th className="px-4 py-3 font-medium">
                  {copy.adminUsers.colUser}
                </th>
                <th className="px-4 py-3 font-medium">
                  {copy.adminUsers.role}
                </th>
                <th className="px-4 py-3 font-medium">
                  {copy.adminUsers.balance}
                </th>
                <th className="px-4 py-3 font-medium">
                  {copy.adminUsers.status}
                </th>
                <th className="px-4 py-3 font-medium">
                  {copy.adminUsers.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((u) => {
                const label = u.full_name || u.email || u.id.slice(0, 8);
                const initials = label.slice(0, 2).toUpperCase();
                const open = expanded === u.id;
                return (
                  <Fragment key={u.id}>
                    <tr className="border-b border-black/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-xs font-semibold">
                            {initials}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {label}
                            </p>
                            <p className="truncate text-xs text-ink-muted">
                              {copy.adminUsers.userId}: {u.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                            u.role === "admin"
                              ? "bg-lime text-ink"
                              : "bg-black/[0.05] text-ink-muted",
                          )}
                        >
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {u.balance} {copy.credits}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-ink">
                          <span className="h-2 w-2 rounded-full bg-success" />
                          {copy.adminUsers.statusActive}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="rounded-lg px-2 py-1 text-ink-muted hover:bg-black/[0.04] hover:text-ink"
                          aria-expanded={open}
                          onClick={() => setExpanded(open ? null : u.id)}
                        >
                          ⋮
                        </button>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="border-b border-black/5 bg-[#f8f9f6]">
                        <td colSpan={5} className="px-4 py-3">
                          {creditFields(u.id)}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="hidden md:block">{pagination}</div>
      </DashPanel>

      <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0 md:hidden">
        {pageRows.map((u) => {
          const label = u.full_name || u.email || u.id.slice(0, 8);
          const initials = label.slice(0, 2).toUpperCase();
          return (
            <li
              key={u.id}
              className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgb(26_28_24/0.04)]"
            >
              <div className="flex items-start gap-3 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime text-xs font-semibold">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate font-semibold text-ink">{label}</p>
                  <p className="m-0 mt-0.5 truncate text-xs text-ink-muted">
                    {copy.adminUsers.userId}: {u.id.slice(0, 8)}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-ink-muted"
                  aria-label={copy.adminUsers.actions}
                >
                  ⋮
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-black/5 px-4 py-3 text-center">
                <div>
                  <p className="m-0 text-[11px] text-ink-muted">
                    {copy.adminUsers.role}
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                      u.role === "admin"
                        ? "bg-lime text-ink"
                        : "bg-black/[0.05] text-ink-muted",
                    )}
                  >
                    {roleLabel(u.role)}
                  </span>
                </div>
                <div>
                  <p className="m-0 text-[11px] text-ink-muted">
                    {copy.adminUsers.balance}
                  </p>
                  <p className="m-0 mt-1 text-xs font-medium text-ink">
                    {u.balance} {copy.credits}
                  </p>
                </div>
                <div>
                  <p className="m-0 text-[11px] text-ink-muted">
                    {copy.adminUsers.status}
                  </p>
                  <span className="mt-1 inline-flex items-center justify-center gap-1.5 text-xs text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    {copy.adminUsers.statusActive}
                  </span>
                </div>
              </div>

              <div className="border-t border-black/5 bg-[#f8f9f6] px-4 py-3">
                {creditFields(u.id)}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="md:hidden">{pagination}</div>
    </div>
  );
}
