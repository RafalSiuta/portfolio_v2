import './App.css'
import Nav from './components/nav/nav'
import Home from './screens/home/home'
import Projects from './screens/projects/projects'
import About from './screens/about/about'
import Contact from './screens/contact/contact'
import styles from './screens/home/home.module.css'

function App() {
  return (
    <div className={styles.heroPage}>
      <Nav />
      <main className={styles.heroMain}>
        <Home />
        <Projects />
        <About />
        <Contact />
      </main>
    </div>
  )
}

export default App
