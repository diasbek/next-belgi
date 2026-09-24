import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DeckUnlockForm } from "@/components/organisms/DeckUnlockForm";
import { DeckView } from "@/views/DeckView";
import { DECK_COOKIE, isDeckUnlocked } from "@/lib/deck/auth";

export const metadata: Metadata = {
  title: "Belgi.ai — Pitch deck",
  robots: { index: false, follow: false },
};

export default async function DeckPage() {
  const jar = await cookies();
  const unlocked = isDeckUnlocked(jar.get(DECK_COOKIE)?.value);

  if (!unlocked) {
    return <DeckUnlockForm />;
  }

  return <DeckView />;
}
