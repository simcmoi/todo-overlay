import { useState, useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

export type WindowMode = 'main' | 'overlay'

export function useWindowMode(): WindowMode {
  const [mode, setMode] = useState<WindowMode>('main')

  useEffect(() => {
    const detectMode = async () => {
      const window = getCurrentWindow()
      const label = window.label
      
      if (label === 'overlay') {
        setMode('overlay')
      } else {
        setMode('main')
      }
    }

    detectMode()
  }, [])

  return mode
}
