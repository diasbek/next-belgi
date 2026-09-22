import { AdminNotificationsPage } from "@/views/admin/AdminNotificationsPage";
import type { AdminListSearchParams } from "@/lib/admin/list-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  const params = await searchParams;
  return <AdminNotificationsPage locale="ru" searchParams={params} />;
}
