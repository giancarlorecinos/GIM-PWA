import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'

export function TopBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { results } = useGlobalSearch(query)
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(type: string, id: string) {
    setOpen(false)
    setQuery('')
    if (type === 'incident') navigate(`/incidents/${id}`)
    else if (type === 'maintenance') navigate(`/maintenance/${id}`)
    else navigate(`/users/${id}`)
  }

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 px-4 lg:px-6 h-14 flex items-center gap-4">
      <div ref={ref} className="relative w-full max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar incidencias, mantenimientos, usuarios..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X size={14} />
          </button>
        )}

        {open && results.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
            {results.map((r) => {
              const item = r.item
              const label = r.type === 'incident' ? 'INC' : r.type === 'maintenance' ? 'MNT' : 'USR'
              const color = r.type === 'incident'
                ? 'bg-amber-500/20 text-amber-400'
                : r.type === 'maintenance'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-purple-500/20 text-purple-400'
              const displayName = 'title' in item ? item.title : item.name
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(r.type, item.id)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-700 transition-colors flex items-center gap-3"
                >
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${color}`}>
                    {label}
                  </span>
                  <span className="text-sm text-slate-200 truncate">{displayName}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
