import { useEffect, useState } from 'react'

interface GitHubAsset {
  name: string
  browser_download_url: string
  size: number
}

interface GitHubRelease {
  tag_name: string
  name: string
  body: string
  published_at: string
  assets: GitHubAsset[]
}

interface ReleaseData {
  version: string
  macOS: {
    arm64?: string
    intel?: string
  }
  windows: {
    exe?: string
    msi?: string
  }
  linux: {
    appimage?: string
    deb?: string
  }
}

const GITHUB_REPO = 'simcmoi/todo-overlay'
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`

export function useGitHubReleases() {
  const [release, setRelease] = useState<ReleaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelease() {
      try {
        const response = await fetch(GITHUB_API)
        
        if (!response.ok) {
          throw new Error('Failed to fetch release')
        }

        const data: GitHubRelease = await response.json()
        
        // Parse assets to find download URLs for each platform
        const releaseData: ReleaseData = {
          version: data.tag_name.replace('v', ''),
          macOS: {},
          windows: {},
          linux: {}
        }

        data.assets.forEach((asset) => {
          const name = asset.name.toLowerCase()
          
          // macOS
          if (name.includes('aarch64') && name.endsWith('.dmg')) {
            releaseData.macOS.arm64 = asset.browser_download_url
          } else if (name.includes('x86_64') && name.endsWith('.dmg')) {
            releaseData.macOS.intel = asset.browser_download_url
          }
          
          // Windows
          else if (name.endsWith('.exe')) {
            releaseData.windows.exe = asset.browser_download_url
          } else if (name.endsWith('.msi')) {
            releaseData.windows.msi = asset.browser_download_url
          }
          
          // Linux
          else if (name.endsWith('.appimage')) {
            releaseData.linux.appimage = asset.browser_download_url
          } else if (name.endsWith('.deb')) {
            releaseData.linux.deb = asset.browser_download_url
          }
        })

        setRelease(releaseData)
        setError(null)
      } catch (err) {
        console.error('Error fetching GitHub release:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchRelease()
  }, [])

  return { release, loading, error }
}
