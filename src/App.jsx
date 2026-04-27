import './App.css'
import { useEffect, useRef } from 'react'
import { matchPath, Route, Routes, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { useGSAP } from '@gsap/react'
import Nav from './components/navigation/nav/nav'
import Footer from './components/footer/footer'
import SideIndicator from './components/navigation/side_indicator/sideIndicator'
import ParticlesBackground from './components/containers/particles/particlesBackground'
import ContactModal from './components/modals/contact_modal/ContactModal'
import Curtain from './components/curtain/curtain'
import Home from './screens/home/home'
import Projects from './screens/projects/projects'
import About from './screens/about/about'
import Contact from './screens/contact/contact'
import R85 from './screens/r85/r85'
import Policy from './screens/policy/policy'
import Qa from './screens/qa/qa'
import Video from './screens/video/video'
import ProjectDetails from './screens/project_details/projectDetails'
import ErrorPage from './screens/404/error_page'
import styles from './screens/home/home.module.css'
import { useNavContext } from './utils/providers/navProvider'
import { ContactProvider } from './utils/providers/contactProvider'
import { usePageTransitionContext } from './utils/providers/pageTransitionProvider'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

function MainLanding() {
  const { scrollToSectionId } = useNavContext()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/') return
    const hashId = location.hash?.replace('#', '')
    if (!hashId) return
    scrollToSectionId(hashId, { immediate: true, updatePageCounter: true })
  }, [location.pathname, location.hash, scrollToSectionId])

  return (
    <>
      <ParticlesBackground
        className="particles-overlay"
        style={{
          '--particles-align': 'stretch',
          '--particles-justify': 'flex-start',
        }}
      />
      <main className={styles.heroMain}>
        <Home />
        <Projects />
        <About />
        <Contact />
      </main>
    </>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLanding />} />
      <Route path="/projects/:projectId" element={<ProjectDetails />} />
      <Route path="/r85" element={<R85 />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/qa" element={<Qa />} />
      <Route path="/video" element={<Video />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}

function AppShell() {
  const {
    isCurtainClosed,
    isDetailRoute,
    handleCurtainClosed,
    handleCurtainOpened,
  } = usePageTransitionContext()
  const { setSmoother, smoother } = useNavContext()
  const location = useLocation()
  const appRef = useRef(null)
  const isProjectDetailRoute = !!matchPath('/projects/:projectId', location.pathname)

  useGSAP(
    () => {
      const nextSmoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1,
        effects: true,
        smoothTouch: 0.1,
      })

      setSmoother(nextSmoother)
      ScrollTrigger.refresh()

      return () => {
        nextSmoother.kill()
        setSmoother(null)
      }
    },
    { scope: appRef }
  )

  useEffect(() => {
    if (!smoother) return

    requestAnimationFrame(() => {
      smoother.refresh()
      ScrollTrigger.refresh()

      if (location.pathname !== '/') {
        smoother.scrollTo(0, false)
      }
    })
  }, [location.pathname, location.hash, smoother])

  return (
    <div className="appShell" ref={appRef}>
      <Nav />
      {!isDetailRoute ? <SideIndicator /> : null}

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <AppRoutes />
        </div>
      </div>

      {!isDetailRoute ? <Footer /> : null}
      {isProjectDetailRoute ? <Footer variant="detail" /> : null}

      <Curtain
        isClosed={isCurtainClosed}
        onClosed={handleCurtainClosed}
        onOpened={handleCurtainOpened}
      />
      <ContactModal />
    </div>
  )
}

function App() {
  return (
    <ContactProvider>
      <AppShell />
    </ContactProvider>
  )
}

export default App
