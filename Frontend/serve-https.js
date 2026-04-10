/**
 * Servidor HTTPS local para el Frontend del Sistema de Inventario
 * 
 * - Sirve los archivos estáticos del build (carpeta 'out')
 * - Proxea las peticiones /api/* al backend Django (HTTP:8000)
 *   para evitar bloqueo de contenido mixto (HTTPS→HTTP)
 * - Necesario para que la cámara funcione en móvil (getUserMedia requiere HTTPS)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3443;
const DJANGO_PORT = 8000;
const OUT_DIR = path.join(__dirname, 'out');
const CERT_DIR = path.join(__dirname, 'certs');
const CERT_FILE = path.join(CERT_DIR, 'server.crt');
const KEY_FILE = path.join(CERT_DIR, 'server.key');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain',
};

/**
 * Proxy: reenvía peticiones /api/* al backend Django en HTTP
 * Esto evita el bloqueo de "mixed content" del navegador
 */
function proxyToBackend(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: DJANGO_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${DJANGO_PORT}`,
    },
  };

  // Eliminar headers que pueden causar problemas con el proxy
  delete options.headers['origin'];
  delete options.headers['referer'];

  const proxyReq = http.request(options, (proxyRes) => {
    // Agregar CORS headers a la respuesta
    const responseHeaders = {
      ...proxyRes.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    res.writeHead(proxyRes.statusCode, responseHeaders);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('❌ Error conectando al backend Django:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'No se pudo conectar al backend Django en puerto ' + DJANGO_PORT,
      detail: err.message 
    }));
  });

  // Timeout de 30 segundos
  proxyReq.setTimeout(30000, () => {
    proxyReq.destroy();
    res.writeHead(504);
    res.end('Gateway Timeout');
  });

  // Reenviar el body de la petición (POST, PUT, etc.)
  req.pipe(proxyReq, { end: true });
}

/**
 * Serve static files from the 'out' directory
 */
function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  
  if (urlPath === '/' || urlPath === '') {
    urlPath = '/index.html';
  }
  
  let filePath = path.join(OUT_DIR, urlPath);
  
  if (!fs.existsSync(filePath)) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    } else if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else {
      // SPA fallback
      filePath = path.join(OUT_DIR, 'index.html');
    }
  }
  
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
}

/**
 * Main request handler - route between proxy and static files
 */
function handleRequest(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  // Proxy API requests to Django backend
  if (req.url.startsWith('/api/') || req.url.startsWith('/api?')) {
    proxyToBackend(req, res);
    return;
  }

  // Serve static files
  serveStatic(req, res);
}

// Main
function main() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error('❌ La carpeta "out" no existe.');
    console.error('   Ejecuta primero: npm run build');
    process.exit(1);
  }

  if (!fs.existsSync(CERT_FILE) || !fs.existsSync(KEY_FILE)) {
    console.error('❌ Certificados SSL no encontrados.');
    console.error('   Ejecuta: node generar-cert.js');
    process.exit(1);
  }

  const options = {
    key: fs.readFileSync(KEY_FILE),
    cert: fs.readFileSync(CERT_FILE),
  };

  const server = https.createServer(options, handleRequest);
  const localIP = getLocalIP();

  server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('========================================================');
    console.log('  🔒 SERVIDOR HTTPS - Sistema de Inventario');
    console.log('========================================================');
    console.log('');
    console.log(`  PC local:    https://localhost:${PORT}`);
    console.log(`  Red LAN:     https://${localIP}:${PORT}`);
    console.log('');
    console.log(`  📡 Proxy API: /api/* → http://127.0.0.1:${DJANGO_PORT}/api/*`);
    console.log('');
    console.log('  📱 Abre en tu celular:');
    console.log(`     https://${localIP}:${PORT}`);
    console.log('');
    console.log('  Presiona Ctrl+C para detener');
    console.log('========================================================');
  });
}

main();
