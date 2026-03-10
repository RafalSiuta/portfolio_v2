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
import R85 from './screens/r85/r85'
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { useNavContext } from "./utils/providers/navProvider";
import { ContactProvider } from "./utils/providers/contactProvider";
import { Route, Routes } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

function MainLanding() {

  const appRef = useRef(null);
  const { setSmoother } = useNavContext();

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

function App() {
  return (
    <ContactProvider>
      <Routes>
        <Route path="/" element={<MainLanding />} />
        <Route path="/r85" element={<R85 />} />
      </Routes>
    </ContactProvider>
  );

}

export default App
