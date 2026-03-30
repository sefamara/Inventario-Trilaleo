"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, Users, History, TrendingUp, Settings, FileText, ShoppingBag, Tag } from "lucide-react"

interface SidebarNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Productos", icon: Package },
  { id: "categories", label: "Categorías", icon: Tag },
  { id: "sales", label: "Punto de Venta", icon: ShoppingCart },
  { id: "supplying", label: "Abastecimiento", icon: ShoppingBag },
  { id: "suppliers", label: "Proveedores", icon: Users },
  { id: "inventory", label: "Inventario", icon: TrendingUp },
  { id: "history", label: "Historial", icon: History },
  { id: "reports", label: "Reportes", icon: FileText },
]

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">Inventario Trilaleo</span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left",
                activeTab === item.id
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-300 hover:text-white hover:bg-slate-800",
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* <div className="mt-8 pt-8 border-t border-slate-700">
          <p className="text-xs text-gray-400 mb-2">Mantenimiento</p>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-800">
            <Settings className="mr-3 h-4 w-4" />
            Configuración
          </Button>
        </div> */}
      </div>
    </div>
  )
}
