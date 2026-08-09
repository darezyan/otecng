import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { formatNaira } from "@/lib/format";
import ImageGallery from "@/components/ImageGallery";
import ProductGrid from "@/components/ProductGrid";
import { Separator } from "@/components/ui/separator";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.category_id, product.id, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">
          All products
        </Link>
        {" / "}
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ImageGallery images={product.product_images} productName={product.name} />

        <div>
          <span className="text-xs font-semibold tracking-wide text-primary uppercase">{product.brand.name}</span>
          <h1 className="mt-2 text-2xl font-bold text-foreground">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-foreground">{formatNaira(product.price)}</p>

          {product.description && (
            <div className="mt-8">
              <Separator className="mb-6" />
              <h2 className="mb-2 text-sm font-semibold text-foreground">Description</h2>
              <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-lg font-semibold text-foreground">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
