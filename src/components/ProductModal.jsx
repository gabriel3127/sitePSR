import { useState, useMemo } from "react"
import { X, Upload, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { convertToWebp } from "@/lib/convertToWebp"

const VariacoesEditor = ({ variacoes, fotos, onChange }) => {
  const addGrupo = () => onChange([...variacoes, { label: "", valores: [""], fotos: {}, desativados: [] }])
  const removeGrupo = (gi) => onChange(variacoes.filter((_, i) => i !== gi))
  const updateLabel = (gi, val) => onChange(variacoes.map((g, i) => i === gi ? { ...g, label: val } : g))
  const addValor = (gi) => onChange(variacoes.map((g, i) => i === gi ? { ...g, valores: [...g.valores, ""] } : g))
  const removeValor = (gi, vi) => onChange(variacoes.map((g, i) => i === gi ? { ...g, valores: g.valores.filter((_, j) => j !== vi) } : g))
  const updateValor = (gi, vi, val) => onChange(variacoes.map((g, i) => i === gi ? { ...g, valores: g.valores.map((v, j) => j === vi ? val : v) } : g))

  const toggleDesativado = (gi, val) => {
    onChange(variacoes.map((g, i) => {
      if (i !== gi) return g
      const desativados = g.desativados || []
      const next = desativados.includes(val)
        ? desativados.filter(v => v !== val)
        : [...desativados, val]
      return { ...g, desativados: next }
    }))
  }

  const setFotoValor = (gi, valor, fotoIdx) => {
    onChange(variacoes.map((g, i) => {
      if (i !== gi) return g
      const novasFotos = { ...(g.fotos || {}) }
      if (fotoIdx === null) delete novasFotos[valor]
      else novasFotos[valor] = fotoIdx
      return { ...g, fotos: novasFotos }
    }))
  }

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
          <div className="space-y-2 pl-2">
            {grupo.valores.map((val, vi) => {
              const fotoIdx = grupo.fotos?.[val] ?? null
              const isDesativado = (grupo.desativados || []).includes(val)
              return (
                <div key={vi} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input type="text" value={val} onChange={(e) => updateValor(gi, vi, e.target.value)}
                      placeholder="ex: Vermelho, 500ml..."
                      className={`flex-1 px-2 py-1.5 rounded border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${isDesativado ? "opacity-40 line-through" : ""}`} />
                    {/* toggle ativar/desativar valor */}
                    {val.trim() && (
                      <button
                        type="button"
                        onClick={() => toggleDesativado(gi, val)}
                        title={isDesativado ? "Ativar esta opção" : "Desativar esta opção"}
                        className={`px-2 py-1.5 rounded border text-[11px] font-medium transition-colors flex-shrink-0 ${
                          isDesativado
                            ? "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                            : "border-amber-300 text-amber-600 hover:bg-amber-50"
                        }`}>
                        {isDesativado ? "Ativar" : "Desativar"}
                      </button>
                    )}
                    <button onClick={() => removeValor(gi, vi)}
                      className="p-1.5 rounded border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-30"
                      disabled={grupo.valores.length === 1}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* vinculação de foto */}
                  {fotos.length > 0 && val.trim() && (
                    <div className="flex items-center gap-2 pl-1">
                      <span className="text-[11px] text-muted-foreground">Foto:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {fotos.map((url, fi) => (
                          <button
                            key={fi}
                            type="button"
                            onClick={() => setFotoValor(gi, val, fotoIdx === fi ? null : fi)}
                            className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                              fotoIdx === fi
                                ? "border-primary shadow-sm"
                                : "border-transparent opacity-50 hover:opacity-80"
                            }`}
                            title={fotoIdx === fi ? "Foto vinculada — clique para desvincular" : `Vincular foto ${fi + 1}`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                        {fotoIdx !== null && (
                          <button
                            type="button"
                            onClick={() => setFotoValor(gi, val, null)}
                            className="text-[10px] text-destructive hover:underline self-center"
                          >
                            remover
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
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

const CombinacoesEditor = ({ variacoes, combinacoes, onChange }) => {
  const [filtroIdx, setFiltroIdx] = useState(0)
  const g0 = variacoes[0]
  const g1 = variacoes[1]
  const g2 = variacoes[2] || null
  const comboSet = useMemo(() => new Set((combinacoes || []).map(c => c.join("|||"))), [combinacoes])
  const isValid = (vals) => combinacoes === null || comboSet.has(vals.join("|||"))
  const filtroAtual = g2 ? g2.valores[filtroIdx] : null
  const totalPossivel = g2 ? g0.valores.length * g1.valores.length * g2.valores.length : g0.valores.length * g1.valores.length
  const totalValidas = combinacoes === null ? totalPossivel : combinacoes.length

  const toggle = (vals) => {
    const key = vals.join("|||")
    if (combinacoes === null) {
      const todas = []
      g0.valores.forEach(v0 => g1.valores.forEach(v1 => {
        if (g2) g2.valores.forEach(v2 => { const k = [v0,v1,v2].join("|||"); if (k !== key) todas.push([v0,v1,v2]) })
        else { const k = [v0,v1].join("|||"); if (k !== key) todas.push([v0,v1]) }
      }))
      onChange(todas)
    } else {
      if (comboSet.has(key)) onChange(combinacoes.filter(c => c.join("|||") !== key))
      else onChange([...combinacoes, vals])
    }
  }

  const marcarFiltro = () => {
    const base = (combinacoes || []).filter(c => !filtroAtual || c[2] !== filtroAtual)
    g0.valores.forEach(v0 => g1.valores.forEach(v1 => base.push(filtroAtual ? [v0,v1,filtroAtual] : [v0,v1])))
    onChange(base)
  }

  const desmarcarFiltro = () => {
    if (combinacoes === null) {
      const todas = []
      g0.valores.forEach(v0 => g1.valores.forEach(v1 => {
        if (g2) g2.valores.forEach(v2 => { if (v2 !== filtroAtual) todas.push([v0,v1,v2]) })
      }))
      onChange(todas)
    } else {
      onChange(combinacoes.filter(c => filtroAtual ? c[2] !== filtroAtual : false))
    }
  }

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-secondary/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground">Combinações válidas</p>
          <p className="text-xs text-muted-foreground mt-0.5">{totalValidas} de {totalPossivel} ativas</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => onChange(null)} className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:bg-secondary transition-colors">Todas</button>
          <button onClick={() => onChange([])} className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:bg-secondary transition-colors">Nenhuma</button>
        </div>
      </div>

      {g2 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Filtrar por {g2.label}:</p>
          <div className="flex gap-1.5 flex-wrap">
            {g2.valores.map((v, i) => (
              <button key={v} onClick={() => setFiltroIdx(i)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filtroIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                {v}
              </button>
            ))}
          </div>
          <div className="flex gap-2 text-xs">
            <button onClick={marcarFiltro} className="text-primary hover:underline">Marcar "{filtroAtual}"</button>
            <span className="text-muted-foreground">·</span>
            <button onClick={desmarcarFiltro} className="text-destructive hover:underline">Desmarcar "{filtroAtual}"</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium min-w-[80px]">{g0.label} / {g1.label}</th>
              {g1.valores.map(v1 => <th key={v1} className="text-center py-1.5 px-2 text-muted-foreground font-medium whitespace-nowrap">{v1}</th>)}
            </tr>
          </thead>
          <tbody>
            {g0.valores.map(v0 => (
              <tr key={v0} className="border-t border-border/30">
                <td className="py-1.5 pr-3 font-medium text-foreground whitespace-nowrap">{v0}</td>
                {g1.valores.map(v1 => {
                  const vals = filtroAtual ? [v0,v1,filtroAtual] : [v0,v1]
                  const on = isValid(vals)
                  return (
                    <td key={v1} className="text-center py-1.5 px-2">
                      <button onClick={() => toggle(vals)}
                        className={`w-6 h-6 rounded border-2 mx-auto flex items-center justify-center transition-colors ${on ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background"}`}>
                        {on && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const extractStoragePath = (url) => {
  try {
    const marker = "/storage/v1/object/public/produtos/"
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.slice(idx + marker.length))
  } catch { return null }
}

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
      if (!error) { const { data } = supabase.storage.from("produtos").getPublicUrl(path); urls.push(data.publicUrl) }
    }
    onChange([...fotos, ...urls]); setUploading(false); e.target.value = ""
  }
  const removePhoto = async (index) => {
    const path = extractStoragePath(fotos[index])
    if (path) await supabase.storage.from("produtos").remove([path])
    onChange(fotos.filter((_, i) => i !== index))
  }
  const setAsCover = (index) => {
    if (index === 0) return
    const next = [...fotos]; const [item] = next.splice(index, 1); next.unshift(item); onChange(next)
  }
  return (
    <div className="space-y-3">
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((url, i) => (
            <div key={url+i} className="relative group rounded-lg overflow-hidden border aspect-square bg-muted">
              <img src={url} alt={`foto ${i+1}`} className="w-full h-full object-cover" />
              {i === 0 && <span className="absolute top-1 left-1 bg-[#1A50A0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Capa</span>}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i !== 0 && <button type="button" onClick={() => setAsCover(i)} className="bg-white text-gray-800 text-[10px] font-bold px-2 py-1 rounded">Capa</button>}
                <button type="button" onClick={() => removePhoto(i)} className="bg-red-500 text-white p-1.5 rounded"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
        <Upload className="w-4 h-4" />
        {uploading ? "Enviando..." : fotos.length > 0 ? "Adicionar mais fotos" : "Escolher fotos"}
        <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
      </label>
    </div>
  )
}

const ProductModal = ({ product, categorias, subcategorias, catSubMap, setores, onClose, onSaved }) => {
  const editing = !!product

  const [form, setForm] = useState({
    nome: product?.nome || "",
    descricao: product?.descricao || "",
    categoria_id: product?.categoria_id || "",      // ex-tipo_id
    subcategoria_id: product?.subcategoria_id || "", // ex-categoria_id
    obs: product?.obs || "",
    ativo: product?.ativo ?? true,
  })

  const parseVariacoes = () => {
    const raw = product?.variacoes
    if (!raw) return { grupos: [], combinacoes: null }
    const data = typeof raw === "string" ? JSON.parse(raw) : raw
    if (Array.isArray(data)) return { grupos: data, combinacoes: null }
    return { grupos: data.grupos || [], combinacoes: data.combinacoes ?? null }
  }

  const parsed = parseVariacoes()
  const [variacoes, setVariacoes] = useState(parsed.grupos)
  const [combinacoes, setCombinacoes] = useState(parsed.combinacoes)
  const [showCombinacoes, setShowCombinacoes] = useState(false)

  const [selectedSetores, setSelectedSetores] = useState(
    product?.produto_setores?.map((ps) => ps.setor?.id).filter(Boolean) || []
  )
  const [fotos, setFotos] = useState(() => {
    if (product?.fotos?.length) return product.fotos
    if (product?.foto_url) return [product.foto_url]
    return []
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const toggleSetor = (id) => setSelectedSetores((prev) => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const handleVariacoesChange = (novas) => {
    setVariacoes(novas)
    if (novas.length < 2) setCombinacoes(null)
  }

  const gruposValidos = variacoes.filter(g => g.label.trim() && g.valores.some(v => v.trim()))

  const handleSave = async () => {
    if (!form.nome.trim()) { setError("Nome obrigatório."); return }
    setSaving(true); setError("")

    const variacoesLimpas = variacoes
      .filter(g => g.label.trim())
      .map(g => ({
        label: g.label.trim(),
        valores: g.valores.filter(v => v.trim()),
        fotos: g.fotos || {},
        desativados: (g.desativados || []).filter(v => g.valores.includes(v))
      }))

    const variacoesPayload = variacoesLimpas.length >= 2
      ? { grupos: variacoesLimpas, combinacoes }
      : variacoesLimpas

    const payload = {
      ...form,
      foto_url: fotos[0] || null, fotos,
      variacoes: variacoesPayload,
      categoria_id: form.categoria_id === "" ? null : Number(form.categoria_id),
      subcategoria_id: form.subcategoria_id === "" ? null : Number(form.subcategoria_id),
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
      await supabase.from("produto_setores").insert(selectedSetores.map(setor_id => ({ produto_id: produtoId, setor_id })))
    }

    setSaving(false); onSaved(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-foreground">{editing ? "Editar produto" : "Novo produto"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nome</label>
            <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="ex: Marmita de alumínio 500ml" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Descrição breve do produto" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Categoria (material)</label>
              <select value={form.categoria_id}
                onChange={(e) => setForm({ ...form, categoria_id: e.target.value, subcategoria_id: "" })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecione</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Subcategoria (produto)</label>
              <select value={form.subcategoria_id}
                onChange={(e) => setForm({ ...form, subcategoria_id: e.target.value })}
                disabled={!form.categoria_id}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
                <option value="">{form.categoria_id ? "Selecione" : "Selecione a categoria primeiro"}</option>
                {(form.categoria_id
                  ? subcategorias.filter(s =>
                      (catSubMap[Number(form.categoria_id)] || []).includes(s.id)
                    )
                  : []
                ).map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Setores de atuação</label>
            <div className="flex flex-wrap gap-2">
              {setores.map((s) => (
                <button key={s.id} type="button" onClick={() => toggleSetor(s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedSetores.includes(s.id) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border"}`}>
                  {s.nome}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Variações</label>
            <VariacoesEditor variacoes={variacoes} fotos={fotos} onChange={handleVariacoesChange} />
          </div>

          {gruposValidos.length >= 2 && (
            <div className="space-y-2">
              <button type="button" onClick={() => setShowCombinacoes(v => !v)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                {showCombinacoes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Gerenciar combinações válidas
                <span className="text-xs font-normal text-muted-foreground">
                  {combinacoes === null ? "(todas válidas)" : `(${combinacoes.length} definidas)`}
                </span>
              </button>
              {showCombinacoes && (
                <CombinacoesEditor variacoes={gruposValidos} combinacoes={combinacoes} onChange={setCombinacoes} />
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Observação</label>
            <input type="text" value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="ex: Disponível com ou sem tampa" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Fotos {fotos.length > 0 && <span className="text-muted-foreground font-normal">({fotos.length})</span>}
            </label>
            <FotosEditor fotos={fotos} onChange={setFotos} />
          </div>

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