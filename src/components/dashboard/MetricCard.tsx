import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

interface MetricCardProps {
  icon: ReactNode
  label: string
  value: number | string
  color?: string
}

export function MetricCard({ icon, label, value, color = 'text-blue-400' }: MetricCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`p-2.5 rounded-lg bg-slate-800 ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </Card>
  )
}
