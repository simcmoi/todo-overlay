import { motion } from "framer-motion"
import { 
  Zap, 
  ListTree, 
  Tag, 
  Bell, 
  Moon, 
  GripVertical,
  CheckSquare,
  Keyboard
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Affichage instantané",
    description: "Shift+Space pour ouvrir l'overlay en une fraction de seconde, peu importe ce que vous faites."
  },
  {
    icon: Keyboard,
    title: "Workflow ultra-rapide",
    description: "Créez une tâche, ajoutez des détails, définissez une date - tout au clavier, en quelques secondes."
  },
  {
    icon: ListTree,
    title: "Multi-listes",
    description: "Organisez vos tâches en listes multiples. Personnel, Travail, Projets - chacun sa place."
  },
  {
    icon: Tag,
    title: "Labels & Organisation",
    description: "Catégorisez avec des labels colorés. Filtrez et retrouvez vos tâches instantanément."
  },
  {
    icon: CheckSquare,
    title: "Sous-tâches illimitées",
    description: "Décomposez vos projets complexes en sous-tâches imbriquées à l'infini."
  },
  {
    icon: Bell,
    title: "Rappels intelligents",
    description: "Notifications natives macOS pour ne jamais oublier une tâche importante."
  },
  {
    icon: Moon,
    title: "Mode sombre/clair",
    description: "Interface élégante qui s'adapte à vos préférences et à l'heure de la journée."
  },
  {
    icon: GripVertical,
    title: "Drag & Drop",
    description: "Réorganisez vos tâches par simple glisser-déposer. Intuïtif et fluide."
  }
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Une application de to-do pensée pour la productivité maximale
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={item}
                className="relative group"
              >
                <div className="flex flex-col items-start space-y-3 p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-300">
                  <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
