import { NavLink } from 'react-router-dom'
import { LayoutDashboard, AlertTriangle, Wrench, Users } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/incidents', label: 'Incidencias', icon: AlertTriangle },
  { to: '/maintenance', label: 'Mantenim.', icon: Wrench },
  { to: '/users', label: 'Usuarios', icon: Users },
]

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 flex">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-400' : 'text-slate-400'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
