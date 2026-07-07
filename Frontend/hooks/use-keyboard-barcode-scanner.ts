"use client"

import { useEffect, useRef } from "react"

type ScannerTarget = HTMLInputElement | HTMLTextAreaElement

interface KeyboardBarcodeScannerOptions {
  active: boolean
  onScan: (barcode: string) => void
  minLength?: number
  maxDelayMs?: number
  finishDelayMs?: number
}

const isEditableTarget = (target: EventTarget | null): target is ScannerTarget => {
  if (!(target instanceof HTMLElement)) return false
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  )
}

const restoreTargetValue = (
  target: ScannerTarget | null,
  originalValue: string,
  selectionStart: number | null,
  selectionEnd: number | null,
) => {
  if (!target || document.activeElement !== target) return

  const prototype = target instanceof HTMLInputElement
    ? HTMLInputElement.prototype
    : HTMLTextAreaElement.prototype
  const nativeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set

  if (nativeValueSetter) {
    nativeValueSetter.call(target, originalValue)
  } else {
    target.value = originalValue
  }

  target.dispatchEvent(new Event("input", { bubbles: true }))

  if (selectionStart !== null && selectionEnd !== null) {
    try {
      target.setSelectionRange(selectionStart, selectionEnd)
    } catch {
      // Algunos tipos de input, como number, no permiten seleccionar texto.
    }
  }
}

// Los lectores de código de barras suelen tardar más en enviar el primer
// carácter (latencia de gatillo/driver) que en los siguientes. Si se usara
// maxDelayMs también para ese primer intervalo, el buffer se reiniciaba a
// mitad del escaneo y el primer dígito ya tipeado en el campo enfocado
// quedaba sin restaurar. Se le da un margen mayor solo a ese primer salto.
const FIRST_CHAR_GRACE_MS = 200

export function useKeyboardBarcodeScanner({
  active,
  onScan,
  minLength = 6,
  maxDelayMs = 45,
  finishDelayMs = 80,
}: KeyboardBarcodeScannerOptions) {
  const onScanRef = useRef(onScan)
  const bufferRef = useRef("")
  const lastKeyAtRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const targetRef = useRef<ScannerTarget | null>(null)
  const originalValueRef = useRef("")
  const selectionStartRef = useRef<number | null>(null)
  const selectionEndRef = useRef<number | null>(null)
  const isFastSequenceRef = useRef(false)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    if (!active) return

    const reset = () => {
      bufferRef.current = ""
      lastKeyAtRef.current = 0
      targetRef.current = null
      originalValueRef.current = ""
      selectionStartRef.current = null
      selectionEndRef.current = null
      isFastSequenceRef.current = false

      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const finish = () => {
      const barcode = bufferRef.current.trim()
      const isScannerInput = isFastSequenceRef.current && barcode.length >= minLength
      const target = targetRef.current
      const originalValue = originalValueRef.current
      const selectionStart = selectionStartRef.current
      const selectionEnd = selectionEndRef.current

      reset()

      if (!isScannerInput) return

      restoreTargetValue(target, originalValue, selectionStart, selectionEnd)
      onScanRef.current(barcode)
    }

    const scheduleFinish = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }

      timerRef.current = window.setTimeout(finish, finishDelayMs)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return

      const now = Date.now()
      const key = event.key
      const isTerminator = key === "Enter" || key === "Tab"
      const isCharacter = key.length === 1

      if (!isCharacter && !isTerminator) return

      const buffer = bufferRef.current
      const delta = lastKeyAtRef.current ? now - lastKeyAtRef.current : 0

      // El terminador (Enter/Tab) se evalúa con su propia condición de
      // aceptación (isFastSequenceRef + minLength) y no debe pasar por el
      // reinicio por demora de abajo: algunos lectores envían el Enter final
      // con una latencia distinta a la de los dígitos, y reiniciar el buffer
      // aquí antes de evaluarlo descartaba escaneos completos y válidos.
      if (isTerminator) {
        if (buffer.length >= minLength && isFastSequenceRef.current) {
          event.preventDefault()
          event.stopPropagation()
          finish()
        } else {
          reset()
        }
        return
      }

      const effectiveMaxDelay = buffer.length === 1 ? FIRST_CHAR_GRACE_MS : maxDelayMs

      if (buffer && delta > effectiveMaxDelay) {
        reset()
      }

      if (!bufferRef.current) {
        targetRef.current = isEditableTarget(event.target) ? event.target : null
        originalValueRef.current = targetRef.current ? targetRef.current.value : ""
        selectionStartRef.current = targetRef.current?.selectionStart ?? null
        selectionEndRef.current = targetRef.current?.selectionEnd ?? null
      } else if (delta > 0 && delta <= maxDelayMs) {
        isFastSequenceRef.current = true
      }

      if (isFastSequenceRef.current) {
        event.preventDefault()
        event.stopPropagation()
      }

      bufferRef.current += key
      lastKeyAtRef.current = now
      scheduleFinish()
    }

    window.addEventListener("keydown", handleKeyDown, true)

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
      reset()
    }
  }, [active, finishDelayMs, maxDelayMs, minLength])
}
