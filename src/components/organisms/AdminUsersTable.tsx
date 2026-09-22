"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { Button } from "@/components/atoms/Button";
import {
  AdminDataTable,
  AdminCardList,
  type AdminColumn,
} from "@/components/organisms/admin/AdminDataTable";
import { AdminDetailDrawer } from "@/components/organisms/admin/AdminDetailDrawer";
import {
  AdminField,
  AdminInput,
  AdminSelect,
} from "@/components/atoms/admin/AdminField";
import { AdminEntityForm } from "@/components/organisms/admin/AdminEntityForm";
import { ConfirmDialog } from "@/components/molecules/admin/ConfirmDialog";
import { FilterBar } from "@/components/molecules/admin/FilterBar";
import { Pagination } from "@/components/molecules/admin/Pagination";
import {
  StatusBadge,
} from "@/components/atoms/admin/StatusBadge";
import { DashPanel } from "@/components/molecules/DashChrome";
import { formatAdminDate, shortId } from "@/lib/admin/list-params";
import { cn } from "@/lib/cn";

export type AdminUserRow = {
  id: string;
  full_name: string | null;
  email?: string | null;
  phone?: string | null;
  role: string;
  balance: number;
  company_name?: string | null;
  job_title?: string | null;
  user_intent?: string | null;
  onboarding_completed_at?: string | null;
  created_at?: string | null;
  locale?: string | null;
  last_seen_at?: string | null;
  checks_count?: number;
  is_active?: boolean;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export function AdminUsersTable({
  locale,
  users,
}: {
  locale: Locale;
  users: AdminUserRow[];
}) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState<AdminUserRow | null>(null);
  const [delta, setDelta] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [busy, setBusy] = useState(false);
  const [roleConfirm, setRoleConfirm] = useState(false);
  const [pendingRole, setPendingRole] = useState<"user" | "admin">("user");
  const pageSize = 10;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (!query) return true;
      const hay =
        `${u.full_name || ""} ${u.email || ""} ${u.company_name || ""} ${u.phone || ""} ${u.id}`.toLowerCase();
      return hay.includes(query);
    });
  }, [users, q, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function roleLabel(role: string) {
    return role === "admin"
      ? copy.adminUsers.roleAdmin
      : copy.adminUsers.roleUser;
  }

  function intentLabel(intent: string | null | undefined) {
    if (!intent) return "—";
    const map = copy.onboarding.intents as Record<string, string>;
    return map[intent] || intent;
  }

  function displayName(u: AdminUserRow) {
    return u.full_name || u.email || shortId(u.id);
  }

  async function adjust() {
    if (!selected) return;
    const value = Number(delta || 0);
    if (!value) return;
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/credits/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selected.id,
          delta: value,
          note: "admin UI",
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        balance?: number;
        error?: string;
      };
      if (json.ok) {
        setMessage(`OK → ${json.balance}`);
        setDelta("");
        setSelected({ ...selected, balance: Number(json.balance) || 0 });
        router.refresh();
      } else {
        setMessage(json.error || copy.adminUi.error);
      }
    } finally {
      setBusy(false);
    }
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users/invite/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          password: invitePassword,
          fullName: inviteName || undefined,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setMessage(json.error || copy.adminUi.error);
        return;
      }
      setInviteOpen(false);
      setInviteEmail("");
      setInvitePassword("");
      setInviteName("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function changeRole() {
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/role/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: pendingRole }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setMessage(json.error || copy.adminUi.error);
        return;
      }
      setSelected({ ...selected, role: pendingRole });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const columns: AdminColumn<AdminUserRow>[] = [
    {
      id: "user",
      header: copy.adminUsers.colUser,
      cell: (u) => {
        const label = displayName(u);
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-xs font-semibold">
              {initials(label)}
            </span>
            <div className="min-w-0">
              <p className="m-0 truncate font-medium text-ink">{label}</p>
              <p className="m-0 truncate text-xs text-ink-muted">
                {u.company_name || u.email || shortId(u.id)}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "company",
      header: copy.adminUsers.colCompany,
      cell: (u) => u.company_name || "—",
      hideOnMobile: true,
    },
    {
      id: "role",
      header: copy.adminUsers.role,
      cell: (u) => (
        <StatusBadge tone={u.role === "admin" ? "info" : "neutral"}>
          {roleLabel(u.role)}
        </StatusBadge>
      ),
    },
    {
      id: "balance",
      header: copy.adminUsers.balance,
      cell: (u) => (
        <span>
          {u.balance} {copy.credits}
        </span>
      ),
    },
    {
      id: "status",
      header: copy.adminUsers.status,
      cell: (u) => (
        <span className="inline-flex items-center gap-2 text-ink">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              u.is_active ? "bg-success" : "bg-ink-muted/40",
            )}
          />
          {u.is_active
            ? copy.adminUsers.statusActive
            : copy.adminUsers.statusInactive}
        </span>
      ),
      hideOnMobile: true,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button type="button" onClick={() => setInviteOpen(true)}>
          + {copy.adminUsers.addUser}
        </Button>
      </div>

      <DashPanel className="overflow-hidden">
        <div className="border-b border-black/5 p-4">
          <FilterBar
            search={q}
            onSearchChange={(v) => {
              setQ(v);
              setPage(1);
            }}
            searchPlaceholder={copy.adminUsers.searchPlaceholder}
            filters={[
              {
                id: "role",
                value: roleFilter,
                options: [
                  { value: "", label: copy.adminUsers.allRoles },
                  { value: "admin", label: copy.adminUsers.roleAdmin },
                  { value: "user", label: copy.adminUsers.roleUser },
                ],
                onChange: (v) => {
                  setRoleFilter(v);
                  setPage(1);
                },
                "aria-label": copy.adminUsers.role,
              },
            ]}
            onClear={
              q || roleFilter
                ? () => {
                    setQ("");
                    setRoleFilter("");
                    setPage(1);
                  }
                : undefined
            }
            clearLabel={copy.adminUi.clearFilters}
          />
        </div>

        {message ? (
          <p className="border-b border-black/5 px-4 py-2 text-sm text-ink-muted">
            {message}
          </p>
        ) : null}

        <AdminDataTable
          columns={columns}
          rows={pageRows}
          onRowClick={(u) => {
            setSelected(u);
            setPendingRole(u.role === "admin" ? "admin" : "user");
            setDelta("");
            setMessage(null);
          }}
          selectedId={selected?.id}
        />
        <AdminCardList
          rows={pageRows}
          onRowClick={(u) => {
            setSelected(u);
            setPendingRole(u.role === "admin" ? "admin" : "user");
            setDelta("");
            setMessage(null);
          }}
          selectedId={selected?.id}
          renderCard={(u) => {
            const label = displayName(u);
            return (
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime text-xs font-semibold">
                  {initials(label)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate font-semibold text-ink">{label}</p>
                  <p className="m-0 mt-0.5 text-xs text-ink-muted">
                    {[u.company_name, roleLabel(u.role), `${u.balance} ${copy.credits}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
            );
          }}
        />

        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={filtered.length}
          shownLabel={copy.adminUi.shown}
          onPageChange={setPage}
        />
      </DashPanel>

      <AdminDetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={copy.adminUsers.title}
        footer={
          selected ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-2">
                <AdminField
                  label={copy.adminUsers.adjust}
                  className="min-w-0 flex-1"
                >
                  <AdminInput
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(e.target.value)}
                    placeholder="5"
                  />
                </AdminField>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void adjust()}
                >
                  {copy.adminUsers.adjust}
                </Button>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <AdminField
                  label={copy.adminUsers.changeRole}
                  className="min-w-0 flex-1"
                >
                  <AdminSelect
                    value={pendingRole}
                    onChange={(e) =>
                      setPendingRole(e.target.value as "user" | "admin")
                    }
                  >
                    <option value="user">{copy.adminUsers.roleUser}</option>
                    <option value="admin">{copy.adminUsers.roleAdmin}</option>
                  </AdminSelect>
                </AdminField>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy || pendingRole === selected.role}
                  onClick={() => setRoleConfirm(true)}
                >
                  {copy.adminUsers.changeRole}
                </Button>
              </div>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-5">
            {/* SaaS profile header */}
            <div className="rounded-2xl bg-[#f8f9f6] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lime text-base font-bold text-ink">
                  {initials(displayName(selected))}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 text-lg font-semibold text-ink">
                    {displayName(selected)}
                  </h3>
                  {selected.company_name ? (
                    <p className="m-0 mt-0.5 text-sm text-ink-muted">
                      {selected.company_name}
                      {selected.job_title ? ` · ${selected.job_title}` : ""}
                    </p>
                  ) : selected.job_title ? (
                    <p className="m-0 mt-0.5 text-sm text-ink-muted">
                      {selected.job_title}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <StatusBadge
                      tone={selected.role === "admin" ? "info" : "neutral"}
                    >
                      {roleLabel(selected.role)}
                    </StatusBadge>
                    <StatusBadge
                      tone={selected.is_active ? "success" : "neutral"}
                    >
                      {selected.is_active
                        ? copy.adminUsers.statusActive
                        : copy.adminUsers.statusInactive}
                    </StatusBadge>
                    <StatusBadge
                      tone={
                        selected.onboarding_completed_at ? "success" : "warning"
                      }
                    >
                      {selected.onboarding_completed_at
                        ? copy.adminUsers.onboardingDone
                        : copy.adminUsers.onboardingPending}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <section>
              <h4 className="m-0 mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                {copy.adminUsers.contact}
              </h4>
              <dl className="m-0 grid gap-2 text-sm">
                <div className="flex justify-between gap-3 border-b border-black/5 pb-2">
                  <dt className="text-ink-muted">{copy.profile.email}</dt>
                  <dd className="m-0 break-all text-right font-medium text-ink">
                    {selected.email || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-black/5 pb-2">
                  <dt className="text-ink-muted">{copy.profile.phone}</dt>
                  <dd className="m-0 font-medium text-ink">
                    {selected.phone || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{copy.adminUsers.userId}</dt>
                  <dd className="m-0 break-all text-right font-mono text-xs text-ink">
                    {selected.id}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Stats grid */}
            <section className="grid grid-cols-2 gap-2">
              {[
                {
                  label: copy.adminUsers.balance,
                  value: `${selected.balance} ${copy.credits}`,
                },
                {
                  label: copy.adminUsers.checks,
                  value: String(selected.checks_count ?? 0),
                },
                {
                  label: copy.adminUsers.lastSeen,
                  value: selected.last_seen_at
                    ? formatAdminDate(selected.last_seen_at, locale)
                    : "—",
                },
                {
                  label: copy.adminUsers.joined,
                  value: selected.created_at
                    ? formatAdminDate(selected.created_at, locale)
                    : "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-black/5 px-3 py-2.5"
                >
                  <p className="m-0 text-[11px] text-ink-muted">{item.label}</p>
                  <p className="m-0 mt-1 text-sm font-semibold text-ink">
                    {item.value}
                  </p>
                </div>
              ))}
            </section>

            {/* Onboarding */}
            <section>
              <h4 className="m-0 mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                {copy.adminUsers.onboarding}
              </h4>
              <dl className="m-0 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{copy.adminUsers.company}</dt>
                  <dd className="m-0 text-right font-medium text-ink">
                    {selected.company_name || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{copy.adminUsers.jobTitle}</dt>
                  <dd className="m-0 text-right font-medium text-ink">
                    {selected.job_title || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{copy.adminUsers.intent}</dt>
                  <dd className="m-0 text-right font-medium text-ink">
                    {intentLabel(selected.user_intent)}
                  </dd>
                </div>
              </dl>
            </section>

            {message ? (
              <p className="m-0 text-sm text-ink-muted">{message}</p>
            ) : null}
          </div>
        ) : null}
      </AdminDetailDrawer>

      <AdminDetailDrawer
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title={copy.adminUsers.addUser}
      >
        <AdminEntityForm
          onSubmit={(e) => void invite(e)}
          onCancel={() => setInviteOpen(false)}
          submitLabel={copy.adminUsers.inviteSubmit}
          cancelLabel={copy.adminUi.cancel}
          busy={busy}
        >
          <AdminField label={copy.adminUsers.inviteEmail}>
            <AdminInput
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </AdminField>
          <AdminField label={copy.adminUsers.invitePassword}>
            <AdminInput
              type="password"
              required
              minLength={6}
              value={invitePassword}
              onChange={(e) => setInvitePassword(e.target.value)}
            />
          </AdminField>
          <AdminField label={copy.onboarding.fullName}>
            <AdminInput
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
          </AdminField>
        </AdminEntityForm>
      </AdminDetailDrawer>

      <ConfirmDialog
        open={roleConfirm}
        onOpenChange={setRoleConfirm}
        title={copy.adminUsers.confirmRole}
        lead={copy.adminUsers.confirmRoleLead}
        confirmLabel={copy.adminUi.confirm}
        cancelLabel={copy.adminUi.cancel}
        onConfirm={() => void changeRole()}
      />
    </div>
  );
}
