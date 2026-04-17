import type { Metadata } from "next"
import { getPosts } from "@/lib/queries"
import BlogClient from "./BlogClient"

export const metadata: Metadata = {
  title: "Blog | PSR Embalagens Brasília",
  description:
    "Dicas, novidades e insights sobre embalagens, sustentabilidade e negócios. Blog da PSR Embalagens.",
  alternates: {
    canonical: "https://www.psrembalagens.com.br/blog",
  },
}

export default async function BlogPage() {
  const posts = await getPosts({ publicado: true })
  return <BlogClient posts={posts} />
}
