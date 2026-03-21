import { useState, useEffect } from "react"
import { X, Plus, Pencil, Trash2, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"

const slugify = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

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
    if (!confirm(`Excluir? Produtos associados perderão esse vínculo.`)) return
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
          placeholder={`Novo item...`}
          className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <button onClick={handleAdd} disabled={saving || !newNome.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
    </div>
  )
}

const TaxonomyModal = ({ onClose }) => {
  const [tipos, setTipos] = useState([])
  const [setores, setSetores] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    const [{ data: t }, { data: s }, { data: c }] = await Promise.all([
      supabase.from("tipos").select("*").order("nome"),
      supabase.from("setores").select("*").order("nome"),
      supabase.from("categorias").select("*").order("nome"),
    ])
    setTipos(t || [])
    setSetores(s || [])
    setCategorias(c || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-foreground">Tipos, categorias e setores</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-muted rounded-lg" />)}
          </div>
        ) : (
          <div className="p-5 space-y-8">
            <TaxonomySection title="Categorias (produto)" table="categorias" items={categorias} onRefresh={fetchAll} />
            <div className="border-t" />
            <TaxonomySection title="Tipos (material)" table="tipos" items={tipos} onRefresh={fetchAll} />
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