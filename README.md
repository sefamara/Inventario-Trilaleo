# Sistema de Inventario Trilaleo

Un sistema web completo para la administración, ventas y control de inventario. Diseñado con un frontend moderno y responsivo (adaptable a celulares) y un backend en Python, pensado para ejecutarse en una red local (LAN).

\---

## Características Principales

* **Acceso LAN (Red Local):** Funciona mediante la dirección IP del PC dentro de la red Wi-Fi, permitiendo conectar múltiples dispositivos al mismo tiempo.
* **Diseño Responsivo:** Se adapta perfectamente a la pantalla de celulares con un menú inferior y a computadoras con un menú lateral clásico.
* **Escáner de Código de Barras (Móvil):** Al acceder desde un celular, muestra una opción para usar la cámara nativa del teléfono para detectar y registrar códigos de barra.
* **Punto de Venta:** Registro rápido de ventas al por menor y al por mayor.
* **Gestor de Stock:** Generación de alertas de **Stock Crítico** basado en el stock mínimo de cada producto.
* **Importación/Exportación:** Compatibilidad con archivos Excel para reportes y exportación de datos.

\---

## Requisitos de Instalación

En Windows 10 u 11, el instalador puede descargar automáticamente los programas necesarios mediante `winget`. Solo se requiere:

* Una conexión a internet durante la primera instalación.
* Permisos de administrador.
* `winget`, incluido normalmente con **App Installer** de Windows.

El instalador detecta y, cuando sea necesario, instala Git, Python 3.12, Node.js LTS y MySQL Server. Git es necesario para recibir actualizaciones automáticas; la descarga ZIP solo permite una instalación sin actualizaciones.

\---

## Primera Instalación Después de Clonar el Repositorio

Los entornos, las dependencias, los certificados y las credenciales locales no se guardan en GitHub. El proyecto incluye un configurador que prepara todo automáticamente en cada computadora nueva.

### 1\. Clonar el repositorio

```powershell
git clone URL\_DEL\_REPOSITORIO
cd Sistema\_Inventario\_Trilaleo
```

Reemplaza `URL\_DEL\_REPOSITORIO` por la dirección HTTPS del repositorio en GitHub.

También se puede descargar el archivo ZIP desde GitHub y extraerlo en cualquier carpeta.

### 2\. Ejecutar el sistema

Haz doble clic en `iniciar\_sistema.bat`. Si detecta una instalación nueva, solicitará permisos de administrador e instalará automáticamente los requisitos y el proyecto. También se puede iniciar el proceso directamente con:

```powershell
.\\instalar\_requisitos.bat
```

El instalador realizará estas tareas:

* Instalará Python 3.12, Node.js LTS y MySQL Server si no están presentes.
* Instalará Git si no está presente.
* Inicializará MySQL como servicio de Windows en una instalación nueva.
* Creará el entorno virtual `django\_entorno`.
* Instalará las dependencias de Python.
* Instalará las dependencias de Next.js con `npm ci`.
* Localizará MySQL Server aunque no esté agregado al `PATH`.
* Creará la base de datos `inventario\_trilaleo`.
* Creará el usuario privado `trilaleo\_app` con una contraseña aleatoria.
* Guardará las credenciales locales en `Backend/.env`.
* Ejecutará todas las migraciones de Django.

Si MySQL se instala por primera vez, pedirá definir y confirmar una contraseña administrativa. Si MySQL ya existía, solicitará el usuario administrador, normalmente `root`, y su contraseña actual. La aplicación tendrá un usuario y una contraseña aleatoria independientes.

Después de finalizar, `iniciar\_sistema.bat` continuará con el arranque. La primera ejecución puede tardar varios minutos mientras descarga dependencias y compila el frontend.

### Reparar la conexión de MySQL

Si se cambia o reinstala MySQL, abre CMD en la carpeta del proyecto y ejecuta:

```bat
configurar\_sistema.bat --database
```

Esto vuelve a crear la conexión privada sin tener que reinstalar Python o Node.js.

\---

## Transferir una Base de Datos Existente

La carpeta `DB\_Trilaleo` y los archivos `.sql` están excluidos de GitHub para evitar publicar información real del inventario o datos privados.

Si otra persona necesita una copia del inventario existente, debes entregarle una exportación SQL por un medio privado. Después podrá colocar los respaldos en `DB\_Trilaleo` y ejecutar `importar\_db.bat`. Si solo necesita comenzar con un inventario vacío, el configurador creará automáticamente todas las tablas.

\---

## Cómo Iniciar y Detener el Sistema

Después de completar la primera instalación, el proyecto incluye scripts para iniciar y detener los servicios en Windows. En los siguientes usos no volverá a solicitar la configuración.

### Iniciar el Sistema

Haz doble clic en **`iniciar\_sistema.bat`** o ejecútalo desde PowerShell.

* El script activará el entorno del backend y arrancará Django y Next.js automáticamente.
* Compilará la versión HTTPS utilizada por los celulares.
* Generará o actualizará el certificado local para la dirección IP actual del PC.
* Intentará permitir HTTPS por TCP `3443` en Windows Firewall.
* **Abrirá tu navegador predeterminado** directamente en la página del sistema.

Direcciones de acceso:

* **Desde el PC:** `http://localhost:3000`
* **Desde otro PC o celular:** `https://IP\_DEL\_PC:3443`

El script mostrará la dirección móvil exacta, por ejemplo:

```text
https://192.168.1.15:3443
```

El celular y el PC deben estar conectados a la misma red Wi-Fi. La primera vez, el navegador del celular mostrará una advertencia de seguridad porque el certificado es local; selecciona **Avanzado** y luego **Continuar de todos modos**.

El celular y el PC deben estar conectados a la misma red Wi-Fi. La primera vez, el navegador mostrará una advertencia por el certificado local; selecciona **Avanzado** y luego **Continuar de todos modos**.

### Detener el Sistema

Haz doble clic en el archivo **`detener\_sistema.bat`**.

* Cerrará los procesos utilizados por el backend y el frontend.

### Actualizar el Sistema

Si el proyecto fue clonado con Git, haz doble clic en **`actualizar\_sistema.bat`**. El actualizador:

* Comprobará que no existan cambios locales sin guardar.
* Detendrá los servicios.
* Creará un respaldo de MySQL en `Backups`.
* Descargará los cambios con `git pull --ff-only`.
* Actualizará las dependencias de Python y Next.js.
* Compilará el frontend y aplicará las migraciones.
* Reiniciará el sistema únicamente si todo termina correctamente.

Los productos y ventas permanecen en MySQL y no se reemplazan al actualizar. Se conservan los diez respaldos más recientes.

