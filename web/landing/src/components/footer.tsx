import { Github, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <h3 className="font-semibold">Todo Overlay</h3>
            <p className="text-sm text-muted-foreground">
              L'application de to-do la plus efficace pour macOS, Windows et Linux.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Liens</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://github.com/simonfessy/todo-overlay" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="#download" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Télécharger
                </a>
              </li>
              <li>
                <a 
                  href="#features" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Fonctionnalités
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Informations</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Version 0.2.0</li>
              <li>Licence MIT</li>
              <li>© 2026 Simon Fessy</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-2">
            Fait avec <Heart className="h-4 w-4 fill-red-500 text-red-500" /> par Simon Fessy
          </p>
        </div>
      </div>
    </footer>
  )
}
