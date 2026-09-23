import { AccountCheckResultPage } from "@/views/account/AccountCheckResultPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; activity?: string; checkId?: string }>;
}) {
  const params = await searchParams;
  return (
    <AccountCheckResultPage
      locale="ru"
      query={params.q ?? ""}
      activity={params.activity ?? ""}
      checkId={params.checkId ?? ""}
    />
  );
}
