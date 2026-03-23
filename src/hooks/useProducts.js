import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useProducts() {
  const [products, setProducts] = useState([])
  const [tipos, setTipos] = useState([])
  const [setores, setSetores] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [
          { data: prods, error: e1 },
          { data: tip, error: e2 },
          { data: set, error: e3 },
          { data: cat, error: e4 },
          { data: setoresProd, error: e5 },
        ] = await Promise.all([
          supabase.from("produtos").select("*").eq("ativo", true).order("nome"),
          supabase.from("tipos").select("*").order("nome"),
          supabase.from("setores").select("*").order("nome"),
          supabase.from("categorias").select("*").order("nome"),
          supabase.from("produto_setores").select("produto_id, setor_id"),
        ])

        if (e1) console.error("produtos:", e1)
        if (e2) console.error("tipos:", e2)
        if (e3) console.error("setores:", e3)
        if (e4) console.error("categorias:", e4)
        if (e5) console.error("produto_setores:", e5)

        const tiposMap = Object.fromEntries((tip || []).map(t => [t.id, t]))
        const catMap = Object.fromEntries((cat || []).map(c => [c.id, c]))
        const setoresMap = Object.fromEntries((set || []).map(s => [s.id, s]))

        const setoresPorProduto = {}
        for (const ps of (setoresProd || [])) {
          if (!setoresPorProduto[ps.produto_id]) setoresPorProduto[ps.produto_id] = []
          setoresPorProduto[ps.produto_id].push(setoresMap[ps.setor_id])
        }

        const prodsEnriquecidos = (prods || []).map(p => ({
          ...p,
          tipo: tiposMap[p.tipo_id] || null,
          categoria: catMap[p.categoria_id] || null,
          produto_setores: (setoresPorProduto[p.id] || []).map(s => ({ setor: s })),
        }))

        setProducts(prodsEnriquecidos)
        setTipos(tip || [])
        setSetores(set || [])
        setCategorias(cat || [])
      } catch (err) {
        console.error("fetchAll error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return { products, tipos, setores, categorias, loading }
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
          { data: tip },
          { data: cat },
          { data: set },
          { data: ps },
        ] = await Promise.all([
          supabase.from("produtos").select("*").eq("id", id).single(),
          supabase.from("tipos").select("*"),
          supabase.from("categorias").select("*"),
          supabase.from("setores").select("*"),                              // ← busca setores completos
          supabase.from("produto_setores").select("setor_id").eq("produto_id", id),
        ])

        if (e1) { console.error("produto:", e1); setLoading(false); return }

        const tiposMap = Object.fromEntries((tip || []).map(t => [t.id, t]))
        const catMap = Object.fromEntries((cat || []).map(c => [c.id, c]))
        const setoresMap = Object.fromEntries((set || []).map(s => [s.id, s]))  // ← mapa completo

        setProduct({
          ...p,
          tipo: tiposMap[p.tipo_id] || null,
          categoria: catMap[p.categoria_id] || null,
          // setor completo com id, slug e nome — necessário para os relacionados
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