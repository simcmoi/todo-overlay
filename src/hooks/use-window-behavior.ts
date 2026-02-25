import { type RefObject, useEffect, useRef } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { hideOverlay } from '@/lib/tauri'

export function useWindowBehavior(
  autoCloseOnBlur: boolean,
  inputRef: RefObject<HTMLInputElement | null>,
  onWindowOpened?: () => void,
): void {
  const autoCloseRef = useRef(autoCloseOnBlur)

  useEffect(() => {
    autoCloseRef.current = autoCloseOnBlur
  }, [autoCloseOnBlur])

  // Auto-focus input when window becomes visible
  useEffect(() => {
    let unlistenFocus: (() => void) | undefined

    const setupFocusListener = async () => {
      const tauriWindow = getCurrentWindow()
      unlistenFocus = await tauriWindow.onFocusChanged(({ payload: focused }) => {
        if (focused) {
          // Emit custom event for other components to react to window focus
          window.dispatchEvent(new CustomEvent('tauri-window-focused'))
          
          // Call callback when window opens
          onWindowOpened?.()
          
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            inputRef.current?.focus()
            inputRef.current?.select()
          }, 50)
        }
      })
    }

    void setupFocusListener()

    return () => {
      unlistenFocus?.()
    }
  }, [inputRef, onWindowOpened])

  useEffect(() => {
    let isEditorOpen = false

    // Track editor state
    const handleEditorStateChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ isEditing: boolean }>
      isEditorOpen = customEvent.detail.isEditing
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      // Only close window if editor is not open
      // If editor is open, let TodoList handle the Escape to close the editor first
      if (!isEditorOpen) {
        event.preventDefault()
        void hideOverlay()
      }
    }

    const onFocus = () => {
      // Emit custom event for other components to react to window focus
      window.dispatchEvent(new CustomEvent('tauri-window-focused'))
      
      // Call callback when window opens
      onWindowOpened?.()
      
      inputRef.current?.focus()
      inputRef.current?.select()
    }

    const onBlur = () => {
      if (autoCloseRef.current) {
        void hideOverlay()
      }
    }

    window.addEventListener('todo-editor-state-changed', handleEditorStateChange)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('todo-editor-state-changed', handleEditorStateChange)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
    }
  }, [inputRef, onWindowOpened])
}
