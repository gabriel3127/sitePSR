import { useState } from "react"
import { X, Upload, Star } from "lucide-react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { supabase } from "@/lib/supabase"
import { convertToWebp } from "@/lib/convertToWebp"

const MenuBar = ({ editor }) => {
  if (!editor) return null
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-secondary/30">
      {[
        { label: "N", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "Negrito" },
        { label: "I", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "Itálico" },
        { label: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), title: "Título" },
        { label: "H3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }), title: "Subtítulo" },
        { label: "• Lista", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), title: "Lista" },
        { label: "1. Lista", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), title: "Lista numerada" },
        { label: "—", action: () => editor.chain().focus().setHorizontalRule().run(), active: false, title: "Divisor" },
      ].map((btn) => (
        <button
          key={btn.title}
          type="button"
          onClick={btn.action}
          title={btn.title}
          className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
            btn.active
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-border hover:bg-secondary"
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}

const categorias = ["Sustentabilidade", "Dicas", "Negócios"]

const slugify = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

const PostModal = ({ post, onClose, onSaved }) => {
  const editing = !!post

  const [form, setForm] = useState({
    titulo: post?.titulo || "",
    excerpt: post?.excerpt || "",
    categoria: post?.categoria || "Dicas",
    tempo_leitura: post?.tempo_leitura || "",
    publicado: post?.publicado ?? true,
    slug: post?.slug || "",
  })

  const [destaque, setDestaque] = useState(post?.destaque ?? false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fotoUrl, setFotoUrl] = useState(post?.foto_url || null)
  const [error, setError] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Escreva o conteúdo do post aqui..." }),
    ],
    content: post?.conteudo_html || "",
  })

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const webpFile = await convertToWebp(file)
    const path = `blog/${Date.now()}.webp`
    const { error } = await supabase.storage.from("produtos").upload(path, webpFile, { contentType: "image/webp" })
    if (!error) {
      const { data } = supabase.storage.from("produtos").getPublicUrl(path)
      setFotoUrl(data.publicUrl)
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setError("Título obrigatório."); return }
    setSaving(true)
    setError("")

    const slug = editing ? form.slug : slugify(form.titulo)
    const conteudo_html = editor?.getHTML() || ""

    const payload = { ...form, slug, foto_url: fotoUrl, conteudo_html, destaque }

    if (editing) {
      const { error } = await supabase.from("posts").update(payload).eq("id", post.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from("posts").insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-foreground">{editing ? "Editar post" : "Novo post"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Título</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Título do post"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Resumo</label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Resumo que aparece na listagem do blog"
            />
          </div>

          {/* Categoria + Tempo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categorias.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Tempo de leitura</label>
              <input
                type="text"
                value={form.tempo_leitura}
                onChange={(e) => setForm({ ...form, tempo_leitura: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="ex: 5 min"
              />
            </div>
          </div>

          {/* Editor de conteúdo */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Conteúdo</label>
            <div className="border rounded-lg overflow-hidden">
              <MenuBar editor={editor} />
              <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none p-3 min-h-[200px] text-foreground focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
              />
            </div>
          </div>

          {/* Foto */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Foto de capa</label>
            {fotoUrl && (
              <img src={fotoUrl} alt="preview" className="w-full aspect-video object-cover rounded-lg border" />
            )}
            <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? "Enviando..." : fotoUrl ? "Trocar foto" : "Escolher foto de capa"}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
          </div>

          {/* Publicado + Destaque */}
          <div className="space-y-3">
            {/* Publicado */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.publicado}
                onChange={(e) => setForm({ ...form, publicado: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-foreground">Post visível no blog</span>
            </label>

            {/* Destaque */}
            <div className="flex items-center justify-between border rounded-lg px-4 py-3 bg-secondary/20">
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${destaque ? "text-[#F5C200] fill-[#F5C200]" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">Post em destaque</p>
                  <p className="text-xs text-muted-foreground">Aparece em tamanho grande no topo do blog</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDestaque((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  destaque ? "bg-[#1A50A0]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    destaque ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex gap-3 p-5 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar post"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border text-foreground text-sm hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PostModal