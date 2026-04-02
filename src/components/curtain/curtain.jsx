import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './curtain.module.css'

const EDGE_FLAT = 'M 0 0 H 10 Q 18 50 10 100 H 0 Z'
const EDGE_SWELL = 'M 0 0 H 16 Q 98 50 16 100 H 0 Z'
const EDGE_EXIT = 'M 0 0 H 12 Q 72 50 12 100 H 0 Z'

function Curtain({ isClosed = false, onClosed, onOpened }) {
  const curtainRef = useRef(null)
  const pathRef = useRef(null)
  const isFirstRender = useRef(true)
  const onClosedRef = useRef(onClosed)
  const onOpenedRef = useRef(onOpened)

  useEffect(() => {
    onClosedRef.current = onClosed
  }, [onClosed])

  useEffect(() => {
    onOpenedRef.current = onOpened
  }, [onOpened])

  useEffect(() => {
    const curtainElement = curtainRef.current
    const pathElement = pathRef.current

    if (!curtainElement || !pathElement) return

    if (isFirstRender.current) {
      gsap.set(curtainElement, {
        xPercent: isClosed ? 0 : -100,
        x: 0,
        autoAlpha: isClosed ? 1 : 0,
      })
      gsap.set(pathElement, { attr: { d: EDGE_FLAT } })
      isFirstRender.current = false
      return
    }

    const timeline = gsap.timeline()

    if (isClosed) {
      timeline
        .set(curtainElement, { autoAlpha: 1 })
        .set(pathElement, { attr: { d: EDGE_FLAT } })
        .to(curtainElement, {
          xPercent: 0,
          duration: 0.85,
          ease: 'power3.inOut',
        }, 0)
        .to(pathElement, {
          attr: { d: EDGE_SWELL },
          duration: 0.5,
          ease: 'power2.out',
        }, 0)
        .to(pathElement, {
          attr: { d: EDGE_FLAT },
          duration: 0.3,
          ease: 'power2.in',
        }, 0.5)
        .call(() => {
          onClosedRef.current?.()
        })
    } else {
      timeline
        .set(curtainElement, { autoAlpha: 1 })
        .set(pathElement, { attr: { d: EDGE_FLAT } })
        .to(curtainElement, {
          xPercent: -100,
          duration: 0.75,
          ease: 'power3.inOut',
        }, 0)
        .to(pathElement, {
          attr: { d: EDGE_EXIT },
          duration: 0.25,
          ease: 'power2.in',
        }, 0)
        .to(pathElement, {
          attr: { d: EDGE_FLAT },
          duration: 0.25,
          ease: 'power2.out',
        }, 0.25)
        .set(curtainElement, { autoAlpha: 0 })
        .call(() => {
          onOpenedRef.current?.()
        })
    }

    return () => {
      timeline.kill()
    }
  }, [isClosed])

  return (
    <div
      ref={curtainRef}
      className={styles.curtain}
      aria-hidden="true"
    >
      <div className={styles.panel} />
      <svg
        className={styles.edge}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path ref={pathRef} className={styles.edgePath} d={EDGE_FLAT} />
      </svg>
    </div>
  )
}

export default Curtain
