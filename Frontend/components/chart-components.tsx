"use client"

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"

interface ChartData {
  name: string
  value: number
  color?: string
}

interface SalesChartProps {
  data: ChartData[]
}

// ============================================================================
// COMPONENTE GRÁFICO DE VENTAS (CORREGIDO)
// ============================================================================
export function SalesChart({ data }: SalesChartProps) {
  // Calcular el valor máximo para el eje Y
  const maxValue = data.length > 0 
    ? Math.max(...data.map(item => item.value)) 
    : 0;
  
  // Establecer un dominio mínimo de 10000 o 20% más que el máximo
  const yAxisDomain = [0, Math.max(maxValue * 1.2, 10000)];

  // Formatear las fechas antes de renderizar
  const formattedData = data.map(item => ({
    ...item,
    name: formatChartDate(item.name)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      {/* CORRECCIÓN 1: Usar 'formattedData' en lugar de 'data' */}
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={yAxisDomain} />
        {/* Tooltip muestra el valor con signo $ y la etiqueta "Ventas" */}
        <Tooltip formatter={(value) => [`$${value}`, "Ventas"]} />
        <Legend />
        {/* CORRECCIÓN 2: Agregar 'name="Ventas"' para quitar la palabra "value" de la leyenda */}
        <Line 
          type="monotone" 
          dataKey="value" 
          name="Ventas" 
          stroke="#06b6d4" 
          strokeWidth={3} 
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Función auxiliar para formatear fechas
function formatChartDate(dateString: string): string {
  try {
    // Si ya está en formato dd/mm/yyyy o dd-mm-yyyy, dejarlo así
    if (dateString.match(/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/)) {
      return dateString;
    }
    
    // Intentar parsear como fecha ISO
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      // Usar UTC para evitar problemas de zona horaria
      const day = date.getUTCDate().toString().padStart(2, '0');
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  } catch {
    return dateString;
  }
}

// ============================================================================
// COMPONENTE PRODUCTOS MÁS VENDIDOS
// ============================================================================
export function ProductsPieChart({ data }: SalesChartProps) {
  const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie 
          data={data} 
          cx="50%" 
          cy="50%" 
          innerRadius={60} 
          outerRadius={120} 
          paddingAngle={5} 
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} unidades`, "Vendidas"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ============================================================================
// COMPONENTE INGRESOS POR CATEGORÍA
// ============================================================================
export function CategoryBarChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value}`, "Ingresos"]} />
        <Bar dataKey="value" fill="#06b6d4" name="Ingresos" />
      </BarChart>
    </ResponsiveContainer>
  )
}