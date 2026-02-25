import { create } from 'zustand'
import { checkForUpdate, installUpdate, type UpdateInfo } from '@/lib/tauri'

type UpdateState = 'idle' | 'checking' | 'available' | 'downloading' | 'installing' | 'error'

type UpdateStore = {
  state: UpdateState
  updateInfo: UpdateInfo | null
  error: string | null
  downloadProgress: number
  checkForUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
  dismissUpdate: () => void
}

export const useUpdateStore = create<UpdateStore>((set, get) => ({
  state: 'idle',
  updateInfo: null,
  error: null,
  downloadProgress: 0,

  checkForUpdate: async () => {
    set({ state: 'checking', error: null })

    try {
      const info = await checkForUpdate()
      
      if (info.available) {
        set({ state: 'available', updateInfo: info })
      } else {
        set({ state: 'idle', updateInfo: info })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de la vérification des mises à jour'
      set({ state: 'error', error: message })
    }
  },

  installUpdate: async () => {
    const { updateInfo } = get()
    if (!updateInfo?.available) {
      set({ error: 'Aucune mise à jour disponible' })
      return
    }

    set({ state: 'downloading', downloadProgress: 0, error: null })

    try {
      // Écouter les événements de progression depuis Rust
      // Note: l'implémentation actuelle redémarre automatiquement après l'installation
      await installUpdate()
      
      // Cette ligne ne sera probablement jamais atteinte car l'app redémarre
      set({ state: 'idle', updateInfo: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de l\'installation de la mise à jour'
      set({ state: 'error', error: message })
    }
  },

  dismissUpdate: () => {
    set({ state: 'idle', updateInfo: null, error: null })
  },
}))
