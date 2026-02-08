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
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { useNavContext } from "./utils/providers/navProvider";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

function App() {

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

      // ważne gdy layout/obrazy się doładują:
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
            <Footer />
          </div>
        </div>
      </div>
    </>
  );

  // return (
  //   <ParticlesBackground
  //     style={{
  //       '--particles-align': 'stretch',
  //       '--particles-justify': 'flex-start',
  //     }}
  //   >
  //     <div className={styles.heroPage}>
  //       <Nav />
  //       <main className={styles.heroMain}>
  //         <Home />
  //         <Projects />
  //         <About />
  //         <Contact />
  //       </main>
  //       <SideIndicator />
  //       <Footer />
  //     </div>
  //   </ParticlesBackground>
  // )
}

export default App
