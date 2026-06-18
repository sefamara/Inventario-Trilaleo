# Sistema de Inventario Trilaleo

Un sistema web completo para la administración, ventas y control de inventario. Diseñado con un frontend moderno y responsivo (adaptable a celulares) y un backend en Python, pensado para ejecutarse en una red local (LAN).

---

## 🌟 Características Principales
- **Acceso LAN (Red Local):** Funciona en la red Wi-Fi local, permitiendo conectar múltiples dispositivos al mismo tiempo (PC principal, tablets y celulares de vendedores).
- **Diseño Responsivo:** Se adapta perfectamente a la pantalla de celulares con un menú inferior y a computadoras con un menú lateral clásico.
- **Escáner de Código de Barras (Móvil):** Al acceder desde un celular, muestra una opción para usar la cámara nativa del teléfono para detectar y registrar códigos de barra.
- **Punto de Venta:** Registro rápido de ventas al por menor y al por mayor.
- **Gestor de Stock:** Generación de alertas de **Stock Crítico** basado en el stock mínimo de cada producto.
- **Importación/Exportación:** Compatibilidad con archivos Excel para reportes y exportación de datos.

---

## 🛠️ Requisitos de Instalación (Prerrequisitos)

Para que el sistema funcione en la computadora principal que hará de servidor, se necesita instalar:

1. **Python** (Versión 3.10 o superior)
   - Requerido para el Backend (Django).
   - ⚠️ **Importante**: Al instalar en Windows, asegúrate de marcar la casilla **"Add Python to PATH"**.
2. **Node.js** (Versión 18 o superior - Recomendada versión LTS)
   - Requerido para el Frontend (Next.js y React).
3. **MySQL Server** (Versión 8 o superior)
   - El motor de base de datos donde se alojará todo tu inventario.
4. **Git**
   - Necesario para descargar el proyecto y recibir futuras actualizaciones.

---

## 🚀 Primera Instalación Después de Clonar el Repositorio

Los entornos virtuales, las dependencias, los certificados y la base de datos local no se guardan en GitHub. Por eso, cada computadora que ejecute el sistema por primera vez debe completar estos pasos.

### 1. Clonar el repositorio

Abre PowerShell o CMD y ejecuta:

```powershell
git clone URL_DEL_REPOSITORIO
cd Sistema_Inventario_Trilaleo
```

Reemplaza `URL_DEL_REPOSITORIO` por la dirección HTTPS del repositorio en GitHub.

### 2. Crear el entorno virtual de Python

Desde la carpeta principal del proyecto:

```powershell
python -m venv django_entorno
.\django_entorno\Scripts\Activate.ps1
pip install -r Backend\requirements.txt
```

Si PowerShell bloquea la activación del entorno virtual, ejecuta una vez:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Después vuelve a ejecutar:

```powershell
.\django_entorno\Scripts\Activate.ps1
```

### 3. Instalar las dependencias del frontend

```powershell
cd Frontend
npm ci
cd ..
```

### 4. Crear la base de datos MySQL

Asegúrate de que MySQL Server esté iniciado. Luego entra a MySQL:

```powershell
mysql -u root -p
```

Dentro de MySQL ejecuta:

```sql
CREATE DATABASE inventario_trilaleo
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

EXIT;
```

### 5. Configurar las credenciales de la base de datos

Crea un archivo llamado `.env` dentro de la carpeta `Backend`, es decir:

```text
Backend/.env
```

Agrega el siguiente contenido y reemplaza `TU_CONTRASENA_MYSQL` por la contraseña configurada en MySQL:

```env
DB_NAME=inventario_trilaleo
DB_USER=root
DB_PASSWORD=TU_CONTRASENA_MYSQL
DB_HOST=127.0.0.1
DB_PORT=3306
DEBUG=True
ALLOWED_HOSTS=*
```

El archivo `.env` contiene datos privados y está excluido de GitHub mediante `.gitignore`.

### 6. Crear las tablas del sistema

Desde la carpeta principal del proyecto:

```powershell
.\django_entorno\Scripts\Activate.ps1
cd Backend\inventario
python manage.py migrate
cd ..\..
```

Esto crea una base de datos nueva y vacía, lista para comenzar a registrar productos.

### 7. Iniciar el sistema

Ejecuta `iniciar_sistema.bat`, preferentemente como administrador para que pueda crear la regla de Windows Firewall correspondiente al acceso móvil:

```powershell
.\iniciar_sistema.bat
```

El primer inicio puede tardar un poco más porque se compila el frontend y se genera el certificado HTTPS local.

---

## 🗄️ Transferir una Base de Datos Existente

La carpeta `DB_Trilaleo` y los archivos `.sql` están excluidos de GitHub para evitar publicar información real del inventario o datos privados.

Si otra persona necesita una copia del inventario existente, debes entregarle una exportación SQL por un medio privado. Después deberá crear la base `inventario_trilaleo` e importar ese archivo con MySQL. Si solo necesita comenzar con un inventario vacío, basta con ejecutar `python manage.py migrate` como se indicó anteriormente.

---

## ▶️ Cómo Iniciar y Detener el Sistema

Después de completar la primera instalación, el proyecto incluye scripts para iniciar y detener los servicios en Windows.

### Iniciar el Sistema
Haz doble clic en **`iniciar_sistema.bat`** o ejecútalo desde PowerShell.
- El script activará el entorno del backend y arrancará Django y Next.js automáticamente.
- Compilará la versión HTTPS utilizada por los celulares.
- Generará o actualizará el certificado local para la dirección IP actual del PC.
- Intentará permitir el puerto `3443` en Windows Firewall.
- **Abrirá tu navegador predeterminado** directamente en la página del sistema.

Direcciones de acceso:

- **Desde el PC:** `http://localhost:3000`
- **Desde un celular:** `https://IP_DEL_PC:3443`

El script mostrará la dirección móvil exacta, por ejemplo:

```text
https://192.168.1.15:3443
```

El celular y el PC deben estar conectados a la misma red Wi-Fi. La primera vez, el navegador del celular mostrará una advertencia de seguridad porque el certificado es local; selecciona **Avanzado** y luego **Continuar de todos modos**.

Si el celular no logra conectarse, ejecuta `iniciar_sistema.bat` como administrador y verifica que Windows Firewall permita Node.js o las conexiones TCP entrantes por el puerto `3443`.

### Detener el Sistema
Haz doble clic en el archivo **`detener_sistema.bat`**.
- Cerrará los procesos utilizados por el backend y el frontend.

---

## ☁️ Subir Cambios a GitHub

Si modificas el código o quieres respaldar avances en internet, puedes abrir una consola de comandos (CMD o PowerShell) en la carpeta principal del proyecto y ejecutar, uno por uno, estos tres comandos:

```bash
git add .
git commit -m "Agrega aquí un mensaje que describa tus cambios"
git push
```
