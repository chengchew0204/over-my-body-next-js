// src/app/store/page.tsx
import { fetchProducts } from "@/lib/sanity-cms";
import StoreGrid from "./StoreGrid";

export const metadata = {
  title: "Store | OVER MY BODY",
  description: "Physical releases and merchandise from OVER MY BODY.",
};

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