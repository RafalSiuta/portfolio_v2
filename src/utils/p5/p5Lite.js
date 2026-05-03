import p5 from 'p5/core'
import accessibility from 'p5/accessibility'
import color from 'p5/color'
import image from 'p5/image'
import math from 'p5/math'
import shape from 'p5/shape'
import utilities from 'p5/utilities'

let isConfigured = false

export default function getP5Lite() {
  if (!isConfigured) {
    shape(p5)
    accessibility(p5)
    color(p5)
    image(p5)
    math(p5)
    utilities(p5)
    p5.disableFriendlyErrors = true
    p5.disableSketchChecker = true
    isConfigured = true
  }

  return p5
}
