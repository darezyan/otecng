import Link from "next/link";

export function LogoMark({ className = "size-8", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill={inverted ? "#fff" : "var(--ink)"} />
      <circle cx="16" cy="16" r="7.5" fill="none" stroke="var(--primary)" strokeWidth="3.5" />
      <circle cx="16" cy="16" r="2" fill={inverted ? "var(--ink)" : "#fff"} />
    </svg>
  );
}

export default function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" aria-label="otecng home" className="flex shrink-0 items-center gap-2">
      <LogoMark inverted={inverted} />
      <span
        className={`font-heading text-[1.35rem] leading-none font-extrabold tracking-tight ${
          inverted ? "text-white" : "text-foreground"
        }`}
      >
        otec<span className="text-primary">ng</span>
      </span>
    </Link>
  );
}
