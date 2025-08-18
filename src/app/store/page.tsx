// src/app/store/page.tsx
import { fetchProducts } from "@/lib/cms";
import StoreGrid from "./StoreGrid";

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
      <StoreGrid products={products} />
    </>
  );
}