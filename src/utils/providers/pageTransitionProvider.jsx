import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { useNavContext } from './navProvider'

const PageTransitionContext = createContext(null)
const DETAIL_ROUTE_PATTERNS = ['/projects/:projectId', '/r85']

function matchesDetailRoute(pathname) {
  return DETAIL_ROUTE_PATTERNS.some((pattern) => matchPath(pattern, pathname))
}

function waitForNextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

function waitForTimeout(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function PageTransitionProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { lastSectionId, rememberLastSection, scrollToSectionId } = useNavContext()
  const isDetailRoute = matchesDetailRoute(location.pathname)
  const [isCurtainClosed, setIsCurtainClosed] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isDetailFooterVisible, setIsDetailFooterVisible] = useState(false)
  const curtainStateRef = useRef('open')
  const pendingCurtainActionRef = useRef(null)
  const pendingLandingSectionIdRef = useRef(null)
  const transitionDirectionRef = useRef(null)
  const previousPathnameRef = useRef(null)
  const curtainFailsafeTimeoutRef = useRef(null)

  const clearCurtainFailsafe = useCallback(() => {
    if (!curtainFailsafeTimeoutRef.current) return
    window.clearTimeout(curtainFailsafeTimeoutRef.current)
    curtainFailsafeTimeoutRef.current = null
  }, [])

  const settleCurtain = useCallback((targetState) => {
    clearCurtainFailsafe()
    curtainStateRef.current = targetState

    const pendingAction = pendingCurtainActionRef.current
    if (!pendingAction || pendingAction.target !== targetState) return

    pendingCurtainActionRef.current = null
    pendingAction.resolve()
  }, [clearCurtainFailsafe])

  const requestCurtainState = useCallback((targetState) => {
    if (curtainStateRef.current === targetState && !pendingCurtainActionRef.current) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      clearCurtainFailsafe()
      pendingCurtainActionRef.current = { target: targetState, resolve }
      setIsCurtainClosed(targetState === 'closed')

      curtainFailsafeTimeoutRef.current = window.setTimeout(() => {
        if (!pendingCurtainActionRef.current || pendingCurtainActionRef.current.target !== targetState) {
          curtainFailsafeTimeoutRef.current = null
          return
        }

        curtainFailsafeTimeoutRef.current = null
        curtainStateRef.current = targetState
        pendingCurtainActionRef.current = null

        if (targetState === 'open') {
          setIsCurtainClosed(false)
        }

        resolve()
      }, 2000)
    })
  }, [clearCurtainFailsafe])

  const closeCurtain = useCallback(() => requestCurtainState('closed'), [requestCurtainState])
  const openCurtain = useCallback(() => requestCurtainState('open'), [requestCurtainState])

  const finishTransition = useCallback(() => {
    transitionDirectionRef.current = null
    setIsTransitioning(false)
  }, [])

  const navigateToDetail = useCallback(async (path, { fromSectionId } = {}) => {
    if (!path || isTransitioning) return

    const activeElement = document.activeElement
    if (activeElement && typeof activeElement.blur === 'function') {
      activeElement.blur()
    }

    const sourceSectionId = fromSectionId || lastSectionId || 'home'
    rememberLastSection(sourceSectionId)
    transitionDirectionRef.current = 'to-detail'
    setIsTransitioning(true)
    await closeCurtain()
    navigate(path)
  }, [closeCurtain, isTransitioning, lastSectionId, navigate, rememberLastSection])

  const returnToSection = useCallback(async (sectionId) => {
    if (isTransitioning) return

    const activeElement = document.activeElement
    if (activeElement && typeof activeElement.blur === 'function') {
      activeElement.blur()
    }

    const targetSectionId = sectionId || lastSectionId || 'home'
    rememberLastSection(targetSectionId)
    pendingLandingSectionIdRef.current = targetSectionId
    transitionDirectionRef.current = 'to-landing'
    setIsTransitioning(true)
    await closeCurtain()
    navigate(`/#${targetSectionId}`)
  }, [closeCurtain, isTransitioning, lastSectionId, navigate, rememberLastSection])

  useEffect(() => {
    const previousPathname = previousPathnameRef.current
    previousPathnameRef.current = location.pathname

    if (isDetailRoute) {
      const shouldRevealDetail = transitionDirectionRef.current === 'to-detail'

      if (!shouldRevealDetail) {
        return
      }

      let isCancelled = false

      const revealDetail = async () => {
        if (curtainStateRef.current !== 'closed' && !pendingCurtainActionRef.current) {
          curtainStateRef.current = 'closed'
          setIsCurtainClosed(true)
        }

        await waitForNextFrame()
        if (isCancelled) return

        await openCurtain()
        if (isCancelled) return

        finishTransition()
      }

      revealDetail()

      return () => {
        isCancelled = true
      }
    }

    const shouldRevealLanding = transitionDirectionRef.current === 'to-landing'
      || previousPathname !== location.pathname
      || !!pendingLandingSectionIdRef.current

    if (!shouldRevealLanding || previousPathname === location.pathname && !pendingLandingSectionIdRef.current) {
      return
    }

    let isCancelled = false

    const revealLanding = async () => {
      const hashSectionId = location.hash?.replace('#', '')
      const targetSectionId = pendingLandingSectionIdRef.current || hashSectionId || lastSectionId || 'home'

      await waitForNextFrame()
      if (isCancelled) return

      scrollToSectionId(targetSectionId, { immediate: true, updatePageCounter: true })
      await waitForNextFrame()
      if (isCancelled) return

      await openCurtain()
      if (isCancelled) return

      pendingLandingSectionIdRef.current = null
      finishTransition()
    }

    revealLanding()

    return () => {
      isCancelled = true
    }
  }, [
    finishTransition,
    isDetailRoute,
    lastSectionId,
    location.hash,
    location.pathname,
    openCurtain,
    scrollToSectionId,
  ])

  useEffect(() => {
    return () => {
      clearCurtainFailsafe()
    }
  }, [clearCurtainFailsafe])

  useEffect(() => {
    if (isDetailRoute) return
    setIsDetailFooterVisible(false)
  }, [isDetailRoute, location.pathname])

  const value = useMemo(() => ({
    isCurtainClosed,
    isDetailRoute,
    isDetailFooterVisible,
    isTransitioning,
    navigateToDetail,
    returnToSection,
    setIsDetailFooterVisible,
    handleCurtainClosed: () => settleCurtain('closed'),
    handleCurtainOpened: () => settleCurtain('open'),
  }), [
    isCurtainClosed,
    isDetailRoute,
    isDetailFooterVisible,
    isTransitioning,
    navigateToDetail,
    returnToSection,
    setIsDetailFooterVisible,
    settleCurtain,
  ])

  return <PageTransitionContext.Provider value={value}>{children}</PageTransitionContext.Provider>
}

export function usePageTransitionContext() {
  const context = useContext(PageTransitionContext)

  if (!context) {
    throw new Error('usePageTransitionContext must be used within a PageTransitionProvider')
  }

  return context
}
