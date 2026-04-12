import styles from './slideCounter.module.css'

function SlideCounter({
  label,
  loadPercent,
  activeIndicatorCount,
  currentSlideNumber,
  totalSlides,
  containerRef,
  indicatorRefs,
  labelRef,
  numberRef,
}) {
  const indicatorCount = 9

  return (
    <div className={styles.indicatorContainer} ref={containerRef}>
      <div className={styles.indicatorsContainer}>
        {Array.from({ length: indicatorCount }, (_, index) => (
          <span
            key={index + 1}
            ref={(el) => {
              if (indicatorRefs) {
                indicatorRefs.current[index] = el
              }
            }}
            className={`${styles.indicator} ${index >= indicatorCount - activeIndicatorCount ? styles.indicatorActive : ''}`}
          />
        ))}
      </div>
      <div className={styles.indicatorTextContainer}>
        <p className={styles.label} ref={labelRef}>{label} {loadPercent}%</p>
        <h3 ref={numberRef}>{currentSlideNumber}/{totalSlides}</h3>
      </div>
    </div>
  )
}

export default SlideCounter
