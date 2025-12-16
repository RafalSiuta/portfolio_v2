import './App.css'
import Nav from './components/nav/nav'
import Home from './screens/home/home'
import Projects from './screens/projects/projects'
import About from './screens/about/about'
import Contact from './screens/contact/contact'
import styles from './screens/home/home.module.css'
import Footer from './components/footer/footer'
import SideIndicator from './components/side_indicator/sideIndicator'
import SectionTitle from './components/headers/section_title/secctionTitle'


function App() {
  return (
    <div className={styles.heroPage}>
      
      <Nav />
      <main className={styles.heroMain}>
        <SectionTitle />
        <Home />
        <Projects />
        <About />
        <Contact />
      </main>
      <SideIndicator />
      <Footer />
      
    </div>
  )
}

export default App
