import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useProducts({ includeInactive = false } = {}) {
  const [products, setProducts] = useState([])
  const [categorias, setCategorias] = useState([])   // ex-tipos (material)
  const [subcategorias, setSubcategorias] = useState([]) // ex-categorias (produto)
  const [setores, setSetores] = useState([])
  const [catSubMap, setCatSubMap] = useState({})     // { categoria_id: [subcategoria_id, ...] }
  const [loading, setLoading] = useState(true)

  // mantém aliases para compatibilidade com código existente
  const tipos = categorias

  useEffect(() => {
    async function fetchAll() {
      try {
        let prodQuery = supabase.from("produtos").select("*").order("nome")
        if (!includeInactive) prodQuery = prodQuery.eq("ativo", true)

        const [
          { data: prods, error: e1 },
          { data: cats, error: e2 },
          { data: subs, error: e3 },
          { data: set, error: e4 },
          { data: setoresProd, error: e5 },
          { data: catSubs, error: e6 },
        ] = await Promise.all([
          prodQuery,
          supabase.from("categorias").select("*").order("nome"),
          supabase.from("subcategorias").select("*").order("nome"),
          supabase.from("setores").select("*").order("nome"),
          supabase.from("produto_setores").select("produto_id, setor_id"),
          supabase.from("categoria_subcategorias").select("categoria_id, subcategoria_id"),
        ])

        if (e1) console.error("produtos:", e1)
        if (e2) console.error("categorias:", e2)
        if (e3) console.error("subcategorias:", e3)
        if (e4) console.error("setores:", e4)
        if (e5) console.error("produto_setores:", e5)
        if (e6) console.error("categoria_subcategorias:", e6)

        const catsMap = Object.fromEntries((cats || []).map(c => [c.id, c]))
        const subsMap = Object.fromEntries((subs || []).map(s => [s.id, s]))
        const setoresMap = Object.fromEntries((set || []).map(s => [s.id, s]))

        // mapa categoria_id → [subcategoria_id, ...]
        const csMap = {}
        for (const cs of (catSubs || [])) {
          if (!csMap[cs.categoria_id]) csMap[cs.categoria_id] = []
          csMap[cs.categoria_id].push(cs.subcategoria_id)
        }

        const setoresPorProduto = {}
        for (const ps of (setoresProd || [])) {
          if (!setoresPorProduto[ps.produto_id]) setoresPorProduto[ps.produto_id] = []
          setoresPorProduto[ps.produto_id].push(setoresMap[ps.setor_id])
        }

        const prodsEnriquecidos = (prods || []).map(p => ({
          ...p,
          // mantém .tipo e .categoria para compatibilidade com código existente
          tipo: catsMap[p.categoria_id] || null,
          categoria: subsMap[p.subcategoria_id] || null,
          produto_setores: (setoresPorProduto[p.id] || []).map(s => ({ setor: s })),
        }))

        setProducts(prodsEnriquecidos)
        setCategorias(cats || [])
        setSubcategorias(subs || [])
        setSetores(set || [])
        setCatSubMap(csMap)
      } catch (err) {
        console.error("fetchAll error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [includeInactive])

  return { products, categorias, subcategorias, tipos, setores, catSubMap, loading }
}

export function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchOne() {
      try {
        const [
          { data: p, error: e1 },
          { data: cats },
          { data: subs },
          { data: set },
          { data: ps },
        ] = await Promise.all([
          supabase.from("produtos").select("*").eq("id", id).single(),
          supabase.from("categorias").select("*"),
          supabase.from("subcategorias").select("*"),
          supabase.from("setores").select("*"),
          supabase.from("produto_setores").select("setor_id").eq("produto_id", id),
        ])

        if (e1) { console.error("produto:", e1); setLoading(false); return }

        const catsMap = Object.fromEntries((cats || []).map(c => [c.id, c]))
        const subsMap = Object.fromEntries((subs || []).map(s => [s.id, s]))
        const setoresMap = Object.fromEntries((set || []).map(s => [s.id, s]))

        setProduct({
          ...p,
          tipo: catsMap[p.categoria_id] || null,
          categoria: subsMap[p.subcategoria_id] || null,
          produto_setores: (ps || []).map(s => ({ setor: setoresMap[s.setor_id] || { id: s.setor_id } })),
        })
      } catch (err) {
        console.error("fetchOne error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchOne()
  }, [id])

  return { product, loading }
}