import { useEffect, useRef } from 'react'
import p5 from 'p5'
import styles from './art_canvas.module.css'

const SVG_VIEWBOX_SIZE = 800

// const ARC_CENTER = { x: 407, y: 407 }
// const ARC_RADIUS = 292.75
// const ARC_STROKE = 20
// const ARC_START = 4.7
// const ARC_END = 0

const ARC_LIST = [
  {
    "arc1":{
      "arc_center": { x: 407, y: 407 },
      "arc_radius": 300,
      "arc_stroke": 35,
      "arc_start": 4.7,
      "arc_end": 0, 
      "color":"#6e6e6e"
    },
    "arc2":{
      "arc_center": { x: 407, y: 407 },
      "arc_radius": 255,
      "arc_stroke": 8,
      "arc_start": 5,
      "arc_end": 0, 
      "color":"#ffa84a"
    },
    "arc3":{
      "arc_center": { x: 407, y: 407 },
      "arc_radius": 300,
      "arc_stroke": 15,
      "arc_start": 1.65,
      "arc_end": 3.2,
      "color":"#ffa84a"
    },
    "arc4":{
      "arc_center": { x: 407, y: 407 },
      "arc_radius": 255,
      "arc_stroke": 18,
      "arc_start": 1.8,
      "arc_end": 2.8,
      "color":"#6e6e6e"
    },
    "arc5":{
      "arc_center": { x: 407, y: 407 },
      "arc_radius": 350,
      "arc_stroke": 8,
      "arc_start": 0.1,
      "arc_end": 1.7,
      "color":"#ffa84a"
    },
  }
]

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
      const drawLargeArc = () => {
        const scaleFactor = p.width / SVG_VIEWBOX_SIZE

        p.clear()
        p.noFill()
        
        p.strokeCap(p.SQUARE)
        p.push()
        p.scale(scaleFactor)
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

        p.stroke('#6E6E6E')
        p.strokeWeight(layoutStrokePx / scaleFactor)
        p.line(394, 793, 394, 7)

        p.stroke('#6E6E6E')
        p.strokeWeight(layoutStrokePx / scaleFactor)
        p.line(73.7875, 766.068, 316.8, 537.044)

        p.stroke('#FFA84A')
        p.strokeWeight(layoutStrokePx / scaleFactor)
        p.line(24, 766.068, 317.197, 489.007)
        p.stroke('#FFA84A')
        p.strokeWeight(layoutStrokePx / scaleFactor)
        p.line(404, 360.898, 647.012, 131.874)
        p.line(647.012, 131.874, 662.824, 146.775)
        p.stroke('#6E6E6E')
        p.strokeWeight(layoutStrokePx / scaleFactor)
        p.line(742.819, 87.0001, 473.667, 340.659)
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

  return <div ref={containerRef} className={styles.canvas} />
}