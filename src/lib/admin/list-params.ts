export const ADMIN_PAGE_SIZE = 25;

export type AdminListSearchParams = {
  page?: string | string[];
  q?: string | string[];
  status?: string | string[];
  reason?: string | string[];
};

function first(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export function parseAdminListParams(sp: AdminListSearchParams = {}) {
  const page = Math.max(1, Number(first(sp.page)) || 1);
  const q = first(sp.q).trim();
  const status = first(sp.status).trim();
  const reason = first(sp.reason).trim();
  const pageSize = ADMIN_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, q, status, reason, from, to, pageSize };
}

export function shortId(id: string, len = 8): string {
  return id.length <= len ? id : `${id.slice(0, len)}…`;
}

export function formatAdminDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(
      locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "uz-UZ",
    );
  } catch {
    return iso;
  }
}
