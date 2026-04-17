"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

const WA_LINK =
  "https://wa.me/5561993177107?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20personalizado.%20Podem%20me%20ajudar?"

const navLinks = [
  { label: "Catálogo",    href: "/catalogo",    isRoute: true  },
  { label: "Blog",        href: "/blog",        isRoute: true  },
  { label: "Depoimentos", href: "/depoimentos", isRoute: true  },
  { label: "Localização", href: "#localizacao", isRoute: false },
]

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container grid grid-cols-3 items-center h-16">

        {/* Logo — esquerda */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/psr-logo.svg"
            alt="PSR Embalagens"
            width={40}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Links — centro */}
        <div className="hidden lg:flex items-center justify-center gap-8">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-[#1A50A0]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Botão — direita */}
        <div className="hidden lg:flex items-center justify-end">
          <a
            href="#contato"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A50A0] text-white text-sm font-semibold hover:bg-[#153F80] transition-colors shadow-sm"
          >
            Fale Conosco
          </a>
        </div>

        {/* Hamburguer — mobile */}
        <div className="lg:hidden col-start-3 flex justify-end">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-gray-700"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-4">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    {link.label}
                  </a>
                )
              )}
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1A50A0] text-white text-sm font-semibold"
              >
                Falar no WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar