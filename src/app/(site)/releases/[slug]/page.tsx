import { redirect } from 'next/navigation';
import { sanity } from '@/lib/sanity';
import { groq } from 'next-sanity';

type Release = {
  _id: string;
  name: string;
  slug: string;
};

type SlugParams = {
  slug: string;
};

const RELEASE = groq`*[_type=="release" && slug.current==$slug][0]{
  _id, name, "slug": slug.current
}`;

export async function generateStaticParams() {
  const slugs = await sanity.fetch<SlugParams[]>(groq`*[_type=="release"]{ "slug": slug.current }`);
  return slugs?.filter(Boolean).map((s) => ({ slug: s.slug })) || [];
}

export const revalidate = 60;

export default async function ReleaseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const release = await sanity.fetch<Release | null>(RELEASE, { slug }, { next: { tags: ['releases'] } });

  if (!release) {
    redirect('/releases');
  }

  // Redirect to releases page with album parameter
  redirect(`/releases?album=${slug}`);
}
