import { lazy, Suspense } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/contexts/AuthContext"

// Index carrega imediatamente — é a home, precisa ser rápida
import Index from "./pages/Index.jsx"

// Todas as outras rotas carregam só quando o usuário navegar até elas
const Catalogo = lazy(() => import("./pages/Catalogo.jsx"))
const Produto = lazy(() => import("./pages/Produto.jsx"))
const Blog = lazy(() => import("./pages/Blog.jsx"))
const BlogPost = lazy(() => import("./pages/Blog.jsx").then(m => ({ default: m.BlogPost })))
const Depoimentos = lazy(() => import("./pages/Depoimentos.jsx"))
const Links = lazy(() => import("./pages/Links.jsx"))
const Admin = lazy(() => import("./pages/Admin.jsx"))
const NotFound = lazy(() => import("./pages/NotFound.jsx"))

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/catalogo/:id" element={<Produto />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/depoimentos" element={<Depoimentos />} />
              <Route path="/links" element={<Links />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
