'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { convertToWebp } from '@/lib/convertToWebp'
import {
  Plus, Users, LogOut, Pencil, Trash2, X, Copy, Check,
  ExternalLink, ToggleLeft, ToggleRight, Settings, Link, Link2Off,
  Upload, ChevronDown, ChevronUp
} from 'lucide-react'
import type { ProdutoComRelacoes, Setor, Categoria, Subcategoria, Vendedor } from '@/lib/types'

// ─── helpers ──────────────────────────────────────────────────────────────────
function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function extractStoragePath(url: string): string | null {
  try {
    const marker = '/storage/v1/object/public/produtos/'
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.slice(idx + marker.length))
  } catch { return null }
}

// ─── tipos ────────────────────────────────────────────────────────────────────
type VariacaoGrupo = { label: string; valores: string[]; fotos: Record<string, number>; desativados: string[] }
type FormProduto = {
  id?: number
  nome: string; descricao: string; obs: string
  categoria_id: string; subcategoria_id: string
  ativo: boolean;
  setorIds: number[]
  variacoes: VariacaoGrupo[]
  combinacoes: string[][] | null
}
const EMPTY_PRODUTO: FormProduto = {
  nome: '', descricao: '', obs: '',
  categoria_id: '', subcategoria_id: '',
  ativo: true,
  setorIds: [], variacoes: [], combinacoes: null,
}

type FormVendedor = { id?: string; nome: string; slug: string; whatsapp: string; ativo: boolean }
const EMPTY_VENDEDOR: FormVendedor = { nome: '', slug: '', whatsapp: '', ativo: true }

type Props = {
  setores: Setor[]
  categorias: Categoria[]
  subcategorias: Subcategoria[]
  produtoParaEditar: ProdutoComRelacoes | null
  onProdutoAtualizado: (p: ProdutoComRelacoes) => void
  onProdutoRemovido: (id: number) => void
  onProdutoAdicionado: (p: ProdutoComRelacoes) => void
  onEditarFechado: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOTOS EDITOR
// ═══════════════════════════════════════════════════════════════════════════════
function FotosEditor({ fotos, onChange }: { fotos: string[]; onChange: (f: string[]) => void }) {
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    const urls: string[] = []
    for (const file of files) {
      const webpFile = await convertToWebp(file)
      const path = `produtos/${Date.now()}_${Math.random().toString(36).slice(2)}.webp`
      const { error } = await supabase.storage.from('produtos').upload(path, webpFile, { contentType: 'image/webp' })
      if (!error) {
        const { data } = supabase.storage.from('produtos').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    onChange([...fotos, ...urls])
    setUploading(false)
    e.target.value = ''
  }

  async function removePhoto(index: number) {
    const path = extractStoragePath(fotos[index])
    if (path) await supabase.storage.from('produtos').remove([path])
    onChange(fotos.filter((_, i) => i !== index))
  }

  function setAsCover(index: number) {
    if (index === 0) return
    const next = [...fotos]
    const [item] = next.splice(index, 1)
    next.unshift(item)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((url, i) => (
            <div key={url + i} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-[#1A50A0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Capa</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i !== 0 && (
                  <button type="button" onClick={() => setAsCover(i)}
                    className="bg-white text-gray-800 text-[10px] font-bold px-2 py-1 rounded">Capa</button>
                )}
                <button type="button" onClick={() => removePhoto(i)}
                  className="bg-red-500 text-white p-1.5 rounded">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors">
        <Upload className="w-4 h-4" />
        {uploading ? 'Enviando...' : fotos.length > 0 ? 'Adicionar mais fotos' : 'Escolher fotos'}
        <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
      </label>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIAÇÕES EDITOR
// ═══════════════════════════════════════════════════════════════════════════════
function VariacoesEditor({ variacoes, fotos, onChange }: {
  variacoes: VariacaoGrupo[]
  fotos: string[]
  onChange: (v: VariacaoGrupo[]) => void
}) {
  const addGrupo = () => onChange([...variacoes, { label: '', valores: [''], fotos: {}, desativados: [] }])
  const removeGrupo = (gi: number) => onChange(variacoes.filter((_, i) => i !== gi))
  const updateLabel = (gi: number, val: string) => onChange(variacoes.map((g, i) => i === gi ? { ...g, label: val } : g))
  const addValor = (gi: number) => onChange(variacoes.map((g, i) => i === gi ? { ...g, valores: [...g.valores, ''] } : g))
  const removeValor = (gi: number, vi: number) => onChange(variacoes.map((g, i) => i === gi ? { ...g, valores: g.valores.filter((_, j) => j !== vi) } : g))
  const updateValor = (gi: number, vi: number, val: string) => onChange(variacoes.map((g, i) => i === gi ? { ...g, valores: g.valores.map((v, j) => j === vi ? val : v) } : g))

  const toggleDesativado = (gi: number, val: string) => {
    onChange(variacoes.map((g, i) => {
      if (i !== gi) return g
      const d = g.desativados || []
      return { ...g, desativados: d.includes(val) ? d.filter(v => v !== val) : [...d, val] }
    }))
  }

  const setFotoValor = (gi: number, valor: string, fotoIdx: number | null) => {
    onChange(variacoes.map((g, i) => {
      if (i !== gi) return g
      const nf = { ...(g.fotos || {}) }
      if (fotoIdx === null) delete nf[valor]
      else nf[valor] = fotoIdx
      return { ...g, fotos: nf }
    }))
  }

  return (
    <div className="space-y-3">
      {variacoes.map((grupo, gi) => (
        <div key={gi} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
          <div className="flex items-center gap-2">
            <input type="text" value={grupo.label} onChange={e => updateLabel(gi, e.target.value)}
              placeholder="Nome do grupo (ex: Tamanho, Cor)"
              className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30" />
            <button onClick={() => removeGrupo(gi)}
              className="p-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50">
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
                    <input type="text" value={val} onChange={e => updateValor(gi, vi, e.target.value)}
                      placeholder="ex: P, M, G..."
                      className={`flex-1 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 ${isDesativado ? 'opacity-40 line-through' : ''}`} />
                    {val.trim() && (
                      <button type="button" onClick={() => toggleDesativado(gi, val)}
                        className={`px-2 py-1.5 rounded border text-[11px] font-medium transition-colors flex-shrink-0 ${
                          isDesativado ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-50' : 'border-amber-300 text-amber-600 hover:bg-amber-50'
                        }`}>
                        {isDesativado ? 'Ativar' : 'Desativar'}
                      </button>
                    )}
                    <button onClick={() => removeValor(gi, vi)}
                      className="p-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-30"
                      disabled={grupo.valores.length === 1}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {fotos.length > 0 && val.trim() && (
                    <div className="flex items-center gap-2 pl-1">
                      <span className="text-[11px] text-gray-400">Foto:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {fotos.map((url, fi) => (
                          <button key={fi} type="button"
                            onClick={() => setFotoValor(gi, val, fotoIdx === fi ? null : fi)}
                            className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                              fotoIdx === fi ? 'border-[#1A50A0] shadow-sm' : 'border-transparent opacity-50 hover:opacity-80'
                            }`}>
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                        {fotoIdx !== null && (
                          <button type="button" onClick={() => setFotoValor(gi, val, null)}
                            className="text-[10px] text-red-500 hover:underline self-center">
                            remover
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <button onClick={() => addValor(gi)} className="flex items-center gap-1 text-xs text-[#1A50A0] hover:underline mt-1">
              <Plus className="w-3 h-3" /> Adicionar opção
            </button>
          </div>
        </div>
      ))}
      <button onClick={addGrupo}
        className="flex items-center gap-1.5 text-sm text-[#1A50A0] border border-[#1A50A0]/30 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors w-full justify-center">
        <Plus className="w-4 h-4" /> Novo grupo de variação
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINAÇÕES EDITOR
// ═══════════════════════════════════════════════════════════════════════════════
function CombinacoesEditor({ variacoes, combinacoes, onChange }: {
  variacoes: VariacaoGrupo[]
  combinacoes: string[][] | null
  onChange: (c: string[][] | null) => void
}) {
  const [filtroIdx, setFiltroIdx] = useState(0)
  const g0 = variacoes[0], g1 = variacoes[1], g2 = variacoes[2] ?? null
  const comboSet = new Set((combinacoes ?? []).map(c => c.join('|||')))
  const isValid = (vals: string[]) => combinacoes === null || comboSet.has(vals.join('|||'))
  const filtroAtual = g2 ? g2.valores[filtroIdx] : null
  const totalPossivel = g2 ? g0.valores.length * g1.valores.length * g2.valores.length : g0.valores.length * g1.valores.length
  const totalValidas = combinacoes === null ? totalPossivel : combinacoes.length

  const toggle = (vals: string[]) => {
    const key = vals.join('|||')
    if (combinacoes === null) {
      const todas: string[][] = []
      g0.valores.forEach(v0 => g1.valores.forEach(v1 => {
        if (g2) g2.valores.forEach(v2 => { if ([v0,v1,v2].join('|||') !== key) todas.push([v0,v1,v2]) })
        else { if ([v0,v1].join('|||') !== key) todas.push([v0,v1]) }
      }))
      onChange(todas)
    } else {
      if (comboSet.has(key)) onChange(combinacoes.filter(c => c.join('|||') !== key))
      else onChange([...combinacoes, vals])
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-800">Combinações válidas</p>
          <p className="text-xs text-gray-400 mt-0.5">{totalValidas} de {totalPossivel} ativas</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => onChange(null)} className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-100">Todas</button>
          <button onClick={() => onChange([])} className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-100">Nenhuma</button>
        </div>
      </div>
      {g2 && (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400">Filtrar por {g2.label}:</p>
          <div className="flex gap-1.5 flex-wrap">
            {g2.valores.map((v, i) => (
              <button key={v} onClick={() => setFiltroIdx(i)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filtroIdx === i ? 'bg-[#1A50A0] text-white border-[#1A50A0]' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left py-1.5 pr-3 text-gray-400 font-medium">{g0.label} / {g1.label}</th>
              {g1.valores.map(v1 => <th key={v1} className="text-center py-1.5 px-2 text-gray-400 font-medium whitespace-nowrap">{v1}</th>)}
            </tr>
          </thead>
          <tbody>
            {g0.valores.map(v0 => (
              <tr key={v0} className="border-t border-gray-100">
                <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap">{v0}</td>
                {g1.valores.map(v1 => {
                  const vals = filtroAtual ? [v0, v1, filtroAtual] : [v0, v1]
                  const on = isValid(vals)
                  return (
                    <td key={v1} className="text-center py-1.5 px-2">
                      <button onClick={() => toggle(vals)}
                        className={`w-6 h-6 rounded border-2 mx-auto flex items-center justify-center transition-colors ${on ? 'bg-[#1A50A0] border-[#1A50A0] text-white' : 'border-gray-200 bg-white'}`}>
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

// ═══════════════════════════════════════════════════════════════════════════════
// TAXONOMY SECTION (setores / subcategorias)
// ═══════════════════════════════════════════════════════════════════════════════
function TaxonomySection({ title, table, items, onRefresh }: {
  title: string; table: string
  items: { id: number; nome: string; slug: string }[]
  onRefresh: () => void
}) {
  const [newNome, setNewNome] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingNome, setEditingNome] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!newNome.trim()) return
    setSaving(true)
    await supabase.from(table).insert({ nome: newNome.trim(), slug: slugify(newNome) })
    setNewNome(''); setSaving(false); onRefresh()
  }
  async function handleEdit(id: number) {
    if (!editingNome.trim()) return
    setSaving(true)
    await supabase.from(table).update({ nome: editingNome.trim(), slug: slugify(editingNome) }).eq('id', id)
    setEditingId(null); setEditingNome(''); setSaving(false); onRefresh()
  }
  async function handleDelete(id: number) {
    if (!confirm('Excluir? Produtos associados perderão esse vínculo.')) return
    await supabase.from(table).delete().eq('id', id); onRefresh()
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2 mb-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-gray-50">
            {editingId === item.id ? (
              <>
                <input autoFocus value={editingNome} onChange={e => setEditingNome(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEdit(item.id)}
                  className="flex-1 px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30" />
                <button onClick={() => handleEdit(item.id)} disabled={saving} className="p-1.5 rounded bg-[#1A50A0] text-white"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => setEditingId(null)} className="p-1.5 rounded border hover:bg-gray-100"><X className="w-3.5 h-3.5" /></button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-800">{item.nome}</span>
                <span className="text-xs text-gray-400 font-mono">{item.slug}</span>
                <button onClick={() => { setEditingId(item.id); setEditingNome(item.nome) }} className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-400"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newNome} onChange={e => setNewNome(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Novo item..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
        <button onClick={handleAdd} disabled={saving || !newNome.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1A50A0] text-white text-sm font-medium hover:bg-[#1A50A0]/90 disabled:opacity-50">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIAS SECTION COM VÍNCULOS
// ═══════════════════════════════════════════════════════════════════════════════
function CategoriasSection({ categorias, subcategorias, catSubMap, onRefresh }: {
  categorias: Categoria[]; subcategorias: Subcategoria[]
  catSubMap: Record<number, number[]>; onRefresh: () => void
}) {
  const [newNome, setNewNome] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingNome, setEditingNome] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!newNome.trim()) return; setSaving(true)
    await supabase.from('categorias').insert({ nome: newNome.trim(), slug: slugify(newNome) })
    setNewNome(''); setSaving(false); onRefresh()
  }
  async function handleEdit(id: number) {
    if (!editingNome.trim()) return; setSaving(true)
    await supabase.from('categorias').update({ nome: editingNome.trim(), slug: slugify(editingNome) }).eq('id', id)
    setEditingId(null); setSaving(false); onRefresh()
  }
  async function handleDelete(id: number) {
    if (!confirm('Excluir categoria?')) return
    await supabase.from('categorias').delete().eq('id', id); onRefresh()
  }
  async function toggleVinculo(catId: number, subId: number, isLinked: boolean) {
    if (isLinked) await supabase.from('categoria_subcategorias').delete().eq('categoria_id', catId).eq('subcategoria_id', subId)
    else await supabase.from('categoria_subcategorias').insert({ categoria_id: catId, subcategoria_id: subId })
    onRefresh()
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">Categoria (material)</h3>
      <p className="text-xs text-gray-400 mb-3">Clique em uma categoria para gerenciar quais subcategorias ela contém.</p>
      <div className="space-y-2 mb-4">
        {categorias.map(cat => {
          const linkedIds = catSubMap[cat.id] || []
          const isExpanded = expandedId === cat.id
          return (
            <div key={cat.id} className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
              <div className="flex items-center gap-2 p-2">
                {editingId === cat.id ? (
                  <>
                    <input autoFocus value={editingNome} onChange={e => setEditingNome(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleEdit(cat.id)}
                      className="flex-1 px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30" />
                    <button onClick={() => handleEdit(cat.id)} disabled={saving} className="p-1.5 rounded bg-[#1A50A0] text-white"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded border hover:bg-gray-100"><X className="w-3.5 h-3.5" /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-800 font-medium">{cat.nome}</span>
                    <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
                    {linkedIds.length > 0 && <span className="text-xs bg-blue-50 text-[#1A50A0] px-1.5 py-0.5 rounded-full">{linkedIds.length} sub</span>}
                    <button onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                      className={`p-1.5 rounded border transition-colors ${isExpanded ? 'bg-[#1A50A0] text-white border-[#1A50A0]' : 'border-gray-200 hover:bg-gray-100 text-gray-400'}`}>
                      <Link className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setEditingId(cat.id); setEditingNome(cat.nome) }} className="p-1.5 rounded border border-gray-200 hover:bg-gray-100 text-gray-400"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                )}
              </div>
              {isExpanded && (
                <div className="border-t border-gray-200 px-3 py-2.5 bg-white">
                  <p className="text-xs text-gray-400 mb-2">Subcategorias disponíveis nesta categoria:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {subcategorias.map(sub => {
                      const linked = linkedIds.includes(sub.id)
                      return (
                        <button key={sub.id} onClick={() => toggleVinculo(cat.id, sub.id, linked)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${linked ? 'bg-[#1A50A0] text-white border-[#1A50A0]' : 'border-gray-200 text-gray-500 hover:border-[#1A50A0] hover:text-[#1A50A0]'}`}>
                          {linked ? <Link className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
                          {sub.nome}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newNome} onChange={e => setNewNome(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Nova categoria..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
        <button onClick={handleAdd} disabled={saving || !newNome.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1A50A0] text-white text-sm font-medium hover:bg-[#1A50A0]/90 disabled:opacity-50">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminOverlay({
  setores, categorias, subcategorias,
  produtoParaEditar,
  onProdutoAtualizado, onProdutoRemovido, onProdutoAdicionado, onEditarFechado,
}: Props) {
  const [modalProduto, setModalProduto] = useState<'novo' | 'editar' | null>(null)
  const [form, setForm] = useState<FormProduto>(EMPTY_PRODUTO)
  const [fotos, setFotos] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [showCombinacoes, setShowCombinacoes] = useState(false)

  // catSubMap local carregado ao abrir o modal
  const [catSubMap, setCatSubMap] = useState<Record<number, number[]>>({})

  const [modalVendedores, setModalVendedores] = useState(false)
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [formVendedor, setFormVendedor] = useState<FormVendedor>(EMPTY_VENDEDOR)
  const [editandoVendedor, setEditandoVendedor] = useState<string | null>(null)
  const [savingVendedor, setSavingVendedor] = useState(false)
  const [erroVendedor, setErroVendedor] = useState('')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [showNovoVendedor, setShowNovoVendedor] = useState(false)

  const [modalTaxonomia, setModalTaxonomia] = useState(false)
  const [taxCategorias, setTaxCategorias] = useState<Categoria[]>([])
  const [taxSubcategorias, setTaxSubcategorias] = useState<Subcategoria[]>([])
  const [taxSetores, setTaxSetores] = useState<Setor[]>([])
  const [taxCatSubMap, setTaxCatSubMap] = useState<Record<number, number[]>>({})
  const [taxLoading, setTaxLoading] = useState(false)

  // Subcategorias filtradas pela categoria selecionada
  const subcategoriasDisponiveis = form.categoria_id
    ? subcategorias.filter(s => (catSubMap[Number(form.categoria_id)] || []).includes(s.id))
    : []

  // Abre modal produto ao editar via card
  useEffect(() => {
    if (!produtoParaEditar) return
    loadCatSubMap()
    const raw = produtoParaEditar.variacoes as any
    let grupos: VariacaoGrupo[] = []
    let combinacoes: string[][] | null = null
    if (raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (Array.isArray(parsed)) { grupos = parsed; combinacoes = null }
      else { grupos = parsed.grupos || []; combinacoes = parsed.combinacoes ?? null }
    }
    setForm({
      id: produtoParaEditar.id,
      nome: produtoParaEditar.nome ?? '',
      descricao: produtoParaEditar.descricao ?? '',
      obs: (produtoParaEditar as any).obs ?? '',
      categoria_id: produtoParaEditar.categoria_id != null ? String(produtoParaEditar.categoria_id) : '',
      subcategoria_id: produtoParaEditar.subcategoria_id != null ? String(produtoParaEditar.subcategoria_id) : '',
      ativo: produtoParaEditar.ativo ?? true,
      setorIds: produtoParaEditar.produto_setores?.map(ps => ps.setores.id) ?? [],
      variacoes: grupos,
      combinacoes,
    })
    const fList = produtoParaEditar.fotos as string[] ?? []
    setFotos(produtoParaEditar.foto_url && !fList.includes(produtoParaEditar.foto_url)
      ? [produtoParaEditar.foto_url, ...fList]
      : fList.length > 0 ? fList : produtoParaEditar.foto_url ? [produtoParaEditar.foto_url] : [])
    setErro(''); setShowCombinacoes(false); setModalProduto('editar')
  }, [produtoParaEditar])

  async function loadCatSubMap() {
    const { data } = await supabase.from('categoria_subcategorias').select('categoria_id, subcategoria_id')
    const m: Record<number, number[]> = {}
    for (const cs of (data ?? [])) {
      if (!m[cs.categoria_id]) m[cs.categoria_id] = []
      m[cs.categoria_id].push(cs.subcategoria_id)
    }
    setCatSubMap(m)
  }

  async function abrirNovoProduto() {
    await loadCatSubMap()
    setForm(EMPTY_PRODUTO); setFotos([]); setErro('')
    setShowCombinacoes(false); setModalProduto('novo')
  }

  function fecharProduto() {
    setModalProduto(null); setForm(EMPTY_PRODUTO); setFotos([]); setErro('')
    onEditarFechado()
  }

  function fp(key: keyof FormProduto, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleVariacoesChange(novas: VariacaoGrupo[]) {
    fp('variacoes', novas)
    if (novas.length < 2) fp('combinacoes', null)
  }

  const gruposValidos = form.variacoes.filter(g => g.label.trim() && g.valores.some(v => v.trim()))

  async function salvarProduto() {
    if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return }
    setSaving(true); setErro('')

    const variacoesLimpas = form.variacoes.filter(g => g.label.trim()).map(g => ({
      label: g.label.trim(),
      valores: g.valores.filter(v => v.trim()),
      fotos: g.fotos || {},
      desativados: (g.desativados || []).filter(v => g.valores.includes(v))
    }))
    const variacoesPayload = variacoesLimpas.length >= 2
      ? { grupos: variacoesLimpas, combinacoes: form.combinacoes }
      : variacoesLimpas

    const payload: any = {
      nome: form.nome, slug: slugify(form.nome),
      descricao: form.descricao || null,
      obs: form.obs || null,
      ativo: form.ativo,
      foto_url: fotos[0] ?? null, fotos: fotos.length > 0 ? fotos : null,
      variacoes: variacoesPayload,
      categoria_id: form.categoria_id !== '' ? Number(form.categoria_id) : null,
      subcategoria_id: form.subcategoria_id !== '' ? Number(form.subcategoria_id) : null,
    }

    let produtoId: number
    if (modalProduto === 'novo') {
      const { data, error } = await supabase.from('produtos').insert(payload).select().single()
      if (error) { setErro(error.message); setSaving(false); return }
      produtoId = data.id
    } else {
      const { data, error } = await supabase.from('produtos').update(payload).eq('id', form.id!).select().single()
      if (error) { setErro(error.message); setSaving(false); return }
      produtoId = data.id
    }

    await supabase.from('produto_setores').delete().eq('produto_id', produtoId)
    if (form.setorIds.length > 0)
      await supabase.from('produto_setores').insert(form.setorIds.map(setor_id => ({ produto_id: produtoId, setor_id })))

    const setoresMap = Object.fromEntries(setores.map(s => [s.id, s]))
    const categoriasMap = Object.fromEntries(categorias.map(c => [c.id, c]))
    const [{ data: psData }, { data: prodData }] = await Promise.all([
      supabase.from('produto_setores').select('setor_id').eq('produto_id', produtoId),
      supabase.from('produtos').select('*').eq('id', produtoId).single(),
    ])
    const atualizado: ProdutoComRelacoes = {
      ...prodData,
      produto_setores: (psData ?? []).map((ps: any) => ({ setores: setoresMap[ps.setor_id] })).filter((x: any) => x.setores),
      produto_categorias: [],
    }
    if (modalProduto === 'novo') onProdutoAdicionado(atualizado)
    else onProdutoAtualizado(atualizado)
    setSaving(false); fecharProduto()
  }

  // ─── taxonomia ────────────────────────────────────────────────────────────
  async function fetchTaxonomia() {
    setTaxLoading(true)
    const [{ data: cats }, { data: subs }, { data: sets }, { data: csLinks }] = await Promise.all([
      supabase.from('categorias').select('*').order('nome'),
      supabase.from('subcategorias').select('*').order('nome'),
      supabase.from('setores').select('*').order('nome'),
      supabase.from('categoria_subcategorias').select('categoria_id, subcategoria_id'),
    ])
    const csMap: Record<number, number[]> = {}
    for (const cs of (csLinks ?? [])) {
      if (!csMap[cs.categoria_id]) csMap[cs.categoria_id] = []
      csMap[cs.categoria_id].push(cs.subcategoria_id)
    }
    setTaxCategorias(cats ?? []); setTaxSubcategorias(subs ?? [])
    setTaxSetores(sets ?? []); setTaxCatSubMap(csMap); setTaxLoading(false)
  }

  // ─── vendedores ───────────────────────────────────────────────────────────
  async function abrirVendedores() {
    const { data } = await supabase.from('vendedores').select('*').order('created_at', { ascending: false })
    setVendedores(data ?? []); setFormVendedor(EMPTY_VENDEDOR)
    setEditandoVendedor(null); setErroVendedor(''); setShowNovoVendedor(false); setModalVendedores(true)
  }

  async function salvarVendedor() {
    if (!formVendedor.nome.trim() || !formVendedor.slug.trim() || !formVendedor.whatsapp.trim()) { setErroVendedor('Preencha todos os campos.'); return }
    const whatsapp = formVendedor.whatsapp.replace(/\D/g, '')
    if (whatsapp.length < 10) { setErroVendedor('WhatsApp inválido.'); return }
    setSavingVendedor(true); setErroVendedor('')
    if (!editandoVendedor) {
      const { data, error } = await supabase.from('vendedores').insert({ nome: formVendedor.nome, slug: formVendedor.slug, whatsapp, ativo: true }).select().single()
      if (error) { setErroVendedor(error.message.includes('duplicate') ? 'Slug já existe.' : error.message); setSavingVendedor(false); return }
      setVendedores(prev => [data, ...prev]); setShowNovoVendedor(false)
    } else {
      const { data, error } = await supabase.from('vendedores').update({ nome: formVendedor.nome, slug: formVendedor.slug, whatsapp, ativo: formVendedor.ativo }).eq('id', editandoVendedor).select().single()
      if (error) { setErroVendedor(error.message); setSavingVendedor(false); return }
      setVendedores(prev => prev.map(v => v.id === data.id ? data : v)); setEditandoVendedor(null)
    }
    setSavingVendedor(false); setFormVendedor(EMPTY_VENDEDOR)
  }

  async function toggleVendedor(v: Vendedor) {
    const { data } = await supabase.from('vendedores').update({ ativo: !v.ativo }).eq('id', v.id).select().single()
    if (data) setVendedores(prev => prev.map(x => x.id === data.id ? data : x))
  }

  async function excluirVendedor(id: string) {
    if (!confirm('Excluir este vendedor?')) return
    await supabase.from('vendedores').delete().eq('id', id)
    setVendedores(prev => prev.filter(v => v.id !== id))
  }

  function copiarLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/v/${slug}`)
    setCopiedSlug(slug); setTimeout(() => setCopiedSlug(null), 2000)
  }

  return (
    <>
      {/* Barra admin */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-[#1A50A0] text-white h-10 flex items-center px-4 gap-2 shadow-lg">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mr-1">Admin</span>
        <button onClick={abrirNovoProduto}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" /> Novo produto
        </button>
        <button onClick={() => { setModalTaxonomia(true); fetchTaxonomia() }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors">
          <Settings className="w-3.5 h-3.5" /> Categorias
        </button>
        <a href="/blog"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors">
          Blog
        </a>
        <button onClick={abrirVendedores}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors">
          <Users className="w-3.5 h-3.5" /> Vendedores
        </button>
        <div className="flex-1" />
        <button onClick={async () => { await supabase.auth.signOut(); window.location.reload() }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-red-500/60 text-xs font-medium transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Sair
        </button>
      </div>

      {/* ── Modal produto ── */}
      {modalProduto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-14 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{modalProduto === 'novo' ? 'Novo produto' : 'Editar produto'}</h2>
              <button onClick={fecharProduto} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
                <input type="text" value={form.nome} onChange={e => fp('nome', e.target.value)}
                  placeholder="ex: Marmita de alumínio 500ml"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                <textarea value={form.descricao} onChange={e => fp('descricao', e.target.value)} rows={3}
                  placeholder="Descrição breve do produto"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0] resize-none" />
              </div>

              {/* Categoria + Subcategoria */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria (material)</label>
                  <select value={form.categoria_id}
                    onChange={e => setForm(prev => ({ ...prev, categoria_id: e.target.value, subcategoria_id: '' }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0] bg-white">
                    <option value="">Selecione</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subcategoria (produto)</label>
                  <select value={form.subcategoria_id} onChange={e => fp('subcategoria_id', e.target.value)}
                    disabled={!form.categoria_id || subcategoriasDisponiveis.length === 0}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0] bg-white disabled:opacity-50">
                    <option value="">{form.categoria_id ? 'Selecione' : 'Selecione a categoria primeiro'}</option>
                    {subcategoriasDisponiveis.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
              </div>

              {/* Setores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Setores de atuação</label>
                <div className="flex flex-wrap gap-2">
                  {setores.map(s => (
                    <button key={s.id} type="button"
                      onClick={() => fp('setorIds', form.setorIds.includes(s.id) ? form.setorIds.filter(x => x !== s.id) : [...form.setorIds, s.id])}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.setorIds.includes(s.id) ? 'bg-[#1A50A0] text-white border-[#1A50A0]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {s.nome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variações</label>
                <VariacoesEditor variacoes={form.variacoes} fotos={fotos} onChange={handleVariacoesChange} />
              </div>

              {/* Combinações */}
              {gruposValidos.length >= 2 && (
                <div>
                  <button type="button" onClick={() => setShowCombinacoes(v => !v)}
                    className="flex items-center gap-2 text-sm font-medium text-[#1A50A0] hover:underline">
                    {showCombinacoes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Gerenciar combinações válidas
                    <span className="text-xs font-normal text-gray-400">
                      {form.combinacoes === null ? '(todas válidas)' : `(${form.combinacoes.length} definidas)`}
                    </span>
                  </button>
                  {showCombinacoes && (
                    <div className="mt-2">
                      <CombinacoesEditor variacoes={gruposValidos} combinacoes={form.combinacoes}
                        onChange={c => fp('combinacoes', c)} />
                    </div>
                  )}
                </div>
              )}

              {/* Observação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Observação</label>
                <input type="text" value={form.obs} onChange={e => fp('obs', e.target.value)}
                  placeholder="ex: Disponível com ou sem tampa"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
              </div>

              {/* Fotos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotos {fotos.length > 0 && <span className="text-gray-400 font-normal">({fotos.length})</span>}
                </label>
                <FotosEditor fotos={fotos} onChange={setFotos} />
              </div>

              {/* Flags */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.ativo} onChange={e => fp('ativo', e.target.checked)} className="rounded border-gray-300 text-[#1A50A0]" />
                  <span className="text-sm text-gray-700">Ativo no catálogo</span>
                </label>
              </div>
            </div>

            {erro && <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={fecharProduto} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={salvarProduto} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#1A50A0] hover:bg-[#1A50A0]/90 disabled:opacity-60 text-white text-sm font-medium">
                {saving ? 'Salvando...' : 'Salvar produto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal taxonomia ── */}
      {modalTaxonomia && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setModalTaxonomia(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Categorias, subcategorias e setores</h2>
              <button onClick={() => setModalTaxonomia(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            {taxLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <div className="p-5 space-y-8">
                <CategoriasSection categorias={taxCategorias} subcategorias={taxSubcategorias} catSubMap={taxCatSubMap} onRefresh={fetchTaxonomia} />
                <div className="border-t border-gray-100" />
                <TaxonomySection title="Subcategoria (produto)" table="subcategorias" items={taxSubcategorias} onRefresh={fetchTaxonomia} />
                <div className="border-t border-gray-100" />
                <TaxonomySection title="Setores" table="setores" items={taxSetores} onRefresh={fetchTaxonomia} />
              </div>
            )}
            <div className="p-5 border-t border-gray-100">
              <button onClick={() => setModalTaxonomia(false)} className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal vendedores ── */}
      {modalVendedores && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Catálogos de Vendedores</h2>
                <p className="text-xs text-gray-400 mt-0.5">Cada vendedor tem um link único que envia pedidos para o WhatsApp dele</p>
              </div>
              <button onClick={() => setModalVendedores(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {vendedores.length === 0 && !showNovoVendedor && (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum vendedor cadastrado.</p>
              )}
              {vendedores.map(v => (
                <div key={v.id} className={`border rounded-xl p-3 ${!v.ativo ? 'opacity-50 bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
                  {editandoVendedor === v.id ? (
                    <div className="space-y-2">
                      <input type="text" value={formVendedor.nome} onChange={e => setFormVendedor(p => ({ ...p, nome: e.target.value }))}
                        placeholder="Nome" className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
                      <div className="flex items-center">
                        <span className="px-2 py-1.5 text-xs text-gray-400 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg">/v/</span>
                        <input type="text" value={formVendedor.slug} onChange={e => setFormVendedor(p => ({ ...p, slug: slugify(e.target.value) }))}
                          placeholder="slug" className="flex-1 px-2 py-1.5 rounded-r-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
                      </div>
                      <input type="text" value={formVendedor.whatsapp} onChange={e => setFormVendedor(p => ({ ...p, whatsapp: e.target.value }))}
                        placeholder="WhatsApp (só números)" className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
                      {erroVendedor && <p className="text-xs text-red-600">{erroVendedor}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => { setEditandoVendedor(null); setFormVendedor(EMPTY_VENDEDOR) }} className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                        <button onClick={salvarVendedor} disabled={savingVendedor} className="flex-1 py-1.5 rounded-lg bg-[#1A50A0] text-white text-xs font-medium disabled:opacity-60">
                          {savingVendedor ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{v.nome}</p>
                        <p className="text-xs text-gray-400">{v.whatsapp}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 font-mono">/v/{v.slug}</span>
                          <button onClick={() => copiarLink(v.slug)} className="text-gray-400 hover:text-gray-600">
                            {copiedSlug === v.slug ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a href={`/v/${v.slug}`} target="_blank" className="text-gray-400 hover:text-gray-600">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => toggleVendedor(v)} className={`transition-colors ${v.ativo ? 'text-emerald-500' : 'text-gray-300'}`}>
                          {v.ativo ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button onClick={() => { setEditandoVendedor(v.id); setFormVendedor({ id: v.id, nome: v.nome, slug: v.slug, whatsapp: v.whatsapp, ativo: v.ativo }); setShowNovoVendedor(false) }}
                          className="p-1 text-gray-400 hover:text-[#1A50A0]"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => excluirVendedor(v.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showNovoVendedor ? (
              <div className="border border-gray-200 rounded-xl p-3 space-y-2">
                <input type="text" value={formVendedor.nome}
                  onChange={e => setFormVendedor(p => ({ ...p, nome: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="Nome do vendedor"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
                <div className="flex items-center">
                  <span className="px-2 py-1.5 text-xs text-gray-400 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg">/v/</span>
                  <input type="text" value={formVendedor.slug} onChange={e => setFormVendedor(p => ({ ...p, slug: slugify(e.target.value) }))}
                    placeholder="slug"
                    className="flex-1 px-2 py-1.5 rounded-r-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
                </div>
                <input type="text" value={formVendedor.whatsapp} onChange={e => setFormVendedor(p => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="WhatsApp (só números, ex: 5561999998888)"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
                {erroVendedor && <p className="text-xs text-red-600">{erroVendedor}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { setShowNovoVendedor(false); setFormVendedor(EMPTY_VENDEDOR); setErroVendedor('') }}
                    className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <button onClick={salvarVendedor} disabled={savingVendedor}
                    className="flex-1 py-1.5 rounded-lg bg-[#1A50A0] text-white text-xs font-medium disabled:opacity-60">
                    {savingVendedor ? 'Salvando...' : 'Adicionar'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setShowNovoVendedor(true); setEditandoVendedor(null); setFormVendedor(EMPTY_VENDEDOR); setErroVendedor('') }}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-[#1A50A0] hover:text-[#1A50A0] transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar vendedor
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}