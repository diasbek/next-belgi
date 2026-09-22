"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { AdminListPage } from "@/components/templates/AdminListPage";
import {
  AdminDataTable,
  AdminCardList,
  type AdminColumn,
} from "@/components/organisms/admin/AdminDataTable";
import { AdminDetailDrawer } from "@/components/organisms/admin/AdminDetailDrawer";
import { AdminEntityForm } from "@/components/organisms/admin/AdminEntityForm";
import {
  AdminField,
  AdminInput,
} from "@/components/atoms/admin/AdminField";
import {
  StatusBadge,
  statusToneFromValue,
} from "@/components/atoms/admin/StatusBadge";
import { Button } from "@/components/atoms/Button";

export type AdminPlanRow = {
  id: string;
  code: string;
  title_uz: string;
  title_ru: string;
  title_en: string | null;
  credits: number;
  price_uzs: number;
  active: boolean;
  sort: number;
};

const EN_FALLBACK: Record<string, string> = {
  check_1: "1 check",
  pack_5: "5 checks",
  pack_10: "10 checks",
  pack_50: "50 checks",
};

function planTitle(p: AdminPlanRow, locale: Locale): string {
  if (locale === "ru") return p.title_ru;
  if (locale === "en") {
    return p.title_en || EN_FALLBACK[p.code] || p.title_uz;
  }
  return p.title_uz;
}

type FormState = {
  code: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  credits: string;
  price_uzs: string;
  active: boolean;
  sort: string;
};

function emptyForm(): FormState {
  return {
    code: "",
    title_uz: "",
    title_ru: "",
    title_en: "",
    credits: "1",
    price_uzs: "15000",
    active: true,
    sort: "0",
  };
}

function fromRow(p: AdminPlanRow): FormState {
  return {
    code: p.code,
    title_uz: p.title_uz,
    title_ru: p.title_ru,
    title_en: p.title_en || "",
    credits: String(p.credits),
    price_uzs: String(p.price_uzs),
    active: p.active,
    sort: String(p.sort),
  };
}

export function AdminPlansPanel({
  locale,
  rows,
  dbUnavailable,
}: {
  locale: Locale;
  rows: AdminPlanRow[];
  dbUnavailable?: boolean;
}) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const [selected, setSelected] = useState<AdminPlanRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function openEdit(row: AdminPlanRow) {
    setSelected(row);
    setCreating(false);
    setForm(fromRow(row));
    setMsg(null);
  }

  function openCreate() {
    setSelected(null);
    setCreating(true);
    setForm(emptyForm());
    setMsg(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const payload = {
      code: form.code.trim(),
      title_uz: form.title_uz.trim(),
      title_ru: form.title_ru.trim(),
      title_en: form.title_en.trim() || form.title_uz.trim(),
      credits: Number(form.credits),
      price_uzs: Number(form.price_uzs),
      active: form.active,
      sort: Number(form.sort) || 0,
    };
    try {
      const url = creating
        ? "/api/admin/plans/"
        : `/api/admin/plans/${selected!.id}/`;
      const res = await fetch(url, {
        method: creating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setMsg(json.error || copy.adminUi.error);
        return;
      }
      setCreating(false);
      setSelected(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(row: AdminPlanRow) {
    setBusy(true);
    try {
      await fetch(`/api/admin/plans/${row.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !row.active }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const columns: AdminColumn<AdminPlanRow>[] = [
    {
      id: "code",
      header: copy.adminPlans.colCode,
      cell: (r) => <span className="font-medium">{r.code}</span>,
    },
    {
      id: "title",
      header: copy.adminPlans.titleUz,
      cell: (r) => planTitle(r, locale),
    },
    {
      id: "credits",
      header: copy.adminPlans.colCredits,
      cell: (r) => r.credits,
    },
    {
      id: "price",
      header: copy.adminPlans.colPrice,
      cell: (r) => `${r.price_uzs.toLocaleString()} UZS`,
    },
    {
      id: "active",
      header: copy.adminPlans.colActive,
      cell: (r) => (
        <StatusBadge tone={statusToneFromValue(r.active ? "active" : "off")}>
          {r.active ? copy.adminPlans.active : copy.adminPlans.inactive}
        </StatusBadge>
      ),
    },
    {
      id: "sort",
      header: copy.adminPlans.colSort,
      cell: (r) => r.sort,
      hideOnMobile: true,
    },
  ];

  const drawerOpen = creating || Boolean(selected);
  const empty =
    !dbUnavailable && rows.length === 0
      ? { title: copy.adminPlans.empty, lead: copy.adminPlans.emptyLead }
      : null;

  return (
    <AdminListPage
      title={copy.adminPlans.title}
      lead={copy.adminPlans.lead}
      badge={rows.length || undefined}
      dbUnavailable={dbUnavailable}
      dbUnavailableMessage={copy.adminUi.dbUnavailable}
      empty={empty}
      action={
        <Button type="button" onClick={openCreate}>
          + {copy.adminPlans.create}
        </Button>
      }
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        onRowClick={openEdit}
        selectedId={selected?.id}
      />
      <AdminCardList
        rows={rows}
        onRowClick={openEdit}
        selectedId={selected?.id}
        renderCard={(r) => (
          <div>
            <p className="m-0 font-medium text-ink">
              {r.code} · {planTitle(r, locale)}
            </p>
            <p className="m-0 mt-1 text-xs text-ink-muted">
              {r.credits} cr · {r.price_uzs.toLocaleString()} UZS ·{" "}
              {r.active ? copy.adminPlans.active : copy.adminPlans.inactive}
            </p>
          </div>
        )}
      />

      <AdminDetailDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setSelected(null);
          }
        }}
        title={
          creating ? copy.adminPlans.create : copy.adminPlans.detailTitle
        }
      >
        <AdminEntityForm
          onSubmit={(e) => void submit(e)}
          onCancel={() => {
            setCreating(false);
            setSelected(null);
          }}
          submitLabel={copy.adminPlans.save}
          cancelLabel={copy.adminUi.cancel}
          busy={busy}
        >
          {msg ? (
            <p className="text-sm text-danger" role="alert">
              {msg}
            </p>
          ) : null}
          <AdminField label={copy.adminPlans.codeLabel}>
            <AdminInput
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
              disabled={!creating && Boolean(selected)}
            />
          </AdminField>
          <AdminField label={copy.adminPlans.titleUz}>
            <AdminInput
              value={form.title_uz}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_uz: e.target.value }))
              }
              required
            />
          </AdminField>
          <AdminField label={copy.adminPlans.titleRu}>
            <AdminInput
              value={form.title_ru}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_ru: e.target.value }))
              }
              required
            />
          </AdminField>
          <AdminField label={copy.adminPlans.titleEn}>
            <AdminInput
              value={form.title_en}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_en: e.target.value }))
              }
            />
          </AdminField>
          <AdminField label={copy.adminPlans.colCredits}>
            <AdminInput
              type="number"
              min={1}
              value={form.credits}
              onChange={(e) =>
                setForm((f) => ({ ...f, credits: e.target.value }))
              }
              required
            />
          </AdminField>
          <AdminField label={copy.adminPlans.colPrice}>
            <AdminInput
              type="number"
              min={1}
              value={form.price_uzs}
              onChange={(e) =>
                setForm((f) => ({ ...f, price_uzs: e.target.value }))
              }
              required
            />
          </AdminField>
          <AdminField label={copy.adminPlans.colSort}>
            <AdminInput
              type="number"
              value={form.sort}
              onChange={(e) => setForm((f) => ({ ...f, sort: e.target.value }))}
            />
          </AdminField>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
            />
            {copy.adminPlans.active}
          </label>
          {selected && !creating ? (
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void toggleActive(selected)}
            >
              {selected.active
                ? copy.adminPlans.inactive
                : copy.adminPlans.active}
            </Button>
          ) : null}
        </AdminEntityForm>
      </AdminDetailDrawer>
    </AdminListPage>
  );
}
