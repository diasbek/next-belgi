"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import type { PatentAttorney } from "@/data/patent-attorneys";
import { PATENT_ATTORNEYS_SOURCE_URL } from "@/data/patent-attorneys";
import { AdminListPage } from "@/components/templates/AdminListPage";
import { FilterBar } from "@/components/molecules/admin/FilterBar";
import {
  AdminDataTable,
  AdminCardList,
  type AdminColumn,
} from "@/components/organisms/admin/AdminDataTable";
import { AdminDetailDrawer } from "@/components/organisms/admin/AdminDetailDrawer";
import { AdminDetailRows } from "@/components/atoms/admin/AdminDetail";

export function AdminAttorneysPanel({
  locale,
  attorneys,
}: {
  locale: Locale;
  attorneys: PatentAttorney[];
}) {
  const copy = getAppCopy(locale);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<PatentAttorney | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return attorneys;
    return attorneys.filter((a) => {
      const hay = [
        a.name,
        a.email,
        a.phone,
        a.region,
        a.district,
        a.services.join(" "),
        String(a.number),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [attorneys, q]);

  const columns: AdminColumn<PatentAttorney>[] = [
    {
      id: "number",
      header: "#",
      cell: (a) => a.number,
    },
    {
      id: "name",
      header: copy.adminUsers.colUser,
      cell: (a) => <span className="font-medium">{a.name}</span>,
    },
    {
      id: "region",
      header: "Region",
      cell: (a) => [a.region, a.district].filter(Boolean).join(" · "),
      hideOnMobile: true,
    },
    {
      id: "contact",
      header: copy.adminNotifications.colDest,
      cell: (a) => [a.phone, a.email].filter(Boolean).join(" · "),
      hideOnMobile: true,
    },
  ];

  return (
    <AdminListPage
      title={copy.adminAttorneys.title}
      lead={copy.adminAttorneys.lead}
      badge={attorneys.length}
      filters={
        <FilterBar
          search={q}
          onSearchChange={setQ}
          searchPlaceholder={copy.adminUi.search}
          onClear={q ? () => setQ("") : undefined}
          clearLabel={copy.adminUi.clearFilters}
        />
      }
      stats={
        <p className="mb-4 text-sm text-ink-muted">
          {copy.adminAttorneys.count}: {attorneys.length} ·{" "}
          <a
            href={PATENT_ATTORNEYS_SOURCE_URL}
            className="underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            im.adliya.uz
          </a>
          {" · "}
          {copy.adminAttorneys.staticNote}
        </p>
      }
      empty={
        filtered.length === 0
          ? { title: copy.adminUi.noResults }
          : null
      }
    >
      <AdminDataTable
        columns={columns}
        rows={filtered}
        onRowClick={setSelected}
        selectedId={selected?.id}
      />
      <AdminCardList
        rows={filtered}
        onRowClick={setSelected}
        selectedId={selected?.id}
        renderCard={(a) => (
          <div>
            <p className="m-0 font-medium text-ink">
              #{a.number} {a.name}
            </p>
            <p className="m-0 mt-1 text-xs text-ink-muted">
              {[a.region, a.district, a.phone].filter(Boolean).join(" · ")}
            </p>
          </div>
        )}
      />

      <AdminDetailDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.name || copy.adminAttorneys.title}
      >
        {selected ? (
          <AdminDetailRows
            rows={[
              { label: "#", value: selected.number },
              { label: copy.adminUsers.colUser, value: selected.name },
              { label: "Email", value: selected.email || "—" },
              { label: "Phone", value: selected.phone || "—" },
              { label: "Region", value: selected.region || "—" },
              { label: "District", value: selected.district || "—" },
              {
                label: "Services",
                value: selected.services.join(", "),
              },
            ]}
          />
        ) : null}
      </AdminDetailDrawer>
    </AdminListPage>
  );
}
