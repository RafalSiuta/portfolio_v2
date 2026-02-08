import { useEffect, useRef } from 'react'
import styles from './particlesBackground.module.css'
import { drawCircle, drawCross, drawDot, drawSquare, drawTriangle } from '../../../utils/shapes/draw_shapes'

const PATTERN_COLORS = {
  ACCENT: '#ffa84a',
  BASE: '#3F3F3F',
}

export default function ParticlesBackground({ children, className = '', contentClassName = '', ...rest }) {
  const canvasContainer = useRef(null)
  const resizeObserverRef = useRef(null)
  const sideWidth = 12.0;

  useEffect(() => {
    let p5Constructor
    let sketchInstance
    let accentTimers = []
    let accentCycleId = 0

    const clearAccentTimers = () => {
      accentTimers.forEach(clearTimeout)
      accentTimers = []
    }

    const sketch = (p) => {
      const spacing = 68
      const duration = 3000
      const delay = 500
      const fadeWindow = 400
      const minShapesPerCycle = 15
      const maxShapesPerCycle = 20
      let dots = []
      let accentShapes = []
      let dotColor = PATTERN_COLORS.BASE
      let containerSize = { w: 0, h: 0 }
      let lastDpr = 1

      const resolveDotColor = () => {
        const target = canvasContainer.current || document.documentElement
        const colorValue = getComputedStyle(target).getPropertyValue('--pattern-color').trim()
        dotColor = colorValue || PATTERN_COLORS.BASE
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

      const findNearestDotIndex = (targetX, targetY, usedIndices) => {
        let bestIndex = -1
        let bestDistance = Infinity

        dots.forEach(({ x, y }, idx) => {
          if (usedIndices.has(idx)) return
          const dist = (x - targetX) ** 2 + (y - targetY) ** 2
          if (dist < bestDistance) {
            bestDistance = dist
            bestIndex = idx
          }
        })

        return bestIndex
      }

      const selectAccentShapes = () => {
        const cycleId = ++accentCycleId
        clearAccentTimers()
        accentShapes = []
        if (!dots.length) return

        const shapeTypes = ['triangle', 'square', 'circle', 'cross']
        let shuffledTypes = p.shuffle ? p.shuffle([...shapeTypes]) : [...shapeTypes].sort(() => Math.random() - 0.5)
        let typeIndex = 0

        const nextType = () => {
          if (typeIndex >= shuffledTypes.length) {
            shuffledTypes = p.shuffle ? p.shuffle([...shapeTypes]) : [...shapeTypes].sort(() => Math.random() - 0.5)
            typeIndex = 0
          }
          const type = shuffledTypes[typeIndex]
          typeIndex += 1
          return type
        }

        const usedIndices = new Set()
        const shapesToSpawn = Math.floor(p.random(minShapesPerCycle, maxShapesPerCycle + 1))

        const pickDotIndex = () => {
          if (usedIndices.size >= dots.length) {
            usedIndices.clear()
          }
          let index = Math.floor(p.random(dots.length))
          let attempts = 0
          while (usedIndices.has(index) && attempts < 8) {
            index = Math.floor(p.random(dots.length))
            attempts += 1
          }
          usedIndices.add(index)
          return index
        }

        const queueShape = (step) => {
          const handle = setTimeout(() => {
            if (cycleId !== accentCycleId) return
            const dotIndex = pickDotIndex()
            const { x, y } = dots[dotIndex]
            accentShapes.push({ type: nextType(), x, y, dotIndex, createdAt: p.millis() })
          }, step * delay)
          accentTimers.push(handle)
        }

        for (let i = 0; i < shapesToSpawn; i += 1) {
          queueShape(i)
        }

        const restartHandle = setTimeout(() => {
          if (cycleId !== accentCycleId) return
          selectAccentShapes()
        }, shapesToSpawn * delay + duration)

        accentTimers.push(restartHandle)
        p.loop()
      }

      const buildGrid = () => {
        containerSize = getContainerSize()
        const { w, h } = containerSize
        dots = []
        // start from half spacing to avoid clipping on edges
        for (let x = spacing / 2; x < w; x += spacing) {
          for (let y = spacing / 2; y < h; y += spacing) {
            dots.push({ x, y })
          }
        }
        selectAccentShapes()
      }

      const drawDots = () => {
        p.clear()
        const now = p.millis()
        accentShapes = accentShapes.filter(({ createdAt }) => !createdAt || now - createdAt < duration)
        const ctx = p.drawingContext
        const shapeDotIndices = new Set(accentShapes.map(({ dotIndex }) => dotIndex))

        dots.forEach(({ x, y }, idx) => {
          if (shapeDotIndices.has(idx)) return
          drawDot(ctx, { x, y, color: dotColor })
        })

        accentShapes.forEach(({ type, x, y, createdAt }) => {
          const age = createdAt ? now - createdAt : 0
          const fadeIn = Math.min(1, age / fadeWindow)
          const fadeOut = age > duration - fadeWindow ? Math.max(0, (duration - age) / fadeWindow) : 1
          const opacity = Math.max(0, Math.min(fadeIn, fadeOut))
          const sharedProps = { x, y, color: PATTERN_COLORS.ACCENT, thickness: 0.5, opacity }
          if (type === 'triangle') {
            drawTriangle(ctx, { ...sharedProps, sideWidth: sideWidth, isFill: false })
          } else if (type === 'square') {
            drawSquare(ctx, { ...sharedProps, sideWidth: sideWidth, isFill: false })
          } else if (type === 'circle') {
            drawCircle(ctx, { ...sharedProps, radius: sideWidth, isFill: false })
          } else if (type === 'cross') {
            drawCross(ctx, { ...sharedProps, sideWidth: sideWidth })
          }
        })
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
      accentCycleId += 1
      clearAccentTimers()
    }
  }, [])

  const classes = [styles.root, className].filter(Boolean).join(' ')

  const contentClasses = [styles.content, contentClassName].filter(Boolean).join(' ')

  return (
    <>
      <div className={classes} {...rest}>
        <div
          ref={canvasContainer}
          className={styles.canvasHost}
          aria-hidden="true"
        />
      </div>
      {children ? (
        <div className={contentClasses}>
          {children}
        </div>
      ) : null}
    </>
  )
}
