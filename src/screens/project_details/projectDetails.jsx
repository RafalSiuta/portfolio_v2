import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useParams } from 'react-router-dom'
import ParticlesBackground from '../../components/containers/particles/particlesBackground'
import PhotoGrid from '../../components/containers/photo_grid/photoGrid'
import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import IconButton from '../../components/buttons/icon_button/icon_button'
import LargeTextButton from '../../components/buttons/large_text_button/largeTextButton'
import ChipButton from '../../components/buttons/chip_button/chipButton'
import TextLinkButton from '../../components/buttons/textlink_button/textLinkButton'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import SliderNav from '../../components/navigation/slider_nav/sliderNav'
import ShotMiniature from '../../components/cards/shot_miniature/shotMiniature'
import SmallCard from '../../components/cards/small_card/smallCard'
import { useProjectsContext } from '../../utils/providers/projectsProvider'
import { useNavContext } from '../../utils/providers/navProvider'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'
import { useI18n } from '../../utils/providers/lang/langProvider'
import { getDetailsText } from '../../utils/providers/lang/services'
import { resolveProjectImage } from '../../utils/projects/projectImages'
import styles from './projectDetails.module.css'

const AUTO_PROGRESS_STEP = 1
const AUTO_PROGRESS_INTERVAL_MS = 200
const INDICATOR_PROGRESS_STEP = 10
const MAX_PROGRESS = 100

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function ProjectDetails() {
  const { projectId } = useParams()
  const { projectsList, heroImages } = useProjectsContext()
  const { smoother } = useNavContext()
  const {
    curtainRevealKey,
    isTransitioning,
    navigateToDetail,
    returnToSection,
    setIsDetailFooterVisible,
  } = usePageTransitionContext()
  const { t, locale } = useI18n()
  const detailsText = getDetailsText(t)
  const projectChangeTweenRef = useRef(null)
  const screenTransitionRef = useRef(null)
  const currentScreenIndexRef = useRef(0)
  const headerRef = useRef(null)
  const contentRef = useRef(null)
  const imageContainerRef = useRef(null)
  const imageFrameRef = useRef(null)
  const imageSlideRefs = useRef([])
  const isScreenTransitioningRef = useRef(false)
  const sliderNavButtonsRef = useRef(null)
  const sliderNavRef = useRef(null)
  const sliderCounterContainerRef = useRef(null)
  const sliderCounterIndicatorRefs = useRef([])
  const sliderCounterLabelRef = useRef(null)
  const sliderCounterNumberRef = useRef(null)
  const shotMiniatureRefs = useRef([])
  const aboutSectionRef = useRef(null)
  const webLinkRefs = useRef([])
  const roleSectionRef = useRef(null)
  const roleItemRefs = useRef([])
  const graphicsSectionRef = useRef(null)
  const toolsSectionRef = useRef(null)
  const toolChipRefs = useRef([])
  const solutionsSectionRef = useRef(null)
  const relatedSectionRef = useRef(null)
  const relatedCardRefs = useRef([])
  const contactCtaRef = useRef(null)
  const shouldAnimateLocaleChangeRef = useRef(false)
  const lastLocaleRef = useRef(locale)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0)
  const [loadPercent, setLoadPercent] = useState(0)
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false)

  const project = useMemo(
    () => projectsList.find((item) => item.id === projectId) ?? null,
    [projectsList, projectId]
  )

  const screensList = useMemo(() => project?.screens_list ?? [], [project])
  const webLinks = useMemo(() => project?.web_links ?? [], [project])
  const graphicsList = useMemo(() => project?.graphics ?? [], [project])
  const relatedProjects = useMemo(
    () => projectsList.filter(({ id }) => id && id !== projectId),
    [projectsList, projectId]
  )

  if (lastLocaleRef.current !== locale) {
    shouldAnimateLocaleChangeRef.current = true
    lastLocaleRef.current = locale
  }

  const screenHeroImages = useMemo(
    () => screensList.map((screen) => resolveProjectImage(screen, heroImages, isMobileViewport)),
    [heroImages, isMobileViewport, screensList]
  )

  currentScreenIndexRef.current = currentScreenIndex
  imageSlideRefs.current.length = screenHeroImages.length
  shotMiniatureRefs.current.length = screensList.length
  sliderCounterIndicatorRefs.current.length = 10
  webLinkRefs.current.length = webLinks.length
  roleItemRefs.current.length = project?.role?.length ?? 0
  toolChipRefs.current.length = project?.tools?.length ?? 0
  relatedCardRefs.current.length = relatedProjects.length

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 500)
    updateViewport()
    window.addEventListener('resize', updateViewport)

    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    setCurrentScreenIndex(0)
    currentScreenIndexRef.current = 0
    setLoadPercent(0)
    setIsAutoplayPaused(false)
  }, [projectId])

  useEffect(() => {
    screenTransitionRef.current?.kill()
    screenTransitionRef.current = null
    isScreenTransitioningRef.current = false
  }, [projectId])

  useEffect(() => {
    projectChangeTweenRef.current?.kill()

    if (smoother) {
      smoother.scrollTo(0, true)
      return undefined
    }

    const scrollProxy = { y: window.scrollY }
    projectChangeTweenRef.current = gsap.to(scrollProxy, {
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        window.scrollTo(0, scrollProxy.y)
      },
      onComplete: () => {
        projectChangeTweenRef.current = null
      },
    })

    return () => {
      projectChangeTweenRef.current?.kill()
      projectChangeTweenRef.current = null
    }
  }, [projectId, smoother])

  useEffect(() => {
    let hasLoggedBottom = false

    const checkIfScrolledToBottom = () => {
      const scrollTop = smoother
        ? smoother.scrollTop()
        : window.scrollY || window.pageYOffset || 0
      const maxScroll = smoother?.scrollTrigger?.end
        ?? ScrollTrigger.maxScroll(window)
        ?? Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      const isAtBottom = scrollTop >= maxScroll - 24

      if (isAtBottom && !hasLoggedBottom) {
        setIsDetailFooterVisible(true)
        hasLoggedBottom = true
        return
      }

      if (!isAtBottom) {
        setIsDetailFooterVisible(false)
        hasLoggedBottom = false
      }
    }

    checkIfScrolledToBottom()

    if (smoother) {
      const trigger = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: checkIfScrolledToBottom,
      })

      return () => {
        trigger.kill()
        setIsDetailFooterVisible(false)
      }
    }

    window.addEventListener('scroll', checkIfScrolledToBottom, { passive: true })

    return () => {
      window.removeEventListener('scroll', checkIfScrolledToBottom)
      setIsDetailFooterVisible(false)
    }
  }, [projectId, setIsDetailFooterVisible, smoother])

  const handleContactReturn = useCallback(() => {
    returnToSection('contact')
  }, [returnToSection])

  const resetSliderProgress = () => {
    setLoadPercent(0)
  }

  const toggleSliderPause = () => {
    setIsAutoplayPaused((previousState) => !previousState)
  }

  useEffect(() => {
    const slideEls = imageSlideRefs.current.filter(Boolean)
    if (!slideEls.length) return undefined

    slideEls.forEach((slideEl, index) => {
      gsap.set(slideEl, {
        opacity: index === currentScreenIndexRef.current ? 1 : 0,
        yPercent: index === currentScreenIndexRef.current ? 0 : 100,
        zIndex: index === currentScreenIndexRef.current ? 2 : 0,
        willChange: 'transform, opacity',
      })
    })

    return () => {
      gsap.killTweensOf(slideEls)
    }
  }, [projectId, screenHeroImages.length, isMobileViewport])

  const transitionToScreen = useCallback((targetIndex, direction = 'next') => {
    if (!screensList.length) return

    const normalizedIndex = (targetIndex + screensList.length) % screensList.length
    const currentIndex = currentScreenIndexRef.current

    if (normalizedIndex === currentIndex) {
      resetSliderProgress()
      return
    }

    if (isScreenTransitioningRef.current) {
      return
    }

    const outgoingSlideEl = imageSlideRefs.current[currentIndex]
    const incomingSlideEl = imageSlideRefs.current[normalizedIndex]

    if (!outgoingSlideEl || !incomingSlideEl) {
      currentScreenIndexRef.current = normalizedIndex
      setCurrentScreenIndex(normalizedIndex)
      resetSliderProgress()
      return
    }

    screenTransitionRef.current?.kill()
    isScreenTransitioningRef.current = true
    resetSliderProgress()

    const outgoingY = direction === 'next' ? -100 : 100
    const incomingY = direction === 'next' ? 100 : -100

    gsap.set(incomingSlideEl, {
      opacity: 1,
      yPercent: incomingY,
      zIndex: 3,
      willChange: 'transform, opacity',
    })
    gsap.set(outgoingSlideEl, {
      opacity: 1,
      yPercent: 0,
      zIndex: 2,
      willChange: 'transform, opacity',
    })

    screenTransitionRef.current = gsap.timeline({
      onComplete: () => {
        gsap.set(outgoingSlideEl, { opacity: 0, yPercent: -incomingY, zIndex: 0 })
        gsap.set(incomingSlideEl, { opacity: 1, yPercent: 0, zIndex: 2 })
        currentScreenIndexRef.current = normalizedIndex
        setCurrentScreenIndex(normalizedIndex)
        isScreenTransitioningRef.current = false
        screenTransitionRef.current = null
      },
    })

    screenTransitionRef.current
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
  }, [screensList.length])

  useEffect(() => {
    return () => {
      screenTransitionRef.current?.kill()
      screenTransitionRef.current = null
      isScreenTransitioningRef.current = false
    }
  }, [])

  useGSAP(() => {
    const headerEl = headerRef.current
    const contentEl = contentRef.current
    const imageContainerEl = imageContainerRef.current
    const imageFrameEl = imageFrameRef.current
    const sliderNavEl = sliderNavRef.current
    const slideControllerEl = sliderNavButtonsRef.current
    const counterContainerEl = sliderCounterContainerRef.current
    const counterIndicatorEls = sliderCounterIndicatorRefs.current.filter(Boolean)
    const counterTextEls = [sliderCounterLabelRef.current, sliderCounterNumberRef.current].filter(Boolean)
    const shotEls = shotMiniatureRefs.current.filter(Boolean)
    const imageSlideEls = imageSlideRefs.current.filter(Boolean)
    const headerTextEls = headerEl
      ? Array.from(headerEl.querySelectorAll('h1, h2'))
      : []

    if (!headerEl
      || !contentEl
      || !imageContainerEl
      || !imageFrameEl
      || !sliderNavEl
      || !headerTextEls.length
      || !imageSlideEls.length) {
      return undefined
    }

    let activeTimeline = null
    let introTrigger = null

    const killMotion = () => {
      activeTimeline?.kill()
      activeTimeline = null
      gsap.killTweensOf([
        headerEl,
        contentEl,
        imageContainerEl,
        imageFrameEl,
        slideControllerEl,
        counterContainerEl,
        ...headerTextEls,
        ...counterIndicatorEls,
        ...counterTextEls,
        ...shotEls,
      ].filter(Boolean))
    }

    const setInitialState = () => {
      gsap.set([headerEl, contentEl, imageContainerEl, counterContainerEl].filter(Boolean), {
        opacity: 0,
        willChange: 'opacity',
      })
      gsap.set(imageFrameEl, {
        opacity: 0,
        scale: 0.92,
        transformOrigin: '50% 50%',
        willChange: 'transform, opacity',
      })
      gsap.set(headerTextEls, {
        opacity: 0,
        yPercent: 65,
        willChange: 'transform, opacity',
      })
      gsap.set([slideControllerEl, ...counterIndicatorEls].filter(Boolean), {
        opacity: 0,
        scale: 0.9,
        transformOrigin: '50% 50%',
        willChange: 'transform, opacity',
      })
      gsap.set(counterTextEls, {
        opacity: 0,
        yPercent: 65,
        willChange: 'transform, opacity',
      })
      gsap.set(shotEls, {
        opacity: 0,
        scale: 0.9,
        yPercent: 18,
        willChange: 'transform, opacity',
      })
    }

    const animateIn = ({ isReentry = false } = {}) => {
      killMotion()
      activeTimeline = gsap.timeline({ delay: isReentry ? 0.14 : 0 })
      const frameStart = 0.22
      const detailStart = 0.54
      const controllerTargets = [slideControllerEl].filter(Boolean)

      activeTimeline
        .to([headerEl, contentEl, imageContainerEl, counterContainerEl].filter(Boolean), {
          opacity: 1,
          duration: 0.46,
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
        .to(headerTextEls, {
          opacity: 1,
          yPercent: 0,
          duration: 0.62,
          ease: 'power3.out',
          stagger: 0.07,
          overwrite: 'auto',
        }, frameStart + 0.08)

      if (controllerTargets.length) {
        activeTimeline.to(controllerTargets, {
          opacity: 1,
          scale: 1,
          duration: 0.42,
          ease: 'power3.out',
          overwrite: 'auto',
        }, detailStart)
      }

      if (counterTextEls.length) {
        activeTimeline.to(counterTextEls, {
          opacity: 1,
          yPercent: 0,
          duration: 0.46,
          ease: 'power3.out',
          stagger: 0.05,
          overwrite: 'auto',
        }, detailStart)
      }

      if (counterIndicatorEls.length) {
        activeTimeline.to(counterIndicatorEls, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power3.out',
          stagger: 0.035,
          overwrite: 'auto',
        }, detailStart)
      }

      if (shotEls.length) {
        activeTimeline.to(shotEls, {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.42,
          ease: 'power3.out',
          stagger: 0.045,
          overwrite: 'auto',
        }, detailStart + 0.08)
      }
    }

    const animateOut = (direction) => {
      killMotion()
      const yPercent = direction === 'down' ? -24 : 24
      const controllerTargets = [slideControllerEl].filter(Boolean)
      const reversedIndicators = direction === 'down' ? counterIndicatorEls.slice().reverse() : counterIndicatorEls
      const reversedShots = direction === 'down' ? shotEls.slice().reverse() : shotEls

      activeTimeline = gsap.timeline()

      if (reversedShots.length) {
        activeTimeline.to(reversedShots, {
          opacity: 0,
          scale: 0.9,
          yPercent,
          duration: 0.26,
          ease: 'power2.in',
          stagger: 0.035,
          overwrite: 'auto',
        })
      }

      if (controllerTargets.length || reversedIndicators.length) {
        activeTimeline.to([...controllerTargets, ...reversedIndicators], {
          opacity: 0,
          scale: 0.9,
          duration: 0.26,
          ease: 'power2.in',
          stagger: 0.03,
          overwrite: 'auto',
        }, reversedShots.length ? '<0.03' : 0)
      }

      if (counterTextEls.length) {
        activeTimeline.to(counterTextEls, {
          opacity: 0,
          yPercent,
          duration: 0.28,
          ease: 'power2.in',
          stagger: 0.04,
          overwrite: 'auto',
        }, controllerTargets.length || reversedIndicators.length ? '<0.02' : 0)
      }

      activeTimeline
        .to(headerTextEls, {
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
        .to([headerEl, contentEl, imageContainerEl, counterContainerEl].filter(Boolean), {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          overwrite: 'auto',
        }, '>-0.04')
    }

    if (isTransitioning) {
      setInitialState()
      return () => {
        killMotion()
      }
    }

    setInitialState()

    introTrigger = ScrollTrigger.create({
      trigger: headerEl,
      start: 'top 76%',
      endTrigger: sliderNavEl,
      end: 'bottom center',
      onEnter: () => animateIn({ isReentry: false }),
      onEnterBack: () => animateIn({ isReentry: true }),
      onLeave: () => animateOut('down'),
      onLeaveBack: () => animateOut('up'),
    })

    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })

    return () => {
      introTrigger?.kill()
      killMotion()
    }
  }, {
    dependencies: [
      projectId,
      curtainRevealKey,
      isTransitioning,
      screenHeroImages.length,
      screensList.length,
      isMobileViewport,
    ],
    revertOnUpdate: false,
  })

  useGSAP(() => {
    if (isTransitioning) return undefined

    const sections = [
      {
        element: aboutSectionRef.current,
        textTargets: aboutSectionRef.current
          ? Array.from(aboutSectionRef.current.querySelectorAll('h2, p'))
          : [],
        listTargets: webLinkRefs.current.filter(Boolean),
      },
      {
        element: roleSectionRef.current,
        textTargets: roleSectionRef.current
          ? Array.from(roleSectionRef.current.querySelectorAll('h2'))
          : [],
        listTargets: roleItemRefs.current.filter(Boolean),
      },
      {
        element: graphicsSectionRef.current,
        textTargets: graphicsSectionRef.current
          ? Array.from(graphicsSectionRef.current.querySelectorAll(`.${styles.graphic_header} h2`))
          : [],
        listTargets: graphicsSectionRef.current
          ? Array.from(graphicsSectionRef.current.querySelectorAll(
              '[class*="graphic_card"], [class*="scrollbar_arrow"], [class*="scrollbar_rail"]'
            ))
          : [],
      },
      {
        element: toolsSectionRef.current,
        textTargets: toolsSectionRef.current
          ? Array.from(toolsSectionRef.current.querySelectorAll('h2'))
          : [],
        listTargets: toolChipRefs.current.filter(Boolean),
      },
      {
        element: solutionsSectionRef.current,
        textTargets: solutionsSectionRef.current
          ? Array.from(solutionsSectionRef.current.querySelectorAll('h2, p'))
          : [],
        listTargets: [],
      },
      {
        element: relatedSectionRef.current,
        textTargets: relatedSectionRef.current
          ? Array.from(relatedSectionRef.current.querySelectorAll('h2'))
          : [],
        listTargets: [...relatedCardRefs.current.filter(Boolean), contactCtaRef.current].filter(Boolean),
      },
    ].filter(({ element }) => element)

    const triggers = []
    const timelines = []

    const createSectionAnimation = ({ element, textTargets, listTargets }) => {
      const safeTextTargets = textTargets.filter(Boolean)
      const safeListTargets = listTargets.filter(Boolean)
      const allTargets = [...safeTextTargets, ...safeListTargets]
      if (!allTargets.length) return

      if (safeTextTargets.length) {
        gsap.set(safeTextTargets, {
          opacity: 0,
          yPercent: 42,
          willChange: 'transform, opacity',
        })
      }
      if (safeListTargets.length) {
        gsap.set(safeListTargets, {
          opacity: 0,
          scale: 0.9,
          yPercent: 18,
          willChange: 'transform, opacity',
        })
      }

      const animateIn = () => {
        gsap.killTweensOf(allTargets)
        const timeline = gsap.timeline()
        timelines.push(timeline)
        if (safeTextTargets.length) {
          timeline.to(safeTextTargets, {
            opacity: 1,
            yPercent: 0,
            duration: 0.52,
            ease: 'power3.out',
            stagger: 0.06,
            overwrite: 'auto',
          })
        }

        if (safeListTargets.length) {
          timeline.to(safeListTargets, {
            opacity: 1,
            scale: 1,
            yPercent: 0,
            duration: 0.42,
            ease: 'power3.out',
            stagger: 0.05,
            overwrite: 'auto',
          }, '<0.16')
        }
      }

      const animateOut = (direction) => {
        const yPercent = direction === 'down' ? -24 : 24
        const reversedListTargets = direction === 'down' ? safeListTargets.slice().reverse() : safeListTargets
        gsap.killTweensOf(allTargets)
        const timeline = gsap.timeline()
        timelines.push(timeline)

        if (reversedListTargets.length) {
          timeline.to(reversedListTargets, {
            opacity: 0,
            scale: 0.9,
            yPercent,
            duration: 0.28,
            ease: 'power2.in',
            stagger: 0.04,
            overwrite: 'auto',
          })
        }

        if (safeTextTargets.length) {
          timeline.to(safeTextTargets, {
            opacity: 0,
            yPercent,
            duration: 0.3,
            ease: 'power2.in',
            stagger: 0.04,
            overwrite: 'auto',
          }, reversedListTargets.length ? '<0.04' : 0)
        }
      }

      triggers.push(ScrollTrigger.create({
        trigger: element,
        start: 'top 82%',
        end: 'bottom 18%',
        onEnter: animateIn,
        onEnterBack: animateIn,
        onLeave: () => animateOut('down'),
        onLeaveBack: () => animateOut('up'),
      }))
    }

    sections.forEach(createSectionAnimation)

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.cancelAnimationFrame(refreshFrame)
      triggers.forEach((trigger) => trigger.kill())
      timelines.forEach((timeline) => timeline.kill())
    }
  }, {
    dependencies: [
      projectId,
      curtainRevealKey,
      isTransitioning,
      webLinks.length,
      graphicsList.length,
      relatedProjects.length,
      project?.role?.length ?? 0,
      project?.tools?.length ?? 0,
    ],
    revertOnUpdate: false,
  })

  useGSAP(() => {
    if (!shouldAnimateLocaleChangeRef.current) return undefined

    shouldAnimateLocaleChangeRef.current = false

    let firstFrame = null
    let secondFrame = null
    let localeTimeline = null
    let refreshFrame = null

    const isInViewport = (element) => {
      if (!element) return false
      const rect = element.getBoundingClientRect()
      return rect.top < window.innerHeight * 0.88 && rect.bottom > window.innerHeight * 0.12
    }

    const getVisibleLocaleTargets = () => {
      const targets = []
      const pushTargets = (items) => {
        items.filter(Boolean).forEach((item) => {
          if (!targets.includes(item)) targets.push(item)
        })
      }

      if (isInViewport(headerRef.current) || isInViewport(sliderNavRef.current)) {
        pushTargets([
          ...(headerRef.current ? Array.from(headerRef.current.querySelectorAll('h1, h2')) : []),
          sliderCounterLabelRef.current,
          sliderCounterNumberRef.current,
          ...shotMiniatureRefs.current.filter(Boolean),
        ])
      }

      const sectionConfigs = [
        {
          element: aboutSectionRef.current,
          targets: [
            ...(aboutSectionRef.current ? Array.from(aboutSectionRef.current.querySelectorAll('h2, p')) : []),
            ...webLinkRefs.current.filter(Boolean),
          ],
        },
        {
          element: roleSectionRef.current,
          targets: [
            ...(roleSectionRef.current ? Array.from(roleSectionRef.current.querySelectorAll('h2')) : []),
            ...roleItemRefs.current.filter(Boolean),
          ],
        },
        {
          element: graphicsSectionRef.current,
          targets: graphicsSectionRef.current
            ? Array.from(graphicsSectionRef.current.querySelectorAll(
                `.${styles.graphic_header} h2, [class*="graphic_card"], [class*="scrollbar_arrow"], [class*="scrollbar_rail"]`
              ))
            : [],
        },
        {
          element: toolsSectionRef.current,
          targets: [
            ...(toolsSectionRef.current ? Array.from(toolsSectionRef.current.querySelectorAll('h2')) : []),
            ...toolChipRefs.current.filter(Boolean),
          ],
        },
        {
          element: solutionsSectionRef.current,
          targets: solutionsSectionRef.current
            ? Array.from(solutionsSectionRef.current.querySelectorAll('h2, p'))
            : [],
        },
        {
          element: relatedSectionRef.current,
          targets: [
            ...(relatedSectionRef.current ? Array.from(relatedSectionRef.current.querySelectorAll('h2')) : []),
            ...relatedCardRefs.current.filter(Boolean),
            contactCtaRef.current,
          ],
        },
      ]

      sectionConfigs.forEach(({ element, targets: sectionTargets }) => {
        if (isInViewport(element)) pushTargets(sectionTargets)
      })

      return targets
    }

    const animateLocaleTargets = () => {
      firstFrame = null
      secondFrame = null

      const targets = getVisibleLocaleTargets()
      if (!targets.length) {
        refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
        return
      }

      gsap.killTweensOf(targets)
      gsap.set(targets, {
        opacity: 0,
        yPercent: 28,
        scale: 0.98,
        willChange: 'transform, opacity',
      })

      localeTimeline = gsap.timeline({
        onComplete: () => {
          refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
        },
      })

      localeTimeline.to(targets, {
        opacity: 1,
        yPercent: 0,
        scale: 1,
        duration: 0.48,
        ease: 'power3.out',
        stagger: 0.045,
        overwrite: 'auto',
      })
    }

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(animateLocaleTargets)
    })

    return () => {
      if (firstFrame) window.cancelAnimationFrame(firstFrame)
      if (secondFrame) window.cancelAnimationFrame(secondFrame)
      if (refreshFrame) window.cancelAnimationFrame(refreshFrame)
      localeTimeline?.kill()
    }
  }, {
    dependencies: [
      locale,
      projectId,
      detailsText.aboutProject,
      detailsText.role,
      detailsText.screenshots,
      detailsText.tools,
      detailsText.challanges,
      detailsText.projectsList,
      detailsText.ctaButton,
      detailsText.screen,
      project?.description,
      project?.challanges,
      project?.subtitle,
      webLinks.length,
      graphicsList.length,
      relatedProjects.length,
      project?.role?.length ?? 0,
      project?.tools?.length ?? 0,
    ],
    revertOnUpdate: false,
  })

  const handleNextScreenClick = () => {
    transitionToScreen(currentScreenIndexRef.current + 1, 'next')
  }

  const handlePrevScreenClick = () => {
    transitionToScreen(currentScreenIndexRef.current - 1, 'prev')
  }

  const handleScreenMiniatureClick = (index) => {
    const direction = index > currentScreenIndexRef.current ? 'next' : 'prev'
    transitionToScreen(index, direction)
  }

  const handleProjectCardClick = useCallback((nextProjectId) => {
    if (!nextProjectId || nextProjectId === projectId) return
    navigateToDetail(`/projects/${nextProjectId}`)
  }, [navigateToDetail, projectId])

  useEffect(() => {
    if (screensList.length <= 1 || isAutoplayPaused) return undefined

    const intervalId = window.setInterval(() => {
      setLoadPercent((previousPercent) =>
        previousPercent >= MAX_PROGRESS
          ? MAX_PROGRESS
          : previousPercent + AUTO_PROGRESS_STEP
      )
    }, AUTO_PROGRESS_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [currentScreenIndex, isAutoplayPaused, screensList.length])

  useEffect(() => {
    if (screensList.length <= 1 || isAutoplayPaused || loadPercent < MAX_PROGRESS) return undefined

    const timeoutId = window.setTimeout(() => {
      transitionToScreen(currentScreenIndexRef.current + 1, 'next')
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [isAutoplayPaused, loadPercent, screensList.length, transitionToScreen])

  const activeIndicatorCount = Math.min(
    10,
    Math.floor(loadPercent / INDICATOR_PROGRESS_STEP)
  )

  return (
    <div className={styles.pageRoot}>
      <ParticlesBackground
        className="particles-overlay"
        style={{
          '--particles-align': 'stretch',
          '--particles-justify': 'flex-start',
        }}
      />
      <HeroWrapper
        className={styles.heroWrapper}
        style={{
          '--hero-surface-align-tablet': 'stretch',
          '--hero-surface-padding-tablet': 'calc(var(--nav-min-height) * 0.35) 0 0',
        }}
      >
        <SectionWrapper className={styles.wrapper}>
          <header className={styles.header} ref={headerRef}>
            <h1 className="strokeText">{project?.title ?? detailsText.errorMessage}</h1>
            <h2>{project?.subtitle}</h2>
          </header>

          <div className={styles.content} ref={contentRef}>
            <div className={styles.imageContainer} ref={imageContainerRef}>
              <div className={styles.imageFrame} ref={imageFrameRef} aria-hidden="true">
                {screenHeroImages.map((imageSrc, index) => (
                  <img
                    key={`${projectId ?? 'project'}-hero-${index}`}
                    ref={(el) => {
                      imageSlideRefs.current[index] = el
                    }}
                    className={styles.imageSlide}
                    src={imageSrc}
                    alt={project?.title ?? ''}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className={styles.sliderNavWrapper} ref={sliderNavRef}>
            <SliderNav
              key={projectId ?? 'project-details-slider'}
              counterLabel={detailsText.screen}
              nextProject={handlePrevScreenClick}
              prevProject={handleNextScreenClick}
              pauseProject={toggleSliderPause}
              isAutoplayPaused={isAutoplayPaused}
              loadPercent={loadPercent}
              activeIndicatorCount={activeIndicatorCount}
              currentSlideNumber={screensList.length === 0 ? 0 : currentScreenIndex + 1}
              totalSlides={screensList.length}
              navButtonsRef={sliderNavButtonsRef}
              counterContainerRef={sliderCounterContainerRef}
              counterIndicatorRefs={sliderCounterIndicatorRefs}
              counterLabelRef={sliderCounterLabelRef}
              counterNumberRef={sliderCounterNumberRef}
            >
               {screensList.map((screen, index) => (
                <div
                  key={`${projectId ?? 'project'}-${screen.desktop ?? screen.mobile ?? 'screen'}-${index}`}
                  ref={(el) => {
                    shotMiniatureRefs.current[index] = el
                  }}
                  
                >
                  <ShotMiniature
                    src={resolveProjectImage(screen, heroImages, isMobileViewport)}
                    alt={`${project?.title ?? 'project'} screen ${index + 1}`}
                    isActive={index === currentScreenIndex}
                    onClick={() => handleScreenMiniatureClick(index)}
                  />
                </div>
              ))}
              
            </SliderNav>
          </div>
          <div className={styles.text_content} ref={aboutSectionRef}>
            <h2>{detailsText.aboutProject}</h2>
            {project?.description ? <p>{project.description}</p> : null}
            <div className={styles.weblinks_container}>
            {webLinks.map(({ link_title, icon_name, link }, index) => (
              <div
                key={`${link_title}-${link}-${index}`}
                ref={(el) => {
                  webLinkRefs.current[index] = el
                }}
              >
                <TextLinkButton
                  name={link_title}
                  to={link}
                  iconName={icon_name}
                  isLink={true}
                  isActive={index === webLinks.length - 1}
                />
              </div>
            ))}
          </div>
          </div>
          <div className={styles.text_content} ref={roleSectionRef}>
            <h2>{detailsText.role}</h2>
            {project?.role?.length ? (
              <ul className={styles.roleList}>
                {project.role.map((roleItem, index) => (
                  <li
                    key={`${roleItem}-${index}`}
                    className={styles.roleListItem}
                    ref={(el) => {
                      roleItemRefs.current[index] = el
                    }}
                  >
                    <span className={styles.roleListBullet} aria-hidden="true" />
                    <span className={styles.roleListText}>{roleItem}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className={styles.graphics_container} ref={graphicsSectionRef}>
            <div className={styles.graphic_header}>
              <h2>{detailsText.screenshots}</h2>
              <h2>{graphicsList.length}</h2>
            </div>
            <PhotoGrid
              graphicsList={graphicsList}
              heroImages={heroImages}
              isMobileViewport={isMobileViewport}
            />
          </div>

          <div className={styles.project_tools_container} ref={toolsSectionRef}>
            <h2>{detailsText.tools}</h2>
            <div className={styles.project_tools_wrapper}>
              {project?.tools?.map(({ tool_name }, index) => (
                <div
                  key={tool_name}
                  ref={(el) => {
                    toolChipRefs.current[index] = el
                  }}
                >
                  <ChipButton text={tool_name} onClick={() => {}} />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.solutions_container} ref={solutionsSectionRef}>
            <h2>{detailsText.challanges}</h2>
              {project?.challanges ? <p>{project.challanges}</p> : null}
          </div>
          {relatedProjects.length ? (
            <div className={styles.related_projects_container} ref={relatedSectionRef}>
              <h2>{detailsText.projectsList}</h2>
              <div className={styles.related_projects_wrapper}>
                {relatedProjects.map(({ id, title, logo }, index) => (
                  <div
                    key={id}
                    ref={(el) => {
                      relatedCardRefs.current[index] = el
                    }}
                  >
                    <SmallCard
                      label={title}
                      logo={logo}
                      onClick={() => handleProjectCardClick(id)}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.contact_container} ref={contactCtaRef}>
                <LargeTextButton
                  title={detailsText.ctaButton}
                  icon="ArrowRight"
                  onClick={handleContactReturn}
                  aria-label="Back to contact section"
                />
              </div>
            </div>
          ) : null}
          
        </SectionWrapper>
      </HeroWrapper>
    </div>
  )
}
