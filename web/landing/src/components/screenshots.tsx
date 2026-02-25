import { motion } from "framer-motion"

const screenshots = [
  {
    title: "Interface principale",
    description: "Vue d'ensemble de l'overlay avec liste de tâches",
    placeholder: true
  },
  {
    title: "Création rapide",
    description: "Ajoutez une tâche en quelques secondes",
    placeholder: true
  },
  {
    title: "Organisation",
    description: "Multi-listes et labels pour tout organiser",
    placeholder: true
  }
]

export function Screenshots() {
  return (
    <section className="py-24 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Voir Todo Overlay en action
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Une interface simple et efficace pour gérer toutes vos tâches
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {screenshots.map((screenshot, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-y-4"
            >
              <div className="relative rounded-xl border bg-card shadow-lg overflow-hidden group">
                <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Screenshot à venir</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">{screenshot.title}</h3>
                <p className="text-sm text-muted-foreground">{screenshot.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Disponible maintenant sur macOS, Windows et Linux</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
