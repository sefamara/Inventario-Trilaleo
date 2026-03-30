from django.db import models

#================================================================================ MODEL CATEGORIA ================================================================================
class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'categorias'
    
    def __str__(self):
        return self.nombre

#================================================================================ MODEL PRODUCTO ================================================================================
class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    sku = models.CharField(max_length=50, blank=True, null=True)
    barcode = models.CharField(max_length=100, blank=True, null=True)
    stock = models.IntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    precio_mayorista = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    costo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    min_stock = models.IntegerField(default=5)
    id_categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, db_column='id_categoria')
    fecha_vencimiento = models.DateField(null=True, blank=True, verbose_name="Fecha de vencimiento")
    
    class Meta:
        db_table = 'productos'
    
    def __str__(self):
        return self.nombre

#================================================================================ MODEL PRESENTACION PRODUCTO ================================================================================
class PresentacionProducto(models.Model):
    id_presentacion = models.AutoField(primary_key=True)
    id_producto = models.ForeignKey(Producto, on_delete=models.CASCADE, db_column='id_producto')
    descripcion = models.CharField(max_length=100)
    factor = models.IntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'presentaciones_producto'
    
    def __str__(self):
        return f"{self.id_producto.nombre} - {self.descripcion}"

#================================================================================ MODEL MERMA ================================================================================
class Merma(models.Model):
    id_merma = models.AutoField(primary_key=True)
    id_producto = models.ForeignKey(Producto, on_delete=models.CASCADE, db_column='id_producto')
    cantidad = models.IntegerField()
    fecha = models.DateField()
    motivo = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'merma'
    
    def __str__(self):
        return f"Merma {self.id_producto.nombre} - {self.fecha}"

#================================================================================ MODEL VENTA ================================================================================
class Venta(models.Model):
    
    id_venta = models.AutoField(primary_key=True)
    numero_venta = models.CharField(max_length=20, unique=True, blank=True, null=True)
    fecha = models.DateTimeField()
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'ventas'
    
    def save(self, *args, **kwargs):
        if not self.numero_venta:
            # Generar número de venta automáticamente
            self.numero_venta = f"V-{self.id_venta:06d}" if self.id_venta else "V-TEMP"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Venta {self.numero_venta} - {self.fecha}"

#================================================================================ MODEL DETALLE DE VENTA ================================================================================
class DetalleVenta(models.Model):
    id_detalle = models.AutoField(primary_key=True)
    id_venta = models.ForeignKey(Venta, on_delete=models.CASCADE, db_column='id_venta')
    id_presentacion = models.ForeignKey(PresentacionProducto, on_delete=models.CASCADE, db_column='id_presentacion')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    nombre_producto = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        db_table = 'detalle_venta'
    
    def __str__(self):
        return f"Detalle {self.id_venta.id_venta}"

#================================================================================ MODEL PROVEEDOR ================================================================================
class Proveedor(models.Model):
    id_proveedor = models.AutoField(primary_key=True)
    empresa = models.CharField(max_length=100)
    contacto = models.CharField(max_length=100)
    email = models.EmailField()
    telefono = models.CharField(max_length=20, blank=True, null=True)
    telefono_secundario = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    ciudad = models.CharField(max_length=50, blank=True, null=True)
    rut = models.CharField(max_length=20, blank=True, null=True)
    productos_que_surte = models.TextField(blank=True, null=True)
    condiciones_pago = models.CharField(max_length=100, blank=True, null=True)
    tiempo_entrega = models.CharField(max_length=50, blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    notas = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'proveedores'
    
    def __str__(self):
        return self.empresa
    
#================================================================================ MOVIMIENTOS DE INVENTARIO ================================================================================

class MovimientoInventario(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'), 
        ('ajuste', 'Ajuste'),
        ('devolucion', 'Devolución'),
    ]
    
    id_movimiento = models.AutoField(primary_key=True)
    id_producto = models.ForeignKey('Producto', on_delete=models.CASCADE, db_column='id_producto')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    cantidad = models.IntegerField()
    stock_anterior = models.IntegerField()
    stock_nuevo = models.IntegerField()
    costo_unitario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    motivo = models.CharField(max_length=255)
    fecha_movimiento = models.DateTimeField(auto_now_add=True)
    id_venta = models.ForeignKey('Venta', on_delete=models.CASCADE, null=True, blank=True, db_column='id_venta')
    id_proveedor = models.ForeignKey('Proveedor', on_delete=models.CASCADE, null=True, blank=True, db_column='id_proveedor')
    usuario = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'movimientos_inventario'
        verbose_name = 'Movimiento de Inventario'
        verbose_name_plural = 'Movimientos de Inventario'

    def __str__(self):
        return f"Movimiento {self.id_movimiento} - {self.tipo} - {self.id_producto.nombre}"

#================================================================================ ORDENES DE COMPRA ================================================================================
class OrdenCompra(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('parcial', 'Parcialmente Recibida'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    ]
    
    id_orden_compra = models.AutoField(primary_key=True)
    numero_orden = models.CharField(max_length=50, unique=True)
    id_proveedor = models.ForeignKey('Proveedor', on_delete=models.CASCADE, db_column='id_proveedor')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_esperada = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    notas = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'ordenes_compra'

class DetalleOrdenCompra(models.Model):
    id_detalle_orden = models.AutoField(primary_key=True)
    id_orden_compra = models.ForeignKey('OrdenCompra', on_delete=models.CASCADE, db_column='id_orden_compra')
    id_producto = models.ForeignKey('Producto', on_delete=models.CASCADE, db_column='id_producto')
    cantidad_solicitada = models.IntegerField()
    cantidad_recibida = models.IntegerField(default=0)
    costo_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'detalle_orden_compra'

class DevolucionProveedor(models.Model):
    ESTADO_DEVOLUCION = [
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
        ('completada', 'Completada'),
    ]
    
    id_devolucion = models.AutoField(primary_key=True)
    id_orden_compra = models.ForeignKey('OrdenCompra', on_delete=models.CASCADE, db_column='id_orden_compra')
    id_producto = models.ForeignKey('Producto', on_delete=models.CASCADE, db_column='id_producto')
    cantidad = models.IntegerField()
    motivo = models.TextField()
    fecha_devolucion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_DEVOLUCION, default='pendiente')

    class Meta:
        db_table = 'devoluciones_proveedores'