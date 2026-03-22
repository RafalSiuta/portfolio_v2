import styles from './sliderNav.module.css'
import IconButton from '../../buttons/icon_button/icon_button'
import SlideCounter from '../slide_counter/slideCounter'

function SliderNav({
  counterLabel,
  nextProject,
  prevProject,
  loadPercent,
  activeIndicatorCount,
  currentSlideNumber,
  totalSlides,
  children,
}) {
  return (
    <div className={styles.projectCardsContainer}>
      <div className={styles.navButtonsContainer}>
        <IconButton
          iconName="ArrowThinLeft"
          onClick={nextProject}
          className={styles.navButtonLeft}
          iconClassName={styles.navIconLeft}
          style={{ '--icon-hover-shift': 'calc(var(--icon-button-width) * 0.18)' }}
        />
        <IconButton
          iconName="ArrowThinRight"
          onClick={prevProject}
          className={styles.navButtonRight}
          iconClassName={styles.navIconRight}
          style={{ '--icon-hover-shift': 'calc(var(--icon-button-width) * 0.18)' }}
        />
      </div>
      <div className={styles.cardsContainer}>{children}</div>
      <SlideCounter
        label={counterLabel}
        loadPercent={loadPercent}
        activeIndicatorCount={activeIndicatorCount}
        currentSlideNumber={currentSlideNumber}
        totalSlides={totalSlides}
      />
    </div>
  )
}

export default SliderNav
