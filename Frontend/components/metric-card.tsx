"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: "blue" | "cyan" | "green" | "orange" | "red" | "purple" | "pink"
  onClick?: () => void
}

const colorClasses = {
  blue: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
  cyan: "bg-gradient-to-br from-cyan-400 to-cyan-500 text-white",
  green: "bg-gradient-to-br from-green-500 to-green-600 text-white",
  orange: "bg-gradient-to-br from-orange-500 to-orange-600 text-white",
  red: "bg-gradient-to-br from-red-500 to-red-600 text-white",
  purple: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
  pink: "bg-gradient-to-br from-pink-500 to-pink-600 text-white",
}

export function MetricCard({ title, value, subtitle, icon: Icon, color, onClick }: MetricCardProps) {
  return (
    <Card
      className={`${colorClasses[color]} cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium opacity-90">{title}</p>
            <p className="text-2xl md:text-3xl font-bold mt-2 truncate">{value}</p>
            {subtitle && <p className="text-sm opacity-75 mt-1">{subtitle}</p>}
          </div>
          <div className="shrink-0">
            <Icon className="h-10 w-10 md:h-12 md:w-12 opacity-80" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
