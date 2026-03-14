import './App.css'
import Nav from './components/nav/nav'
import Home from './screens/home/home'
import Projects from './screens/projects/projects'
import About from './screens/about/about'
import Contact from './screens/contact/contact'
import styles from './screens/home/home.module.css'
import Footer from './components/footer/footer'
import SideIndicator from './components/side_indicator/sideIndicator'
import ParticlesBackground from './components/containers/particles/particlesBackground'
import ContactModal from './components/modals/contact_modal/ContactModal'
import Curtain from './components/curtain/curtain'
import R85 from './screens/r85/r85'
import ProjectDetails from './screens/project_details/projectDetails'
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { useNavContext } from "./utils/providers/navProvider";
import { ContactProvider } from "./utils/providers/contactProvider";
import { Route, Routes, useLocation } from 'react-router-dom'
import { usePageTransitionContext } from './utils/providers/pageTransitionProvider'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

function MainLanding() {

  const appRef = useRef(null);
  const { setSmoother, smoother, scrollToSectionId } = useNavContext();
  const { isDetailRoute } = usePageTransitionContext();
  const location = useLocation();

  useGSAP(
    () => {
      const smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1,
        effects: true,
        smoothTouch: 0.1,
      });

      setSmoother(smoother);

      // waĹĽne gdy layout/obrazy siÄ™ doĹ‚adujÄ…:
      ScrollTrigger.refresh();

      return () => {
        smoother?.kill();
        setSmoother(null);
      };
    },
    { scope: appRef }
  );

  useEffect(() => {
    if (location.pathname !== '/') return
    const hashId = location.hash?.replace('#', '')
    if (!hashId) return
    scrollToSectionId(hashId, { immediate: true, updatePageCounter: true })
  }, [location.pathname, location.hash, scrollToSectionId])

  useEffect(() => {
    if (!smoother || typeof smoother.paused !== 'function') return
    smoother.paused(isDetailRoute)
  }, [isDetailRoute, smoother])

  return (
    <>
      <ParticlesBackground
        className="particles-overlay"
        style={{
          '--particles-align': 'stretch',
          '--particles-justify': 'flex-start',
        }}
      />
      <div ref={appRef} className={styles.heroPage}>
        <Nav />
        <SideIndicator />

        <div id="smooth-wrapper">
          <div id="smooth-content">
            <main className={styles.heroMain}>
              <Home />
              <Projects />
              <About />
              <Contact />
            </main>
          </div>
        </div>
        <Footer />
      </div>
      <ContactModal />
    </>
  );

}

function DetailRoutes() {
  return (
    <Routes>
      <Route path="/projects/:projectId" element={<ProjectDetails />} />
      <Route path="/r85" element={<R85 />} />
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

  const landingClassName = isDetailRoute ? 'landingShell landingShellOverlay' : 'landingShell'

  return (
    <div className="appShell">
      <div className={landingClassName} inert={isDetailRoute}>
        <MainLanding />
        <Curtain
          isClosed={isCurtainClosed}
          onClosed={handleCurtainClosed}
          onOpened={handleCurtainOpened}
        />
      </div>
      {isDetailRoute ? (
        <div className="detailLayer">
          <DetailRoutes />
        </div>
      ) : null}
    </div>
  )
}

function App() {
  return (
    <ContactProvider>
      <AppShell />
    </ContactProvider>
  );

}

export default App
