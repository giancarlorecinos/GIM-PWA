import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  AlertTriangle,
  Ticket,
  Plus,
  Inbox,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'
import { useAuthContext, type UserRole } from '../../context/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'agent'] },
  { to: '/incidents', label: 'Incidencias', icon: AlertTriangle, roles: ['admin', 'agent'] },
  { to: '/tickets', label: 'Mis Tickets', icon: Ticket, roles: ['customer'] },
  { to: '/tickets/new', label: 'Nuevo', icon: Plus, roles: ['customer'] },
  { to: '/agent/queue', label: 'Cola', icon: Inbox, roles: ['agent'] },
  { to: '/agent/assigned', label: 'Asignados', icon: ClipboardList, roles: ['agent'] },
  { to: '/tickets', label: 'Tickets', icon: Ticket, roles: ['admin'] },
]

export function MobileNav() {
  const { role } = useAuthContext()

  const visibleItems = navItems.filter((item) => role && item.roles.includes(role))

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 flex">
      {visibleItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to + label}
          to={to}
          end={to === '/' || to === '/tickets'}
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
