# Sistema de Inventario Trilaleo

Sistema web para administrar productos, ventas, proveedores y movimientos de inventario. Está diseñado para ejecutarse en un PC con Windows y permitir el acceso desde otros computadores o celulares conectados a la misma red local.

## Características principales

- Administración de productos, categorías y proveedores.
- Punto de venta minorista y mayorista.
- Control de stock, stock mínimo y mermas.
- Registro de movimientos e historial de ventas.
- Lectura de códigos de barras con pistola USB.
- Escaneo mediante la cámara de un celular.
- Importación y exportación de reportes en Excel.
- Acceso desde varios dispositivos dentro de la misma red Wi-Fi.

## Compatibilidad

El sistema está preparado para Windows 10 y Windows 11. La primera instalación requiere:

- Conexión a internet.
- Permisos de administrador.
- `winget`, incluido normalmente con App Installer de Windows.

El instalador detecta y, cuando corresponde, instala Git, Python, Node.js y MySQL Server.

## Primera instalación

### Opción recomendada: clonar con Git

Clonar el repositorio permite recibir futuras actualizaciones automáticamente. Para usar esta opción, instala [Git para Windows](https://git-scm.com/download/win) y ejecuta:

```powershell
git clone https://github.com/sefamara/Inventario-Trilaleo.git
cd Inventario-Trilaleo
```

Después, haz doble clic en `iniciar_sistema.bat`.

### Opción alternativa: descargar un archivo ZIP

También puedes [descargar el repositorio como ZIP](https://github.com/sefamara/Inventario-Trilaleo/archive/refs/heads/main.zip), extraerlo y ejecutar `iniciar_sistema.bat`. Esta opción permite instalar y utilizar el sistema, pero `actualizar_sistema.bat` no funcionará porque la carpeta no tendrá información de Git.

## Configuración automática

Durante la primera ejecución, `iniciar_sistema.bat` llama automáticamente al instalador. También puedes iniciarlo directamente con doble clic en `instalar_requisitos.bat`.

El proceso realiza las siguientes tareas:

- Instala los programas necesarios que todavía no estén disponibles.
- Crea el entorno virtual de Python.
- Instala las dependencias de Django y Next.js.
- Inicializa MySQL como servicio de Windows cuando es una instalación nueva.
- Crea la base de datos `inventario_trilaleo`.
- Crea un usuario privado para la aplicación.
- Guarda las credenciales locales en `Backend/.env`.
- Ejecuta las migraciones de Django.
- Compila el frontend y genera el certificado HTTPS local.

Si MySQL se instala por primera vez, el instalador solicitará definir y confirmar una contraseña administrativa. Si MySQL ya estaba instalado, solicitará el usuario administrador, normalmente `root`, y su contraseña actual. Esa contraseña no se publica en GitHub.

La primera instalación puede tardar varios minutos mientras se descargan las dependencias.

## Iniciar el sistema

Haz doble clic en `iniciar_sistema.bat`. Se abrirán las ventanas del backend, del frontend y del acceso HTTPS para celulares.

Direcciones de acceso:

- En el PC servidor: `http://localhost:3000`
- Desde otro PC o celular: `https://IP_DEL_PC:3443`

El iniciador mostrará la dirección IP correcta. Por ejemplo:

```text
https://192.168.1.15:3443
```

El PC servidor y los demás dispositivos deben estar conectados a la misma red Wi-Fi. La primera vez que ingreses desde otro dispositivo, el navegador mostrará una advertencia por el certificado local. Selecciona **Avanzado** y luego **Continuar de todos modos**.

## Detener el sistema

Haz doble clic en `detener_sistema.bat`. El script cerrará los procesos utilizados por Django y por los servidores HTTP y HTTPS del frontend.

## Actualizar el sistema

Esta función está disponible cuando el proyecto fue clonado con Git. Haz doble clic en `actualizar_sistema.bat`.

El actualizador:

- Comprueba que no existan cambios locales sin guardar.
- Detiene los servicios.
- Crea un respaldo de MySQL en la carpeta `Backups`.
- Descarga la última versión del repositorio.
- Actualiza las dependencias de Python y Next.js.
- Compila el frontend y aplica las migraciones.
- Reinicia el sistema únicamente si todo termina correctamente.

Los productos y ventas permanecen en MySQL y no se reemplazan durante una actualización. Se conservan los diez respaldos más recientes.

## Transferir datos desde otra instalación

Los productos, ventas y demás datos se almacenan en MySQL y no se incluyen en GitHub. Una instalación nueva comienza con una base de datos vacía.

Para trasladar información desde otro PC, entrega el respaldo SQL por un medio privado, coloca los archivos correspondientes en la carpeta `DB_Trilaleo` y ejecuta `importar_db.bat` después de completar la instalación.

## Solución de problemas

### El celular no puede conectarse

- Confirma que el celular y el PC estén en la misma red Wi-Fi.
- Usa exactamente la dirección mostrada por `iniciar_sistema.bat`.
- Ejecuta el iniciador como administrador para permitir el puerto TCP `3443` en Windows Firewall.
- Comprueba que las ventanas del backend y del frontend permanezcan abiertas.

### MySQL cambió de contraseña o fue reinstalado

Abre CMD en la carpeta del proyecto y ejecuta:

```bat
configurar_sistema.bat --database
```

El configurador renovará la conexión privada sin eliminar los productos existentes.
