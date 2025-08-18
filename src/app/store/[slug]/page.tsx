// src/app/store/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchAllSlugs, fetchProductBySlug } from "@/lib/cms";
import ProductGallery from "@/components/ProductGallery";

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
      <ProductGallery images={images} title={product.title} />

      <aside className="product__panel">
        <h1 className="product__title">{product.title}</h1>
        <div className="product__price">{product.priceText}</div>

        {product.description && (
          <div 
            className="product__desc" 
            dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br>') }}
          />
        )}

        {product.buyUrl && (
          <a
            href={product.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="product__buybtn"
          >
            ADD TO CART
          </a>
        )}

        {product.tags?.length ? (
          <div className="product__tags">
            {product.tags.map((t) => (
              <span key={t} className="product__tag">#{t}</span>
            ))}
          </div>
        ) : null}
      </aside>
    </main>
  );
}
