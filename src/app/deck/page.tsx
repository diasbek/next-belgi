import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DeckUnlockForm } from "@/components/organisms/DeckUnlockForm";
import { DeckView } from "@/views/DeckView";
import { DECK_COOKIE, isDeckUnlocked } from "@/lib/deck/auth";
import { SITE_CONFIG } from "@/utils/consts";

export const metadata: Metadata = {
  title: "Belgi.ai — Pitch deck",
  robots: { index: false, follow: false },
};

function deckContacts() {
  const email = SITE_CONFIG.email.trim();
  const telegramUrl = SITE_CONFIG.telegramUrl.trim();
  const phoneEnv = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
  return {
    phone: phoneEnv ? SITE_CONFIG.phoneDisplay : null,
    email: email || null,
    telegramUrl: telegramUrl || null,
  };
}

export default async function DeckPage() {
  const jar = await cookies();
  const unlocked = isDeckUnlocked(jar.get(DECK_COOKIE)?.value);

  if (!unlocked) {
    return <DeckUnlockForm />;
  }

  return <DeckView contacts={deckContacts()} />;
}
