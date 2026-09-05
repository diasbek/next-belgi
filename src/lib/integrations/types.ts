export const INTEGRATION_PROVIDERS = [
  "eskiz",
  "openai",
  "resend",
  "payme",
  "click",
  "google",
  "telegram",
  "adliya",
] as const;

export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

/** Shared runtime modes per module. */
export type IntegrationMode = "live" | "test" | "sandbox" | "dev" | "mock";

export const TEST_OTP_CODE = "00000";

export type EskizSecrets = {
  mode?: "live" | "test";
  email?: string;
  password?: string;
  from?: string;
  base_url?: string;
};

export type OpenAiSecrets = {
  mode?: "live" | "mock";
  api_key?: string;
  model?: string;
};

export type ResendSecrets = {
  mode?: "live" | "test";
  api_key?: string;
  from?: string;
  notify_to?: string;
};

export type PaymeSecrets = {
  /** live = production checkout; sandbox = test.paycom.uz; dev = mock top-up button */
  mode?: "live" | "sandbox" | "dev";
  merchant_id?: string;
  key?: string;
};

export type ClickSecrets = {
  /** live = real Click; dev = mock top-up button */
  mode?: "live" | "dev";
  merchant_id?: string;
  service_id?: string;
  secret_key?: string;
};

export type GoogleSecrets = {
  mode?: "live" | "test";
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
};

export type TelegramSecrets = {
  mode?: "live" | "test";
  bot_token?: string;
  chat_id?: string;
};

export type AdliyaSecrets = {
  mode?: "live" | "test";
  access_token?: string;
  api_base?: string;
};

export type IntegrationPayloadMap = {
  eskiz: EskizSecrets;
  openai: OpenAiSecrets;
  resend: ResendSecrets;
  payme: PaymeSecrets;
  click: ClickSecrets;
  google: GoogleSecrets;
  telegram: TelegramSecrets;
  adliya: AdliyaSecrets;
};

export type ModuleFieldKind = "text" | "password" | "select" | "toggle";

export type ModuleFieldDef = {
  key: string;
  kind: ModuleFieldKind;
  secret?: boolean;
  options?: Array<{ value: string; labelKey: string }>;
  /** Hide when mode is one of these */
  hideWhenModes?: string[];
  /** Required only in these modes (empty = always when not hidden) */
  requiredInModes?: string[];
};

export type ModuleCatalogItem = {
  provider: IntegrationProvider;
  category: "messaging" | "ai" | "payments" | "auth" | "data";
  modes: Array<{ value: string; labelKey: string }>;
  defaultMode: string;
  fields: ModuleFieldDef[];
  testOtpHint?: boolean;
};

export const MODULE_CATALOG: ModuleCatalogItem[] = [
  {
    provider: "eskiz",
    category: "messaging",
    defaultMode: "test",
    testOtpHint: true,
    modes: [
      { value: "test", labelKey: "modeTest" },
      { value: "live", labelKey: "modeLive" },
    ],
    fields: [
      {
        key: "mode",
        kind: "select",
        options: [
          { value: "test", labelKey: "modeTest" },
          { value: "live", labelKey: "modeLive" },
        ],
      },
      { key: "email", kind: "text", hideWhenModes: ["test"], requiredInModes: ["live"] },
      {
        key: "password",
        kind: "password",
        secret: true,
        hideWhenModes: ["test"],
        requiredInModes: ["live"],
      },
      { key: "from", kind: "text", hideWhenModes: ["test"] },
      { key: "base_url", kind: "text", hideWhenModes: ["test"] },
    ],
  },
  {
    provider: "resend",
    category: "messaging",
    defaultMode: "test",
    testOtpHint: true,
    modes: [
      { value: "test", labelKey: "modeTest" },
      { value: "live", labelKey: "modeLive" },
    ],
    fields: [
      {
        key: "mode",
        kind: "select",
        options: [
          { value: "test", labelKey: "modeTest" },
          { value: "live", labelKey: "modeLive" },
        ],
      },
      {
        key: "api_key",
        kind: "password",
        secret: true,
        hideWhenModes: ["test"],
        requiredInModes: ["live"],
      },
      { key: "from", kind: "text", hideWhenModes: ["test"] },
      { key: "notify_to", kind: "text" },
    ],
  },
  {
    provider: "telegram",
    category: "messaging",
    defaultMode: "test",
    modes: [
      { value: "test", labelKey: "modeTest" },
      { value: "live", labelKey: "modeLive" },
    ],
    fields: [
      {
        key: "mode",
        kind: "select",
        options: [
          { value: "test", labelKey: "modeTest" },
          { value: "live", labelKey: "modeLive" },
        ],
      },
      {
        key: "bot_token",
        kind: "password",
        secret: true,
        hideWhenModes: ["test"],
        requiredInModes: ["live"],
      },
      {
        key: "chat_id",
        kind: "text",
        hideWhenModes: ["test"],
        requiredInModes: ["live"],
      },
    ],
  },
  {
    provider: "openai",
    category: "ai",
    defaultMode: "mock",
    modes: [
      { value: "mock", labelKey: "modeMock" },
      { value: "live", labelKey: "modeLive" },
    ],
    fields: [
      {
        key: "mode",
        kind: "select",
        options: [
          { value: "mock", labelKey: "modeMock" },
          { value: "live", labelKey: "modeLive" },
        ],
      },
      {
        key: "api_key",
        kind: "password",
        secret: true,
        hideWhenModes: ["mock"],
        requiredInModes: ["live"],
      },
      { key: "model", kind: "text" },
    ],
  },
  {
    provider: "payme",
    category: "payments",
    defaultMode: "dev",
    modes: [
      { value: "dev", labelKey: "modeDev" },
      { value: "sandbox", labelKey: "modeSandbox" },
      { value: "live", labelKey: "modeLive" },
    ],
    fields: [
      {
        key: "mode",
        kind: "select",
        options: [
          { value: "dev", labelKey: "modeDev" },
          { value: "sandbox", labelKey: "modeSandbox" },
          { value: "live", labelKey: "modeLive" },
        ],
      },
      {
        key: "merchant_id",
        kind: "text",
        hideWhenModes: ["dev"],
        requiredInModes: ["live", "sandbox"],
      },
      {
        key: "key",
        kind: "password",
        secret: true,
        hideWhenModes: ["dev"],
        requiredInModes: ["live", "sandbox"],
      },
    ],
  },
  {
    provider: "click",
    category: "payments",
    defaultMode: "dev",
    modes: [
      { value: "dev", labelKey: "modeDev" },
      { value: "live", labelKey: "modeLive" },
    ],
    fields: [
      {
        key: "mode",
        kind: "select",
        options: [
          { value: "dev", labelKey: "modeDev" },
          { value: "live", labelKey: "modeLive" },
        ],
      },
      {
        key: "merchant_id",
        kind: "text",
        hideWhenModes: ["dev"],
        requiredInModes: ["live"],
      },
      {
        key: "service_id",
        kind: "text",
        hideWhenModes: ["dev"],
        requiredInModes: ["live"],
      },
      {
        key: "secret_key",
        kind: "password",
        secret: true,
        hideWhenModes: ["dev"],
        requiredInModes: ["live"],
      },
    ],
  },
  {
    provider: "google",
    category: "auth",
    defaultMode: "test",
    modes: [
      { value: "test", labelKey: "modeTest" },
      { value: "live", labelKey: "modeLive" },
    ],
    fields: [
      {
        key: "mode",
        kind: "select",
        options: [
          { value: "test", labelKey: "modeTest" },
          { value: "live", labelKey: "modeLive" },
        ],
      },
      {
        key: "client_id",
        kind: "text",
        requiredInModes: ["live", "test"],
      },
      {
        key: "client_secret",
        kind: "password",
        secret: true,
        requiredInModes: ["live", "test"],
      },
      { key: "redirect_uri", kind: "text" },
    ],
  },
  {
    provider: "adliya",
    category: "data",
    defaultMode: "test",
    modes: [
      { value: "test", labelKey: "modeTest" },
      { value: "live", labelKey: "modeLive" },
    ],
    fields: [
      {
        key: "mode",
        kind: "select",
        options: [
          { value: "test", labelKey: "modeTest" },
          { value: "live", labelKey: "modeLive" },
        ],
      },
      {
        key: "access_token",
        kind: "password",
        secret: true,
        hideWhenModes: ["test"],
        requiredInModes: ["live"],
      },
      { key: "api_base", kind: "text" },
    ],
  },
];

export function getModuleCatalog(
  provider: IntegrationProvider,
): ModuleCatalogItem {
  return MODULE_CATALOG.find((m) => m.provider === provider)!;
}

export type IntegrationStatus = {
  provider: IntegrationProvider;
  configured: boolean;
  enabled: boolean;
  mode: string;
  masked: Record<string, string | boolean | null>;
  updated_at: string | null;
};

const SECRET_FIELD_HINTS: Record<IntegrationProvider, string[]> = {
  eskiz: ["password"],
  openai: ["api_key"],
  resend: ["api_key"],
  payme: ["key"],
  click: ["secret_key"],
  google: ["client_secret"],
  telegram: ["bot_token"],
  adliya: ["access_token"],
};

export function maskValue(value: string | undefined | null): string | null {
  if (!value) return null;
  if (value.length <= 4) return "****";
  return `${"*".repeat(Math.min(8, value.length - 4))}${value.slice(-4)}`;
}

export function maskPayload(
  provider: IntegrationProvider,
  payload: Record<string, unknown>,
): Record<string, string | boolean | null> {
  const secrets = new Set(SECRET_FIELD_HINTS[provider]);
  const out: Record<string, string | boolean | null> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === "boolean") {
      out[k] = v;
    } else if (typeof v === "string") {
      out[k] = secrets.has(k) ? maskValue(v) : v || null;
    } else if (v == null) {
      out[k] = null;
    } else {
      out[k] = String(v);
    }
  }
  return out;
}

export function isIntegrationProvider(v: string): v is IntegrationProvider {
  return (INTEGRATION_PROVIDERS as readonly string[]).includes(v);
}

export function resolveMode(
  provider: IntegrationProvider,
  payload: Record<string, unknown> | null,
): string {
  const catalog = getModuleCatalog(provider);
  const mode = typeof payload?.mode === "string" ? payload.mode : null;
  if (mode && catalog.modes.some((m) => m.value === mode)) return mode;
  return catalog.defaultMode;
}

export function isPayloadConfigured(
  provider: IntegrationProvider,
  payload: Record<string, unknown> | null,
): boolean {
  if (!payload) {
    // Soft-configured via default test/dev modes without saved row
    const mode = resolveMode(provider, null);
    if (mode === "test" || mode === "dev" || mode === "mock") return true;
    return false;
  }
  const mode = resolveMode(provider, payload);
  switch (provider) {
    case "eskiz":
      if (mode === "test") return true;
      return Boolean(payload.email && payload.password);
    case "resend":
      if (mode === "test") return true;
      return Boolean(payload.api_key);
    case "telegram":
      if (mode === "test") return true;
      return Boolean(payload.bot_token && payload.chat_id);
    case "openai":
      if (mode === "mock") return true;
      return Boolean(payload.api_key);
    case "payme":
      if (mode === "dev") return true;
      return Boolean(payload.merchant_id && payload.key);
    case "click":
      if (mode === "dev") return true;
      return Boolean(
        payload.merchant_id && payload.service_id && payload.secret_key,
      );
    case "google":
      return Boolean(payload.client_id && payload.client_secret);
    case "adliya":
      if (mode === "test") return true;
      return Boolean(payload.access_token);
    default:
      return false;
  }
}
