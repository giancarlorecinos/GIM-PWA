import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-0 w-full max-w-lg backdrop:bg-black/60 text-slate-200"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  )
}
