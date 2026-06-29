from rest_framework import serializers
from .models import Producto, Categoria, PresentacionProducto, Merma, Venta, DetalleVenta, Proveedor, MovimientoInventario, OrdenCompra, DetalleOrdenCompra, DevolucionProveedor

#================================================================================ CLASE CATEGORIA ================================================================================
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

#================================================================================ CLASE PRODUCTO ================================================================================
class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='id_categoria.nombre', read_only=True)
    class Meta:
        model = Producto
        fields = [
            'id_producto',
            'nombre',
            'descripcion',
            'sku',
            'barcode',
            'stock',
            'precio',
            'precio_mayorista',
            'costo',
            'min_stock',
            'id_categoria',
            'categoria_nombre',
            'fecha_vencimiento'
        ]

#================================================================================ CLASE DE PRESENTACIÓN DE PRODUCTO ================================================================================
class PresentacionProductoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='id_producto.nombre', read_only=True)
    class Meta:
        model = PresentacionProducto
        fields = [
            'id_presentacion', 
            'id_producto', 
            'producto_nombre', 
            'descripcion', 
            'factor', 
            'precio'
            ]

#================================================================================ CLASE DE MERMA ================================================================================
class MermaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='id_producto.nombre', read_only=True)
    class Meta:
        model = Merma
        fields = [
            'id_merma', 
            'id_producto', 
            'producto_nombre', 
            'cantidad', 
            'fecha', 
            'motivo'
            ]

#================================================================================ CLASE DE VENTAS ================================================================================
class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = [
            'id_venta', 
            'numero_venta', 
            'fecha', 
            'total'
        ]

#================================================================================ CLASE DE DETALLE DE VENTAS ================================================================================
class DetalleVentaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='id_presentacion.id_producto.nombre', read_only=True)
    presentacion_desc = serializers.CharField(source='id_presentacion.descripcion', read_only=True)
    class Meta:
        model = DetalleVenta
        fields = [
            'id_detalle', 
            'id_venta', 
            'id_presentacion', 
            'producto_nombre', 
            'presentacion_desc', 
            'cantidad', 
            'precio_unitario', 
            'subtotal',
            'nombre_producto'
            ]

#================================================================================ CLASE DE PROVEEDORES ================================================================================
class ProveedorSerializer(serializers.ModelSerializer):
    estado_display = serializers.SerializerMethodField()
    # Campo para que el frontend envíe la lista de IDs de productos
    productos_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
        write_only=True  # Solo para escritura, no se incluye en las respuestas GET
    )

    class Meta:
        model = Proveedor
        fields = [
            'id_proveedor',
            'empresa',
            'contacto',
            'email',
            'telefono',
            'telefono_secundario',
            'direccion',
            'ciudad',
            'rut',
            'productos_que_surte',
            'condiciones_pago',
            'tiempo_entrega',
            'activo',
            'estado_display',
            'fecha_registro',
            'notas',
            'productos_ids'
        ]
        read_only_fields = ['fecha_registro', 'id_proveedor', 'estado_display']
        
    def get_estado_display(self, obj):
        return "Activo" if obj.activo else "Inactivo"

    def get_productos_ids(self, obj):
        """Para lectura (GET) - convierte productos_que_surte a lista de IDs"""
        if not obj.productos_que_surte:
            return []
        
        try:
            # Obtener nombres de productos de la cadena
            nombres_productos = [nombre.strip() for nombre in obj.productos_que_surte.split(',') if nombre.strip()]
            
            if not nombres_productos:
                return []
                
            # Buscar los IDs de los productos que coinciden con esos nombres
            from .models import Producto  # Import aquí para evitar circular imports
            productos = Producto.objects.filter(nombre__in=nombres_productos)
            ids = productos.values_list('id_producto', flat=True)
            
            return list(ids)
        except Exception as e:
            print(f"Error convirtiendo productos_que_surte a IDs: {e}")
            return []

    def create(self, validated_data):
        """Maneja la CREACIÓN de nuevos proveedores"""
        # Extraer productos_ids antes de crear el objeto
        productos_ids = validated_data.pop('productos_ids', [])
        
        print(f"📝 Creando proveedor con productos_ids: {productos_ids}")
        
        # Crear el proveedor con los datos validados
        proveedor = Proveedor.objects.create(**validated_data)
        
        # Procesar los productos_ids si existen
        if productos_ids:
            try:
                from .models import Producto
                productos = Producto.objects.filter(id_producto__in=productos_ids)
                nombres = productos.values_list('nombre', flat=True)
                proveedor.productos_que_surte = ', '.join(nombres)
                proveedor.save(update_fields=['productos_que_surte'])
                print(f"✅ Productos asignados: {proveedor.productos_que_surte}")
            except Exception as e:
                print(f"❌ Error asignando productos: {e}")
                # Continuar sin los productos, no fallar la creación
            
        return proveedor

    def update(self, instance, validated_data):
        """Maneja la ACTUALIZACIÓN de proveedores existentes"""
        # Extraer productos_ids
        productos_ids = validated_data.pop('productos_ids', None)
        
        print(f"📝 Actualizando proveedor {instance.id_proveedor} con productos_ids: {productos_ids}")
        
        # Actualizar campos normales
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Procesar productos_ids si se proporcionaron
        if productos_ids is not None:
            try:
                from .models import Producto
                if productos_ids:  # Lista no vacía
                    productos = Producto.objects.filter(id_producto__in=productos_ids)
                    nombres = productos.values_list('nombre', flat=True)
                    instance.productos_que_surte = ', '.join(nombres)
                else:  # Lista vacía = limpiar productos
                    instance.productos_que_surte = ''
                    
                instance.save(update_fields=['productos_que_surte'])
                print(f"✅ Productos actualizados: {instance.productos_que_surte}")
            except Exception as e:
                print(f"❌ Error actualizando productos: {e}")
                # No fallar la actualización por error en productos
            
        return instance

#================================================================================ CLASE DE LISTA DE PROVEEDORES ================================================================================
class ProveedorListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = [
            'id_proveedor',
            'empresa', 
            'contacto',
            'email',
            'telefono',
            'ciudad',
            'rut',
            'productos_que_surte',
            'activo'
        ]

#================================================================================ CLASE DE MOVIMIENTOS DEL INVENTARIO ================================================================================
class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='id_producto.nombre', read_only=True)
    venta_numero = serializers.CharField(source='id_venta.numero_venta', read_only=True, allow_null=True)
    proveedor_nombre = serializers.CharField(source='id_proveedor.empresa', read_only=True, allow_null=True)

    class Meta:
        model = MovimientoInventario
        fields = [
            'id_movimiento',
            'id_producto',
            'producto_nombre',
            'tipo',
            'cantidad',
            'stock_anterior', 
            'stock_nuevo',
            'costo_unitario',
            'precio_unitario',
            'valor_total',
            'motivo',
            'fecha_movimiento',
            'id_venta',
            'venta_numero',
            'id_proveedor',
            'proveedor_nombre',
            'usuario'
        ]

#================================================================================ ORDENES DE COMPRA ================================================================================
class DetalleOrdenCompraSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='id_producto.nombre', read_only=True)
    sku = serializers.CharField(source='id_producto.sku', read_only=True)

    class Meta:
        model = DetalleOrdenCompra
        fields = '__all__'

class OrdenCompraSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.CharField(source='id_proveedor.empresa', read_only=True)
    items = DetalleOrdenCompraSerializer(many=True, read_only=True, source='detalleordencompra_set')

    class Meta:
        model = OrdenCompra
        fields = '__all__'

class DevolucionProveedorSerializer(serializers.ModelSerializer):
    numero_orden = serializers.CharField(source='id_orden_compra.numero_orden', read_only=True)
    producto_nombre = serializers.CharField(source='id_producto.nombre', read_only=True)

    class Meta:
        model = DevolucionProveedor
        fields = '__all__'

