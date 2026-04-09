import SystemIcon from '../../../../utils/icons/system_icon'
import styles from './slideController.module.css'

function SlideController({
  prev,
  next,
  pause,
  isPaused = false,
  className = '',
}) {
  const combinedClassName = [styles.controller, className].filter(Boolean).join(' ')

  return (
    <div className={combinedClassName}>
      <button
        type="button"
        className={styles.iconButton}
        onClick={prev}
        aria-label="Previous slide"
      >
        <SystemIcon name="ArrowThinLeft" className={styles.icon} aria-hidden="true" focusable="false" />
      </button>
      <button
        type="button"
        className={styles.iconButton}
        onClick={pause}
        aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
        aria-pressed={isPaused}
      >
        <span className={styles.toggleIcon} aria-hidden="true">
          <SystemIcon
            name="Pause"
            className={`${styles.icon} ${styles.toggleIconItem} ${!isPaused ? styles.toggleIconVisible : ''}`}
            focusable="false"
          />
          <SystemIcon
            name="PlayArrow"
            className={`${styles.icon} ${styles.toggleIconItem} ${isPaused ? styles.toggleIconVisible : ''}`}
            focusable="false"
          />
        </span>
      </button>
      <button
        type="button"
        className={styles.iconButton}
        onClick={next}
        aria-label="Next slide"
      >
        <SystemIcon name="ArrowThinRight" className={styles.icon} aria-hidden="true" focusable="false" />
      </button>
    </div>
  )
}

export default SlideController
