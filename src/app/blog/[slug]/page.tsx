import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostBySlug, getPosts } from "@/lib/queries"
import BlogPostClient from "./BlogPostClient"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: "Post não encontrado | PSR Embalagens" }
  return {
    title: `${post.titulo} | Blog PSR Embalagens`,
    description: post.excerpt || "Blog PSR Embalagens",
    alternates: {
      canonical: `https://www.psrembalagens.com.br/blog/${slug}`,
    },
    openGraph: {
      title: post.titulo,
      description: post.excerpt || "",
      images: post.foto_url ? [{ url: post.foto_url }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()
  return <BlogPostClient post={post} />
}
