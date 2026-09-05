import { AdminRegistryPage } from "@/views/admin/AdminRegistryPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return <AdminRegistryPage locale="ru" query={params.q ?? ""} />;
}
