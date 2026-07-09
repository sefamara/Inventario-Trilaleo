from rest_framework.decorators import api_view
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.core.paginator import Paginator
from django.db import transaction, IntegrityError
from django.db.models import Q
from .models import Categoria, Producto, PresentacionProducto, Merma, Venta, DetalleVenta, Proveedor, MovimientoInventario, OrdenCompra, DetalleOrdenCompra, DevolucionProveedor
from .serializers import *

#================================================================================ LISTA DE CATEGORÍAS ================================================================================
@api_view(['GET', 'POST'])
def lista_categorias(request):
    if request.method == 'GET':
        categorias = Categoria.objects.all()
        serializer = CategoriaSerializer(categorias, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CategoriaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#================================================================================ DETALLE DE CATEGORÍA ================================================================================
@api_view(['GET', 'PUT', 'DELETE'])
def detalle_categoria(request, pk):
    try:
        categoria = Categoria.objects.get(pk=pk)
    except Categoria.DoesNotExist:
        return Response({'error': 'Categoría no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = CategoriaSerializer(categoria)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = CategoriaSerializer(categoria, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Verificar si hay productos asociados
        productos_count = Producto.objects.filter(id_categoria=categoria).count()
        if productos_count > 0:
            return Response(
                {'error': f'No se puede eliminar la categoría porque tiene {productos_count} producto(s) asociado(s). Reasigna los productos primero.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        categoria.delete()
        return Response({'success': True, 'message': 'Categoría eliminada correctamente'}, status=status.HTTP_200_OK)

#================================================================================ LISTA DE PRODUCTOS ================================================================================
@api_view(['GET', 'POST'])
def lista_productos(request):
    if request.method == 'GET':
        productos = Producto.objects.select_related('id_categoria').all()

        search = request.GET.get('search', '').strip()
        if search:
            productos = productos.filter(
                Q(nombre__icontains=search) |
                Q(sku__icontains=search) |
                Q(barcode__icontains=search)
            )

        categoria_id = request.GET.get('categoria')
        if categoria_id:
            productos = productos.filter(id_categoria=categoria_id)

        # Paginación: solo se activa si el cliente envía "page".
        # Sin ese parámetro se mantiene el comportamiento anterior (lista completa)
        # para no romper al dashboard, POS y exportación a Excel, que necesitan el set completo.
        page_param = request.GET.get('page')
        if page_param:
            page_size = int(request.GET.get('page_size', 50))
            paginator = Paginator(productos.order_by('nombre'), page_size)
            page_obj = paginator.get_page(page_param)
            serializer = ProductoSerializer(page_obj.object_list, many=True)
            return Response({
                'count': paginator.count,
                'num_pages': paginator.num_pages,
                'page': page_obj.number,
                'page_size': page_size,
                'results': serializer.data,
            })

        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        # El SKU siempre lo genera el servidor (nunca el valor que mande el cliente):
        # se bloquea la fila de la categoría (select_for_update) y se incrementa su
        # contador de forma atómica, así dos altas simultáneas en la misma categoría
        # nunca pueden generar el mismo SKU, sin importar cuántos computadores/usuarios
        # los estén creando al mismo tiempo.
        data = request.data.copy()
        categoria_id = data.get('id_categoria')

        if not categoria_id:
            return Response({'error': 'id_categoria es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                categoria = Categoria.objects.select_for_update().get(pk=categoria_id)
                categoria.ultimo_sku_numero += 1
                categoria.save(update_fields=['ultimo_sku_numero'])
                data['sku'] = f"{categoria.sku_prefix}-{categoria.ultimo_sku_numero:04d}"

                serializer = ProductoSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Categoria.DoesNotExist:
            return Response({'error': 'Categoría no encontrada'}, status=status.HTTP_400_BAD_REQUEST)

#================================================================================ DETALLE DE PRODUCTO ================================================================================
@api_view(['GET', 'PUT', 'DELETE'])
def detalle_producto(request, pk):
    try:
        producto = Producto.objects.select_related('id_categoria').get(pk=pk)
    except Producto.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ProductoSerializer(producto)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ProductoSerializer(producto, data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
            except IntegrityError:
                return Response(
                    {'error': 'Ya existe otro producto con ese SKU. Elige uno distinto.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        producto.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

#================================================================================ LISTA DE PRESENTACIONES ================================================================================
@api_view(['GET'])
def lista_presentaciones(request):
    if request.method == 'GET':
        presentaciones = PresentacionProducto.objects.all()
        serializer = PresentacionProductoSerializer(presentaciones, many=True)
        return Response(serializer.data)

#================================================================================ LISTA MERMAS ================================================================================
@api_view(['GET', 'POST'])
def lista_mermas(request):
    if request.method == 'GET':
        mermas = Merma.objects.all()
        serializer = MermaSerializer(mermas, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = MermaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#================================================================================ LISTA DE VENTAS ================================================================================
@api_view(['GET', 'POST'])
def lista_ventas(request):
    if request.method == 'GET':
        ventas = Venta.objects.all()
        serializer = VentaSerializer(ventas, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = VentaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#================================================================================ LISTA DETALLE DE VENTAS ================================================================================
@api_view(['GET', 'POST'])  # ← AGREGAR 'GET' aquí
def lista_detalle_ventas(request):
    if request.method == 'GET':
        print("📋 SOLICITUD GET para detalles de venta")
        
        # Filtrar por venta específica si se proporciona
        id_venta = request.GET.get('venta_id', None)
        if id_venta:
            print(f"🔍 Filtrando por venta_id: {id_venta}")
            detalles = DetalleVenta.objects.filter(id_venta=id_venta)
        else:
            print("🔍 Obteniendo TODOS los detalles de venta")
            detalles = DetalleVenta.objects.all()
        
        print(f"📊 Detalles encontrados: {detalles.count()}")
        
        # Debug: mostrar algunos detalles
        for detalle in detalles[:3]:
            print(f"   - ID: {detalle.id_detalle}, Venta: {detalle.id_venta_id}, Producto: '{detalle.nombre_producto}'")
        
        serializer = DetalleVentaSerializer(detalles, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        print("📦 CREANDO DETALLE VENTA - Datos recibidos:", request.data)
        
        # Asegurar que nombre_producto se guarde EXPLÍCITAMENTE
        data = request.data.copy()
        
        # DEBUG: Verificar qué datos vienen del frontend
        print(f"🔍 DEBUG Frontend - nombre_producto recibido: '{data.get('nombre_producto', 'NO_ENVIADO')}'")
        print(f"🔍 DEBUG Frontend - id_presentacion: {data.get('id_presentacion')}")
        print(f"🔍 DEBUG Frontend - cantidad: {data.get('cantidad')}")
        
        # ESTRATEGIA DE RESPALDO: Si no viene nombre_producto, obtenerlo de alguna forma
        if 'nombre_producto' not in data or not data['nombre_producto'] or data['nombre_producto'] == 'NO_ENVIADO':
            print("⚠️  nombre_producto NO VIENE DEL FRONTEND - Buscando alternativas...")
            
            # Intentar obtener el nombre del producto basado en id_presentacion
            try:
                from .models import PresentacionProducto, Producto
                presentacion_id = data.get('id_presentacion')
                if presentacion_id:
                    presentacion = PresentacionProducto.objects.get(id_presentacion=presentacion_id)
                    nombre_del_producto = presentacion.id_producto.nombre
                    data['nombre_producto'] = nombre_del_producto
                    print(f"✅ Nombre obtenido automáticamente: '{nombre_del_producto}'")
                else:
                    data['nombre_producto'] = 'PRODUCTO_DESCONOCIDO'
                    print("❌ No se pudo obtener nombre - id_presentacion no proporcionado")
            except Exception as e:
                print(f"❌ Error obteniendo nombre automáticamente: {e}")
                data['nombre_producto'] = 'ERROR_OBTENIENDO_NOMBRE'
        
        # FORZAR el guardado del nombre_producto
        print(f"🎯 NOMBRE A GUARDAR: '{data['nombre_producto']}'")
        
        serializer = DetalleVentaSerializer(data=data)
        if serializer.is_valid():
            detalle_venta = serializer.save()
            print(f"✅ DETALLE CREADO - ID: {detalle_venta.id_detalle}, Nombre: '{detalle_venta.nombre_producto}'")
            
            # VERIFICACIÓN EXTRA: Consultar directamente desde la base de datos
            try:
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute(
                        "SELECT nombre_producto FROM detalle_venta WHERE id_detalle = %s", 
                        [detalle_venta.id_detalle]
                    )
                    nombre_guardado = cursor.fetchone()[0]
                    print(f"🔍 VERIFICACIÓN BD - Nombre en base de datos: '{nombre_guardado}'")
                    
                    if nombre_guardado and nombre_guardado != 'NO_ENVIADO':
                        print("🎉 ¡NOMBRE GUARDADO CORRECTAMENTE EN LA BD!")
                    else:
                        print("❌ PROBLEMA: Nombre NO se guardó correctamente")
                        
            except Exception as e:
                print(f"⚠️  Error en verificación BD: {e}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("❌ ERRORES en el serializer:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#================================================================================ DETALLE DE VENTA ================================================================================
@api_view(['GET', 'PUT', 'DELETE'])
def detalle_venta(request, pk):
    try:
        detalle = DetalleVenta.objects.get(pk=pk)
    except DetalleVenta.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = DetalleVentaSerializer(detalle)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = DetalleVentaSerializer(detalle, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        detalle.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    elif request.method == 'POST':
        print("Datos recibidos para detalle venta:", request.data)  # ← AGREGAR ESTO
        serializer = DetalleVentaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            print("Detalle de venta creado exitosamente")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Errores en el serializer:", serializer.errors)  # ← AGREGAR ESTO
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#================================================================================ LISTA PROVEEDORES ================================================================================
@api_view(['GET', 'POST'])
def lista_proveedores(request):
    if request.method == 'GET':
        # ✅ POR DEFECTO SOLO MOSTRAR PROVEEDORES ACTIVOS
        activo = request.GET.get('activo', 'true')  # Por defecto true
        
        if activo.lower() == 'true':
            proveedores = Proveedor.objects.filter(activo=True)
        elif activo.lower() == 'false':
            proveedores = Proveedor.objects.filter(activo=False)
        else:
            proveedores = Proveedor.objects.all()
        
        serializer = ProveedorListSerializer(proveedores, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ProveedorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#================================================================================ DETALLE PROVEEDORES ================================================================================
@api_view(['GET', 'PUT', 'DELETE'])
def detalle_proveedor(request, pk):
    try:
        proveedor = Proveedor.objects.get(pk=pk)
    except Proveedor.DoesNotExist:
        return Response(
            {'error': 'Proveedor no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = ProveedorSerializer(proveedor)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ProveedorSerializer(proveedor, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # ✅ ELIMINACIÓN PERMANENTE (en lugar de marcar como inactivo)
        proveedor.delete()
        
        return Response(
            {'success': True, 'message': 'Proveedor eliminado permanentemente'},
            status=status.HTTP_200_OK
        )

#================================================================================ BUSQUEDA DE PROVEEDORES ================================================================================
@api_view(['GET'])
def buscar_proveedores(request):
    query = request.GET.get('q', '')
    if query:
        proveedores = Proveedor.objects.filter(
            Q(empresa__icontains=query) |  # Doble underscore __
            Q(contacto__icontains=query) |
            Q(productos_que_surte__icontains=query) |  # productos_que_surte
            Q(ciudad__icontains=query)
        )
        serializer = ProveedorListSerializer(proveedores, many=True)
        return Response(serializer.data)
    return Response([])

#================================================================================ MOVIMIENTOS DEL INVENTARIO ================================================================================
class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.all().order_by('-fecha_movimiento')
    serializer_class = MovimientoInventarioSerializer
    pagination_class = None

    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        """
        Elimina TODOS los movimientos de inventario
        """
        try:
            print("🗑️ [VIEWSET] Eliminando todos los movimientos...")
            
            count = MovimientoInventario.objects.all().count()
            deleted_count = MovimientoInventario.objects.all().delete()
            
            print(f"🗑️ [VIEWSET] Movimientos eliminados: {deleted_count}")
            
            return Response({
                "message": f"Todos los movimientos de inventario han sido eliminados",
                "total_eliminados": deleted_count[0],
                "movimientos_eliminados": count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"❌ [VIEWSET] Error eliminando movimientos: {str(e)}")
            return Response(
                {"error": "Error eliminando movimientos"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        try:
            print("🔄 [DEBUG] Creando movimiento de inventario...")
            print(f"📦 Datos recibidos: {request.data}")
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            movimiento = serializer.save()
            
            print(f"✅ Movimiento creado - ID: {movimiento.id_movimiento}, Producto: {movimiento.id_producto.nombre}")
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print(f"❌ Error creando movimiento: {str(e)}")
            return Response(
                {"error": "Error al procesar movimiento"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def list(self, request, *args, **kwargs):
        try:
            print("🔄 [DEBUG] MovimientoInventarioViewSet.list() ejecutándose")
            print(f"🔍 Query params: {request.query_params}")
            
            # Filtrar por producto si se proporciona
            producto_id = request.query_params.get('producto_id')
            if producto_id:
                queryset = self.queryset.filter(id_producto=producto_id)
                print(f"🔍 Filtrado por producto_id: {producto_id}")
            else:
                queryset = self.queryset
                print("🔍 Obteniendo TODOS los movimientos")
            
            movimientos_count = queryset.count()
            print(f"📊 [DEBUG] Movimientos en queryset: {movimientos_count}")
            
            # Debug: mostrar los primeros 5 movimientos
            movimientos_list = list(queryset[:5])
            print(f"🔍 Primeros 5 movimientos:")
            for mov in movimientos_list:
                print(f"   - ID: {mov.id_movimiento}, Producto: {mov.id_producto.nombre}, Tipo: {mov.tipo}")
            
            # Serializar
            serializer = self.get_serializer(queryset, many=True)
            print(f"📦 [DEBUG] Datos serializados: {len(serializer.data)} elementos")
            
            # Debug: mostrar primeros elementos serializados
            if serializer.data:
                print(f"🔍 Primer elemento serializado: {serializer.data[0]}")
            
            return Response(serializer.data)
            
        except Exception as e:
            print(f"❌ [DEBUG] Error en list: {str(e)}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "Error obteniendo movimientos"},
                status=status.HTTP_400_BAD_REQUEST
            )

#================================================================================ ORDENES DE COMPRA ================================================================================
class OrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = OrdenCompra.objects.all().order_by('-fecha_creacion')
    serializer_class = OrdenCompraSerializer

    def create(self, request, *args, **kwargs):
        # Generar número de orden automático
        from django.db import transaction
        from datetime import datetime
        
        with transaction.atomic():
            # Generar número de orden
            today = datetime.now().strftime('%Y%m%d')
            last_order = OrdenCompra.objects.filter(numero_orden__startswith=f'OC-{today}').last()
            if last_order:
                last_num = int(last_order.numero_orden.split('-')[-1])
                new_num = f'OC-{today}-{last_num + 1:03d}'
            else:
                new_num = f'OC-{today}-001'
            
            request.data['numero_orden'] = new_num
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            orden_compra = serializer.save()
            
            # Crear detalles de la orden
            items_data = request.data.get('items', [])
            for item_data in items_data:
                DetalleOrdenCompra.objects.create(
                    id_orden_compra=orden_compra,
                    id_producto_id=item_data['id_producto'],
                    cantidad_solicitada=item_data['cantidad_solicitada'],
                    costo_unitario=item_data['costo_unitario'],
                    subtotal=item_data['subtotal']
                )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def recibir_productos(self, request, pk=None):
        orden = self.get_object()
        items_data = request.data.get('items', [])
        
        with transaction.atomic():
            for item_data in items_data:
                detalle = DetalleOrdenCompra.objects.get(
                    id_detalle_orden=item_data['id_detalle_orden'],
                    id_orden_compra=orden
                )
                cantidad_recibida = item_data['cantidad_recibida']
                
                # Actualizar cantidad recibida
                detalle.cantidad_recibida = cantidad_recibida
                detalle.save()
                
                # Actualizar stock del producto
                producto = detalle.id_producto
                producto.stock += cantidad_recibida
                producto.save()
            
            # Verificar si la orden está completa
            total_solicitado = sum(detalle.cantidad_solicitada for detalle in orden.detalleordencompra_set.all())
            total_recibido = sum(detalle.cantidad_recibida for detalle in orden.detalleordencompra_set.all())
            
            if total_recibido >= total_solicitado:
                orden.estado = 'completada'
            elif total_recibido > 0:
                orden.estado = 'parcial'
            else:
                orden.estado = 'pendiente'
            
            orden.save()
            
            return Response({'message': 'Productos recibidos correctamente'})

class DevolucionProveedorViewSet(viewsets.ModelViewSet):
    queryset = DevolucionProveedor.objects.all().order_by('-fecha_devolucion')
    serializer_class = DevolucionProveedorSerializer

    @action(detail=True, methods=['post'])
    def procesar_devolucion(self, request, pk=None):
        devolucion = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        if nuevo_estado in ['aprobada', 'rechazada', 'completada']:
            devolucion.estado = nuevo_estado
            devolucion.save()
            
            # Si se aprueba la devolución, ajustar stock
            if nuevo_estado == 'aprobada':
                producto = devolucion.id_producto
                producto.stock -= devolucion.cantidad
                producto.save()
            
            return Response({'message': f'Devolución {nuevo_estado} correctamente'})
        
        return Response({'error': 'Estado inválido'}, status=status.HTTP_400_BAD_REQUEST)
    
#================================================================================ ELIMINACIÓN MASIVA ================================================================================

@api_view(['DELETE'])
def delete_all_sales(request):
    """
    Elimina TODAS las ventas y sus detalles de la base de datos
    """
    try:
        print("🗑️ Eliminando TODAS las ventas y detalles...")
        
        # Eliminar detalles de venta primero (por las foreign keys)
        detalles_count = DetalleVenta.objects.all().delete()
        print(f"🗑️ Detalles de venta eliminados: {detalles_count}")
        
        # Luego eliminar las ventas
        ventas_count = Venta.objects.all().delete()
        print(f"🗑️ Ventas eliminadas: {ventas_count}")
        
        return Response({
            "message": "Todas las ventas y detalles han sido eliminados permanentemente",
            "detalles_eliminados": detalles_count[0],
            "ventas_eliminadas": ventas_count[0]
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"❌ Error eliminando ventas: {str(e)}")
        return Response({"error": "Error eliminando ventas"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @api_view(['GET'])
# def lista_movimientos_inventario(request):
#     """Lista todos los movimientos de inventario"""
#     movimientos = MovimientoInventario.objects.all().order_by('-fecha_movimiento')
#     serializer = MovimientoInventarioSerializer(movimientos, many=True)
#     return Response(serializer.data)

@api_view(['DELETE', 'GET'])
def delete_all_inventory_movements(request):
    """
    Elimina TODOS los movimientos de inventario de la base de datos
    """
    try:
        print("🗑️ [DEBUG] delete_all_inventory_movements - VISTA EJECUTÁNDOSE")
        print(f"🔍 [DEBUG] Método: {request.method}")
        
        if request.method == 'GET':
            # Solo para pruebas/debug
            count = MovimientoInventario.objects.all().count()
            return Response({
                "status": "info",
                "message": "Endpoint funcionando. Usa DELETE para eliminar todos los movimientos.",
                "total_movimientos_actuales": count
            })
        
        elif request.method == 'DELETE':
            print("🗑️ Eliminando TODOS los movimientos de inventario...")
            
            # Eliminar todos los movimientos
            movimientos_count = MovimientoInventario.objects.all().delete()
            print(f"🗑️ Movimientos eliminados: {movimientos_count}")
            
            response_data = {
                "message": "Todos los movimientos de inventario han sido eliminados permanentemente",
                "movimientos_eliminados": movimientos_count[0]
            }
            
            print(f"✅ [DEBUG] Respuesta: {response_data}")
            return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"❌ [DEBUG] Error eliminando movimientos: {str(e)}")
        import traceback
        print(f"📋 [DEBUG] Traceback: {traceback.format_exc()}")
        return Response({"error": "Error eliminando movimientos"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ACTUALIZAR Y EDICION DE PRODUCTOS
# @api_view(['PUT'])
# def actualizar_producto(request, pk):
#     try:
#         producto = Producto.objects.get(pk=pk)
#     except Producto.DoesNotExist:
#         return Response(status=status.HTTP_404_NOT_FOUND)
    
#     serializer = ProductoSerializer(producto, data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)