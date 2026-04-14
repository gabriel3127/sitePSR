import { lazy, Suspense } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

// Home carrega imediatamente
import Index from "./pages/Index.jsx"

// Todas as outras rotas em lazy — carregam só quando necessário
const Catalogo    = lazy(() => import("./pages/Catalogo.jsx"))
const Produto     = lazy(() => import("./pages/Produto.jsx"))
const Blog        = lazy(() => import("./pages/Blog.jsx"))
const BlogPost    = lazy(() => import("./pages/Blog.jsx").then(m => ({ default: m.BlogPost })))
const Depoimentos = lazy(() => import("./pages/Depoimentos.jsx"))
const Links       = lazy(() => import("./pages/Links.jsx"))
const NotFound    = lazy(() => import("./pages/NotFound.jsx"))

// Admin com AuthProvider isolado — Supabase só carrega quando /admin é acessado
const AdminWithAuth = lazy(() =>
  Promise.all([
    import("./pages/Admin.jsx"),
    import("./contexts/AuthContext.jsx"),
  ]).then(([adminModule, authModule]) => {
    const Admin = adminModule.default
    const { AuthProvider } = authModule
    return {
      default: () => (
        <AuthProvider>
          <Admin />
        </AuthProvider>
      ),
    }
  })
)

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/"            element={<Index />} />
            <Route path="/catalogo"    element={<Catalogo />} />
            <Route path="/catalogo/:id" element={<Produto />} />
            <Route path="/blog"        element={<Blog />} />
            <Route path="/blog/:slug"  element={<BlogPost />} />
            <Route path="/depoimentos" element={<Depoimentos />} />
            <Route path="/links"       element={<Links />} />
            <Route path="/admin"       element={<AdminWithAuth />} />
            <Route path="*"            element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App