import { NavLink } from 'react-router-dom'
import { LayoutDashboard, AlertTriangle, Wrench, Users } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/incidents', label: 'Incidencias', icon: AlertTriangle },
  { to: '/maintenance', label: 'Mantenimiento', icon: Wrench },
  { to: '/users', label: 'Usuarios', icon: Users },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-slate-900 border-r border-slate-800 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-tight">GIM</h1>
        <p className="text-xs text-slate-400 mt-1">Gestion de Incidencias</p>
      </div>
      <nav className="flex-1 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
