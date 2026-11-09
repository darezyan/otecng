import Link from "next/link";
import OtecMark from "./OtecMark";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" aria-label="OTEC Electronics home" className="inline-flex items-center gap-3 text-zinc-800">
          <OtecMark className="h-11 w-auto" />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-xl font-extrabold tracking-[0.12em]">OTEC</span>
            <span className="mt-1 text-[10px] font-bold tracking-[0.42em]">ELECTRONICS</span>
          </span>
        </Link>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          Freezers, refrigerators, TVs, air conditioners and appliances for every home.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} otecng. All prices in Nigerian Naira (NGN).
        </p>
      </div>
    </footer>
  );
}
