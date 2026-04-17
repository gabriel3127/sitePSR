# PSR Embalagens — Site Institucional

Site institucional e catálogo digital da PSR Embalagens, distribuidora de embalagens e descartáveis com sede no CEASA de Brasília, DF.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS v4
- **Banco de dados / Storage:** Supabase (PostgreSQL + Storage)
- **Animações:** Framer Motion
- **Deploy:** Vercel

## Funcionalidades

- Catálogo de produtos com filtros por setor, categoria e subcategoria
- Carrinho com envio de pedido via WhatsApp
- Links de vendedor personalizados (`/v/[slug]`) com WhatsApp dinâmico
- Blog com posts gerenciados inline
- Admin inline no catálogo e blog (sem painel separado)
- Upload de imagens com conversão automática para WebP
- SSG/SSR para indexação no Google

## Estrutura

```
src/
├── app/
│   ├── page.tsx               # Home
│   ├── catalogo/              # Catálogo de produtos
│   ├── blog/                  # Blog
│   ├── depoimentos/           # Depoimentos
│   ├── v/[slug]/              # Catálogo por vendedor
│   └── admin/login/           # Login admin
├── components/
│   ├── AdminOverlay.tsx       # Admin inline (catálogo)
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── sections/              # Seções da home
└── lib/
    ├── supabase.ts            # Cliente browser
    ├── supabase-server.ts     # Cliente server
    ├── queries.ts             # Funções de busca
    ├── types.ts               # Tipos TypeScript
    ├── utils.ts               # Utilitários
    └── convertToWebp.ts       # Conversão de imagens
```

## Configuração local

**1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/psr-nextjs.git
cd psr-nextjs
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz com:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

As chaves estão no painel do Supabase em **Project Settings → API**.

**4. Rode o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Deploy

O projeto está configurado para deploy automático na Vercel via integração com GitHub.

1. Faça push para o branch `main`
2. A Vercel detecta automaticamente o Next.js e faz o build
3. Configure as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Admin

O painel de administração é acessado em `/admin/login`. Após o login, uma barra azul aparece no topo do catálogo e do blog com acesso a:

- Criar / editar / excluir produtos inline
- Gerenciar categorias, subcategorias e setores
- Gerenciar vendedores e links personalizados
- Criar / editar / publicar posts do blog

---

PSR Embalagens © 2026 — Brasília, DF