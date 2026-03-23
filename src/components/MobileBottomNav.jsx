// src/components/MobileBottomNav.jsx
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, BookOpen, MessageSquareQuote, ShoppingBag } from "lucide-react"

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem("psr_cart")) || [] }
  catch { return [] }
}

const MobileBottomNav = ({ onCartOpen }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const cart = loadCart()
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0)

  const isActive = (path) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  const handleCatalogoClick = (e) => {
    if (pathname.startsWith("/catalogo") && onCartOpen && totalItems > 0) {
      e.preventDefault()
      onCartOpen()
    }
    // senão navega normalmente para /catalogo
  }

  const tabs = [
    { label: "Início",      path: "/",            icon: Home               },
    { label: "Catálogo",    path: "/catalogo",    icon: ShoppingBag,  onClick: handleCatalogoClick },
    { label: "Blog",        path: "/blog",        icon: BookOpen           },
    { label: "Depoimentos", path: "/depoimentos", icon: MessageSquareQuote },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-center lg:hidden">
      {tabs.map(({ label, path, icon: Icon, onClick }) => {
        const active = isActive(path)
        const isCatalogo = path === "/catalogo"
        return (
          <Link
            key={path}
            to={path}
            onClick={onClick}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              active ? "text-[#1A50A0]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
              {isCatalogo && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#1A50A0] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </div>
            <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default MobileBottomNav