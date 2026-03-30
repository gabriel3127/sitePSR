import { useState, useEffect } from "react"
import { X, Plus, Pencil, Trash2, Check, Link, Link2Off } from "lucide-react"
import { supabase } from "@/lib/supabase"

const slugify = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

// ─── Seção simples (setores) ──────────────────────────────────────────────────
const TaxonomySection = ({ title, table, items, onRefresh }) => {
  const [newNome, setNewNome] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editingNome, setEditingNome] = useState("")
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!newNome.trim()) return
    setSaving(true)
    await supabase.from(table).insert({ nome: newNome.trim(), slug: slugify(newNome) })
    setNewNome("")
    setSaving(false)
    onRefresh()
  }

  const handleEdit = async (id) => {
    if (!editingNome.trim()) return
    setSaving(true)
    await supabase.from(table).update({ nome: editingNome.trim(), slug: slugify(editingNome) }).eq("id", id)
    setEditingId(null)
    setEditingNome("")
    setSaving(false)
    onRefresh()
  }

  const handleDelete = async (id) => {
    if (!confirm("Excluir? Produtos associados perderão esse vínculo.")) return
    await supabase.from(table).delete().eq("id", id)
    onRefresh()
  }

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3">{title}</h3>
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg border bg-secondary/20">
            {editingId === item.id ? (
              <>
                <input autoFocus value={editingNome} onChange={(e) => setEditingNome(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEdit(item.id)}
                  className="flex-1 px-2 py-1 rounded border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <button onClick={() => handleEdit(item.id)} disabled={saving}
                  className="p-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1.5 rounded border hover:bg-secondary">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-foreground">{item.nome}</span>
                <span className="text-xs text-muted-foreground font-mono">{item.slug}</span>
                <button onClick={() => { setEditingId(item.id); setEditingNome(item.nome) }}
                  className="p-1.5 rounded border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newNome} onChange={(e) => setNewNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Novo item..."
          className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <button onClick={handleAdd} disabled={saving || !newNome.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
    </div>
  )
}

// ─── Seção de categorias com vínculos ─────────────────────────────────────────
const CategoriasSection = ({ categorias, subcategorias, catSubMap, onRefresh }) => {
  const [newNome, setNewNome] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editingNome, setEditingNome] = useState("")
  const [expandedId, setExpandedId] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!newNome.trim()) return
    setSaving(true)
    await supabase.from("categorias").insert({ nome: newNome.trim(), slug: slugify(newNome) })
    setNewNome("")
    setSaving(false)
    onRefresh()
  }

  const handleEdit = async (id) => {
    if (!editingNome.trim()) return
    setSaving(true)
    await supabase.from("categorias").update({ nome: editingNome.trim(), slug: slugify(editingNome) }).eq("id", id)
    setEditingId(null)
    setSaving(false)
    onRefresh()
  }

  const handleDelete = async (id) => {
    if (!confirm("Excluir categoria? Produtos associados perderão esse vínculo.")) return
    await supabase.from("categorias").delete().eq("id", id)
    onRefresh()
  }

  const toggleVinculo = async (catId, subId, isLinked) => {
    if (isLinked) {
      await supabase.from("categoria_subcategorias")
        .delete().eq("categoria_id", catId).eq("subcategoria_id", subId)
    } else {
      await supabase.from("categoria_subcategorias")
        .insert({ categoria_id: catId, subcategoria_id: subId })
    }
    onRefresh()
  }

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-1">Categoria (material)</h3>
      <p className="text-xs text-muted-foreground mb-3">Clique em uma categoria para gerenciar quais subcategorias ela contém.</p>
      <div className="space-y-2 mb-4">
        {categorias.map((cat) => {
          const linkedIds = catSubMap[cat.id] || []
          const isExpanded = expandedId === cat.id
          return (
            <div key={cat.id} className="rounded-lg border bg-secondary/20 overflow-hidden">
              <div className="flex items-center gap-2 p-2">
                {editingId === cat.id ? (
                  <>
                    <input autoFocus value={editingNome} onChange={(e) => setEditingNome(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEdit(cat.id)}
                      className="flex-1 px-2 py-1 rounded border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <button onClick={() => handleEdit(cat.id)} disabled={saving}
                      className="p-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded border hover:bg-secondary">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-foreground font-medium">{cat.nome}</span>
                    <span className="text-xs text-muted-foreground font-mono">{cat.slug}</span>
                    {linkedIds.length > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        {linkedIds.length} sub
                      </span>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                      title="Gerenciar subcategorias vinculadas"
                      className={`p-1.5 rounded border transition-colors ${isExpanded ? "bg-primary text-primary-foreground border-primary" : "hover:bg-secondary text-muted-foreground hover:text-foreground"}`}>
                      <Link className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setEditingId(cat.id); setEditingNome(cat.nome) }}
                      className="p-1.5 rounded border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* painel de vínculos */}
              {isExpanded && (
                <div className="border-t px-3 py-2.5 bg-background/50">
                  <p className="text-xs text-muted-foreground mb-2">Subcategorias disponíveis nesta categoria:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {subcategorias.map(sub => {
                      const linked = linkedIds.includes(sub.id)
                      return (
                        <button key={sub.id}
                          onClick={() => toggleVinculo(cat.id, sub.id, linked)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                            linked
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                          }`}>
                          {linked ? <Link className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
                          {sub.nome}
                        </button>
                      )
                    })}
                    {subcategorias.length === 0 && (
                      <p className="text-xs text-muted-foreground">Nenhuma subcategoria cadastrada ainda.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newNome} onChange={(e) => setNewNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nova categoria..."
          className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <button onClick={handleAdd} disabled={saving || !newNome.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
    </div>
  )
}

// ─── Modal principal ──────────────────────────────────────────────────────────
const TaxonomyModal = ({ onClose }) => {
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [setores, setSetores] = useState([])
  const [catSubMap, setCatSubMap] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    const [{ data: cats }, { data: subs }, { data: set }, { data: csLinks }] = await Promise.all([
      supabase.from("categorias").select("*").order("nome"),
      supabase.from("subcategorias").select("*").order("nome"),
      supabase.from("setores").select("*").order("nome"),
      supabase.from("categoria_subcategorias").select("categoria_id, subcategoria_id"),
    ])

    const csMap = {}
    for (const cs of (csLinks || [])) {
      if (!csMap[cs.categoria_id]) csMap[cs.categoria_id] = []
      csMap[cs.categoria_id].push(cs.subcategoria_id)
    }

    setCategorias(cats || [])
    setSubcategorias(subs || [])
    setSetores(set || [])
    setCatSubMap(csMap)
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-foreground">Categorias, subcategorias e setores</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-muted rounded-lg" />)}
          </div>
        ) : (
          <div className="p-5 space-y-8">
            <CategoriasSection
              categorias={categorias}
              subcategorias={subcategorias}
              catSubMap={catSubMap}
              onRefresh={fetchAll}
            />
            <div className="border-t" />
            <TaxonomySection title="Subcategoria (produto)" table="subcategorias" items={subcategorias} onRefresh={fetchAll} />
            <div className="border-t" />
            <TaxonomySection title="Setores" table="setores" items={setores} onRefresh={fetchAll} />
          </div>
        )}

        <div className="p-5 border-t">
          <button onClick={onClose} className="w-full py-2.5 rounded-lg border text-foreground text-sm hover:bg-secondary transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaxonomyModal