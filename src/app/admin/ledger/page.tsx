import { AdminLedgerPage } from "@/views/admin/AdminLedgerPage";
import type { AdminListSearchParams } from "@/lib/admin/list-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  const params = await searchParams;
  return <AdminLedgerPage locale="uz" searchParams={params} />;
}
