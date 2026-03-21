import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function usePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("publicado", true)
        .order("created_at", { ascending: false })
      setPosts(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { posts, loading, setPosts }
}

export function usePost(slug) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    async function fetch() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .single()
      setPost(data)
      setLoading(false)
    }
    fetch()
  }, [slug])

  return { post, loading, setPost }
}