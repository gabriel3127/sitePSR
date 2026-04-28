import Link from "next/link"
import Image from "next/image"

const navLinks = [
  { label: "Catálogo", href: "/catalogo", isRoute: true },
  { label: "Blog", href: "/blog", isRoute: true },
  { label: "Depoimentos", href: "/depoimentos", isRoute: true },
  { label: "Localização", href: "#localizacao", isRoute: false },
]

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/80 bg-white/92 shadow-sm backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label="PSR Embalagens">
          <Image
            src="/images/psr-logo.svg"
            alt="PSR Embalagens"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        <div className="hidden lg:flex items-center justify-center gap-8">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className="text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-[#1A50A0]"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-[#1A50A0]"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center justify-end">
          <a
            href="#contato"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1A50A0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#153F80]"
          >
            Fale Conosco
          </a>
        </div>

        <div className="h-10 w-10 lg:hidden" aria-hidden="true" />
      </div>
    </nav>
  )
}

export default Navbar
