import { AdminOrdersPage } from "@/views/admin/AdminOrdersPage";
import type { AdminListSearchParams } from "@/lib/admin/list-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  const params = await searchParams;
  return <AdminOrdersPage locale="ru" searchParams={params} />;
}
