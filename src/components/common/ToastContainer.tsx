import { useToastStore } from '@/store/toastStore'

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 md:right-6 z-[60] flex flex-col gap-3 max-w-[24rem] w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-neutral-900 border border-neutral-800 shadow-2xl rounded-xl p-4 pointer-events-auto transform transition-all duration-300 translate-y-0 opacity-100 flex items-start justify-between gap-3"
        >
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white mb-1">{toast.title}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-500 hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
