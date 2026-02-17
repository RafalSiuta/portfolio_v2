import { useEffect, useMemo, useRef, useState, useId } from 'react'
import { gsap } from 'gsap'
import { useNavContext } from '../../utils/providers/navProvider'

const clampOverlay = (v) => (Number.isNaN(v) ? 0 : Math.min(Math.max(v, 0), 1))
const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

const getForWidth = (values, width) => {
  if (!values) return ''
  if (width <= 500) return values.mobile || values.tablet || values.desktop || ''
  if (width <= 1024) return values.tablet || values.desktop || values.mobile || ''
  return values.desktop || values.tablet || values.mobile || ''
}

// “pełne wypełnienie + dół”
const rectD = () => 'M 0 0 H 100 V 100 H 0 Z'
// dół z łukiem (Q) — punkt kontrolny na osi X=50, na Y=c
// c > 100 => łuk wypukły w dół, c < 100 => łuk w górę
const waveD = (c) => `M 0 0 H 100 V 100 Q 50 ${c} 0 100 Z`

export default function AnimatedSvgBackground({
  images,
  idleAmp = 6,
  speed = 1,
  overlay = 0.25,
  maxLift = 16, // “siła” ugięcia, w praktyce mapowana na +/- względem 100
  reactToScroll = true,
  reactToPageChange = true,
  foldDuration = 0.5,
  freezeOnReducedMotion = true,
  objectPosition = {
    desktop: '50% 50%',
    tablet: '50% 45%',
    mobile: '50% 40%',
  },
}) {
  const { scrollProgress, pageCounter } = useNavContext()

  const pathRef = useRef(null)
  const tlRef = useRef(null)
  const reducedMotionRef = useRef(false)

  const [currentImage, setCurrentImage] = useState(() => getForWidth(images, window.innerWidth))
  const [currentObjectPosition, setCurrentObjectPosition] = useState(() => getForWidth(objectPosition, window.innerWidth))

  const overlayValue = useMemo(() => clampOverlay(overlay), [overlay])

  // unikalny clipPath id (ważne przy wielu sekcjach)
  const uid = useId().replace(/:/g, '')
  const clipId = `clip-${uid}`

  useEffect(() => {
    const handleResize = () => {
      setCurrentImage(getForWidth(images, window.innerWidth))
      setCurrentObjectPosition(getForWidth(objectPosition, window.innerWidth))
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [images, objectPosition])

  // init timeline (scroll -> progress)
  useEffect(() => {
    const pathEl = pathRef.current
    if (!pathEl) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reducedMotionRef.current = prefersReducedMotion && freezeOnReducedMotion

    // start: prostokąt (brak ugięcia)
    gsap.set(pathEl, { attr: { d: rectD() } })

    if (reducedMotionRef.current) return

    // “100” to linia dołu. Ugięcie robimy względem 100.
    // maxLift np. 16 => center idzie do 100 + 16 (wypukle w dół)
    const capped = clamp(Number.isFinite(maxLift) ? maxLift : 16, 6, 22)
    const maxCenter = 100 + capped

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
    tl.to(pathEl, { attr: { d: waveD(maxCenter) }, duration: 1 }, 0)

    tlRef.current = tl
    return () => {
      tlRef.current = null
      tl.kill()
    }
  }, [maxLift, freezeOnReducedMotion])

  // react to scrollProgress
  useEffect(() => {
    const tl = tlRef.current
    if (!tl || !reactToScroll) return
    tl.progress(clamp((scrollProgress ?? 0) / 100, 0, 1))
  }, [scrollProgress, reactToScroll])

  // small “fold” when page changes (klik w menu / next)
  useEffect(() => {
    const pathEl = pathRef.current
    if (!pathEl || !reactToPageChange) return
    if (reducedMotionRef.current) return

    const amp = clamp(Number.isFinite(idleAmp) ? idleAmp : 6, 2, 10)
    const foldCenter = 100 + amp // lekki “bump” w dół

    gsap
      .fromTo(
        pathEl,
        { attr: { d: rectD() } },
        {
          attr: { d: waveD(foldCenter) },
          duration: Math.max(0.2, foldDuration / 2),
          repeat: 1,
          yoyo: true,
          ease: 'sine.inOut',
          onComplete: () => {
            const tl = tlRef.current
            if (tl && reactToScroll) tl.progress(clamp((scrollProgress ?? 0) / 100, 0, 1))
            else gsap.set(pathEl, { attr: { d: rectD() } })
          },
        }
      )
      .timeScale(Number.isFinite(speed) && speed > 0 ? speed : 1)
  }, [pageCounter, idleAmp, foldDuration, speed, reactToScroll, reactToPageChange, scrollProgress])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            {/* UWAGA: clipPathUnits=objectBoundingBox oczekuje wartości 0..1,
                więc zostawiamy clipPathUnits domyślnie (userSpaceOnUse) zamiast objectBoundingBox.
                Najprościej: USUŃ clipPathUnits całkiem.
            */}
          </clipPath>
        </defs>
      </svg>

      {/* właściwy SVG z clipPath (userSpaceOnUse) + foreignObject */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <clipPath id={clipId}>
            <path ref={pathRef} d={rectD()} />
          </clipPath>
        </defs>

        {/* tu jest “conteiner” na obraz – przycięty clipPath’em */}
        <foreignObject x="0" y="0" width="100" height="100" clipPath={`url(#${clipId})`}>
          <div style={{ width: '100%', height: '100%' }}>
            <img
              src={currentImage}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: currentObjectPosition || '50% 50%',
                display: 'block',
              }}
            />
          </div>
        </foreignObject>

        {/* overlay też przycięty tą samą krzywą */}
        {overlayValue > 0 ? (
          <path d={rectD()} fill={`rgba(0,0,0,${overlayValue})`} clipPath={`url(#${clipId})`} />
        ) : null}
      </svg>
    </div>
  )
}
