import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) return { title: "Artikel hittades inte — Next Act" };

  return {
    title: `${post.title} — Next Act Blogg`,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, content, excerpt, published_at, author_id")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  return (
    <>
      <section className="bg-navy py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/blogg"
            className="mb-6 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
            Tillbaka till bloggen
          </Link>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white md:text-4xl">
            {post.title}
          </h1>
          {post.published_at && (
            <p className="mt-4 text-sm text-white/50">
              {new Date(post.published_at).toLocaleDateString("sv-SE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </section>

      <section className="bg-off-white py-16 md:py-24">
        <article className="mx-auto max-w-3xl px-6">
          <div className="prose prose-lg max-w-none text-navy prose-headings:font-heading prose-headings:text-navy prose-p:text-charcoal prose-a:text-primary">
            {post.content.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
