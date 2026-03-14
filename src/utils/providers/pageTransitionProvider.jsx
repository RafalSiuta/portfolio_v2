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

export function PageTransitionProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { lastSectionId, rememberLastSection, scrollToSectionId } = useNavContext()
  const isDetailRoute = matchesDetailRoute(location.pathname)
  const [isCurtainClosed, setIsCurtainClosed] = useState(() => isDetailRoute)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const curtainStateRef = useRef(isDetailRoute ? 'closed' : 'open')
  const pendingCurtainActionRef = useRef(null)
  const pendingLandingSectionIdRef = useRef(null)
  const transitionDirectionRef = useRef(null)
  const previousPathnameRef = useRef(location.pathname)

  const settleCurtain = useCallback((targetState) => {
    curtainStateRef.current = targetState

    const pendingAction = pendingCurtainActionRef.current
    if (!pendingAction || pendingAction.target !== targetState) return

    pendingCurtainActionRef.current = null
    pendingAction.resolve()
  }, [])

  const requestCurtainState = useCallback((targetState) => {
    if (curtainStateRef.current === targetState && !pendingCurtainActionRef.current) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      pendingCurtainActionRef.current = { target: targetState, resolve }
      setIsCurtainClosed(targetState === 'closed')
    })
  }, [])

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

  const returnToSection = useCallback((sectionId) => {
    if (isTransitioning) return

    const targetSectionId = sectionId || lastSectionId || 'home'
    rememberLastSection(targetSectionId)
    pendingLandingSectionIdRef.current = targetSectionId
    transitionDirectionRef.current = 'to-landing'
    setIsTransitioning(true)
    navigate(`/#${targetSectionId}`)
  }, [isTransitioning, lastSectionId, navigate, rememberLastSection])

  useEffect(() => {
    const previousPathname = previousPathnameRef.current
    previousPathnameRef.current = location.pathname

    if (isDetailRoute) {
      if (curtainStateRef.current !== 'closed' && !pendingCurtainActionRef.current) {
        curtainStateRef.current = 'closed'
        setIsCurtainClosed(true)
      }

      if (transitionDirectionRef.current === 'to-detail') {
        finishTransition()
      }
      return
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

  const value = useMemo(() => ({
    isCurtainClosed,
    isDetailRoute,
    isTransitioning,
    navigateToDetail,
    returnToSection,
    handleCurtainClosed: () => settleCurtain('closed'),
    handleCurtainOpened: () => settleCurtain('open'),
  }), [
    isCurtainClosed,
    isDetailRoute,
    isTransitioning,
    navigateToDetail,
    returnToSection,
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
