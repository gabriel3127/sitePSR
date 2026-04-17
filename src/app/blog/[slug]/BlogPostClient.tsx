"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Clock, ArrowRight,
   Home, ShoppingBag, BookOpen,
   MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { Post } from "@/lib/types"

interface Props {
  post: Post
}

const CATEGORIA_STYLE: Record<string, { bg: string; dot: string }> = {
  Sustentabilidade: { bg: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  Dicas:            { bg: "bg-amber-100 text-amber-700",     dot: "bg-amber-500" },
  "Negócios":       { bg: "bg-blue-100 text-blue-700",       dot: "bg-blue-500" },
  default:          { bg: "bg-gray-100 text-gray-600",       dot: "bg-gray-400" },
}

const getCatStyle = (cat?: string | null) =>
  CATEGORIA_STYLE[cat || ""] || CATEGORIA_STYLE.default

const formatDate = (iso?: string | null) => {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Renderiza conteúdo texto com markdown simples ────────────────────────────
const renderContent = (content: string) => {
  return content.split("\n").map((line, i) => {
    const renderInline = (text: string) => {
      const parts = text.split(/\*\*(.*?)\*\*/g)
      return parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j} className="font-semibold text-gray-900">{part}</strong> : part
      )
    }
    if (line.startsWith("**") && line.endsWith("**"))
      return <h3 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3">{line.replace(/\*\*/g, "")}</h3>
    if (line.startsWith("- "))
      return <li key={i} className="text-gray-600 ml-4">{renderInline(line.slice(2))}</li>
    if (line.match(/^\d+\./))
      return <li key={i} className="text-gray-600 ml-4 list-decimal">{renderInline(line.replace(/^\d+\.\s*/, ""))}</li>
    if (line.trim() === "") return <br key={i} />
    return <p key={i} className="text-gray-600 leading-relaxed">{renderInline(line)}</p>
  })
}

export default function BlogPostClient({ post }: Props) {
  const router = useRouter()
  const style = getCatStyle(post.categoria)

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <Image src="/images/psr-logo.svg" alt="PSR Embalagens" width={100} height={36} className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-[#1A50A0] transition-colors">Home</Link>
            <Link href="/depoimentos" className="hover:text-[#1A50A0] transition-colors">Depoimentos</Link>
            <Link href="/#sobre" className="hover:text-[#1A50A0] transition-colors">Sobre</Link>
            <Link href="/#contato" className="hover:text-[#1A50A0] transition-colors">Contato</Link>
          </nav>
          <Link href="/catalogo"
            className="flex items-center gap-2 bg-[#1A50A0] hover:bg-[#153f80] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Visite nosso Catálogo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main>
        <article className="container max-w-3xl py-12">
          <button onClick={() => router.push("/blog")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao blog
          </button>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${style.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {post.categoria?.toUpperCase()}
            </span>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-3 leading-tight">
              {post.titulo}
            </h1>

            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />{formatDate(post.created_at)}
              </span>
              {post.tempo_leitura && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />{post.tempo_leitura} de leitura
                </span>
              )}
            </div>

            {post.foto_url && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden mt-8">
                <Image src={post.foto_url} alt={post.titulo} fill
                  className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
              </div>
            )}

            <div className="mt-8 prose prose-lg max-w-none">
              {post.conteudo_html ? (
                <div
                  className="text-gray-800 prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: post.conteudo_html }}
                />
              ) : (
                <div className="text-gray-800 space-y-1">
                  {renderContent(post.conteudo || "")}
                </div>
              )}
            </div>
          </motion.div>

          {/* CTA */}
          <div className="mt-12 p-6 rounded-2xl bg-[#1A50A0] text-white text-center">
            <p className="font-bold text-lg">Precisa de embalagens para o seu negócio?</p>
            <p className="text-white/70 text-sm mt-1">
              Explore nosso catálogo completo com entrega grátis no DF.
            </p>
            <Link href="/catalogo"
              className="inline-flex items-center gap-2 mt-4 bg-[#F5C200] text-[#0d1f3c] font-bold px-6 py-2.5 rounded-lg hover:bg-[#F5C200]/90 transition-colors text-sm">
              Ver Catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </main>

      {/* Navbar mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center lg:hidden">
        {[
          { label: "Início",      href: "/",            icon: Home },
          { label: "Catálogo",    href: "/catalogo",    icon: ShoppingBag },
          { label: "Blog",        href: "/blog",        icon: BookOpen },
          { label: "Depoimentos", href: "/depoimentos", icon: MessageSquare },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              href === "/catalogo" ? "text-[#1A50A0]" : "text-gray-400 hover:text-gray-600"
            }`}>
            <Icon className="w-5 h-5" />
            <span className={`text-[10px] ${href === "/catalogo" ? "font-bold" : "font-medium"}`}>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
