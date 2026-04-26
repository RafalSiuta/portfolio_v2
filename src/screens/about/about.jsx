import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import styles from './about.module.css'
import ArtCanvas from '../../components/containers/art_canvas/art_canvas'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import IconLink from '../../components/buttons/icon_link/icon_link'
import DascriptionCard from '../../components/cards/description_card/DascriptionCard'
import descriptionCardStyles from '../../components/cards/description_card/dascriptionCard.module.css'
import ChipButton from '../../components/buttons/chip_button/chipButton'
import { toHtml } from '../../utils/convert/stringConvert'
import IconButton from '../../components/buttons/icon_button/icon_button'
import { useNavContext } from '../../utils/providers/navProvider'
import navLinks from '../../utils/constants/navLinks'
import { useI18n } from '../../utils/providers/lang/langProvider'
import { getAboutText } from '../../utils/providers/lang/services'

const ABOUT_SECTION_INDEX = navLinks.findIndex((link) => link.href === '#about')
const ABOUT_EXIT_PROGRESS_THRESHOLD = 20
const ABOUT_REENTRY_DELAY_MS = 180
const ABOUT_DETAILS_TRIGGER_START = 0.82

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

const logAboutDebug = () => {}

const iconsList = [
  { link: 'https://www.google.com/maps/place/Piotrkowska,+90-001+%C5%81%C3%B3d%C5%BA/@51.7605719,19.4582415,3a,75y,90t/data=!3m8!1e2!3m6!1sCIHM0ogKEICAgIC2w7bERQ!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgps-cs-s%2FAHVAwerFrfAfvQFomYqgLypUAAGS9acbDIpjl2tu226Sn2Rqnxyjgre9rFO1gsBBKqY41XRfuCbQERWqODRcjP44qV07Dhf85R6SEzbay7kJXg-1ciyuDg0TGVX1Q6KePnVzTSx2JW4g%3Dw203-h119-k-no!7i5559!8i3266!4m17!1m9!3m8!1s0x471a34d6b72fc851:0x96dbeb8c2cd474b0!2zUGlvdHJrb3dza2EsIDkwLTAwMSDFgcOzZMW6!3b1!8m2!3d51.7605694!4d19.458271!10e5!16s%2Fm%2F02rrybm!3m6!1s0x471a34d6b72fc851:0x96dbeb8c2cd474b0!8m2!3d51.7605694!4d19.458271!10e5!16s%2Fm%2F02rrybm?authuser=0&entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoKLDEwMDc5MjA3M0gBUAM%3D', name: 'LDZ', label: '??d?' },
  { link: 'https://linkedin.com/in/rafal-siuta-3023ba323', name: 'Linkedin', label: 'LinkedIn' },
  { link: 'https://github.com/RafalSiuta', name: 'Github', label: 'GitHub' },
  { link: '#', name: 'Play', label: 'Odtworz' },
]

export default function About() {
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
  const aboutText = getAboutText(t)
  const serviceDescriptionList = aboutText.service.services
  const aboutDescriptionList = aboutText.service.edu.educations
  const aboutDescriptionLines = aboutText.about.description
    .split(/<br\s*\/?>/i)
    .map((line) => line.trim())
    .filter(Boolean)
  const pageCounterRef = useRef(pageCounter)
  const scrollProgressRef = useRef(scrollProgress)
  const scrollDirectionRef = useRef(scrollDirection)
  const initialHashRef = useRef(typeof window !== 'undefined' ? window.location.hash : '')
  const lastLocaleRef = useRef(locale)
  const shouldAnimateLocaleChangeRef = useRef(false)
  const welcomeRef = useRef(null)
  const welcomeHeadingRef = useRef(null)
  const welcomeDescriptionRef = useRef(null)
  const welcomeDescriptionLineRefs = useRef([])
  const artCanvasAnimationRef = useRef(null)
  const socialListRef = useRef(null)
  const serviceHeadingRef = useRef(null)
  const educationHeadingRef = useRef(null)
  const serviceCardRefs = useRef([])
  const educationCardRefs = useRef([])
  const nextPageRowRef = useRef(null)
  const renderTimeRef = useRef(typeof performance !== 'undefined' ? Math.round(performance.now()) : 0)
  const reloadTypeRef = useRef(
    typeof performance !== 'undefined'
      ? performance.getEntriesByType('navigation')?.[0]?.type ?? 'unknown'
      : 'unknown'
  )
  const welcomeAnimationRef = useRef({
    isReady: false,
    wasActive: false,
    hasAnimatedThisVisit: false,
    hasAnimatedOnce: false,
    hasInitialTriggerPlayed: false,
    delayedCall: null,
    animateIn: () => {},
    animateOut: () => {},
  })

  if (lastLocaleRef.current !== locale) {
    shouldAnimateLocaleChangeRef.current = true
    lastLocaleRef.current = locale
  }

  pageCounterRef.current = pageCounter
  scrollProgressRef.current = scrollProgress
  scrollDirectionRef.current = scrollDirection
  welcomeDescriptionLineRefs.current.length = aboutDescriptionLines.length
  serviceCardRefs.current.length = serviceDescriptionList.length
  educationCardRefs.current.length = aboutDescriptionList.length

  useLayoutEffect(() => {
    if (initialHashRef.current !== '#about' && window.location.hash !== '#about') return

    pageCounterRef.current = ABOUT_SECTION_INDEX
    scrollProgressRef.current = 0
    scrollDirectionRef.current = 'down'

    setPageCounter(ABOUT_SECTION_INDEX)
    setScrollProgress(0)
    setScrollDirection('down')
    window.history.replaceState(null, '', '/#about')
  }, [setPageCounter, setScrollDirection, setScrollProgress])

  useEffect(() => {
    logAboutDebug('mount', {
      reloadType: reloadTypeRef.current,
      renderTime: renderTimeRef.current,
      initialHash: initialHashRef.current,
      currentHash: window.location.hash,
      pageCounter: pageCounterRef.current,
      scrollProgress: scrollProgressRef.current,
      scrollDirection: scrollDirectionRef.current,
      sectionIndex: ABOUT_SECTION_INDEX,
    })

    return () => {
      logAboutDebug('unmount', {
        currentHash: window.location.hash,
        pageCounter: pageCounterRef.current,
        scrollProgress: scrollProgressRef.current,
        scrollDirection: scrollDirectionRef.current,
      })
    }
  }, [])

  useEffect(() => {
    logAboutDebug('nav-state-change', {
      currentHash: window.location.hash,
      initialHash: initialHashRef.current,
      pageCounter,
      scrollProgress,
      scrollDirection,
      isAboutCounter: pageCounter === ABOUT_SECTION_INDEX,
    })
  }, [pageCounter, scrollDirection, scrollProgress])

  const evaluateWelcomeAnimationState = useCallback(() => {
    const animation = welcomeAnimationRef.current
    if (!animation.isReady) return

    const welcomeEl = welcomeRef.current
    const firstDetailsHeadingEl = serviceHeadingRef.current
    const isWelcomeVisible = welcomeEl
      ? welcomeEl.getBoundingClientRect().top < window.innerHeight * 0.78
        && welcomeEl.getBoundingClientRect().bottom > window.innerHeight * 0.22
      : false
    const hasReachedFirstDetails = firstDetailsHeadingEl
      ? firstDetailsHeadingEl.getBoundingClientRect().top <= window.innerHeight * ABOUT_DETAILS_TRIGGER_START
      : false
    const isAboutHash = window.location.hash === '#about' || initialHashRef.current === '#about'
    const currentPageCounter = pageCounterRef.current
    const currentScrollProgress = scrollProgressRef.current
    const currentScrollDirection = scrollDirectionRef.current
    const isAboutActive = currentPageCounter === ABOUT_SECTION_INDEX || (isAboutHash && isWelcomeVisible)
    const isLeavingAbout = isAboutActive
      && currentPageCounter === ABOUT_SECTION_INDEX
      && hasReachedFirstDetails
    const shouldAnimateIn = isAboutActive && !isLeavingAbout

    logAboutDebug('evaluate-welcome', {
      currentHash: window.location.hash,
      initialHash: initialHashRef.current,
      currentPageCounter,
      currentScrollProgress,
      currentScrollDirection,
      isWelcomeVisible,
      hasReachedFirstDetails,
      isAboutHash,
      isAboutActive,
      isLeavingAbout,
      shouldAnimateIn,
      isReady: animation.isReady,
      wasActive: animation.wasActive,
      hasAnimatedThisVisit: animation.hasAnimatedThisVisit,
      hasAnimatedOnce: animation.hasAnimatedOnce,
      hasInitialTriggerPlayed: animation.hasInitialTriggerPlayed,
      hasDelayedCall: !!animation.delayedCall,
    })

    if (!isAboutActive) {
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

    if (isLeavingAbout) {
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

    const reentryDelay = isReentry && currentScrollDirection !== 'up'
      ? ABOUT_REENTRY_DELAY_MS / 1000
      : 0

    animation.delayedCall = gsap.delayedCall(reentryDelay, () => {
      logAboutDebug('evaluate-animate-in', {
        isReentry,
        reentryDelay,
        currentHash: window.location.hash,
        initialHash: initialHashRef.current,
        pageCounter: pageCounterRef.current,
        scrollProgress: scrollProgressRef.current,
      })
      animation.animateIn({ isReentry })
      animation.hasAnimatedThisVisit = true
      animation.hasAnimatedOnce = true
      animation.delayedCall = null
    })
  }, [])

  const handleNextSection = useCallback(() => {
    const lastIndex = navLinks.length - 1
    const nextIndex = Math.min(pageCounter + 1, lastIndex)
    const contactIndex = lastIndex
    const contactSectionId = navLinks[contactIndex].href.replace('#', '')
    const contactSection = document.getElementById(contactSectionId)
    const isContactTarget = nextIndex === contactIndex

    const scrollContactToBottom = () => {
      if (!contactSection) return
      if (smoother) {
        smoother.scrollTo(contactSection, true, 'bottom bottom')
        return
      }
      const sectionTop = contactSection.getBoundingClientRect().top + window.scrollY
      const sectionBottom = sectionTop + contactSection.offsetHeight
      const target = Math.max(sectionBottom - window.innerHeight, sectionTop)
      window.scrollTo({ top: target, behavior: 'smooth' })
    }

    if (nextIndex === pageCounter) {
      if (isContactTarget) {
        scrollContactToBottom()
      }
      return
    }

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
        if (isContactTarget) {
          scrollContactToBottom()
          return
        }
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

  const handleArtCanvasReady = useCallback((controls) => {
    artCanvasAnimationRef.current = controls
  }, [])

  const handleArtCanvasClick = useCallback((_event, canvasInstance) => {
    canvasInstance?.startArcAnimation?.()
  }, [])

  useGSAP(() => {
    const welcomeEl = welcomeRef.current
    const headingEl = welcomeHeadingRef.current
    const descriptionEl = welcomeDescriptionRef.current
    const socialListEl = socialListRef.current
    const descriptionLineEls = welcomeDescriptionLineRefs.current.filter(Boolean)

    if (!welcomeEl || !headingEl || !descriptionEl || !descriptionLineEls.length || !socialListEl) return undefined

    const splitState = {
      heading: null,
    }
    const splitInstances = []
    const socialItems = Array.from(socialListEl.children)
    let rebuildFrame = null
    let stateEvalFrame = null
    let activeTimeline = null
    let initialTrigger = null

    const getTextTargets = () => [
      ...(splitState.heading?.lines ?? []),
      ...descriptionLineEls,
    ]

    const killMotion = () => {
      activeTimeline?.kill()
      activeTimeline = null
      gsap.killTweensOf([...getTextTargets(), ...socialItems])
    }

    const clearDelayedCall = () => {
      welcomeAnimationRef.current.delayedCall?.kill()
      welcomeAnimationRef.current.delayedCall = null
    }

    const setArtCanvasInitialState = () => {
      artCanvasAnimationRef.current?.reset?.(0)
    }

    const setArtCanvasVisibleState = () => {
      artCanvasAnimationRef.current?.reset?.(1)
    }

    const animateArtCanvasIn = () => {
      artCanvasAnimationRef.current?.start?.({ restart: true, direction: 'forward' })
    }

    const animateArtCanvasOut = () => {
      artCanvasAnimationRef.current?.start?.({ restart: true, direction: 'backward' })
    }

    const setInitialState = ({ includeArtCanvas = true } = {}) => {
      gsap.set(getTextTargets(), {
        opacity: 0,
        yPercent: 65,
        willChange: 'transform, opacity',
      })
      gsap.set(socialItems, {
        autoAlpha: 0,
        scale: 0.8,
        yPercent: 16,
        willChange: 'transform, opacity',
      })
      if (socialItems[0]) {
        gsap.set(socialItems[0], { scale: 0.72, yPercent: 24 })
      }
      if (includeArtCanvas) {
        setArtCanvasInitialState()
      }
    }

    const setVisibleState = () => {
      gsap.set(getTextTargets(), {
        opacity: 1,
        yPercent: 0,
        willChange: 'transform, opacity',
      })
      gsap.set(socialItems, {
        autoAlpha: 1,
        scale: 1,
        yPercent: 0,
        willChange: 'transform, opacity',
      })
      setArtCanvasVisibleState()
    }

    const animateIn = ({ isReentry = false } = {}) => {
      killMotion()
      const textTargets = getTextTargets()
      animateArtCanvasIn()
      logAboutDebug('animate-in-start', {
        source: 'welcome',
        isReentry,
        currentHash: window.location.hash,
        initialHash: initialHashRef.current,
        pageCounter: pageCounterRef.current,
        scrollProgress: scrollProgressRef.current,
        textTargets: textTargets.length,
        socialItems: socialItems.length,
      })
      activeTimeline = gsap.timeline({ delay: isReentry ? 0.14 : 0 })
      activeTimeline
        .to(textTargets, {
          opacity: 1,
          yPercent: 0,
          duration: 0.62,
          ease: 'power3.out',
          stagger: 0.07,
          overwrite: 'auto',
        })
        .to(socialItems, {
          autoAlpha: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.08,
          overwrite: 'auto',
        }, '<0.22')
    }

    const animateLocaleTextIn = () => {
      killMotion()
      const textTargets = getTextTargets()
      logAboutDebug('locale-animate-in-start', {
        currentHash: window.location.hash,
        initialHash: initialHashRef.current,
        pageCounter: pageCounterRef.current,
        scrollProgress: scrollProgressRef.current,
        textTargets: textTargets.length,
        socialItems: socialItems.length,
      })
      gsap.set(textTargets, { opacity: 0, yPercent: 42 })
      gsap.set(socialItems, { autoAlpha: 0, scale: 0.8, yPercent: 16 })

      activeTimeline = gsap.timeline()
      activeTimeline
        .to(textTargets, {
          opacity: 1,
          yPercent: 0,
          duration: 0.54,
          ease: 'power3.out',
          stagger: 0.06,
          overwrite: 'auto',
        })
        .to(socialItems, {
          autoAlpha: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.42,
          ease: 'power3.out',
          stagger: 0.06,
          overwrite: 'auto',
        }, '<0.18')
    }

    const animateOut = (direction) => {
      killMotion()
      animateArtCanvasOut()
      const yPercent = direction === 'down' ? -24 : 24
      const socialTargets = direction === 'down' ? socialItems.slice().reverse() : socialItems

      logAboutDebug('animate-out-start', {
        direction,
        currentHash: window.location.hash,
        initialHash: initialHashRef.current,
        pageCounter: pageCounterRef.current,
        scrollProgress: scrollProgressRef.current,
      })

      activeTimeline = gsap.timeline()
      activeTimeline
        .to(socialTargets, {
          autoAlpha: 0,
          scale: 0.8,
          yPercent,
          duration: 0.28,
          ease: 'power2.in',
          stagger: 0.05,
          overwrite: 'auto',
        })
        .to(getTextTargets(), {
          opacity: 0,
          yPercent,
          duration: 0.34,
          ease: 'power2.in',
          stagger: 0.04,
          overwrite: 'auto',
        }, '<0.04')
    }

    const rebuildAnimation = () => {
      rebuildFrame = null
      if (!getTextTargets().length) return

      killMotion()
      clearDelayedCall()

      const isWelcomeVisible = welcomeEl.getBoundingClientRect().top < window.innerHeight * 0.78
        && welcomeEl.getBoundingClientRect().bottom > window.innerHeight * 0.22
      const firstDetailsHeadingEl = serviceHeadingRef.current
      const hasReachedFirstDetails = firstDetailsHeadingEl
        ? firstDetailsHeadingEl.getBoundingClientRect().top <= window.innerHeight * ABOUT_DETAILS_TRIGGER_START
        : false
      const isAboutHash = window.location.hash === '#about' || initialHashRef.current === '#about'
      const isAboutActive = pageCounterRef.current === ABOUT_SECTION_INDEX
        || (isAboutHash && isWelcomeVisible)
      const shouldAnimateLocaleChange = shouldAnimateLocaleChangeRef.current
        && welcomeAnimationRef.current.hasAnimatedOnce
        && isAboutActive
      const shouldReplayInitialAnimation = !shouldAnimateLocaleChange
        && welcomeAnimationRef.current.hasAnimatedOnce
        && welcomeAnimationRef.current.hasInitialTriggerPlayed
        && isAboutActive
        && scrollDirectionRef.current === 'down'
        && scrollProgressRef.current <= ABOUT_EXIT_PROGRESS_THRESHOLD
      const shouldKeepVisibleState = welcomeAnimationRef.current.hasAnimatedOnce
        && welcomeAnimationRef.current.hasInitialTriggerPlayed
        && isAboutActive
        && !hasReachedFirstDetails
        && !shouldReplayInitialAnimation

      logAboutDebug('rebuild-welcome', {
        currentHash: window.location.hash,
        initialHash: initialHashRef.current,
        pageCounter: pageCounterRef.current,
        scrollProgress: scrollProgressRef.current,
        scrollDirection: scrollDirectionRef.current,
        isWelcomeVisible,
        hasReachedFirstDetails,
        isAboutHash,
        isAboutActive,
        shouldAnimateLocaleChange,
        shouldReplayInitialAnimation,
        shouldKeepVisibleState,
        hasAnimatedThisVisit: welcomeAnimationRef.current.hasAnimatedThisVisit,
        hasAnimatedOnce: welcomeAnimationRef.current.hasAnimatedOnce,
        hasInitialTriggerPlayed: welcomeAnimationRef.current.hasInitialTriggerPlayed,
        textTargets: getTextTargets().length,
      })

      shouldAnimateLocaleChangeRef.current = false

      if (shouldAnimateLocaleChange) {
        setInitialState({ includeArtCanvas: false })
      } else if (shouldKeepVisibleState) {
        setVisibleState()
      } else {
        setInitialState()
      }

      welcomeAnimationRef.current.isReady = true
      welcomeAnimationRef.current.hasAnimatedThisVisit = shouldKeepVisibleState || shouldAnimateLocaleChange
      welcomeAnimationRef.current.animateIn = animateIn
      welcomeAnimationRef.current.animateOut = animateOut

      initialTrigger?.kill()
      initialTrigger = ScrollTrigger.create({
        trigger: welcomeEl,
        start: 'top 78%',
        end: 'bottom 22%',
        once: true,
        onEnter: () => {
          logAboutDebug('initial-trigger-enter', {
            currentHash: window.location.hash,
            initialHash: initialHashRef.current,
            pageCounter: pageCounterRef.current,
            scrollProgress: scrollProgressRef.current,
            hasInitialTriggerPlayed: welcomeAnimationRef.current.hasInitialTriggerPlayed,
            hasAnimatedThisVisit: welcomeAnimationRef.current.hasAnimatedThisVisit,
          })
          if (welcomeAnimationRef.current.hasInitialTriggerPlayed || welcomeAnimationRef.current.hasAnimatedThisVisit) {
            return
          }
          welcomeAnimationRef.current.hasInitialTriggerPlayed = true
          welcomeAnimationRef.current.hasAnimatedThisVisit = true
          welcomeAnimationRef.current.hasAnimatedOnce = true
          welcomeAnimationRef.current.wasActive = true
          animateIn({ isReentry: false })
        },
      })

      if (initialTrigger.isActive && !welcomeAnimationRef.current.hasInitialTriggerPlayed) {
        logAboutDebug('initial-trigger-already-active', {
          currentHash: window.location.hash,
          initialHash: initialHashRef.current,
          pageCounter: pageCounterRef.current,
          scrollProgress: scrollProgressRef.current,
        })
        welcomeAnimationRef.current.hasInitialTriggerPlayed = true
        welcomeAnimationRef.current.hasAnimatedThisVisit = true
        welcomeAnimationRef.current.hasAnimatedOnce = true
        welcomeAnimationRef.current.wasActive = true
        animateIn({ isReentry: false })
      }

      if (shouldAnimateLocaleChange) {
        welcomeAnimationRef.current.hasInitialTriggerPlayed = true
        welcomeAnimationRef.current.hasAnimatedOnce = true
        welcomeAnimationRef.current.wasActive = true
      }

      stateEvalFrame = window.requestAnimationFrame(() => {
        stateEvalFrame = null
        ScrollTrigger.refresh()
        if (shouldAnimateLocaleChange) {
          welcomeAnimationRef.current.hasAnimatedThisVisit = true
          animateLocaleTextIn()
        } else if (shouldReplayInitialAnimation) {
          welcomeAnimationRef.current.hasAnimatedThisVisit = true
          animateIn({ isReentry: false })
        } else if (!welcomeAnimationRef.current.hasInitialTriggerPlayed) {
          logAboutDebug('state-frame-evaluate-request', {
            currentHash: window.location.hash,
            initialHash: initialHashRef.current,
            pageCounter: pageCounterRef.current,
            scrollProgress: scrollProgressRef.current,
          })
          evaluateWelcomeAnimationState()
        }
      })
    }

    const scheduleRebuild = () => {
      if (rebuildFrame) {
        window.cancelAnimationFrame(rebuildFrame)
      }
      rebuildFrame = window.requestAnimationFrame(rebuildAnimation)
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

    return () => {
      if (rebuildFrame) {
        window.cancelAnimationFrame(rebuildFrame)
      }
      if (stateEvalFrame) {
        window.cancelAnimationFrame(stateEvalFrame)
      }
      welcomeAnimationRef.current.isReady = false
      welcomeAnimationRef.current.wasActive = false
      welcomeAnimationRef.current.hasAnimatedThisVisit = false
      welcomeAnimationRef.current.hasInitialTriggerPlayed = false
      welcomeAnimationRef.current.animateIn = () => {}
      welcomeAnimationRef.current.animateOut = () => {}
      initialTrigger?.kill()
      clearDelayedCall()
      killMotion()
      splitInstances.forEach((instance) => instance.revert())
    }
  }, {
    dependencies: [
      locale,
      aboutText.about.title,
      aboutText.about.description,
      aboutDescriptionLines.length,
      evaluateWelcomeAnimationState,
    ],
    revertOnUpdate: true,
  })

  useEffect(() => {
    const isAboutEntry = window.location.hash === '#about' || initialHashRef.current === '#about'
    logAboutDebug('hash-bootstrap-effect', {
      isAboutEntry,
      currentHash: window.location.hash,
      initialHash: initialHashRef.current,
      pageCounter: pageCounterRef.current,
      scrollProgress: scrollProgressRef.current,
      smootherReady: !!smoother,
    })
    if (!isAboutEntry) return undefined

    let attempt = 0
    let frameId = null
    let delayedCall = null
    let hasAlignedAboutScroll = false

    const alignAboutScroll = () => {
      if (hasAlignedAboutScroll) return

      const aboutSection = document.getElementById('about')
      if (!aboutSection) return

      hasAlignedAboutScroll = true
      logAboutDebug('hash-bootstrap-align-scroll', {
        smootherReady: !!smoother,
        currentHash: window.location.hash,
        initialHash: initialHashRef.current,
        pageCounter: pageCounterRef.current,
        scrollProgress: scrollProgressRef.current,
      })

      if (smoother) {
        smoother.scrollTo(aboutSection, false, 'top top')
      } else {
        aboutSection.scrollIntoView({ behavior: 'auto', block: 'start' })
      }

      ScrollTrigger.refresh()
    }

    const isWelcomeInViewport = () => {
      const welcomeEl = welcomeRef.current
      if (!welcomeEl) return false

      const rect = welcomeEl.getBoundingClientRect()
      return rect.top < window.innerHeight * 0.78
        && rect.bottom > window.innerHeight * 0.22
    }

    const scheduleNextCheck = () => {
      attempt += 1
      if (attempt > 14) {
        logAboutDebug('hash-bootstrap-stop-max-attempts', {
          currentHash: window.location.hash,
          initialHash: initialHashRef.current,
          pageCounter: pageCounterRef.current,
          scrollProgress: scrollProgressRef.current,
        })
        return
      }

      delayedCall = gsap.delayedCall(attempt < 4 ? 0.06 : 0.12, () => {
        frameId = window.requestAnimationFrame(runHashEntryCheck)
      })
    }

    const runHashEntryCheck = () => {
      frameId = null
      delayedCall = null

      const animation = welcomeAnimationRef.current
      alignAboutScroll()

      logAboutDebug('hash-bootstrap-check', {
        attempt,
        currentHash: window.location.hash,
        initialHash: initialHashRef.current,
        pageCounter: pageCounterRef.current,
        scrollProgress: scrollProgressRef.current,
        isReady: animation.isReady,
        isWelcomeInViewport: isWelcomeInViewport(),
        hasAnimatedThisVisit: animation.hasAnimatedThisVisit,
        hasDelayedCall: !!animation.delayedCall,
      })

      if (!animation.isReady) {
        scheduleNextCheck()
        return
      }

      ScrollTrigger.refresh()

      if (!isWelcomeInViewport()) {
        scheduleNextCheck()
        return
      }

      if (animation.hasAnimatedThisVisit || animation.delayedCall) {
        logAboutDebug('hash-bootstrap-skip-already-animated', {
          hasAnimatedThisVisit: animation.hasAnimatedThisVisit,
          hasDelayedCall: !!animation.delayedCall,
        })
        return
      }

      logAboutDebug('hash-bootstrap-animate-in', {
        currentHash: window.location.hash,
        initialHash: initialHashRef.current,
        pageCounter: pageCounterRef.current,
        scrollProgress: scrollProgressRef.current,
      })
      animation.wasActive = true
      animation.hasInitialTriggerPlayed = true
      animation.hasAnimatedThisVisit = true
      animation.hasAnimatedOnce = true
      animation.animateIn({ isReentry: false })
    }

    frameId = window.requestAnimationFrame(runHashEntryCheck)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
      delayedCall?.kill()
    }
  }, [smoother])

  useGSAP(() => {
    const sectionHeadings = [serviceHeadingRef.current, educationHeadingRef.current].filter(Boolean)
    const cardEls = [...serviceCardRefs.current, ...educationCardRefs.current].filter(Boolean)
    const nextPageRowEl = nextPageRowRef.current
    const triggers = []
    const timelines = []

    const getCardParts = (cardEl) => {
      const title = cardEl.querySelector('h2')
      const divider = cardEl.querySelector('span')
      const bodyText = cardEl.querySelector('p, ul')
      const chipEls = Array.from(cardEl.querySelectorAll('button, a'))
      return {
        title,
        divider,
        bodyTargets: [divider, bodyText, ...chipEls].filter(Boolean),
        chipEls,
      }
    }

    const animateHeadingIn = (headingEl) => {
      gsap.killTweensOf(headingEl)
      return gsap.to(headingEl, {
        opacity: 1,
        yPercent: 0,
        duration: 0.52,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }

    const animateHeadingOut = (headingEl, direction) => {
      gsap.killTweensOf(headingEl)
      return gsap.to(headingEl, {
        opacity: 0,
        yPercent: direction === 'down' ? -24 : 24,
        duration: 0.28,
        ease: 'power2.in',
        overwrite: 'auto',
      })
    }

    sectionHeadings.forEach((headingEl) => {
      gsap.set(headingEl, {
        opacity: 0,
        yPercent: 42,
        willChange: 'transform, opacity',
      })

      triggers.push(ScrollTrigger.create({
        trigger: headingEl,
        start: 'top 82%',
        end: 'bottom 18%',
        onEnter: () => animateHeadingIn(headingEl),
        onEnterBack: () => animateHeadingIn(headingEl),
        onLeave: () => animateHeadingOut(headingEl, 'down'),
        onLeaveBack: () => animateHeadingOut(headingEl, 'up'),
      }))
    })

    cardEls.forEach((cardEl) => {
      const { title, bodyTargets, chipEls } = getCardParts(cardEl)
      const allTargets = [title, ...bodyTargets].filter(Boolean)

      gsap.set(title, {
        opacity: 0,
        willChange: 'opacity',
      })
      gsap.set(bodyTargets, {
        opacity: 0,
        yPercent: 42,
        willChange: 'transform, opacity',
      })
      if (chipEls.length) {
        gsap.set(chipEls, {
          scale: 0.9,
          yPercent: 18,
        })
      }

      const animateIn = () => {
        gsap.killTweensOf(allTargets)
        const timeline = gsap.timeline()
        timelines.push(timeline)
        timeline
          .to(title, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto',
          })
          .to(bodyTargets, {
            opacity: 1,
            yPercent: 0,
            scale: 1,
            duration: 0.52,
            ease: 'power3.out',
            stagger: 0.06,
            overwrite: 'auto',
          }, '<0.1')
      }

      const animateOut = (direction) => {
        gsap.killTweensOf(allTargets)
        const yPercent = direction === 'down' ? -24 : 24
        const timeline = gsap.timeline()
        timelines.push(timeline)
        timeline
          .to(bodyTargets.slice().reverse(), {
            opacity: 0,
            yPercent,
            scale: 0.96,
            duration: 0.28,
            ease: 'power2.in',
            stagger: 0.04,
            overwrite: 'auto',
          })
          .to(title, {
            opacity: 0,
            duration: 0.24,
            ease: 'power2.in',
            overwrite: 'auto',
          }, '<0.04')
      }

      triggers.push(ScrollTrigger.create({
        trigger: cardEl,
        start: 'top 82%',
        end: 'bottom 18%',
        onEnter: animateIn,
        onEnterBack: animateIn,
        onLeave: () => animateOut('down'),
        onLeaveBack: () => animateOut('up'),
      }))
    })

    if (nextPageRowEl) {
      gsap.set(nextPageRowEl, {
        opacity: 0,
        scale: 0.9,
        yPercent: 18,
        willChange: 'transform, opacity',
      })
      triggers.push(ScrollTrigger.create({
        trigger: nextPageRowEl,
        start: 'top 88%',
        end: 'bottom 12%',
        onEnter: () => gsap.to(nextPageRowEl, {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.44,
          ease: 'power3.out',
          overwrite: 'auto',
        }),
        onEnterBack: () => gsap.to(nextPageRowEl, {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.44,
          ease: 'power3.out',
          overwrite: 'auto',
        }),
        onLeaveBack: () => gsap.to(nextPageRowEl, {
          opacity: 0,
          scale: 0.9,
          yPercent: 18,
          duration: 0.28,
          ease: 'power2.in',
          overwrite: 'auto',
        }),
      }))
    }

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.cancelAnimationFrame(refreshFrame)
      triggers.forEach((trigger) => trigger.kill())
      timelines.forEach((timeline) => timeline.kill())
      gsap.killTweensOf([
        ...sectionHeadings,
        ...cardEls.flatMap((cardEl) => {
          const { title, bodyTargets } = getCardParts(cardEl)
          return [title, ...bodyTargets].filter(Boolean)
        }),
        nextPageRowEl,
      ].filter(Boolean))
    }
  }, {
    dependencies: [
      locale,
      aboutText.service.title,
      aboutText.service.edu.title,
      serviceDescriptionList,
      aboutDescriptionList,
    ],
    revertOnUpdate: true,
  })

  useEffect(() => {
    evaluateWelcomeAnimationState()
  }, [evaluateWelcomeAnimationState, pageCounter, scrollDirection, scrollProgress])

  return (
    <section id="about" className={styles.particlesBackground}>
      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content}>
          <article className={styles.welcome_text} ref={welcomeRef}>
            <div key={`${locale}-about-welcome`}>
              <h1 className='strokeText' ref={welcomeHeadingRef}>{aboutText.about.title}</h1>
              <p ref={welcomeDescriptionRef}>
                {aboutDescriptionLines.map((line, index) => (
                  <span key={`${locale}-about-description-${index}`} className={styles.descriptionLineMask}>
                    <span
                      className={styles.descriptionLineContent}
                      ref={(el) => {
                        welcomeDescriptionLineRefs.current[index] = el
                      }}
                      dangerouslySetInnerHTML={{ __html: line }}
                    />
                  </span>
                ))}
              </p>
            </div>
            <div className={styles.socialList} ref={socialListRef}>
              {iconsList.map(({ link, name, label }) => (
                <IconLink key={name} link={link} iconName={name} label={label} />
              ))}
            </div>
          </article>
          <div className={styles.art_canvas}>
            <ArtCanvas onAnimationReady={handleArtCanvasReady} onClick={handleArtCanvasClick} />
          </div>
        </div>
        <div className={styles.detailsContainer}>
            <h2 className='strokeText' ref={serviceHeadingRef}>{aboutText.service.title}</h2>
          
            {
              serviceDescriptionList.map((item,index)=>(
                <div
                  key={`details-wrap-${index}`}
                  ref={(el) => {
                    serviceCardRefs.current[index] = el
                  }}
                >
                  <DascriptionCard
                  key={`details-${index}`}
                  title={item.title}
                  description={toHtml(item.description)}
                  children={
                    item.skillsList.map((skill,index) => (
                      <ChipButton key={index} text={skill}/>
                    ))
                  }
                />
                </div>
              ))
            }
       
        </div>
        <div className={styles.detailsContainer}>
          <h2 className='strokeText' ref={educationHeadingRef}>{aboutText.service.edu.title}</h2>
          {
              aboutDescriptionList.map((item,index)=>(
                <div
                  key={`edu-details-wrap-${index}`}
                  ref={(el) => {
                    educationCardRefs.current[index] = el
                  }}
                >
                  <DascriptionCard
                  key={`details-${index}`}
                  title={item.title}
                  description={Array.isArray(item.description) ? '' : toHtml(item.description)}
                  children={
                    Array.isArray(item.description) ? (
                      <ul className={`description ${descriptionCardStyles.description} ${descriptionCardStyles.descriptionList}`}>
                        {item.description.map((descriptionItem, descriptionIndex) => (
                          <li
                            key={`${item.id ?? index}-description-${descriptionIndex}`}
                            className={descriptionCardStyles.descriptionListItem}
                            dangerouslySetInnerHTML={toHtml(descriptionItem)}
                          />
                        ))}
                      </ul>
                    ) : null
                  }
                />
                </div>
              ))
            }
        </div>
        <div className={styles.nextPageRow} ref={nextPageRowRef}>
          <IconButton
            iconName="ArrowThinRight"
            onClick={handleNextSection}
            ariaLabel="Show next content"
            hover="45deg"
            className={styles.nextPageIconButton}
            iconClassName={styles.heroIcon}
          />
        </div>
      </SectionWrapper>
    </section>
  )
}
