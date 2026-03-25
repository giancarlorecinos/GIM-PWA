import { useState, useEffect, useRef, type FormEvent } from 'react'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { Send } from 'lucide-react'
import { firestore } from '../firebase/config'
import { useAuthContext } from '../context/AuthContext'

interface Message {
  id: string
  text: string
  senderId: string
  senderRole: string
  createdAt: Timestamp | null
}

const roleBadge: Record<string, string> = {
  admin: 'text-purple-400',
  agent: 'text-blue-400',
  customer: 'text-slate-400',
}

interface TicketChatProps {
  ticketId: string
  isClosed: boolean
}

export function TicketChat({ ticketId, isClosed }: TicketChatProps) {
  const { user, role } = useAuthContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const messagesRef = collection(firestore, 'tickets', ticketId, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message))
    })

    return unsubscribe
  }, [ticketId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !user || !role || isClosed) return

    setSending(true)
    try {
      const messagesRef = collection(firestore, 'tickets', ticketId, 'messages')
      await addDoc(messagesRef, {
        text: text.trim(),
        senderId: user.uid,
        senderRole: role,
        createdAt: serverTimestamp(),
      })
      setText('')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (ts: Timestamp | null) => {
    if (!ts || !ts.toDate) return ''
    return ts.toDate().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col" style={{ height: 420 }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-slate-600 text-center py-8">Sin mensajes aun. Inicia la conversacion.</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.uid
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
                <div className={`flex items-center gap-1.5 mb-0.5 ${isMe ? 'justify-end' : ''}`}>
                  <span className={`text-[10px] font-medium capitalize ${roleBadge[msg.senderRole] ?? 'text-slate-500'}`}>
                    {msg.senderRole}
                  </span>
                  <span className="text-[10px] text-slate-600">{formatTime(msg.createdAt)}</span>
                </div>
                <div
                  className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="border-t border-slate-800 p-3 flex gap-2">
        {isClosed ? (
          <p className="flex-1 text-xs text-slate-600 text-center py-2">Ticket cerrado — chat deshabilitado</p>
        ) : (
          <>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Send size={16} />
            </button>
          </>
        )}
      </form>
    </div>
  )
}
