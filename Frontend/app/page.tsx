"use client"

import type React from "react"

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Plus,
  Minus,
  TrendingUp,
  Edit,
  Trash2,
  FileSpreadsheet,
  History,
  Bell,
  BarChart3,
  PieChart,
  Activity,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Star,
  UserCheck,
  Tag,
  Download,
  XCircle,
  Calendar,
  ShoppingBag,
  AlertCircle,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Importar componentes personalizados
import { MetricCard } from "@/components/metric-card"
import { SidebarNav } from "@/components/sidebar-nav"
import { SalesChart, ProductsPieChart, CategoryBarChart } from "@/components/chart-components"
import { exportToExcel } from "@/utils/excel-export"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ===================================================================================================================================================================================================================
// SECCIÓN 1: INTERFACES Y TIPOS
// ===================================================================================================================================================================================================================

interface Product {
  id: number
  name: string
  sku: string
  barcode: string
  price: number
  cost: number
  stock: number
  minStock: number
  category: string  
  categoryId: number  
  description: string
  wholesalePrice: number
  expiryDate?: string
  warrantyMonths?: number
  lastSoldDate?: string
  observations?: string
}

// INTERFAZ DE PROVEEDORES
interface Supplier {
  id_proveedor: number;
  empresa: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  productos_que_surte: string;
  productos_ids?: number[];
  ciudad?: string;
  rut?: string;
  condiciones_pago?: string;
  tiempo_entrega?: string;
  activo?: boolean;
}

// INTERFAZ DE VENTA
interface Sale {
  id: number
  saleNumber: string
  items: SaleItem[]
  subtotal: number
  total: number
  date: string
  customerId?: number
  customerName?: string
  discount: number
  promotionId?: number
  promotionName?: string
  discountBreakdown: DiscountBreakdown[]
  isWholesale: boolean
  status: "completed" | "cancelled"
  paymentMethod?: "cash" | "transfer" | "card"
  isInternalPurchase?: boolean
}

// INTERFAZ DEL PRODUCTO VENDIDO
interface SaleItem {
  productId: number
  productName: string
  quantity: number
  price: number
  subtotal: number
  discount: number
}

// INTERFAZ MOVIMIENTOS DE INVENTARIO
interface InventoryMovement {
  id: number                    
  productId: number             
  productName: string        
  type: "entrada" | "salida" | "ajuste" | "devolucion"  
  quantity: number             
  previousStock: number          
  newStock: number           
  unitCost: number            
  unitPrice: number          
  totalCost: number            
  totalValue: number          
  reason: string              
  date: string                
  id_venta?: number
  venta_numero?: string
  id_proveedor?: number
  proveedor_nombre?: string
  usuario?: string
}

// INTERFAZ PARA LOS DATOS DE LA API
interface ProductoFromAPI {
  id_producto: number;
  nombre: string;
  descripcion: string;
  stock: number;
  id_categoria: number;
  categoria_nombre: string;
  precio?: number;
  precio_mayorista?: number;
  costo?: number;
  min_stock?: number;
  sku?: string;
  barcode?: string;
  observaciones?: string;
  fecha_vencimiento?: string;
}

// INTERFAZ DE CLIENTES
interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  isFrequent: boolean
  isWholesale: boolean
  totalPurchases: number
  totalSpent: number
  registrationDate: string
  lastPurchaseDate: string
  notes: string
}

// INTERFAZ PARA PROMOCIONES
interface Promotion {
  id: number
  name: string
  description: string
  discountType: "percentage" | "fixed" | "bundle"
  discountValue: number
  bundleBuy: number
  bundlePay: number
  appliesTo: "all" | "specific" | "category"
  specificProducts: number[]
  specificCategories: string[]
  minPurchase: number
  forFrequentOnly: boolean
  isActive: boolean
  startDate: string
  endDate: string
}

// INTERFAZ PARA DESGLOSE DE DESCUENTOS
interface DiscountBreakdown {
  productId: number
  productName: string
  promotionName: string
  discountAmount: number
}

interface VentaFromAPI {
  id_venta: number;
  numero_venta: string;
  id_cliente: number | null;
  id_promocion: number | null;
  subtotal: number;
  descuento: number;
  total: number;
  fecha: string;
  metodo_pago: string;
  es_mayorista: boolean;
  estado: string;
}

interface DetalleVentaFromAPI {
  id_detalle: number; 
  id_presentacion: number;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
}

interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  total: number;
  date: string;
  status: "pending" | "completed" | "cancelled";
  expectedDelivery?: string;
  notes?: string;
}

interface PurchaseOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  receivedQuantity?: number; // Cantidad recibida
}

// INTERFAZ ORDEN DE COMPRA
interface OrdenCompra {
  id_orden_compra: number;
  numero_orden: string;
  id_proveedor: number;
  proveedor_nombre: string;
  items: OrdenCompraItem[];
  subtotal: number;
  total: number;
  fecha_creacion: string;
  fecha_esperada: string;
  estado: "pendiente" | "parcial" | "completada" | "cancelada";
  notas?: string;
}

// INTERFAZ ITEM ORDEN DE COMPRA
interface OrdenCompraItem {
  id_detalle_orden: number;
  id_orden_compra: number;
  id_producto: number;
  producto_nombre: string;
  cantidad_solicitada: number;
  cantidad_recibida: number;
  costo_unitario: number;
  subtotal: number;
}

// INTERFAZ DEVOLUCIÓN PROVEEDOR
interface DevolucionProveedor {
  id_devolucion: number;
  id_orden_compra: number;
  numero_orden: string;
  id_producto: number;
  producto_nombre: string;
  cantidad: number;
  motivo: string;
  fecha_devolucion: string;
  estado: "pendiente" | "aprobada" | "rechazada" | "completada";
}

// INTERFAZ PARA PRESENTACIONES
interface Presentacion {
  id_presentacion: number;
  id_producto: number;
  nombre?: string;
  capacidad?: string;
  unidad_medida?: string;
  precio_venta?: number;
  costo?: number;
  stock?: number;
  sku?: string;
  barcode?: string;
  estado?: string;
  fecha_creacion?: string;
}

// ===================================================================================================================================================================================================================
// SECCIÓN 2: COMPONENTES DE FORMULARIOS
// ===================================================================================================================================================================================================================

const EditProductForm: React.FC<{ 
  product: Product; 
  onSave: (product: Product) => void; 
  onCancel: () => void;
  categories: any[];
}> = ({ product, onSave, onCancel, categories }) => {
  const [editedProduct, setEditedProduct] = useState(product)

  const handleSave = () => {
    onSave(editedProduct)
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div>
        <Label htmlFor="edit-product-name">Nombre *</Label>
        <Input
          id="edit-product-name"
          value={editedProduct.name}
          onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
          placeholder="Nombre del producto"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-product-sku">SKU</Label>
          <Input
            id="edit-product-sku"
            value={editedProduct.sku}
            onChange={(e) => setEditedProduct({ ...editedProduct, sku: e.target.value })}
            placeholder="SKU del producto"
          />
        </div>
        <div>
          <Label htmlFor="edit-product-barcode">Código de Barras</Label>
          <Input
            id="edit-product-barcode"
            value={editedProduct.barcode}
            onChange={(e) => setEditedProduct({ ...editedProduct, barcode: e.target.value })}
            placeholder="7501234567890"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="edit-product-price">Precio Minorista *</Label>
          <Input
            id="edit-product-price"
            type="number"
            value={editedProduct.price}
            onChange={(e) => setEditedProduct({ ...editedProduct, price: Number(e.target.value) })}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="edit-product-wholesale">Precio Mayorista</Label>
          <Input
            id="edit-product-wholesale"
            type="number"
            value={editedProduct.wholesalePrice}
            onChange={(e) => setEditedProduct({ ...editedProduct, wholesalePrice: Number(e.target.value) })}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="edit-product-cost">Costo</Label>
          <Input
            id="edit-product-cost"
            type="number"
            value={editedProduct.cost}
            onChange={(e) => setEditedProduct({ ...editedProduct, cost: Number(e.target.value) })}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-product-stock">Stock</Label>
          <Input
            id="edit-product-stock"
            type="number"
            value={editedProduct.stock}
            onChange={(e) => setEditedProduct({ ...editedProduct, stock: Number(e.target.value) })}
            placeholder="0"
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="edit-product-minstock">Stock Mínimo</Label>
          <Input
            id="edit-product-minstock"
            type="number"
            value={editedProduct.minStock}
            onChange={(e) => setEditedProduct({ ...editedProduct, minStock: Number(e.target.value) })}
            placeholder="1"
            min="1"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-product-category">Categoría *</Label>
          <select
            id="edit-product-category"
            value={editedProduct.categoryId}
            onChange={(e) => {
              const newCategoryId = Number(e.target.value);
              console.log('🔍 EDITAR - Categoría seleccionada:', newCategoryId);
              setEditedProduct({ 
                ...editedProduct, 
                categoryId: newCategoryId,
                category: categories.find(cat => cat.id_categoria === newCategoryId)?.nombre || editedProduct.category
              });
            }}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre} (ID: {cat.id_categoria}) {/* ← Agregar ID para debug */}
              </option>
            ))}
          </select>
          {!editedProduct.categoryId ? (
            <p className="text-red-500 text-sm mt-1">Debes seleccionar una categoría</p>
          ) : (
            <p className="text-green-500 text-sm mt-1">Categoría seleccionada: ID {editedProduct.categoryId}</p>
          )}
        </div>
        <div>
          <Label htmlFor="edit-product-expiry">Fecha de Vencimiento</Label>
          <Input
            id="edit-product-expiry"
            type="date"
            value={editedProduct.expiryDate || ""}
            onChange={(e) => setEditedProduct({ ...editedProduct, expiryDate: e.target.value })}
          />
        </div>
      </div>
      
      {/* <div>
        <Label htmlFor="edit-product-warranty">Garantía (meses)</Label>
        <Input
          id="edit-product-warranty"
          type="number"
          value={editedProduct.warrantyMonths || 0}
          onChange={(e) => setEditedProduct({ ...editedProduct, warrantyMonths: Number(e.target.value) })}
          placeholder="0"
          min="0"
        />
      </div> */}
      
      {/* <div>
        <Label htmlFor="edit-product-description">Descripción *</Label>
        <Textarea
          id="edit-product-description"
          value={editedProduct.description}
          onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
          placeholder="Descripción del producto"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="edit-product-observations">Observaciones</Label>
        <Textarea
          id="edit-product-observations"
          value={editedProduct.observations || ""}
          onChange={(e) => setEditedProduct({ ...editedProduct, observations: e.target.value })}
          placeholder="Notas adicionales sobre el producto"
          rows={2}
        />
      </div> */}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Edit className="h-4 w-4 mr-2" />
          Actualizar Producto
        </Button>
      </div>
    </div>
  )
}

// FORMULARIO DE EDICION DE PROVEEDORES
const EditSupplierForm: React.FC<{
  supplier: Supplier
  onSave: (supplier: Supplier) => void
  onCancel: () => void
  products: Product[]
}> = ({ supplier, onSave, onCancel, products }) => {
  const [editedSupplier, setEditedSupplier] = useState<Supplier>({
    ...supplier,
    ciudad: supplier.ciudad || "",
    rut: supplier.rut || "",
    condiciones_pago: supplier.condiciones_pago || "",
    tiempo_entrega: supplier.tiempo_entrega || "",
    activo: supplier.activo !== false,
    productos_ids: supplier.productos_ids || [],
    productos_que_surte: supplier.productos_que_surte || ""
  });

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    supplier.productos_ids || []
  );

  const handleSave = () => {
    if (!isValidEmail(editedSupplier.email)) {
      alert('Por favor ingresa un email válido (ejemplo: nombre@empresa.com)');
      return;
    }
    const updatedSupplier = {
      ...editedSupplier,
      productos_ids: selectedProductIds,
      productos_que_surte: selectedProductIds
        .map(id => products.find(p => p.id === id)?.name)
        .filter(Boolean)
        .join(', ')
    }
    onSave(updatedSupplier)
  }

  const toggleProduct = (productId: number) => {
    setSelectedProductIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div>
        <Label htmlFor="edit-supplier-empresa">Empresa *</Label>
        <Input
          id="edit-supplier-empresa"
          value={editedSupplier.empresa}
          onChange={(e) => setEditedSupplier({ ...editedSupplier, empresa: e.target.value })}
          placeholder="Nombre de la empresa"
        />
      </div>
      
      <div>
        <Label htmlFor="edit-supplier-contacto">Contacto *</Label>
        <Input
          id="edit-supplier-contacto"
          value={editedSupplier.contacto}
          onChange={(e) => setEditedSupplier({ ...editedSupplier, contacto: e.target.value })}
          placeholder="Nombre del contacto"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-supplier-email">Email</Label>
          <Input
            id="edit-supplier-email"
            type="email"
            value={editedSupplier.email}
            onChange={(e) => setEditedSupplier({ ...editedSupplier, email: e.target.value })}
            placeholder="email@empresa.com"
          />
        </div>
        <div>
          <Label htmlFor="edit-supplier-telefono">Teléfono</Label>
          <Input
            id="edit-supplier-telefono"
            value={editedSupplier.telefono}
            onChange={(e) => setEditedSupplier({ ...editedSupplier, telefono: e.target.value })}
            placeholder="555-0000"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-supplier-direccion">Dirección</Label>
        <Input
          id="edit-supplier-direccion"
          value={editedSupplier.direccion}
          onChange={(e) => setEditedSupplier({ ...editedSupplier, direccion: e.target.value })}
          placeholder="Dirección completa"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="edit-supplier-ciudad">Ciudad</Label>
          <Input
            id="edit-supplier-ciudad"
            value={editedSupplier.ciudad || ""}
            onChange={(e) => setEditedSupplier({ ...editedSupplier, ciudad: e.target.value })}
            placeholder="Ciudad"
          />
        </div>
        <div>
          <Label htmlFor="edit-supplier-rut">RUT</Label>
          <Input
            id="edit-supplier-rut"
            value={editedSupplier.rut || ""}
            onChange={(e) => setEditedSupplier({ ...editedSupplier, rut: e.target.value })}
            placeholder="RUT"
          />
        </div>
        <div>
          <Label htmlFor="edit-supplier-tiempo-entrega">Tiempo de Entrega</Label>
          <Input
            id="edit-supplier-tiempo-entrega"
            value={editedSupplier.tiempo_entrega || ""}
            onChange={(e) => setEditedSupplier({ ...editedSupplier, tiempo_entrega: e.target.value })}
            placeholder="24-48 horas"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-supplier-condiciones-pago">Condiciones de Pago</Label>
        <Select
          value={editedSupplier.condiciones_pago || ""}
          onValueChange={(value) => setEditedSupplier({ ...editedSupplier, condiciones_pago: value })}
        >
          <SelectTrigger id="edit-supplier-condiciones-pago">
            <SelectValue placeholder="Seleccione condición de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
            <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
            <SelectItem value="Transferencia">Transferencia</SelectItem>
            <SelectItem value="Efectivo">Efectivo</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
            <SelectItem value="Otro medio">Otro medio</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Productos que Suministra</Label>
        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center space-x-2">
              <Checkbox
                id={`edit-product-${product.id}`}
                checked={selectedProductIds.includes(product.id)}
                onCheckedChange={() => toggleProduct(product.id)}
              />
              <Label htmlFor={`edit-product-${product.id}`} className="cursor-pointer flex-1">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground">
                  SKU: {product.sku} | Categoría: {product.category}
                </div>
              </Label>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedProductIds.length} productos seleccionados
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="edit-supplier-activo"
          checked={editedSupplier.activo !== false}
          onCheckedChange={(checked) => setEditedSupplier({ ...editedSupplier, activo: checked })}
        />
        <Label htmlFor="edit-supplier-activo" className="cursor-pointer">
          Proveedor activo
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Edit className="h-4 w-4 mr-2" />
          Actualizar Proveedor
        </Button>
      </div>
    </div>
  )
}

// ============================================================================== COMPONENTES DE GESTIÓN DE ABASTECIMIENTO ==============================================================================

// Componente para crear orden de compra
const PurchaseOrderForm: React.FC<{
  suppliers: Supplier[]
  products: Product[]
  onSave: (order: OrdenCompra) => void
  onCancel: () => void
  setErrors: (errors: any) => void // NUEVO PROP
  setNotifications: (notifications: any) => void // NUEVO PROP
}> = ({ suppliers, products, onSave, onCancel, setErrors, setNotifications }) => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [orderItems, setOrderItems] = useState<OrdenCompraItem[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [notes, setNotes] = useState("")
  const [expectedDate, setExpectedDate] = useState("")

  // Filtrar productos cuando se selecciona un proveedor
  useEffect(() => {
    if (selectedSupplier?.productos_ids) {
      const supplierProducts = products.filter(product => 
        selectedSupplier.productos_ids?.includes(product.id)
      )
      setAvailableProducts(supplierProducts)
    } else {
      setAvailableProducts([])
    }
    setOrderItems([])
  }, [selectedSupplier, products])

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.id_producto === product.id)
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.id_producto === product.id
          ? { 
              ...item, 
              cantidad_solicitada: item.cantidad_solicitada + 1, 
              subtotal: (item.cantidad_solicitada + 1) * item.costo_unitario 
            }
          : item
      ))
    } else {
      setOrderItems([
        ...orderItems,
        {
          id_detalle_orden: Date.now(),
          id_orden_compra: 0,
          id_producto: product.id,
          producto_nombre: product.name,
          cantidad_solicitada: 1,
          cantidad_recibida: 0,
          costo_unitario: product.cost,
          subtotal: product.cost
        }
      ])
    }
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.id_producto !== productId))
      return
    }

    setOrderItems(orderItems.map(item =>
      item.id_producto === productId
        ? { ...item, cantidad_solicitada: quantity, subtotal: quantity * item.costo_unitario }
        : item
    ))
  }

  const updateCost = (productId: number, cost: number) => {
    setOrderItems(orderItems.map(item =>
      item.id_producto === productId
        ? { ...item, costo_unitario: cost, subtotal: cost * item.cantidad_solicitada }
        : item
    ))
  }

  const removeItem = (productId: number) => {
    setOrderItems(orderItems.filter(item => item.id_producto !== productId))
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
  const total = subtotal

  const handleSubmit = async () => {
    if (!selectedSupplier || orderItems.length === 0) {
      setErrors((prev: { [key: string]: string }) => ({ 
        ...prev, 
        purchaseOrder: 'Selecciona un proveedor y agrega productos a la orden' 
      }))
      return
    }

    if (!expectedDate) {
      setErrors((prev: { [key: string]: string }) => ({ 
        ...prev, 
        purchaseOrder: 'La fecha esperada de entrega es requerida' 
      }))
      return
    }

    try {
      const orderData = {
        id_proveedor: selectedSupplier.id_proveedor,
        subtotal: subtotal,
        total: total,
        fecha_esperada: expectedDate,
        notas: notes,
        items: orderItems.map(item => ({
          id_producto: item.id_producto,
          cantidad_solicitada: item.cantidad_solicitada,
          costo_unitario: item.costo_unitario,
          subtotal: item.subtotal
        }))
      }

      const createdOrder = await api.createOrdenCompra(orderData)
      onSave(createdOrder)
      
      setNotifications((prev: Array<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        timestamp: Date;
      }>) => [{
        type: 'success' as const,
        message: `Orden de compra ${createdOrder.numero_orden} creada correctamente`,
        timestamp: new Date()
      }, ...prev])

    } catch (error: any) {
      console.error('❌ Error creando orden de compra:', error)
      setErrors((prev: { [key: string]: string }) => ({ 
        ...prev, 
        purchaseOrder: 'Error al crear la orden de compra: ' + error.message 
      }))
    }
  }

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div>
        <Label htmlFor="select-supplier">Proveedor *</Label>
        <Select
          value={selectedSupplier?.id_proveedor.toString() || ""}
          onValueChange={(value) => {
            const supplier = suppliers.find(s => s.id_proveedor === parseInt(value))
            setSelectedSupplier(supplier || null)
          }}
        >
          <SelectTrigger id="select-supplier">
            <SelectValue placeholder="Selecciona un proveedor" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.filter(s => s.activo).map(supplier => (
              <SelectItem 
                key={supplier.id_proveedor} 
                value={supplier.id_proveedor.toString()}
              >
                {supplier.empresa} - {supplier.contacto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="expected-date">Fecha Esperada de Entrega *</Label>
        <Input
          id="expected-date"
          type="date"
          value={expectedDate}
          onChange={(e) => setExpectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {selectedSupplier && (
        <>
          <div>
            <Label>Productos Disponibles del Proveedor</Label>
            <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {availableProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {product.sku} | Costo: ${product.cost} | Stock: {product.stock}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => addProductToOrder(product)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {availableProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Este proveedor no tiene productos asignados
                </p>
              )}
            </div>
          </div>

          {orderItems.length > 0 && (
            <div>
              <Label>Productos en la Orden</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {orderItems.map(item => (
                  <div key={item.id_producto} className="flex justify-between items-center p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{item.producto_nombre}</div>
                      <div className="text-sm text-muted-foreground flex gap-4 mt-1">
                        <div>
                          <Label htmlFor={`cost-${item.id_producto}`} className="text-xs">Costo Unitario</Label>
                          <Input
                            id={`cost-${item.id_producto}`}
                            type="number"
                            value={item.costo_unitario}
                            onChange={(e) => updateCost(item.id_producto, Number(e.target.value))}
                            className="w-24 h-8"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id_producto, item.cantidad_solicitada - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.cantidad_solicitada}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id_producto, item.cantidad_solicitada + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => removeItem(item.id_producto)}
                      >
                        ×
                      </Button>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-medium">${item.subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="order-notes">Notas (opcional)</Label>
            <Textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales para la orden de compra..."
            />
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={!selectedSupplier || orderItems.length === 0 || !expectedDate}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Crear Orden de Compra
        </Button>
      </div>
    </div>
  )
}

// Componente para recepcionar productos
const ReceiveProductsForm: React.FC<{
  order: OrdenCompra
  onSave: (orderId: number, items: any[]) => void
  onCancel: () => void
  setErrors: (errors: any) => void
  setNotifications: (notifications: any) => void
}> = ({ order, onSave, onCancel, setErrors, setNotifications }) => {
  const [receivedItems, setReceivedItems] = useState<OrdenCompraItem[]>([])

  useEffect(() => {
    setReceivedItems([...order.items])
  }, [order])

  const updateReceivedQuantity = (itemId: number, quantity: number) => {
    const item = receivedItems.find(item => item.id_detalle_orden === itemId)
    if (!item) return

    const maxQuantity = item.cantidad_solicitada - item.cantidad_recibida
    const finalQuantity = Math.max(0, Math.min(quantity, maxQuantity))

    setReceivedItems(receivedItems.map(item =>
      item.id_detalle_orden === itemId
        ? { ...item, cantidad_recibida: finalQuantity }
        : item
    ))
  }

  const handleSubmit = async () => {
    const itemsToUpdate = receivedItems
      .filter(item => item.cantidad_recibida > 0)
      .map(item => ({
        id_detalle_orden: item.id_detalle_orden,
        cantidad_recibida: item.cantidad_recibida
      }))

    if (itemsToUpdate.length === 0) {
      setErrors((prev: { [key: string]: string }) => ({ 
        ...prev, 
        receiveProducts: 'No hay cantidades para recibir' 
      }))
      return
    }

    try {
      await api.recibirProductosOrden(order.id_orden_compra, itemsToUpdate)
      onSave(order.id_orden_compra, itemsToUpdate)
      
      setNotifications((prev: Array<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        timestamp: Date;
      }>) => [{
        type: 'success' as const,
        message: `Productos recibidos para orden ${order.numero_orden}`,
        timestamp: new Date()
      }, ...prev])

    } catch (error: any) {
      console.error('❌ Error recibiendo productos:', error)
      setErrors((prev: { [key: string]: string }) => ({ 
        ...prev, 
        receiveProducts: 'Error al recibir productos: ' + error.message 
      }))
    }
  }

  const totalReceived = receivedItems.reduce((sum, item) => sum + item.cantidad_recibida, 0)
  const totalRequested = receivedItems.reduce((sum, item) => sum + item.cantidad_solicitada, 0)

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900">Orden: {order.numero_orden}</h3>
        <p className="text-sm text-blue-700">Proveedor: {order.proveedor_nombre}</p>
        <p className="text-sm text-blue-700">
          Progreso: {totalReceived} / {totalRequested} unidades recibidas
        </p>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {receivedItems.map(item => (
          <div key={item.id_detalle_orden} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{item.producto_nombre}</div>
              <div className="text-sm text-muted-foreground">
                Solicitado: {item.cantidad_solicitada} | Ya recibido: {item.cantidad_recibida} | 
                Pendiente: {item.cantidad_solicitada - item.cantidad_recibida}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={item.cantidad_recibida}
                onChange={(e) => updateReceivedQuantity(item.id_detalle_orden, Number(e.target.value))}
                className="w-20"
                min="0"
                max={item.cantidad_solicitada - item.cantidad_recibida}
              />
              <span className="text-sm text-muted-foreground">de {item.cantidad_solicitada}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          <Package className="h-4 w-4 mr-2" />
          Confirmar Recepción
        </Button>
      </div>
    </div>
  )
}

// Componente para crear devolución (NUEVO)
const CreateReturnForm: React.FC<{
  orders: OrdenCompra[]
  onSave: (returnData: any) => void
  onCancel: () => void
  setErrors: (errors: any) => void // NUEVO PROP
  setNotifications: (notifications: any) => void // NUEVO PROP
}> = ({ orders, onSave, onCancel, setErrors, setNotifications }) => {
  const [selectedOrder, setSelectedOrder] = useState<OrdenCompra | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<OrdenCompraItem | null>(null)
  const [quantity, setQuantity] = useState(0)
  const [reason, setReason] = useState("")

  const completedOrders = orders.filter(order => order.estado === 'completada')

  const handleSubmit = async () => {
    if (!selectedOrder || !selectedProduct || quantity <= 0 || !reason.trim()) {
      setErrors((prev: { [key: string]: string }) => ({ 
        ...prev, 
        createReturn: 'Completa todos los campos requeridos' 
      }))
      return
    }

    if (quantity > selectedProduct.cantidad_recibida) {
      setErrors((prev: { [key: string]: string }) => ({ 
        ...prev, 
        createReturn: 'La cantidad no puede ser mayor a la recibida' 
      }))
      return
    }

    try {
      const returnData = {
        id_orden_compra: selectedOrder.id_orden_compra,
        id_producto: selectedProduct.id_producto,
        cantidad: quantity,
        motivo: reason
      }

      const createdReturn = await api.createDevolucionProveedor(returnData)
      onSave(createdReturn)
      
      setNotifications((prev: Array<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        timestamp: Date;
      }>) => [{
        type: 'success' as const,
        message: `Devolución creada correctamente`,
        timestamp: new Date()
      }, ...prev])

    } catch (error: any) {
      console.error('❌ Error creando devolución:', error)
      setErrors((prev: { [key: string]: string }) => ({ 
        ...prev, 
        createReturn: 'Error al crear la devolución: ' + error.message 
      }))
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="select-order">Orden de Compra *</Label>
        <Select
          value={selectedOrder?.id_orden_compra.toString() || ""}
          onValueChange={(value) => {
            const order = completedOrders.find(o => o.id_orden_compra === parseInt(value))
            setSelectedOrder(order || null)
            setSelectedProduct(null)
            setQuantity(0)
          }}
        >
          <SelectTrigger id="select-order">
            <SelectValue placeholder="Selecciona una orden completada" />
          </SelectTrigger>
          <SelectContent>
            {completedOrders.map(order => (
              <SelectItem 
                key={order.id_orden_compra} 
                value={order.id_orden_compra.toString()}
              >
                {order.numero_orden} - {order.proveedor_nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedOrder && (
        <>
          <div>
            <Label htmlFor="select-product">Producto *</Label>
            <Select
              value={selectedProduct?.id_producto.toString() || ""}
              onValueChange={(value) => {
                const product = selectedOrder.items.find(p => p.id_producto === parseInt(value))
                setSelectedProduct(product || null)
                setQuantity(0)
              }}
            >
              <SelectTrigger id="select-product">
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent>
                {selectedOrder.items.map(item => (
                  <SelectItem 
                    key={item.id_producto} 
                    value={item.id_producto.toString()}
                  >
                    {item.producto_nombre} (Recibido: {item.cantidad_recibida})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <>
              <div>
                <Label htmlFor="return-quantity">Cantidad a Devolver *</Label>
                <Input
                  id="return-quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  max={selectedProduct.cantidad_recibida}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Máximo: {selectedProduct.cantidad_recibida} unidades
                </p>
              </div>

              <div>
                <Label htmlFor="return-reason">Motivo de la Devolución *</Label>
                <Textarea
                  id="return-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe el motivo de la devolución..."
                  rows={3}
                />
              </div>
            </>
          )}
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!selectedOrder || !selectedProduct || quantity <= 0 || !reason.trim()}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Crear Devolución
        </Button>
      </div>
    </div>
  )
}

// ===================================================================================================================================================================================================================
// SECCIÓN 3: CONSTANTES Y CONFIGURACIONES
// ===================================================================================================================================================================================================================

const CONDICIONES_PAGO = [
  "Tarjeta de Crédito",
  "Tarjeta de Débito", 
  "Transferencia",
  "Efectivo",
  "Cheque",
  "Otro medio"
] as const;

const DEFAULT_MIN_STOCK = 5;

// ===================================================================================================================================================================================================================
// SECCIÓN 4: FUNCIONES DE UTILIDAD
// ===================================================================================================================================================================================================================

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const safeNumber = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Funciones helper para mapeo de datos
const mapPaymentMethod = (metodo: string): "cash" | "transfer" | "card" => {
  switch(metodo) {
    case 'efectivo': return 'cash'
    case 'transferencia': return 'transfer'
    case 'tarjeta': return 'card'
    default: return 'cash'
  }
}

const mapPaymentMethodToDB = (method: "cash" | "transfer" | "card"): string => {
  switch(method) {
    case 'cash': return 'efectivo'
    case 'transfer': return 'transferencia'
    case 'card': return 'tarjeta'
    default: return 'efectivo'
  }
}

const mapSaleStatus = (estado: string): "completed" | "cancelled" => {
  if (!estado) return 'completed';
  
  const estadoLower = estado.toLowerCase();
  switch(estadoLower) {
    case 'completada': 
    case 'completed': 
    case 'finalizada':
    case 'pagada':
      return 'completed';
    case 'cancelada': 
    case 'cancelled': 
    case 'cancelada':
      return 'cancelled';
    default: 
      console.warn(`Estado de venta no reconocido: "${estado}", usando "completed" por defecto`);
      return 'completed';
  }
};

// Formateo de moneda
const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Cálculo de descuentos por producto
const calculateProductDiscount = (
  productId: number,
  productPrice: number,
  quantity: number,
  customer: Customer | null,
  promotions: Promotion[],
  products: Product[]
): { discount: number; promotion: Promotion | null } => {
  const product = products.find((p) => p.id === productId)
  if (!product) return { discount: 0, promotion: null }

  const today = new Date().toISOString().split("T")[0]
  let bestDiscount = 0
  let bestPromotion: Promotion | null = null

  promotions.forEach((promo) => {
    if (
      !promo.isActive ||
      promo.startDate > today ||
      promo.endDate < today ||
      (promo.forFrequentOnly && (!customer || !customer.isFrequent))
    ) {
      return
    }

    let applies = false
    if (promo.appliesTo === "all") {
      applies = true
    } else if (promo.appliesTo === "specific" && promo.specificProducts.includes(productId)) {
      applies = true
    } else if (promo.appliesTo === "category" && promo.specificCategories.includes(product.category)) {
      applies = true
    }

    if (!applies) return

    let discount = 0
    if (promo.discountType === "percentage") {
      discount = (productPrice * quantity * promo.discountValue) / 100
    } else if (promo.discountType === "fixed") {
      discount = Math.min(promo.discountValue, productPrice * quantity)
    } else if (promo.discountType === "bundle") {
      if (quantity >= promo.bundleBuy) {
        const sets = Math.floor(quantity / promo.bundleBuy)
        const itemsToDiscount = sets * (promo.bundleBuy - promo.bundlePay)
        discount = itemsToDiscount * productPrice
      }
    }

    if (discount > bestDiscount) {
      bestDiscount = discount
      bestPromotion = promo
    }
  })

  return { discount: bestDiscount, promotion: bestPromotion }
}

// Cálculo de descuentos del carrito
const calculateCartDiscount = (
  cartItems: SaleItem[], 
  customer: Customer | null, 
  promotions: Promotion[], 
  products: Product[]
) => {
  let totalDiscount = 0
  const discountBreakdown: DiscountBreakdown[] = []
  let appliedPromotion: Promotion | null = null

  cartItems.forEach((item) => {
    const { discount, promotion } = calculateProductDiscount(
      item.productId, 
      item.price, 
      item.quantity, 
      customer, 
      promotions, 
      products
    )
    if (discount > 0 && promotion) {
      totalDiscount += discount
      discountBreakdown.push({
        productId: item.productId,
        productName: item.productName,
        promotionName: promotion.name,
        discountAmount: discount,
      })
      if (!appliedPromotion) appliedPromotion = promotion
    }
  })

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  if (appliedPromotion && subtotal < (appliedPromotion as Promotion).minPurchase) {
    return { discount: 0, promotion: null, breakdown: [] }
  }

  return { discount: totalDiscount, promotion: appliedPromotion, breakdown: discountBreakdown }
}

// Búsqueda de clientes
const searchCustomers = (term: string, customers: Customer[]) => {
  if (!term) return customers

  const searchLower = term.toLowerCase()
  return customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.phone.includes(term),
  )
}

// Filtrado de productos
const filterProducts = (term: string, products: Product[]) => {
  if (!term) return products

  const searchLower = term.toLowerCase()
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchLower) ||
      p.sku.toLowerCase().includes(searchLower) ||
      p.barcode.includes(term) ||
      p.category.toLowerCase().includes(searchLower),
  )
}

// Búsqueda de productos con stock
const searchProducts = (term: string, products: Product[]) => {
  if (!term) return products.filter((p) => p.stock > 0)

  const searchLower = term.toLowerCase()
  return products.filter(
    (p) =>
      p.stock > 0 &&
      (p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        p.barcode.includes(term) ||
        p.category.toLowerCase().includes(searchLower)),
  )
}

// Adaptación de producto para API
const adaptProductToAPI = (product: any) => {
  return {
    nombre: product.name,
    descripcion: product.description,
    sku: product.sku,
    barcode: product.barcode,
    precio: product.price,
    stock: product.stock,
    id_categoria: 1, // TEMPORAL: Cambia esto por un select de categorías
  };
};

// Actualización de stock en BD
const updateStockInDatabase = async (productId: number, newStock: number, product: Product) => {
  try {
    const productData = {
      nombre: product.name,
      descripcion: product.description,
      sku: product.sku,
      barcode: product.barcode,
      precio: product.price,
      costo: product.cost,
      stock: newStock,
      min_stock: product.minStock,
      id_categoria: product.categoryId,
    };

    await api.updateProduct(productId, productData);
  } catch (error) {
    console.error(`Error actualizando stock en BD:`, error);
    throw error;
  }
};

// Agregar movimiento de inventario por compra a proveedor
const addSupplierInventoryMovement = async (
  productId: number,
  quantity: number,
  supplierId: number,
  product: Product,
  addInventoryMovement: Function,
  updateStockInDatabase: Function
) => {
  const previousStock = product.stock;
  const newStock = previousStock + quantity;

  try {
    await updateStockInDatabase(productId, newStock, product);
    
    await addInventoryMovement(
      productId,
      product.name,
      "entrada",
      quantity,
      previousStock,
      newStock,
      "Compra a proveedor",
      product.cost,
      product.price,
      undefined,
      supplierId
    );

    console.log(`✅ Entrada de inventario registrada: ${quantity} unidades de ${product.name}`);
    
  } catch (error) {
    console.error('❌ Error registrando entrada de inventario:', error);
    throw error;
  }
};

// Validación de promoción
const validatePromotion = (promotion: any): { isValid: boolean; error?: string } => {
  if (!promotion.name) {
    return { isValid: false, error: "El nombre de la promoción es requerido" };
  }

  if (promotion.discountType === "bundle") {
    if (promotion.bundleBuy <= 0 || promotion.bundlePay <= 0) {
      return { isValid: false, error: "Para ofertas X por Y, debes especificar cantidades válidas" };
    }
    if (promotion.bundleBuy <= promotion.bundlePay) {
      return { isValid: false, error: "La cantidad a comprar debe ser mayor que la cantidad a pagar" };
    }
  } else if (promotion.discountValue <= 0) {
    return { isValid: false, error: "Debes especificar un valor de descuento válido" };
  }

  if (new Date(promotion.startDate) > new Date(promotion.endDate)) {
    return { isValid: false, error: "La fecha de inicio no puede ser posterior a la fecha de fin" };
  }

  return { isValid: true };
};

// Generación de número de venta
const generateSaleNumber = (): string => {
  return `V-${Date.now().toString().slice(-6)}`;
};

// Formateo de fecha
const formatDate = (dateString: string): string => {
  try {
    // Si la fecha ya está en formato corto, devolverla directamente
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida:', dateString);
      return 'Fecha inválida';
    }
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', dateString, error);
    return 'Fecha inválida';
  }
};

// Cálculo de estadísticas de productos
const calculateProductStats = (products: Product[]) => {
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const totalInvestment = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const criticalStockCount = products.filter(p => p.stock === 0).length;

  return {
    totalStock,
    totalValue,
    totalInvestment,
    lowStockCount,
    criticalStockCount,
    potentialProfit: totalValue - totalInvestment
  };
};

// Cálculo de estadísticas de ventas
const calculateSalesStats = (sales: Sale[]) => {
  const completedSales = sales.filter(sale => sale.status === "completed");
  const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalDiscounts = completedSales.reduce((sum, sale) => sum + sale.discount, 0);
  const averageSale = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  return {
    totalSales: completedSales.length,
    totalRevenue,
    totalDiscounts,
    averageSale,
    cancelledSales: sales.filter(sale => sale.status === "cancelled").length
  };
};

// Función para determinar el estado del stock
const getStockStatus = (stock: number, minStock: number): { status: string; variant: "default" | "secondary" | "destructive" } => {
  if (stock <= minStock) {
    return { status: "CRÍTICO", variant: "destructive" };
  } else if (stock <= minStock * 2) {
    return { status: "BAJO", variant: "secondary" };
  } else {
    return { status: "NORMAL", variant: "default" };
  }
};

// Función para calcular días hasta vencimiento
const getDaysUntilExpiry = (expiryDate?: string): number | null => {
  if (!expiryDate) return null;
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Función para determinar estado de vencimiento
const getExpiryStatus = (expiryDate?: string): { status: string; color: string } => {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  
  if (daysUntilExpiry === null) {
    return { status: "SIN FECHA", color: "gray" };
  } else if (daysUntilExpiry < 0) {
    return { status: "VENCIDO", color: "red" };
  } else if (daysUntilExpiry <= 30) {
    return { status: "PRÓXIMO", color: "orange" };
  } else {
    return { status: "VIGENTE", color: "green" };
  }
};

// ===================================================================================================================================================================================================================
// SECCIÓN 5: HOOKS PERSONALIZADOS
// ===================================================================================================================================================================================================================

// Hook para gestión de productos
const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Cargar productos desde la API
  const loadProducts = async () => {
    try {
      setLoading(true);
      const productosData: ProductoFromAPI[] = await api.getProducts();
      
      console.log('🔍 PRODUCTOS CON CATEGORÍA:', productosData);
      
      const adaptedProducts: Product[] = productosData.map(producto => {
        console.log('🔍 Producto individual:', {
          nombre: producto.nombre,
          categoria_nombre: producto.categoria_nombre,
          id_categoria: producto.id_categoria
        });
        
        return {
          id: producto.id_producto,
          name: producto.nombre,
          sku: producto.sku || `SKU-${producto.id_producto}`,
          barcode: producto.barcode || "",
          price: Number(producto.precio) || 0,
          cost: Number(producto.costo) || 0,
          stock: producto.stock,
          minStock: producto.min_stock || DEFAULT_MIN_STOCK,
          category: producto.categoria_nombre || "Sin categoría",
          categoryId: producto.id_categoria,
          description: producto.descripcion,
          wholesalePrice: Number(producto.precio_mayorista) || 0,
          expiryDate: producto.fecha_vencimiento || undefined
        };
      });

      setProducts(adaptedProducts);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const categoriasData = await api.getCategories();

      console.log('✅ Categorías cargadas:', categoriasData);
      
      setCategories(categoriasData);
      
      if (categoriasData.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(categoriasData[0].id_categoria);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  // Agregar nuevo producto
  const addProduct = async (productData: any, categoryId: number) => {
    try {
      const ultimoSKU = products.reduce((max, product) => {
        const skuNum = parseInt(product.sku.replace('SKU-', ''));
        return isNaN(skuNum) ? max : Math.max(max, skuNum);
      }, 0);
      
      const nuevoSKUNumero = ultimoSKU + 1;
      const skuGenerado = `SKU-${nuevoSKUNumero.toString().padStart(3, '0')}`;

      const productToCreate = {
        nombre: productData.name,
        descripcion: productData.description,
        sku: skuGenerado,
        barcode: productData.barcode || "",
        precio: productData.price,
        costo: productData.cost || 0,
        stock: productData.stock || 0,
        min_stock: productData.minStock || 1,
        id_categoria: categoryId,
        fecha_vencimiento: productData.fecha_vencimiento || null
      };

      const productoCreado = await api.createProducto(productToCreate);
      const categoriaNombre = categories.find(cat => cat.id_categoria === selectedCategoryId)?.nombre || "General";

      const newProduct: Product = {
        id: productoCreado.id_producto,
        name: productData.name,
        sku: skuGenerado,
        barcode: productData.barcode,
        price: productData.price,
        cost: productData.cost,
        stock: productData.stock,
        minStock: productData.minStock,
        category: categoriaNombre,
        categoryId: categoryId,
        description: productData.description,
        wholesalePrice: productData.wholesalePrice || 0,
        expiryDate: productData.fecha_vencimiento || undefined,
        warrantyMonths: undefined,
        lastSoldDate: undefined,
        observations: productData.observations || ""
      };

      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (error: any) {
      console.error('Error agregando producto:', error);
      throw error;
    }
  };

  // Actualizar producto
  const updateProduct = async (updatedProduct: Product) => {
    try {
      const categoriaEncontrada = categories.find(cat => cat.nombre === updatedProduct.category);
      const id_categoria = categoriaEncontrada ? categoriaEncontrada.id_categoria : updatedProduct.categoryId;

      const productData = {
        id_producto: updatedProduct.id,
        nombre: updatedProduct.name,
        descripcion: updatedProduct.description,
        sku: updatedProduct.sku,
        barcode: updatedProduct.barcode,
        precio: updatedProduct.price,
        costo: updatedProduct.cost,
        stock: updatedProduct.stock,
        min_stock: updatedProduct.minStock,
        id_categoria: id_categoria,
        precio_mayorista: updatedProduct.wholesalePrice,
        fecha_vencimiento: updatedProduct.expiryDate || null 
      };

      const response = await api.updateProduct(updatedProduct.id, productData);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      return response;
    } catch (error: any) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  };

  // Eliminar producto
  const deleteProduct = async (productId: number) => {
    try {
      await api.deleteProducto(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error: any) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  };

  // Actualizar stock
  const updateStock = async (productId: number, newStock: number, reason = "Ajuste manual") => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const previousStock = product.stock;
    const finalStock = Math.max(0, newStock);
    
    try {
      const productData = {
        nombre: product.name,
        descripcion: product.description,
        sku: product.sku,
        barcode: product.barcode,
        precio: product.price,
        costo: product.cost,
        stock: finalStock,
        min_stock: product.minStock,
        id_categoria: product.categoryId,
      };

      await api.updateProduct(productId, productData);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: finalStock } : p));
      
      return { previousStock, finalStock };
    } catch (error) {
      console.error('Error actualizando stock:', error);
      throw error;
    }
  };

  const filterProducts = (term: string) => {
    if (!term) return products || []; // ← Asegurar que siempre retorne array

    const searchLower = term.toLowerCase();
    return (products || []).filter((p) => { // ← Usar array vacío si products es undefined
      if (!p) return false;
      
      const name = p.name || '';
      const sku = p.sku || '';
      const barcode = p.barcode || '';
      const category = p.category || '';

      return (
        name.toLowerCase().includes(searchLower) ||
        sku.toLowerCase().includes(searchLower) ||
        barcode.includes(term) ||
        category.toLowerCase().includes(searchLower)
      );
    });
  };

  const searchProducts = (term: string) => {
    if (!term) return (products || []).filter((p) => p && p.stock > 0); // ← Misma corrección

    const searchLower = term.toLowerCase();
    return (products || []).filter((p) => { // ← Misma corrección
      if (!p || p.stock <= 0) return false;
      
      const name = p.name || '';
      const sku = p.sku || '';
      const barcode = p.barcode || '';
      const category = p.category || '';

      return (
        name.toLowerCase().includes(searchLower) ||
        sku.toLowerCase().includes(searchLower) ||
        barcode.includes(term) ||
        category.toLowerCase().includes(searchLower)
      );
    });
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadCategories();
  }, []);

  return {
    products,
    categories,
    loading,
    selectedCategoryId,
    setSelectedCategoryId,
    loadProducts,
    loadCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    filterProducts,
    searchProducts,
    setProducts
  };
};

// Hook para gestión de proveedores
const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar proveedores
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const proveedoresData = await api.getProveedores();
      
      console.log('🔍 Proveedores cargados:', proveedoresData);
      
      // Verificar estructura de cada proveedor
      proveedoresData.forEach((proveedor: any, index: number) => {
        console.log(`Proveedor ${index}:`, {
          id_proveedor: proveedor.id_proveedor,
          empresa: proveedor.empresa,
          tieneId: !!proveedor.id_proveedor,
          tipoId: typeof proveedor.id_proveedor,
          todasLasPropiedades: Object.keys(proveedor) // ← Esto muestra todas las propiedades
        });
      });
      
      setSuppliers(proveedoresData);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  // Añadir Supplier
  const addSupplier = async (supplierData: any) => {
    try {
      console.log('🔄 Agregando proveedor via hook:', supplierData);
      const createdSupplier = await api.createProveedor(supplierData);
      
      // Asegurarnos de que el proveedor tenga todos los campos necesarios
      const completeSupplier = {
        ...createdSupplier,
        productos_ids: createdSupplier.productos_ids || [],
        activo: createdSupplier.activo !== false
      };
      
      setSuppliers(prev => [...prev, completeSupplier]);
      return completeSupplier;
    } catch (error: any) {
      console.error('❌ Error en addSupplier hook:', error);
      throw error;
    }
  };

  // Actualizar Supplier
  const updateSupplier = async (id: number, updatedData: any) => {
    try {
      console.log('🔄 Actualizando proveedor via hook:', id, updatedData);
      const updatedSupplier = await api.updateProveedor(id, updatedData);
      
      const completeSupplier = {
        ...updatedSupplier,
        productos_ids: updatedSupplier.productos_ids || [],
        activo: updatedSupplier.activo !== false
      };
      
      setSuppliers(prev => prev.map(s => 
        s.id_proveedor === id ? completeSupplier : s
      ));
      return completeSupplier;
    } catch (error: any) {
      console.error('❌ Error en updateSupplier hook:', error);
      throw error;
    }
  };

  // Eliminar proveedor
  const deleteSupplier = async (id: number) => {
    try {
      console.log('🗑️ Eliminando proveedor ID:', id);
      
      if (!id || isNaN(id)) {
        throw new Error(`ID de proveedor inválido: ${id}`);
      }
      
      await api.deleteProveedor(id);
      
      // Filtrar el proveedor eliminado
      setSuppliers(prev => {
        const updated = prev.filter(s => {
          const shouldKeep = s.id_proveedor !== id;
          if (!shouldKeep) {
            console.log('✅ Proveedor eliminado localmente:', s.id_proveedor);
          }
          return shouldKeep;
        });
        console.log('📊 Proveedores después de eliminar:', updated.length);
        return updated;
      });
      
    } catch (error: any) {
      console.error('❌ Error eliminando proveedor:', error);
      throw error;
    }
  };

  // Buscar proveedores
  const searchSuppliers = async (query: string) => {
    try {
      if (query.trim() === '') {
        await loadSuppliers();
        return;
      }
      const resultados = await api.searchProveedores(query);
      setSuppliers(resultados);
    } catch (error) {
      console.error('Error buscando proveedores:', error);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    loadSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    searchSuppliers,
    setSuppliers
  };
};

// Hook para gestión de ventas
const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar ventas desde BD
  const loadSalesFromDB = async (products: Product[]) => {
    try {
      setLoading(true);
      const ventasData = await api.getVentas();
      const ventasOrdenadas = [...ventasData].sort((a, b) => b.id_venta - a.id_venta);

      const salesWithDetails = await Promise.all(
        ventasOrdenadas.map(async (venta: VentaFromAPI) => {
          try {
            console.log(`🔄 Procesando venta ${venta.id_venta}...`);
            
            const detallesResponse = await api.getDetalleVenta(venta.id_venta);
            
            // ✅ CORRECCIÓN CRÍTICA: Asegurar que detallesData sea siempre un array
            const detallesData = Array.isArray(detallesResponse) ? detallesResponse : 
                                detallesResponse?.data || detallesResponse?.detalles || [];
            
            console.log(`📦 Venta ${venta.id_venta} - ${detallesData.length} detalles recibidos`);
            
            if (!Array.isArray(detallesData)) {
              console.error(`❌ detallesData no es array para venta ${venta.id_venta}:`, typeof detallesData, detallesData);
              return null;
            }

            if (detallesData.length === 0) {
              console.warn(`⚠️ Venta ${venta.id_venta} sin detalles`);
            }

            // Obtener todas las presentaciones de una vez
            let presentaciones = [];
            try {
              presentaciones = await api.getPresentaciones();
            } catch (error) {
              console.warn('⚠️ Error obteniendo presentaciones:', error);
            }

            // MEJORAR LA LÓGICA DE OBTENCIÓN DE NOMBRES
            const itemsConNombresReales = detallesData.map(detalle => {
              console.log('🔍 Procesando detalle:', detalle);
              
              let nombreFinal = detalle.nombre_producto;
              let productId = detalle.id_presentacion;

              // DEBUG: Ver qué información tenemos
              console.log('📋 Información del detalle:', {
                nombre_producto: detalle.nombre_producto,
                id_presentacion: detalle.id_presentacion,
                tieneNombre: !!nombreFinal && nombreFinal !== 'undefined'
              });

              // ESTRATEGIA MEJORADA DE OBTENCIÓN DE NOMBRES:

              // 1. PRIMERO: Usar nombre de BD si existe y es válido
              if (nombreFinal && nombreFinal !== 'undefined' && nombreFinal.trim() !== '' && nombreFinal !== 'NO_ENVIADO') {
                console.log(`✅ Usando nombre de BD: "${nombreFinal}"`);
                return {
                  productId: productId,
                  productName: nombreFinal,
                  quantity: detalle.cantidad,
                  price: detalle.precio_unitario,
                  discount: detalle.descuento || 0,
                  subtotal: detalle.subtotal
                };
              }

              // 2. SEGUNDO: Buscar en productos locales por ID directo
              const productLocal = products.find(p => p.id === detalle.id_presentacion);
              if (productLocal) {
                console.log(`✅ Producto encontrado en lista local: "${productLocal.name}"`);
                return {
                  productId: productLocal.id,
                  productName: productLocal.name,
                  quantity: detalle.cantidad,
                  price: detalle.precio_unitario,
                  discount: detalle.descuento || 0,
                  subtotal: detalle.subtotal
                };
              }

              // 3. TERCERO: Buscar por presentación
              const presentacion = presentaciones.find((p: Presentacion) => p.id_presentacion === detalle.id_presentacion);
              if (presentacion) {
                const product = products.find(p => p.id === presentacion.id_producto);
                if (product) {
                  nombreFinal = product.name;
                  productId = product.id;
                  console.log(`✅ Producto encontrado via presentación: "${product.name}"`);
                }
              }

              // 4. CUARTO: Búsqueda amplia en productos
              if (!nombreFinal || nombreFinal === 'undefined') {
                const productByAnyMeans = products.find(p => 
                  p.id === detalle.id_presentacion || 
                  p.sku?.includes(detalle.id_presentacion?.toString()) ||
                  p.name?.includes(detalle.id_presentacion?.toString())
                );
                
                if (productByAnyMeans) {
                  nombreFinal = productByAnyMeans.name;
                  productId = productByAnyMeans.id;
                  console.log(`✅ Producto encontrado via búsqueda amplia: "${productByAnyMeans.name}"`);
                }
              }

              // 5. ÚLTIMO RECURSO: Nombre genérico descriptivo
              if (!nombreFinal || nombreFinal === 'undefined') {
                nombreFinal = `Producto (ID:${detalle.id_presentacion})`;
                console.warn(`⚠️ Usando nombre genérico para ID ${detalle.id_presentacion}`);
              }

              console.log(`🎯 Nombre final asignado: "${nombreFinal}"`);

              return {
                productId: productId,
                productName: nombreFinal,
                quantity: detalle.cantidad,
                price: detalle.precio_unitario,
                discount: detalle.descuento || 0,
                subtotal: detalle.subtotal
              };
            });

            // Construir el objeto sale completo
            let clienteInfo = null;
            if (venta.id_cliente) {
              try {
                clienteInfo = await api.getCliente(venta.id_cliente);
              } catch (error) {
                console.warn(`Cliente no encontrado para venta ${venta.id_venta}:`, error);
              }
            }

            const saleObject = {
              id: venta.id_venta,
              saleNumber: venta.numero_venta,
              customerId: venta.id_cliente || undefined,
              customerName: clienteInfo?.nombre || clienteInfo?.name || undefined,
              items: itemsConNombresReales,
              subtotal: venta.subtotal || detallesData.reduce((sum, d) => sum + d.subtotal, 0),
              discount: venta.descuento || 0,
              promotionId: venta.id_promocion || undefined,
              promotionName: undefined,
              discountBreakdown: [],
              total: venta.total,
              date: venta.fecha,
              paymentMethod: mapPaymentMethod(venta.metodo_pago),
              isWholesale: venta.es_mayorista || false,
              status: mapSaleStatus(venta.estado),
              isInternalPurchase: false
            };

            console.log(`✅ Venta ${venta.id_venta} procesada - ${itemsConNombresReales.length} items`);
            return saleObject;

          } catch (error) {
            console.error(`❌ Error procesando venta ${venta.id_venta}:`, error);
            return null;
          }
        })
      );

      const validSales = salesWithDetails.filter((sale): sale is NonNullable<typeof sale> => sale !== null);
      console.log('✅ Ventas procesadas exitosamente:', validSales.length);
      setSales(validSales);
      
    } catch (error) {
      console.error('❌ Error cargando ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Completar venta
  const completeSale = async (saleData: {
    cart: SaleItem[],
    selectedCustomer: Customer | null,
    currentSubtotal: number,
    currentDiscount: number,
    currentTotal: number,
    currentPromotion: Promotion | null,
    paymentMethod: "cash" | "transfer" | "card",
    isWholesaleSale: boolean,
    isInternalPurchase: boolean,
    products: Product[],
    updateStockInDatabase: (productId: number, newStock: number) => Promise<void>,
    addInventoryMovement: Function
  }) => {
    if (saleData.cart.length === 0) return;

    try {
      const subtotalNum = Number(saleData.currentSubtotal) || 0;
      const discountNum = Number(saleData.currentDiscount) || 0;
      const totalNum = Number(saleData.currentTotal) || Math.max(0.01, subtotalNum - discountNum);

      const saleDataToSend = {
        numero_venta: `V-${Date.now().toString().slice(-6)}`,
        id_cliente: saleData.selectedCustomer?.id || null,
        id_promocion: saleData.currentPromotion?.id || null,
        subtotal: subtotalNum,
        descuento: discountNum,
        total: totalNum,
        fecha: new Date().toISOString(),
        metodo_pago: mapPaymentMethodToDB(saleData.paymentMethod),
        es_mayorista: saleData.isWholesaleSale || saleData.selectedCustomer?.isWholesale || false,
        estado: 'completada'
      };

      const ventaCreada = await api.createVenta(saleDataToSend);

      // OBTENER PRESENTACIONES DE LA BD
      let presentaciones = [];
      try {
        presentaciones = await api.getPresentaciones();
        console.log('🔍 Presentaciones obtenidas:', presentaciones.length);
      } catch (error) {
        console.warn('⚠️ Error cargando presentaciones:', error);
      }

      // GUARDAR DETALLES DE VENTA
      console.log('🔄 Creando detalles de venta...');

      for (const item of saleData.cart) {
        let id_presentacion = null;
        
        if (presentaciones.length > 0) {
          // Buscar presentación para este producto
          const presentacion = presentaciones.find((p: any) => p.id_producto === item.productId);
          if (presentacion) {
            id_presentacion = presentacion.id_presentacion;
            console.log(`✅ Presentación encontrada: ${id_presentacion} para producto ${item.productId}`);
          } else {
            // Usar la primera presentación disponible
            id_presentacion = presentaciones[0].id_presentacion;
            console.warn(`⚠️ Usando presentación por defecto: ${id_presentacion} para producto ${item.productId}`);
          }
        } else {
          // ⬇️ SI NO HAY PRESENTACIONES, USAR UN VALOR POR DEFECTO ⬇️
          id_presentacion = 1; // O algún ID por defecto que exista en tu BD
          console.warn(`⚠️ No hay presentaciones, usando ID por defecto: ${id_presentacion}`);
        }

        console.log('🔍 DEBUG - Creando detalle de venta:', {
          productId: item.productId,
          productName: item.productName,
          presentacionId: id_presentacion,
          nombre_producto_a_guardar: item.productName
        });

        const itemData = {
          id_venta: ventaCreada.id_venta,
          id_presentacion: id_presentacion,
          cantidad: item.quantity,
          precio_unitario: Number(item.price),
          descuento: Number(item.discount) || 0,
          subtotal: Number(item.subtotal),
          nombre_producto: item.productName
        };
        
        console.log('📦 Enviando detalle:', itemData);
        const resultadoDetalle = await api.createDetalleVenta(itemData);
        console.log('✅ Detalle creado:', resultadoDetalle);
      }

      console.log('🎉 Todos los detalles creados exitosamente');

      // ACTUALIZAR STOCK EN BD
      console.log('📊 Actualizando stock en BD...');
      for (const item of saleData.cart) {
        const product = saleData.products.find(p => p.id === item.productId);
        if (product) {
          const nuevoStock = product.stock - item.quantity;
          console.log(`🔄 Actualizando stock producto ${product.id}: ${product.stock} -> ${nuevoStock}`);
          await saleData.updateStockInDatabase(product.id, nuevoStock);
        }
      }

      // AGREGAR MOVIMIENTOS DE INVENTARIO
      console.log('📦 Agregando movimientos de inventario...');
      for (const item of saleData.cart) {
        const product = saleData.products.find(p => p.id === item.productId);
        if (product) {
          const nuevoStock = product.stock - item.quantity;
          
          // Luego registrar movimiento de inventario
          console.log(`📝 Registrando movimiento para ${product.name}`);
          try {
            await saleData.addInventoryMovement({
              productId: product.id,
              productName: product.name,
              type: "salida",
              quantity: item.quantity,
              previousStock: product.stock,
              newStock: nuevoStock,
              reason: `Venta ${ventaCreada.numero_venta}`,
              productCost: product.cost || 0,
              productPrice: product.price || 0,
              saleId: ventaCreada.id_venta
            });
            console.log(`✅ Movimiento registrado para ${product.name}`);
          } catch (movementError) {
            console.error(`❌ Error registrando movimiento para ${product.name}:`, movementError);
            // Continuar con los demás productos aunque falle un movimiento
            throw movementError; // O puedes comentar esta línea si quieres que continúe
          }
        }
      }

      // CREAR OBJETO SALE LOCAL PARA EL ESTADO
      const sale: Sale = {
        id: ventaCreada.id_venta,
        saleNumber: ventaCreada.numero_venta,
        customerId: saleData.selectedCustomer?.id,
        customerName: saleData.selectedCustomer?.name,
        items: saleData.cart.map((item) => {
          const itemDiscount = 0;
          return {
            ...item,
            discount: itemDiscount,
          };
        }),
        subtotal: subtotalNum,
        discount: discountNum,
        promotionId: saleData.currentPromotion?.id,
        promotionName: saleData.currentPromotion?.name,
        discountBreakdown: [],
        total: totalNum,
        date: new Date().toISOString(),
        paymentMethod: saleData.paymentMethod,
        isWholesale: saleData.isWholesaleSale,
        status: "completed",
        isInternalPurchase: saleData.isInternalPurchase,
      };

      console.log('🎉 Venta completada y datos persistidos');
      return ventaCreada;

    } catch (error: any) {
      console.error('❌ Error completando venta:', error);
      throw error;
    }
  };

  // Agregar al carrito
  const addToCart = (product: Product, isWholesaleSale: boolean, selectedCustomer: Customer | null, cart: SaleItem[], setCart: React.Dispatch<React.SetStateAction<SaleItem[]>>) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    const priceToUse = isWholesaleSale ? product.wholesalePrice : product.price;

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item.productId === product.id
              ? { 
                  ...item, 
                  quantity: item.quantity + 1,
                  price: priceToUse,
                  subtotal: Number((item.quantity + 1) * priceToUse),
                  discount: 0 // Se calcularía después
                }
              : item,
          ),
        );
      }
    } else {
      if (product.stock > 0) {
        setCart([
          ...cart,
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: priceToUse,
            subtotal: Number(priceToUse),
            discount: 0
          },
        ]);
      }
    }
  };

  // Remover del carrito
  const removeFromCart = (productId: number, cart: SaleItem[], setCart: React.Dispatch<React.SetStateAction<SaleItem[]>>) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Actualizar cantidad en carrito
  const updateCartQuantity = (productId: number, quantity: number, cart: SaleItem[], setCart: React.Dispatch<React.SetStateAction<SaleItem[]>>, products: Product[], isWholesaleSale: boolean, selectedCustomer: Customer | null) => {
    if (quantity <= 0) {
      removeFromCart(productId, cart, setCart);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && quantity <= product.stock) {
      const priceToUse = isWholesaleSale ? product.wholesalePrice : product.price;

      setCart(
        cart.map((item) =>
          item.productId === productId ? { 
            ...item, 
            quantity,
            price: priceToUse,
            subtotal: Number(quantity * priceToUse),
            discount: 0
          } : item,
        ),
      );
    }
  };

  return {
    sales,
    cart,
    loading,
    setCart,
    loadSalesFromDB,
    completeSale,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    setSales
  };
};

// Hook para gestión de inventario
const useInventory = () => {
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar movimientos de inventario
  const loadInventoryMovementsFromDB = async () => {
    try {
      console.log('🔄 [DEBUG] loadInventoryMovementsFromDB - INICIANDO');
      setLoading(true);
      
      console.log('🔄 [DEBUG] Llamando a api.getMovimientosInventario()...');
      const movimientosData = await api.getMovimientosInventario();
      console.log('📥 [DEBUG] Datos recibidos de la API:', movimientosData);
      console.log('📊 [DEBUG] Cantidad de movimientos recibidos:', movimientosData.length);
      
      if (movimientosData.length === 0) {
        console.log('⚠️ [DEBUG] No se recibieron movimientos de la API');
      }
      
      const adaptedMovements: InventoryMovement[] = movimientosData.map((mov: any) => ({
        id: mov.id_movimiento,
        productId: mov.id_producto,
        productName: mov.producto_nombre,
        type: mov.tipo,
        quantity: mov.cantidad,
        previousStock: mov.stock_anterior,
        newStock: mov.stock_nuevo,
        unitCost: Number(mov.costo_unitario) || 0,
        unitPrice: Number(mov.precio_unitario) || 0,
        totalCost: Number(mov.costo_unitario) * mov.cantidad || 0,
        totalValue: Number(mov.valor_total) || 0,
        reason: mov.motivo,
        date: mov.fecha_movimiento,
        id_venta: mov.id_venta || undefined,
        venta_numero: mov.venta_numero || undefined,
        id_proveedor: mov.id_proveedor || undefined,
        proveedor_nombre: mov.proveedor_nombre || undefined,
        usuario: mov.usuario || 'Sistema',
      }));
      
      console.log('🔄 [DEBUG] Movimientos adaptados para UI:', adaptedMovements);
      console.log('📊 [DEBUG] Cantidad de movimientos adaptados:', adaptedMovements.length);
      
      setInventoryMovements(adaptedMovements);
      console.log('✅ [DEBUG] loadInventoryMovementsFromDB - COMPLETADO');
      
    } catch (error) {
      console.error('❌ [DEBUG] Error en loadInventoryMovementsFromDB:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrega movimiento de inventario
  const addInventoryMovement = async (movementData: {
    productId: number,
    productName: string,
    type: "entrada" | "salida" | "ajuste" | "devolucion",
    quantity: number,
    previousStock: number,
    newStock: number,
    reason: string,
    productCost: number,
    productPrice: number,
    saleId?: number,
    supplierId?: number
  }) => {
    try {
      console.log('📦 Creando movimiento de inventario:', movementData);

      if (!movementData.productId || !movementData.type) {
        throw new Error(`Datos incompletos: productId=${movementData.productId}, type=${movementData.type}`);
      }

      const movementToCreate = {
        id_producto: movementData.productId || 0,
        tipo: movementData.type || "salida",
        cantidad: movementData.quantity || 0,
        stock_anterior: movementData.previousStock || 0,
        stock_nuevo: movementData.newStock || 0,
        costo_unitario: Number(movementData.productCost) || 0,
        precio_unitario: Number(movementData.productPrice) || 0,
        valor_total: (movementData.quantity || 0) * (Number(movementData.productPrice) || 0),
        motivo: movementData.reason || "Movimiento de inventario",
        id_venta: movementData.saleId || null,
        id_proveedor: movementData.supplierId || null,
        usuario: 'Sistema',
      };

      if (!movementToCreate.id_producto || !movementToCreate.tipo || !movementToCreate.motivo) {
        throw new Error(`Campos requeridos faltantes: id_producto=${movementToCreate.id_producto}, tipo=${movementToCreate.tipo}, motivo=${movementToCreate.motivo}`);
      }

      console.log('📤 Enviando datos validados a API:', movementToCreate);

      const movimientoBD = await api.createMovimientoInventario(movementToCreate);
      
      console.log('✅ Movimiento creado en BD:', movimientoBD);

      const movement: InventoryMovement = {
        id: movimientoBD.id_movimiento,
        productId: movementData.productId,
        productName: movementData.productName,
        type: movementData.type,
        quantity: movementData.quantity,
        previousStock: movementData.previousStock,
        newStock: movementData.newStock,
        unitCost: movementData.productCost,
        unitPrice: movementData.productPrice,
        totalCost: movementData.quantity * movementData.productCost,
        totalValue: movementData.quantity * movementData.productPrice,
        reason: movementData.reason,
        date: new Date().toISOString(),
        id_venta: movementData.saleId,
        venta_numero: movementData.saleId ? `V-${movementData.saleId}` : undefined,
        id_proveedor: movementData.supplierId,
        usuario: 'Sistema',
      };
      
      setInventoryMovements(prev => [movement, ...prev]);
      return movement;
    } catch (error: any) {
      console.error('❌ Error agregando movimiento:', error);
      console.error('📋 Datos que causaron el error:', movementData);
      throw new Error(`Error al registrar movimiento de inventario: ${error.message}`);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadInventoryMovementsFromDB();
  }, []);

  return {
    inventoryMovements,
    loading,
    loadInventoryMovementsFromDB,
    addInventoryMovement,
    setInventoryMovements
  };
};

// ===================================================================================================================================================================================================================
// SECCIÓN 6: COMPONENTE PRINCIPAL
// ===================================================================================================================================================================================================================

export default function BusinessSalesSystem() {
  // ===========================================================================
  // SECCIÓN 6.1: INICIALIZACIÓN DE HOOKS PERSONALIZADOS
  // ===========================================================================

  // Inicializar todos los hooks personalizados
  const productsHook = useProducts();
  const salesHook = useSales();
  const suppliersHook = useSuppliers();
  const inventoryHook = useInventory();

  // Desestructurar estados y funciones de los hooks
  const {
    products,
    categories,
    loading: productsLoading,
    selectedCategoryId,
    setSelectedCategoryId,
    addProduct: addProductHook,
    updateProduct: updateProductHook,
    deleteProduct: deleteProductHook,
    updateStock: updateStockHook,
    filterProducts: filterProductsHook,
    searchProducts: searchProductsHook,
    setProducts
  } = productsHook;

  const {
    sales,
    cart,
    loading: salesLoading,
    setCart,
    loadSalesFromDB,
    completeSale: completeSaleHook,
    addToCart: addToCartHook,
    removeFromCart: removeFromCartHook,
    updateCartQuantity: updateCartQuantityHook,
    setSales
  } = salesHook;

  const {
    suppliers,
    loading: suppliersLoading,
    loadSuppliers: loadSuppliersHook,
    addSupplier: addSupplierHook,
    updateSupplier: updateSupplierHook,
    deleteSupplier: deleteSupplierHook,
    searchSuppliers: searchSuppliersHook,
    setSuppliers
  } = suppliersHook;

  const {
    inventoryMovements,
    loading: inventoryLoading,
    loadInventoryMovementsFromDB: loadInventoryMovementsHook,
    addInventoryMovement: addInventoryMovementHook,
    setInventoryMovements
  } = inventoryHook;

  // ===========================================================================
  // SECCIÓN 6.2: ESTADOS DE UI Y FORMULARIOS
  // ===========================================================================

  // ===========================================================================
  // RELOJ EN TIEMPO REAL
  // ===========================================================================
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Estado de navegación y UI
  const [activeTab, setActiveTab] = useState("dashboard");

  // Estado de búsquedas y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);

  // Estado de clientes
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    isWholesale: false,
  });

  // Estado de promociones
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [newPromotion, setNewPromotion] = useState({
    name: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed" | "bundle",
    discountValue: 0,
    bundleBuy: 0,
    bundlePay: 0,
    appliesTo: "all" as "all" | "specific" | "category",
    specificProducts: [] as number[],
    specificCategories: [] as string[],
    minPurchase: 0,
    forFrequentOnly: false,
    isActive: true,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  // Estado de proceso de venta
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);
  const [currentSubtotal, setCurrentSubtotal] = useState(0);
  const [currentDiscount, setCurrentDiscount] = useState(0);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [currentBreakdown, setCurrentBreakdown] = useState<DiscountBreakdown[]>([]);
  const [isWholesaleSale, setIsWholesaleSale] = useState(false);
  const [isInternalPurchase, setIsInternalPurchase] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "card">("cash");

  // Estado de formularios y diálogos
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    barcode: "",
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 1,
    category: "",
    description: "",
    observations: "",
    wholesalePrice: 0,
    expiryDate: "",
    warrantyMonths: 0,
  });

  const [newSupplier, setNewSupplier] = useState({
    empresa: "",
    contacto: "",
    email: "",
    telefono: "",
    direccion: "",
    productos_que_surte: "",
    productos_ids: [] as number[],
    ciudad: "",
    rut: "",
    condiciones_pago: "",
    tiempo_entrega: "",
    activo: true,
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isEditSupplierDialogOpen, setIsEditSupplierDialogOpen] = useState(false);

  // Estado de gestión de categorías
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Estado de backup y recuperación
  const [salesBackup, setSalesBackup] = useState<Sale[]>([]);
  const [inventoryMovementsBackup, setInventoryMovementsBackup] = useState<InventoryMovement[]>([]);
  const [showRecoverySales, setShowRecoverySales] = useState(false);
  const [showRecoveryInventory, setShowRecoveryInventory] = useState(false);

  // Estado de notificaciones y errores
  const [notifications, setNotifications] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }[]>([]);

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Estado para datos de gráficos
  const [dashboardData, setDashboardData] = useState({
    salesChartData: [{ name: "Sin datos", value: 0 }], 
    productsSoldData: [{ name: "Sin ventas", value: 0 }],
    categoryRevenueData: [{ name: "No hay ventas", value: 0 }]
  });

  // Estado de órdenes de compra
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [showPurchaseOrderForm, setShowPurchaseOrderForm] = useState(false);

  // Estado de órdenes de compra
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>([]);
  const [devolucionesProveedores, setDevolucionesProveedores] = useState<DevolucionProveedor[]>([]);
  const [showReceiveProductsForm, setShowReceiveProductsForm] = useState(false);
  const [showCreateReturnForm, setShowCreateReturnForm] = useState(false);
  const [selectedOrderForReceiving, setSelectedOrderForReceiving] = useState<OrdenCompra | null>(null);

  // Estados para el timer de ventas
  const [recoveryTimer, setRecoveryTimer] = useState<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Estados para el timer de inventario
  const [recoveryTimerInventory, setRecoveryTimerInventory] = useState<NodeJS.Timeout | null>(null);
  const [timeRemainingInventory, setTimeRemainingInventory] = useState<number>(0)


  // ===========================================================================
  // SECCIÓN 6.3: EFFECTS COORDINADORES
  // ===========================================================================

  // Effect para carga inicial de datos
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🔄 [DEBUG] ===== INICIANDO CARGA DE DATOS =====');
        
        // 1. Cargar categorías primero
        console.log('🔄 [DEBUG] Cargando categorías...');
        await productsHook.loadCategories();
        console.log('✅ [DEBUG] Categorías cargadas:', productsHook.categories.length);
        console.log('🔍 [DEBUG] Categorías:', productsHook.categories);
        
        // 2. Cargar productos antes que las ventas
        console.log('🔄 [DEBUG] Cargando productos...');
        await productsHook.loadProducts();
        console.log('✅ [DEBUG] Productos cargados:', productsHook.products.length);
        
        // 3. Luego cargar ventas y otros datos
        console.log('🔄 [DEBUG] Cargando ventas, proveedores e inventario...');
        await Promise.all([
          loadSalesFromDB(productsHook.products),
          loadSuppliersHook(),
          loadInventoryMovementsHook()
        ]);
        console.log('✅ [DEBUG] Todos los datos cargados');

        console.log('✅ [DEBUG] ===== TODOS LOS DATOS INICIALIZADOS CORRECTAMENTE =====');
        
        setNotifications(prev => [{
          type: 'success',
          message: 'Sistema inicializado correctamente',
          timestamp: new Date()
        }, ...prev]);

      } catch (error) {
        console.error('❌ [DEBUG] Error inicializando datos:', error);
        setErrors(prev => ({ ...prev, initialization: 'Error al cargar los datos iniciales' }));
        
        setNotifications(prev => [{
          type: 'error',
          message: 'Error al cargar datos iniciales',
          timestamp: new Date()
        }, ...prev]);
      }
    };

    console.log('🔄 [DEBUG] useEffect de inicialización ejecutándose...');
    initializeData();
  }, []);

  // Effect del Dashboard (FINAL: CON HORA, NOMBRES Y CATEGORÍAS ARREGLADOS)
  useEffect(() => {
    const calculateDashboardData = () => {
      const salesToUse = sales;

      // =================================================================
      // 1. GRÁFICO DE VENTAS (Ahora muestra LA HORA)
      // =================================================================
      const salesChartData = salesToUse.length > 0
        ? salesToUse
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((sale) => {
              const d = new Date(sale.date);
              
              // Extraemos la HORA en formato HH:MM:SS
              const timeString = d.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false 
              });
              
              return {
                name: timeString, // Ej: "19:45:14"
                value: Number(sale.total) || 0,
              }
            })
        : [{ name: "Sin datos", value: 0 }];

      // =================================================================
      // 2. PRODUCTOS Y CATEGORÍAS (Mantiene la lógica de rescate por nombre)
      // =================================================================
      const productSalesMap = new Map<string, number>();
      const categoryMap = new Map<string, number>();

      salesToUse.forEach((sale) => {
          sale.items.forEach((item) => {
            // A. Obtener nombre (Prioridad al guardado en venta)
            let displayName = item.productName;
            
            // B. Buscar producto real por nombre en la lista actual
            // (Esto arregla el problema del ID 5)
            const realProduct = products.find(p => 
                p.name && displayName && 
                p.name.trim().toLowerCase() === displayName.trim().toLowerCase()
            );
            
            // Si no hay nombre en venta, usar fallback
            if (!displayName || displayName === 'undefined') {
                if (realProduct) {
                    displayName = realProduct.name;
                } else {
                    displayName = `Producto #${item.productId}`;
                }
            }

            // C. Recuperar Categoría (Esto arregla el gráfico de categorías)
            // Si encontramos el producto, usamos su categoría. Si no, "Ventas Generales".
            const displayCategory = realProduct ? realProduct.category : "Ventas Generales";

            // D. Acumular
            const qty = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;

            // Acumular Productos
            const currentTotal = productSalesMap.get(displayName) || 0;
            productSalesMap.set(displayName, currentTotal + qty);

            // Acumular Categorías
            const currentCatValue = categoryMap.get(displayCategory) || 0;
            const itemRevenue = qty * price;
            categoryMap.set(displayCategory, currentCatValue + itemRevenue);
          });
      });

      // Ordenar Top 5 Productos
      const productsSoldData = Array.from(productSalesMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Ordenar Categorías
      const categoryRevenueData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ 
          name, 
          value: Number(value.toFixed(2)) 
        }))
        .sort((a, b) => b.value - a.value);

      // Guardar en Estado
      setDashboardData({
        salesChartData: salesChartData.length ? salesChartData : [{ name: "Sin datos", value: 0 }],
        productsSoldData: productsSoldData.length ? productsSoldData : [{ name: "Sin ventas", value: 0 }],
        categoryRevenueData: categoryRevenueData.length ? categoryRevenueData : [{ name: "No hay ventas", value: 0 }]
      });
    };

    if (sales.length > 0 || products.length > 0) {
        calculateDashboardData();
    }
  }, [sales, products]);

  // Effect para calcular descuentos automáticamente cuando cambia el carrito
  useEffect(() => {
    if (cart.length === 0) {
      setCurrentSubtotal(0);
      setCurrentDiscount(0);
      setCurrentTotal(0);
      setCurrentBreakdown([]);
      setCurrentPromotion(null);
      return;
    }

    const subtotal = cart.reduce((sum, item) => {
      const itemSubtotal = Number(item.subtotal) || 0;
      return sum + itemSubtotal;
    }, 0);
    
    const { discount, promotion, breakdown } = calculateCartDiscount(cart, selectedCustomer, promotions, products);
    const total = Math.max(0.01, subtotal - discount);
    
    setCurrentSubtotal(subtotal);
    setCurrentDiscount(discount);
    setCurrentTotal(total);
    setCurrentBreakdown(breakdown);
    setCurrentPromotion(promotion);
  }, [cart, selectedCustomer, promotions, products]);

  // Effect para notificaciones de stock bajo
  useEffect(() => {
    const checkLowStock = () => {
      const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0);
      const outOfStockProducts = products.filter(p => p.stock === 0);
      
      if (lowStockProducts.length > 0 || outOfStockProducts.length > 0) {
        const newNotifications: {
          type: 'success' | 'error' | 'warning' | 'info';
          message: string;
          timestamp: Date;
        }[] = [];
        
        if (outOfStockProducts.length > 0) {
          newNotifications.push({
            type: 'error' as const,
            message: `${outOfStockProducts.length} producto(s) sin stock`,
            timestamp: new Date()
          });
        }
        
        if (lowStockProducts.length > 0) {
          newNotifications.push({
            type: 'warning' as const,
            message: `${lowStockProducts.length} producto(s) con stock bajo`,
            timestamp: new Date()
          });
        }
        
        setNotifications(prev => [...newNotifications, ...prev.slice(0, 4)]);
      }
    };

    if (products.length > 0) {
      checkLowStock();
    }
  }, [products]);

  // Effect para sincronizar datos cuando cambia la pestaña activa
  useEffect(() => {
    const syncDataForTab = async () => {
      switch (activeTab) {
        case "products":
          if (products.length === 0) {
            await productsHook.loadProducts();
          }
          break;
        case "categories":
          await productsHook.loadCategories();
          if (products.length === 0) {
            await productsHook.loadProducts();
          }
          break;
        case "sales":
          if (sales.length === 0) {
            await loadSalesFromDB(productsHook.products);
          }
          break;
        case "suppliers":
          if (suppliers.length === 0) {
            await loadSuppliersHook();
          }
          break;
        case "inventory":
          if (inventoryMovements.length === 0) {
            await loadInventoryMovementsHook();
          }
          break;
      }
    };

    syncDataForTab();
  }, [activeTab]);

  // Cargar datos cuando se active la pestaña
  useEffect(() => {
    if (activeTab === "supplying") {
      loadOrdenesCompra();
      loadDevolucionesProveedores();
    }
  }, [activeTab]);

  // Cleanup del timer de ventas cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (recoveryTimer) {
        clearInterval(recoveryTimer);
      }
    };
  }, [recoveryTimer]);

  // Cleanup del timer de inventario cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (recoveryTimerInventory) {
        clearInterval(recoveryTimerInventory);
      }
    };
  }, [recoveryTimerInventory]);

  // ===========================================================================
  // SECCIÓN 6.4: FUNCIONES DELEGADAS A LOS HOOKS
  // ===========================================================================

  // ==================== FUNCIONES DE PRODUCTOS ====================
  const addProduct = async () => {
    console.log('🔍 [1] INICIANDO addProduct');

    // CALCULAR PRECIO FINAL - si unitario es 0 pero mayorista tiene valor, usar mayorista
  const precioFinal = newProduct.price <= 0 && newProduct.wholesalePrice > 0 
    ? newProduct.wholesalePrice 
    : newProduct.price;

  console.log('🔍 Precio calculado:', {
    unitario: newProduct.price,
    mayorista: newProduct.wholesalePrice,
    final: precioFinal
  });

    console.log('🔍 [2] selectedCategoryId:', selectedCategoryId);
    console.log('🔍 [3] newProduct:', newProduct);

    // Validación 1: Campos requeridos
    if (!newProduct.name || precioFinal <= 0) {
      console.log('❌ [VALIDACIÓN FALLÓ] Nombre o precio inválidos');
      setErrors(prev => ({ 
        ...prev, 
        addProduct: 'Por favor completa: Nombre y al menos un precio (unitario o mayorista) mayor a 0' 
      }));
      return;
    }

    // Validación 2: Categoría
      if (!selectedCategoryId) {
      console.log('❌ [VALIDACIÓN FALLÓ] No hay categoría seleccionada');
      setErrors(prev => ({ 
        ...prev, 
        addProduct: 'DEBES seleccionar una categoría antes de guardar' 
      }));
      return;
    }

    console.log('✅ [4] TODAS LAS VALIDACIONES PASARON');

    try {
      console.log('🔍 [5] LLAMANDO addProductHook...');

      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        barcode: newProduct.barcode,
        price: precioFinal,
        cost: newProduct.cost,
        stock: newProduct.stock,
        minStock: newProduct.minStock,
        wholesalePrice: newProduct.wholesalePrice,
        observations: newProduct.observations,
        categoryId: selectedCategoryId,
        fecha_vencimiento: newProduct.expiryDate || null
      };

      await addProductHook(productData, selectedCategoryId);
      console.log('✅ [6] addProductHook COMPLETADO');

      // Limpieza del formulario
      setNewProduct({
        name: "",
        sku: "",
        barcode: "",
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 1,
        category: "",
        description: "",
        observations: "",
        wholesalePrice: 0,
        expiryDate: "",
        warrantyMonths: 0,
      });

      setNotifications(prev => [{
        type: 'success',
        message: `Producto "${newProduct.name}" agregado correctamente`,
        timestamp: new Date()
      }, ...prev]);

      const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
      if (closeButton) closeButton.click();

    } catch (error: any) {
      console.error('❌ Error agregando producto:', error);
      setErrors(prev => ({ 
        ...prev, 
        addProduct: 'Error al agregar el producto: ' + error.message 
      }));
    }
  };

  // ==================== FUNCIONES DE CATEGORÍAS ====================
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setErrors(prev => ({ ...prev, category: 'El nombre de la categoría es requerido' }));
      return;
    }

    try {
      await api.createCategory({ nombre: newCategoryName.trim() });
      setNewCategoryName("");
      setErrors(prev => { const { category, ...rest } = prev; return rest; });
      await productsHook.loadCategories();
      setNotifications(prev => [{
        type: 'success',
        message: `Categoría "${newCategoryName.trim()}" creada correctamente`,
        timestamp: new Date()
      }, ...prev]);

      // Cerrar diálogo
      const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
      if (closeButton) closeButton.click();
    } catch (error: any) {
      console.error('Error creando categoría:', error);
      setErrors(prev => ({ ...prev, category: 'Error al crear la categoría: ' + error.message }));
    }
  };

  const handleUpdateCategory = async (categoryId: number) => {
    if (!editingCategoryName.trim()) return;

    try {
      await api.updateCategory(categoryId, { nombre: editingCategoryName.trim() });
      setEditingCategoryId(null);
      setEditingCategoryName("");
      await productsHook.loadCategories();
      await productsHook.loadProducts(); // Recargar productos para actualizar nombre de categoría
      setNotifications(prev => [{
        type: 'success',
        message: `Categoría actualizada a "${editingCategoryName.trim()}"`,
        timestamp: new Date()
      }, ...prev]);
    } catch (error: any) {
      console.error('Error actualizando categoría:', error);
      setNotifications(prev => [{
        type: 'error',
        message: 'Error al actualizar la categoría: ' + error.message,
        timestamp: new Date()
      }, ...prev]);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await api.deleteCategory(categoryId);
      await productsHook.loadCategories();
      setNotifications(prev => [{
        type: 'success',
        message: 'Categoría eliminada correctamente',
        timestamp: new Date()
      }, ...prev]);
    } catch (error: any) {
      console.error('Error eliminando categoría:', error);
      setNotifications(prev => [{
        type: 'error',
        message: error.message || 'Error al eliminar la categoría',
        timestamp: new Date()
      }, ...prev]);
    }
  };

  const editProduct = async (updatedProduct: Product) => {
    try {
      const precioFinal = updatedProduct.price <= 0 && updatedProduct.wholesalePrice > 0 
        ? updatedProduct.wholesalePrice 
        : updatedProduct.price;

      console.log('🔍 EDITAR - Precio calculado:', {
        unitario: updatedProduct.price,
        mayorista: updatedProduct.wholesalePrice,
        final: precioFinal
      });

      // Crear el producto actualizado con el precio final
      const productoActualizado = {
        ...updatedProduct,
        price: precioFinal
      };

      await updateProductHook(productoActualizado);
      
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      
      setNotifications(prev => [{
        type: 'success',
        message: `Producto "${updatedProduct.name}" actualizado correctamente`,
        timestamp: new Date()
      }, ...prev]);

    } catch (error: any) {
      console.error('❌ Error actualizando producto:', error);
      setErrors(prev => ({ 
        ...prev, 
        editProduct: 'Error al actualizar el producto: ' + error.message 
      }));
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await deleteProductHook(productId);
      
      setNotifications(prev => [{
        type: 'success',
        message: 'Producto eliminado correctamente',
        timestamp: new Date()
      }, ...prev]);
      
    } catch (error: any) {
      console.error('❌ Error eliminando producto:', error);
      setErrors(prev => ({ 
        ...prev, 
        deleteProduct: 'Error al eliminar el producto: ' + error.message 
      }));
    }
  };

  const updateStock = async (productId: number, newStock: number, reason = "Ajuste manual") => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        console.error('❌ Producto no encontrado:', productId);
        return;
      }

      const previousStock = product.stock;
      const finalStock = Math.max(0, newStock);
      const quantityChange = finalStock - previousStock;
      
      console.log('🔄 Actualizando stock:', {
        productId,
        productName: product.name,
        previousStock,
        newStock: finalStock,
        quantityChange,
        reason
      });

      // 1. Primero actualizar el stock en la base de datos
      await updateStockHook(productId, finalStock, reason);
      
      // 2. Solo registrar movimiento de inventario si hay cambio real
      if (quantityChange !== 0) {
        const movementType = quantityChange > 0 ? "entrada" : "salida";
        
        // Usar la estructura EXACTA que espera addInventoryMovementHook
        await addInventoryMovementHook({
          productId: product.id,
          productName: product.name,
          type: movementType,
          quantity: Math.abs(quantityChange),
          previousStock: previousStock,
          newStock: finalStock,
          reason: reason,
          productCost: product.cost || 0,
          productPrice: product.price || 0
          // NO incluir unitCost, unitPrice, totalCost, totalValue si no están en la definición
        });
      }

      setNotifications(prev => [{
        type: 'success',
        message: `Stock de ${product.name} actualizado: ${previousStock} → ${finalStock}`,
        timestamp: new Date()
      }, ...prev]);

    } catch (error: any) {
      console.error('❌ Error actualizando stock:', error);
      setErrors(prev => ({ 
        ...prev, 
        updateStock: 'Error al actualizar stock: ' + error.message 
      }));
      
      setNotifications(prev => [{
        type: 'error',
        message: `Error actualizando stock: ${error.message}`,
        timestamp: new Date()
      }, ...prev]);
    }
  };

  // ==================== FUNCIONES DE VENTAS ====================
  const addToCart = (product: Product) => {
    addToCartHook(product, isWholesaleSale, selectedCustomer, cart, setCart);
  };

  const removeFromCart = (productId: number) => {
    removeFromCartHook(productId, cart, setCart);
    
    const item = cart.find(item => item.productId === productId);
    if (item) {
      setNotifications(prev => [{
        type: 'info',
        message: `${item.productName} removido del carrito`,
        timestamp: new Date()
      }, ...prev]);
    }
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    updateCartQuantityHook(productId, quantity, cart, setCart, products, isWholesaleSale, selectedCustomer);
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      setErrors(prev => ({ ...prev, completeSale: 'El carrito está vacío' }));
      return;
    }

    try {
      const saleData = {
        cart,
        selectedCustomer,
        currentSubtotal,
        currentDiscount,
        currentTotal,
        currentPromotion,
        paymentMethod,
        isWholesaleSale,
        isInternalPurchase,
        products,
        updateStockInDatabase: async (productId: number, newStock: number) => {
          const product = products.find(p => p.id === productId);
          if (product) {
            await updateStockHook(productId, newStock, `Venta`);
          }
        },
        addInventoryMovement: addInventoryMovementHook
      };

      await completeSaleHook(saleData);

      setCart([]);
      setSelectedCustomer(null);
      setCurrentSubtotal(0);
      setCurrentDiscount(0);
      setCurrentTotal(0);
      setCurrentBreakdown([]);
      setCurrentPromotion(null);
      setIsWholesaleSale(false);
      setIsInternalPurchase(false);

      await Promise.all([
        loadSalesFromDB(products),
        productsHook.loadProducts(),
        loadInventoryMovementsHook()
      ]);
      
      setNotifications(prev => [{
        type: 'success',
        message: `✅ Venta completada exitosamente! Total: ${formatCurrency(currentTotal)}`,
        timestamp: new Date()
      }, ...prev]);

    } catch (error: any) {
      console.error('❌ Error completando venta:', error);
      setErrors(prev => ({ 
        ...prev, 
        completeSale: 'Error al procesar la venta: ' + error.message 
      }));
    }
  };

  // ==================== FUNCIONES DE PROVEEDORES ====================
  const addSupplier = async () => {
    console.log('📤 Iniciando creación de proveedor...');

    // Validar campos requeridos según el modelo Django
    if (!newSupplier.empresa.trim()) {
      setErrors(prev => ({ ...prev, addSupplier: 'El campo Empresa es requerido' }));
      return;
    }
    if (!newSupplier.contacto.trim()) {
      setErrors(prev => ({ ...prev, addSupplier: 'El campo Contacto es requerido' }));
      return;
    }
    if (!newSupplier.email.trim()) {
      setErrors(prev => ({ ...prev, addSupplier: 'El campo Email es requerido' }));
      return;
    }

    // ✅ NUEVA VALIDACIÓN: Verificar formato de email
    if (!isValidEmail(newSupplier.email.trim())) {
      setErrors(prev => ({ 
        ...prev, 
        addSupplier: 'Por favor ingresa un email válido (ejemplo: nombre@empresa.com)' 
      }));
      return;
    }

    try {
      // Estructura EXACTA que espera la API - SIN TIPADO ESTRICTO
      const supplierData: any = {
        empresa: newSupplier.empresa.trim(),
        contacto: newSupplier.contacto.trim(),
        email: newSupplier.email.trim(),
        telefono: newSupplier.telefono.trim() || null,
        direccion: newSupplier.direccion.trim() || null,
        productos_que_surte: newSupplier.productos_que_surte.trim() || null,
        productos_ids: newSupplier.productos_ids || [],
        ciudad: newSupplier.ciudad.trim() || null,
        rut: newSupplier.rut.trim() || null,
        condiciones_pago: newSupplier.condiciones_pago || null,
        tiempo_entrega: newSupplier.tiempo_entrega.trim() || null,
        activo: true
      };

      console.log('📤 Enviando datos a API:', supplierData);
      
      // Usar any para evitar problemas de tipo
      const createdSupplier = await addSupplierHook(supplierData as any);
      
      // Limpiar formulario
      setNewSupplier({ 
        empresa: "", 
        contacto: "", 
        email: "", 
        telefono: "", 
        direccion: "", 
        productos_que_surte: "",
        productos_ids: [],
        ciudad: "",
        rut: "",
        condiciones_pago: "",
        tiempo_entrega: "",
        activo: true
      });

      // Limpiar errores
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.addSupplier;
        return newErrors;
      });

      setNotifications(prev => [{
        type: 'success',
        message: `Proveedor "${supplierData.empresa}" agregado correctamente`,
        timestamp: new Date()
      }, ...prev]);

      // Cerrar diálogo después de un breve delay
      setTimeout(() => {
        const dialogs = document.querySelectorAll('[data-state="open"]');
        dialogs.forEach(dialog => {
          const closeBtn = dialog.querySelector('button[aria-label="Close"]');
          if (closeBtn) (closeBtn as HTMLButtonElement).click();
        });
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Error agregando proveedor:', error);
      
      let errorMessage = 'Error al crear el proveedor';
      if (error.message) {
        // Extraer mensaje específico de email si existe
        if (error.message.includes('email') || error.message.includes('correo')) {
          errorMessage = 'Por favor ingresa un email válido (ejemplo: nombre@empresa.com)';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors(prev => ({ 
        ...prev, 
        addSupplier: errorMessage
      }));
    }
  };

  const updateSupplier = async (updatedSupplier: Supplier) => {
    try {
      console.log('📝 Actualizando proveedor:', updatedSupplier);
      
      if (!updatedSupplier.id_proveedor) {
        throw new Error('ID de proveedor inválido');
      }

      // ✅ NUEVA VALIDACIÓN: Verificar formato de email
      if (!isValidEmail(updatedSupplier.email.trim())) {
        setErrors(prev => ({ 
          ...prev, 
          updateSupplier: 'Por favor ingresa un email válido (ejemplo: nombre@empresa.com)' 
        }));
        return;
      }

      // Preparar datos para la API - SIN TIPADO ESTRICTO
      const supplierData: any = {
        empresa: updatedSupplier.empresa,
        contacto: updatedSupplier.contacto,
        email: updatedSupplier.email,
        telefono: updatedSupplier.telefono || null,
        direccion: updatedSupplier.direccion || null,
        productos_que_surte: updatedSupplier.productos_que_surte || null,
        productos_ids: updatedSupplier.productos_ids || [],
        ciudad: updatedSupplier.ciudad || null,
        rut: updatedSupplier.rut || null,
        condiciones_pago: updatedSupplier.condiciones_pago || null,
        tiempo_entrega: updatedSupplier.tiempo_entrega || null,
        activo: updatedSupplier.activo !== false
      };

      // Usar any para evitar problemas de tipo
      await updateSupplierHook(updatedSupplier.id_proveedor, supplierData as any);
      
      setIsEditSupplierDialogOpen(false);
      setEditingSupplier(null);
      
      setNotifications(prev => [{
        type: 'success',
        message: `Proveedor "${updatedSupplier.empresa}" actualizado correctamente`,
        timestamp: new Date()
      }, ...prev]);

    } catch (error: any) {
      console.error('❌ Error actualizando proveedor:', error);
      
      let errorMessage = 'Error al actualizar el proveedor';
      if (error.message) {
        // Extraer mensaje específico de email si existe
        if (error.message.includes('email') || error.message.includes('correo')) {
          errorMessage = 'Por favor ingresa un email válido (ejemplo: nombre@empresa.com)';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors(prev => ({ 
        ...prev, 
        updateSupplier: errorMessage 
      }));
    }
  };

  const deleteSupplier = async (supplierId: number) => {
    console.log('🔍 Deleting supplier with ID:', supplierId, 'Type:', typeof supplierId);

    if (!supplierId || isNaN(supplierId) || supplierId <= 0) {
      console.error('❌ Invalid supplier ID:', supplierId);
      setErrors(prev => ({ 
        ...prev, 
        deleteSupplier: 'ID de proveedor inválido: ' + supplierId 
      }));
      return;
    }

    try {
      await deleteSupplierHook(supplierId);
      
      setNotifications(prev => [{
        type: 'success',
        message: 'Proveedor eliminado correctamente',
        timestamp: new Date()
      }, ...prev]);

    } catch (error: any) {
      console.error('❌ Error eliminando proveedor:', error);
      let errorMessage = 'Error al eliminar el proveedor';
      
      if (error.response) {
        errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(prev => ({ 
        ...prev, 
        deleteSupplier: errorMessage 
      }));
    }
  };

  // ==================== FUNCIONES DE CLIENTES Y PROMOCIONES ====================
  const addCustomer = () => {
    if (newCustomer.name && newCustomer.email) {
      const customer: Customer = {
        id: Date.now(),
        ...newCustomer,
        isFrequent: false,
        totalPurchases: 0,
        totalSpent: 0,
        registrationDate: new Date().toISOString(),
        lastPurchaseDate: "",
      };
      setCustomers([...customers, customer]);
      
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
        isWholesale: false,
      });

      setNotifications(prev => [{
        type: 'success',
        message: `Cliente "${newCustomer.name}" agregado correctamente`,
        timestamp: new Date()
      }, ...prev]);

      const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
      if (closeButton) closeButton.click();
    }
  };

  const deleteCustomer = (customerId: number) => {
    setCustomers(customers.filter((c) => c.id !== customerId));
    
    setNotifications(prev => [{
      type: 'info',
      message: 'Cliente eliminado correctamente',
      timestamp: new Date()
    }, ...prev]);
  };

  const addPromotion = () => {
    if (newPromotion.name) {
      if (newPromotion.discountType === "bundle") {
        if (newPromotion.bundleBuy <= 0 || newPromotion.bundlePay <= 0 || newPromotion.bundleBuy <= newPromotion.bundlePay) {
          setErrors(prev => ({ 
            ...prev, 
            addPromotion: "Para ofertas X por Y, debes especificar cantidades válidas (ejemplo: compra 3, paga 2)" 
          }));
          return;
        }
      } else if (newPromotion.discountValue <= 0) {
        setErrors(prev => ({ 
          ...prev, 
          addPromotion: "Debes especificar un valor de descuento válido" 
        }));
        return;
      }

      const promotion: Promotion = {
        id: Date.now(),
        ...newPromotion,
      };
      setPromotions([...promotions, promotion]);
      
      setNewPromotion({
        name: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        bundleBuy: 0,
        bundlePay: 0,
        appliesTo: "all",
        specificProducts: [],
        specificCategories: [],
        minPurchase: 0,
        forFrequentOnly: false,
        isActive: true,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });

      setNotifications(prev => [{
        type: 'success',
        message: `Promoción "${newPromotion.name}" creada correctamente`,
        timestamp: new Date()
      }, ...prev]);

      const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
      if (closeButton) closeButton.click();
    }
  };

  const togglePromotionStatus = (promotionId: number) => {
    setPromotions(promotions.map((p) => (p.id === promotionId ? { ...p, isActive: !p.isActive } : p)));
  };

  const deletePromotion = (promotionId: number) => {
    setPromotions(promotions.filter((p) => p.id !== promotionId));
    
    setNotifications(prev => [{
      type: 'info',
      message: 'Promoción eliminada correctamente',
      timestamp: new Date()
    }, ...prev]);
  };

  // ==================== FUNCIONES UTILITARIAS ====================
  const reloadAllData = async () => {
    try {
      await Promise.all([
        productsHook.loadProducts(),
        loadSalesFromDB(productsHook.products),
        loadSuppliersHook(),
        loadInventoryMovementsHook()
      ]);

      setNotifications(prev => [{
        type: 'success',
        message: 'Datos actualizados correctamente',
        timestamp: new Date()
      }, ...prev]);

    } catch (error) {
      console.error('❌ Error recargando datos:', error);
      setNotifications(prev => [{
        type: 'error',
        message: 'Error al actualizar los datos',
        timestamp: new Date()
      }, ...prev]);
    }
  };

  const clearError = (errorKey: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[errorKey];
      return newErrors;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // ==================== FUNCIONES DE ABASTECIMIENTO ====================
  const loadOrdenesCompra = async () => {
    try {
      const ordenes = await api.getOrdenesCompra();
      setOrdenesCompra(ordenes);
    } catch (error) {
      console.error('Error cargando órdenes de compra:', error);
    }
  };

  const loadDevolucionesProveedores = async () => {
    try {
      const devoluciones = await api.getDevolucionesProveedores();
      setDevolucionesProveedores(devoluciones);
    } catch (error) {
      console.error('Error cargando devoluciones:', error);
    }
  };

  const createPurchaseOrder = async (order: OrdenCompra) => {
    setOrdenesCompra(prev => [order, ...prev]);
    setShowPurchaseOrderForm(false);
    await loadOrdenesCompra();
  };

  const receiveProducts = async (orderId: number, items: any[]) => {
    setShowReceiveProductsForm(false);
    setSelectedOrderForReceiving(null);
    await loadOrdenesCompra();
    await productsHook.loadProducts();
    await loadInventoryMovementsHook();
  };

  const createReturn = async (returnData: any) => {
    setDevolucionesProveedores(prev => [returnData, ...prev]);
    setShowCreateReturnForm(false);
    await loadDevolucionesProveedores();
  };

  const processReturn = async (devolucionId: number, estado: string) => {
    try {
      await api.procesarDevolucion(devolucionId, estado);
      await loadDevolucionesProveedores();
      if (estado === 'aprobada') {
        await productsHook.loadProducts();
      }
      
      setNotifications(prev => [{
        type: 'success',
        message: `Devolución ${estado} correctamente`,
        timestamp: new Date()
      }, ...prev]);

    } catch (error: any) {
      console.error('❌ Error procesando devolución:', error);
      setErrors(prev => ({ 
        ...prev, 
        processReturn: 'Error al procesar la devolución: ' + error.message 
      }));
    }
  };

  // ===========================================================================
  // SUBSECCIÓN 6.5: FUNCIONES DE EXPORTACIÓN
  // ===========================================================================
  
  const exportProductsToExcel = () => {
    const data = products.map((product) => ({
      Nombre: product.name,
      SKU: product.sku,
      "Código de Barras": product.barcode,
      Categoría: product.category || "Sin categoría",
      "Precio Minorista": `$${product.price}`,
      "Precio Mayorista": `$${product.wholesalePrice || (product.price * 0.9).toFixed(2)}`,
      Costo: `$${product.cost}`,
      "Ganancia Unitaria": `$${(product.price - product.cost).toFixed(2)}`,
      "Margen de Ganancia": product.cost > 0 ? `${(((product.price - product.cost) / product.cost) * 100).toFixed(1)}%` : "0.0%",
      "Stock Actual": product.stock,
      "Stock Mínimo": product.minStock,
      "Fecha Vencimiento": product.expiryDate || "Sin fecha",
      Estado: product.stock <= product.minStock ? "CRÍTICO" : product.stock <= product.minStock * 2 ? "BAJO" : "NORMAL",
      "Valor en Stock": `$${(product.stock * product.price).toFixed(2)}`,
      "Inversión en Stock": `$${(product.stock * product.cost).toFixed(2)}`,
      "Ganancia Potencial": `$${(product.stock * (product.price - product.cost)).toFixed(2)}`,
      //Descripción: product.description,
    }));

    exportToExcel(data, "reporte-productos", "Inventario de Productos");
  };

  const exportSalesToExcel = () => {
    const mainData = sales.flatMap((sale) =>
      sale.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const subtotal = safeNumber(item.subtotal);
        const price = safeNumber(item.price);
        const quantity = safeNumber(item.quantity);
        const productCost = safeNumber(product?.cost);
        const ganancia = (price - productCost) * quantity;

        return {
          "Número de Venta": sale.saleNumber,
          Fecha: sale.date,
          Producto: item.productName,
          Cantidad: item.quantity,
          "Precio Unitario": `$${item.price}`,
          "Costo Unitario": `$${product?.cost || 0}`,
          Subtotal: `$${item.subtotal.toFixed(2)}`,
          Ganancia: `$${ganancia.toFixed(2)}`,
          "Total de la Venta": `$${sale.total.toFixed(2)}`,
        };
      }),
    );

    exportToExcel(mainData, "reporte-ventas", "Historial de Ventas");
  };

  const exportSuppliersToExcel = () => {
    const data = suppliers.map((supplier) => ({
      Empresa: supplier.empresa,
      Contacto: supplier.contacto,
      Email: supplier.email,
      Teléfono: supplier.telefono,
      Dirección: supplier.direccion,
      Ciudad: supplier.ciudad || "",
      RFC: supplier.rut || "",
      "Condiciones de Pago": supplier.condiciones_pago || "",
      "Tiempo de Entrega": supplier.tiempo_entrega || "",
      "Productos que Surte": supplier.productos_que_surte,
      Estado: supplier.activo ? "Activo" : "Inactivo"
    }));

    exportToExcel(data, "proveedores", "Lista de Proveedores");
  };

  const exportInventoryToExcel = () => {
    const mainData = inventoryMovements.map((movement) => {
      const ganancia = movement.type === "salida" ? (movement.unitPrice - movement.unitCost) * movement.quantity : 0;
      const unitCost = Number(movement.unitCost) || 0;
      const unitPrice = Number(movement.unitPrice) || 0;
      const quantity = Number(movement.quantity) || 0;

      return {
        "ID Movimiento": movement.id,
        Fecha: new Date(movement.date).toLocaleDateString('es-MX'),
        Producto: movement.productName,
        "Tipo de Movimiento": movement.type.toUpperCase(),
        Cantidad: movement.quantity,
        "Stock Anterior": movement.previousStock,
        "Stock Nuevo": movement.newStock,
        "Costo Unitario": `$${movement.unitCost}`,
        "Precio Unitario": `$${movement.unitPrice}`,
        "Valor Total": `$${movement.totalValue.toFixed(2)}`,
        Ganancia: `$${ganancia.toFixed(2)}`,
        Motivo: movement.reason,
        "Venta Relacionada": movement.venta_numero || "N/A",
        "Proveedor": movement.proveedor_nombre || "N/A",
        Usuario: movement.usuario || "Sistema"
      };
    });

    exportToExcel(mainData, "movimientos-inventario", "Movimientos de Inventario");
  };

    // Agregar estas funciones después de las otras funciones de exportación
  const exportCustomersToExcel = () => {
    const data = customers.map((customer) => ({
      Nombre: customer.name,
      Email: customer.email,
      Teléfono: customer.phone,
      Dirección: customer.address,
      Tipo: customer.isWholesale ? "Mayorista" : "Minorista",
      Estado: customer.isFrequent ? "VIP" : "Regular",
      'Total Compras': customer.totalPurchases,
      'Total Gastado': `$${customer.totalSpent.toLocaleString()}`,
      'Ticket Promedio': `$${customer.totalPurchases > 0 ? (customer.totalSpent / customer.totalPurchases).toFixed(2) : "0.00"}`,
      'Fecha Registro': customer.registrationDate,
      'Última Compra': customer.lastPurchaseDate || "Sin compras",
      Notas: customer.notes || ""
    }));

    exportToExcel(data, "clientes", "Base de Clientes");
  };

  const exportPromotionsToExcel = () => {
    const data = promotions.map((promo) => {
      let aplicaA = "";
      if (promo.appliesTo === "all") {
        aplicaA = "Todos los productos";
      } else if (promo.appliesTo === "specific") {
        aplicaA = `${promo.specificProducts.length} productos específicos`;
      } else if (promo.appliesTo === "category") {
        aplicaA = promo.specificCategories.join(", ");
      }

      let descuento = "";
      if (promo.discountType === "percentage") {
        descuento = `${promo.discountValue}%`;
      } else if (promo.discountType === "fixed") {
        descuento = `$${promo.discountValue}`;
      } else if (promo.discountType === "bundle") {
        descuento = `${promo.bundleBuy}x${promo.bundlePay}`;
      }

      return {
        Nombre: promo.name,
        Descripción: promo.description,
        'Tipo Descuento': promo.discountType,
        Descuento: descuento,
        'Aplica a': aplicaA,
        'Compra Mínima': promo.minPurchase > 0 ? `$${promo.minPurchase}` : "Sin mínimo",
        'Solo VIP': promo.forFrequentOnly ? "Sí" : "No",
        Estado: promo.isActive ? "Activa" : "Inactiva",
        'Fecha Inicio': promo.startDate,
        'Fecha Fin': promo.endDate
      };
    });

    exportToExcel(data, "promociones", "Promociones");
  };

  const exportCategoryReport = () => {
    const categoryData = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          cantidadProductos: 0,
          stockTotal: 0,
          valorTotal: 0
        };
      }
      acc[product.category].cantidadProductos++;
      acc[product.category].stockTotal += product.stock;
      acc[product.category].valorTotal += product.stock * product.price;
      
      return acc;
    }, {} as Record<string, { cantidadProductos: number; stockTotal: number; valorTotal: number }>);

    const data = Object.entries(categoryData).map(([categoria, info]) => ({
      Categoría: categoria,
      'Cantidad de Productos': info.cantidadProductos,
      'Stock Total': info.stockTotal,
      'Valor Total': `$${info.valorTotal.toFixed(2)}`
    }));

    exportToExcel(data, "stock-por-categoria", "Stock por Categoría");
  };

  const exportExpiringProducts = () => {
    const today = new Date();
    
    type ProductoVencimiento = {
      Producto: string;
      SKU: string;
      Categoría: string;
      'Fecha Vencimiento': string;
      'Días Restantes': number;
      Estado: string;
      Stock: number;
      'Valor en Stock': string;
      Alerta: string;
    };

    const data: ProductoVencimiento[] = products
      .filter(product => {
        if (!product.expiryDate) return false;
        const expiryDate = new Date(product.expiryDate);
        return !isNaN(expiryDate.getTime());
      })
      .map(product => {
        const expiryDate = new Date(product.expiryDate!);
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let estado: string;
        if (diffDays < 0) {
          estado = "VENCIDO";
        } else if (diffDays <= 7) {
          estado = "CRÍTICO";
        } else if (diffDays <= 30) {
          estado = "PRÓXIMO";
        } else {
          estado = "VIGENTE";
        }
        
        return {
          Producto: product.name,
          SKU: product.sku,
          Categoría: product.category,
          'Fecha Vencimiento': product.expiryDate!, // Sabemos que no es undefined
          'Días Restantes': diffDays,
          Estado: estado,
          Stock: product.stock,
          'Valor en Stock': `$${(product.stock * product.price).toFixed(2)}`,
          'Alerta': diffDays <= 7 ? '⚠️ URGENTE' : diffDays <= 30 ? '⚠️ ATENCIÓN' : '✅ NORMAL'
        };
      })
      .sort((a, b) => {
        const estadoPrioridad: Record<string, number> = {
          'VENCIDO': 1,
          'CRÍTICO': 2,
          'PRÓXIMO': 3,
          'VIGENTE': 4
        };
        
        const prioridadA = estadoPrioridad[a.Estado] || 5;
        const prioridadB = estadoPrioridad[b.Estado] || 5;
        
        if (prioridadA === prioridadB) {
          const dateA = new Date(a['Fecha Vencimiento']).getTime();
          const dateB = new Date(b['Fecha Vencimiento']).getTime();
          return dateA - dateB;
        }
        
        return prioridadA - prioridadB;
      });

    if (data.length === 0) {
      setNotifications(prev => [{
        type: 'info',
        message: 'No hay productos con fechas de vencimiento para exportar',
        timestamp: new Date()
      }, ...prev]);
      return;
    }

    exportToExcel(data, "productos-por-vencer", "Productos por Vencer");

    setNotifications(prev => [{
      type: 'success',
      message: `Reporte de productos por vencer exportado: ${data.length} productos`,
      timestamp: new Date()
    }, ...prev]);
  };

  const exportObsoleteProducts = () => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const data = products
      .filter(product => {
        // Productos sin ventas recientes (simplificado)
        const lastSold = product.lastSoldDate ? new Date(product.lastSoldDate) : null;
        return !lastSold || lastSold < sixtyDaysAgo;
      })
      .map(product => ({
        Producto: product.name,
        SKU: product.sku,
        Categoría: product.category,
        Stock: product.stock,
        'Última Venta': product.lastSoldDate || "Sin ventas registradas",
        'Valor en Stock': `$${(product.stock * product.price).toFixed(2)}`
      }));

    exportToExcel(data, "productos-obsoletos", "Productos Obsoletos");
  };

  const exportProfitableProducts = () => {
    const data = products
      .map(product => {
        const gananciaUnitaria = product.price - product.cost;
        const margen = product.cost > 0 ? (gananciaUnitaria / product.cost) * 100 : 0;
        const gananciaTotal = gananciaUnitaria * product.stock;
        
        return {
          Producto: product.name,
          SKU: product.sku,
          Categoría: product.category,
          Precio: `$${product.price}`,
          Costo: `$${product.cost}`,
          'Ganancia Unitaria': `$${gananciaUnitaria.toFixed(2)}`,
          'Margen %': `${margen.toFixed(1)}%`,
          Stock: product.stock,
          'Ganancia Total Potencial': `$${gananciaTotal.toFixed(2)}`
        };
      })
      .sort((a, b) => {
        const gananciaA = parseFloat(a['Ganancia Total Potencial'].replace('$', ''));
        const gananciaB = parseFloat(b['Ganancia Total Potencial'].replace('$', ''));
        return gananciaB - gananciaA;
      });

    exportToExcel(data, "productos-rentables", "Productos Rentables");
  };

  const exportPaymentMethodsReport = () => {
    const paymentData = sales.reduce((acc, sale) => {
      if (sale.status === "completed") {
        const method = sale.paymentMethod || "cash";
        if (!acc[method]) {
          acc[method] = { ventas: 0, total: 0 };
        }
        acc[method].ventas++;
        acc[method].total += sale.total;
      }
      return acc;
    }, {} as Record<string, { ventas: number; total: number }>);

    const data = Object.entries(paymentData).map(([metodo, info]) => ({
      'Método de Pago': metodo === "cash" ? "Efectivo" : 
                      metodo === "transfer" ? "Transferencia" : "Tarjeta",
      'Cantidad de Ventas': info.ventas,
      'Total Recaudado': `$${info.total.toFixed(2)}`,
      'Porcentaje del Total': `${((info.total / totalRevenue) * 100).toFixed(1)}%`
    }));

    exportToExcel(data, "ventas-por-metodo-pago", "Ventas por Método de Pago");
  };

  // ===========================================================================
  // SUBSECCIÓN 6.6: FUNCIONES DE BACKUP Y RECUPERACIÓN
  // ===========================================================================
  
  const resetSalesHistory = async () => {
    try {
      // Guardar backup local
      setSalesBackup([...sales]);
      setSales([]);
      setShowRecoverySales(true);
      
      // ✅ ELIMINAR DE LA BASE DE DATOS
      await api.deleteAllSales();
      
      setTimeRemaining(10);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowRecoverySales(false);
            setSalesBackup([]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setRecoveryTimer(timer);
      
    } catch (error) {
      console.error('Error eliminando ventas:', error);
      // Si hay error, recuperar los datos locales
      setSales([...salesBackup]);
      setSalesBackup([]);
      setShowRecoverySales(false);
    }
  };

  const resetInventoryMovements = async () => {
    try {
      // Guardar backup local
      setInventoryMovementsBackup([...inventoryMovements]);
      setInventoryMovements([]);
      setShowRecoveryInventory(true);
      
      // ✅ ELIMINAR DE LA BASE DE DATOS
      await api.deleteAllInventoryMovements();
      
      setTimeRemainingInventory(10);
      
      const timer = setInterval(() => {
        setTimeRemainingInventory(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowRecoveryInventory(false);
            setInventoryMovementsBackup([]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setRecoveryTimerInventory(timer);
      
    } catch (error) {
      console.error('Error eliminando movimientos:', error);
      // Si hay error, recuperar los datos locales
      setInventoryMovements([...inventoryMovementsBackup]);
      setInventoryMovementsBackup([]);
      setShowRecoveryInventory(false);
    }
  };

  const recoverSalesHistory = () => {
    if (recoveryTimer) {
      clearInterval(recoveryTimer);
      setRecoveryTimer(null);
    }
    
    setSales([...salesBackup]);
    setSalesBackup([]);
    setShowRecoverySales(false);
    setTimeRemaining(0);
  };

  const recoverInventoryMovements = () => {
    if (recoveryTimerInventory) {
      clearInterval(recoveryTimerInventory);
      setRecoveryTimerInventory(null);
    }
    
    setInventoryMovements([...inventoryMovementsBackup]);
    setInventoryMovementsBackup([]);
    setShowRecoveryInventory(false);
    setTimeRemainingInventory(0);
  };

  // ===========================================================================
  // SUBSECCIÓN 6.7: CÁLCULOS Y DATOS PARA UI
  // ===========================================================================
  
  const completedSales = sales.filter(sale => sale.status === "completed");
  const totalRevenue = completedSales.reduce((sum, sale) => {
    const saleTotal = Number(sale.total) || 0;
    return sum + saleTotal;
  }, 0);
  
  const totalSalesCount = completedSales.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock).length;
  const criticalStockProducts = products.filter((p) => p.stock <= p.minStock);
  const totalSuppliers = suppliers.length;
  
  const totalProfit = inventoryMovements
    .filter((m) => m.type === "salida")
    .reduce((sum, m) => sum + (m.unitPrice - m.unitCost) * m.quantity, 0);

  // Extraemos los datos calculados correctamente desde el estado dashboardData
  const { salesChartData, productsSoldData, categoryRevenueData } = dashboardData;

  console.log('🔍 DEBUG - Datos de productos vendidos:', {
    totalSales: sales.length,
    completedSales: sales.filter(s => s.status === "completed").length,
    allProductsCount: products.length,
    productSalesData: productsSoldData,
    categoryRevenueData: categoryRevenueData
  });

  // También verifica una venta específica:
  // if (sales.length > 0) {
    //console.log('🔍 Ejemplo de venta:', sales[0]);
    //console.log('🔍 Items de la venta:', sales[0].items);
  // }

  //console.log('🔍 DETALLE de Items de venta expandido:');
  if (sales.length > 0) {
    sales[0].items.forEach((item, index) => {
      console.log(`Item ${index}:`, JSON.parse(JSON.stringify(item)));
    });
  }

  //console.log('🔍 Información del producto 1:');
  const product1 = products.find(p => p.id === 1);
  console.log('Producto 1:', product1);

  //console.log('🔍 Todos los productos disponibles:');
  products.forEach(p => {
    console.log(`Producto ${p.id}:`, {
      name: p.name,
      category: p.category,
      price: p.price,
      cost: p.cost
    });
  });

  // Verificar categorías únicas
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  console.log('🔍 Categorías únicas:', uniqueCategories);

  // ===========================================================================
  // SUBSECCIÓN 6.8: RENDERIZADO POR PESTAÑA
  // ===========================================================================

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <Card className="border-l-4 border-l-blue-600 shadow-md bg-white">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
                  <p className="text-gray-500">Resumen general de tu negocio</p>
                </div>
                  <div className="text-right mt-4 md:mt-0 bg-gray-50 p-3 rounded-lg border border-gray-100 min-w-[200px]">
                    <div className="text-right mt-4 md:mt-0 bg-gray-50 p-3 rounded-lg border border-gray-100 min-w-[200px]">
                    {/* Hora: Formato HH:MM:SS */}
                    <div className="text-3xl font-bold text-blue-700 font-mono tracking-widest min-h-[36px]">
                      {currentDate ? (
                        currentDate.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          second: '2-digit',
                          hour12: false 
                        })
                      ) : (
                        // Placeholder mientras carga para evitar salto visual
                        <span className="opacity-0">00:00:00</span> 
                      )}
                    </div>
                    {/* Fecha: Formato DD/MM/AAAA */}
                    <div className="text-xl font-bold text-gray-700 mt-1 border-t border-gray-200 pt-1 min-h-[32px]">
                      {currentDate ? (
                        currentDate.toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      ) : (
                        <span className="opacity-0">--/--/----</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Ingresos Totales"
                value={formatCurrency(totalRevenue)}
                subtitle={`${totalSalesCount} ventas realizadas`}
                icon={DollarSign}
                color="blue"
                onClick={() => setActiveTab("history")}
              />
              <MetricCard
                title="Productos"
                value={totalProducts}
                subtitle={`${lowStockProducts} con stock bajo`}
                icon={Package}
                color="cyan"
                onClick={() => setActiveTab("products")}
              />
              <MetricCard
                title="Ganancias"
                value={`$${totalProfit.toLocaleString()}`}
                subtitle="Ganancia total"
                icon={TrendingUp}
                color="green"
                onClick={() => setActiveTab("inventory")}
              />
              <MetricCard
                title="Proveedores"
                value={totalSuppliers}
                subtitle="Proveedores activos"
                icon={Users}
                color="orange"
                onClick={() => setActiveTab("suppliers")}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Gráfico de Ventas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesChart data={salesChartData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Productos Más Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductsPieChart data={productsSoldData} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Ingresos por Categoría
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryBarChart data={categoryRevenueData} />
                </CardContent>
              </Card>

              {criticalStockProducts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-red-500" />
                      Alertas de Stock Crítico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {criticalStockProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex justify-between items-center p-2 bg-red-50 rounded border-l-4 border-red-500"
                        >
                          <div>
                            <span className="font-medium">{product.name}</span>
                            <div className="text-sm text-muted-foreground">
                              Stock actual: {product.stock} | Mínimo: {product.minStock}
                            </div>
                          </div>
                          <Badge variant="destructive">CRÍTICO</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case "products":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gestión de Productos</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Producto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                        <DialogDescription>
                          Complete la información del nuevo producto. Los campos marcados con * son obligatorios.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div>
                          <Label htmlFor="product-name">Nombre *</Label>
                          <Input
                            id="product-name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="Nombre del producto"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="product-sku">SKU</Label>
                            <div className="p-2 border rounded-md bg-gray-50 text-gray-600">
                              {products.length > 0 
                                ? `SKU-${(parseInt(products[products.length - 1].sku.replace('SKU-', '')) + 1).toString().padStart(3, '0')}`
                                : 'SKU-001'
                              }
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              El SKU se genera automáticamente en secuencia
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="product-barcode">Código de Barras</Label>
                            <Input
                              id="product-barcode"
                              value={newProduct.barcode}
                              onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                              placeholder="7501234567890"
                            />
                          </div>
                        </div>
                        
                        {/* PRECIOS MEJORADOS */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="product-price">Precio Unitario *</Label>
                            <Input
                              id="product-price"
                              type="number"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="product-wholesale">Precio Mayorista</Label>
                            <Input
                              id="product-wholesale"
                              type="number"
                              value={newProduct.wholesalePrice}
                              onChange={(e) => setNewProduct({ ...newProduct, wholesalePrice: Number(e.target.value) })}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="product-cost">Costo</Label>
                            <Input
                              id="product-cost"
                              type="number"
                              value={newProduct.cost}
                              onChange={(e) => setNewProduct({ ...newProduct, cost: Number(e.target.value) })}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="product-stock">Stock</Label>
                            <Input
                              id="product-stock"
                              type="number"
                              value={newProduct.stock}
                              onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="product-minstock">Stock Mínimo</Label>
                            <Input
                              id="product-minstock"
                              type="number"
                              value={newProduct.minStock}
                              onChange={(e) => setNewProduct({ ...newProduct, minStock: Number(e.target.value) })}
                              placeholder="1"
                              min="1"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="product-category">Categoría</Label>
                            <select
                              id="product-category"
                              value={selectedCategoryId || ''}
                              onChange={(e) => {
                                console.log('🔍 Categoría seleccionada:', e.target.value);
                                setSelectedCategoryId(Number(e.target.value));
                              }}
                              className="w-full p-2 border rounded-md"
                              required
                            >
                              <option value="">Selecciona una categoría</option>
                              {categories.map(cat => (
                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                  {cat.nombre} (ID: {cat.id_categoria})
                                </option>
                              ))}
                            </select>
                            {!selectedCategoryId ? (
                              <p className="text-red-500 text-sm mt-1">Debes seleccionar una categoría</p>
                            ) : (
                              <p className="text-green-500 text-sm mt-1">Categoría seleccionada: ID {selectedCategoryId}</p>
                            )}
                          </div>
                          {/* NUEVO: Fecha de vencimiento */}
                          <div>
                            <Label htmlFor="product-expiry">Fecha de Vencimiento (opcional)</Label>
                            <Input
                              id="product-expiry"
                              type="date"
                              value={newProduct.expiryDate}
                              onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-4">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancelar</Button>
                          </DialogTrigger>
                          <Button onClick={addProduct}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Producto
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* NUEVO: FILTROS MEJORADOS */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Input
                      placeholder="Buscar productos por nombre, SKU, código de barras..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="max-w-md"
                    />
                    
                    {/* FILTRO POR CATEGORÍA - NUEVO */}
                    <Select
                      value={filterCategoryId?.toString() || "all"}
                      onValueChange={(value) => {
                        if (value === "all") {
                          setFilterCategoryId(null);
                        } else {
                          setFilterCategoryId(Number(value));
                        }
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map((category) => (
                          <SelectItem 
                            key={category.id_categoria} 
                            value={category.id_categoria.toString()}
                          >
                            {category.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={exportProductsToExcel} variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Costo</TableHead>
                        <TableHead>Ganancia</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsHook.filterProducts(productSearchTerm)
                        .filter(product => {
                          // FILTRO POR CATEGORÍA - NUEVO
                          return filterCategoryId === null || product.categoryId === filterCategoryId;
                        })
                        .filter(product => product && product.id)
                        .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.category || "Sin categoría"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-mono">{product.sku}</div>
                              <div className="text-xs text-muted-foreground">{product.barcode}</div>
                            </div>
                          </TableCell>
                          <TableCell>${product.price}</TableCell>
                          <TableCell>${product.cost}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-green-600">
                                ${(product.price - product.cost).toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {product.cost > 0
                                  ? (((product.price - product.cost) / product.cost) * 100).toFixed(1)
                                  : "0"}
                                %
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  product.stock <= product.minStock
                                    ? "destructive"
                                    : product.stock <= product.minStock * 2
                                      ? "secondary"
                                      : "default"
                                }
                              >
                                {product.stock}
                              </Badge>
                              <span className="text-xs text-muted-foreground">(Mín: {product.minStock})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.stock <= product.minStock
                                  ? "destructive"
                                  : product.stock <= product.minStock * 2
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {product.stock <= product.minStock
                                ? "CRÍTICO"
                                : product.stock <= product.minStock * 2
                                  ? "BAJO"
                                  : "NORMAL"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStock(product.id, product.stock + 1, "Entrada manual")}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStock(product.id, product.stock - 1, "Salida manual")}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Dialog
                                open={isEditDialogOpen && editingProduct?.id === product.id}
                                onOpenChange={(open) => {
                                  setIsEditDialogOpen(open)
                                  if (!open) setEditingProduct(null)
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingProduct(product)
                                      setIsEditDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Editar Producto</DialogTitle>
                                  </DialogHeader>
                                  {editingProduct && (
                                    <EditProductForm
                                      product={editingProduct}
                                      onSave={editProduct}
                                      onCancel={() => {
                                        setIsEditDialogOpen(false)
                                        setEditingProduct(null)
                                      }}
                                      categories={categories}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Se eliminará permanentemente el producto "
                                      {product.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteProduct(product.id)}>
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "categories":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Gestión de Categorías
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Crea, edita y elimina categorías para organizar tus productos
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Categoría
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Categoría</DialogTitle>
                        <DialogDescription>
                          Ingresa el nombre de la nueva categoría. Luego podrás asignarla a tus productos.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="new-category-name">Nombre de la Categoría *</Label>
                          <Input
                            id="new-category-name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Ej: Bebidas, Lácteos, Limpieza..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateCategory();
                              }
                            }}
                          />
                        </div>
                        {errors.category && (
                          <p className="text-red-500 text-sm">{errors.category}</p>
                        )}
                        <div className="flex justify-end gap-2">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancelar</Button>
                          </DialogTrigger>
                          <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Categoría
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">No hay categorías</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Crea tu primera categoría para organizar los productos
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category: any) => {
                      const productCount = products.filter(p => p.categoryId === category.id_categoria).length;
                      return (
                        <div
                          key={category.id_categoria}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          {editingCategoryId === category.id_categoria ? (
                            <div className="space-y-3">
                              <Input
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleUpdateCategory(category.id_categoria);
                                  if (e.key === 'Escape') { setEditingCategoryId(null); setEditingCategoryName(''); }
                                }}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleUpdateCategory(category.id_categoria)}>
                                  Guardar
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => { setEditingCategoryId(null); setEditingCategoryName(''); }}>
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-lg">{category.nombre}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {productCount} {productCount === 1 ? 'producto' : 'productos'}
                                  </p>
                                </div>
                                <Badge variant="secondary">ID: {category.id_categoria}</Badge>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingCategoryId(category.id_categoria);
                                    setEditingCategoryName(category.nombre);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Editar
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive" disabled={productCount > 0}>
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Eliminar
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar categoría "{category.nombre}"?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Se eliminará la categoría permanentemente.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteCategory(category.id_categoria)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              {productCount > 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  ⚠️ No se puede eliminar porque tiene productos asignados
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "sales":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Buscar por nombre, SKU, código de barras..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="grid gap-2 max-h-96 overflow-y-auto">
                  {productsHook.searchProducts(searchTerm).map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.sku} | Min: ${product.price}
                          {isWholesaleSale && ` | May: $${product.wholesalePrice}`} - Stock: {product.stock}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => addToCart(product)} disabled={product.stock === 0}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Carrito de Compras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={isWholesaleSale} 
                      onCheckedChange={setIsWholesaleSale}
                      id="wholesale-mode"
                    />
                    <Label htmlFor="wholesale-mode" className="cursor-pointer">
                      Venta Mayorista
                    </Label>
                  </div>
                  {/* <div className="flex items-center space-x-2">
                    <Switch 
                      checked={isInternalPurchase} 
                      onCheckedChange={setIsInternalPurchase}
                      id="internal-purchase"
                    />
                    <Label htmlFor="internal-purchase" className="cursor-pointer">
                      Compra Interna
                    </Label>
                  </div> */}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          ${Number(item.price).toFixed(2)} x {item.quantity} = ${Number(item.subtotal).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.productId)}>
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${currentSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Descuento:</span>
                        <span className="text-red-600">-${currentDiscount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t pt-2">
                        <span>Total:</span>
                        <span>${currentTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <Label>Método de Pago</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={paymentMethod === "cash" ? "default" : "outline"}
                          onClick={() => setPaymentMethod("cash")}
                          size="sm"
                        >
                          Efectivo
                        </Button>
                        <Button
                          variant={paymentMethod === "transfer" ? "default" : "outline"}
                          onClick={() => setPaymentMethod("transfer")}
                          size="sm"
                        >
                          Transferencia
                        </Button>
                        <Button
                          variant={paymentMethod === "card" ? "default" : "outline"}
                          onClick={() => setPaymentMethod("card")}
                          size="sm"
                        >
                          Tarjeta
                        </Button>
                      </div>
                    </div>

                    <Button onClick={completeSale} disabled={cart.length === 0} className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Completar Venta
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "suppliers":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gestión de Proveedores</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Proveedor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Proveedor</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="supplier-empresa">Empresa</Label>
                          <Input
                            id="supplier-empresa"
                            value={newSupplier.empresa}
                            onChange={(e) => setNewSupplier({ ...newSupplier, empresa: e.target.value })}
                            placeholder="Nombre de la empresa"
                          />
                        </div>
                        <div>
                          <Label htmlFor="supplier-contacto">Contacto</Label>
                          <Input
                            id="supplier-contacto"
                            value={newSupplier.contacto}
                            onChange={(e) => setNewSupplier({ ...newSupplier, contacto: e.target.value })}
                            placeholder="Nombre del contacto"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="supplier-email">Email *</Label>
                            <Input
                              id="supplier-email"
                              type="email"
                              value={newSupplier.email}
                              onChange={(e) => {
                                setNewSupplier({ ...newSupplier, email: e.target.value });
                                // Limpiar error cuando el usuario empiece a escribir
                                if (errors.addSupplier) {
                                  setErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.addSupplier;
                                    return newErrors;
                                  });
                                }
                              }}
                              placeholder="nombre@empresa.com"
                              required
                              className={errors.addSupplier ? "border-red-500" : ""}
                            />
                            {errors.addSupplier && (
                              <p className="text-red-500 text-sm mt-1">{errors.addSupplier}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="supplier-telefono">Teléfono</Label>
                            <Input
                              id="supplier-telefono"
                              value={newSupplier.telefono}
                              onChange={(e) => setNewSupplier({ ...newSupplier, telefono: e.target.value })}
                              placeholder="555-0000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="supplier-telefono">Teléfono</Label>
                            <Input
                              id="supplier-telefono"
                              value={newSupplier.telefono}
                              onChange={(e) => setNewSupplier({ ...newSupplier, telefono: e.target.value })}
                              placeholder="555-0000"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="supplier-direccion">Dirección</Label>
                          <Input
                            id="supplier-direccion"
                            value={newSupplier.direccion}
                            onChange={(e) => setNewSupplier({ ...newSupplier, direccion: e.target.value })}
                            placeholder="Dirección completa"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="supplier-ciudad">Ciudad</Label>
                            <Input
                              id="supplier-ciudad"
                              value={newSupplier.ciudad || ""}
                              onChange={(e) => setNewSupplier({ ...newSupplier, ciudad: e.target.value })}
                              placeholder="Ciudad"
                            />
                          </div>
                          <div>
                            <Label htmlFor="supplier-rut">RUT</Label>
                            <Input
                              id="supplier-rut"
                              value={newSupplier.rut || ""}
                              onChange={(e) => setNewSupplier({ ...newSupplier, rut: e.target.value })}
                              placeholder="RUT"
                            />
                          </div>
                          <div>
                            <Label htmlFor="supplier-tiempo-entrega">Tiempo de Entrega</Label>
                            <Input
                              id="supplier-tiempo-entrega"
                              value={newSupplier.tiempo_entrega || ""}
                              onChange={(e) => setNewSupplier({ ...newSupplier, tiempo_entrega: e.target.value })}
                              placeholder="24-48 horas"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="supplier-condiciones-pago">Condiciones de Pago</Label>
                          <Select
                            value={newSupplier.condiciones_pago || ""}
                            onValueChange={(value) => setNewSupplier({ ...newSupplier, condiciones_pago: value })}
                          >
                            <SelectTrigger id="supplier-condiciones-pago">
                              <SelectValue placeholder="Seleccione condición de pago" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                              <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                              <SelectItem value="Transferencia">Transferencia</SelectItem>
                              <SelectItem value="Efectivo">Efectivo</SelectItem>
                              <SelectItem value="Cheque">Cheque</SelectItem>
                              <SelectItem value="Otro medio">Otro medio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="supplier-productos">Productos que Suministra</Label>
                          <Textarea
                            id="supplier-productos"
                            value={newSupplier.productos_que_surte}
                            onChange={(e) => setNewSupplier({ ...newSupplier, productos_que_surte: e.target.value })}
                            placeholder="Laptops, Monitores, Accesorios (separados por comas)"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancelar</Button>
                          </DialogTrigger>
                          <Button onClick={addSupplier}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Proveedor
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier, index) => {
                      // Verificar que el proveedor tenga ID válido
                      if (!supplier.id_proveedor || isNaN(supplier.id_proveedor)) {
                        console.warn('⚠️ Proveedor sin ID válido:', supplier);
                        return null;
                      }
                      
                      return (
                        <TableRow key={supplier.id_proveedor}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{supplier.empresa || 'Sin nombre'}</div>
                              <div className="text-sm text-muted-foreground">{supplier.direccion || 'Sin dirección'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{supplier.contacto || 'Sin contacto'}</div>
                              <div>{supplier.email || 'Sin email'}</div>
                              <div className="text-muted-foreground">{supplier.telefono || 'Sin teléfono'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {supplier.productos_que_surte ? 
                                supplier.productos_que_surte.split(',')
                                  .filter(product => product.trim() !== '')
                                  .map((product, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {product.trim()}
                                    </Badge>
                                  ))
                                : <span className="text-xs text-muted-foreground">Sin productos</span>
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog
                                open={isEditSupplierDialogOpen && editingSupplier?.id_proveedor === supplier.id_proveedor}
                                onOpenChange={(open) => {
                                  setIsEditSupplierDialogOpen(open)
                                  if (!open) setEditingSupplier(null)
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      console.log('📝 Editando proveedor:', supplier);
                                      setEditingSupplier(supplier)
                                      setIsEditSupplierDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Editar Proveedor</DialogTitle>
                                  </DialogHeader>
                                  {editingSupplier && (
                                    <EditSupplierForm
                                      supplier={editingSupplier}
                                      onSave={updateSupplier}
                                      onCancel={() => {
                                        setIsEditSupplierDialogOpen(false)
                                        setEditingSupplier(null)
                                      }}
                                      products={products}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => console.log('🗑️ Intentando eliminar:', supplier.id_proveedor)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Se eliminará permanentemente el proveedor "{supplier.empresa}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteSupplier(supplier.id_proveedor)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case "inventory":
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Movimientos de Inventario
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={exportInventoryToExcel} variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Limpiar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          ¿Quieres limpiar los Movimientos de Inventario?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará TODOS los movimientos de inventario registrados. Tendrás 10 segundos
                          para recuperar los datos si cambias de opinión.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={resetInventoryMovements} className="bg-red-600 hover:bg-red-700">
                          Sí, Limpiar Todo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {showRecoveryInventory && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <span className="text-sm font-medium text-yellow-800">
                          Movimientos eliminados. ¿Quieres recuperarlos?
                        </span>
                        <div className="text-sm text-yellow-700">
                          Tiempo restante: {timeRemainingInventory} segundos
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={recoverInventoryMovements}
                      variant="outline"
                      size="sm"
                      className="bg-green-50 hover:bg-green-100 border-green-200"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recuperar Movimientos
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {inventoryMovements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay movimientos registrados</p>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Stock Anterior</TableHead>
                        <TableHead>Stock Nuevo</TableHead>
                        {/* <TableHead>Costo Unit.</TableHead> */}
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Ganancia</TableHead>
                        {/* <TableHead>Motivo</TableHead> */}
                        <TableHead>Venta</TableHead>
                        {/* <TableHead>Proveedor</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="text-sm font-mono">{movement.id}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(movement.date).toLocaleDateString('es-MX')}
                          </TableCell>
                          <TableCell>{movement.productName}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                movement.type === "entrada" ? "default" :
                                movement.type === "salida" ? "destructive" :
                                movement.type === "ajuste" ? "secondary" : "outline"
                              }
                            >
                              {movement.type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{movement.quantity}</TableCell>
                          <TableCell>{movement.previousStock}</TableCell>
                          <TableCell>{movement.newStock}</TableCell>
                          {/* <TableCell>${movement.unitCost}</TableCell> */}
                          <TableCell>${movement.unitPrice}</TableCell>
                          <TableCell>${movement.totalValue.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className={`font-medium ${
                                movement.type === "salida" ? "text-green-600" : "text-gray-500"
                              }`}>
                                $
                                {movement.type === "salida"
                                  ? ((movement.unitPrice - movement.unitCost) * movement.quantity).toFixed(2)
                                  : "0.00"}
                              </div>
                            </div>
                          </TableCell>
                          {/* <TableCell className="text-sm max-w-xs truncate" title={movement.reason}>
                            {movement.reason}
                          </TableCell> */}
                          <TableCell className="text-sm">
                            {movement.venta_numero || "N/A"}
                          </TableCell>
                          {/* <TableCell className="text-sm">
                            {movement.proveedor_nombre || "N/A"}
                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "history":
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Historial de Ventas ({sales.length} ventas)</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={exportSalesToExcel} variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                      <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Limpiar Historial
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        ¿Limpiar todo el historial de ventas?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará TODAS las ventas registradas. Tendrás 10 segundos
                        para recuperar los datos si cambias de opinión. Después de 10 segundos
                        los datos se eliminarán permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={resetSalesHistory} className="bg-red-600 hover:bg-red-700">
                        Sí, Limpiar Todo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {showRecoverySales && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <span className="text-sm font-medium text-yellow-800">
                        Historial eliminado. ¿Quieres recuperarlo?
                      </span>
                      <div className="text-sm text-yellow-700">
                        Tiempo restante: {timeRemaining} segundos
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={recoverSalesHistory}
                    variant="outline"
                    size="sm"
                    className="bg-green-50 hover:bg-green-100 border-green-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recuperar Historial
                  </Button>
                </div>
              </div>
            )}
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay ventas registradas aún</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número de Venta</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Productos Vendidos</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => {
                      let fechaFormateada;
                      try {
                        const fechaDate = new Date(sale.date);
                        fechaFormateada = fechaDate.toLocaleDateString('es-ES', {
                          timeZone: 'UTC',
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric'
                        });
                      } catch (error) {
                        fechaFormateada = 'Fecha inválida';
                      }

                      // Calcular cantidad total de productos
                      const cantidadTotal = sale.items.reduce((total, item) => total + item.quantity, 0);

                      return (
                        <TableRow key={sale.id}>
                          <TableCell className="font-mono font-medium">{sale.saleNumber}</TableCell>
                          <TableCell>{fechaFormateada}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {sale.items.map((item, index) => (
                                <div key={`${item.productId}-${index}`} className="text-sm">
                                  <div className="font-medium">{item.productName}</div>
                                  <div className="text-muted-foreground text-xs">
                                    ${item.price} c/u
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center font-medium">
                              {cantidadTotal}
                              {sale.items.length > 1 && (
                                <div className="text-xs text-muted-foreground">
                                  {sale.items.length} productos
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">${sale.total.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );

      case "customers":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Gestión de Clientes
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={exportCustomersToExcel} variant="outline" size="sm">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Cliente
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="customer-name">Nombre Completo</Label>
                            <Input
                              id="customer-name"
                              value={newCustomer.name}
                              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                              placeholder="Nombre del cliente"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="customer-email">Email</Label>
                              <Input
                                id="customer-email"
                                type="email"
                                value={newCustomer.email}
                                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                placeholder="email@ejemplo.com"
                              />
                            </div>
                            <div>
                              <Label htmlFor="customer-phone">Teléfono</Label>
                              <Input
                                id="customer-phone"
                                value={newCustomer.phone}
                                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                placeholder="555-0000"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="customer-address">Dirección</Label>
                            <Input
                              id="customer-address"
                              value={newCustomer.address}
                              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                              placeholder="Dirección completa"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="customer-wholesale"
                              checked={newCustomer.isWholesale}
                              onCheckedChange={(checked) => setNewCustomer({ ...newCustomer, isWholesale: checked })}
                            />
                            <Label htmlFor="customer-wholesale" className="cursor-pointer">
                              Cliente Mayorista (precios especiales)
                            </Label>
                          </div>
                          <div>
                            <Label htmlFor="customer-notes">Notas</Label>
                            <Textarea
                              id="customer-notes"
                              value={newCustomer.notes}
                              onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                              placeholder="Información adicional del cliente"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <DialogTrigger asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogTrigger>
                            <Button onClick={addCustomer}>
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Cliente
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Estadísticas</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {customer.name}
                                {customer.isFrequent && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                              </div>
                              {customer.notes && <div className="text-xs text-blue-600">📝 {customer.notes}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{customer.email}</div>
                            <div className="text-muted-foreground">{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.isWholesale ? "default" : "secondary"}>
                            {customer.isWholesale ? "Mayorista" : "Minorista"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.isFrequent ? "default" : "secondary"}>
                            {customer.isFrequent ? "⭐ VIP" : "Regular"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{customer.totalPurchases} compras</div>
                            <div className="text-green-600 font-medium">${customer.totalSpent.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              Ticket: $
                              {customer.totalPurchases > 0
                                ? (customer.totalSpent / customer.totalPurchases).toFixed(2)
                                : "0.00"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el cliente "
                                  {customer.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCustomer(customer.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case "promotions":
        const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Gestión de Promociones
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={exportPromotionsToExcel} variant="outline" size="sm">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Promoción
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Crear Nueva Promoción</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="promo-name">Nombre de la Promoción</Label>
                            <Input
                              id="promo-name"
                              value={newPromotion.name}
                              onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                              placeholder="Ej: Descuento Navidad"
                            />
                          </div>
                          <div>
                            <Label htmlFor="promo-description">Descripción</Label>
                            <Textarea
                              id="promo-description"
                              value={newPromotion.description}
                              onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                              placeholder="Descripción de la promoción"
                            />
                          </div>
                          <div>
                            <Label htmlFor="promo-type">Tipo de Descuento</Label>
                            <Select
                              value={newPromotion.discountType}
                              onValueChange={(value: "percentage" | "fixed" | "bundle") =>
                                setNewPromotion({ ...newPromotion, discountType: value })
                              }
                            >
                              <SelectTrigger id="promo-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                                <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                                <SelectItem value="bundle">X por Y (Ej: 3x2)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {newPromotion.discountType === "bundle" ? (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="promo-bundle-buy">Compra (X)</Label>
                                <Input
                                  id="promo-bundle-buy"
                                  type="number"
                                  value={newPromotion.bundleBuy}
                                  onChange={(e) =>
                                    setNewPromotion({ ...newPromotion, bundleBuy: Number(e.target.value) })
                                  }
                                  placeholder="3"
                                  min="1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="promo-bundle-pay">Paga (Y)</Label>
                                <Input
                                  id="promo-bundle-pay"
                                  type="number"
                                  value={newPromotion.bundlePay}
                                  onChange={(e) =>
                                    setNewPromotion({ ...newPromotion, bundlePay: Number(e.target.value) })
                                  }
                                  placeholder="2"
                                  min="1"
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Label htmlFor="promo-value">Valor del Descuento</Label>
                              <Input
                                id="promo-value"
                                type="number"
                                value={newPromotion.discountValue}
                                onChange={(e) =>
                                  setNewPromotion({ ...newPromotion, discountValue: Number(e.target.value) })
                                }
                                placeholder={newPromotion.discountType === "percentage" ? "10" : "100"}
                              />
                            </div>
                          )}
                          <div>
                            <Label htmlFor="promo-applies">Aplicar a</Label>
                            <Select
                              value={newPromotion.appliesTo}
                              onValueChange={(value: "all" | "specific" | "category") =>
                                setNewPromotion({
                                  ...newPromotion,
                                  appliesTo: value,
                                  specificProducts: [],
                                  specificCategories: [],
                                })
                              }
                            >
                              <SelectTrigger id="promo-applies">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos los productos</SelectItem>
                                <SelectItem value="specific">Productos específicos</SelectItem>
                                <SelectItem value="category">Categorías específicas</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {newPromotion.appliesTo === "specific" && (
                            <div>
                              <Label>Seleccionar Productos</Label>
                              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                                {products.map((product) => (
                                  <div key={product.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`product-${product.id}`}
                                      checked={newPromotion.specificProducts.includes(product.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setNewPromotion({
                                            ...newPromotion,
                                            specificProducts: [...newPromotion.specificProducts, product.id],
                                          })
                                        } else {
                                          setNewPromotion({
                                            ...newPromotion,
                                            specificProducts: newPromotion.specificProducts.filter(
                                              (id) => id !== product.id,
                                            ),
                                          })
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`product-${product.id}`} className="cursor-pointer">
                                      {product.name} - ${product.price}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {newPromotion.appliesTo === "category" && (
                            <div>
                              <Label>Seleccionar Categorías</Label>
                              <div className="border rounded-lg p-4 space-y-2">
                                {uniqueCategories.map((category) => (
                                  <div key={category} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`category-${category}`}
                                      checked={newPromotion.specificCategories.includes(category)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setNewPromotion({
                                            ...newPromotion,
                                            specificCategories: [...newPromotion.specificCategories, category],
                                          })
                                        } else {
                                          setNewPromotion({
                                            ...newPromotion,
                                            specificCategories: newPromotion.specificCategories.filter(
                                              (c) => c !== category,
                                            ),
                                          })
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`category-${category}`} className="cursor-pointer">
                                      {category}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <Label htmlFor="promo-min">Compra Mínima</Label>
                            <Input
                              id="promo-min"
                              type="number"
                              value={newPromotion.minPurchase}
                              onChange={(e) =>
                                setNewPromotion({ ...newPromotion, minPurchase: Number(e.target.value) })
                              }
                              placeholder="0"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="promo-vip"
                              checked={newPromotion.forFrequentOnly}
                              onCheckedChange={(checked) =>
                                setNewPromotion({ ...newPromotion, forFrequentOnly: checked })
                              }
                            />
                            <Label htmlFor="promo-vip" className="cursor-pointer">
                              Solo para clientes VIP (5+ compras)
                            </Label>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="promo-start">Fecha de Inicio</Label>
                              <Input
                                id="promo-start"
                                type="date"
                                value={newPromotion.startDate}
                                onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="promo-end">Fecha de Fin</Label>
                              <Input
                                id="promo-end"
                                type="date"
                                value={newPromotion.endDate}
                                onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <DialogTrigger asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogTrigger>
                            <Button onClick={addPromotion}>
                              <Plus className="h-4 w-4 mr-2" />
                              Crear Promoción
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Promoción</TableHead>
                      <TableHead>Aplica a</TableHead>
                      <TableHead>Descuento</TableHead>
                      <TableHead>Requisitos</TableHead>
                      <TableHead>Vigencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.map((promo) => {
                      let appliesTo = ""
                      if (promo.appliesTo === "all") {
                        appliesTo = "Todos los productos"
                      } else if (promo.appliesTo === "specific") {
                        const productNames = promo.specificProducts
                          .map((id) => products.find((p) => p.id === id)?.name)
                          .filter(Boolean)
                        appliesTo = productNames.length > 0 ? productNames.join(", ") : "Sin productos"
                      } else if (promo.appliesTo === "category") {
                        appliesTo = promo.specificCategories.join(", ") || "Sin categorías"
                      }

                      let discountDescription = ""
                      if (promo.discountType === "percentage") {
                        discountDescription = `${promo.discountValue}%`
                      } else if (promo.discountType === "fixed") {
                        discountDescription = `$${promo.discountValue}`
                      } else if (promo.discountType === "bundle") {
                        discountDescription = `${promo.bundleBuy}x${promo.bundlePay}`
                      }

                      return (
                        <TableRow key={promo.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{promo.name}</div>
                              <div className="text-sm text-muted-foreground">{promo.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm max-w-xs truncate" title={appliesTo}>
                              {appliesTo}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{discountDescription}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              {promo.minPurchase > 0 && (
                                <div className="text-muted-foreground">Min: ${promo.minPurchase}</div>
                              )}
                              {promo.forFrequentOnly && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Solo VIP
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(promo.startDate).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">
                                {new Date(promo.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={promo.isActive}
                                onCheckedChange={() => togglePromotionStatus(promo.id)}
                              />
                              <Badge variant={promo.isActive ? "default" : "secondary"}>
                                {promo.isActive ? "Activa" : "Inactiva"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar promoción?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente la promoción "
                                    {promo.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deletePromotion(promo.id)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      
      case "supplying":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Gestión de Abastecimiento
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowPurchaseOrderForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Orden de Compra
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="orders">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="orders">Órdenes de Compra</TabsTrigger>
                    <TabsTrigger value="returns">Devoluciones</TabsTrigger>
                    <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
                  </TabsList>

                  <TabsContent value="orders" className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-blue-700">
                            {ordenesCompra.filter(o => o.estado === 'pendiente').length}
                          </div>
                          <div className="text-sm text-blue-600">Pendientes</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-yellow-700">
                            {ordenesCompra.filter(o => o.estado === 'parcial').length}
                          </div>
                          <div className="text-sm text-yellow-600">Parciales</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-green-700">
                            {ordenesCompra.filter(o => o.estado === 'completada').length}
                          </div>
                          <div className="text-sm text-green-600">Completadas</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-gray-700">
                            {ordenesCompra.length}
                          </div>
                          <div className="text-sm text-gray-600">Total</div>
                        </CardContent>
                      </Card>
                    </div>

                    {ordenesCompra.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No hay órdenes de compra</h3>
                        <p className="text-muted-foreground mb-4">
                          Crea tu primera orden de compra para abastecer tu inventario
                        </p>
                        <Button onClick={() => setShowPurchaseOrderForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Orden de Compra
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ordenesCompra.map(order => (
                          <Card key={order.id_orden_compra} className={
                            order.estado === 'pendiente' ? 'border-l-4 border-l-blue-500' :
                            order.estado === 'parcial' ? 'border-l-4 border-l-yellow-500' :
                            order.estado === 'completada' ? 'border-l-4 border-l-green-500' :
                            'border-l-4 border-l-red-500'
                          }>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{order.numero_orden}</h3>
                                    <Badge variant={
                                      order.estado === 'pendiente' ? 'secondary' :
                                      order.estado === 'parcial' ? 'outline' :
                                      order.estado === 'completada' ? 'default' : 'destructive'
                                    }>
                                      {order.estado.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Proveedor: {order.proveedor_nombre}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Fecha esperada: {new Date(order.fecha_esperada).toLocaleDateString()}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    {order.items.map(item => (
                                      <div key={item.id_detalle_orden} className="flex justify-between text-sm">
                                        <span>{item.producto_nombre}</span>
                                        <span>
                                          {item.cantidad_recibida}/{item.cantidad_solicitada} unidades
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  {order.notas && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      📝 {order.notas}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-lg">${order.total.toLocaleString()}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(order.fecha_creacion).toLocaleDateString()}
                                  </div>
                                  {order.estado !== 'completada' && order.estado !== 'cancelada' && (
                                    <Button
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => {
                                        setSelectedOrderForReceiving(order)
                                        setShowReceiveProductsForm(true)
                                      }}
                                    >
                                      Recibir
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="returns" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Devoluciones a Proveedores</h3>
                      <Button onClick={() => setShowCreateReturnForm(true)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Nueva Devolución
                      </Button>
                    </div>

                    {devolucionesProveedores.length === 0 ? (
                      <div className="text-center py-8">
                        <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No hay devoluciones</h3>
                        <p className="text-muted-foreground">
                          Las devoluciones aparecerán aquí cuando las crees
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Orden</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {devolucionesProveedores.map(devolucion => (
                            <TableRow key={devolucion.id_devolucion}>
                              <TableCell className="font-medium">{devolucion.numero_orden}</TableCell>
                              <TableCell>{devolucion.producto_nombre}</TableCell>
                              <TableCell>{devolucion.cantidad}</TableCell>
                              <TableCell className="max-w-xs truncate" title={devolucion.motivo}>
                                {devolucion.motivo}
                              </TableCell>
                              <TableCell>
                                {new Date(devolucion.fecha_devolucion).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  devolucion.estado === 'pendiente' ? 'secondary' :
                                  devolucion.estado === 'aprobada' ? 'default' :
                                  devolucion.estado === 'completada' ? 'outline' : 'destructive'
                                }>
                                  {devolucion.estado.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {devolucion.estado === 'pendiente' && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => processReturn(devolucion.id_devolucion, 'aprobada')}
                                    >
                                      Aprobar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => processReturn(devolucion.id_devolucion, 'rechazada')}
                                    >
                                      Rechazar
                                    </Button>
                                  </div>
                                )}
                                {devolucion.estado === 'aprobada' && (
                                  <Button
                                    size="sm"
                                    onClick={() => processReturn(devolucion.id_devolucion, 'completada')}
                                  >
                                    Completar
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  <TabsContent value="suppliers">
                    <div className="text-sm text-muted-foreground mb-4">
                      Gestiona los proveedores y los productos que suministran. 
                      Edita un proveedor para asignarle los productos específicos que suministra.
                    </div>
                    <Button 
                      onClick={() => setActiveTab("suppliers")}
                      variant="outline"
                    >
                      Ir a Gestión de Proveedores
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Diálogos Modales */}
            <Dialog open={showPurchaseOrderForm} onOpenChange={setShowPurchaseOrderForm}>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Crear Orden de Compra</DialogTitle>
                  <DialogDescription>
                    Selecciona un proveedor y los productos que deseas abastecer
                  </DialogDescription>
                </DialogHeader>
                <PurchaseOrderForm
                  suppliers={suppliers}
                  products={products}
                  onSave={createPurchaseOrder}
                  onCancel={() => setShowPurchaseOrderForm(false)}
                  setErrors={setErrors} // NUEVO PROP
                  setNotifications={setNotifications} // NUEVO PROP
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showReceiveProductsForm} onOpenChange={setShowReceiveProductsForm}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Recepcionar Productos</DialogTitle>
                  <DialogDescription>
                    Registra las cantidades recibidas para la orden de compra
                  </DialogDescription>
                </DialogHeader>
                {selectedOrderForReceiving && (
                  <ReceiveProductsForm
                    order={selectedOrderForReceiving}
                    onSave={receiveProducts}
                    onCancel={() => {
                      setShowReceiveProductsForm(false)
                      setSelectedOrderForReceiving(null)
                    }}
                    setErrors={setErrors} // NUEVO PROP
                    setNotifications={setNotifications} // NUEVO PROP
                  />
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateReturnForm} onOpenChange={setShowCreateReturnForm}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Devolución a Proveedor</DialogTitle>
                  <DialogDescription>
                    Selecciona una orden completada y el producto a devolver
                  </DialogDescription>
                </DialogHeader>
                <CreateReturnForm
                  orders={ordenesCompra}
                  onSave={createReturn}
                  onCancel={() => setShowCreateReturnForm(false)}
                  setErrors={setErrors} // NUEVO PROP
                  setNotifications={setNotifications} // NUEVO PROP
                />
              </DialogContent>
            </Dialog>
          </div>
        );

      case "reports":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Centro de Reportes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">Generales</TabsTrigger>
                    <TabsTrigger value="advanced">Avanzados</TabsTrigger>
                    <TabsTrigger value="payments">Pagos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={exportProductsToExcel}
                      >
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            Reporte de Productos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Inventario completo con precios, costos, stock y fechas de vencimiento
                          </p>
                          <Button className="w-full bg-transparent" variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Descargar Excel
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={exportSalesToExcel}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-green-600" />
                            Reporte de Ventas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Historial detallado de ventas con descuentos y métodos de pago
                          </p>
                          <Button className="w-full bg-transparent" variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Descargar Excel
                          </Button>
                        </CardContent>
                      </Card>

                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={exportCustomersToExcel}
                      >
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-purple-600" />
                            Reporte de Clientes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Base de clientes con estadísticas y compras históricas
                          </p>
                          <Button className="w-full bg-transparent" variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Descargar Excel
                          </Button>
                        </CardContent>
                      </Card>

                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={exportPromotionsToExcel}
                      >
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Tag className="h-5 w-5 text-orange-600" />
                            Reporte de Promociones
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Todas las promociones con usos y descuentos aplicados
                          </p>
                          <Button className="w-full bg-transparent" variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Descargar Excel
                          </Button>
                        </CardContent>
                      </Card>

                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={exportSuppliersToExcel}
                      >
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-cyan-600" />
                            Reporte de Proveedores
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Listado completo de proveedores con información de contacto
                          </p>
                          <Button className="w-full bg-transparent" variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Descargar Excel
                          </Button>
                        </CardContent>
                      </Card>

                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={exportInventoryToExcel}
                      >
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <History className="h-5 w-5 text-indigo-600" />
                            Reporte de Movimientos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Historial de movimientos de inventario con costos y ganancias
                          </p>
                          <Button className="w-full bg-transparent" variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Descargar Excel
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={exportCategoryReport}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            Stock por Categoría
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Análisis de inventario agrupado por categorías
                          </p>
                          <Button className="w-full bg-transparent" variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Descargar Excel
                          </Button>
                        </CardContent>
                      </Card>

                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={exportExpiringProducts}
                      >
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-red-600" />
                            Productos por Vencer
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Productos próximos a vencer o ya vencidos
                          </p>
                          <Button className="w-full bg-transparent" variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Descargar Excel
                          </Button>
                        </CardContent>
                      </Card>

                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={exportObsoleteProducts}
                      >
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            Productos Obsoletos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Productos sin ventas en los últimos 60 días
                          </p>
                          <Button className="w-full bg-transparent" variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Descargar Excel
                          </Button>
                        </CardContent>
                      </Card>

                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={exportProfitableProducts}
                      >
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Productos Rentables
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">Análisis de rentabilidad por producto</p>
                          <Button className="w-full bg-transparent" variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Descargar Excel
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="payments" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={exportPaymentMethodsReport}
                      >
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Ventas por Método de Pago
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Consolidado de ingresos por efectivo, transferencia y tarjeta
                          </p>
                          <Button className="w-full bg-transparent" variant="outline">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Descargar Excel
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Información de Reportes</h3>
                      <p className="text-sm text-blue-700">
                        Todos los reportes se descargan en formato Excel (.xlsx) y pueden ser abiertos en Microsoft
                        Excel, Google Sheets o cualquier programa de hojas de cálculo. Los archivos incluyen totales
                        calculados y están listos para análisis.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Sección no encontrada</div>;
    }
  };

  // ===========================================================================
  // SUBSECCIÓN 6.9: RENDER PRINCIPAL
  // ===========================================================================
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Inventario</h1>
            <p className="text-gray-600 mt-2">Panel de control y gestión</p>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}