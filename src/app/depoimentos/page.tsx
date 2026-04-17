import type { Metadata } from "next"
import DepoimentosClient from "./DepoimentosClient"

export const metadata: Metadata = {
  title: "Depoimentos | PSR Embalagens Brasília",
  description:
    "Veja o que nossos clientes dizem sobre a PSR Embalagens. Mais de 500 estabelecimentos satisfeitos no DF.",
  alternates: {
    canonical: "https://www.psrembalagens.com.br/depoimentos",
  },
}

export default function DepoimentosPage() {
  return <DepoimentosClient />
}