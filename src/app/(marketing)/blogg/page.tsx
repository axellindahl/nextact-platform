import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blogg — Next Act",
  description:
    "Läs artiklar om mental träning, ACT och idrottspsykologi.",
};

export default async function BlogPage() {
  let posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
  }> = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    posts = data ?? [];
  } catch {
    // DB not available yet — show empty state
  }

  return (
    <>
      <section className="bg-navy py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white md:text-5xl">
            Blogg
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Artiklar om mental träning, ACT och idrottspsykologi.
          </p>
        </div>
      </section>

      <section className="bg-off-white py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          {posts.length === 0 ? (
            <div className="text-center">
              <p className="text-lg text-charcoal">
                Inga artiklar publicerade ännu. Kom tillbaka snart!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blogg/${post.slug}`}
                  className="group rounded-2xl bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-navy/5"
                >
                  <h2 className="font-heading text-lg font-semibold text-navy group-hover:text-primary">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-charcoal">
                      {post.excerpt}
                    </p>
                  )}
                  {post.published_at && (
                    <p className="mt-4 text-xs text-light-gray">
                      {new Date(post.published_at).toLocaleDateString("sv-SE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
