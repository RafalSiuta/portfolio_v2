import { useCallback, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './home.module.css'
import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import heroDesktop from '../../assets/images/hero.jpg'
import heroTablet from '../../assets/images/hero_M.jpg'
import heroMobile from '../../assets/images/hero_S.jpg'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import SmallCard from '../../components/cards/small_card/smallCard'
import IconButton from '../../components/buttons/icon_button/icon_button'
import { useNavContext } from '../../utils/providers/navProvider'
import navLinks from '../../utils/constants/navLinks'

function Home() {
  const { pageCounter, setPageCounter, scrollProgress, setScrollProgress, setScrollDirection, smoother } = useNavContext()
  const dividerRef = useRef(null)
  const utilityRowRef = useRef(null)
  const cardRefs = useRef([])
  const cardWidthsRef = useRef([])
  const gapRef = useRef(0)
  const baseWidthRef = useRef(0)

  const handleNextSection = useCallback(() => {
    const nextIndex = Math.min(pageCounter + 1, navLinks.length - 1)
    if (nextIndex === pageCounter) return

    const nextSectionId = navLinks[nextIndex].href.replace('#', '')
    const nextSection = document.getElementById(nextSectionId)

    setScrollDirection('down')
    const proxy = { value: scrollProgress }
    gsap.to(proxy, {
      value: 100,
      duration: 0.35,
      ease: 'power2.out',
      onUpdate: () => setScrollProgress(Math.round(proxy.value)),
      onComplete: () => {
        setPageCounter(nextIndex)
        if (nextSection) {
          if (smoother) {
            smoother.scrollTo(nextSection, true, 'top top')
          } else {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      },
    })
  }, [pageCounter, scrollProgress, setPageCounter, setScrollProgress, setScrollDirection, smoother])

  const measureDivider = useCallback(() => {
    const rowEl = utilityRowRef.current
    const dividerEl = dividerRef.current
    if (!rowEl || !dividerEl) return

    const stylesComputed = window.getComputedStyle(rowEl)
    const gapValue = parseFloat(stylesComputed.columnGap || stylesComputed.gap || '0') || 0
    gapRef.current = gapValue

    cardWidthsRef.current = cardRefs.current.map((card) => (card ? card.getBoundingClientRect().width : 0))
    if (!cardWidthsRef.current[0]) return

    baseWidthRef.current = cardWidthsRef.current[0] + gapValue
    gsap.set(dividerEl, { width: baseWidthRef.current })
  }, [])

  useEffect(() => {
    measureDivider()
    window.addEventListener('resize', measureDivider)

    return () => {
      window.removeEventListener('resize', measureDivider)
    }
  }, [measureDivider])

  const animateDividerTo = useCallback((targetWidth) => {
    const dividerEl = dividerRef.current
    if (!dividerEl) return

    gsap.to(dividerEl, { width: targetWidth, duration: 0.35, ease: 'power3.out' })
  }, [])

  const resetDivider = useCallback(() => {
    if (!cardWidthsRef.current[0]) return
    const gapValue = gapRef.current
    const fallbackBase = cardWidthsRef.current[0] + gapValue
    const targetWidth = baseWidthRef.current || fallbackBase
    animateDividerTo(targetWidth)
  }, [animateDividerTo])

  const handleCardHover = useCallback((cardIndex) => {
    if (!cardWidthsRef.current[0]) return
    const gapValue = gapRef.current
    const baseWidth = baseWidthRef.current || (cardWidthsRef.current[0] + gapValue)
    const additionalWidth = cardWidthsRef.current
      .slice(1, cardIndex + 1)
      .reduce((total, width) => total + width + gapValue, 0)

    animateDividerTo(baseWidth + additionalWidth)
  }, [animateDividerTo])

  return (
    <HeroWrapper
      id="home"
      images={{ desktop: heroDesktop, tablet: heroTablet, mobile: heroMobile }}
      isLastSection={false}
    >
      <SectionWrapper className={styles.wrapper}>
        <article className={styles.herotext}>
          {/* <SectionTitle /> */}
          <h1 className='strokeText'>r85studio</h1>
          <h2>design & code</h2>
          <p>
            Hi I'm <strong>Rafał</strong>, UI designer and frontend developer.<br/> Technologies are just
            a tools that help us<br /> bring our beautiful <strong>ideas to life.</strong><br /> Check out my
            projects and let me know<br />how <strong>I can help→</strong>
          </p>
          {/* <p>my projects...</p> */}
          <div className={styles.heroDivider} ref={dividerRef} aria-hidden="true" />
          <div className={styles.heroUtilityRow} ref={utilityRowRef} onMouseLeave={resetDivider}>
            <div
              className={styles.cardSlot}
              ref={(el) => { cardRefs.current[0] = el }}
              onMouseEnter={() => handleCardHover(0)}
            >
              <SmallCard label="name" />
            </div>
            <div
              className={styles.cardSlot}
              ref={(el) => { cardRefs.current[1] = el }}
              onMouseEnter={() => handleCardHover(1)}
            >
              <SmallCard label="name" />
            </div>
            <div
              className={styles.cardSlot}
              ref={(el) => { cardRefs.current[2] = el }}
              onMouseEnter={() => handleCardHover(2)}
            >
              <SmallCard label="name" />
            </div>
            <IconButton
              iconName="ArrowThinRight"
              onClick={handleNextSection}
              ariaLabel="Show next content"
              hover="45deg"
              className={styles.heroIconButton}
              iconClassName={styles.heroIcon}
            />
          </div>
        </article>
      </SectionWrapper>
    </HeroWrapper>
  )
}

export default Home
