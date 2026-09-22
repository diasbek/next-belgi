import { AdminRegistryPage } from "@/views/admin/AdminRegistryPage";
import type { AdminListSearchParams } from "@/lib/admin/list-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  const params = await searchParams;
  return <AdminRegistryPage locale="uz" searchParams={params} />;
}
