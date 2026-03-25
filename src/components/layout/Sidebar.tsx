import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  AlertTriangle,
  Wrench,
  Users,
  Ticket,
  Plus,
  Inbox,
  ClipboardList,
  Shield,
  BarChart3,
  Settings,
  Radar,
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
  { to: '/dispatch', label: 'Dispatch', icon: Radar, roles: ['admin', 'agent'] },
  { to: '/incidents', label: 'Incidencias', icon: AlertTriangle, roles: ['admin', 'agent'] },
  { to: '/maintenance', label: 'Mantenimiento', icon: Wrench, roles: ['admin', 'agent'] },
  { to: '/users', label: 'Usuarios', icon: Users, roles: ['admin'] },
  { to: '/tickets', label: 'Mis Tickets', icon: Ticket, roles: ['customer'] },
  { to: '/tickets/new', label: 'Nuevo Ticket', icon: Plus, roles: ['customer'] },
  { to: '/tickets', label: 'Todos los Tickets', icon: ClipboardList, roles: ['admin'] },
  { to: '/agent/queue', label: 'Cola Global', icon: Inbox, roles: ['agent'] },
  { to: '/agent/assigned', label: 'Mis Asignados', icon: ClipboardList, roles: ['agent'] },
  { to: '/admin/users', label: 'Gestion Roles', icon: Shield, roles: ['admin'] },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin'] },
  { to: '/admin/settings', label: 'Categorias', icon: Settings, roles: ['admin'] },
]

export function Sidebar() {
  const { role } = useAuthContext()

  const visibleItems = navItems.filter((item) => role && item.roles.includes(role))

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-slate-900 border-r border-slate-800 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-extrabold tracking-tight"><span className="text-blue-500">Zyn</span><span className="text-white">cro</span></h1>
        <p className="text-xs text-slate-400 mt-1">Support Workspace</p>
      </div>
      <nav className="flex-1 px-3">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to + label}
            to={to}
            end={to === '/' || to === '/tickets'}
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
      <div className="px-3 pb-4">
        <div className="px-3 py-2 text-xs text-slate-600">
          Rol: <span className="text-slate-400 capitalize">{role}</span>
        </div>
      </div>
    </aside>
  )
}
