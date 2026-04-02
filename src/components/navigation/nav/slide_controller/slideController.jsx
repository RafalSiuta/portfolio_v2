import SystemIcon from '../../../../utils/icons/system_icon'
import styles from './slideController.module.css'

function SlideController({
  prev,
  next,
  pause,
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
        aria-label="Pause autoplay"
      >
        <SystemIcon name="Pause" className={styles.icon} aria-hidden="true" focusable="false" />
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
