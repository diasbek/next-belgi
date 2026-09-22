import { AdminSessionsPage } from "@/views/admin/AdminSessionsPage";
import type { AdminListSearchParams } from "@/lib/admin/list-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  const params = await searchParams;
  return <AdminSessionsPage locale="ru" searchParams={params} />;
}
