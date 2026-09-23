"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { AdminListPage } from "@/components/templates/AdminListPage";
import {
  AdminUrlFilters,
  AdminPageLink,
} from "@/components/molecules/admin/AdminUrlFilters";
import {
  AdminDataTable,
  AdminCardList,
  type AdminColumn,
} from "@/components/organisms/admin/AdminDataTable";
import { AdminDetailDrawer } from "@/components/organisms/admin/AdminDetailDrawer";
import {
  AdminDetailRows,
  AdminJsonBlock,
} from "@/components/atoms/admin/AdminDetail";
import {
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/atoms/admin/AdminField";
import { AdminEntityForm } from "@/components/organisms/admin/AdminEntityForm";
import {
  StatusBadge,
  statusToneFromValue,
} from "@/components/atoms/admin/StatusBadge";
import { Button } from "@/components/atoms/Button";
import { ConfirmDialog } from "@/components/molecules/admin/ConfirmDialog";
import { adliyaLogoUrl } from "@/lib/adliya/types";
import { formatAdminDate } from "@/lib/admin/list-params";
import {
  PASTE_IMPORT_CHUNK_SIZE,
  PASTE_IMPORT_MAX_ITEMS,
  chunkArray,
  extractAdliyaListRaw,
} from "@/lib/registry/extract-adliya-list";

export type AdminRegistryRow = {
  id: string;
  adliya_id: number | null;
  number: string | null;
  transliteration: string | null;
  trademark_type: string | null;
  status: string | null;
  owner: string | null;
  applicant: string | null;
  registration_number: string | null;
  logo: string | null;
  source: string;
  active: boolean;
  field_locks: string[] | null;
  updated_at: string;
  application_date?: string | null;
  registration_date?: string | null;
  synced_at?: string | null;
  class_numbers?: number[];
};

type DetailState = AdminRegistryRow & {
  colors?: string | null;
  address?: string | null;
  owner_address?: string | null;
  application_date?: string | null;
  registration_date?: string | null;
  expired?: string | null;
  publication_date?: string | null;
  vienna_classification?: string | null;
  unprotected_element?: string | null;
  raw?: unknown;
  mgs?: Array<{
    id: string;
    class_number: number;
    text_uz: string | null;
    text_ru: string | null;
  }>;
};

function thumbUrl(logo: string | null): string | null {
  if (!logo) return null;
  if (logo.startsWith("http")) return logo;
  return adliyaLogoUrl(logo);
}

function formatCellDate(raw: string | null | undefined, locale: Locale): string {
  if (!raw) return "—";
  if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(raw)) return raw;
  return formatAdminDate(raw, locale);
}

function mgsLabel(nums: number[] | undefined): string {
  if (!nums?.length) return "—";
  return nums.join(", ");
}

export function AdminRegistryPanel({
  locale,
  rows,
  total,
  page,
  pageSize,
  registryCount,
  importStatus,
  syncRunning,
  dbUnavailable,
  statusValues = [],
}: {
  locale: Locale;
  rows: AdminRegistryRow[];
  total: number;
  page: number;
  pageSize: number;
  registryCount: number;
  importStatus: string;
  syncRunning?: boolean;
  dbUnavailable?: boolean;
  statusValues?: string[];
}) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const [selected, setSelected] = useState<DetailState | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteProgress, setPasteProgress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    transliteration: "",
    number: "",
    status: "DRAFT",
    trademark_type: "WORD",
    applicant: "",
    owner: "",
    logo: "",
    mgsClasses: "35",
  });

  async function openDetail(row: AdminRegistryRow) {
    setMsg(null);
    setSelected({ ...row, mgs: [] });
    try {
      const res = await fetch(`/api/admin/registry/${row.id}/`);
      const json = (await res.json()) as {
        ok?: boolean;
        row?: DetailState;
        mgs?: DetailState["mgs"];
      };
      if (json.ok && json.row) {
        setSelected({ ...json.row, mgs: json.mgs || [] });
      } else {
        setMsg(copy.adminUi.error);
      }
    } catch {
      setMsg(copy.adminUi.error);
    }
  }

  async function syncNow() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/registry/sync/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "page", maxPages: 1 }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        imported?: number;
        error?: string;
      };
      if (json.ok) {
        setMsg(`${copy.adminRegistry.syncDone}: +${json.imported ?? 0}`);
        router.refresh();
      } else {
        setMsg(json.error || copy.adminUi.error);
      }
    } finally {
      setBusy(false);
    }
  }

  async function runPasteImport() {
    setBusy(true);
    setMsg(null);
    setPasteProgress(null);
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(pasteText);
      } catch {
        setMsg(copy.adminRegistry.pasteImportInvalid);
        return;
      }
      let items = extractAdliyaListRaw(parsed);
      if (!items.length) {
        setMsg(copy.adminRegistry.pasteImportInvalid);
        return;
      }
      let truncated = false;
      if (items.length > PASTE_IMPORT_MAX_ITEMS) {
        items = items.slice(0, PASTE_IMPORT_MAX_ITEMS);
        truncated = true;
      }
      const chunks = chunkArray(items, PASTE_IMPORT_CHUNK_SIZE);
      let imported = 0;
      for (let i = 0; i < chunks.length; i++) {
        setPasteProgress(
          copy.adminRegistry.pasteImportProgress
            .replace("{done}", String(imported))
            .replace("{total}", String(items.length)),
        );
        const res = await fetch("/api/admin/registry/import/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: chunks[i] }),
        });
        const json = (await res.json()) as {
          ok?: boolean;
          imported?: number;
          error?: string;
        };
        if (!res.ok || !json.ok) {
          setMsg(json.error || copy.adminUi.error);
          return;
        }
        imported += json.imported ?? chunks[i].length;
      }
      setPasteOpen(false);
      setPasteText("");
      setPasteProgress(null);
      setMsg(
        `${copy.adminRegistry.pasteImportDone}: +${imported}${
          truncated ? ` · ${copy.adminRegistry.pasteImportTruncated}` : ""
        }`,
      );
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : copy.adminUi.error);
    } finally {
      setBusy(false);
      setPasteProgress(null);
    }
  }

  async function createTrademark(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const mgs = form.mgsClasses
        .split(/[,\s]+/)
        .map((n) => Number(n))
        .filter((n) => n >= 1 && n <= 45)
        .map((class_number) => ({ class_number }));
      const res = await fetch("/api/admin/registry/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transliteration: form.transliteration,
          number: form.number,
          status: form.status,
          trademark_type: form.trademark_type,
          applicant: form.applicant,
          owner: form.owner,
          logo: form.logo,
          mgs,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (json.ok) {
        setCreateOpen(false);
        setForm({
          transliteration: "",
          number: "",
          status: "DRAFT",
          trademark_type: "WORD",
          applicant: "",
          owner: "",
          logo: "",
          mgsClasses: "35",
        });
        router.refresh();
      } else {
        setMsg(json.error || copy.adminUi.error);
      }
    } finally {
      setBusy(false);
    }
  }

  async function saveSelected(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/registry/${selected.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transliteration: selected.transliteration,
          number: selected.number,
          status: selected.status,
          trademark_type: selected.trademark_type,
          applicant: selected.applicant,
          owner: selected.owner,
          logo: selected.logo,
          address: selected.address,
          colors: selected.colors,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (json.ok) {
        setMsg(copy.adminUi.save);
        router.refresh();
      } else {
        setMsg(json.error || copy.adminUi.error);
      }
    } finally {
      setBusy(false);
    }
  }

  async function softDelete() {
    if (!selected) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/registry/${selected.id}/`, { method: "DELETE" });
      setSelected(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function fetchAdliya() {
    if (!selected) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/registry/${selected.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fetchFromAdliya: true }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        row?: DetailState;
        error?: string;
      };
      if (json.ok && json.row) {
        await openDetail({ ...selected, ...json.row });
        router.refresh();
      } else {
        setMsg(json.error || copy.adminUi.error);
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleLock(field: string) {
    if (!selected) return;
    const locks = new Set(selected.field_locks || []);
    if (locks.has(field)) locks.delete(field);
    else locks.add(field);
    const next = [...locks];
    setSelected({ ...selected, field_locks: next });
    await fetch(`/api/admin/registry/${selected.id}/lock/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field_locks: next }),
    });
  }

  const columns: AdminColumn<AdminRegistryRow>[] = [
    {
      id: "logo",
      header: "",
      cell: (r) => {
        const url = thumbUrl(r.logo);
        return (
          <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#f3f4f1]">
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt=""
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            ) : null}
          </span>
        );
      },
      className: "w-14 min-w-14 px-3 sm:px-3",
    },
    {
      id: "name",
      header: copy.adminRegistry.colName,
      cell: (r) => (
        <span className="font-medium">
          {r.transliteration || "—"}
        </span>
      ),
      className: "min-w-[8rem]",
    },
    {
      id: "number",
      header: copy.adminRegistry.colNumber,
      cell: (r) => r.number || (r.adliya_id != null ? String(r.adliya_id) : "—"),
      className: "min-w-[7rem] whitespace-nowrap",
    },
    {
      id: "type",
      header: copy.adminRegistry.colType,
      cell: (r) => r.trademark_type || "—",
      hideOnMobile: true,
    },
    {
      id: "mgs",
      header: copy.adminRegistry.colClasses,
      cell: (r) => mgsLabel(r.class_numbers),
      className: "min-w-[5rem]",
    },
    {
      id: "status",
      header: copy.adminRegistry.colStatus,
      cell: (r) => (
        <StatusBadge tone={statusToneFromValue(r.status || "")}>
          {r.status || "—"}
        </StatusBadge>
      ),
    },
    {
      id: "owner",
      header: copy.adminRegistry.colOwner,
      cell: (r) => (
        <span className="line-clamp-2 max-w-[12rem]">{r.owner || "—"}</span>
      ),
      hideOnMobile: true,
      className: "min-w-[10rem]",
    },
    {
      id: "applicant",
      header: copy.adminRegistry.colApplicant,
      cell: (r) => (
        <span className="line-clamp-2 max-w-[12rem]">
          {r.applicant || "—"}
        </span>
      ),
      hideOnMobile: true,
      className: "min-w-[10rem]",
    },
    {
      id: "regNumber",
      header: copy.adminRegistry.colRegNumber,
      cell: (r) => r.registration_number || "—",
      hideOnMobile: true,
      className: "whitespace-nowrap",
    },
    {
      id: "filing",
      header: copy.adminRegistry.colFilingDate,
      cell: (r) => formatCellDate(r.application_date, locale),
      hideOnMobile: true,
      className: "whitespace-nowrap",
    },
    {
      id: "regDate",
      header: copy.adminRegistry.colRegDate,
      cell: (r) => formatCellDate(r.registration_date, locale),
      hideOnMobile: true,
      className: "whitespace-nowrap",
    },
    {
      id: "source",
      header: copy.adminRegistry.colSource,
      cell: (r) => (
        <StatusBadge tone={r.source === "manual" ? "info" : "neutral"}>
          {r.source}
        </StatusBadge>
      ),
    },
    {
      id: "active",
      header: copy.adminRegistry.colActive,
      cell: (r) => (r.active ? "✓" : "—"),
      hideOnMobile: true,
      className: "w-16 text-center",
    },
    {
      id: "updated",
      header: copy.adminRegistry.colUpdated,
      cell: (r) => formatCellDate(r.updated_at, locale),
      hideOnMobile: true,
      className: "whitespace-nowrap",
    },
  ];

  const empty =
    !dbUnavailable && rows.length === 0
      ? {
          title: copy.adminRegistry.empty,
          lead: copy.adminRegistry.emptyLead,
        }
      : null;

  return (
    <>
      <AdminListPage
        title={copy.adminRegistry.title}
        lead={copy.adminRegistry.lead}
        badge={registryCount || undefined}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={busy || syncRunning}
              onClick={() => void syncNow()}
            >
              {busy || syncRunning
                ? copy.adminUi.loading
                : copy.adminRegistry.syncNow}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setPasteOpen(true);
                setMsg(null);
              }}
            >
              {copy.adminRegistry.pasteImport}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const header = [
                  "id",
                  "number",
                  "transliteration",
                  "trademark_type",
                  "status",
                  "owner",
                  "applicant",
                  "registration_number",
                  "application_date",
                  "registration_date",
                  "source",
                  "active",
                  "mgs",
                ];
                const escape = (v: string) =>
                  `"${v.replace(/"/g, '""')}"`;
                const lines = [
                  header.join(","),
                  ...rows.map((r) =>
                    [
                      r.id,
                      r.number || "",
                      r.transliteration || "",
                      r.trademark_type || "",
                      r.status || "",
                      r.owner || "",
                      r.applicant || "",
                      r.registration_number || "",
                      r.application_date || "",
                      r.registration_date || "",
                      r.source,
                      r.active ? "1" : "0",
                      (r.class_numbers || []).join(";"),
                    ]
                      .map((c) => escape(String(c)))
                      .join(","),
                  ),
                ];
                const blob = new Blob([lines.join("\n")], {
                  type: "text/csv;charset=utf-8",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `registry-page.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              {copy.adminRegistry.exportCsv}
            </Button>
            <Button type="button" onClick={() => setCreateOpen(true)}>
              {copy.adminRegistry.create}
            </Button>
          </div>
        }
        dbUnavailable={dbUnavailable}
        dbUnavailableMessage={copy.adminUi.dbUnavailable}
        empty={empty}
        filters={
          <Suspense fallback={null}>
            <AdminUrlFilters
              searchPlaceholder={copy.adminRegistry.searchPlaceholder}
              clearLabel={copy.adminUi.clearFilters}
              statusOptions={[
                { value: "", label: copy.adminRegistry.allStatuses },
                ...statusValues.map((s) => ({ value: s, label: s })),
              ]}
              extraFilters={[
                {
                  id: "sort",
                  "aria-label": copy.adminRegistry.sortBy,
                  defaultValue: "updated_at",
                  options: [
                    {
                      value: "updated_at",
                      label: copy.adminRegistry.sortUpdated,
                    },
                    {
                      value: "application_date",
                      label: copy.adminRegistry.sortFiling,
                    },
                    {
                      value: "registration_date",
                      label: copy.adminRegistry.sortReg,
                    },
                    {
                      value: "status",
                      label: copy.adminRegistry.sortStatus,
                    },
                    {
                      value: "number",
                      label: copy.adminRegistry.sortNumber,
                    },
                    {
                      value: "transliteration",
                      label: copy.adminRegistry.sortName,
                    },
                    {
                      value: "synced_at",
                      label: copy.adminRegistry.sortSynced,
                    },
                  ],
                },
                {
                  id: "dir",
                  "aria-label": copy.adminRegistry.sortDir,
                  defaultValue: "desc",
                  options: [
                    { value: "desc", label: copy.adminRegistry.sortDesc },
                    { value: "asc", label: copy.adminRegistry.sortAsc },
                  ],
                },
                {
                  id: "source",
                  options: [
                    { value: "", label: copy.adminRegistry.allSources },
                    { value: "adliya", label: "adliya" },
                    { value: "manual", label: "manual" },
                    { value: "seed", label: "seed" },
                  ],
                },
                {
                  id: "active",
                  options: [
                    { value: "", label: copy.adminRegistry.allActive },
                    { value: "1", label: copy.adminRegistry.activeOnly },
                    { value: "0", label: copy.adminRegistry.inactiveOnly },
                  ],
                },
              ]}
            />
          </Suspense>
        }
        stats={
          <p className="mb-3 text-xs text-ink-muted">
            {copy.adminRegistry.importStatus}: {importStatus}
            {msg ? ` · ${msg}` : ""}
          </p>
        }
        footer={
          <Suspense fallback={null}>
            <AdminPageLink
              page={page}
              pageSize={pageSize}
              total={total}
              shownLabel={copy.adminUi.shown}
            />
          </Suspense>
        }
      >
        <AdminDataTable
          columns={columns}
          rows={rows}
          onRowClick={(r) => void openDetail(r)}
          selectedId={selected?.id}
          tableClassName="min-w-[72rem]"
        />
        <AdminCardList
          rows={rows}
          selectedId={selected?.id}
          onRowClick={(r) => void openDetail(r)}
          renderCard={(r) => (
            <div className="flex gap-3">
              <span className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#f3f4f1]">
                {thumbUrl(r.logo) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbUrl(r.logo)!}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                ) : null}
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="m-0 font-medium text-ink">
                  {r.transliteration || "—"}
                </p>
                <p className="m-0 text-xs text-ink-muted">
                  {[
                    r.number || (r.adliya_id != null ? String(r.adliya_id) : null),
                    r.status,
                    r.trademark_type,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
                <p className="m-0 text-xs text-ink-muted">
                  {r.owner || r.applicant || "—"}
                </p>
                <p className="m-0 text-xs text-ink-muted">
                  {copy.adminRegistry.colClasses}: {mgsLabel(r.class_numbers)}
                  {r.registration_number
                    ? ` · ${copy.adminRegistry.colRegNumber} ${r.registration_number}`
                    : ""}
                </p>
              </div>
            </div>
          )}
        />
      </AdminListPage>

      <AdminDetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={
          selected?.transliteration ||
          selected?.number ||
          copy.adminRegistry.detailTitle
        }
        footer={
          selected ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void fetchAdliya()}
              >
                {copy.adminRegistry.fetchAdliya}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="!text-danger"
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
              >
                {copy.adminRegistry.deactivate}
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <AdminEntityForm
            onSubmit={(e) => void saveSelected(e)}
            submitLabel={copy.adminUi.save}
            busy={busy}
          >
            {thumbUrl(selected.logo) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbUrl(selected.logo)!}
                alt=""
                className="mb-3 h-32 w-full max-w-xs rounded-xl object-contain bg-[#f3f4f1] p-2"
              />
            ) : null}
            <AdminField label={copy.adminRegistry.colName}>
              <AdminInput
                value={selected.transliteration || ""}
                onChange={(e) =>
                  setSelected({ ...selected, transliteration: e.target.value })
                }
              />
            </AdminField>
            <AdminField label={copy.adminRegistry.colNumber}>
              <AdminInput
                value={selected.number || ""}
                onChange={(e) =>
                  setSelected({ ...selected, number: e.target.value })
                }
              />
            </AdminField>
            <AdminField label={copy.adminRegistry.colStatus}>
              <AdminInput
                value={selected.status || ""}
                onChange={(e) =>
                  setSelected({ ...selected, status: e.target.value })
                }
              />
            </AdminField>
            <AdminField label={copy.adminRegistry.colOwner}>
              <AdminTextarea
                value={selected.owner || selected.applicant || ""}
                onChange={(e) =>
                  setSelected({ ...selected, owner: e.target.value })
                }
              />
            </AdminField>
            <AdminDetailRows
              rows={[
                { label: "ID", value: selected.id },
                {
                  label: "Adliya ID",
                  value: selected.adliya_id ?? "—",
                },
                { label: copy.adminRegistry.colSource, value: selected.source },
                {
                  label: copy.adminRegistry.colActive,
                  value: selected.active ? "yes" : "no",
                },
              ]}
            />
            <div className="space-y-1">
              <p className="m-0 text-xs text-ink-muted">
                {copy.adminRegistry.fieldLocks}
              </p>
              <div className="flex flex-wrap gap-2">
                {["transliteration", "status", "owner", "logo"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => void toggleLock(f)}
                    className={`rounded-lg px-2 py-1 text-xs ${
                      (selected.field_locks || []).includes(f)
                        ? "bg-lime text-ink"
                        : "bg-[#f3f4f1] text-ink-muted"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {(selected.mgs || []).length > 0 ? (
              <div>
                <p className="mb-1 text-xs text-ink-muted">MGS</p>
                <ul className="m-0 list-none space-y-1 p-0 text-sm">
                  {selected.mgs!.map((m) => (
                    <li key={m.id}>
                      [{m.class_number}] {m.text_uz || m.text_ru || ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {selected.raw ? <AdminJsonBlock value={selected.raw} /> : null}
            {msg ? <p className="text-sm text-ink-muted">{msg}</p> : null}
          </AdminEntityForm>
        ) : null}
      </AdminDetailDrawer>

      <AdminDetailDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={copy.adminRegistry.create}
      >
        <AdminEntityForm
          onSubmit={(e) => void createTrademark(e)}
          onCancel={() => setCreateOpen(false)}
          cancelLabel={copy.adminUi.cancel}
          submitLabel={copy.adminRegistry.create}
          busy={busy}
        >
          <AdminField label={copy.adminRegistry.colName}>
            <AdminInput
              value={form.transliteration}
              onChange={(e) =>
                setForm({ ...form, transliteration: e.target.value })
              }
              required
            />
          </AdminField>
          <AdminField label={copy.adminRegistry.colNumber}>
            <AdminInput
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
            />
          </AdminField>
          <AdminField label={copy.adminRegistry.colStatus}>
            <AdminSelect
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {(statusValues.length
                ? statusValues
                : ["DRAFT", "EXPERTISE", "REGISTERED"]
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label={copy.adminRegistry.colOwner}>
            <AdminInput
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
            />
          </AdminField>
          <AdminField label="MGS (1-45)">
            <AdminInput
              value={form.mgsClasses}
              onChange={(e) => setForm({ ...form, mgsClasses: e.target.value })}
              placeholder="35, 42"
            />
          </AdminField>
        </AdminEntityForm>
      </AdminDetailDrawer>

      <AdminDetailDrawer
        open={pasteOpen}
        onOpenChange={(open) => {
          if (!busy) setPasteOpen(open);
        }}
        title={copy.adminRegistry.pasteImport}
        wide
        footer={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => setPasteOpen(false)}
            >
              {copy.adminUi.cancel}
            </Button>
            <Button
              type="button"
              disabled={busy || !pasteText.trim()}
              onClick={() => void runPasteImport()}
            >
              {busy ? copy.adminUi.loading : copy.adminRegistry.pasteImportRun}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="m-0 text-sm text-ink-muted">
            {copy.adminRegistry.pasteImportLead}
          </p>
          <AdminField label="JSON">
            <AdminTextarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={copy.adminRegistry.pasteImportPlaceholder}
              className="min-h-[16rem] font-mono text-xs"
            />
          </AdminField>
          <label className="block text-sm text-ink-muted">
            <span className="mb-1.5 block text-xs">.json</span>
            <input
              type="file"
              accept="application/json,.json"
              disabled={busy}
              className="block w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  setPasteText(String(reader.result || ""));
                };
                reader.readAsText(file);
              }}
            />
          </label>
          {pasteProgress ? (
            <p className="m-0 text-sm font-medium text-ink">{pasteProgress}</p>
          ) : null}
          {msg && pasteOpen ? (
            <p className="m-0 text-sm text-ink-muted">{msg}</p>
          ) : null}
        </div>
      </AdminDetailDrawer>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={copy.adminRegistry.deactivateConfirm}
        lead={copy.adminRegistry.deactivateLead}
        confirmLabel={copy.adminRegistry.deactivate}
        cancelLabel={copy.adminUi.cancel}
        danger
        onConfirm={() => void softDelete()}
      />
    </>
  );
}
