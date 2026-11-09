import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { formatNaira } from "@/lib/format";
import { SITE_NAME, absoluteUrl, truncate } from "@/lib/site";
import AddToCartButtons from "@/components/AddToCartButtons";
import ImageGallery from "@/components/ImageGallery";
import ProductGrid from "@/components/ProductGrid";
import { SectionHeading } from "@/components/ProductRow";
import TrustStrip from "@/components/TrustStrip";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };

  const title = `${product.name}`;
  const description = truncate(
    `Buy the ${product.name} for ${formatNaira(product.price)} at ${SITE_NAME}. ${
      product.description
        ? product.description
            .split(/\n+/)
            .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
            .filter(Boolean)
            .join(", ")
        : `Genuine ${product.brand.name} ${product.category.name.toLowerCase()} with doorstep delivery and secure checkout with Squad by GTCO.`
    }`,
    200
  );
  const url = `/products/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${product.name} · ${formatNaira(product.price)}`,
      description,
    },
    twitter: { card: "summary_large_image", title: `${product.name} · ${formatNaira(product.price)}`, description },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": product.currency || "NGN",
      "product:brand": product.brand.name,
      "product:category": product.category.name,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.category_id, product.id, 4);
  const sortedImages = [...product.product_images].sort((a, b) => a.position - b.position);
  const primaryImage = product.product_images.find((img) => img.is_primary) ?? sortedImages[0] ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: sortedImages.map((i) => i.url),
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
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3" aria-hidden />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
        <ChevronRight className="size-3" aria-hidden />
        <Link
          href={`/products?category=${product.category.slug}&brand=${product.brand.slug}`}
          className="hover:text-foreground"
        >
          {product.brand.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <ImageGallery images={product.product_images} productName={product.name} />
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-44">
            <Link
              href={`/products?brand=${product.brand.slug}`}
              className="text-xs font-semibold tracking-[0.1em] text-primary uppercase hover:underline"
            >
              {product.brand.name}
            </Link>
            <h1 className="mt-2 font-heading text-2xl leading-tight font-bold text-foreground sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-6 rounded-xl border p-5">
              <p className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
                {formatNaira(product.price)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Price in Nigerian Naira. Delivery arranged after payment.</p>

              <AddToCartButtons
                productId={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                image={primaryImage?.url ?? null}
                brandName={product.brand.name}
              />
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border text-sm">
              {[
                ["Brand", product.brand.name],
                ["Category", product.category.name],
              ].map(([k, v]) => (
                <div key={k} className="bg-background px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6">
              <TrustStrip compact />
            </div>
          </div>
        </div>
      </div>

      {product.description && (
        <section className="mt-14 max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-foreground">Product details</h2>
          <p className="mt-4 text-sm leading-7 whitespace-pre-line text-foreground/75">{product.description}</p>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading
            eyebrow="Similar items"
            title="You may also like"
            href={`/products?category=${product.category.slug}`}
          />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
