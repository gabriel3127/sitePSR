import { useState } from "react"
import { X, Upload, Plus, Trash2, GripVertical } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { convertToWebp } from "@/lib/convertToWebp"

const VariacoesEditor = ({ variacoes, onChange }) => {
  const addGrupo = () => onChange([...variacoes, { label: "", valores: [""] }])
  const removeGrupo = (gi) => onChange(variacoes.filter((_, i) => i !== gi))
  const updateLabel = (gi, val) => onChange(variacoes.map((g, i) => i === gi ? { ...g, label: val } : g))
  const addValor = (gi) => onChange(variacoes.map((g, i) => i === gi ? { ...g, valores: [...g.valores, ""] } : g))
  const removeValor = (gi, vi) => onChange(variacoes.map((g, i) => i === gi ? { ...g, valores: g.valores.filter((_, j) => j !== vi) } : g))
  const updateValor = (gi, vi, val) => onChange(variacoes.map((g, i) => i === gi ? { ...g, valores: g.valores.map((v, j) => j === vi ? val : v) } : g))

  return (
    <div className="space-y-3">
      {variacoes.map((grupo, gi) => (
        <div key={gi} className="border rounded-lg p-3 space-y-2 bg-secondary/10">
          <div className="flex items-center gap-2">
            <input type="text" value={grupo.label} onChange={(e) => updateLabel(gi, e.target.value)}
              placeholder="Nome do grupo (ex: Cor, Tamanho)"
              className="flex-1 px-2 py-1.5 rounded border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={() => removeGrupo(gi)} className="p-1.5 rounded border border-destructive/30 text-destructive hover:bg-destructive/10">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 pl-2">
            {grupo.valores.map((val, vi) => (
              <div key={vi} className="flex items-center gap-2">
                <input type="text" value={val} onChange={(e) => updateValor(gi, vi, e.target.value)}
                  placeholder="ex: Vermelho, 500ml..."
                  className="flex-1 px-2 py-1.5 rounded border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <button onClick={() => removeValor(gi, vi)}
                  className="p-1.5 rounded border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-30"
                  disabled={grupo.valores.length === 1}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button onClick={() => addValor(gi)} className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
              <Plus className="w-3 h-3" /> Adicionar opção
            </button>
          </div>
        </div>
      ))}
      <button onClick={addGrupo}
        className="flex items-center gap-1.5 text-sm text-primary border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/5 transition-colors w-full justify-center">
        <Plus className="w-4 h-4" /> Novo grupo de variação
      </button>
    </div>
  )
}

// ─── Extrai o path do storage a partir da URL pública ────────────────────────
const extractStoragePath = (url) => {
  try {
    const marker = "/storage/v1/object/public/produtos/"
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.slice(idx + marker.length))
  } catch { return null }
}

// ─── Editor de fotos múltiplas ────────────────────────────────────────────────
const FotosEditor = ({ fotos, onChange }) => {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    const urls = []
    for (const file of files) {
      const webpFile = await convertToWebp(file)
      const path = `produtos/${Date.now()}_${Math.random().toString(36).slice(2)}.webp`
      const { error } = await supabase.storage.from("produtos").upload(path, webpFile, { contentType: "image/webp" })
      if (!error) {
        const { data } = supabase.storage.from("produtos").getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    onChange([...fotos, ...urls])
    setUploading(false)
    // limpa o input para permitir reenvio do mesmo arquivo
    e.target.value = ""
  }

  const removePhoto = async (index) => {
    const url = fotos[index]
    const path = extractStoragePath(url)
    if (path) await supabase.storage.from("produtos").remove([path])
    onChange(fotos.filter((_, i) => i !== index))
  }

  // move foto para primeira posição (capa)
  const setAsCover = (index) => {
    if (index === 0) return
    const next = [...fotos]
    const [item] = next.splice(index, 1)
    next.unshift(item)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {/* grid de fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((url, i) => (
            <div key={url + i} className="relative group rounded-lg overflow-hidden border aspect-square bg-muted">
              <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />

              {/* badge capa */}
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-[#1A50A0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Capa
                </span>
              )}

              {/* ações no hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsCover(i)}
                    title="Definir como capa"
                    className="bg-white text-gray-800 text-[10px] font-bold px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    Capa
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  title="Remover foto"
                  className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* botão de upload */}
      <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
        <Upload className="w-4 h-4" />
        {uploading ? "Enviando..." : fotos.length > 0 ? "Adicionar mais fotos" : "Escolher fotos"}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>
      {fotos.length > 1 && (
        <p className="text-xs text-muted-foreground">A primeira foto é usada como capa no catálogo. Passe o mouse para reordenar.</p>
      )}
    </div>
  )
}

// ─── Modal principal ──────────────────────────────────────────────────────────
const ProductModal = ({ product, tipos, setores, categorias, onClose, onSaved }) => {
  const editing = !!product

  const [form, setForm] = useState({
    nome: product?.nome || "",
    descricao: product?.descricao || "",
    tipo_id: product?.tipo_id || "",
    categoria_id: product?.categoria_id || "",
    obs: product?.obs || "",
    ativo: product?.ativo ?? true,
  })

  const [variacoes, setVariacoes] = useState(
    product?.variacoes
      ? (typeof product.variacoes === "string" ? JSON.parse(product.variacoes) : product.variacoes)
      : []
  )

  const [selectedSetores, setSelectedSetores] = useState(
    product?.produto_setores?.map((ps) => ps.setor?.id).filter(Boolean) || []
  )

  // inicializa fotos: prioriza array fotos, senão usa foto_url legado
  const [fotos, setFotos] = useState(() => {
    if (product?.fotos?.length) return product.fotos
    if (product?.foto_url) return [product.foto_url]
    return []
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const toggleSetor = (id) =>
    setSelectedSetores((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])

  const handleSave = async () => {
    if (!form.nome.trim()) { setError("Nome obrigatório."); return }
    setSaving(true)
    setError("")

    const variacoesLimpas = variacoes
      .filter(g => g.label.trim())
      .map(g => ({ label: g.label.trim(), valores: g.valores.filter(v => v.trim()) }))

    const payload = {
      ...form,
      // mantém foto_url como a primeira foto para compatibilidade com Produto.jsx e Catalogo.jsx
      foto_url: fotos[0] || null,
      fotos,
      variacoes: variacoesLimpas,
      tipo_id: form.tipo_id === "" ? null : Number(form.tipo_id),
      categoria_id: form.categoria_id === "" ? null : Number(form.categoria_id),
    }

    let produtoId = product?.id

    if (editing) {
      const { error } = await supabase.from("produtos").update(payload).eq("id", produtoId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from("produtos").insert(payload).select().single()
      if (error) { setError(error.message); setSaving(false); return }
      produtoId = data.id
    }

    await supabase.from("produto_setores").delete().eq("produto_id", produtoId)
    if (selectedSetores.length > 0) {
      await supabase.from("produto_setores").insert(
        selectedSetores.map((setor_id) => ({ produto_id: produtoId, setor_id }))
      )
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
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-foreground">{editing ? "Editar produto" : "Novo produto"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nome</label>
            <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="ex: Marmita de alumínio 500ml" />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Descrição breve do produto" />
          </div>

          {/* Tipo + Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Tipo (material)</label>
              <select value={form.tipo_id} onChange={(e) => setForm({ ...form, tipo_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecione</option>
                {tipos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Categoria (produto)</label>
              <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecione</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          </div>

          {/* Setores */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Setores de atuação</label>
            <div className="flex flex-wrap gap-2">
              {setores.map((s) => (
                <button key={s.id} type="button" onClick={() => toggleSetor(s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedSetores.includes(s.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-secondary-foreground border-border"
                  }`}>{s.nome}</button>
              ))}
            </div>
          </div>

          {/* Variações */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Variações</label>
            <VariacoesEditor variacoes={variacoes} onChange={setVariacoes} />
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Observação</label>
            <input type="text" value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="ex: Disponível com ou sem tampa" />
          </div>

          {/* Fotos */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Fotos {fotos.length > 0 && <span className="text-muted-foreground font-normal">({fotos.length})</span>}
            </label>
            <FotosEditor fotos={fotos} onChange={setFotos} />
          </div>

          {/* Visível */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} className="rounded" />
            <span className="text-sm text-foreground">Produto visível no catálogo</span>
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex gap-3 p-5 border-t">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar produto"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg border text-foreground text-sm hover:bg-secondary transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductModal