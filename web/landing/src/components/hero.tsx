import { motion } from "framer-motion"
import { Download, Github, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium">
              <Zap className="h-4 w-4" />
              <span>Workflow ultra-rapide</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Todo Overlay
            </h1>
            
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              L'application de to-do la plus efficace. Shift+Space pour affichage instantané.
              <br />
              Gestion multi-listes, labels, sous-tâches illimitées et rappels.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Button size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Télécharger pour macOS
            </Button>
            
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <a href="https://github.com/simonfessy/todo-overlay" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
                Voir sur GitHub
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 w-full max-w-5xl"
          >
            <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Screenshot / Demo Video</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-secondary/10 rounded-full blur-3xl"
        />
      </div>
    </section>
  )
}
