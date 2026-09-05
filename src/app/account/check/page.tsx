import { AccountCheckPage } from "@/views/account/AccountCheckPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; activity?: string }>;
}) {
  const params = await searchParams;
  return (
    <AccountCheckPage
      locale="uz"
      query={params.q ?? ""}
      activity={params.activity ?? ""}
    />
  );
}
