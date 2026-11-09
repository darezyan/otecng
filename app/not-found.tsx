import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="font-heading text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-muted-foreground">The product may have been removed, or the link is out of date.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button nativeButton={false} size="lg" className="h-11 px-5 font-semibold" render={<Link href="/products">Browse products</Link>} />
        <Button nativeButton={false} size="lg" variant="outline" className="h-11 px-5 font-semibold" render={<Link href="/">Go home</Link>} />
      </div>
    </div>
  );
}
