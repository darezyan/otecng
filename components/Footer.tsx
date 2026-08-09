export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="font-heading text-xl font-extrabold tracking-tight text-foreground">
          otec<span className="text-primary">ng</span>
        </div>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Freezers, refrigerators, TVs, air conditioners and appliances for every home.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} otecng. All prices in Nigerian Naira (NGN).
        </p>
      </div>
    </footer>
  );
}
