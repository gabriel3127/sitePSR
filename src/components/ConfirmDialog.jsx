import { motion, AnimatePresence } from "framer-motion"

const ConfirmDialog = ({ open, title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", variant = "danger", onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto border border-border/50 overflow-hidden">
              {/* Ícone */}
              <div className="flex justify-center pt-8 pb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  variant === "danger" ? "bg-red-50" : "bg-amber-50"
                }`}>
                  {variant === "danger" ? (
                    <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Texto */}
              <div className="px-6 pb-6 text-center">
                <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
                {message && <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>}
              </div>

              {/* Botões */}
              <div className="flex border-t border-border/50">
                <button
                  onClick={onCancel}
                  className="flex-1 py-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border-r border-border/50"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-4 text-sm font-bold transition-colors ${
                    variant === "danger"
                      ? "text-red-500 hover:bg-red-50"
                      : "text-amber-600 hover:bg-amber-50"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog