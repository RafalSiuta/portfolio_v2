import { useEffect, useRef } from 'react'
import styles from './particlesBackground.module.css'

export default function ParticlesBackground({ children, className = '', ...rest }) {
  const canvasContainer = useRef(null)
  const resizeObserverRef = useRef(null)

  useEffect(() => {
    let p5Constructor
    let sketchInstance

    const sketch = (p) => {
      const spacing = 68
      let dots = []
      let dotColor = '#3F3F3F'
      let lastDpr = 1

      const resolveDotColor = () => {
        const target = canvasContainer.current || document.documentElement
        const colorValue = getComputedStyle(target).getPropertyValue('--pattern-color').trim()
        dotColor = colorValue || '#3F3F3F'
      }

      const getContainerSize = () => {
        const el = canvasContainer.current
        if (!el) return { w: window.innerWidth, h: window.innerHeight }
        const rect = el.getBoundingClientRect()
        return { w: Math.max(1, Math.round(rect.width)), h: Math.max(1, Math.round(rect.height)) }
      }

      const setPixelDensity = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        if (dpr !== lastDpr) {
          p.pixelDensity(dpr)
          lastDpr = dpr
        }
      }

      const buildGrid = () => {
        const { w, h } = getContainerSize()
        dots = []
        // start from half spacing to avoid clipping on edges
        for (let x = spacing / 2; x < w; x += spacing) {
          for (let y = spacing / 2; y < h; y += spacing) {
            dots.push({ x, y })
          }
        }
      }

      const drawDots = () => {
        p.clear()
        p.noStroke()
        p.fill(dotColor)
        dots.forEach(({ x, y }) => p.circle(x, y, 2.25))
      }

      const forceResize = () => {
        const { w, h } = getContainerSize()
        setPixelDensity()
        p.resizeCanvas(w, h, true)
        resolveDotColor()
        buildGrid()
        p.redraw()
      }

      p.__forceResize = forceResize

      p.setup = () => {
        const { w, h } = getContainerSize()
        setPixelDensity()
        const canvas = p.createCanvas(w, h)
        canvas.parent(canvasContainer.current)

        p.noLoop()
        resolveDotColor()
        buildGrid()
        p.redraw()
      }

      p.draw = () => {
        const currentDpr = Math.min(2, window.devicePixelRatio || 1)
        if (currentDpr !== lastDpr) {
          forceResize()
        }
        drawDots()
      }

      p.windowResized = () => {
        forceResize()
      }
    }

    import('p5').then((p5Module) => {
      p5Constructor = p5Module.default
      sketchInstance = new p5Constructor(sketch)

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
    }
  }, [])

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      <div
        ref={canvasContainer}
        className={styles.canvasHost}
        aria-hidden="true"
      />
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}
