import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { X, ShieldCheck } from "lucide-react"

// Troca pela chave real antes do deploy
const TURNSTILE_SITE_KEY = "0x4AAAAAACvB2nbIT164Ey8h"

const TurnstileModal = ({ onSuccess, onClose }) => {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    const tryRender = () => {
      if (!containerRef.current) return
      if (!window.turnstile) {
        setTimeout(tryRender, 100)
        return
      }
      if (widgetIdRef.current !== null) return

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "light",
        language: "pt-BR",
        callback: (token) => {
          onSuccess(token)
        },
        "error-callback": () => {
          if (widgetIdRef.current !== null) {
            window.turnstile.reset(widgetIdRef.current)
          }
        },
        "expired-callback": () => {
          if (widgetIdRef.current !== null) {
            window.turnstile.reset(widgetIdRef.current)
          }
        },
      })
    }

    tryRender()

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
        widgetIdRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-background rounded-2xl shadow-2xl border w-full max-w-sm p-6 pointer-events-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">Verificação rápida</p>
                <p className="text-xs text-muted-foreground">Confirme que você é humano</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-center my-4" ref={containerRef} />

          <p className="text-xs text-muted-foreground text-center mt-2 leading-relaxed">
            Após a verificação, sua lista será enviada automaticamente pelo WhatsApp.
          </p>
        </div>
      </motion.div>
    </>
  )
}

export default TurnstileModal