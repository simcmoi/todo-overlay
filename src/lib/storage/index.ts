import type { StorageProvider, StorageMode } from './types'
import { LocalStorageProvider } from './local-storage'
import { CloudStorageProvider } from './cloud-storage'

export * from './types'
export { LocalStorageProvider } from './local-storage'
export { CloudStorageProvider } from './cloud-storage'

export function createStorageProvider(mode: StorageMode): StorageProvider {
  switch (mode) {
    case 'local':
      return new LocalStorageProvider()
    case 'cloud':
      return new CloudStorageProvider()
    default:
      // Fallback to local
      return new LocalStorageProvider()
  }
}
