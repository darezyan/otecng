import { BadgeCheck, CreditCard, Headphones, Truck } from "lucide-react";

const ITEMS = [
  { icon: BadgeCheck, title: "Genuine products", body: "Original units from authorised brands" },
  { icon: Truck, title: "Doorstep delivery", body: "We deliver to your home or office" },
  { icon: CreditCard, title: "Secure checkout", body: "Card, transfer & USSD via Squad" },
  { icon: Headphones, title: "Real support", body: "Help before and after you buy" },
];

export default function TrustStrip({ compact = false }: { compact?: boolean }) {
  return (
    <ul
      className={
        compact
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
          : "grid grid-cols-1 divide-y divide-border overflow-hidden rounded-xl border bg-background sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      }
    >
      {ITEMS.map(({ icon: Icon, title, body }) => (
        <li
          key={title}
          className={compact ? "flex items-start gap-2.5 rounded-lg bg-surface p-3" : "flex items-start gap-3 p-4 sm:p-5"}
        >
          <span
            className={`flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ${
              compact ? "size-8" : "size-10"
            }`}
          >
            <Icon className={compact ? "size-4" : "size-5"} aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">{title}</span>
            <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
