import { useEffect, useMemo, useRef, useState } from 'react'
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
  const { pageCounter, scrollProgress, isMenuOpen } = useNavContext()
  const displayValue = useMemo(() => String(pageCounter + 1).padStart(2, '0'), [pageCounter])
  const progressPercent = clampPercent(scrollProgress)
  const topFillRef = useRef(null)
  const bottomFillRef = useRef(null)
  const previousProgressRef = useRef(progressPercent)
  const containerRef = useRef(null)
  const [isTabletDown, setIsTabletDown] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)')
    const handleChange = (event) => setIsTabletDown(event.matches)
    setIsTabletDown(media.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (!isTabletDown) {
      gsap.set(el, { clearProps: 'all' })
      return
    }

    if (isMenuOpen) {
      gsap.set(el, { display: 'flex' })
      gsap.fromTo(
        el,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
      )
    } else {
      gsap.to(el, {
        opacity: 0,
        x: 40,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => gsap.set(el, { display: 'none' }),
      })
    }
  }, [isMenuOpen, isTabletDown])

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
    <aside className={styles.container} aria-hidden="true" ref={containerRef}>
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
