"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        That&apos;s likely a temporary connection hiccup, not something wrong with your order or account.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" render={<Link href="/">Go home</Link>} />
      </div>
    </div>
  );
}
