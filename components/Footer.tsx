import Link from "next/link";
import { getBrands, getCategories } from "@/lib/data/products";
import Logo from "./Logo";

export default async function Footer() {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);

  return (
    <footer className="mt-20 bg-ink text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12 lg:px-8">
        <div className="md:col-span-4">
          <Logo inverted />
          <p className="mt-4 max-w-xs text-sm leading-6">
            Original freezers, refrigerators, TVs, air conditioners and home appliances from brands you trust,
            delivered to your door.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-xs">
            Payments secured by <span className="font-semibold text-white">Paystack</span>
          </p>
        </div>

        <div className="md:col-span-4">
          <h2 className="text-xs font-semibold tracking-[0.08em] text-white uppercase">Shop by category</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/products?category=${c.slug}`} className="transition-colors hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xs font-semibold tracking-[0.08em] text-white uppercase">Brands</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {brands.map((b) => (
              <li key={b.id}>
                <Link href={`/products?brand=${b.slug}`} className="transition-colors hover:text-white">
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xs font-semibold tracking-[0.08em] text-white uppercase">Shop</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/products" className="transition-colors hover:text-white">
                All products
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition-colors hover:text-white">
                Your cart
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} otecng. All rights reserved.</p>
          <p>All prices in Nigerian Naira (NGN), VAT inclusive where applicable.</p>
        </div>
      </div>
    </footer>
  );
}
