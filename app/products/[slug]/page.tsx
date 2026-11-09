import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { formatNaira } from "@/lib/format";
import AddToCartButtons from "@/components/AddToCartButtons";
import ImageGallery from "@/components/ImageGallery";
import ProductGrid from "@/components/ProductGrid";
import { Separator } from "@/components/ui/separator";
import { SITE_NAME, absoluteUrl, truncate } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };

  const details = product.description
    ? product.description
        .split(/\n+/)
        .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
        .filter(Boolean)
        .join(", ")
    : `Genuine ${product.brand.name} ${product.category.name.toLowerCase()} with doorstep delivery and secure checkout.`;
  const description = truncate(`Buy the ${product.name} for ${formatNaira(product.price)} at ${SITE_NAME}. ${details}`, 200);
  const title = `${product.name} · ${formatNaira(product.price)}`;
  const url = `/products/${product.slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description },
    twitter: { card: "summary_large_image", title, description },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": product.currency || "NGN",
      "product:brand": product.brand.name,
      "product:category": product.category.name,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.category_id, product.id, 4);
  const primaryImage = product.product_images.find((img) => img.is_primary) ?? product.product_images[0] ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: [...product.product_images].sort((a, b) => a.position - b.position).map((i) => i.url),
            description: product.description ?? undefined,
            brand: { "@type": "Brand", name: product.brand.name },
            category: product.category.name,
            url: absoluteUrl(`/products/${product.slug}`),
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: product.currency || "NGN",
              availability: "https://schema.org/InStock",
              url: absoluteUrl(`/products/${product.slug}`),
            },
          }).replace(/</g, "\\u003c"),
        }}
      />
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

          <AddToCartButtons
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={product.price}
            image={primaryImage?.url ?? null}
            brandName={product.brand.name}
          />

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
