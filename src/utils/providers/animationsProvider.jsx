import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useNavContext } from './navProvider'
import { useI18n } from './lang/langProvider'
import { usePageTransitionContext } from './pageTransitionProvider'

gsap.registerPlugin(ScrollTrigger)

const AnimationsContext = createContext(null)

const SECTION_STATES = {
  INACTIVE: 'inactive',
  ENTERING: 'entering',
  ACTIVE: 'active',
  LEAVING: 'leaving',
}

const LANGUAGE_SWITCH_MS = 260

export function AnimationsProvider({ children }) {
  const { scrollDirection } = useNavContext()
  const { locale } = useI18n()
  const { isTransitioning } = usePageTransitionContext()
  const sectionsRef = useRef(new Map())
  const subscribersRef = useRef(new Map())
  const refreshFrameRef = useRef(null)
  const languageTimerRef = useRef(null)
  const previousLocaleRef = useRef(locale)
  const [sectionStates, setSectionStates] = useState({})
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false)
  const [isLanguageSwitching, setIsLanguageSwitching] = useState(false)

  const emitSectionEvent = useCallback((sectionId, type, payload = {}) => {
    const listeners = subscribersRef.current.get(sectionId)
    if (!listeners?.size) return

    const event = {
      type,
      sectionId,
      scrollDirection,
      isProgrammaticScroll,
      isLanguageSwitching,
      isRouteTransitioning: isTransitioning,
      ...payload,
    }

    listeners.forEach((listener) => listener(event))
  }, [isLanguageSwitching, isProgrammaticScroll, isTransitioning, scrollDirection])

  const updateSectionState = useCallback((sectionId, nextState) => {
    setSectionStates((prev) => {
      if (prev[sectionId] === nextState) return prev
      return {
        ...prev,
        [sectionId]: nextState,
      }
    })
  }, [])

  const getNavOffset = useCallback(() => {
    if (typeof document === 'undefined') return 0
    const navEl = document.querySelector('header')
    if (!navEl) return 0
    return navEl.getBoundingClientRect().height + 4
  }, [])

  const destroySectionTrigger = useCallback((sectionId) => {
    const entry = sectionsRef.current.get(sectionId)
    if (!entry?.trigger) return
    entry.trigger.kill()
    entry.trigger = null
  }, [])

  const createSectionTrigger = useCallback((sectionId) => {
    const entry = sectionsRef.current.get(sectionId)
    if (!entry?.element) return

    destroySectionTrigger(sectionId)

    entry.trigger = ScrollTrigger.create({
      trigger: entry.element,
      start: () => `top top+=${getNavOffset()}`,
      end: () => `bottom top+=${getNavOffset()}`,
      onEnter: (self) => {
        updateSectionState(sectionId, SECTION_STATES.ENTERING)
        emitSectionEvent(sectionId, 'section:enter', { progress: self.progress })
        updateSectionState(sectionId, SECTION_STATES.ACTIVE)
      },
      onEnterBack: (self) => {
        updateSectionState(sectionId, SECTION_STATES.ENTERING)
        emitSectionEvent(sectionId, 'section:enterBack', { progress: self.progress })
        updateSectionState(sectionId, SECTION_STATES.ACTIVE)
      },
      onLeave: (self) => {
        updateSectionState(sectionId, SECTION_STATES.LEAVING)
        emitSectionEvent(sectionId, 'section:leave', { progress: self.progress })
        updateSectionState(sectionId, SECTION_STATES.INACTIVE)
      },
      onLeaveBack: (self) => {
        updateSectionState(sectionId, SECTION_STATES.LEAVING)
        emitSectionEvent(sectionId, 'section:leaveBack', { progress: self.progress })
        updateSectionState(sectionId, SECTION_STATES.INACTIVE)
      },
      onUpdate: (self) => {
        if (self.isActive) {
          updateSectionState(sectionId, SECTION_STATES.ACTIVE)
        }
        emitSectionEvent(sectionId, 'section:progress', { progress: self.progress })
      },
      onRefresh: (self) => {
        emitSectionEvent(sectionId, 'section:refresh', { progress: self.progress })
      },
    })
  }, [destroySectionTrigger, emitSectionEvent, getNavOffset, updateSectionState])

  const scheduleRefresh = useCallback(() => {
    if (refreshFrameRef.current) {
      window.cancelAnimationFrame(refreshFrameRef.current)
    }

    refreshFrameRef.current = window.requestAnimationFrame(() => {
      refreshFrameRef.current = null
      sectionsRef.current.forEach((_, sectionId) => createSectionTrigger(sectionId))
      ScrollTrigger.refresh()
    })
  }, [createSectionTrigger])

  const registerSection = useCallback((sectionId, element = null) => {
    if (!sectionId) return () => {}

    const resolvedElement = element || document.getElementById(sectionId)
    if (!resolvedElement) return () => {}

    const existing = sectionsRef.current.get(sectionId)
    sectionsRef.current.set(sectionId, {
      element: resolvedElement,
      trigger: existing?.trigger ?? null,
    })

    setSectionStates((prev) => {
      if (sectionId in prev) return prev
      return {
        ...prev,
        [sectionId]: SECTION_STATES.INACTIVE,
      }
    })

    createSectionTrigger(sectionId)
    scheduleRefresh()

    return () => {
      destroySectionTrigger(sectionId)
      sectionsRef.current.delete(sectionId)
      subscribersRef.current.delete(sectionId)
      setSectionStates((prev) => {
        if (!(sectionId in prev)) return prev
        const next = { ...prev }
        delete next[sectionId]
        return next
      })
    }
  }, [createSectionTrigger, destroySectionTrigger, scheduleRefresh])

  const subscribeToSection = useCallback((sectionId, handler) => {
    if (!sectionId || typeof handler !== 'function') return () => {}

    if (!subscribersRef.current.has(sectionId)) {
      subscribersRef.current.set(sectionId, new Set())
    }

    const listeners = subscribersRef.current.get(sectionId)
    listeners.add(handler)

    return () => {
      listeners.delete(handler)
      if (!listeners.size) {
        subscribersRef.current.delete(sectionId)
      }
    }
  }, [])

  const suspendSection = useCallback((sectionId, reason = 'manual') => {
    updateSectionState(sectionId, SECTION_STATES.INACTIVE)
    emitSectionEvent(sectionId, 'section:suspend', { reason })
  }, [emitSectionEvent, updateSectionState])

  const resumeSection = useCallback((sectionId, reason = 'manual') => {
    emitSectionEvent(sectionId, 'section:resume', { reason })
    emitSectionEvent(sectionId, 'section:refresh', { reason })
  }, [emitSectionEvent])

  useEffect(() => {
    if (previousLocaleRef.current === locale) return

    previousLocaleRef.current = locale
    setIsLanguageSwitching(true)
    sectionsRef.current.forEach((_, sectionId) => {
      suspendSection(sectionId, 'language')
    })

    if (languageTimerRef.current) {
      window.clearTimeout(languageTimerRef.current)
    }

    languageTimerRef.current = window.setTimeout(() => {
      setIsLanguageSwitching(false)
      sectionsRef.current.forEach((_, sectionId) => {
        resumeSection(sectionId, 'language')
      })
      languageTimerRef.current = null
    }, LANGUAGE_SWITCH_MS)
  }, [locale, resumeSection, suspendSection])

  useEffect(() => {
    sectionsRef.current.forEach((_, sectionId) => {
      if (isTransitioning) {
        emitSectionEvent(sectionId, 'section:suspend', { reason: 'route-transition' })
      } else {
        emitSectionEvent(sectionId, 'section:resume', { reason: 'route-transition' })
      }
    })
  }, [emitSectionEvent, isTransitioning])

  useEffect(() => {
    const handleResize = () => scheduleRefresh()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [scheduleRefresh])

  useEffect(() => () => {
    if (refreshFrameRef.current) {
      window.cancelAnimationFrame(refreshFrameRef.current)
    }
    if (languageTimerRef.current) {
      window.clearTimeout(languageTimerRef.current)
    }
    sectionsRef.current.forEach((_, sectionId) => destroySectionTrigger(sectionId))
  }, [destroySectionTrigger])

  const value = useMemo(() => ({
    registerSection,
    subscribeToSection,
    suspendSection,
    resumeSection,
    sectionStates,
    getSectionState: (sectionId) => sectionStates[sectionId] ?? SECTION_STATES.INACTIVE,
    scrollDirection,
    isProgrammaticScroll,
    setIsProgrammaticScroll,
    isLanguageSwitching,
    isRouteTransitioning: isTransitioning,
  }), [
    isLanguageSwitching,
    isProgrammaticScroll,
    isTransitioning,
    registerSection,
    resumeSection,
    scrollDirection,
    sectionStates,
    subscribeToSection,
    suspendSection,
  ])

  return <AnimationsContext.Provider value={value}>{children}</AnimationsContext.Provider>
}

export function useAnimationsContext() {
  const context = useContext(AnimationsContext)
  if (!context) {
    throw new Error('useAnimationsContext must be used within an AnimationsProvider')
  }
  return context
}
