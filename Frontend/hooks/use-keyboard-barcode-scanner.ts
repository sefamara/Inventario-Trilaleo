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

const restoreTargetValue = (target: ScannerTarget | null, originalValue: string) => {
  if (!target || document.activeElement !== target) return

  target.value = originalValue
  target.dispatchEvent(new Event("input", { bubbles: true }))
}

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

      reset()

      if (!isScannerInput) return

      restoreTargetValue(target, originalValue)
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

      if (buffer && delta > maxDelayMs) {
        reset()
      }

      if (isTerminator) {
        if (bufferRef.current.length >= minLength && isFastSequenceRef.current) {
          event.preventDefault()
          event.stopPropagation()
          finish()
        } else {
          reset()
        }
        return
      }

      if (!bufferRef.current) {
        targetRef.current = isEditableTarget(event.target) ? event.target : null
        originalValueRef.current = targetRef.current ? targetRef.current.value : ""
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
