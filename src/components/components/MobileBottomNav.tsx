"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, MessageSquareQuote, ShoppingBag } from "lucide-react"

interface Tab {
  label: string
  path: string
  icon: React.ElementType
}

const tabs: Tab[] = [
  { label: "Início",      path: "/",            icon: Home               },
  { label: "Catálogo",    path: "/catalogo",    icon: ShoppingBag        },
  { label: "Blog",        path: "/blog",        icon: BookOpen           },
  { label: "Depoimentos", path: "/depoimentos", icon: MessageSquareQuote },
]

const MobileBottomNav = () => {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center lg:hidden">
      {tabs.map(({ label, path, icon: Icon }) => {
        const active = isActive(path)
        return (
          <Link
            key={path}
            href={path}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              active ? "text-[#1A50A0]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
            <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default MobileBottomNav
