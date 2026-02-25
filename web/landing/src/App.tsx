import { Hero } from './components/hero'
import { Features } from './components/features'
import { Screenshots } from './components/screenshots'
import { Download } from './components/download'
import { Footer } from './components/footer'

function App() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Screenshots />
      <Download />
      <Footer />
    </div>
  )
}

export default App
