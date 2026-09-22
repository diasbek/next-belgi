import { AdminPaymentsPage } from "@/views/admin/AdminPaymentsPage";
import type { AdminListSearchParams } from "@/lib/admin/list-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  const params = await searchParams;
  return <AdminPaymentsPage locale="en" searchParams={params} />;
}
