import { useEffect, useRef } from 'react'
import p5 from 'p5'
import styles from './art_canvas.module.css'
import { drawDot, drawSquare } from '../../../utils/shapes/draw_shapes'
import profileImageSrc from '../../../assets/images/profile_2.png'
import {
  ARC_LIST,
  LARGE_LINES,
  LARGE_LINES_2,
  SQUARES_LIST,
  SMALL_LINES_BOTTOM,
  SMALL_LINES_TOP,
  DOTS_LIST_TOP,
  DOTS_LIST_BOTTOM,
} from './shapes_data'

const SVG_VIEWBOX_SIZE = 800

export default function ArtCanvas() {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)

  const handleCanvasClick = () => {
    instanceRef.current?.startArcAnimation?.()
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    if (instanceRef.current) {
      instanceRef.current.remove()
      instanceRef.current = null
    }

    container.innerHTML = ''

    const sketch = (p) => {

      let layoutStrokePx = 0.5

      const updateLayoutStroke = () => {
        const value = getComputedStyle(container).getPropertyValue('--layout-stroke')
        const parsed = parseFloat(value)
        layoutStrokePx = Number.isFinite(parsed) ? parsed : 0.5
      }
      let img = null
      const loadProfileImage = () => {
        p.loadImage(
          profileImageSrc,
          (loaded) => {
            img = loaded
            console.log(`IMAGE SOURCE ARE LOADED ${profileImageSrc}`)
            p.redraw()
          },
          (err) => {
            console.error('IMAGE SOURCE LOAD FAILED', err)
          }
        )
      }
      loadProfileImage()
      let arcAnimationActive = false
      let arcAnimationPaused = false
      let arcAnimationStartMs = 0
      let arcAnimationElapsedMs = 0
      let arcAnimationForward = false
      let arcProgressCurrent = 1
      let arcProgressTarget = 1
      let lineProgressCurrent = 1
      let lineProgressTarget = 1
      let squaresProgressCurrent = 1
      let squaresProgressTarget = 1
      let smallLinesProgressCurrent = 1
      let smallLinesProgressTarget = 1
      let imageProgressCurrent = 1
      let imageProgressTarget = 1
      const arcAnimationDurationMs = 800
      const arcAnimationSmoothingMs = 80
      const lineAnimationDelayMs = 160
      const squaresAnimationDelayMs = 320
      const smallLinesAnimationDelayMs = 460
      const imageAnimationDelayMs = 280
      const imageAnimationForwardDelayMs = 0
      const smallShapesAnimationDurationMs = 400

      // Rysowanie lukow (elementy ARC_LIST)
      const drawArcs = (progress = 1) => {
        for (let i = 0; i < ARC_LIST.length; i += 1) {
          const arcItem = ARC_LIST[i]
          for (const key in arcItem) {
            if (!Object.prototype.hasOwnProperty.call(arcItem, key)) continue
            const arc = arcItem[key]
            const arcProgress = Math.max(0, Math.min(1, progress))
            const endAngle = arc.arc_start + (arc.arc_end - arc.arc_start) * arcProgress
            p.stroke(arc.color)
            p.strokeWeight(arc.arc_stroke)
            p.arc(
              arc.arc_center.x,
              arc.arc_center.y,
              arc.arc_radius * 2,
              arc.arc_radius * 2,
              arc.arc_start,
              endAngle
            )
          }
        }
      }

      const getSequentialAlpha = (index, total, progress) => {
        if (total <= 0) return 0
        const safeProgress = Math.max(0, Math.min(1, progress))
        const step = 1 / total
        const start = index * step
        return Math.max(0, Math.min(1, (safeProgress - start) / step))
      }

      const getListItemCount = (list) =>
        list.reduce((count, item) => count + Object.keys(item).length, 0)

      // Rysowanie kwadratow (elementy SQUARES_LIST) z fade in/out
      const drawSquares = (progress = 1, scaleFactor = 1, line5Angle = 0, line5Length = 0) => {
        const total = getListItemCount(SQUARES_LIST)
        let itemIndex = 0
        for (let i = 0; i < SQUARES_LIST.length; i += 1) {
          const squareItem = SQUARES_LIST[i]
          for (const key in squareItem) {
            if (!Object.prototype.hasOwnProperty.call(squareItem, key)) continue
            const square = squareItem[key]
            const alpha = getSequentialAlpha(itemIndex, total, progress)
            const context = p.drawingContext
            context.save()
            context.globalAlpha = alpha
            context.translate(square.center.x, square.center.y)
            context.rotate(line5Angle)
            drawSquare(context, {
              x: 0,
              y: 0,
              sideWidth: line5Length,
              color: square.color,
              thickness: layoutStrokePx / scaleFactor,
              isFill: false,
            })
            context.restore()
            itemIndex += 1
          }
        }
      }

      // Rysowanie duzych linii (elementy LARGE_LINES i LARGE_LINES_2)
      const drawLargeLines = (linesList, progress = 1, scaleFactor = 1) => {
        const safeProgress = Math.max(0, Math.min(1, progress))
        for (let i = 0; i < linesList.length; i += 1) {
          const lineItem = linesList[i]
          for (const key in lineItem) {
            if (!Object.prototype.hasOwnProperty.call(lineItem, key)) continue
            const line = lineItem[key]
            const endX = p.lerp(line.start.x, line.end.x, safeProgress)
            const endY = p.lerp(line.start.y, line.end.y, safeProgress)
            p.stroke(line.color)
            p.strokeWeight(layoutStrokePx / scaleFactor)
            p.line(
              line.start.x,
              line.start.y,
              endX,
              endY
            )
          }
        }
      }

      // Rysowanie malych linii (elementy SMALL_LINES_TOP i SMALL_LINES_BOTTOM) z fade in/out
      const drawSmallLines = (linesList, progress = 1, scaleFactor = 1) => {
        const total = getListItemCount(linesList)
        let itemIndex = 0
        for (let i = 0; i < linesList.length; i += 1) {
          const lineItem = linesList[i]
          for (const key in lineItem) {
            if (!Object.prototype.hasOwnProperty.call(lineItem, key)) continue
            const line = lineItem[key]
            const alpha = getSequentialAlpha(itemIndex, total, progress)
            const strokeColor = p.color(line.color)
            strokeColor.setAlpha(255 * alpha)
            p.stroke(strokeColor)
            p.strokeWeight(layoutStrokePx / scaleFactor)
            p.line(
              line.start.x,
              line.start.y,
              line.end.x,
              line.end.y
            )
            itemIndex += 1
          }
        }
      }

      // Rysowanie kropek (elementy DOTS_LIST_TOP i DOTS_LIST_BOTTOM) z fade in/out
      const drawDots = (dotsList, progress = 1) => {
        const total = getListItemCount(dotsList)
        let itemIndex = 0
        const context = p.drawingContext
        for (let i = 0; i < dotsList.length; i += 1) {
          const dotItem = dotsList[i]
          for (const key in dotItem) {
            if (!Object.prototype.hasOwnProperty.call(dotItem, key)) continue
            const dot = dotItem[key]
            const alpha = getSequentialAlpha(itemIndex, total, progress)
            if (dot.isStroke) {
              p.push()
              p.noFill()
              const strokeColor = p.color(dot.color)
              strokeColor.setAlpha(255 * alpha)
              p.stroke(strokeColor)
              p.strokeWeight(dot.thickness ?? 0.3)
              p.circle(dot.center.x, dot.center.y, 12)
              p.pop()
            } else {
              context.save()
              context.globalAlpha = alpha
              drawDot(context, {
                x: dot.center.x,
                y: dot.center.y,
                color: dot.color,
                radius: 6,
              })
              context.restore()
            }
            itemIndex += 1
          }
        }
      }

      // Rysowanie obrazka (img) ze skalowaniem i fade in/out
      const drawImage = (progress = 1, centerX = 0, centerY = 0, size = 0) => {
        if (!img) return
        const safeProgress = Math.max(0, Math.min(1, progress))
        const alpha = safeProgress
        const scale = 0.85 + 0.15 * safeProgress
        p.push()
        p.translate(centerX, centerY)
        p.scale(scale)
        p.imageMode(p.CENTER)
        p.tint(255, 255 * alpha)
        p.image(img, 0, 0, size, size)
        p.noTint()
        p.pop()
      }

      // Rysowanie calej kompozycji (kwadraty, luki, linie, kropki, obraz)
      const drawLargeArc = (
        arcProgress = 1,
        lineProgress = 1,
        squaresProgress = 1,
        smallLinesProgress = 1,
        imageProgress = 1
      ) => {
        const scaleFactor = p.width / SVG_VIEWBOX_SIZE
        const context = p.drawingContext
        const imageCenterX = 407
        const imageCenterY = 407
        const imageSize = 500
        const line5 = LARGE_LINES[0]?.line5
        const line5Dx = line5 ? line5.end.x - line5.start.x : 0
        const line5Dy = line5 ? line5.end.y - line5.start.y : 0
        const line5Length = Math.hypot(line5Dx, line5Dy)
        const line5Angle = Math.atan2(line5Dy, line5Dx)

        p.clear()
        p.noFill()
        p.strokeCap(p.SQUARE)
        p.push()
        p.scale(scaleFactor)
        

        //##################
        // const circleCenter = { x: 407, y: 407 }
        // const circleRadius = 230
        // const circleGradient = context.createLinearGradient(
        //   0,
        //   circleCenter.y - circleRadius,
        //   0,
        //   circleCenter.y + circleRadius
        // )
        // circleGradient.addColorStop(0, '#1B1B1B')
        // circleGradient.addColorStop(1, '#2F2F2F')
        // context.save()
        // context.beginPath()
        // context.arc(circleCenter.x, circleCenter.y, circleRadius, 0, Math.PI * 2)
        // context.fillStyle = circleGradient
        // context.fill()
        // context.restore()
        //##################

        drawSquares(squaresProgress, scaleFactor, line5Angle, line5Length)

        drawArcs(arcProgress)
        drawLargeLines(LARGE_LINES_2, lineProgress, scaleFactor)

        drawImage(imageProgress, imageCenterX, imageCenterY, imageSize)

        drawLargeLines(LARGE_LINES, lineProgress, scaleFactor)

        

        drawSmallLines(SMALL_LINES_BOTTOM, smallLinesProgress, scaleFactor)

        drawSmallLines(SMALL_LINES_TOP, smallLinesProgress, scaleFactor)

        drawDots(DOTS_LIST_TOP, smallLinesProgress)

        drawDots(DOTS_LIST_BOTTOM, smallLinesProgress)
        p.pop()
      }

      // Animacja rysowania lukow od arc_start do arc_end
      const startArcAnimation = () => {
        if (arcAnimationActive && !arcAnimationPaused) {
          arcAnimationPaused = true
          p.noLoop()
          return
        }
        if (arcAnimationActive && arcAnimationPaused) {
          arcAnimationPaused = false
          arcAnimationStartMs = p.millis()
          p.loop()
          return
        }
        arcAnimationActive = true
        arcAnimationPaused = false
        arcAnimationStartMs = p.millis()
        arcAnimationElapsedMs = 0
        p.loop()
      }

      // Animacja rysowania duzych linii (LARGE_LINES i LARGE_LINES_2)
      const startLargeLinesAnimation = (deltaMs, deltaProgress) => {
        if (arcAnimationElapsedMs < lineAnimationDelayMs) return
        lineProgressTarget = Math.max(
          0,
          Math.min(
            1,
            lineProgressTarget + (arcAnimationForward ? deltaProgress : -deltaProgress)
          )
        )
        const lineSmoothingFactor = 1 - Math.exp(-deltaMs / arcAnimationSmoothingMs)
        lineProgressCurrent = p.lerp(
          lineProgressCurrent,
          lineProgressTarget,
          lineSmoothingFactor
        )
        if (Math.abs(lineProgressTarget - lineProgressCurrent) < 0.001) {
          lineProgressCurrent = lineProgressTarget
        }
      }

      // Animacja zanikania kwadratow (SQUARES_LIST) sekwencyjnie
      const startSquaresAnimation = (deltaMs, deltaProgress) => {
        if (arcAnimationElapsedMs < squaresAnimationDelayMs) return
        const squaresDeltaProgress = deltaMs / smallShapesAnimationDurationMs
        squaresProgressTarget = Math.max(
          0,
          Math.min(
            1,
            squaresProgressTarget + (arcAnimationForward ? squaresDeltaProgress : -squaresDeltaProgress)
          )
        )
        const squaresSmoothingFactor = 1 - Math.exp(-deltaMs / arcAnimationSmoothingMs)
        squaresProgressCurrent = p.lerp(
          squaresProgressCurrent,
          squaresProgressTarget,
          squaresSmoothingFactor
        )
        if (Math.abs(squaresProgressTarget - squaresProgressCurrent) < 0.001) {
          squaresProgressCurrent = squaresProgressTarget
        }
      }

      // Animacja zanikania malych linii i kropek (SMALL_LINES_* + DOTS_*) sekwencyjnie
      const startSmallLinesAnimation = (deltaMs) => {
        if (arcAnimationElapsedMs < smallLinesAnimationDelayMs) return
        const smallLinesDeltaProgress = deltaMs / smallShapesAnimationDurationMs
        smallLinesProgressTarget = Math.max(
          0,
          Math.min(
            1,
            smallLinesProgressTarget + (arcAnimationForward ? smallLinesDeltaProgress : -smallLinesDeltaProgress)
          )
        )
        const smallLinesSmoothingFactor = 1 - Math.exp(-deltaMs / arcAnimationSmoothingMs)
        smallLinesProgressCurrent = p.lerp(
          smallLinesProgressCurrent,
          smallLinesProgressTarget,
          smallLinesSmoothingFactor
        )
        if (Math.abs(smallLinesProgressTarget - smallLinesProgressCurrent) < 0.001) {
          smallLinesProgressCurrent = smallLinesProgressTarget
        }
      }

      // Animacja obrazka (img) ze skalowaniem i fade in/out
      const startImageAnimation = (deltaMs) => {
        const delayMs = arcAnimationForward
          ? imageAnimationForwardDelayMs
          : smallLinesAnimationDelayMs + imageAnimationDelayMs
        if (arcAnimationElapsedMs < delayMs) return
        const imageDeltaProgress = deltaMs / smallShapesAnimationDurationMs
        imageProgressTarget = Math.max(
          0,
          Math.min(
            1,
            imageProgressTarget + (arcAnimationForward ? imageDeltaProgress : -imageDeltaProgress)
          )
        )
        const imageSmoothingFactor = 1 - Math.exp(-deltaMs / arcAnimationSmoothingMs)
        imageProgressCurrent = p.lerp(
          imageProgressCurrent,
          imageProgressTarget,
          imageSmoothingFactor
        )
        if (Math.abs(imageProgressTarget - imageProgressCurrent) < 0.001) {
          imageProgressCurrent = imageProgressTarget
        }
      }

      p.startArcAnimation = startArcAnimation

      p.setup = () => {
        const size = Math.min(
          container.clientWidth,
          container.clientHeight
        )
        const canvas = p.createCanvas(size || 1, size || 1)
        canvas.parent(container)
        const canvases = container.querySelectorAll('canvas')
        canvases.forEach((node) => {
          if (node !== canvas.elt) {
            node.remove()
          }
        })
        p.noLoop()
        updateLayoutStroke()
        drawLargeArc(
          arcProgressCurrent,
          lineProgressCurrent,
          squaresProgressCurrent,
          smallLinesProgressCurrent,
          imageProgressCurrent
        )
      }

      p.draw = () => {
        if (!arcAnimationActive) {
          drawLargeArc(
            arcProgressCurrent,
            lineProgressCurrent,
            squaresProgressCurrent,
            smallLinesProgressCurrent,
            imageProgressCurrent
          )
          return
        }
        if (arcAnimationPaused) {
          drawLargeArc(
            arcProgressCurrent,
            lineProgressCurrent,
            squaresProgressCurrent,
            smallLinesProgressCurrent,
            imageProgressCurrent
          )
          return
        }
        const nowMs = p.millis()
        const deltaMs = nowMs - arcAnimationStartMs
        arcAnimationElapsedMs += deltaMs
        const deltaProgress = deltaMs / arcAnimationDurationMs
        arcAnimationStartMs = nowMs
        arcProgressTarget = Math.max(
          0,
          Math.min(
            1,
            arcProgressTarget + (arcAnimationForward ? deltaProgress : -deltaProgress)
          )
        )
        const smoothingFactor = 1 - Math.exp(-deltaMs / arcAnimationSmoothingMs)
        arcProgressCurrent = p.lerp(
          arcProgressCurrent,
          arcProgressTarget,
          smoothingFactor
        )
        if (Math.abs(arcProgressTarget - arcProgressCurrent) < 0.001) {
          arcProgressCurrent = arcProgressTarget
        }
        startLargeLinesAnimation(deltaMs, deltaProgress)
        startSquaresAnimation(deltaMs, deltaProgress)
        startSmallLinesAnimation(deltaMs)
        startImageAnimation(deltaMs)

        drawLargeArc(
          arcProgressCurrent,
          lineProgressCurrent,
          squaresProgressCurrent,
          smallLinesProgressCurrent,
          imageProgressCurrent
        )
        const arcsAtEnd =
          (arcProgressTarget >= 1 || arcProgressTarget <= 0) &&
          arcProgressCurrent === arcProgressTarget
        const linesAtEnd =
          (lineProgressTarget >= 1 || lineProgressTarget <= 0) &&
          lineProgressCurrent === lineProgressTarget
        const squaresAtEnd =
          (squaresProgressTarget >= 1 || squaresProgressTarget <= 0) &&
          squaresProgressCurrent === squaresProgressTarget
        const smallLinesAtEnd =
          (smallLinesProgressTarget >= 1 || smallLinesProgressTarget <= 0) &&
          smallLinesProgressCurrent === smallLinesProgressTarget
        const imageAtEnd =
          (imageProgressTarget >= 1 || imageProgressTarget <= 0) &&
          imageProgressCurrent === imageProgressTarget
        if (arcsAtEnd && linesAtEnd && squaresAtEnd && smallLinesAtEnd && imageAtEnd) {
          arcAnimationActive = false
          arcAnimationPaused = false
          arcAnimationForward = arcProgressCurrent <= 0
          p.noLoop()
        }
      }

      p.windowResized = () => {
        const size = Math.min(
          container.clientWidth,
          container.clientHeight
        )
        p.resizeCanvas(size || 1, size || 1)
        updateLayoutStroke()
        p.redraw()
      }
    }

    const instance = new p5(sketch)
    instanceRef.current = instance

    return () => {
      instance.remove()
      container.innerHTML = ''
      instanceRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={styles.canvas}
      onClick={handleCanvasClick}
    />
    
  )
}
