import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, Clock, Tag, Pencil, Trash2, ArrowRight, Sparkles } from "lucide-react"
import psrLogo from "@/assets/psr-logo.svg"
import { usePosts, usePost } from "@/hooks/usePosts"
import { useAuth } from "@/contexts/AuthContext"
import AdminBar from "@/components/AdminBar"
import PostModal from "@/components/PostModal"
import MobileBottomNav from "@/components/MobileBottomNav"
import { supabase } from "@/lib/supabase"

// ─── Cores por categoria ────────────────────────────────────────────────────
const CATEGORIA_STYLE = {
  Sustentabilidade: { bg: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  Dicas:            { bg: "bg-amber-100 text-amber-700",     dot: "bg-amber-500" },
  Negócios:         { bg: "bg-blue-100 text-blue-700",       dot: "bg-blue-500" },
  default:          { bg: "bg-gray-100 text-gray-600",       dot: "bg-gray-400" },
}

const getCatStyle = (cat) => CATEGORIA_STYLE[cat] || CATEGORIA_STYLE.default

const categorias = ["Todos", "Sustentabilidade", "Dicas", "Negócios"]

const formatDate = (iso) => {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Navbar do Blog ─────────────────────────────────────────────────────────
const BlogNav = () => (
  <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
    <div className="container flex items-center justify-between h-16">
      <Link to="/">
        <img src={psrLogo} alt="PSR Embalagens" className="h-10" />
      </Link>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
        <Link to="/" className="hover:text-[#1A50A0] transition-colors">Home</Link>
        <Link to="/depoimentos" className="hover:text-[#1A50A0] transition-colors">Depoimentos</Link>
        <Link to="/#sobre" className="hover:text-[#1A50A0] transition-colors">Sobre</Link>
        <Link to="/#contato" className="hover:text-[#1A50A0] transition-colors">Contato</Link>
      </nav>

      <Link
        to="/catalogo"
        className="flex items-center gap-2 bg-[#1A50A0] hover:bg-[#153f80] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        Visite nosso Catálogo
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  </header>
)

// ─── Hero Section ────────────────────────────────────────────────────────────
const BlogHero = () => (
  <section className="relative bg-[#0d1f3c] overflow-hidden">
    {/* grade decorativa */}
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: `linear-gradient(rgba(245,194,0,0.3) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(245,194,0,0.3) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }}
    />
    {/* gradiente lateral direito */}
    <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#1A50A0]/30 to-transparent" />

    <div className="container relative py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <span className="inline-flex items-center gap-2 bg-[#F5C200]/20 text-[#F5C200] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3 h-3" /> Insights &amp; Inovação
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
          Blog PSR<br />
          <span className="text-[#F5C200]">Embalagens</span>
        </h1>
        <p className="mt-4 text-gray-300 text-lg max-w-lg leading-relaxed">
          Explorando o futuro da logística e sustentabilidade através de embalagens inteligentes.
        </p>
      </motion.div>
    </div>
  </section>
)

// ─── Card padrão ─────────────────────────────────────────────────────────────
const PostCard = ({ post, index, isAdmin, onEdit, onDelete }) => {
  const style = getCatStyle(post.categoria)
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300"
    >
      <Link to={`/blog/${post.slug}`}>
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {post.foto_url ? (
            <img
              src={post.foto_url}
              alt={post.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">sem foto</div>
          )}
          {/* badge categoria */}
          <span className={`absolute top-3 left-3 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${style.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {post.categoria?.toUpperCase()}
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.created_at)}</span>
            {post.tempo_leitura && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.tempo_leitura}</span>}
          </div>
          <h2 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#1A50A0] transition-colors">{post.titulo}</h2>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.excerpt}</p>
          <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#1A50A0] group-hover:gap-2 transition-all">
            Ler mais <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {isAdmin && (
        <div className="flex gap-2 px-5 pb-4 border-t border-gray-50 pt-3">
          <button
            onClick={() => onEdit(post)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border rounded px-2 py-1 transition-colors"
          >
            <Pencil className="w-3 h-3" /> Editar
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Excluir
          </button>
        </div>
      )}
    </motion.article>
  )
}

// ─── Featured Post ────────────────────────────────────────────────────────────
const FeaturedPost = ({ post, isAdmin, onEdit, onDelete }) => {
  const style = getCatStyle(post.categoria)
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300"
    >
      <div className="grid md:grid-cols-2">
        {/* imagem */}
        <div className="relative aspect-video md:aspect-auto overflow-hidden bg-gray-100 md:max-h-[360px]">
          {post.foto_url ? (
            <img
              src={post.foto_url}
              alt={post.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">sem foto</div>
          )}
          <span className={`absolute top-4 left-4 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${style.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {post.categoria?.toUpperCase()}
          </span>
          <span className="absolute top-4 right-4 flex items-center gap-1 bg-[#F5C200] text-[#0d1f3c] text-xs font-black px-2.5 py-1 rounded-full">
            ★ DESTAQUE
          </span>
        </div>

        {/* conteúdo */}
        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.created_at)}</span>
            {post.tempo_leitura && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.tempo_leitura}</span>}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight group-hover:text-[#1A50A0] transition-colors">
            {post.titulo}
          </h2>
          <p className="text-gray-500 mt-3 leading-relaxed">{post.excerpt}</p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              to={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2 bg-[#1A50A0] hover:bg-[#153f80] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Ler artigo completo <ArrowRight className="w-4 h-4" />
            </Link>
            {isAdmin && (
              <>
                <button
                  onClick={() => onEdit(post)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border rounded px-2 py-1.5 transition-colors"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button
                  onClick={() => onDelete(post.id)}
                  className="flex items-center gap-1 text-xs text-red-500 border border-red-200 rounded px-2 py-1.5 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Excluir
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const BlogFooter = () => (
  <footer className="border-t border-gray-200 mt-20 py-8">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
      <span>© {new Date().getFullYear()} PSR Embalagens. Todos os direitos reservados.</span>
      <div className="flex items-center gap-5">
        <Link to="/" className="hover:text-[#1A50A0] transition-colors">Home</Link>
        <Link to="/catalogo" className="hover:text-[#1A50A0] transition-colors">Catálogo</Link>
        <Link to="/contato" className="hover:text-[#1A50A0] transition-colors">Contato</Link>
      </div>
    </div>
  </footer>
)

// ─── Skeleton ────────────────────────────────────────────────────────────────
const SkeletonCards = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="aspect-video bg-gray-100" />
        <div className="p-5 space-y-3">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-5 bg-gray-100 rounded w-5/6" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
)

// ════════════════════════════════════════════════════════════════════════════
// BlogPost (página individual — mantida, só troca navbar)
// ════════════════════════════════════════════════════════════════════════════
export const BlogPost = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { post, loading, setPost } = usePost(slug)
  const { isAdmin } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)

  const handleSaved = () => window.location.reload()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlogNav />
        <div className="container max-w-3xl py-12 animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="aspect-video bg-gray-200 rounded-lg mt-8" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Post não encontrado.</p>
        <Link to="/blog" className="text-[#1A50A0] font-semibold hover:underline">Voltar ao blog</Link>
      </div>
    )
  }

  const style = getCatStyle(post.categoria)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminBar type="blog" />
      <BlogNav />

      <article className="container max-w-3xl py-12">
        <button
          onClick={() => navigate("/blog")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao blog
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${style.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {post.categoria?.toUpperCase()}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-3 leading-tight">{post.titulo}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(post.created_at)}</span>
            {post.tempo_leitura && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.tempo_leitura} de leitura</span>}
          </div>

          {isAdmin && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border rounded px-3 py-1.5 transition-colors"
              >
                <Pencil className="w-3 h-3" /> Editar post
              </button>
            </div>
          )}

          {post.foto_url && (
            <img src={post.foto_url} alt={post.titulo} className="w-full rounded-2xl mt-8 aspect-video object-cover" />
          )}

          {post.conteudo_html ? (
            <div
              className="mt-8 prose prose-lg max-w-none text-gray-800 prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.conteudo_html }}
            />
          ) : (
            <div className="mt-8 prose prose-lg max-w-none text-gray-800">
              {(post.conteudo || "").split("\n").map((line, i) => {
                const renderInline = (text) => {
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
              })}
            </div>
          )}
        </motion.div>
      </article>

      {isAdmin && modalOpen && (
        <PostModal post={post} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Blog (lista principal)
// ════════════════════════════════════════════════════════════════════════════
const Blog = () => {
  const { posts, loading } = usePosts()
  const { isAdmin } = useAuth()
  const [activeCategoria, setActiveCategoria] = useState("Todos")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)

  const handleSaved = () => window.location.reload()

  const handleEdit = (post) => { setEditingPost(post); setModalOpen(true) }

  const handleDelete = async (id) => {
    if (!confirm("Excluir este post?")) return
    await supabase.from("posts").delete().eq("id", id)
    window.location.reload()
  }

  const filtered = activeCategoria === "Todos"
    ? posts
    : posts.filter((p) => p.categoria === activeCategoria)

  // separa destaque dos demais
  const featured = filtered.find((p) => p.destaque)
  const rest = filtered.filter((p) => !p.destaque || p !== featured)

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <AdminBar
        type="blog"
        onNewPost={() => { setEditingPost(null); setModalOpen(true) }}
      />

      <BlogNav />
      <BlogHero />

      <div className="container py-12">
        {/* filtros de categoria */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoria(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategoria === cat
                  ? "bg-[#1A50A0] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#1A50A0] hover:text-[#1A50A0]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <SkeletonCards />
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Nenhum post encontrado.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* post em destaque — ocupa largura total */}
            {featured && (
              <FeaturedPost
                post={featured}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}

            {/* demais cards */}
            {rest.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                index={i}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <BlogFooter />
      </div>

      {isAdmin && modalOpen && (
        <PostModal
          post={editingPost}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      <MobileBottomNav />
    </div>
  )
}

export default Blog