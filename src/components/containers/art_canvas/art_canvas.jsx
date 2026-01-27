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
      const drawLargeArc = () => {
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

        for (let i = 0; i < SQUARES_LIST.length; i += 1) {
          const squareItem = SQUARES_LIST[i]
          for (const key in squareItem) {
            if (!Object.prototype.hasOwnProperty.call(squareItem, key)) continue
            const square = squareItem[key]
            context.save()
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
          }
        }

        for (let i = 0; i < ARC_LIST.length; i += 1) {
          const arcItem = ARC_LIST[i]
          for (const key in arcItem) {
            if (!Object.prototype.hasOwnProperty.call(arcItem, key)) continue
            const arc = arcItem[key]
            p.stroke(arc.color)
            p.strokeWeight(arc.arc_stroke)
            p.arc(
              arc.arc_center.x,
              arc.arc_center.y,
              arc.arc_radius * 2,
              arc.arc_radius * 2,
              arc.arc_start,
              arc.arc_end
            )
            
          }
        }
        for (let i = 0; i < LARGE_LINES_2.length; i += 1) {
          const lineItem = LARGE_LINES_2[i]
          for (const key in lineItem) {
            if (!Object.prototype.hasOwnProperty.call(lineItem, key)) continue
            const line = lineItem[key]
            p.stroke(line.color)
            p.strokeWeight(layoutStrokePx / scaleFactor)
            p.line(
              line.start.x,
              line.start.y,
              line.end.x,
              line.end.y
            )
          }
        }

        if (img) {
          p.push()
          p.imageMode(p.CENTER)
          p.image(img, imageCenterX, imageCenterY, imageSize, imageSize)
          p.pop()
        }

        for (let i = 0; i < LARGE_LINES.length; i += 1) {
          const lineItem = LARGE_LINES[i]
          for (const key in lineItem) {
            if (!Object.prototype.hasOwnProperty.call(lineItem, key)) continue
            const line = lineItem[key]
            p.stroke(line.color)
            p.strokeWeight(layoutStrokePx / scaleFactor)
            p.line(
              line.start.x,
              line.start.y,
              line.end.x,
              line.end.y
            )
          }
        }

        

        for (let i = 0; i < SMALL_LINES_BOTTOM.length; i += 1) {
          const smallLineItem = SMALL_LINES_BOTTOM[i]
          for (const key in smallLineItem) {
            if (!Object.prototype.hasOwnProperty.call(smallLineItem, key)) continue
            const line = smallLineItem[key]
            p.stroke(line.color)
            p.strokeWeight(layoutStrokePx / scaleFactor)
            p.line(
              line.start.x,
              line.start.y,
              line.end.x,
              line.end.y
            )
          }
        }

        for (let i = 0; i < SMALL_LINES_TOP.length; i += 1) {
          const smallLineItem = SMALL_LINES_TOP[i]
          for (const key in smallLineItem) {
            if (!Object.prototype.hasOwnProperty.call(smallLineItem, key)) continue
            const line = smallLineItem[key]
            p.stroke(line.color)
            p.strokeWeight(layoutStrokePx / scaleFactor)
            p.line(
              line.start.x,
              line.start.y,
              line.end.x,
              line.end.y
            )
          }
        }

        for (let i = 0; i < DOTS_LIST_TOP.length; i += 1) {
          const dotItem = DOTS_LIST_TOP[i]
          for (const key in dotItem) {
            if (!Object.prototype.hasOwnProperty.call(dotItem, key)) continue
            const dot = dotItem[key]
            drawDot(context, {
              x: dot.center.x,
              y: dot.center.y,
              color: dot.color,
              radius: 6,
            })
          }
        }

        for (let i = 0; i < DOTS_LIST_BOTTOM.length; i += 1) {
          const dotItem = DOTS_LIST_BOTTOM[i]
          for (const key in dotItem) {
            if (!Object.prototype.hasOwnProperty.call(dotItem, key)) continue
            const dot = dotItem[key]
            if (dot.isStroke) {
              p.push()
              p.noFill()
              p.stroke(dot.color)
              p.strokeWeight(dot.thickness ?? 0.3)
              p.circle(dot.center.x, dot.center.y, 12)
              p.pop()
            } else {
              drawDot(context, {
                x: dot.center.x,
                y: dot.center.y,
                color: dot.color,
                radius: 6,
              })
            }
          }
        }
        p.pop()
      }

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
        drawLargeArc()
      }

      p.draw = () => {
        drawLargeArc()
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
    <div ref={containerRef} className={styles.canvas}/>
    // <div className={styles.canvasContainer}>
      
    // <img
    //     className={styles.profileImage}
    //     src={profileImageSrc}
    //     alt=""
    //   />
    // </div>
    
  )
}
