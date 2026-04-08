import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const BASE_URL = "https://www.psrembalagens.com.br"

export const useCanonical = (overrideUrl) => {
  const location = useLocation()

  useEffect(() => {
    const cleanPath = location.pathname
    const canonical = overrideUrl || `${BASE_URL}${cleanPath}`

    let tag = document.querySelector("link[rel='canonical']")
    if (!tag) {
      tag = document.createElement("link")
      tag.setAttribute("rel", "canonical")
      document.head.appendChild(tag)
    }
    tag.setAttribute("href", canonical)

    return () => {
      // Restaura o canonical da home ao desmontar (opcional)
      // tag.setAttribute("href", BASE_URL + "/")
    }
  }, [location.pathname, overrideUrl])
}