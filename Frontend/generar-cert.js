/**
 * generar-cert.js
 * Genera certificado SSL auto-firmado para el servidor HTTPS local.
 * Busca OpenSSL en rutas comunes de Windows (Git, OpenSSL standalone).
 * Llamado automaticamente por iniciar_sistema.bat
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CERT_DIR = path.join(__dirname, 'certs');
const CERT_FILE = path.join(CERT_DIR, 'server.crt');
const KEY_FILE = path.join(CERT_DIR, 'server.key');
const CERT_IP_FILE = path.join(CERT_DIR, 'server-ip.txt');
const localIP = process.argv[2] || '127.0.0.1';

// Crear directorio si no existe
if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

// Si ya existen los certificados para la misma IP, no hacer nada.
// Si la IP de la red cambió, regenerar para que el certificado incluya el SAN correcto.
if (fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE)) {
  const previousIP = fs.existsSync(CERT_IP_FILE) ? fs.readFileSync(CERT_IP_FILE, 'utf8').trim() : '';
  if (previousIP === localIP) {
    console.log('✅ Certificados ya existen, omitiendo generacion.');
    process.exit(0);
  }

  console.log(`🔄 La IP LAN cambió (${previousIP || 'desconocida'} → ${localIP}); regenerando certificado...`);
  try { fs.unlinkSync(CERT_FILE); } catch {}
  try { fs.unlinkSync(KEY_FILE); } catch {}
}

console.log('🔐 Generando certificados SSL para HTTPS...');

// Rutas donde puede estar OpenSSL en Windows
const opensslCandidates = [
  'openssl',
  'C:\\Program Files\\Git\\usr\\bin\\openssl.exe',
  'C:\\Program Files (x86)\\Git\\usr\\bin\\openssl.exe',
  'C:\\OpenSSL-Win64\\bin\\openssl.exe',
  'C:\\OpenSSL-Win32\\bin\\openssl.exe',
  'C:\\Program Files\\OpenSSL-Win64\\bin\\openssl.exe',
];

function findOpenSSL() {
  for (const candidate of opensslCandidates) {
    try {
      const result = spawnSync(candidate, ['version'], { timeout: 3000, encoding: 'utf8' });
      if (result.status === 0) {
        return candidate;
      }
    } catch {
      // Siguiente
    }
  }
  return null;
}

function generateWithOpenSSL(opensslPath) {
  const subj = `/CN=InventarioTrilaleo/O=Trilaleo/C=CL`;
  const san = `subj_alt_name`;

  // Crear archivo de configuración con SAN (Subject Alternative Name)
  // para que el browser acepte el certificado
  const confContent = `[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
CN = InventarioTrilaleo
O = Trilaleo
C = CL

[v3_req]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment

[alt_names]
DNS.1 = localhost
DNS.2 = *.local
IP.1 = 127.0.0.1
IP.2 = ${localIP}
`;

  const confFile = path.join(CERT_DIR, 'openssl.cnf');
  fs.writeFileSync(confFile, confContent);

  const result = spawnSync(opensslPath, [
    'req', '-x509',
    '-newkey', 'rsa:2048',
    '-keyout', KEY_FILE,
    '-out', CERT_FILE,
    '-days', '730',
    '-nodes',
    '-config', confFile,
  ], { timeout: 20000, encoding: 'utf8' });

  // Limpiar config temporal
  try { fs.unlinkSync(confFile); } catch {}

  if (result.status !== 0) {
    throw new Error(result.stderr || 'OpenSSL falló');
  }
}

// ----- Intentar generar con OpenSSL -----
const opensslPath = findOpenSSL();

if (opensslPath) {
  try {
    generateWithOpenSSL(opensslPath);
    fs.writeFileSync(CERT_IP_FILE, localIP, 'utf8');
    console.log('✅ Certificado SSL generado correctamente.');
    console.log(`   Válido para: localhost, 127.0.0.1, ${localIP}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error generando con OpenSSL:', err.message);
  }
}

// ----- Fallback: PowerShell + exportar PEM con .NET -----
console.log('🔄 OpenSSL no disponible, usando PowerShell...');

const psScript = `
$certDir = '${CERT_DIR.replace(/\\/g, '\\\\')}';
$keyFile = '${KEY_FILE.replace(/\\/g, '\\\\')}';
$certFile = '${CERT_FILE.replace(/\\/g, '\\\\')}';

# Generar certificado usando CNG de Windows
Add-Type -AssemblyName System.Security;

$rsa = [System.Security.Cryptography.RSA]::Create(2048);
$req = [System.Security.Cryptography.X509Certificates.CertificateRequest]::new(
    'CN=InventarioTrilaleo,O=Trilaleo,C=CL',
    $rsa,
    [System.Security.Cryptography.HashAlgorithmName]::SHA256,
    [System.Security.Cryptography.RSASignaturePadding]::Pkcs1
);

# Agregar SAN extension
$sanBuilder = [System.Security.Cryptography.X509Certificates.SubjectAlternativeNameBuilder]::new();
$sanBuilder.AddDnsName('localhost');
$sanBuilder.AddIpAddress([System.Net.IPAddress]::Parse('127.0.0.1'));
try { $sanBuilder.AddIpAddress([System.Net.IPAddress]::Parse('${localIP}')); } catch {}
$req.CertificateExtensions.Add($sanBuilder.Build());

# Crear certificado auto-firmado
$cert = $req.CreateSelfSigned(
    [System.DateTimeOffset]::UtcNow.AddDays(-1),
    [System.DateTimeOffset]::UtcNow.AddYears(2)
);

# Exportar certificado PEM
$certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert);
$certB64 = [Convert]::ToBase64String($certBytes, 'InsertLineBreaks');
"-----BEGIN CERTIFICATE-----\`n$certB64\`n-----END CERTIFICATE-----" | Set-Content -Path $certFile -Encoding ASCII;

# Exportar clave privada PEM
$keyBytes = $rsa.ExportPkcs8PrivateKey();
$keyB64 = [Convert]::ToBase64String($keyBytes, 'InsertLineBreaks');
"-----BEGIN PRIVATE KEY-----\`n$keyB64\`n-----END PRIVATE KEY-----" | Set-Content -Path $keyFile -Encoding ASCII;

Write-Host "OK";
`;

const psResult = spawnSync('powershell', [
  '-NoProfile', '-NonInteractive', '-Command', psScript
], { timeout: 30000, encoding: 'utf8' });

if (psResult.status === 0 && psResult.stdout.includes('OK')) {
  if (fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE)) {
    fs.writeFileSync(CERT_IP_FILE, localIP, 'utf8');
    console.log('✅ Certificado SSL generado con PowerShell correctamente.');
    console.log(`   Válido para: localhost, 127.0.0.1, ${localIP}`);
    process.exit(0);
  }
}

console.error('❌ No se pudo generar el certificado SSL.');
console.error('   Salida de PowerShell:', psResult.stdout, psResult.stderr);
console.error('');
console.error('   Solución: Instala Git for Windows (ya incluye OpenSSL)');
console.error('   Descarga: https://git-scm.com/download/win');
process.exit(1);
