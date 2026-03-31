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

---

## 🗄️ Configuración de la Base de Datos

1. Asegúrate de tener **MySQL** ejecutándose en tu PC.
2. Crea una nueva base de datos llamada: `inventario_trilaleo`
3. El sistema buscará conectarse por defecto a MySQL con las siguientes credenciales:
   - **Nombre de BD:** `inventario_trilaleo`
   - **Usuario:** `root`
   - **Contraseña:** `GodTracker.,$01`
   - **Host:** `127.0.0.1`
   - **Puerto:** `3306`

*(💡 Opcional: Si necesitas usar otra contraseña o usuario, puedes crear un archivo llamado `.env` dentro de la carpeta `Backend/inventario` definiendo estas claves: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`).*

---

## 🚀 Cómo Iniciar y Detener el Sistema

El proyecto incluye ejecutables diseñados específicamente para hacerte la vida más fácil en **Windows**, sin necesidad de usar comandos.

### Iniciar el Sistema
Haz doble clic en el archivo **`iniciar_sistema.bat`** que se encuentra en la raíz del proyecto.
- El script activará el entorno del backend y arrancará ambos servidores (Django y Next.js) automáticamente.
- **Abrirá tu navegador predeterminado** directamente en la página del sistema.
- **Acceso en Móvil:** En la consola que se abre, te mostrará la **IP de tu red local** (Ejemplo: `http://192.168.1.15:3000`). Si conectas tu celular al mismo Wi-Fi de la PC y abres esa dirección IP en el navegador del celular, podrás acceder al sistema.

### Detener el Sistema
Haz doble clic en el archivo **`detener_sistema.bat`**.
- Buscará los puertos exactos que están utilizando los servidores (8000 y 3000), cerrará correctamente los procesos para que no consuman recursos y cerrará las pantallas negras de consola de forma segura.

---

## ☁️ Subir Cambios a GitHub

Si modificas el código o quieres respaldar avances en internet, puedes abrir una consola de comandos (CMD o PowerShell) en la carpeta principal del proyecto y ejecutar, uno por uno, estos tres comandos:

```bash
git add .
git commit -m "Agrega aquí un mensaje que describa tus cambios"
git push
```
