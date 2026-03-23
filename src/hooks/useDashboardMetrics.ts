import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { startOfMonth } from 'date-fns'
import type { DashboardMetrics } from '../types/models'

export function useDashboardMetrics(): DashboardMetrics | undefined {
  return useLiveQuery(async () => {
    const incidents = await db.incidents.toArray()
    const tasks = await db.maintenanceTasks.toArray()

    const monthStart = startOfMonth(new Date()).toISOString()

    const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'in-progress').length
    const criticalOpenIncidents = incidents.filter(
      (i) => i.priority === 'critical' && (i.status === 'open' || i.status === 'in-progress')
    ).length
    const resolvedThisMonth = incidents.filter(
      (i) => i.resolvedAt && i.resolvedAt >= monthStart
    ).length

    const completedTasks = tasks.filter((t) => t.status === 'completed').length
    const overdueTasks = tasks.filter((t) => t.status === 'overdue').length
    const totalMaintenanceTasks = tasks.length

    return {
      totalIncidents: incidents.length,
      openIncidents,
      criticalOpenIncidents,
      resolvedThisMonth,
      totalMaintenanceTasks,
      completedTasks,
      overdueTasks,
      completionPercentage: totalMaintenanceTasks > 0
        ? Math.round((completedTasks / totalMaintenanceTasks) * 100)
        : 0,
    }
  })
}
