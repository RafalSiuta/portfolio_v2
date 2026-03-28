import { useCallback, useEffect, useRef, useState } from 'react'
import SystemIcon from '../../../utils/icons/system_icon'
import { resolveProjectImage } from '../../../utils/projects/projectImages'
import styles from './photoGrid.module.css'

const SMALL_VIEWPORT_BREAKPOINT = 1024
const MIN_INDICATOR_SIZE = 36

function PhotoGrid({ graphicsList = [], heroImages, isMobileViewport = false }) {
  const scrollContainerRef = useRef(null)
  const railRef = useRef(null)
  const indicatorRef = useRef(null)
  const pointerStateRef = useRef({
    pointerId: null,
    startPointer: 0,
    startScroll: 0,
  })
  const [isSmallViewport, setIsSmallViewport] = useState(false)
  const [indicatorStyle, setIndicatorStyle] = useState({
    size: MIN_INDICATOR_SIZE,
    offset: 0,
  })
  const [canScroll, setCanScroll] = useState(false)

  const updateBreakpoint = useCallback(() => {
    setIsSmallViewport(window.innerWidth <= SMALL_VIEWPORT_BREAKPOINT)
  }, [])

  const updateIndicator = useCallback(() => {
    const container = scrollContainerRef.current
    const rail = railRef.current
    const indicator = indicatorRef.current
    if (!container || !rail || !indicator) return

    const viewportSize = isSmallViewport ? container.clientHeight : container.clientWidth
    const contentSize = isSmallViewport ? container.scrollHeight : container.scrollWidth
    const scrollPosition = isSmallViewport ? container.scrollTop : container.scrollLeft
    const trackSize = isSmallViewport ? rail.clientHeight : rail.clientWidth
    const maxScroll = Math.max(contentSize - viewportSize, 0)
    const hasOverflow = maxScroll > 0 && trackSize > 0

    setCanScroll(hasOverflow)

    if (!trackSize) return

    if (!hasOverflow) {
      setIndicatorStyle({
        size: trackSize,
        offset: 0,
      })
      return
    }

    const size = Math.max((viewportSize / contentSize) * trackSize, MIN_INDICATOR_SIZE)
    const maxOffset = Math.max(trackSize - size, 0)
    const offset = maxScroll === 0 ? 0 : (scrollPosition / maxScroll) * maxOffset

    setIndicatorStyle({ size, offset })
  }, [isSmallViewport])

  useEffect(() => {
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => {
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, [updateBreakpoint])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    updateIndicator()
    container.addEventListener('scroll', updateIndicator, { passive: true })
    window.addEventListener('resize', updateIndicator)

    return () => {
      container.removeEventListener('scroll', updateIndicator)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [updateIndicator])

  useEffect(() => {
    updateIndicator()
  }, [graphicsList.length, updateIndicator])

  const scrollByStep = useCallback((direction) => {
    const container = scrollContainerRef.current
    if (!container) return

    const step = isSmallViewport
      ? Math.max(container.clientHeight * 0.35, 120)
      : Math.max(container.clientWidth * 0.35, 120)

    container.scrollBy({
      top: isSmallViewport ? direction * step : 0,
      left: isSmallViewport ? 0 : direction * step,
      behavior: 'smooth',
    })
  }, [isSmallViewport])

  const handleIndicatorPointerDown = useCallback((event) => {
    const container = scrollContainerRef.current
    const rail = railRef.current
    const indicator = indicatorRef.current
    if (!container || !rail || !indicator || !canScroll) return

    pointerStateRef.current = {
      pointerId: event.pointerId,
      startPointer: isSmallViewport ? event.clientY : event.clientX,
      startScroll: isSmallViewport ? container.scrollTop : container.scrollLeft,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }, [canScroll, isSmallViewport])

  const handleIndicatorPointerMove = useCallback((event) => {
    const container = scrollContainerRef.current
    const rail = railRef.current
    const indicator = indicatorRef.current
    const { pointerId, startPointer, startScroll } = pointerStateRef.current
    if (!container || !rail || !indicator || pointerId !== event.pointerId) return

    const currentPointer = isSmallViewport ? event.clientY : event.clientX
    const pointerDelta = currentPointer - startPointer
    const viewportSize = isSmallViewport ? container.clientHeight : container.clientWidth
    const contentSize = isSmallViewport ? container.scrollHeight : container.scrollWidth
    const trackSize = isSmallViewport ? rail.clientHeight : rail.clientWidth
    const maxScroll = Math.max(contentSize - viewportSize, 0)
    const maxOffset = Math.max(trackSize - indicatorStyle.size, 0)
    if (!maxScroll || !maxOffset) return

    const scrollDelta = (pointerDelta / maxOffset) * maxScroll
    const nextScroll = Math.min(Math.max(startScroll + scrollDelta, 0), maxScroll)

    if (isSmallViewport) {
      container.scrollTop = nextScroll
      return
    }

    container.scrollLeft = nextScroll
  }, [indicatorStyle.size, isSmallViewport])

  const clearPointerState = useCallback((event) => {
    if (pointerStateRef.current.pointerId !== event.pointerId) return

    pointerStateRef.current = {
      pointerId: null,
      startPointer: 0,
      startScroll: 0,
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  return (
    <div className={styles.graphics_grid_shell}>
      <div className={styles.graphics_grid_list_view} ref={scrollContainerRef}>
        {graphicsList.map((graphic, index) => (
          <div key={`${graphic.title}-${index}`} className={styles.graphic_card}>
            <div className={styles.graphic_frame}>
              <img
                src={resolveProjectImage(graphic.url, heroImages, isMobileViewport)}
                alt={graphic.title}
                onLoad={updateIndicator}
              />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.scrollbar_container} aria-hidden="true">
        <button
          type="button"
          className={styles.scrollbar_arrow}
          onClick={() => scrollByStep(-1)}
          disabled={!canScroll}
          tabIndex={-1}
        >
          <SystemIcon name="ArrowLeftSmall" className={styles.scrollbar_icon} />
        </button>
        <span className={styles.scrollbar_rail} ref={railRef}>
          <span
            className={styles.indicator}
            ref={indicatorRef}
            aria-hidden="true"
            onPointerDown={handleIndicatorPointerDown}
            onPointerMove={handleIndicatorPointerMove}
            onPointerUp={clearPointerState}
            onPointerCancel={clearPointerState}
            style={
              isSmallViewport
                ? {
                    height: `${indicatorStyle.size}px`,
                    top: `${indicatorStyle.offset}px`,
                  }
                : {
                    width: `${indicatorStyle.size}px`,
                    left: `${indicatorStyle.offset}px`,
                  }
            }
          />
        </span>
        <button
          type="button"
          className={styles.scrollbar_arrow}
          onClick={() => scrollByStep(1)}
          disabled={!canScroll}
          tabIndex={-1}
        >
          <SystemIcon name="ArrowRightSmall" className={styles.scrollbar_icon} />
        </button>
      </div>
    </div>
  )
}

export default PhotoGrid
