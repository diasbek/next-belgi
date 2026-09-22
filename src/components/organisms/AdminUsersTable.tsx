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
import { AdminDetailRows } from "@/components/atoms/admin/AdminDetail";
import {
  AdminField,
  AdminInput,
  AdminSelect,
} from "@/components/atoms/admin/AdminField";
import { AdminEntityForm } from "@/components/organisms/admin/AdminEntityForm";
import { ConfirmDialog } from "@/components/molecules/admin/ConfirmDialog";
import { FilterBar } from "@/components/molecules/admin/FilterBar";
import { Pagination } from "@/components/molecules/admin/Pagination";
import { StatusBadge } from "@/components/atoms/admin/StatusBadge";
import { DashPanel } from "@/components/molecules/DashChrome";
import { shortId } from "@/lib/admin/list-params";
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
  const router = useRouter();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);
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
      const hay = `${u.full_name || ""} ${u.email || ""} ${u.id}`.toLowerCase();
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

  const columns: AdminColumn<UserRow>[] = [
    {
      id: "user",
      header: copy.adminUsers.colUser,
      cell: (u) => {
        const label = u.full_name || u.email || shortId(u.id);
        const initials = label.slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-xs font-semibold">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="m-0 truncate font-medium text-ink">{label}</p>
              <p className="m-0 truncate text-xs text-ink-muted">
                {copy.adminUsers.userId}: {shortId(u.id)}
              </p>
            </div>
          </div>
        );
      },
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
      cell: () => (
        <span className="inline-flex items-center gap-2 text-ink">
          <span className="h-2 w-2 rounded-full bg-success" />
          {copy.adminUsers.statusActive}
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
            const label = u.full_name || u.email || shortId(u.id);
            return (
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime text-xs font-semibold",
                  )}
                >
                  {label.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate font-semibold text-ink">{label}</p>
                  <p className="m-0 mt-0.5 text-xs text-ink-muted">
                    {roleLabel(u.role)} · {u.balance} {copy.credits}
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
        title={
          selected
            ? selected.full_name || selected.email || shortId(selected.id)
            : copy.adminUsers.title
        }
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
          <AdminDetailRows
            rows={[
              { label: copy.adminUsers.userId, value: selected.id },
              {
                label: copy.adminUsers.colUser,
                value: selected.full_name || "—",
              },
              { label: copy.adminUsers.role, value: roleLabel(selected.role) },
              {
                label: copy.adminUsers.balance,
                value: `${selected.balance} ${copy.credits}`,
              },
            ]}
          />
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
          <AdminField label={copy.adminUsers.colUser}>
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
