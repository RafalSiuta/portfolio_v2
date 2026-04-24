import { useCallback, useRef } from 'react'
import styles from './sliderNav.module.css'
import SlideCounter from '../slide_counter/slideCounter'
import SlideController from '../nav/slide_controller/slideController'

function SliderNav({
  counterLabel,
  nextProject,
  prevProject,
  pauseProject,
  isAutoplayPaused = false,
  loadPercent,
  activeIndicatorCount,
  currentSlideNumber,
  totalSlides,
  children,
  navButtonsRef,
  counterContainerRef,
  counterIndicatorRefs,
  counterLabelRef,
  counterNumberRef,
}) {
  const cardsContainerRef = useRef(null)
  const dragStateRef = useRef({
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    hasDragged: false,
    hasPointerCapture: false,
  })

  const handleCardsPointerDown = useCallback((event) => {
    const container = cardsContainerRef.current
    if (!container) return

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
      hasDragged: false,
      hasPointerCapture: false,
    }
  }, [])

  const handleCardsPointerMove = useCallback((event) => {
    const container = cardsContainerRef.current
    const dragState = dragStateRef.current
    if (!container || dragState.pointerId !== event.pointerId) return

    const deltaX = event.clientX - dragState.startX
    if (Math.abs(deltaX) > 4) {
      dragState.hasDragged = true
    }

    if (!dragState.hasDragged) return

    if (!dragState.hasPointerCapture) {
      container.setPointerCapture(event.pointerId)
      dragState.hasPointerCapture = true
    }

    container.scrollLeft = dragState.startScrollLeft - deltaX
    event.preventDefault()
  }, [])

  const clearCardsDrag = useCallback((event) => {
    const container = cardsContainerRef.current
    const dragState = dragStateRef.current
    if (!container || dragState.pointerId !== event.pointerId) return

    if (dragState.hasPointerCapture && container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId)
    }

    dragStateRef.current = {
      pointerId: null,
      startX: 0,
      startScrollLeft: 0,
      hasDragged: dragState.hasDragged,
      hasPointerCapture: false,
    }

    window.setTimeout(() => {
      dragStateRef.current.hasDragged = false
    }, 0)
  }, [])

  const handleCardsClickCapture = useCallback((event) => {
    if (!dragStateRef.current.hasDragged) return
    event.preventDefault()
    event.stopPropagation()
  }, [])

  return (
    <div className={styles.projectCardsContainer}>
      <div className={styles.navButtonsContainer} ref={navButtonsRef}>
        <SlideController
          prev={nextProject}
          pause={pauseProject}
          next={prevProject}
          isPaused={isAutoplayPaused}
        />
      </div>
      <div
        className={styles.cardsContainer}
        ref={cardsContainerRef}
        onPointerDown={handleCardsPointerDown}
        onPointerMove={handleCardsPointerMove}
        onPointerUp={clearCardsDrag}
        onPointerCancel={clearCardsDrag}
        onClickCapture={handleCardsClickCapture}
        onDragStart={(event) => event.preventDefault()}
      >
        {children}
      </div>
      <SlideCounter
        label={counterLabel}
        loadPercent={loadPercent}
        activeIndicatorCount={activeIndicatorCount}
        currentSlideNumber={currentSlideNumber}
        totalSlides={totalSlides}
        containerRef={counterContainerRef}
        indicatorRefs={counterIndicatorRefs}
        labelRef={counterLabelRef}
        numberRef={counterNumberRef}
      />
    </div>
  )
}

export default SliderNav
