import { AlertTriangle, CheckCircle2, Clock, AlertOctagon } from 'lucide-react'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { MetricCard } from '../components/dashboard/MetricCard'
import { IncidentsByPriorityChart } from '../components/dashboard/IncidentsByPriorityChart'
import { MaintenanceComplianceChart } from '../components/dashboard/MaintenanceComplianceChart'
import { RecentActivityList } from '../components/dashboard/RecentActivityList'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export default function DashboardPage() {
  const metrics = useDashboardMetrics()

  if (!metrics) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <MetricCard
          icon={<AlertTriangle size={20} />}
          label="Incidencias Abiertas"
          value={metrics.openIncidents}
          color="text-amber-400"
        />
        <MetricCard
          icon={<AlertOctagon size={20} />}
          label="Criticas Abiertas"
          value={metrics.criticalOpenIncidents}
          color="text-red-400"
        />
        <MetricCard
          icon={<CheckCircle2 size={20} />}
          label="Cumplimiento Mant."
          value={`${metrics.completionPercentage}%`}
          color="text-emerald-400"
        />
        <MetricCard
          icon={<Clock size={20} />}
          label="Tareas Vencidas"
          value={metrics.overdueTasks}
          color="text-red-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <IncidentsByPriorityChart />
        <MaintenanceComplianceChart />
      </div>

      <RecentActivityList />
    </div>
  )
}
