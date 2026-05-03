import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import ChipButton from '../../components/buttons/chip_button/chipButton'
import TextLinkButton from '../../components/buttons/textlink_button/textLinkButton'
import SliderNav from '../../components/navigation/slider_nav/sliderNav'
import SmallCard from '../../components/cards/small_card/smallCard'
import { useProjectsContext } from '../../utils/providers/projectsProvider'
import { useNavContext } from '../../utils/providers/navProvider'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'
import { useI18n } from '../../utils/providers/lang/langProvider'
import { getProjectsText } from '../../utils/providers/lang/services'
import { getProjectLeadScreen, resolveProjectImage } from '../../utils/projects/projectImages'
import navLinks from '../../utils/constants/navLinks'
import styles from './projects.module.css'

const AUTO_PROGRESS_STEP = 1
const AUTO_PROGRESS_INTERVAL_MS = 200
const INDICATOR_PROGRESS_STEP = 10
const MAX_PROGRESS = 90
const INDICATOR_COUNT = 9
const PROJECTS_SECTION_INDEX = navLinks.findIndex((link) => link.href === '#projects')
const PROJECTS_EXIT_PROGRESS_THRESHOLD = 20
const PROJECTS_REENTRY_DELAY_MS = 180

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

export default function Projects() {
  const { projectsList, heroImages } = useProjectsContext()
  const { pageCounter, scrollProgress, scrollDirection, rememberLastSection } = useNavContext()
  const { navigateToDetail } = usePageTransitionContext()
  const { t, locale } = useI18n()
  const projectsText = getProjectsText(t)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [loadPercent, setLoadPercent] = useState(0)
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false)
  const [descriptionSplitVersion, setDescriptionSplitVersion] = useState(0)
  const currentProject = useMemo(
    () => projectsList[currentIndex] ?? {},
    [currentIndex, projectsList]
  )
  const currentProjectTextKey = `${locale}-${currentProject.id ?? currentIndex}`
  const swipeAreaRef = useRef(null)
  const touchStartRef = useRef({ x: 0, y: 0 })
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const imageContainerRef = useRef(null)
  const imageFrameRef = useRef(null)
  const imageSlideRefs = useRef([])
  const textContainerRef = useRef(null)
  const projectTitleRef = useRef(null)
  const projectSubtitleRef = useRef(null)
  const projectDescriptionRef = useRef(null)
  const projectDescriptionLineRefs = useRef([])
  const isSectionWaitingForDescriptionSplitRef = useRef(false)
  const toolsLabelRef = useRef(null)
  const dividerRef = useRef(null)
  const chipRefs = useRef([])
  const textLinkRef = useRef(null)
  const cardRefs = useRef([])
  const slideControllerRef = useRef(null)
  const counterContainerRef = useRef(null)
  const counterIndicatorRefs = useRef([])
  const counterLabelRef = useRef(null)
  const counterNumberRef = useRef(null)
  const currentIndexRef = useRef(currentIndex)
  const projectTransitionRef = useRef(null)
  const isProjectTransitioningRef = useRef(false)
  const isLocaleTransitioningRef = useRef(false)
  const shouldAnimateLocaleChangeRef = useRef(false)
  const lastLocaleRef = useRef(locale)
  const pageCounterRef = useRef(pageCounter)
  const scrollProgressRef = useRef(scrollProgress)
  const scrollDirectionRef = useRef(scrollDirection)
  const sectionAnimationRef = useRef({
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

  if (lastLocaleRef.current !== locale) {
    shouldAnimateLocaleChangeRef.current = true
    isLocaleTransitioningRef.current = true
    lastLocaleRef.current = locale
  }

  pageCounterRef.current = pageCounter
  currentIndexRef.current = currentIndex
  scrollProgressRef.current = scrollProgress
  scrollDirectionRef.current = scrollDirection
  chipRefs.current.length = currentProject.tools?.length ?? 0
  cardRefs.current.length = projectsList.length
  imageSlideRefs.current.length = projectsList.length
  counterIndicatorRefs.current.length = INDICATOR_COUNT

  const projectHeroImages = useMemo(
    () => projectsList.map((project) => resolveProjectImage(
      getProjectLeadScreen(project),
      heroImages,
      isMobileViewport
    )),
    [heroImages, isMobileViewport, projectsList]
  )

  const getProjectDescriptionLineTargets = useCallback(
    () => projectDescriptionLineRefs.current.filter(Boolean),
    []
  )

  const getProjectSectionTextTargets = useCallback(() => [
    projectTitleRef.current,
    projectSubtitleRef.current,
    ...getProjectDescriptionLineTargets(),
  ].filter(Boolean), [getProjectDescriptionLineTargets])

  const getProjectSlideTextTargets = useCallback(() => {
    const descriptionLineEls = getProjectDescriptionLineTargets()

    return [
      projectTitleRef.current,
      projectSubtitleRef.current,
      ...(descriptionLineEls.length ? descriptionLineEls : [projectDescriptionRef.current]),
    ].filter(Boolean)
  }, [getProjectDescriptionLineTargets])

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 500)
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const evaluateSectionAnimationState = useCallback(() => {
    const animation = sectionAnimationRef.current
    if (!animation.isReady) return

    const currentPageCounter = pageCounterRef.current
    const currentScrollProgress = scrollProgressRef.current
    const currentScrollDirection = scrollDirectionRef.current
    const isProjectsActive = currentPageCounter === PROJECTS_SECTION_INDEX
    const isLeavingProjects = isProjectsActive
      && currentScrollDirection === 'down'
      && currentScrollProgress > PROJECTS_EXIT_PROGRESS_THRESHOLD
    const shouldAnimateIn = isProjectsActive && !isLeavingProjects

    if (!isProjectsActive) {
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

    if (isLeavingProjects) {
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

    animation.delayedCall = gsap.delayedCall(isReentry ? PROJECTS_REENTRY_DELAY_MS / 1000 : 0, () => {
      animation.animateIn({ isReentry })
      animation.hasAnimatedThisVisit = true
      animation.hasAnimatedOnce = true
      animation.delayedCall = null
    })
  }, [])

  useGSAP(() => {
    const descriptionEl = projectDescriptionRef.current
    if (!descriptionEl) return undefined

    let splitInstance = null

    splitInstance = SplitText.create(descriptionEl, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        projectDescriptionLineRefs.current = self.lines ?? []

        const shouldKeepVisible = sectionAnimationRef.current.hasAnimatedThisVisit
          && pageCounterRef.current === PROJECTS_SECTION_INDEX
          && !isProjectTransitioningRef.current
          && !isLocaleTransitioningRef.current

        gsap.set(projectDescriptionLineRefs.current, {
          opacity: shouldKeepVisible ? 1 : 0,
          yPercent: shouldKeepVisible ? 0 : 65,
        })

        if (!sectionAnimationRef.current.hasInitialTriggerPlayed) {
          isSectionWaitingForDescriptionSplitRef.current = false
          setDescriptionSplitVersion((version) => version + 1)
        }
      },
    })

    return () => {
      projectDescriptionLineRefs.current = []
      splitInstance?.revert()
    }
  }, {
    dependencies: [currentProject.description, locale],
    revertOnUpdate: true,
  })

  useGSAP(() => {
    const sectionEl = sectionRef.current
    const contentEl = swipeAreaRef.current
    const imageContainerEl = imageContainerRef.current
    const imageFrameEl = imageFrameRef.current
    const imageSlideEls = imageSlideRefs.current.filter(Boolean)
    const textContainerEl = textContainerRef.current
    const descriptionLineEls = getProjectDescriptionLineTargets()
    const getPrimaryTextEls = () => [headingRef.current, ...getProjectSectionTextTargets()].filter(Boolean)
    const getToolsLabelEls = () => [toolsLabelRef.current].filter(Boolean)
    const chipEls = chipRefs.current.filter(Boolean)
    const cardEls = cardRefs.current.filter(Boolean)
    const counterIndicatorEls = counterIndicatorRefs.current.filter(Boolean)
    const counterTextEls = [counterLabelRef.current, counterNumberRef.current].filter(Boolean)
    const utilityEls = [
      dividerRef.current,
      textLinkRef.current,
      slideControllerRef.current,
      counterContainerRef.current,
      ...counterIndicatorEls,
      ...counterTextEls,
    ].filter(Boolean)

    if (!descriptionLineEls.length) {
      isSectionWaitingForDescriptionSplitRef.current = true
      return undefined
    }

    isSectionWaitingForDescriptionSplitRef.current = false

    if (!sectionEl
      || !contentEl
      || !imageContainerEl
      || !imageFrameEl
      || !imageSlideEls.length
      || !textContainerEl
      || !getPrimaryTextEls().length) {
      return undefined
    }

    let activeTimeline = null
    let initialTrigger = null
    let refreshFrame = null

    const allAnimatedEls = [
      contentEl,
      imageContainerEl,
      imageFrameEl,
      ...imageSlideEls,
      textContainerEl,
      ...chipEls,
      ...cardEls,
      ...utilityEls,
    ]

    const killMotion = () => {
      activeTimeline?.kill()
      activeTimeline = null
      gsap.killTweensOf([...allAnimatedEls, ...getPrimaryTextEls(), ...getToolsLabelEls()])
    }

    const clearDelayedCall = () => {
      sectionAnimationRef.current.delayedCall?.kill()
      sectionAnimationRef.current.delayedCall = null
    }

    const setInitialState = () => {
      const primaryTextEls = getPrimaryTextEls()
      const toolsLabelEls = getToolsLabelEls()

      gsap.set([contentEl, imageContainerEl, textContainerEl, counterContainerRef.current].filter(Boolean), {
        opacity: 0,
      })
      gsap.set(imageFrameEl, {
        opacity: 0,
        scale: 0.92,
        transformOrigin: '50% 50%',
      })
      gsap.set([...primaryTextEls, ...toolsLabelEls], {
        opacity: 0,
        yPercent: 65,
      })
      gsap.set([chipEls, cardEls, textLinkRef.current].filter(Boolean), {
        opacity: 0,
        scale: 0.9,
        yPercent: 18,
      })
      gsap.set([slideControllerRef.current, ...counterIndicatorEls].filter(Boolean), {
        opacity: 0,
        scale: 0.9,
        transformOrigin: '50% 50%',
      })
      gsap.set(counterTextEls, {
        opacity: 0,
        yPercent: 65,
      })
      gsap.set(dividerRef.current, {
        opacity: 0,
        scaleX: 0,
        transformOrigin: '0% 50%',
      })
    }

    const setVisibleState = () => {
      const primaryTextEls = getPrimaryTextEls()
      const toolsLabelEls = getToolsLabelEls()

      gsap.set([contentEl, imageContainerEl, textContainerEl, counterContainerRef.current].filter(Boolean), {
        opacity: 1,
      })
      gsap.set(imageFrameEl, {
        opacity: 1,
        scale: 1,
      })
      gsap.set([...primaryTextEls, ...toolsLabelEls], {
        opacity: 1,
        yPercent: 0,
      })
      gsap.set([chipEls, cardEls, textLinkRef.current].filter(Boolean), {
        opacity: 1,
        scale: 1,
        yPercent: 0,
      })
      gsap.set([slideControllerRef.current, ...counterIndicatorEls].filter(Boolean), {
        opacity: 1,
        scale: 1,
      })
      gsap.set(counterTextEls, {
        opacity: 1,
        yPercent: 0,
      })
      gsap.set(dividerRef.current, {
        opacity: 1,
        scaleX: 1,
        transformOrigin: '0% 50%',
      })
    }

    const animateIn = ({ isReentry = false } = {}) => {
      killMotion()
      const primaryTextEls = getPrimaryTextEls()
      const toolsLabelEls = getToolsLabelEls()
      activeTimeline = gsap.timeline({ delay: isReentry ? 0.14 : 0 })
      const frameStart = 0.25
      const detailStart = 0.58

      activeTimeline
        .to([contentEl, imageContainerEl, textContainerEl, counterContainerRef.current].filter(Boolean), {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        })
        .to(imageFrameEl, {
          opacity: 1,
          scale: 1,
          duration: 0.76,
          ease: 'power3.out',
          overwrite: 'auto',
        }, frameStart)
        .to(primaryTextEls, {
          opacity: 1,
          yPercent: 0,
          duration: 0.62,
          ease: 'power3.out',
          stagger: 0.07,
          overwrite: 'auto',
        }, frameStart + 0.08)
        .to(toolsLabelEls, {
          opacity: 1,
          yPercent: 0,
          duration: 0.44,
          ease: 'power3.out',
          overwrite: 'auto',
        }, frameStart + 0.16)
        .to(counterTextEls, {
          opacity: 1,
          yPercent: 0,
          duration: 0.52,
          ease: 'power3.out',
          stagger: 0.06,
          overwrite: 'auto',
        }, frameStart + 0.16)
        .to(slideControllerRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.44,
          ease: 'power3.out',
          overwrite: 'auto',
        }, detailStart)
        .to(counterIndicatorEls, {
          opacity: 1,
          scale: 1,
          duration: 0.42,
          ease: 'power3.out',
          stagger: 0.04,
          overwrite: 'auto',
        }, detailStart)
        .to(dividerRef.current, {
          opacity: 1,
          scaleX: 1,
          duration: 0.42,
          ease: 'power3.out',
          overwrite: 'auto',
        }, detailStart)

      if (chipEls.length) {
        activeTimeline.to(chipEls, {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.42,
          ease: 'power3.out',
          stagger: 0.05,
          overwrite: 'auto',
        }, detailStart + 0.08)
      }

      if (textLinkRef.current) {
        activeTimeline.to(textLinkRef.current, {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.44,
          ease: 'power3.out',
          overwrite: 'auto',
        }, detailStart + 0.08)
      }

      if (cardEls.length) {
        activeTimeline.to(cardEls, {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.48,
          ease: 'power3.out',
          stagger: 0.06,
          overwrite: 'auto',
        }, detailStart + 0.08)
      }
    }

    const animateOut = (direction) => {
      killMotion()
      const primaryTextEls = getPrimaryTextEls()
      const toolsLabelEls = getToolsLabelEls()
      const yPercent = direction === 'down' ? -24 : 24
      const reversedCardEls = direction === 'down' ? cardEls.slice().reverse() : cardEls
      const reversedChipEls = direction === 'down' ? chipEls.slice().reverse() : chipEls
      const reversedIndicatorEls = direction === 'down'
        ? counterIndicatorEls.slice().reverse()
        : counterIndicatorEls

      activeTimeline = gsap.timeline()
      activeTimeline
        .to([
          ...reversedCardEls,
          textLinkRef.current,
          ...reversedChipEls,
        ].filter(Boolean), {
          opacity: 0,
          scale: 0.9,
          yPercent,
          duration: 0.28,
          ease: 'power2.in',
          stagger: 0.04,
          overwrite: 'auto',
        })
        .to([slideControllerRef.current, ...reversedIndicatorEls].filter(Boolean), {
          opacity: 0,
          scale: 0.9,
          duration: 0.28,
          ease: 'power2.in',
          stagger: 0.04,
          overwrite: 'auto',
        }, '<0.02')
        .to(counterTextEls, {
          opacity: 0,
          yPercent,
          duration: 0.3,
          ease: 'power2.in',
          stagger: 0.04,
          overwrite: 'auto',
        }, '<0.02')
        .to([dividerRef.current, ...toolsLabelEls, ...primaryTextEls].filter(Boolean), {
          opacity: 0,
          yPercent,
          duration: 0.32,
          ease: 'power2.in',
          stagger: 0.04,
          overwrite: 'auto',
        }, '<0.04')
        .to(imageFrameEl, {
          opacity: 0,
          scale: 0.96,
          duration: 0.34,
          ease: 'power2.in',
          overwrite: 'auto',
        }, '<')
        .to([contentEl, imageContainerEl, textContainerEl, counterContainerRef.current].filter(Boolean), {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          overwrite: 'auto',
        }, '>-0.04')
    }

    const isProjectsActive = pageCounterRef.current === PROJECTS_SECTION_INDEX
    const shouldKeepVisibleState = isProjectsActive && sectionAnimationRef.current.hasAnimatedThisVisit

    if (shouldKeepVisibleState) {
      setVisibleState()
    } else {
      setInitialState()
    }

    sectionAnimationRef.current.isReady = true
    sectionAnimationRef.current.hasAnimatedThisVisit = shouldKeepVisibleState
    sectionAnimationRef.current.animateIn = animateIn
    sectionAnimationRef.current.animateOut = animateOut
    sectionAnimationRef.current.reset = () => {
      killMotion()
      clearDelayedCall()
      setInitialState()
    }

    initialTrigger = ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top 72%',
      end: 'bottom 28%',
      once: true,
      onEnter: () => {
        if (sectionAnimationRef.current.hasInitialTriggerPlayed || sectionAnimationRef.current.hasAnimatedThisVisit) {
          return
        }
        sectionAnimationRef.current.hasInitialTriggerPlayed = true
        sectionAnimationRef.current.hasAnimatedThisVisit = true
        sectionAnimationRef.current.hasAnimatedOnce = true
        sectionAnimationRef.current.wasActive = true
        animateIn({ isReentry: false })
      },
    })

    if (initialTrigger.isActive && !sectionAnimationRef.current.hasInitialTriggerPlayed) {
      sectionAnimationRef.current.hasInitialTriggerPlayed = true
      sectionAnimationRef.current.hasAnimatedThisVisit = true
      sectionAnimationRef.current.hasAnimatedOnce = true
      sectionAnimationRef.current.wasActive = true
      animateIn({ isReentry: false })
    }

    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = null
      ScrollTrigger.refresh()
    })

    return () => {
      if (refreshFrame) {
        window.cancelAnimationFrame(refreshFrame)
      }
      sectionAnimationRef.current.isReady = false
      sectionAnimationRef.current.animateIn = () => {}
      sectionAnimationRef.current.animateOut = () => {}
      sectionAnimationRef.current.reset = () => {}
      initialTrigger?.kill()
      clearDelayedCall()
      killMotion()
    }
  }, {
    dependencies: [
      projectsList.length,
      locale,
      projectsText.caseStudyButton,
      projectsText.toolsTitle,
      projectsText.title,
      getProjectDescriptionLineTargets,
      getProjectSectionTextTargets,
      descriptionSplitVersion,
    ],
    revertOnUpdate: true,
  })

  useGSAP(() => {
    if (!shouldAnimateLocaleChangeRef.current) return undefined

    shouldAnimateLocaleChangeRef.current = false

    let firstFrame = null
    let secondFrame = null
    let localeTimeline = null

    const finishLocaleTransition = () => {
      isLocaleTransitioningRef.current = false
    }

    const animateLocaleText = () => {
      firstFrame = null
      secondFrame = null

      const isProjectsActive = pageCounterRef.current === PROJECTS_SECTION_INDEX
      const hasVisibleSection = sectionAnimationRef.current.hasAnimatedThisVisit

      if (!isProjectsActive || !hasVisibleSection) {
        finishLocaleTransition()
        return
      }

      const primaryTextEls = [
        headingRef.current,
        ...getProjectSlideTextTargets(),
        toolsLabelRef.current,
      ].filter(Boolean)
      const detailEls = [
        ...chipRefs.current.filter(Boolean),
        textLinkRef.current,
        ...cardRefs.current.filter(Boolean),
      ].filter(Boolean)

      if (!primaryTextEls.length) {
        finishLocaleTransition()
        return
      }

      gsap.killTweensOf([...primaryTextEls, ...detailEls])
      gsap.set(primaryTextEls, {
        opacity: 0,
        yPercent: 42,
      })
      gsap.set(detailEls, {
        opacity: 0,
        scale: 0.9,
        yPercent: 18,
      })

      localeTimeline = gsap.timeline({
        onComplete: finishLocaleTransition,
      })

      localeTimeline.to(primaryTextEls, {
        opacity: 1,
        yPercent: 0,
        duration: 0.54,
        ease: 'power3.out',
        stagger: 0.06,
        overwrite: 'auto',
      })

      if (detailEls.length) {
        localeTimeline.to(detailEls, {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.42,
          ease: 'power3.out',
          stagger: 0.045,
          overwrite: 'auto',
        }, '<0.18')
      }
    }

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(animateLocaleText)
    })

    return () => {
      if (firstFrame) {
        window.cancelAnimationFrame(firstFrame)
      }
      if (secondFrame) {
        window.cancelAnimationFrame(secondFrame)
      }
      localeTimeline?.kill()
      finishLocaleTransition()
    }
  }, {
    dependencies: [
      locale,
      currentProjectTextKey,
      currentProject.description,
      projectsText.caseStudyButton,
      projectsText.toolsTitle,
      projectsText.title,
      getProjectSlideTextTargets,
    ],
    revertOnUpdate: false,
  })

  useEffect(() => {
    evaluateSectionAnimationState()
  }, [evaluateSectionAnimationState, pageCounter, scrollDirection, scrollProgress])

  useGSAP(() => {
    const slideEls = imageSlideRefs.current.filter(Boolean)
    if (!slideEls.length) return undefined

    slideEls.forEach((slideEl, index) => {
      gsap.set(slideEl, {
        opacity: index === currentIndexRef.current ? 1 : 0,
        yPercent: index === currentIndexRef.current ? 0 : 100,
        zIndex: index === currentIndexRef.current ? 2 : 0,
      })
    })

    return () => {
      gsap.killTweensOf(slideEls)
    }
  }, {
    dependencies: [projectHeroImages.length, isMobileViewport],
    revertOnUpdate: false,
  })

  const resetSliderProgress = useCallback(() => {
    setLoadPercent(0)
  }, [])

  const getProjectTransitionTargets = useCallback(() => ({
    textEls: getProjectSlideTextTargets(),
    chipEls: chipRefs.current.filter(Boolean),
  }), [getProjectSlideTextTargets])

  const animateProjectContentIn = useCallback((direction) => {
    const { textEls, chipEls } = getProjectTransitionTargets()
    const fromY = direction === 'next' ? 42 : -42

    gsap.set(textEls, {
      opacity: 0,
      yPercent: fromY,
    })
    gsap.set(chipEls, {
      opacity: 0,
      scale: 0.9,
      yPercent: 18,
    })

    const timeline = gsap.timeline()
    timeline.to(textEls, {
      opacity: 1,
      yPercent: 0,
      duration: 0.52,
      ease: 'power3.out',
      stagger: 0.06,
      overwrite: 'auto',
    })

    if (chipEls.length) {
      timeline.to(chipEls, {
        opacity: 1,
        scale: 1,
        yPercent: 0,
        duration: 0.4,
        ease: 'power3.out',
        stagger: 0.05,
        overwrite: 'auto',
      }, '<0.16')
    }
  }, [getProjectTransitionTargets])

  const transitionToProject = useCallback((targetIndex, direction = 'next') => {
    if (!projectsList.length) return

    const normalizedIndex = (targetIndex + projectsList.length) % projectsList.length
    const currentSlideIndex = currentIndexRef.current

    if (normalizedIndex === currentSlideIndex) {
      resetSliderProgress()
      return
    }

    if (isProjectTransitioningRef.current) {
      return
    }

    const outgoingSlideEl = imageSlideRefs.current[currentSlideIndex]
    const incomingSlideEl = imageSlideRefs.current[normalizedIndex]

    if (!outgoingSlideEl || !incomingSlideEl) {
      currentIndexRef.current = normalizedIndex
      setCurrentIndex(normalizedIndex)
      resetSliderProgress()
      return
    }

    projectTransitionRef.current?.kill()
    isProjectTransitioningRef.current = true
    resetSliderProgress()

    const { textEls, chipEls } = getProjectTransitionTargets()
    const outgoingY = direction === 'next' ? -100 : 100
    const incomingY = direction === 'next' ? 100 : -100
    const textOutY = direction === 'next' ? -36 : 36

    gsap.set(incomingSlideEl, {
      opacity: 1,
      yPercent: incomingY,
      zIndex: 3,
    })
    gsap.set(outgoingSlideEl, {
      opacity: 1,
      yPercent: 0,
      zIndex: 2,
    })

    projectTransitionRef.current = gsap.timeline({
      onComplete: () => {
        gsap.set(outgoingSlideEl, { opacity: 0, yPercent: -incomingY, zIndex: 0 })
        gsap.set(incomingSlideEl, { opacity: 1, yPercent: 0, zIndex: 2 })
        currentIndexRef.current = normalizedIndex
        setCurrentIndex(normalizedIndex)

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            animateProjectContentIn(direction)
            isProjectTransitioningRef.current = false
            projectTransitionRef.current = null
          })
        })
      },
    })

    projectTransitionRef.current
      .to(textEls, {
        opacity: 0,
        yPercent: textOutY,
        duration: 0.26,
        ease: 'power2.in',
        stagger: 0.04,
        overwrite: 'auto',
      }, 0)
      .to(chipEls, {
        opacity: 0,
        scale: 0.9,
        yPercent: textOutY > 0 ? 16 : -16,
        duration: 0.24,
        ease: 'power2.in',
        stagger: 0.035,
        overwrite: 'auto',
      }, 0.04)
      .to(outgoingSlideEl, {
        yPercent: outgoingY,
        duration: 0.72,
        ease: 'power3.inOut',
        overwrite: 'auto',
      }, 0)
      .to(incomingSlideEl, {
        yPercent: 0,
        duration: 0.72,
        ease: 'power3.inOut',
        overwrite: 'auto',
      }, 0)
  }, [animateProjectContentIn, getProjectTransitionTargets, projectsList.length, resetSliderProgress])

  useEffect(() => {
    return () => {
      projectTransitionRef.current?.kill()
      projectTransitionRef.current = null
      isProjectTransitioningRef.current = false
    }
  }, [])

  const toggleSliderPause = () => {
    setIsAutoplayPaused((previousState) => !previousState)
  }

  const prevProject = useCallback(() => {
    transitionToProject(currentIndexRef.current + 1, 'prev')
  }, [transitionToProject])

  const nextProject = useCallback(() => {
    transitionToProject(currentIndexRef.current - 1, 'next')
  }, [transitionToProject])

  const handlePrevProjectClick = () => {
    prevProject()
  }

  const handleNextProjectClick = () => {
    nextProject()
  }

  const isProjectActive = (projectId) =>
    !!projectId && projectId === currentProject?.id

  const handleCardClick = (index) => {
    const direction = index > currentIndexRef.current ? 'prev' : 'next'
    transitionToProject(index, direction)
  }

  const handleCaseStudyClick = (event) => {
    event.preventDefault()
    if (!currentProject?.id) return
    rememberLastSection('projects')
    navigateToDetail(`/projects/${currentProject.id}`, { fromSectionId: 'projects' })
  }

  useEffect(() => {
    if (projectsList.length <= 1 || isAutoplayPaused) return undefined

    const intervalId = window.setInterval(() => {
      setLoadPercent((previousPercent) =>
        previousPercent >= MAX_PROGRESS
          ? MAX_PROGRESS
          : previousPercent + AUTO_PROGRESS_STEP
      )
    }, AUTO_PROGRESS_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [isAutoplayPaused, projectsList.length, currentIndex])

  useEffect(() => {
    if (projectsList.length <= 1 || isAutoplayPaused || loadPercent < MAX_PROGRESS) return undefined

    const timeoutId = window.setTimeout(() => {
      nextProject()
      resetSliderProgress()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [isAutoplayPaused, loadPercent, nextProject, projectsList.length, resetSliderProgress])

  useEffect(() => {
    if (!isMobileViewport || !swipeAreaRef.current) return
    const touchThreshold = 50

    const handleTouchStart = (event) => {
      const touch = event.changedTouches?.[0]
      if (!touch) return
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (event) => {
      const touch = event.changedTouches?.[0]
      if (!touch) return
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      if (Math.abs(deltaX) < touchThreshold || Math.abs(deltaX) < Math.abs(deltaY)) return

      resetSliderProgress()

      if (deltaX < 0) {
        prevProject()
        return
      }

      nextProject()
    }

    const node = swipeAreaRef.current
    node.addEventListener('touchstart', handleTouchStart, { passive: true })
    node.addEventListener('touchend', handleTouchEnd)

    return () => {
      node.removeEventListener('touchstart', handleTouchStart)
      node.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobileViewport, nextProject, prevProject, projectsList.length, resetSliderProgress])

  const activeIndicatorCount = Math.min(
    INDICATOR_COUNT,
    Math.floor(loadPercent / INDICATOR_PROGRESS_STEP)
  )

  return (
    <section id="projects" className={styles.section} ref={sectionRef}>
      <SectionWrapper className={styles.wrapper}>
        <h1 key={`${locale}-projects-heading`} className="strokeText" ref={headingRef}>{projectsText.title}</h1>
        <div className={styles.content} ref={swipeAreaRef}>
          <div className={styles.imageContainer} ref={imageContainerRef}>
            <div className={styles.imageFrame} ref={imageFrameRef} aria-hidden="true">
              {projectHeroImages.map((imageSrc, index) => (
                <img
                  key={projectsList[index]?.id ?? index}
                  ref={(el) => {
                    imageSlideRefs.current[index] = el
                  }}
                  className={styles.imageSlide}
                  src={imageSrc}
                  alt={projectsList[index]?.title ?? ''}
                />
              ))}
            </div>
          </div>
          <div className={styles.textContainer} ref={textContainerRef}>
            <h2 key={`${currentProjectTextKey}-title`} ref={projectTitleRef}>{currentProject.title}</h2>
            <h4 key={`${currentProjectTextKey}-subtitle`} ref={projectSubtitleRef}>{currentProject.subtitle}</h4>
            <p
              key={`${currentProjectTextKey}-description`}
              className={`description ${styles.descriptionClamp}`}
              ref={projectDescriptionRef}
            >
              {currentProject.description}
            </p>
            <div className={styles.divider} ref={dividerRef} aria-hidden="true" />
            <p key={`${locale}-tools-title`} className="description" ref={toolsLabelRef}>{projectsText.toolsTitle}</p>
            <div className={styles.chipRow}>
              {currentProject.tools?.map(({ tool_name }, index) => (
                <div
                  key={tool_name}
                  ref={(el) => {
                    chipRefs.current[index] = el
                  }}
                >
                  <ChipButton text={tool_name} onClick={() => {}} />
                </div>
              ))}
            </div>
            <div className={styles.linkRow} ref={textLinkRef}>
              <TextLinkButton
                key={`${locale}-case-study-link`}
                name={projectsText.caseStudyButton}
                to={currentProject?.id ? `/projects/${currentProject.id}` : '/'}
                iconName="ArrowThinRight"
                className="description"
                onClick={handleCaseStudyClick}
              />
            </div>
          </div>
        </div>
        <SliderNav
          counterLabel={projectsText.pageCounter}
          nextProject={handleNextProjectClick}
          prevProject={handlePrevProjectClick}
          pauseProject={toggleSliderPause}
          isAutoplayPaused={isAutoplayPaused}
          loadPercent={loadPercent}
          activeIndicatorCount={activeIndicatorCount}
          currentSlideNumber={currentIndex + 1}
          totalSlides={projectsList.length}
          navButtonsRef={slideControllerRef}
          counterContainerRef={counterContainerRef}
          counterIndicatorRefs={counterIndicatorRefs}
          counterLabelRef={counterLabelRef}
          counterNumberRef={counterNumberRef}
        >
          {projectsList.map(({ title, id, logo }, index) => (
            <div
              key={id ?? index}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
            >
              <SmallCard
                label={title}
                logo={logo}
                isActive={isProjectActive(id)}
                onClick={() => handleCardClick(index)}
              />
            </div>
          ))}
        </SliderNav>
      </SectionWrapper>
    </section>
  )
}
