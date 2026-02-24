import { type RefObject, useEffect, useRef } from 'react'
import { hideOverlay } from '@/lib/tauri'

export function useWindowBehavior(
  autoCloseOnBlur: boolean,
  inputRef: RefObject<HTMLInputElement | null>,
): void {
  const autoCloseRef = useRef(autoCloseOnBlur)

  useEffect(() => {
    autoCloseRef.current = autoCloseOnBlur
  }, [autoCloseOnBlur])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      void hideOverlay()
    }

    const onFocus = () => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }

    const onBlur = () => {
      if (autoCloseRef.current) {
        void hideOverlay()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
    }
  }, [inputRef])
}
