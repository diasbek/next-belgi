import { AdminUsersPage } from "@/views/admin/AdminUsersPage";
import type { AdminListSearchParams } from "@/lib/admin/list-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  const params = await searchParams;
  return <AdminUsersPage locale="uz" searchParams={params} />;
}
