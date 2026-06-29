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
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center transition-transform duration-200 hover:scale-110">
              <Package className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg">Inventario</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "transition-all duration-200 ease-out",
                  "relative overflow-hidden group",
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "text-gray-400 hover:text-white hover:bg-slate-800",
                )}
              >
                {/* indicador izquierdo en item activo */}
                {activeTab === item.id && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                )}
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    activeTab === item.id
                      ? "scale-110"
                      : "group-hover:scale-110 group-hover:translate-x-0.5",
                  )}
                />
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  {item.label}
                </span>
              </button>
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
              "transition-all duration-200 ease-out",
              activeTab === item.id
                ? "text-blue-400 font-bold"
                : "text-gray-400 active:text-gray-200",
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 mb-1 transition-transform duration-200",
                activeTab === item.id ? "text-blue-400 scale-110" : "",
              )}
            />
            {/* línea activa debajo del ícono */}
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full mb-0.5 transition-all duration-200",
                activeTab === item.id ? "bg-blue-400 scale-x-100" : "scale-x-0",
              )}
            />
            <span style={{ fontSize: "10px" }} className="text-center leading-tight">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
