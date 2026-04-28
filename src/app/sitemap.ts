import type { MetadataRoute } from "next"
import { getProdutosSlugs, getPostsSlugs, getSetores } from "@/lib/queries"

const BASE = "https://psrembalagens.com.br"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date()

  const [produtoSlugs, postSlugs, setores] = await Promise.all([
    getProdutosSlugs(),
    getPostsSlugs(),
    getSetores(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,            lastModified: today, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/catalogo`,    lastModified: today, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/blog`,        lastModified: today, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/depoimentos`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
  ]

  const setorPages: MetadataRoute.Sitemap = setores.map(s => ({
    url: `${BASE}/catalogo/setor/${s.slug}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const produtoPages: MetadataRoute.Sitemap = produtoSlugs
    .filter(p => Boolean(p.slug))
    .map(p => ({
      url: `${BASE}/catalogo/p/${p.slug}`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.7,
    }))

  const postPages: MetadataRoute.Sitemap = postSlugs.map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticPages, ...setorPages, ...produtoPages, ...postPages]
}
