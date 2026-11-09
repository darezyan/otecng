import { getBrands, getCategories } from "@/lib/data/products";
import MobileMenuDrawer from "./MobileMenuDrawer";

// Server wrapper: fetches the menu data, hands it to the client drawer.
// Rendered inside its own <Suspense> in Header so it can't delay the cart.
export default async function MobileMenu() {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);
  const PRIORITY = ["tvs", "refrigerators", "freezers", "acs", "washing-machines"];
  const ordered = [
    ...PRIORITY.map((s) => categories.find((c) => c.slug === s)).filter((c): c is NonNullable<typeof c> => Boolean(c)),
    ...categories.filter((c) => !PRIORITY.includes(c.slug)),
  ];
  return <MobileMenuDrawer categories={ordered} brands={brands} />;
}
