// Resolver la URL de la API dinámicamente para soportar acceso desde red LAN
const getApiBase = (): string => {
  // Si hay variable de entorno explícita, usarla
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // En el navegador: detectar protocolo para evitar mixed content
  if (typeof window !== 'undefined') {
    // Si estamos en HTTPS (servidor con proxy en puerto 3443),
    // usar el mismo origen para que el proxy reenvíe a Django
    if (window.location.protocol === 'https:') {
      return `${window.location.protocol}//${window.location.host}/api`;
    }
    // En HTTP (dev server), conectar directo al backend Django
    return `http://${window.location.hostname}:8000/api`;
  }
  // Fallback para SSR
  return 'http://localhost:8000/api';
};

const API_BASE = getApiBase();

const nativeFetch = fetch;

function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = process.env.NEXT_PUBLIC_LAN_TOKEN;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  return nativeFetch(url, {
    ...options,
    headers: {
      ...authHeader,
      ...(options.headers as Record<string, string> || {}),
    },
  });
}

interface Supplier {
  id_proveedor: number;
  empresa: string;
  contacto: string;
  email: string;
  telefono: string | null;
  telefono_secundario?: string | null;
  direccion: string | null;
  ciudad: string | null;
  rut: string | null;
  productos_que_surte: string | null;
  productos_ids?: number[];
  condiciones_pago: string | null;
  tiempo_entrega: string | null;
  activo: boolean;
  fecha_registro?: string;
  notas?: string | null;
}

export const api = {
  // GET - usar español para coincidir con Django
  
  getCategories: () => apiFetch(`${API_BASE}/categorias/`).then(res => res.json()),
  
  createCategory: async (data: { nombre: string }): Promise<any> => {
    const response = await apiFetch(`${API_BASE}/categorias/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    return response.json();
  },

  updateCategory: async (id: number, data: { nombre: string }): Promise<any> => {
    const response = await apiFetch(`${API_BASE}/categorias/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    return response.json();
  },

  deleteCategory: async (id: number): Promise<any> => {
    const response = await apiFetch(`${API_BASE}/categorias/${id}/`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error eliminando categoría');
    }
    if (response.status === 200) {
      return response.json();
    }
    return { success: true };
  },

  getPresentaciones: () => apiFetch(`${API_BASE}/presentaciones_producto/`).then(res => res.json()),

//================================================================================ MODULO PRODUCTOS ================================================================================

  // GET
  getProducts: () => apiFetch(`${API_BASE}/productos/`).then(res => res.json()),

  // POST
  createProducto: (data: any) => apiFetch(`${API_BASE}/productos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(async (res) => {
    if (!res.ok) {
      const errorData = await res.json();
      console.error('❌ Error del backend:', errorData);
      throw new Error(`Error ${res.status}: ${JSON.stringify(errorData)}`);
    }
    return res.json();
  }),
  
  // PUT
  updateProduct: (id: number, data: any) => {
    const url = `${API_BASE}/productos/${id}/`;
    // console.log('🎯 URL completa:', url);
    // console.log('📝 Datos enviados:', JSON.stringify(data, null, 2));
    // console.log('🔧 Método: PUT');
    
    return apiFetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(async (res) => {
      // console.log('📡 Response status:', res.status);
      // console.log('📡 Response URL:', res.url);
      
      if (!res.ok) {
        const errorText = await res.text();
        // console.error('❌ Error response:', errorText);
        // console.error('❌ Status:', res.status);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      return res.json();
    })
    .then(data => {
      // console.log('✅ Success response:', data);
      return data;
    })
    .catch(error => {
      // console.error('💥 Fetch error:', error);
      throw error;
    });
  },
  
  // DELETE
  deleteProducto: (id: number) => {
    // VERIFICAR ID ANTES DE HACER LA PETICIÓN
    if (!id || isNaN(id)) {
      // console.error('❌ ID inválido para DELETE:', id);
      return Promise.reject(new Error('ID de producto inválido'));
    }

    const url = `${API_BASE}/productos/${id}/`;
    // console.log('🗑️ DELETE URL:', url);
    
    return apiFetch(url, {
      method: 'DELETE'
    }).then(async (res) => {
      // console.log('🗑️ DELETE Response status:', res.status);
      
      if (!res.ok) {
        // Para errores 404, no intentar parsear JSON
        if (res.status === 404) {
          throw new Error('Producto no encontrado en la base de datos');
        }
        
        // Para otros errores, intentar obtener mensaje
        try {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        } catch {
          throw new Error(`HTTP ${res.status}`);
        }
      }
      
      // DELETE exitoso
      return { success: true, message: 'Producto eliminado correctamente' };
    });
  },

//================================================================================ MODULO PROVEEDORES ================================================================================

  // GET PROVEEDORES - Mejorado
  getProveedores: async (): Promise<any[]> => {
    try {
      console.log('🔍 Obteniendo proveedores...');
      const response = await apiFetch(`${API_BASE}/proveedores/`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error obteniendo proveedores:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Proveedores obtenidos:', data.length);
      
      return data;
    } catch (error) {
      console.error('❌ Error en getProveedores:', error);
      throw error;
    }
  },

  getProveedor: (id: number) => apiFetch(`${API_BASE}/proveedores/${id}/`).then(res => res.json()),

  // CREATE PROVEEDOR - Completamente corregido
  createProveedor: async (data: any): Promise<any> => {
    try {
      console.log('📤 Creando proveedor:', data);
      
      // Validar campos requeridos ANTES de enviar
      if (!data.empresa?.trim()) {
        throw new Error('El campo Empresa es requerido');
      }
      if (!data.contacto?.trim()) {
        throw new Error('El campo Contacto es requerido');
      }
      if (!data.email?.trim()) {
        throw new Error('El campo Email es requerido');
      }

      // Estructura EXACTA que espera Django
      const supplierData = {
        empresa: data.empresa.trim(),
        contacto: data.contacto.trim(),
        email: data.email.trim(),
        telefono: data.telefono?.trim() || null,
        direccion: data.direccion?.trim() || null,
        ciudad: data.ciudad?.trim() || null,
        rut: data.rut?.trim() || null,
        productos_que_surte: data.productos_que_surte?.trim() || null,
        condiciones_pago: data.condiciones_pago || null,
        tiempo_entrega: data.tiempo_entrega?.trim() || null,
        activo: data.activo !== false,
        productos_ids: data.productos_ids || []
      };

      console.log('📤 Datos enviados a API:', supplierData);

      const response = await apiFetch(`${API_BASE}/proveedores/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierData)
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        
        // Intentar parsear errores de Django
        try {
          const errorJson = JSON.parse(errorText);
          const errorMessages = Object.values(errorJson).flat().join(', ');
          throw new Error(errorMessages);
        } catch {
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('✅ Proveedor creado exitosamente:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error en createProveedor:', error);
      throw error;
    }
  },

  // UPDATE PROVEEDOR - Completamente corregido
  updateProveedor: async (id: number, data: any): Promise<any> => {
    try {
      console.log('📝 Actualizando proveedor ID:', id, 'Data:', data);
      
      if (!id || isNaN(id)) {
        throw new Error(`ID de proveedor inválido: ${id}`);
      }

      // Validar campos requeridos
      if (!data.empresa?.trim()) {
        throw new Error('El campo Empresa es requerido');
      }
      if (!data.contacto?.trim()) {
        throw new Error('El campo Contacto es requerido');
      }
      if (!data.email?.trim()) {
        throw new Error('El campo Email es requerido');
      }

      const supplierData = {
        empresa: data.empresa.trim(),
        contacto: data.contacto.trim(),
        email: data.email.trim(),
        telefono: data.telefono?.trim() || null,
        direccion: data.direccion?.trim() || null,
        ciudad: data.ciudad?.trim() || null,
        rut: data.rut?.trim() || null,
        productos_que_surte: data.productos_que_surte?.trim() || null,
        condiciones_pago: data.condiciones_pago || null,
        tiempo_entrega: data.tiempo_entrega?.trim() || null,
        activo: data.activo !== false,
        productos_ids: data.productos_ids || []
      };

      const response = await apiFetch(`${API_BASE}/proveedores/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierData)
      });

      console.log('📥 Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Proveedor actualizado:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error en updateProveedor:', error);
      throw error;
    }
  },

  // DELETE PROVEEDOR - Ya está bien
  deleteProveedor: async (id: number): Promise<{success: boolean, message: string}> => {
    console.log('🗑️ Eliminando proveedor ID:', id);
    
    if (!id || isNaN(id)) {
      console.error('❌ ID inválido para eliminar:', id);
      throw new Error(`ID de proveedor inválido: ${id}`);
    }

    const response = await apiFetch(`${API_BASE}/proveedores/${id}/`, {
      method: 'DELETE'
    });
    
    console.log('🗑️ DELETE Proveedor - Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error eliminando proveedor:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    if (response.status === 204) {
      console.log('✅ Proveedor eliminado (204 No Content)');
      return { 
        success: true, 
        message: 'Proveedor eliminado correctamente' 
      };
    }
    
    try {
      const result = await response.json();
      console.log('✅ Proveedor eliminado:', result);
      return result;
    } catch {
      console.log('✅ Proveedor eliminado (respuesta no JSON)');
      return { 
        success: true, 
        message: 'Proveedor eliminado correctamente' 
      };
    }
  },

  searchProveedores: (query: string) => apiFetch(`${API_BASE}/proveedores/buscar/?q=${query}`).then(res => res.json()),

//================================================================================ MODULO VENTAS ================================================================================

  getVentas: () => apiFetch(`${API_BASE}/ventas/`).then(res => res.json()),
  getVenta: (id: number) => apiFetch(`${API_BASE}/ventas/${id}/`).then(res => res.json()),

  createVenta: (data: any) => {
    console.log('📤 Creando venta en BD:', data);
    return apiFetch(`${API_BASE}/ventas/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(async (res) => {
      console.log('📥 Respuesta de crear venta - Status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error creando venta:', errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('✅ Venta creada exitosamente:', data);
      return data;
    })
  },

  // DETALLE VENTA
  createDetalleVenta: (data: any) => apiFetch(`${API_BASE}/detalle-venta/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  updateVenta: (id: number, data: any) => apiFetch(`${API_BASE}/ventas/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  deleteVenta: (id: number) => apiFetch(`${API_BASE}/ventas/${id}/`, {
    method: 'DELETE'
  }).then(res => res.json()),

  // DETALLE VENTA
  getDetalleVenta: (ventaId: number) => {
    // console.log('🔍 Obteniendo detalles para venta:', ventaId);
    return apiFetch(`${API_BASE}/detalle-venta/?venta_id=${ventaId}`)
      .then(async (res) => {
        // console.log('📥 Respuesta detalles venta - Status:', res.status);
        const data = await res.json();
        // console.log('📦 Detalles obtenidos para venta', ventaId, ':', data);
        return data;
      })
      .catch(error => {
        console.error('❌ Error obteniendo detalles:', error);
        throw error;
      });
  },

//================================================================================ CLIENTES ================================================================================

  getClientes: () => apiFetch(`${API_BASE}/clientes/`).then(res => res.json()),
  getCliente: (id: number) => apiFetch(`${API_BASE}/clientes/${id}/`).then(res => res.json()),
  createCliente: (data: any) => apiFetch(`${API_BASE}/clientes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

//================================================================================ PROMOCIONES ================================================================================

  getPromociones: () => apiFetch(`${API_BASE}/promociones/`).then(res => res.json()),
  getPromocion: (id: number) => apiFetch(`${API_BASE}/promociones/${id}/`).then(res => res.json()),

//================================================================================ MOVIMIENTOS DE INVENTARIO ================================================================================

  getMovimientosInventario: async (): Promise<any[]> => {
    try {
      console.log('🌐 [DEBUG] Llamando a API: movimientos-inventario/');
      const url = `${API_BASE}/movimientos-inventario/`;
      console.log('🌐 [DEBUG] URL completa:', url);
      
      const response = await apiFetch(url);
      console.log('📡 [DEBUG] Response status:', response.status);
      console.log('📡 [DEBUG] Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DEBUG] Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ [DEBUG] Movimientos obtenidos de API:', data);
      console.log('📊 [DEBUG] Cantidad de movimientos en response:', data.length);
      return data;
    } catch (error) {
      console.error('❌ [DEBUG] Error fetching movimientos inventario:', error);
      throw error;
    }
  },

  getMovimientosByProducto: async (productoId: number): Promise<any[]> => {
    const response = await apiFetch(`${API_BASE}/movimientos-inventario/?producto_id=${productoId}`);
    if (!response.ok) throw new Error('Error fetching movimientos por producto');
    return response.json();
  },

  // CORREGIDO: Quitar "export const"
  createMovimientoInventario: async (movimientoData: any): Promise<any> => {
    try {
      const response = await apiFetch(`${API_BASE}/movimientos-inventario/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movimientoData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error creating movimiento inventario: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating movimiento inventario:', error);
      throw error;
    }
  },

  deleteMovimientoInventario: async (id: number): Promise<void> => {
    const response = await apiFetch(`${API_BASE}/movimientos-inventario/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting movimiento inventario');
  },

//================================================================================ Ordenes de compra ================================================================================
  // Órdenes de Compra
  getOrdenesCompra: async (): Promise<any[]> => {
    const response = await apiFetch(`${API_BASE}/ordenes-compra/`); // ✅ CORRECTO
    return response.json();
  },

  createOrdenCompra: async (ordenData: any): Promise<any> => {
    const response = await apiFetch(`${API_BASE}/ordenes-compra/`, { // ✅ CORRECTO
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ordenData)
    });
    return response.json();
  },

  recibirProductosOrden: async (ordenId: number, itemsData: any[]): Promise<any> => {
    const response = await apiFetch(`${API_BASE}/ordenes-compra/${ordenId}/recibir_productos/`, { // ✅ CORRECTO
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsData })
    });
    return response.json();
  },

  // Devoluciones
  getDevolucionesProveedores: async (): Promise<any[]> => {
    const response = await apiFetch(`${API_BASE}/devoluciones-proveedores/`); // ✅ CORRECTO
    return response.json();
  },

  createDevolucionProveedor: async (devolucionData: any): Promise<any> => {
    const response = await apiFetch(`${API_BASE}/devoluciones-proveedores/`, { // ✅ CORRECTO
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(devolucionData)
    });
    return response.json();
  },

  procesarDevolucion: async (devolucionId: number, estado: string): Promise<any> => {
    const response = await apiFetch(`${API_BASE}/devoluciones-proveedores/${devolucionId}/procesar_devolucion/`, { // ✅ CORRECTO
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    return response.json();
  },

//================================================================================ ELIMINACIÓN MASIVA ================================================================================

  // Eliminar TODAS las ventas y sus detalles
  deleteAllSales: async (): Promise<{message: string}> => {
    console.log('🗑️ Eliminando TODAS las ventas de la BD');
    const response = await apiFetch(`${API_BASE}/ventas/delete_all/`, {  // ← URL CORREGIDA
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error eliminando ventas:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Ventas eliminadas:', result);
    return result;
  },

  // Eliminar TODOS los movimientos de inventario
  deleteAllInventoryMovements: async (): Promise<{message: string}> => {
    const url = `${API_BASE}/movimientos-inventario/delete_all/`;
    console.log('🔍 URL que se está llamando:', url);
    
    const response = await apiFetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error eliminando movimientos:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Movimientos eliminados:', result);
    return result;
  },
};