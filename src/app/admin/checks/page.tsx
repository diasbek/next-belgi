import { AdminChecksPage } from "@/views/admin/AdminChecksPage";
import type { AdminListSearchParams } from "@/lib/admin/list-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  const params = await searchParams;
  return <AdminChecksPage locale="uz" searchParams={params} />;
}
