"use client";

import { cn } from "@/lib/cn";

export type AdminColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
};

export function AdminDataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  selectedId,
  className,
}: {
  columns: AdminColumn<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  selectedId?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("hidden overflow-x-auto md:block", className)}>
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr className="border-b border-black/5 text-xs text-ink-muted">
            {columns.map((col) => (
              <th
                key={col.id}
                className={cn(
                  "px-4 py-3 font-medium sm:px-5",
                  col.hideOnMobile && "hidden lg:table-cell",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-b border-black/5 last:border-0",
                onRowClick && "cursor-pointer hover:bg-[#f8f9f6]",
                selectedId === row.id && "bg-[#f4fbe6]",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.id}
                  className={cn(
                    "px-4 py-3.5 sm:px-5",
                    col.hideOnMobile && "hidden lg:table-cell",
                    col.className,
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminCardList<T extends { id: string }>({
  rows,
  renderCard,
  onRowClick,
  selectedId,
  className,
}: {
  rows: T[];
  renderCard: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  selectedId?: string | null;
  className?: string;
}) {
  return (
    <ul className={cn("m-0 list-none divide-y divide-black/5 p-0 md:hidden", className)}>
      {rows.map((row) => (
        <li key={row.id}>
          <button
            type="button"
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              "block w-full px-4 py-3.5 text-left",
              onRowClick && "hover:bg-[#f8f9f6]",
              selectedId === row.id && "bg-[#f4fbe6]",
            )}
          >
            {renderCard(row)}
          </button>
        </li>
      ))}
    </ul>
  );
}
