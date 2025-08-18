// src/app/store/page.tsx
import Link from "next/link";
import Image from "next/image";
import { fetchProducts } from "@/lib/cms";

export const metadata = {
  title: "Store | OVER MY BODY",
  description: "Physical releases and merchandise from OVER MY BODY.",
};

// ISR is fine for a CMS-backed list. Adjust as needed later.
export const revalidate = 60;

export default async function StorePage() {
  // Server Component fetch for SEO and performance
  const products = await fetchProducts();

  return (
    <>
      <h1>STORE</h1>
      <p className="lead">Physical releases and merchandise from OVER MY BODY.</p>

      <div className="release-grid">
        {products.map((p) => (
          <Link key={p.id} href={`/store/${p.slug}`} className="release-item">
            <div className="release-art">
              <Image
                src={p.coverImage}
                alt={p.title}
                width={300}
                height={300}
              />
            </div>
            <div className="release-info">
              <h3>{p.title}</h3>
              <p>{p.priceText}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}