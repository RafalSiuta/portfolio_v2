import { useEffect, useRef } from 'react'
import styles from './heroWrapper.module.css'

export default function HeroWrapper({ className, images, isLastSection = false, children, style, ...props }) {
  const combinedClassName = [styles.heroWrapper, className].filter(Boolean).join(' ')
  const canvasContainer = useRef(null)
  const resizeObserverRef = useRef(null)
  const sketchRef = useRef(null)
  const scrollTimeoutRef = useRef(null)

  useEffect(() => {
    if (!images) return undefined

    let p5Constructor
    let sketchInstance

    const pickImageForWidth = (width) => {
      if (!images) return ''
      if (width <= 500) return images.mobile || images.tablet || images.desktop || ''
      if (width <= 1024) return images.tablet || images.desktop || images.mobile || ''
      return images.desktop || images.tablet || images.mobile || ''
    }

    const sketch = (p) => {
      let img = null
      let currentSrc = ''
      let containerSize = { w: 1, h: 1 }
      let lastDpr = 1
      let temporaryArcValue = 0
      let tempArcDirection = 1
      let scrollArcRatio = 0
      let maxCornerOffset = 150
      let lastTickMs = 0
      const testMode = false

      const getContainerSize = () => {
        const el = canvasContainer.current
        if (!el) return { w: window.innerWidth, h: window.innerHeight }
        const rect = el.getBoundingClientRect()
        return {
          w: Math.max(1, Math.round(rect.width)),
          h: Math.max(1, Math.round(rect.height)),
        }
      }

      const setPixelDensity = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        if (dpr !== lastDpr) {
          p.pixelDensity(dpr)
          lastDpr = dpr
        }
      }

      const loadImageForWidth = (width) => {
        const src = pickImageForWidth(width)
        if (!src || src === currentSrc) return
        currentSrc = src
        p.loadImage(
          src,
          (loaded) => {
            img = loaded
            p.redraw()
          },
          () => {}
        )
      }

      const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

      const drawCoverImage = () => {
        if (!img) return
        const { w, h } = containerSize
        const scale = Math.max(w / img.width, h / img.height)
        const drawW = img.width * scale
        const drawH = img.height * scale
        const x = (w - drawW) / 2
        const y = (h - drawH) / 2
        const ctx = p.drawingContext
        const baseArcDepth = 200
        maxCornerOffset = Math.min(baseArcDepth, h * 0.4)
       
        // console.log(`scroll arc value: ${scrollArcValue}`);
        // const now = p.millis()
        // const dt = Math.max(0, now - lastTickMs)
        // lastTickMs = now
        // const speedPxPerSec = 300
        // scrollArcValue += (speedPxPerSec * dt * tempArcDirection) / 1000
        // if (scrollArcValue >= maxCornerOffset) {
        //   scrollArcValue = maxCornerOffset
        //   tempArcDirection = -1
        // } else if (scrollArcValue <= 0) {
        //   scrollArcValue = 0
        //   tempArcDirection = 1
        // }

        const arcDepth = testMode
          ? Math.max(0, Math.min(maxCornerOffset, scrollArcValue))
          : maxCornerOffset * Math.max(0, Math.min(1, scrollArcRatio * 6))

        
        ctx.save()
        ctx.beginPath()
        if (isLastSection) {
          ctx.moveTo(0, 0)
          ctx.quadraticCurveTo(w / 2, arcDepth, w, 0)
          ctx.lineTo(w, h)
          ctx.lineTo(0, h)
          ctx.closePath()
        } else {
          ctx.moveTo(0, 0)
          ctx.lineTo(w, 0)
          ctx.lineTo(w, h)
          ctx.quadraticCurveTo(w / 2, h - arcDepth, 0, h)
          ctx.closePath()
        }

        console.log(`scroll arc depth: ${arcDepth}`);
        ctx.clip()
       

        p.image(img, x, y, drawW, drawH)
        ctx.restore()
         
      }

      const forceResize = () => {
        containerSize = getContainerSize()
        setPixelDensity()
        p.resizeCanvas(containerSize.w, containerSize.h, true)
        loadImageForWidth(containerSize.w)
        p.redraw()
      }

      const updateTemporaryArc = () => {
        const now = p.millis()
        const dt = Math.max(0, now - lastTickMs)
        lastTickMs = now
        const speedPxPerSec = 300
        scrollArcValue += (speedPxPerSec * dt * tempArcDirection) / 1000
        if (scrollArcValue >= maxCornerOffset) {
          scrollArcValue = maxCornerOffset
          tempArcDirection = -1
        } else if (scrollArcValue <= 0) {
          scrollArcValue = 0
          tempArcDirection = 1
        }
        console.log(`temporary arc: ${scrollArcValue}`);
      }

      p.__forceResize = forceResize
      p.__setScrollValue = (ratio) => {
        const nextRatio = Math.max(0, Math.min(1, ratio))
        scrollArcRatio = nextRatio
        p.redraw()
      }
      p.setup = () => {
        containerSize = getContainerSize()
        setPixelDensity()
        const canvas = p.createCanvas(containerSize.w, containerSize.h)
        canvas.parent(canvasContainer.current)
        lastTickMs = p.millis()
        if (testMode) {
          p.loop()
        } else {
          p.noLoop()
        }
        loadImageForWidth(containerSize.w)
        p.redraw()
      }

      p.draw = () => {
        const currentDpr = Math.min(2, window.devicePixelRatio || 1)
        if (currentDpr !== lastDpr) {
          forceResize()
        }
        if (testMode) {
          updateTemporaryArc()
        }
        p.clear()
        drawCoverImage()
      }

      p.windowResized = () => {
        forceResize()
      }
    }

    import('p5').then((p5Module) => {
      p5Constructor = p5Module.default
      sketchInstance = new p5Constructor(sketch)
      sketchRef.current = sketchInstance

      if (canvasContainer.current && typeof ResizeObserver !== 'undefined') {
        resizeObserverRef.current = new ResizeObserver(() => {
          if (sketchInstance && typeof sketchInstance.__forceResize === 'function') {
            sketchInstance.__forceResize()
          }
        })
        resizeObserverRef.current.observe(canvasContainer.current)
      }

      window.addEventListener('orientationchange', sketchInstance.__forceResize)
    })

    return () => {
      try {
        window.removeEventListener('orientationchange', sketchInstance?.__forceResize)
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect()
        }
      } catch (_) {}
      if (sketchInstance) {
        sketchInstance.remove()
      }
      sketchRef.current = null
    }
  }, [images, isLastSection])

  useEffect(() => {
      const handleScroll = () => {
        const viewport = Math.max(1, window.innerHeight)
        const ratio = Math.min(1, Math.max(0, window.scrollY / viewport))
        if (sketchRef.current?.__setScrollValue) {
          sketchRef.current.__setScrollValue(ratio)
        }
      
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <section {...props} className={combinedClassName}>
      <div
        ref={canvasContainer}
        className={styles.canvasHost}
        aria-hidden="true"
      />
      <div className={styles.heroSurface} style={style}>
        {children}
      </div>
    </section>
  )
}

// (
//     <section {...props} className={combinedClassName}>
//       <svg className={styles.clipSvg} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
//         <defs>
//           <clipPath id={clipId} clipPathUnits="objectBoundingBox">
//             <rect x="0" y="0" width="1" height="1" />
//           </clipPath>
//         </defs>
//       </svg>
//       <div
//         className={styles.heroSurface}
//         style={{ ...backgroundStyle, ...style, clipPath: `url(#${clipId})` }}
//       >
//         {children}
//       </div>
//     </section>
//   )
    
