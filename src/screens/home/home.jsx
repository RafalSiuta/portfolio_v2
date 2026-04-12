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
import { useProjectsContext } from '../../utils/providers/projectsProvider'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'

const HOME_SECTION_INDEX = navLinks.findIndex((link) => link.href === '#home')
const HOME_EXIT_PROGRESS_THRESHOLD = 20
const HOME_REENTRY_DELAY_MS = 180

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

function Home() {
  const {
    pageCounter,
    setPageCounter,
    scrollProgress,
    setScrollProgress,
    scrollDirection,
    setScrollDirection,
    smoother,
  } = useNavContext()
  const { t, locale } = useI18n()
  const homeText = getHomeText(t)
  const descriptionLines = homeText.description
    .split(/<br\s*\/?>/i)
    .map((line) => line.trim())
    .filter(Boolean)
  const { projectsList } = useProjectsContext()
  const homeUtilityAnimationKey = projectsList
    .slice(0, 3)
    .map(({ id }, index) => id ?? index)
    .join('|')
  const { navigateToDetail } = usePageTransitionContext()
  const hasTextAnimationEnabledRef = useRef(true)
  const lastAnimatedLocaleRef = useRef(locale)
  const pageCounterRef = useRef(pageCounter)
  const scrollProgressRef = useRef(scrollProgress)
  const scrollDirectionRef = useRef(scrollDirection)
  const textAnimationRef = useRef({
    isReady: false,
    wasActive: false,
    hasAnimatedThisVisit: false,
    hasAnimatedOnce: false,
    hasInitialTriggerPlayed: false,
    delayedCall: null,
    animateIn: () => {},
    animateOut: () => {},
    reset: () => {},
  })
  const utilityAnimationRef = useRef({
    isReady: false,
    wasActive: false,
    hasAnimatedThisVisit: false,
    hasAnimatedOnce: false,
    hasInitialTriggerPlayed: false,
    delayedCall: null,
    animateIn: () => {},
    animateOut: () => {},
    reset: () => {},
  })
  const dividerRef = useRef(null)
  const utilityRowRef = useRef(null)
  const iconButtonWrapperRef = useRef(null)
  const heroTextRef = useRef(null)
  const headingRef = useRef(null)
  const subtitleRef = useRef(null)
  const descriptionRef = useRef(null)
  const descriptionLineRefs = useRef([])
  const cardRefs = useRef([])
  const cardWidthsRef = useRef([])
  const gapRef = useRef(0)
  const baseWidthRef = useRef(0)

  if (lastAnimatedLocaleRef.current !== locale) {
    hasTextAnimationEnabledRef.current = false
    lastAnimatedLocaleRef.current = locale
  }

  pageCounterRef.current = pageCounter
  scrollProgressRef.current = scrollProgress
  scrollDirectionRef.current = scrollDirection
  descriptionLineRefs.current.length = descriptionLines.length

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

  const evaluateTextAnimationState = useCallback(() => {
    const animation = textAnimationRef.current
    if (!animation.isReady) return

    const currentPageCounter = pageCounterRef.current
    const currentScrollProgress = scrollProgressRef.current
    const currentScrollDirection = scrollDirectionRef.current
    const isHomeActive = currentPageCounter === HOME_SECTION_INDEX
    const isLeavingHome = isHomeActive
      && currentScrollDirection === 'down'
      && currentScrollProgress > HOME_EXIT_PROGRESS_THRESHOLD
    const shouldAnimateIn = isHomeActive && !isLeavingHome

    if (!isHomeActive) {
      animation.delayedCall?.kill()
      animation.delayedCall = null

      if (animation.wasActive) {
        animation.hasAnimatedThisVisit = false
        animation.animateOut(currentScrollDirection === 'up' ? 'up' : 'down')
      }

      animation.wasActive = false
      return
    }

    const isReentry = animation.hasAnimatedOnce

    animation.wasActive = true

    if (isLeavingHome) {
      animation.delayedCall?.kill()
      animation.delayedCall = null

      if (animation.hasAnimatedThisVisit) {
        animation.animateOut('down')
        animation.hasAnimatedThisVisit = false
      }
      return
    }

    if (!shouldAnimateIn || animation.hasAnimatedThisVisit || animation.delayedCall) {
      return
    }

    animation.delayedCall = gsap.delayedCall(isReentry ? HOME_REENTRY_DELAY_MS / 1000 : 0, () => {
      animation.animateIn({ isReentry })
      animation.hasAnimatedThisVisit = true
      animation.hasAnimatedOnce = true
      animation.delayedCall = null
    })
  }, [])

  const evaluateUtilityAnimationState = useCallback(() => {
    const animation = utilityAnimationRef.current
    if (!animation.isReady) return

    const currentPageCounter = pageCounterRef.current
    const currentScrollProgress = scrollProgressRef.current
    const currentScrollDirection = scrollDirectionRef.current
    const isHomeActive = currentPageCounter === HOME_SECTION_INDEX
    const isLeavingHome = isHomeActive
      && currentScrollDirection === 'down'
      && currentScrollProgress > HOME_EXIT_PROGRESS_THRESHOLD
    const shouldAnimateIn = isHomeActive && !isLeavingHome

    if (!isHomeActive) {
      animation.delayedCall?.kill()
      animation.delayedCall = null

      if (animation.wasActive) {
        animation.hasAnimatedThisVisit = false
        animation.animateOut(currentScrollDirection === 'up' ? 'up' : 'down')
      }

      animation.wasActive = false
      return
    }

    const isReentry = animation.hasAnimatedOnce
    animation.wasActive = true

    if (isLeavingHome) {
      animation.delayedCall?.kill()
      animation.delayedCall = null

      if (animation.hasAnimatedThisVisit) {
        animation.animateOut('down')
        animation.hasAnimatedThisVisit = false
      }
      return
    }

    if (!shouldAnimateIn || animation.hasAnimatedThisVisit || animation.delayedCall) {
      return
    }

    animation.delayedCall = gsap.delayedCall(isReentry ? HOME_REENTRY_DELAY_MS / 1000 : 0, () => {
      animation.animateIn({ isReentry })
      animation.hasAnimatedThisVisit = true
      animation.hasAnimatedOnce = true
      animation.delayedCall = null
    })
  }, [])

  useGSAP(() => {
    const textRoot = heroTextRef.current
    const headingEl = headingRef.current
    const subtitleEl = subtitleRef.current
    const descriptionEl = descriptionRef.current
    const descriptionLineEls = descriptionLineRefs.current.filter(Boolean)

    if (!textRoot || !headingEl || !subtitleEl || !descriptionEl || !descriptionLineEls.length) return undefined
    if (!hasTextAnimationEnabledRef.current) return undefined

    const splitState = {
      heading: null,
      subtitle: null,
    }
    const splitInstances = []
    let rebuildFrame = null
    let stateEvalFrame = null
    let activeTweens = []
    let initialTrigger = null

    const killMotion = () => {
      activeTweens.forEach((tween) => tween?.kill())
      activeTweens = []
    }

    const getSplitGroups = () => ({
      heading: splitState.heading?.lines ?? [],
      subtitle: splitState.subtitle?.lines ?? [],
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

    const setDescriptionInitialState = () => {
      gsap.set(descriptionLineEls, {
        opacity: 0,
        yPercent: 115,
        willChange: 'transform, opacity',
      })
    }

    const setDescriptionVisibleState = () => {
      gsap.set(descriptionLineEls, {
        opacity: 1,
        yPercent: 0,
        willChange: 'transform, opacity',
      })
    }

    const clearDelayedCall = () => {
      textAnimationRef.current.delayedCall?.kill()
      textAnimationRef.current.delayedCall = null
    }

    const animateDescriptionExit = (direction) => {
      const yPercent = direction === 'down' ? -35 : 35

      return gsap.to(descriptionLineEls, {
        yPercent,
        opacity: 0,
        duration: 0.34,
        ease: 'power2.in',
        stagger: 0.06,
        overwrite: 'auto',
      })
    }

    const animateGroupsIn = (groups, { isReentry = false } = {}) => {
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
          delay: 0.12,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: 'auto',
        }),
        gsap.to(descriptionLineEls, {
          opacity: 1,
          yPercent: 0,
          duration: 0.72,
          delay: isReentry ? 0.38 : 0.28,
          ease: 'power3.out',
          stagger: 0.1,
          overwrite: 'auto',
        }),
      ].filter(Boolean)
    }

    const animateGroupsOut = (groups, direction) => {
      activeTweens.forEach((tween) => tween?.kill())
      const rotationX = direction === 'down' ? 85 : -85
      const yPercent = direction === 'down' ? -110 : 110

      activeTweens = [
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
        animateDescriptionExit(direction),
      ].filter(Boolean)
    }

    const setGroupsVisibleState = (groups) => {
      gsap.set(groups.heading, {
        rotationX: 0,
        yPercent: 0,
        opacity: 1,
        willChange: 'transform, opacity',
      })
      gsap.set(groups.subtitle, {
        rotationX: 0,
        yPercent: 0,
        opacity: 1,
        willChange: 'transform, opacity',
      })
      setDescriptionVisibleState()
    }

    const rebuildTextAnimation = () => {
      rebuildFrame = null
      const groups = getSplitGroups()
      const hasLines = Object.values(groups).some((lines) => lines.length)
      if (!hasLines) return

      killMotion()
      clearDelayedCall()
      const isHomeActive = pageCounterRef.current === HOME_SECTION_INDEX
      const shouldReplayInitialAnimation = textAnimationRef.current.hasAnimatedOnce
        && textAnimationRef.current.hasInitialTriggerPlayed
        && isHomeActive
        && scrollDirectionRef.current === 'down'
        && scrollProgressRef.current <= HOME_EXIT_PROGRESS_THRESHOLD
      const shouldKeepVisibleState = textAnimationRef.current.hasAnimatedOnce
        && textAnimationRef.current.hasInitialTriggerPlayed
        && isHomeActive
        && !shouldReplayInitialAnimation

      if (shouldReplayInitialAnimation) {
        Object.values(groups).forEach(setInitialState)
        setDescriptionInitialState()
      } else if (shouldKeepVisibleState) {
        setGroupsVisibleState(groups)
      } else {
        Object.values(groups).forEach(setInitialState)
        setDescriptionInitialState()
      }

      textAnimationRef.current.isReady = true
      textAnimationRef.current.hasAnimatedThisVisit = shouldKeepVisibleState
      textAnimationRef.current.animateIn = (options) => animateGroupsIn(groups, options)
      textAnimationRef.current.animateOut = (direction) => animateGroupsOut(groups, direction)
      textAnimationRef.current.reset = () => {
        killMotion()
        clearDelayedCall()
        Object.values(groups).forEach(setInitialState)
        setDescriptionInitialState()
      }

      initialTrigger?.kill()
      initialTrigger = ScrollTrigger.create({
        trigger: textRoot,
        start: 'top 78%',
        end: 'bottom 22%',
        once: true,
        onEnter: () => {
          if (textAnimationRef.current.hasInitialTriggerPlayed || textAnimationRef.current.hasAnimatedThisVisit) {
            return
          }
          textAnimationRef.current.hasInitialTriggerPlayed = true
          textAnimationRef.current.hasAnimatedThisVisit = true
          textAnimationRef.current.hasAnimatedOnce = true
          textAnimationRef.current.wasActive = true
          animateGroupsIn(groups, { isReentry: false })
        },
      })

      if (initialTrigger.isActive && !textAnimationRef.current.hasInitialTriggerPlayed) {
        textAnimationRef.current.hasInitialTriggerPlayed = true
        textAnimationRef.current.hasAnimatedThisVisit = true
        textAnimationRef.current.hasAnimatedOnce = true
        textAnimationRef.current.wasActive = true
        animateGroupsIn(groups, { isReentry: false })
      }

      if (stateEvalFrame) {
        window.cancelAnimationFrame(stateEvalFrame)
      }
      stateEvalFrame = window.requestAnimationFrame(() => {
        stateEvalFrame = null
        ScrollTrigger.refresh()

        if (shouldReplayInitialAnimation) {
          textAnimationRef.current.hasAnimatedThisVisit = true
          animateGroupsIn(groups, { isReentry: false })
        }
      })
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

    return () => {
      if (rebuildFrame) {
        window.cancelAnimationFrame(rebuildFrame)
      }
      if (stateEvalFrame) {
        window.cancelAnimationFrame(stateEvalFrame)
      }
      textAnimationRef.current.isReady = false
      textAnimationRef.current.wasActive = false
      textAnimationRef.current.hasAnimatedThisVisit = false
      textAnimationRef.current.hasInitialTriggerPlayed = false
      textAnimationRef.current.animateIn = () => {}
      textAnimationRef.current.animateOut = () => {}
      textAnimationRef.current.reset = () => {}
      initialTrigger?.kill()
      clearDelayedCall()
      killMotion()
      splitInstances.forEach((instance) => instance.revert())
    }
  }, {
    dependencies: [locale, homeText.subtitle, homeText.description],
    revertOnUpdate: true,
  })

  useGSAP(() => {
    const utilityRowEl = utilityRowRef.current
    const dividerEl = dividerRef.current
    const iconButtonWrapperEl = iconButtonWrapperRef.current
    const cardEls = cardRefs.current.slice(0, 3).filter(Boolean)
    const animatedEls = [...cardEls, iconButtonWrapperEl].filter(Boolean)

    if (!utilityRowEl || !dividerEl || !iconButtonWrapperEl || !cardEls.length) return undefined

    let activeTimeline = null
    let initialTrigger = null
    let refreshFrame = null

    const killMotion = () => {
      activeTimeline?.kill()
      activeTimeline = null
    }

    const clearDelayedCall = () => {
      utilityAnimationRef.current.delayedCall?.kill()
      utilityAnimationRef.current.delayedCall = null
    }

    const setInitialState = () => {
      gsap.set(cardEls, {
        opacity: 0,
        scale: 0.9,
        yPercent: 18,
        willChange: 'transform, opacity',
      })
      if (cardEls[0]) {
        gsap.set(cardEls[0], {
          scale: 0.82,
          yPercent: 26,
        })
      }
      gsap.set(dividerEl, {
        scaleX: 0,
        transformOrigin: '0% 50%',
        willChange: 'transform, width',
      })
      gsap.set(iconButtonWrapperEl, {
        opacity: 0,
        scale: 0.9,
        yPercent: 18,
        willChange: 'transform, opacity',
      })
    }

    const setVisibleState = () => {
      gsap.set(animatedEls, {
        opacity: 1,
        scale: 1,
        yPercent: 0,
        willChange: 'transform, opacity',
      })
      gsap.set(dividerEl, {
        scaleX: 1,
        transformOrigin: '0% 50%',
        willChange: 'transform, width',
      })
    }

    const animateIn = ({ isReentry = false } = {}) => {
      killMotion()
      measureDivider()
      activeTimeline = gsap.timeline({ delay: isReentry ? 0.18 : 0 })
      activeTimeline.to(dividerEl, {
        scaleX: 1,
        transformOrigin: '0% 50%',
        duration: 0.54,
        ease: 'power3.out',
        overwrite: 'auto',
      })
      cardEls.forEach((cardEl, index) => {
        activeTimeline.to(cardEl, {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.52,
          ease: 'power3.out',
          overwrite: 'auto',
        }, index === 0 ? '<0.16' : '>-0.26')
      })
      activeTimeline.to(iconButtonWrapperEl, {
        opacity: 1,
        scale: 1,
        yPercent: 0,
        duration: 0.46,
        ease: 'power3.out',
        overwrite: 'auto',
      }, '>')
    }

    const animateOut = (direction) => {
      killMotion()
      const isReverse = direction === 'down'
      const targets = isReverse
        ? [iconButtonWrapperEl, ...cardEls.slice().reverse()]
        : [...cardEls, iconButtonWrapperEl]
      const yPercent = direction === 'down' ? -18 : 18

      activeTimeline = gsap.timeline()
      activeTimeline.to(targets, {
        opacity: 0,
        scale: 0.9,
        yPercent,
        duration: 0.3,
        ease: 'power2.in',
        stagger: 0.08,
        overwrite: 'auto',
      })
      activeTimeline.to(dividerEl, {
        scaleX: 0,
        transformOrigin: '0% 50%',
        duration: 0.28,
        ease: 'power2.in',
        overwrite: 'auto',
      }, '<0.08')
    }

    const isHomeActive = pageCounterRef.current === HOME_SECTION_INDEX
    const shouldReplayInitialAnimation = utilityAnimationRef.current.hasAnimatedOnce
      && utilityAnimationRef.current.hasInitialTriggerPlayed
      && isHomeActive
      && scrollDirectionRef.current === 'down'
      && scrollProgressRef.current <= HOME_EXIT_PROGRESS_THRESHOLD
    const shouldKeepVisibleState = utilityAnimationRef.current.hasAnimatedOnce
      && utilityAnimationRef.current.hasInitialTriggerPlayed
      && isHomeActive
      && !shouldReplayInitialAnimation

    if (shouldReplayInitialAnimation) {
      setInitialState()
    } else if (shouldKeepVisibleState) {
      setVisibleState()
    } else {
      setInitialState()
    }

    utilityAnimationRef.current.isReady = true
    utilityAnimationRef.current.hasAnimatedThisVisit = shouldKeepVisibleState
    utilityAnimationRef.current.animateIn = animateIn
    utilityAnimationRef.current.animateOut = animateOut
    utilityAnimationRef.current.reset = () => {
      killMotion()
      clearDelayedCall()
      setInitialState()
    }

    initialTrigger = ScrollTrigger.create({
      trigger: utilityRowEl,
      start: 'top 82%',
      end: 'bottom 20%',
      once: true,
      onEnter: () => {
        if (utilityAnimationRef.current.hasInitialTriggerPlayed || utilityAnimationRef.current.hasAnimatedThisVisit) {
          return
        }
        utilityAnimationRef.current.hasInitialTriggerPlayed = true
        utilityAnimationRef.current.hasAnimatedThisVisit = true
        utilityAnimationRef.current.hasAnimatedOnce = true
        utilityAnimationRef.current.wasActive = true
        animateIn({ isReentry: false })
      },
    })

    if (initialTrigger.isActive && !utilityAnimationRef.current.hasInitialTriggerPlayed) {
      utilityAnimationRef.current.hasInitialTriggerPlayed = true
      utilityAnimationRef.current.hasAnimatedThisVisit = true
      utilityAnimationRef.current.hasAnimatedOnce = true
      utilityAnimationRef.current.wasActive = true
      animateIn({ isReentry: false })
    }

    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = null
      ScrollTrigger.refresh()

      if (shouldReplayInitialAnimation) {
        utilityAnimationRef.current.hasAnimatedThisVisit = true
        animateIn({ isReentry: false })
      }
    })

    return () => {
      if (refreshFrame) {
        window.cancelAnimationFrame(refreshFrame)
      }
      utilityAnimationRef.current.isReady = false
      utilityAnimationRef.current.wasActive = false
      utilityAnimationRef.current.hasAnimatedThisVisit = false
      utilityAnimationRef.current.hasInitialTriggerPlayed = false
      utilityAnimationRef.current.animateIn = () => {}
      utilityAnimationRef.current.animateOut = () => {}
      utilityAnimationRef.current.reset = () => {}
      initialTrigger?.kill()
      clearDelayedCall()
      killMotion()
    }
  }, {
    dependencies: [measureDivider, homeUtilityAnimationKey],
    revertOnUpdate: true,
  })

  useEffect(() => {
    evaluateTextAnimationState()
    evaluateUtilityAnimationState()
  }, [evaluateTextAnimationState, evaluateUtilityAnimationState, pageCounter, scrollDirection, scrollProgress])

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
            <p ref={descriptionRef} className={styles.description}>
              {descriptionLines.map((line, index) => (
                <span key={`${locale}-description-${index}`} className={styles.descriptionLineMask}>
                  <span
                    className={styles.descriptionLineContent}
                    ref={(el) => {
                      descriptionLineRefs.current[index] = el
                    }}
                    dangerouslySetInnerHTML={{ __html: line }}
                  />
                </span>
              ))}
            </p>
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
            <div ref={iconButtonWrapperRef} className={styles.heroIconButtonSlot}>
              <IconButton
                iconName="ArrowThinRight"
                onClick={handleNextSection}
                ariaLabel="Show next content"
                hover="45deg"
                className={styles.heroIconButton}
                iconClassName={styles.heroIcon}
              />
            </div>
          </div>
        </article>
      </SectionWrapper>
    </HeroWrapper>
  )
}

export default Home
