"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Camera, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
}

interface ZoomRange {
  min: number
  max: number
  step: number
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoomRange, setZoomRange] = useState<ZoomRange | null>(null)
  const [zoomValue, setZoomValue] = useState<number | null>(null)
  const scannerRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerIdRef = useRef<string>(`barcode-scanner-${Date.now()}`)

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

  // Check if camera streaming is available (needs HTTPS or localhost)
  useEffect(() => {
    const checkCameraSupport = () => {
      const isSecure = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1'
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      
      if (!isSecure || !hasGetUserMedia) {
        setUseFallback(true)
      }
    }
    checkCameraSupport()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const scanner = scannerRef.current
        scannerRef.current = null

        try {
          const state = scanner.getState()
          if (state === 2 || state === 3) {
            await scanner.stop()
          }
        } catch {
          // Scanner might already be stopped
        }

        try {
          scanner.clear()
        } catch {
          // Ignore cleanup errors
        }
      }
    } catch (err) {
      console.error("Error stopping scanner:", err)
    }
    setIsScanning(false)
    setZoomRange(null)
    setZoomValue(null)
  }, [])

  const handleZoomChange = useCallback(async (value: number) => {
    setZoomValue(value)
    try {
      await scannerRef.current?.applyVideoConstraints({
        advanced: [{ zoom: value }],
      })
    } catch (err) {
      console.error("Error applying zoom:", err)
    }
  }, [])

  const startLiveScanner = useCallback(async () => {
    setError(null)
    setIsScanning(true)

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode")
      const containerId = containerIdRef.current

      // Wait for the DOM container to be available
      await new Promise<void>((resolve) => {
        const check = () => {
          if (document.getElementById(containerId)) {
            resolve()
          } else {
            requestAnimationFrame(check)
          }
        }
        check()
      })

      // Solo formatos de código de barras (no QR) para mayor precisión
      const barcodeFormats = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
      ]

      const html5QrCode = new Html5Qrcode(containerId, {
        formatsToSupport: barcodeFormats,
        verbose: false,
      })
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 320, height: 160 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        async (decodedText: string) => {
          onScan(decodedText)
          await stopScanner()
        },
        () => {
          // Barcode not detected in this frame - ignore
        }
      )

      // Detect zoom capability on the running camera track (live, no photo needed)
      try {
        const capabilities = html5QrCode.getRunningTrackCapabilities?.() as
          | (MediaTrackCapabilities & { zoom?: { min: number; max: number; step: number } })
          | undefined

        if (capabilities?.zoom) {
          const { min, max, step } = capabilities.zoom
          const settings = html5QrCode.getRunningTrackSettings?.() as
            | (MediaTrackSettings & { zoom?: number })
            | undefined
          setZoomRange({ min, max, step: step || 0.1 })
          setZoomValue(settings?.zoom ?? min)
        }
      } catch {
        // Zoom not supported on this device/browser - ignore
      }
    } catch (err: any) {
      console.error("Error starting live scanner:", err)
      
      // If live scanner fails, switch to fallback mode for this session
      setUseFallback(true)
      setIsScanning(false)
      
      // Automatically trigger fallback file capture
      setTimeout(() => {
        fileInputRef.current?.click()
      }, 100)
    }
  }, [onScan, stopScanner])

  // Fallback: file capture for HTTP contexts (LAN without HTTPS)
  const handleFileCapture = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const { Html5Qrcode } = await import("html5-qrcode")

      // Ensure the decode helper div exists
      let helperDiv = document.getElementById("barcode-decode-helper")
      if (!helperDiv) {
        helperDiv = document.createElement("div")
        helperDiv.id = "barcode-decode-helper"
        helperDiv.style.display = "none"
        document.body.appendChild(helperDiv)
      }

      const html5QrCode = new Html5Qrcode("barcode-decode-helper")
      const decodedText = await html5QrCode.scanFile(file, true)

      onScan(decodedText)
      html5QrCode.clear()
    } catch (err) {
      console.error("No se pudo decodificar el código de barras:", err)
      setError("No se detectó un código. Intenta de nuevo con mejor enfoque y buena iluminación.")
      setTimeout(() => setError(null), 4000)
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleScanClick = () => {
    if (isScanning) {
      stopScanner()
      return
    }

    if (useFallback) {
      handleFileCapture()
    } else {
      startLiveScanner()
    }
  }

  // Solo mostrar en móvil
  if (!isMobile) return null

  return (
    <>
      {/* Hidden file input for fallback capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden helper div for file decode */}
      <div id="barcode-decode-helper" className="hidden" />

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleScanClick}
        disabled={isProcessing}
        title={isScanning ? "Cerrar escáner" : "Escanear con cámara"}
        className="shrink-0 relative"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isScanning ? (
          <X className="h-4 w-4" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>

      {/* Fullscreen live scanner overlay (only when not in fallback mode) */}
      {isScanning && !useFallback && (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/80 z-10">
            <span className="text-white text-sm font-medium">Apunta al código de barras</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={stopScanner}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Scanner view */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <div 
              id={containerIdRef.current} 
              className="w-full h-full"
              style={{ 
                maxWidth: '100vw', 
                maxHeight: '80vh',
              }}
            />
            {/* Scan line animation */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative" style={{ width: 280, height: 150 }}>
                <div className="absolute inset-0 border-2 border-green-400 rounded-lg opacity-70" />
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-green-400"
                  style={{
                    animation: 'scanLine 2s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Zoom control - applied live to the running camera track */}
          {zoomRange && zoomValue !== null && (
            <div className="px-6 pt-2 pb-1 bg-black/80 flex items-center gap-3">
              <span className="text-white/70 text-xs shrink-0">Zoom</span>
              <input
                type="range"
                min={zoomRange.min}
                max={zoomRange.max}
                step={zoomRange.step}
                value={zoomValue}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                className="flex-1 accent-green-400"
              />
              <span className="text-white/70 text-xs shrink-0 w-8 text-right">
                {zoomValue.toFixed(1)}x
              </span>
            </div>
          )}

          {/* Footer instruction */}
          <div className="p-4 bg-black/80 text-center">
            <p className="text-white/70 text-xs">
              El código se detectará automáticamente
            </p>
          </div>

          <style>{`
            @keyframes scanLine {
              0%, 100% { top: 10%; }
              50% { top: 90%; }
            }
            #${containerIdRef.current} video {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
            }
            #${containerIdRef.current} img[alt="Info icon"] {
              display: none !important;
            }
            #${containerIdRef.current} > div {
              border: none !important;
            }
          `}</style>
        </div>
      )}

      {/* Mensaje de error flotante */}
      {error && (
        <div className="fixed bottom-20 left-4 right-4 z-[1000] bg-red-600 text-white text-sm text-center py-2 px-4 rounded-lg shadow-lg animate-pulse">
          {error}
        </div>
      )}
    </>
  )
}
