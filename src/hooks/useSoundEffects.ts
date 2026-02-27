import { useEffect } from 'react'
import { soundEffects, type SoundType } from '@/lib/sounds/sound-effects'
import { useTodoStore } from '@/store/use-todo-store'

/**
 * Hook pour jouer des effets sonores en fonction des paramètres utilisateur
 */
export function useSoundEffects() {
  const settings = useTodoStore((state) => state.settings)

  // Sync sound effects settings with store
  useEffect(() => {
    soundEffects.setSettings(settings.soundSettings)
  }, [settings.soundSettings])

  return {
    playSound: (type: SoundType) => {
      soundEffects.play(type)
    },
    playAdd: () => soundEffects.playAdd(),
    playDelete: () => soundEffects.playDelete(),
    playComplete: () => soundEffects.playComplete(),
    playToggle: () => soundEffects.playToggle(),
  }
}
