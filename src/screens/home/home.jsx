import { useCallback, useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
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
import { useI18n } from '../../utils/providers/lang/langProvider'
import { getHomeText } from '../../utils/providers/lang/services'
import { toHtml } from '../../utils/convert/stringConvert'
import { useProjectsContext } from '../../utils/providers/projectsProvider'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

function Home() {
  const {
    pageCounter,
    setPageCounter,
    scrollProgress,
    setScrollProgress,
    setScrollDirection,
    smoother,
  } = useNavContext()
  const { t, locale } = useI18n()
  const homeText = getHomeText(t)
  const { projectsList } = useProjectsContext()
  const { navigateToDetail } = usePageTransitionContext()
  const hasTextAnimationEnabledRef = useRef(true)
  const lastAnimatedLocaleRef = useRef(locale)
  const dividerRef = useRef(null)
  const utilityRowRef = useRef(null)
  const heroTextRef = useRef(null)
  const headingRef = useRef(null)
  const subtitleRef = useRef(null)
  const descriptionRef = useRef(null)
  const cardRefs = useRef([])
  const cardWidthsRef = useRef([])
  const gapRef = useRef(0)
  const baseWidthRef = useRef(0)

  if (lastAnimatedLocaleRef.current !== locale) {
    hasTextAnimationEnabledRef.current = false
    lastAnimatedLocaleRef.current = locale
  }

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

  const handleProjectClick = useCallback((projectId) => {
    if (!projectId) return
    navigateToDetail(`/projects/${projectId}`, { fromSectionId: 'home' })
  }, [navigateToDetail])

  useGSAP(() => {
    const textRoot = heroTextRef.current
    const headingEl = headingRef.current
    const subtitleEl = subtitleRef.current
    const descriptionEl = descriptionRef.current

    if (!textRoot || !headingEl || !subtitleEl || !descriptionEl) return undefined
    if (!hasTextAnimationEnabledRef.current) return undefined

    const splitState = {
      heading: null,
      subtitle: null,
      description: null,
    }
    const splitInstances = []
    let rebuildFrame = null
    let activeTweens = []
    let trigger = null

    const killMotion = () => {
      activeTweens.forEach((tween) => tween?.kill())
      activeTweens = []
      trigger?.kill()
      trigger = null
    }

    const getSplitGroups = () => ({
      heading: splitState.heading?.lines ?? [],
      subtitle: splitState.subtitle?.lines ?? [],
      description: splitState.description?.lines ?? [],
    })

    const setInitialState = (lines) => {
      if (!lines.length) return

      gsap.set(lines, {
        transformPerspective: 900,
        transformOrigin: '50% 50% -140px',
        rotationX: -95,
        yPercent: 110,
        opacity: 0,
        willChange: 'transform, opacity',
      })
    }

    const animateGroupsIn = (groups) => {
      activeTweens.forEach((tween) => tween?.kill())
      activeTweens = [
        gsap.to(groups.heading, {
          rotationX: 0,
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: 'auto',
        }),
        gsap.to(groups.subtitle, {
          rotationX: 0,
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          delay: 0.08,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: 'auto',
        }),
        gsap.to(groups.description, {
          rotationX: 0,
          yPercent: 0,
          opacity: 1,
          duration: 0.95,
          delay: 0.16,
          ease: 'power3.out',
          stagger: 0.06,
          overwrite: 'auto',
        }),
      ].filter(Boolean)
    }

    const animateGroupsOut = (groups, direction) => {
      activeTweens.forEach((tween) => tween?.kill())
      const rotationX = direction === 'down' ? 85 : -85
      const yPercent = direction === 'down' ? -110 : 110

      activeTweens = [
        gsap.to(groups.description, {
          rotationX,
          yPercent,
          opacity: 0,
          duration: 0.45,
          ease: 'power2.in',
          stagger: 0.04,
          overwrite: 'auto',
        }),
        gsap.to(groups.subtitle, {
          rotationX,
          yPercent,
          opacity: 0,
          duration: 0.42,
          delay: 0.03,
          ease: 'power2.in',
          stagger: 0.04,
          overwrite: 'auto',
        }),
        gsap.to(groups.heading, {
          rotationX,
          yPercent,
          opacity: 0,
          duration: 0.4,
          delay: 0.06,
          ease: 'power2.in',
          stagger: 0.04,
          overwrite: 'auto',
        }),
      ].filter(Boolean)
    }

    const rebuildTextAnimation = () => {
      rebuildFrame = null
      const groups = getSplitGroups()
      const hasLines = Object.values(groups).some((lines) => lines.length)
      if (!hasLines) return

      killMotion()
      Object.values(groups).forEach(setInitialState)

      trigger = ScrollTrigger.create({
        trigger: textRoot,
        start: 'top 78%',
        end: 'bottom 22%',
        onEnter: () => animateGroupsIn(groups),
        onEnterBack: () => animateGroupsIn(groups),
        onLeave: () => animateGroupsOut(groups, 'down'),
        onLeaveBack: () => animateGroupsOut(groups, 'up'),
      })

      if (trigger.isActive) {
        animateGroupsIn(groups)
      }
    }

    const scheduleRebuild = () => {
      if (rebuildFrame) {
        window.cancelAnimationFrame(rebuildFrame)
      }
      rebuildFrame = window.requestAnimationFrame(rebuildTextAnimation)
    }

    splitInstances.push(
      SplitText.create(headingEl, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          splitState.heading = self
          scheduleRebuild()
        },
      })
    )

    splitInstances.push(
      SplitText.create(subtitleEl, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          splitState.subtitle = self
          scheduleRebuild()
        },
      })
    )

    splitInstances.push(
      SplitText.create(descriptionEl, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          splitState.description = self
          scheduleRebuild()
        },
      })
    )

    return () => {
      if (rebuildFrame) {
        window.cancelAnimationFrame(rebuildFrame)
      }
      killMotion()
      splitInstances.forEach((instance) => instance.revert())
    }
  }, {
    dependencies: [locale, homeText.subtitle, homeText.description],
    revertOnUpdate: true,
  })

  return (
    <HeroWrapper
      id="home"
      images={{ desktop: heroDesktop, tablet: heroTablet, mobile: heroMobile }}
      isLastSection={false}
    >
      <SectionWrapper className={styles.wrapper}>
        <article className={styles.herotext} ref={heroTextRef}>
          {/* <SectionTitle /> */}
          <div key={locale}>
            <h1 className="strokeText" ref={headingRef}>r85studio</h1>
            <h2 ref={subtitleRef}>{homeText.subtitle}</h2>
            <p ref={descriptionRef} dangerouslySetInnerHTML={toHtml(homeText.description)} />
          </div>
          {/* <p>my projects...</p> */}
          <div className={styles.heroDivider} ref={dividerRef} aria-hidden="true" />
          <div className={styles.heroUtilityRow} ref={utilityRowRef} onMouseLeave={resetDivider}>
            {projectsList.slice(0, 3).map(({ title, id, logo }, index) => (
              <div
                key={id ?? index}
                className={styles.cardSlot}
                ref={(el) => { cardRefs.current[index] = el }}
                onMouseEnter={() => handleCardHover(index)}
                onClick={() => handleProjectClick(id)}
              >
                <SmallCard label={title} logo={logo} />
              </div>
            ))}
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
