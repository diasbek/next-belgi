import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/session";
import {
  getModuleCatalog,
  INTEGRATION_PROVIDERS,
} from "@/lib/integrations/types";
import {
  invalidateIntegrationCache,
  listIntegrationStatuses,
  saveIntegration,
} from "@/lib/integrations/store";

/** Force every integration module into its silent catalog defaultMode. */
export async function POST() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const errors: string[] = [];
  for (const provider of INTEGRATION_PROVIDERS) {
    const catalog = getModuleCatalog(provider);
    const result = await saveIntegration(
      provider,
      { mode: catalog.defaultMode },
      { enabled: true, updatedBy: admin.id },
    );
    if (!result.ok) errors.push(`${provider}:${result.error}`);
  }

  invalidateIntegrationCache();
  const items = await listIntegrationStatuses();

  if (errors.length) {
    return NextResponse.json(
      { ok: false, error: errors.join("; "), items },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, items });
}
