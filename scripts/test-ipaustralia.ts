#!/usr/bin/env npx tsx
import {
  testIpAustraliaConnection,
  ipAustraliaProvider,
} from "../src/lib/check/external/ipaustralia";
import {
  getIntegrationStatus,
  saveIntegration,
} from "../src/lib/integrations/store";

async function main() {
  const wantLive = process.argv.includes("--live");
  const restoreTest = process.argv.includes("--restore-test");

  if (wantLive) {
    await saveIntegration("ipaustralia", { mode: "live" }, { enabled: true });
  }

  const status = await getIntegrationStatus("ipaustralia");
  console.log(
    JSON.stringify(
      {
        mode: status.mode,
        configured: status.configured,
        enabled: status.enabled,
        masked: status.masked,
      },
      null,
      2,
    ),
  );

  const test = await testIpAustraliaConnection();
  console.log("test", JSON.stringify(test, null, 2));

  if (test.ok) {
    const search = await ipAustraliaProvider.searchSimilar("NOVA", {
      limit: 2,
    });
    console.log(
      JSON.stringify(
        {
          unavailable: search.unavailable ?? false,
          count: search.matches.length,
          sample: search.matches.slice(0, 2).map((m) => ({
            id: m.id,
            name: m.name,
            status: m.status,
          })),
        },
        null,
        2,
      ),
    );
  }

  if (restoreTest || (wantLive && !test.ok)) {
    await saveIntegration("ipaustralia", { mode: "test" }, { enabled: true });
    console.log("mode_restored", "test");
  }

  process.exit(test.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
