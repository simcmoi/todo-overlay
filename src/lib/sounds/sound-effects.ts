/**
 * Générateur de sons synthétiques pour les effets sonores de l'app
 */

export type SoundType = 'add' | 'delete' | 'complete' | 'toggle'

class SoundEffects {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // Initialiser AudioContext de manière lazy
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.warn('AudioContext not supported:', error)
      }
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3): void {
    if (!this.enabled || !this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      // Envelope ADSR simplifié pour un son plus doux
      const now = this.audioContext.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01) // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration) // Decay/Release

      oscillator.start(now)
      oscillator.stop(now + duration)
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }

  /**
   * Son pour l'ajout d'une tâche - petit clic doux montant
   */
  playAdd(): void {
    if (!this.enabled || !this.audioContext) return
    
    // Deux tons rapides ascendants pour un effet "pop"
    this.playTone(440, 0.05, 'sine', 0.15) // La
    setTimeout(() => this.playTone(554, 0.08, 'sine', 0.2), 30) // Do#
  }

  /**
   * Son pour la suppression - petit clic descendant
   */
  playDelete(): void {
    if (!this.enabled || !this.audioContext) return
    
    // Ton descendant pour un effet "whoosh"
    this.playTone(660, 0.06, 'sine', 0.2) // Mi
    setTimeout(() => this.playTone(440, 0.08, 'sine', 0.15), 20) // La
  }

  /**
   * Son pour compléter une tâche - son satisfaisant
   */
  playComplete(): void {
    if (!this.enabled || !this.audioContext) return
    
    // Trois tons montants pour un effet "success"
    this.playTone(523, 0.06, 'sine', 0.15) // Do
    setTimeout(() => this.playTone(659, 0.06, 'sine', 0.15), 40) // Mi
    setTimeout(() => this.playTone(784, 0.12, 'sine', 0.2), 80) // Sol
  }

  /**
   * Son pour toggle (marquer comme incomplet) - petit bip simple
   */
  playToggle(): void {
    if (!this.enabled || !this.audioContext) return
    
    this.playTone(440, 0.08, 'sine', 0.15) // La simple
  }

  /**
   * Son générique pour une action
   */
  play(type: SoundType): void {
    switch (type) {
      case 'add':
        this.playAdd()
        break
      case 'delete':
        this.playDelete()
        break
      case 'complete':
        this.playComplete()
        break
      case 'toggle':
        this.playToggle()
        break
    }
  }
}

// Instance singleton
export const soundEffects = new SoundEffects()
