import styles from './slideCounter.module.css'

function SlideCounter({
  label,
  loadPercent,
  activeIndicatorCount,
  currentSlideNumber,
  totalSlides,
}) {
  return (
    <div className={styles.indicatorContainer}>
      <div className={styles.indicatorsContainer}>
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index + 1}
            className={`${styles.indicator} ${index >= 10 - activeIndicatorCount ? styles.indicatorActive : ''}`}
          />
        ))}
      </div>
      <div className={styles.indicatorTextContainer}>
        <p className={styles.label}>{label} {loadPercent}%</p>
        <h3>{currentSlideNumber}/{totalSlides}</h3>
      </div>
    </div>
  )
}

export default SlideCounter
