import { useNavigate } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import type { EventClickArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { MaintenanceTask } from '../../types/models'

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  'in-progress': '#3b82f6',
  completed: '#10b981',
  overdue: '#ef4444',
}

interface MaintenanceCalendarProps {
  tasks: MaintenanceTask[]
}

export function MaintenanceCalendar({ tasks }: MaintenanceCalendarProps) {
  const navigate = useNavigate()

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    date: task.scheduledDate.split('T')[0],
    backgroundColor: statusColors[task.status] || '#64748b',
    borderColor: 'transparent',
  }))

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 [&_.fc]:text-slate-200 [&_.fc-toolbar-title]:text-lg [&_.fc-toolbar-title]:font-semibold [&_.fc-button]:!bg-slate-700 [&_.fc-button]:!border-slate-600 [&_.fc-button]:!text-slate-200 [&_.fc-button:hover]:!bg-slate-600 [&_.fc-button-active]:!bg-blue-600 [&_.fc-day-today]:!bg-blue-500/10 [&_.fc-daygrid-day-number]:text-sm [&_.fc-col-header-cell-cushion]:text-xs [&_.fc-col-header-cell-cushion]:text-slate-400 [&_.fc-event]:!text-xs [&_.fc-event]:!px-1.5 [&_.fc-event]:!py-0.5 [&_.fc-event]:!rounded [&_.fc-event]:cursor-pointer [&_.fc-scrollgrid]:!border-slate-800 [&_td]:!border-slate-800 [&_th]:!border-slate-800">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        locale="es"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek',
        }}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
        }}
        eventClick={(info: EventClickArg) => {
          navigate(`/maintenance/${info.event.id}`)
        }}
        height="auto"
      />
    </div>
  )
}
