import TopProgressBar from "@/components/TopProgressBar";

export default function CheckoutCallbackLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <TopProgressBar />
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-hidden />
      <h1 className="mt-6 text-lg font-semibold text-foreground">Confirming your payment&hellip;</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">This only takes a moment. Please don&apos;t close this page.</p>
    </div>
  );
}
