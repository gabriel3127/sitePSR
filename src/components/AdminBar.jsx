import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { LogOut, Plus, Settings } from "lucide-react"

const AdminBar = ({ onNewProduct, onNewPost, onSettings, type = "catalogo" }) => {
  const { isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  if (!isAdmin) return null

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  return (
    <div className="w-full bg-[#1A50A0] text-white px-4 py-2 flex items-center justify-between text-sm z-50">
      <span className="font-semibold tracking-wide">PSR Admin</span>
      <div className="flex items-center gap-3">
        {type === "catalogo" && onNewProduct && (
          <button
            onClick={onNewProduct}
            className="flex items-center gap-1.5 bg-[#F5C200] text-[#1A50A0] px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-yellow-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Novo produto
          </button>
        )}
        {type === "catalogo" && onSettings && (
          <button
            onClick={onSettings}
            className="flex items-center gap-1.5 text-white/80 hover:text-white border border-white/30 px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <Settings className="w-3.5 h-3.5" /> Tipos e setores
          </button>
        )}
        {type === "blog" && onNewPost && (
          <button
            onClick={onNewPost}
            className="flex items-center gap-1.5 bg-[#F5C200] text-[#1A50A0] px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-yellow-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Novo post
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-xs"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair
        </button>
      </div>
    </div>
  )
}

export default AdminBar