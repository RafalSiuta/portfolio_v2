import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './sideIndicator.module.css'
import { useNavContext } from '../../utils/providers/navProvider'

function clampPercent(value) {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

function SideIndicator() {
  const { pageCounter, scrollProgress } = useNavContext()
  const displayValue = useMemo(() => String(pageCounter + 1).padStart(2, '0'), [pageCounter])
  const progressPercent = clampPercent(scrollProgress)
  const topFillRef = useRef(null)
  const bottomFillRef = useRef(null)
  const previousProgressRef = useRef(progressPercent)

  useEffect(() => {
    const prev = previousProgressRef.current
    const isResetting = progressPercent < prev
    const duration = isResetting ? 0.5 : 0.25
    const ease = isResetting ? 'power3.inOut' : 'power2.out'

    const animateFill = (element, invert = false) => {
      if (!element) return
      const targetScale = progressPercent / 100
      gsap.to(element, {
        scaleY: targetScale,
        transformOrigin: invert ? 'bottom center' : 'top center',
        duration,
        ease,
      })

    }

    animateFill(topFillRef.current, false)
    animateFill(bottomFillRef.current, true)
    previousProgressRef.current = progressPercent
  }, [progressPercent])

  return (
    <aside className={styles.container} aria-hidden="true">
      <div className={`${styles.progressBar} ${styles.progressBarTop}`} role="presentation">
        <span ref={topFillRef} className={styles.progressFill} aria-hidden="true" />
      </div>
      <h3 className={styles.label}>{displayValue}</h3>
      <div className={`${styles.progressBar} ${styles.progressBarBottom}`} role="presentation">
        <span ref={bottomFillRef} className={styles.progressFill} aria-hidden="true" />
      </div>
    </aside>
  )
}

export default SideIndicator
