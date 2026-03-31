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
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-slate-900 text-white min-h-screen flex-col">
        <div className="p-6 flex-1">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg">Inventario</span>
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
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white flex items-center p-3 z-40 border-b border-slate-800">
         <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center mr-2">
            <Package className="h-4 w-4" />
         </div>
         <span className="font-bold">Trilaleo</span>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-white z-50 border-t border-slate-800 flex overflow-x-auto hide-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 min-w-[70px]",
              activeTab === item.id
                ? "text-blue-400 font-bold"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            <item.icon className={cn("h-5 w-5 mb-1", activeTab === item.id ? "text-blue-400" : "")} />
            <span style={{fontSize: "10px"}} className="text-center">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}
