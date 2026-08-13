import './App.css'
import { useDemo } from './useDemo'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Terminal from './components/Terminal'
import Pipeline from './components/Pipeline'
import Features from './components/Features'
import Cli from './components/Cli'
import Footer from './components/Footer'

export default function App() {
  const demo = useDemo({ workspaceName: 'my-mail', indexedCount: 18432 })

  return (
    <div className="app" data-theme={demo.dark ? 'dark' : 'light'}>
      <Nav dark={demo.dark} toggleDark={demo.toggleDark} />
      <Hero indexedCountLabel={demo.indexedCountLabel} />
      <Terminal demo={demo} />
      <Pipeline demo={demo} />
      <Features />
      <Cli />
      <Footer />
    </div>
  )
}
