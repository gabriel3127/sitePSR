import { useState, useEffect } from "react"
import { X, Plus, Trash2, Copy, Check, ExternalLink } from "lucide-react"
import { supabase } from "@/lib/supabase"

const slugify = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

const SITE_URL = "https://psrembalagens.com.br"

const VendedoresModal = ({ onClose }) => {
  const [vendedores, setVendedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [copiedId, setCopiedId] = useState(null)

  // form novo vendedor
  const [form, setForm] = useState({ nome: "", whatsapp: "" })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchVendedores() }, [])

  const fetchVendedores = async () => {
    setLoading(true)
    const { data } = await supabase.from("vendedores").select("*").order("nome")
    setVendedores(data || [])
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!form.nome.trim()) { setError("Nome obrigatório."); return }
    if (!form.whatsapp.trim()) { setError("WhatsApp obrigatório."); return }

    const whatsapp = form.whatsapp.replace(/\D/g, "")
    if (whatsapp.length < 10) { setError("WhatsApp inválido. Use somente números com DDD."); return }

    setSaving(true); setError("")
    const slug = slugify(form.nome)
    const { error } = await supabase.from("vendedores").insert({ nome: form.nome.trim(), slug, whatsapp })
    if (error) {
      setError(error.code === "23505" ? "Já existe um vendedor com esse nome." : error.message)
      setSaving(false); return
    }
    setForm({ nome: "", whatsapp: "" })
    setShowForm(false)
    await fetchVendedores()
    setSaving(false)
  }

  const handleDelete = async (id, nome) => {
    if (!confirm(`Excluir vendedor "${nome}"? O link dele vai parar de funcionar.`)) return
    await supabase.from("vendedores").delete().eq("id", id)
    await fetchVendedores()
  }

  const handleToggleAtivo = async (id, ativo) => {
    await supabase.from("vendedores").update({ ativo: !ativo }).eq("id", id)
    await fetchVendedores()
  }

  const copyLink = (slug) => {
    const link = `${SITE_URL}/catalogo?v=${slug}`
    navigator.clipboard.writeText(link)
    setCopiedId(slug)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatWa = (wa) => {
    const n = wa.replace(/\D/g, "")
    if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
    if (n.length === 13) return `+${n.slice(0,2)} (${n.slice(2,4)}) ${n.slice(4,9)}-${n.slice(9)}`
    return wa
  }

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-background border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-bold text-foreground">Catálogos de Vendedores</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Cada vendedor tem um link único que envia pedidos para o WhatsApp dele</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">

          {/* lista de vendedores */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : vendedores.length === 0 && !showForm ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">Nenhum vendedor cadastrado.</p>
              <p className="text-xs text-muted-foreground mt-1">Adicione vendedores para criar links personalizados.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {vendedores.map(v => (
                <div key={v.id} className={`border rounded-xl p-4 transition-colors ${v.ativo ? "bg-card" : "bg-muted/30 opacity-60"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-sm">{v.nome}</p>
                        {!v.ativo && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">inativo</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatWa(v.whatsapp)}</p>
                      {/* link copiável */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-xs text-muted-foreground font-mono truncate max-w-[220px]">
                          /catalogo?v={v.slug}
                        </span>
                        <button onClick={() => copyLink(v.slug)}
                          className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 flex-shrink-0 transition-colors">
                          {copiedId === v.slug
                            ? <><Check className="w-3 h-3" /> copiado</>
                            : <><Copy className="w-3 h-3" /> copiar</>}
                        </button>
                        <a href={`/catalogo?v=${v.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => handleToggleAtivo(v.id, v.ativo)}
                        className="text-xs text-muted-foreground hover:text-foreground border rounded px-2 py-1 transition-colors">
                        {v.ativo ? "desativar" : "ativar"}
                      </button>
                      <button onClick={() => handleDelete(v.id, v.nome)}
                        className="text-destructive hover:text-destructive/80 border border-destructive/30 rounded p-1 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* form novo vendedor */}
          {showForm ? (
            <div className="border rounded-xl p-4 space-y-3 bg-secondary/20">
              <p className="text-sm font-semibold text-foreground">Novo vendedor</p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Nome</label>
                <input type="text" value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="ex: João Silva"
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {form.nome && (
                  <p className="text-xs text-muted-foreground">Link: /catalogo?v=<strong>{slugify(form.nome)}</strong></p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">WhatsApp</label>
                <input type="tel" value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="5561999999999 (com código do país)"
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <p className="text-xs text-muted-foreground">Somente números. Ex: 5561993177107</p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {saving ? "Salvando..." : "Adicionar vendedor"}
                </button>
                <button onClick={() => { setShowForm(false); setError(""); setForm({ nome: "", whatsapp: "" }) }}
                  className="px-4 py-2 rounded-lg border text-sm hover:bg-secondary transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Plus className="w-4 h-4" /> Adicionar vendedor
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VendedoresModal