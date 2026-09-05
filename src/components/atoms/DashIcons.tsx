import { cn } from "@/lib/cn";

const iconClass = "h-[18px] w-[18px]";

function Svg({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(iconClass, className)}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function NavIcon({ href }: { href: string }) {
  const path = href.replace(/\/$/, "") || "/";
  if (path.endsWith("/admin") || path === "/admin") {
    return (
      <Svg>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </Svg>
    );
  }
  if (path.includes("/users")) {
    return (
      <Svg>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Svg>
    );
  }
  if (path.includes("/payments") || path.includes("/billing")) {
    return (
      <Svg>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </Svg>
    );
  }
  if (path.includes("/plans")) {
    return (
      <Svg>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </Svg>
    );
  }
  if (path.includes("/checks") || path.includes("/check")) {
    return (
      <Svg>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </Svg>
    );
  }
  if (path.includes("/leads")) {
    return (
      <Svg>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </Svg>
    );
  }
  if (path.includes("/registry")) {
    return (
      <Svg>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </Svg>
    );
  }
  if (path.includes("/attorneys")) {
    return (
      <Svg>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 11h-6" />
      </Svg>
    );
  }
  if (path.includes("/ledger")) {
    return (
      <Svg>
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 5 4-7" />
      </Svg>
    );
  }
  if (path.includes("/notifications")) {
    return (
      <Svg>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </Svg>
    );
  }
  if (path.includes("/sessions") || path.includes("/history")) {
    return (
      <Svg>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </Svg>
    );
  }
  if (path.includes("/integrations")) {
    return (
      <Svg>
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="m4.93 4.93 2.83 2.83" />
        <path d="m16.24 16.24 2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="m4.93 19.07 2.83-2.83" />
        <path d="m16.24 7.76 2.83-2.83" />
      </Svg>
    );
  }
  if (path.includes("/settings") || path.includes("/profile")) {
    return (
      <Svg>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </Svg>
    );
  }
  if (path === "/account" || path.endsWith("/account")) {
    return (
      <Svg>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </Svg>
    );
  }
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
    </Svg>
  );
}

export function IconUsers() {
  return (
    <Svg className="h-5 w-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

export function IconActive() {
  return (
    <Svg className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function IconCoins() {
  return (
    <Svg className="h-5 w-5">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </Svg>
  );
}

export function IconSearch() {
  return (
    <Svg className="h-4 w-4">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

export function IconHome() {
  return (
    <Svg className="h-4 w-4">
      <path d="m3 10 9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </Svg>
  );
}

export function IconChecks() {
  return (
    <Svg className="h-5 w-5">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

export function IconRevenue() {
  return (
    <Svg className="h-5 w-5">
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </Svg>
  );
}

export function IconFailed() {
  return (
    <Svg className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </Svg>
  );
}
