import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  btnGhost,
  btnHeroPrimary,
  btnHeroSecondary,
  btnOnDark,
  btnPrimary,
  btnSecondary,
} from "@/styles/ui";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "onDark"
  | "heroPrimary"
  | "heroSecondary";

interface ButtonProps {
  href?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: btnPrimary,
  secondary: btnSecondary,
  ghost: btnGhost,
  onDark: btnOnDark,
  heroPrimary: btnHeroPrimary,
  heroSecondary: btnHeroSecondary,
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
  disabled,
}: ButtonProps) {
  const cls = cn(variantClass[variant], className);
  if (href) {
    if (href.startsWith("#")) {
      return (
        <a href={href} className={cls} onClick={onClick}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
