import { motion } from "framer-motion"
import { Apple, MonitorSmartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

type OS = "macOS" | "Windows" | "Linux" | "Unknown"

function detectOS(): OS {
  const platform = window.navigator.platform
  const macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"]
  const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"]
  
  if (macosPlatforms.indexOf(platform) !== -1) {
    return "macOS"
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    return "Windows"
  } else if (/Linux/.test(platform)) {
    return "Linux"
  }
  
  return "Unknown"
}

export function Download() {
  const [os, setOs] = useState<OS>("Unknown")

  useEffect(() => {
    setOs(detectOS())
  }, [])

  const getPrimaryDownload = () => {
    switch (os) {
      case "macOS":
        return {
          label: "Télécharger pour macOS",
          icon: Apple,
          href: "#download-macos"
        }
      case "Windows":
        return {
          label: "Télécharger pour Windows",
          icon: MonitorSmartphone,
          href: "#download-windows"
        }
      case "Linux":
        return {
          label: "Télécharger pour Linux",
          icon: MonitorSmartphone,
          href: "#download-linux"
        }
      default:
        return {
          label: "Télécharger",
          icon: MonitorSmartphone,
          href: "#download"
        }
    }
  }

  const primary = getPrimaryDownload()
  const PrimaryIcon = primary.icon

  return (
    <section className="py-24 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Commencez dès maintenant
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
              Téléchargement gratuit. Aucun compte requis.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button size="lg" asChild>
              <a href={primary.href}>
                <PrimaryIcon />
                {primary.label}
              </a>
            </Button>

            <div className="text-sm text-muted-foreground">
              Version 0.2.0 • Mise à jour automatique
            </div>
          </div>

          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">Disponible sur :</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <a href="#download-macos">
                  <Apple />
                  macOS
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="#download-windows">
                  <MonitorSmartphone />
                  Windows
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="#download-linux">
                  <MonitorSmartphone />
                  Linux
                </a>
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 grid gap-6 md:grid-cols-3 text-left"
          >
            <div className="space-y-2 p-6 rounded-lg border bg-card">
              <h3 className="font-semibold">Open Source</h3>
              <p className="text-sm text-muted-foreground">
                Code source disponible sur GitHub. Contribuez et personnalisez.
              </p>
            </div>
            <div className="space-y-2 p-6 rounded-lg border bg-card">
              <h3 className="font-semibold">Vie privée</h3>
              <p className="text-sm text-muted-foreground">
                Toutes vos données restent sur votre machine. Aucun cloud, aucun tracking.
              </p>
            </div>
            <div className="space-y-2 p-6 rounded-lg border bg-card">
              <h3 className="font-semibold">Mises à jour auto</h3>
              <p className="text-sm text-muted-foreground">
                Recevez les nouvelles fonctionnalités automatiquement, sans effort.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
