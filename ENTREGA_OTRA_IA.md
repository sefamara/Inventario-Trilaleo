# Traspaso del Proyecto Sistema de Inventario Trilaleo

## Contexto general

Repositorio revisado en:

```text
D:\Sistema_Inventario_Trilaleo
```

Estado de git al momento de la revision:

```text
main...origin/main
```

No habia cambios locales pendientes. En esta revision no se modifico codigo fuente funcional; este documento resume el funcionamiento del proyecto, el estado actual, los cambios existentes en git y las advertencias importantes para entregar el proyecto a otra IA o desarrollador.

Los ultimos commits visibles en el historial incluyen:

- `Cambios extras en README`
- `Cambios en README`
- `Fix: Escaner de codigos ingresaba primer digito en campos de texto`
- `Automatiza actualizaciones y mantiene acceso movil por IP`
- `Automatiza la instalacion completa en Windows`
- `Automatiza la instalacion inicial del sistema`
- `Fix: Escaner de codigos y acceso movil HTTPS`
- `Refactor: Limpieza de codigo basura`
- `Fix(API): Escaneo movil de codigo de barras, Escaneo al editar un producto, Redimension de impresion de ticket`

## Resumen del sistema

El proyecto es un sistema web de inventario para Trilaleo. Esta pensado para ejecutarse en un PC con Windows y permitir acceso desde otros computadores o celulares conectados a la misma red local.

El sistema permite:

- Administrar productos.
- Administrar categorias.
- Administrar proveedores.
- Registrar ventas.
- Usar un punto de venta minorista y mayorista.
- Controlar stock y stock minimo.
- Registrar movimientos de inventario.
- Registrar mermas.
- Usar lector de codigos de barras USB.
- Escanear codigos con camara de celular.
- Imprimir ticket termico de venta.
- Exportar reportes en Excel.
- Acceder desde celulares por HTTPS local.

## Stack tecnologico

### Backend

- Django `5.2.6`
- Django REST Framework `3.16.1`
- MySQL
- `django-cors-headers`
- `django-environ`
- `mysqlclient`
- `whitenoise`

Archivo de dependencias:

```text
Backend\requirements.txt
```

### Frontend

- Next.js `15.2.4`
- React `19`
- TypeScript
- Tailwind CSS
- Radix UI
- Lucide React
- `html5-qrcode`
- `xlsx`
- Recharts

Archivo de dependencias:

```text
Frontend\package.json
```

### Entorno esperado

El proyecto esta preparado principalmente para:

- Windows 10 / Windows 11
- Node.js 18 o superior
- Python 3.10 o superior
- MySQL Server
- Git
- `winget`

## Estructura principal del proyecto

```text
D:\Sistema_Inventario_Trilaleo
├── Backend
│   ├── requirements.txt
│   └── inventario
│       ├── manage.py
│       ├── inventario_backend
│       │   ├── settings.py
│       │   ├── urls.py
│       │   ├── asgi.py
│       │   └── wsgi.py
│       └── gestion
│           ├── models.py
│           ├── serializers.py
│           ├── views.py
│           ├── urls.py
│           ├── admin.py
│           └── migrations
│               └── 0001_initial.py
├── Frontend
│   ├── app
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components
│   ├── hooks
│   ├── lib
│   │   └── api.ts
│   ├── utils
│   ├── package.json
│   ├── next.config.mjs
│   ├── generar-cert.js
│   └── serve-https.js
├── DB_Trilaleo
├── django_entorno
├── iniciar_sistema.bat
├── detener_sistema.bat
├── instalar_requisitos.bat
├── instalar_requisitos.ps1
├── configurar_sistema.bat
├── configurar_sistema.ps1
├── actualizar_sistema.bat
├── actualizar_sistema.ps1
├── importar_db.bat
└── README.md
```

## Archivos clave

### Documentacion

```text
README.md
```

Contiene instrucciones para instalar, iniciar, detener, actualizar y trasladar datos.

### Backend

```text
Backend\inventario\manage.py
Backend\inventario\inventario_backend\settings.py
Backend\inventario\inventario_backend\urls.py
Backend\inventario\gestion\models.py
Backend\inventario\gestion\serializers.py
Backend\inventario\gestion\views.py
Backend\inventario\gestion\urls.py
Backend\inventario\gestion\migrations\0001_initial.py
```

### Frontend

```text
Frontend\app\page.tsx
Frontend\lib\api.ts
Frontend\components\sidebar-nav.tsx
Frontend\components\barcode-scanner.tsx
Frontend\hooks\use-keyboard-barcode-scanner.ts
Frontend\utils\excel-export.tsx
Frontend\utils\print-receipt.ts
Frontend\serve-https.js
Frontend\generar-cert.js
Frontend\next.config.mjs
```

### Scripts Windows

```text
iniciar_sistema.bat
detener_sistema.bat
instalar_requisitos.bat
instalar_requisitos.ps1
configurar_sistema.bat
configurar_sistema.ps1
actualizar_sistema.bat
actualizar_sistema.ps1
importar_db.bat
```

## Funcionamiento general del backend

El backend es un proyecto Django llamado `inventario_backend` con una aplicacion llamada `gestion`.

La URL principal del backend incluye las rutas de `gestion` bajo `/api/`.

Archivo:

```text
Backend\inventario\inventario_backend\urls.py
```

Contenido conceptual:

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('gestion.urls')),
]
```

## Configuracion Django

Archivo:

```text
Backend\inventario\inventario_backend\settings.py
```

Puntos importantes:

- Usa `django-environ`.
- Lee variables desde `Backend\.env`.
- Permite `ALLOWED_HOSTS=*` por defecto.
- Usa MySQL.
- Tiene CORS habilitado.
- Usa Django REST Framework solo con renderer JSON.
- Tiene `CORS_ALLOW_ALL_ORIGINS = True`.

El archivo `Backend\.env` no debe subirse a Git. Lo crean los scripts de instalacion/configuracion.

Formato esperado:

```env
DB_NAME=inventario_trilaleo
DB_USER=trilaleo_app
DB_PASSWORD=...
DB_HOST=127.0.0.1
DB_PORT=3306
DEBUG=True
ALLOWED_HOSTS=*
SECRET_KEY=...
```

## Modelos principales del backend

Archivo:

```text
Backend\inventario\gestion\models.py
```

### Categoria

Tabla:

```text
categorias
```

Campos:

- `id_categoria`
- `nombre`

### Producto

Tabla:

```text
productos
```

Campos:

- `id_producto`
- `nombre`
- `descripcion`
- `sku`
- `barcode`
- `stock`
- `precio`
- `precio_mayorista`
- `costo`
- `min_stock`
- `id_categoria`
- `fecha_vencimiento`

### PresentacionProducto

Tabla:

```text
presentaciones_producto
```

Campos:

- `id_presentacion`
- `id_producto`
- `descripcion`
- `factor`
- `precio`

Este modelo se usa para enlazar detalles de venta con productos.

### Merma

Tabla:

```text
merma
```

Campos:

- `id_merma`
- `id_producto`
- `cantidad`
- `fecha`
- `motivo`

### Venta

Tabla:

```text
ventas
```

Campos reales actuales:

- `id_venta`
- `numero_venta`
- `fecha`
- `total`

Advertencia importante: el frontend envia mas campos de los que este modelo soporta, como `subtotal`, `descuento`, `metodo_pago`, `es_mayorista`, `estado`, `id_cliente`, etc.

### DetalleVenta

Tabla:

```text
detalle_venta
```

Campos:

- `id_detalle`
- `id_venta`
- `id_presentacion`
- `cantidad`
- `precio_unitario`
- `subtotal`
- `nombre_producto`

Advertencia: el frontend envia un campo `descuento`, pero el modelo no lo tiene.

### Proveedor

Tabla:

```text
proveedores
```

Campos:

- `id_proveedor`
- `empresa`
- `contacto`
- `email`
- `telefono`
- `telefono_secundario`
- `direccion`
- `ciudad`
- `rut`
- `productos_que_surte`
- `condiciones_pago`
- `tiempo_entrega`
- `activo`
- `fecha_registro`
- `notas`

### MovimientoInventario

Tabla:

```text
movimientos_inventario
```

Tipos:

- `entrada`
- `salida`
- `ajuste`
- `devolucion`

Campos:

- `id_movimiento`
- `id_producto`
- `tipo`
- `cantidad`
- `stock_anterior`
- `stock_nuevo`
- `costo_unitario`
- `precio_unitario`
- `valor_total`
- `motivo`
- `fecha_movimiento`
- `id_venta`
- `id_proveedor`
- `usuario`

### OrdenCompra

Tabla:

```text
ordenes_compra
```

Estados:

- `pendiente`
- `parcial`
- `completada`
- `cancelada`

### DetalleOrdenCompra

Tabla:

```text
detalle_orden_compra
```

### DevolucionProveedor

Tabla:

```text
devoluciones_proveedores
```

Estados:

- `pendiente`
- `aprobada`
- `rechazada`
- `completada`

## Serializers

Archivo:

```text
Backend\inventario\gestion\serializers.py
```

Advertencia critica:

Hay serializers duplicados:

```text
ProductoSerializer
ProveedorSerializer
```

Ubicaciones detectadas:

```text
11: class ProductoSerializer(serializers.ModelSerializer)
88: class ProveedorSerializer(serializers.ModelSerializer)
271: class ProveedorSerializer(serializers.ModelSerializer)
276: class ProductoSerializer(serializers.ModelSerializer)
```

En Python, si una clase se define dos veces con el mismo nombre, la ultima definicion sobrescribe la anterior.

Consecuencia:

- La logica avanzada del primer `ProveedorSerializer`, que manejaba `productos_ids`, queda sobrescrita por el serializer final basico.
- El primer `ProductoSerializer`, que incluia `fecha_vencimiento`, tambien queda sobrescrito por el serializer final.
- Actualmente el serializer efectivo de `Producto` no incluye `fecha_vencimiento`.
- Actualmente el serializer efectivo de `Proveedor` es practicamente `fields = '__all__'`.

Esto es importante antes de modificar proveedores o productos.

## Endpoints del backend

Archivo:

```text
Backend\inventario\gestion\urls.py
```

### Categorias

```http
GET    /api/categorias/
POST   /api/categorias/
GET    /api/categorias/<id>/
PUT    /api/categorias/<id>/
DELETE /api/categorias/<id>/
```

La eliminacion valida si existen productos asociados. Si hay productos, no permite borrar la categoria.

### Productos

```http
GET    /api/productos/
POST   /api/productos/
GET    /api/productos/<id>/
PUT    /api/productos/<id>/
DELETE /api/productos/<id>/
```

### Presentaciones

```http
GET /api/presentaciones_producto/
```

### Mermas

```http
GET  /api/mermas/
POST /api/mermas/
```

### Ventas

```http
GET  /api/ventas/
POST /api/ventas/
```

Eliminacion masiva:

```http
DELETE /api/ventas/delete_all/
```

Advertencia:

No existe actualmente:

```http
/api/ventas/<id>/
```

Aunque el frontend tiene funciones `getVenta`, `updateVenta` y `deleteVenta` apuntando a esa ruta.

### Detalle de venta

```http
GET    /api/detalle-venta/
POST   /api/detalle-venta/
GET    /api/detalle-venta/?venta_id=<id>
GET    /api/detalle-venta/<id>/
PUT    /api/detalle-venta/<id>/
DELETE /api/detalle-venta/<id>/
```

El POST tiene logica de respaldo:

- Si viene `nombre_producto`, lo guarda.
- Si no viene, intenta obtenerlo desde `id_presentacion`.
- Si falla, guarda texto de respaldo como `PRODUCTO_DESCONOCIDO` o `ERROR_OBTENIENDO_NOMBRE`.

### Proveedores

```http
GET    /api/proveedores/
POST   /api/proveedores/
GET    /api/proveedores/<id>/
PUT    /api/proveedores/<id>/
DELETE /api/proveedores/<id>/
GET    /api/proveedores/buscar/?q=texto
```

El listado por defecto filtra proveedores activos:

```http
/api/proveedores/?activo=true
```

Tambien acepta:

```http
/api/proveedores/?activo=false
/api/proveedores/?activo=all
```

### Movimientos de inventario

ViewSet:

```http
GET    /api/movimientos-inventario/
POST   /api/movimientos-inventario/
GET    /api/movimientos-inventario/<id>/
PUT    /api/movimientos-inventario/<id>/
DELETE /api/movimientos-inventario/<id>/
```

Filtro por producto:

```http
GET /api/movimientos-inventario/?producto_id=<id>
```

Eliminacion masiva:

```http
DELETE /api/movimientos-inventario/delete_all/
```

### Ordenes de compra

ViewSet:

```http
GET    /api/ordenes-compra/
POST   /api/ordenes-compra/
GET    /api/ordenes-compra/<id>/
PUT    /api/ordenes-compra/<id>/
DELETE /api/ordenes-compra/<id>/
```

Accion para recepcionar productos:

```http
POST /api/ordenes-compra/<id>/recibir_productos/
```

Advertencia:

En `recibir_productos` se usa:

```python
with transaction.atomic():
```

Pero `transaction` no esta importado a nivel modulo. Se importa dentro de otro metodo (`create`). Esto probablemente puede causar un `NameError` al ejecutar esta accion.

### Devoluciones a proveedores

ViewSet:

```http
GET    /api/devoluciones-proveedores/
POST   /api/devoluciones-proveedores/
GET    /api/devoluciones-proveedores/<id>/
PUT    /api/devoluciones-proveedores/<id>/
DELETE /api/devoluciones-proveedores/<id>/
```

Accion para procesar devolucion:

```http
POST /api/devoluciones-proveedores/<id>/procesar_devolucion/
```

Si el estado nuevo es `aprobada`, descuenta stock del producto.

## Funcionamiento general del frontend

Archivo principal:

```text
Frontend\app\page.tsx
```

Este archivo contiene casi todo:

- Interfaces TypeScript.
- Formularios.
- Hooks internos.
- Logica de negocio.
- Logica de carrito.
- Logica de ventas.
- Logica de productos.
- Logica de proveedores.
- Logica de inventario.
- Logica de ordenes de compra.
- Logica de reportes.
- Renderizado de todas las secciones.

Es un archivo de mas de 7.000 lineas. Es un riesgo tecnico importante.

Antes de modificarlo, conviene buscar con precision por secciones, nombres de funciones o tabs.

## Navegacion del frontend

Archivo:

```text
Frontend\components\sidebar-nav.tsx
```

Tabs visibles:

- Dashboard
- Productos
- Categorias
- Punto de Venta
- Abastecimiento
- Proveedores
- Inventario
- Historial
- Reportes

En `page.tsx` tambien existen renders internos para:

- `customers`
- `promotions`

Pero estas secciones no aparecen en el sidebar actual y no tienen backend real completo.

## Secciones principales de `page.tsx`

### Dashboard

Muestra:

- Metricas generales.
- Datos de ventas.
- Productos con stock bajo.
- Graficos.
- Indicadores de inventario.

### Productos

Permite:

- Listar productos.
- Crear productos.
- Editar productos.
- Borrar productos.
- Buscar productos.
- Asignar categoria.
- Escanear codigo de barras.
- Definir stock, precio, costo, precio mayorista y stock minimo.

### Categorias

Permite:

- Crear categorias.
- Editar categorias.
- Eliminar categorias.

La eliminacion depende de la validacion backend: no se puede eliminar una categoria con productos asociados.

### Punto de venta

Permite:

- Buscar productos.
- Agregar al carrito.
- Usar venta minorista o mayorista.
- Elegir metodo de pago.
- Completar venta.
- Imprimir ticket.
- Descontar stock.
- Registrar movimientos de inventario.

### Proveedores

Permite:

- Crear proveedores.
- Editar proveedores.
- Eliminar proveedores.
- Buscar proveedores.
- Asociar texto/listado de productos surtidos.

Advertencia:

La logica de `productos_ids` en frontend puede no persistir correctamente por el serializer sobrescrito del backend.

### Inventario

Permite:

- Ver movimientos.
- Registrar ajustes.
- Ver entradas/salidas.
- Eliminar todos los movimientos.

### Historial

Muestra:

- Historial de ventas.
- Detalles de venta.
- Historial de movimientos.

### Abastecimiento

Permite:

- Crear ordenes de compra.
- Recepcionar productos.
- Crear devoluciones a proveedor.
- Procesar devoluciones.

Advertencia:

Revisar el bug de `transaction` antes de usar recepcion de productos.

### Reportes

Permite exportar:

- Productos.
- Ventas.
- Clientes.
- Promociones.
- Proveedores.
- Movimientos.
- Stock por categoria.
- Productos por vencer.
- Productos obsoletos.
- Productos rentables.
- Ventas por metodo de pago.

## Cliente API del frontend

Archivo:

```text
Frontend\lib\api.ts
```

La funcion principal es `getApiBase`.

Comportamiento:

1. Si existe `NEXT_PUBLIC_API_URL`, usa esa URL.
2. Si esta en navegador y el protocolo es HTTPS, usa el mismo host con `/api`.
3. Si esta en navegador y es HTTP, usa `http://hostname:8000/api`.
4. En SSR usa `http://localhost:8000/api`.

Esto permite que:

- En PC local se use `http://localhost:3000` y Django en `8000`.
- En celular se use `https://IP:3443` y el servidor HTTPS proxyee `/api` hacia Django.

Advertencia:

`api.ts` tiene funciones que apuntan a endpoints que no existen actualmente en Django:

```text
getClientes
getCliente
createCliente
getPromociones
getPromocion
getVenta
updateVenta
deleteVenta
```

No asumir que todo lo definido en `api.ts` esta respaldado por backend.

## Flujo detallado de venta

El flujo principal esta en `useSales` dentro de:

```text
Frontend\app\page.tsx
```

Proceso al completar venta:

1. El usuario agrega productos al carrito.
2. El sistema calcula subtotal, descuento y total.
3. El frontend crea una venta con:

```ts
api.createVenta(saleDataToSend)
```

4. Se obtiene la lista de presentaciones:

```ts
api.getPresentaciones()
```

5. Por cada item del carrito:
   - Busca una presentacion asociada al producto.
   - Si no encuentra, usa una presentacion por defecto.
   - Crea detalle de venta:

```ts
api.createDetalleVenta(itemData)
```

6. Por cada item vendido:
   - Descuenta stock del producto con `api.updateProduct`.
   - Registra movimiento de inventario tipo `salida`.

7. Genera objeto local de venta.

8. Imprime ticket termico con:

```text
Frontend\utils\print-receipt.ts
```

Advertencias importantes del flujo:

- El frontend envia campos que `VentaSerializer` no define.
- El backend actual de `Venta` solo persiste `numero_venta`, `fecha` y `total`.
- El campo `descuento` en detalle de venta no existe en el modelo.
- Si no existen presentaciones correctas, el frontend puede usar `id_presentacion = 1`, lo que puede generar datos inconsistentes.

## Escaneo de codigos de barras

Hay dos mecanismos.

### Pistola USB o lector tipo teclado

Archivo:

```text
Frontend\hooks\use-keyboard-barcode-scanner.ts
```

Funcionamiento:

- Escucha eventos `keydown`.
- Detecta secuencias rapidas.
- Si la secuencia es suficientemente rapida y larga, la interpreta como codigo de barras.
- Evita que los primeros digitos queden escritos en inputs.
- Restaura el valor original del input si corresponde.

Parametros por defecto:

- `minLength = 6`
- `maxDelayMs = 45`
- `finishDelayMs = 80`

### Camara de celular

Archivo:

```text
Frontend\components\barcode-scanner.tsx
```

Usa:

```text
html5-qrcode
```

Formatos soportados:

- EAN 13
- EAN 8
- UPC A
- UPC E
- CODE 128
- CODE 39
- CODE 93
- ITF
- CODABAR

El componente:

- Solo se muestra en dispositivos moviles.
- Requiere HTTPS o localhost para usar camara.
- Si no puede usar camara en vivo, usa fallback de captura de imagen.

## Servidor HTTPS local para celular

Archivo:

```text
Frontend\serve-https.js
```

Objetivo:

- Servir el build estatico de Next desde `Frontend\out`.
- Exponer HTTPS en puerto `3443`.
- Proxyear `/api/*` hacia Django en `http://127.0.0.1:8000/api/*`.
- Evitar bloqueo de mixed content en navegadores.
- Permitir uso de camara en celulares.

Puerto:

```text
3443
```

Backend proxy:

```text
127.0.0.1:8000
```

## Generacion de certificado local

Archivo:

```text
Frontend\generar-cert.js
```

Genera:

```text
Frontend\certs\server.crt
Frontend\certs\server.key
Frontend\certs\server-ip.txt
```

Incluye SAN para:

- `localhost`
- `127.0.0.1`
- IP LAN detectada

Si cambia la IP LAN, regenera el certificado.

Primero intenta usar OpenSSL. Si no existe, usa PowerShell/.NET como fallback.

## Build frontend

Archivo:

```text
Frontend\next.config.mjs
```

Configuracion relevante:

```js
output: "export"
assetPrefix: "."
images: {
  unoptimized: true
}
eslint: {
  ignoreDuringBuilds: true
}
typescript: {
  ignoreBuildErrors: true
}
```

Advertencia:

El build ignora errores de TypeScript y ESLint. Esto permite compilar aunque existan problemas tipados o de lint.

## Reportes y exportacion Excel

Archivo:

```text
Frontend\utils\excel-export.tsx
```

Funciones:

- `exportToCSV`
- `exportToExcel`
- `formatDataForExcel`

Usa import dinamico de:

```text
xlsx
```

Los reportes descargan archivos `.xlsx` o `.csv`.

## Impresion de ticket

Archivo:

```text
Frontend\utils\print-receipt.ts
```

Genera una ventana nueva con HTML optimizado para rollo termico:

```text
80mm
```

Muestra:

- Nombre TRILALEO.
- Fecha.
- Numero de venta.
- Items.
- Subtotal.
- Descuento si corresponde.
- Total.

Luego ejecuta:

```js
window.print()
```

Y cierra la ventana.

## Instalacion inicial

Script principal:

```text
iniciar_sistema.bat
```

Si detecta instalacion incompleta, llama:

```text
instalar_requisitos.bat
```

La instalacion con PowerShell esta en:

```text
instalar_requisitos.ps1
```

Este script:

1. Solicita permisos de administrador.
2. Verifica o instala Git.
3. Verifica o instala Python.
4. Verifica o instala Node.js.
5. Verifica o instala MySQL Server.
6. Inicializa MySQL si no existe servicio.
7. Crea base de datos.
8. Crea usuario privado `trilaleo_app`.
9. Genera `Backend\.env`.
10. Llama a `configurar_sistema.ps1`.

## Configuracion del proyecto

Script:

```text
configurar_sistema.ps1
```

Hace:

1. Crea entorno virtual Python en:

```text
django_entorno
```

2. Instala dependencias de Python:

```powershell
pip install -r Backend\requirements.txt
```

3. Verifica Node/npm.

4. Instala dependencias frontend:

```powershell
npm ci
```

5. Si falta `Backend\.env` o se fuerza reconfiguracion:
   - Pide usuario admin de MySQL.
   - Crea base `inventario_trilaleo`.
   - Crea usuario `trilaleo_app`.
   - Escribe `Backend\.env`.

6. Ejecuta migraciones:

```powershell
python Backend\inventario\manage.py migrate --noinput
```

## Inicio del sistema

Script:

```text
iniciar_sistema.bat
```

Hace:

1. Detecta IP local.
2. Crea regla firewall para puerto `3443`.
3. Inicia backend Django:

```text
0.0.0.0:8000
```

4. Inicia frontend Next dev:

```text
0.0.0.0:3000
```

5. Compila frontend estatico:

```text
npm run build
```

6. Genera certificado HTTPS local.

7. Inicia servidor HTTPS movil:

```text
0.0.0.0:3443
```

8. Abre navegador:

```text
http://localhost:3000
```

Direcciones de uso:

```text
PC servidor: http://localhost:3000
Celular/LAN: https://IP_DEL_PC:3443
```

## Detencion del sistema

Script:

```text
detener_sistema.bat
```

Mata procesos escuchando en:

- `8000`
- `3000`
- `3443`

Tambien cierra ventanas con titulos relacionados:

- Backend Django
- Frontend HTTP
- Frontend HTTPS

## Actualizacion del sistema

Script:

```text
actualizar_sistema.ps1
```

Hace:

1. Verifica que Git exista.
2. Verifica que el repo tenga `.git`.
3. Verifica que no existan cambios locales tracked.
4. Detiene servicios.
5. Crea respaldo MySQL en:

```text
Backups
```

6. Ejecuta:

```powershell
git pull --ff-only
```

7. Actualiza dependencias Python.
8. Ejecuta `npm ci`.
9. Compila frontend.
10. Aplica migraciones.
11. Reinicia sistema con:

```text
iniciar_sistema.bat --skip-build
```

Conserva solo los 10 respaldos mas recientes.

## Importacion de base de datos

Script:

```text
importar_db.bat
```

Importa archivos SQL desde:

```text
DB_Trilaleo
```

Tablas importadas:

- `auth_permission`
- `auth_group`
- `auth_group_permissions`
- `auth_user`
- `auth_user_groups`
- `auth_user_user_permissions`
- `django_content_type`
- `django_migrations`
- `django_session`
- `django_admin_log`
- `categorias`
- `productos`
- `presentaciones_producto`
- `ventas`
- `detalle_venta`
- `merma`

Advertencia importante:

La carpeta `DB_Trilaleo` parece contener un dump antiguo/parcial. No incluye:

- `proveedores`
- `movimientos_inventario`
- `ordenes_compra`
- `detalle_orden_compra`
- `devoluciones_proveedores`

Despues de importar, ejecutar migraciones para crear tablas faltantes:

```powershell
django_entorno\Scripts\python.exe Backend\inventario\manage.py migrate
```

## Migraciones

Archivo:

```text
Backend\inventario\gestion\migrations\0001_initial.py
```

Incluye tablas actuales:

- Categorias
- Productos
- Presentaciones
- Mermas
- Ventas
- Detalles de venta
- Proveedores
- Movimientos de inventario
- Ordenes de compra
- Detalles de orden de compra
- Devoluciones a proveedores

## Archivo SQL auxiliar

Archivo:

```text
crear_tablas_faltantes.sql
```

Contiene SQL manual para crear:

- `proveedores`
- `movimientos_inventario`
- `ordenes_compra`
- `detalle_orden_compra`
- `devoluciones_proveedores`

El comentario indica que se crean sin foreign key constraints para evitar incompatibilidades de tipos.

Este archivo parece ser una ayuda/manual anterior. Preferir migraciones Django si es posible.

## Admin Django

Archivo:

```text
Backend\inventario\gestion\admin.py
```

Registra:

- Categoria
- Producto
- PresentacionProducto
- Merma
- Venta
- DetalleVenta
- Proveedor
- MovimientoInventario

Tiene admins personalizados para:

- Proveedores
- Movimientos de inventario

No registra actualmente:

- OrdenCompra
- DetalleOrdenCompra
- DevolucionProveedor

## Tests

Archivo:

```text
Backend\inventario\gestion\tests.py
```

Esta vacio.

No hay pruebas automatizadas significativas actualmente.

## Problemas y riesgos tecnicos detectados

### 1. Serializers duplicados

En:

```text
Backend\inventario\gestion\serializers.py
```

Se definen dos veces:

- `ProductoSerializer`
- `ProveedorSerializer`

La ultima definicion sobrescribe la primera.

Esto puede romper:

- `fecha_vencimiento` en productos.
- `productos_ids` en proveedores.
- Respuestas esperadas por frontend.

### 2. Campos frontend/backend desalineados en ventas

El frontend envia campos que el backend no modela:

- `subtotal`
- `descuento`
- `metodo_pago`
- `es_mayorista`
- `estado`
- `id_cliente`
- `id_promocion`

El modelo `Venta` solo tiene:

- `id_venta`
- `numero_venta`
- `fecha`
- `total`

### 3. DetalleVenta sin descuento

El frontend envia `descuento`, pero el modelo `DetalleVenta` no lo tiene.

### 4. Endpoints inexistentes en backend

En `Frontend\lib\api.ts` existen funciones para:

- Clientes
- Promociones
- Venta por ID

Pero Django no tiene esos endpoints.

### 5. Posible bug con `transaction`

En `OrdenCompraViewSet.recibir_productos`, se usa `transaction.atomic()` sin import global.

Debe agregarse:

```python
from django.db import transaction
```

arriba en `views.py`.

### 6. `page.tsx` demasiado grande

El frontend concentra demasiada logica en:

```text
Frontend\app\page.tsx
```

Esto dificulta:

- Debugging.
- Tests.
- Refactors.
- Cambios seguros.

### 7. Build ignora errores TypeScript y ESLint

En:

```text
Frontend\next.config.mjs
```

Esta configurado:

```js
eslint: {
  ignoreDuringBuilds: true,
},
typescript: {
  ignoreBuildErrors: true,
},
```

Puede esconder errores reales.

### 8. Importacion SQL antigua

`DB_Trilaleo` no contiene todas las tablas actuales.

Si se importa esa base, hay que revisar migraciones y tablas faltantes.

## Recomendaciones para la siguiente IA

### Prioridad 1: estabilizar serializers

Corregir `serializers.py` para que exista una sola definicion de:

- `ProductoSerializer`
- `ProveedorSerializer`

Y asegurar que incluyan los campos que el frontend usa.

### Prioridad 2: alinear ventas

Decidir si el sistema debe persistir:

- Subtotal
- Descuento
- Metodo de pago
- Estado
- Venta mayorista
- Cliente
- Promocion

Si si, modificar:

- `Venta`
- `DetalleVenta`
- migraciones
- serializers
- vistas
- frontend si corresponde

### Prioridad 3: corregir abastecimiento

Agregar import de `transaction` y probar:

- Crear orden de compra.
- Recibir productos.
- Verificar aumento de stock.
- Crear devolucion.
- Aprobar devolucion.
- Verificar descuento de stock.

### Prioridad 4: endpoints muertos o faltantes

Opciones:

1. Crear endpoints reales para clientes y promociones.
2. Eliminar funciones no usadas de `api.ts`.
3. Mantenerlas pero documentarlas como futuras/no implementadas.

### Prioridad 5: refactor frontend gradual

Separar `page.tsx` en:

```text
features/products
features/sales
features/suppliers
features/inventory
features/reports
features/supplying
```

No hacer un refactor masivo sin pruebas manuales, porque el archivo concentra muchos flujos acoplados.

### Prioridad 6: pruebas minimas

Agregar pruebas o al menos scripts/manual QA para:

- Crear producto.
- Editar producto.
- Crear categoria.
- Crear venta.
- Confirmar descuento de stock.
- Confirmar creacion de detalle de venta.
- Confirmar creacion de movimiento de inventario.
- Crear proveedor.
- Crear orden de compra.
- Recepcionar productos.

## Comandos utiles

### Backend manual

```powershell
cd D:\Sistema_Inventario_Trilaleo\Backend\inventario
D:\Sistema_Inventario_Trilaleo\django_entorno\Scripts\python.exe manage.py runserver 0.0.0.0:8000
```

### Migraciones

```powershell
cd D:\Sistema_Inventario_Trilaleo\Backend\inventario
D:\Sistema_Inventario_Trilaleo\django_entorno\Scripts\python.exe manage.py migrate
```

### Crear migraciones

```powershell
cd D:\Sistema_Inventario_Trilaleo\Backend\inventario
D:\Sistema_Inventario_Trilaleo\django_entorno\Scripts\python.exe manage.py makemigrations
```

### Frontend dev

```powershell
cd D:\Sistema_Inventario_Trilaleo\Frontend
npm run dev -- -H 0.0.0.0
```

### Frontend build estatico

```powershell
cd D:\Sistema_Inventario_Trilaleo\Frontend
npm run build
```

### Servidor HTTPS movil

```powershell
cd D:\Sistema_Inventario_Trilaleo\Frontend
node generar-cert.js 192.168.x.x
node serve-https.js 192.168.x.x
```

### Inicio completo recomendado

```text
iniciar_sistema.bat
```

### Detener sistema

```text
detener_sistema.bat
```

### Actualizar sistema

```text
actualizar_sistema.bat
```

## Checklist de entrega a otra IA

- Repo en `D:\Sistema_Inventario_Trilaleo`.
- Rama actual: `main`.
- Estado git limpio al momento de la revision.
- Backend Django bajo `Backend\inventario`.
- Frontend Next bajo `Frontend`.
- Base MySQL local `inventario_trilaleo`.
- Credenciales en `Backend\.env`, no versionadas.
- Iniciar con `iniciar_sistema.bat`.
- Acceso PC: `http://localhost:3000`.
- Acceso celular: `https://IP_DEL_PC:3443`.
- Revisar serializers duplicados antes de tocar productos/proveedores.
- Revisar modelo de ventas antes de confiar en reportes/metodos de pago/descuentos.
- Revisar endpoint de recepcion de productos por posible falta de import `transaction`.
- No asumir que clientes/promociones tienen backend real.
- Tener cuidado con `Frontend\app\page.tsx`, porque concentra casi toda la app.

## Estado final de esta revision

No se hicieron cambios funcionales al codigo en esta revision de analisis.

Se genero este documento para entregar el contexto del proyecto a otra IA o desarrollador.
