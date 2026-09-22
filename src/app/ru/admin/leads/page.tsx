import { AdminLeadsPage } from "@/views/admin/AdminLeadsPage";
import type { AdminListSearchParams } from "@/lib/admin/list-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  const params = await searchParams;
  return <AdminLeadsPage locale="ru" searchParams={params} />;
}
