// src/app/store/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchAllSlugs, fetchProductBySlug } from "@/lib/cms";
import ProductGallery from "@/components/ProductGallery";
import ProductPanel from "@/components/ProductPanel";

type Props = { params: Promise<{ slug: string }> };

// Pre-generate static params; good for ISR + SEO
export async function generateStaticParams() {
  const slugs = await fetchAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.title} | Store | OVER MY BODY`,
    description: product.description ?? "",
    openGraph: {
      title: product.title,
      images: [{ url: product.coverImage }],
    },
  };
}

// Revalidate detail page
export const revalidate = 60;

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const images = product.images?.length ? product.images : [product.coverImage];

  return (
    <main className="product">
      <div className="product__media">
        <ProductGallery images={images} title={product.title} />
      </div>
      <ProductPanel product={product} />
    </main>
  );
}
