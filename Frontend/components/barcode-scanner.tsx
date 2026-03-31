"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (window.innerWidth <= 768)
      )
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCapture = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      // Importar dinámicamente para evitar problemas de SSR
      const { Html5Qrcode } = await import("html5-qrcode")

      const html5QrCode = new Html5Qrcode("barcode-decode-helper")
      const decodedText = await html5QrCode.scanFile(file, true)

      onScan(decodedText)
      html5QrCode.clear()
    } catch (err) {
      console.error("No se pudo decodificar el código de barras:", err)
      setError("No se detectó un código. Intenta de nuevo con mejor enfoque.")
      // Limpiar el error después de 3 segundos
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsProcessing(false)
      // Limpiar el input para poder seleccionar la misma imagen de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Solo mostrar en móvil
  if (!isMobile) return null

  return (
    <>
      {/* Input oculto que abre la cámara nativa del teléfono */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Div oculto que html5-qrcode necesita para decodificar */}
      <div id="barcode-decode-helper" className="hidden" />

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleCapture}
        disabled={isProcessing}
        title="Escanear con cámara"
        className="shrink-0 relative"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>

      {/* Mensaje de error flotante */}
      {error && (
        <div className="fixed bottom-20 left-4 right-4 z-[100] bg-red-600 text-white text-sm text-center py-2 px-4 rounded-lg shadow-lg animate-pulse">
          {error}
        </div>
      )}
    </>
  )
}
