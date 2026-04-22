import Link from "next/link"
import Image from "next/image"

const Footer = () => {
  return (
    <footer className="py-10 border-xl">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          <div>
            <Image
              src="/images/psr-logo.svg"
              alt="PSR Embalagens"
              width={100}
              height={32}
              className="h-8 w-auto mb-3"
            />
            <p className="text-sm text-muted-foreground">
              Distribuidora de embalagens no DF desde 2010. Qualidade e preço justo.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground text-sm mb-3">Páginas</h2>
            <div className="flex flex-col gap-2">
              <Link href="/catalogo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Catálogo</Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link href="/depoimentos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Depoimentos</Link>
              <Link href="/links" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Links</Link>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-foreground text-sm mb-3">Contato</h2>
            <div className="flex flex-col gap-2">
              <a href="tel:+5561993177107" className="text-sm text-muted-foreground hover:text-foreground transition-colors">(61) 99317-7107</a>
              <a href="https://wa.me/5561993177107" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">WhatsApp</a>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-foreground text-sm mb-3">Redes Sociais</h2>
            <div className="flex flex-col gap-2">
              <a href="https://www.instagram.com/psrembalagens" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Instagram</a>
              <a href="https://www.facebook.com/psrembalagens" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Facebook</a>
            </div>
          </div>

        </div>

        <div className="border-xl pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PSR Embalagens. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer