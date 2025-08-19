// src/app/store/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchAllSlugs, fetchProductBySlug } from "@/lib/sanity-cms";
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

  // Combine cover image and gallery images properly
  // Cover image should always be first, followed by gallery images
  const allImages: string[] = [];
  
  // Add cover image first if it exists
  if (product.coverImage) {
    allImages.push(product.coverImage);
  }
  
  // Add gallery images, but avoid duplicating the cover image
  if (product.images?.length) {
    const uniqueGalleryImages = product.images.filter(img => img !== product.coverImage);
    allImages.push(...uniqueGalleryImages);
  }
  
  // Fallback to cover image only if no images are available
  const images = allImages.length > 0 ? allImages : [product.coverImage].filter(Boolean);

  return (
    <main className="product">
      <div className="product__media">
        <ProductGallery images={images} title={product.title} />
      </div>
      <ProductPanel product={product} />
    </main>
  );
}
