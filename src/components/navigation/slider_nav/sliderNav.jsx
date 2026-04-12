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
      <div className={styles.cardsContainer}>{children}</div>
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
