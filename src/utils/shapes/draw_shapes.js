import { convertColor } from '../convert/colorConverter'

const prepareStroke = (context, color, thickness, opacity) => {
  context.lineWidth = thickness
  context.strokeStyle = convertColor(color, opacity)
}

export const drawCircle = (
  context,
  { x, y, radius, color, thickness = 1, isFill = true, opacity = 1 }
) => {
  context.save()
  context.beginPath()
  context.arc(x, y, (radius/2), 0, Math.PI * 2)

  if (isFill) {
    context.fillStyle = convertColor(color, opacity)
    context.fill()
  } else {
    prepareStroke(context, color, thickness, opacity)
    context.stroke()
  }

  context.restore()
}

export const drawSquare = (
  context,
  { x, y, sideWidth, color, thickness = 1, isFill = true, opacity = 1 }
) => {
  const half = sideWidth / 2

  context.save()
  context.beginPath()
  context.rect(x - half, y - half, sideWidth, sideWidth)

  if (isFill) {
    context.fillStyle = convertColor(color, opacity)
    context.fill()
  } else {
    prepareStroke(context, color, thickness, opacity)
    context.stroke()
  }

  context.restore()
}

export const drawTriangle = (
  context,
  { x, y, sideWidth, color, thickness = 1, isFill = true, opacity = 1 }
) => {
  const height = (Math.sqrt(3) / 2) * sideWidth
  const top = { x, y: y - (2 * height) / 3 }
  const left = { x: x - sideWidth / 2, y: y + height / 3 }
  const right = { x: x + sideWidth / 2, y: y + height / 3 }

  context.save()
  context.beginPath()
  context.moveTo(top.x, top.y)
  context.lineTo(left.x, left.y)
  context.lineTo(right.x, right.y)
  context.closePath()

  if (isFill) {
    context.fillStyle = convertColor(color, opacity)
    context.fill()
  } else {
    prepareStroke(context, color, thickness, opacity)
    context.stroke()
  }

  context.restore()
}

export const drawCross = (
  context,
  { x, y, sideWidth, color, thickness = 1, opacity = 1 }
) => {
  const half = sideWidth / 2

  context.save()
  prepareStroke(context, color, thickness, opacity)

  context.beginPath()
  context.moveTo(x - half, y)
  context.lineTo(x + half, y)
  context.stroke()

  context.beginPath()
  context.moveTo(x, y - half)
  context.lineTo(x, y + half)
  context.stroke()

  context.restore()
}

export const drawDot = (
  context,
  { x, y, color, radius = 1.125, opacity = 1 }
) => {
  context.save()
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fillStyle = convertColor(color, opacity)
  context.fill()
  context.restore()
}

export const drawArc = (
  context,
  { x, y, radius, startAngle, endAngle, color, thickness = 1, opacity = 1 }
) => {
  context.save()
  context.beginPath()
  context.arc(x, y, radius, startAngle, endAngle)
  prepareStroke(context, color, thickness, opacity)
  context.stroke()
  context.restore()
}

export const drawLine = (
  context,
  { startX, startY, endX, endY, color, thickness = 1, opacity = 1 }
) => {
  context.save()
  context.beginPath()
  context.moveTo(startX, startY)
  context.lineTo(endX, endY)
  prepareStroke(context, color, thickness, opacity)
  context.stroke()
  context.restore()
}

export const drawMultipleLines = (
  context,
  { startX, startY, count, stepX, lineLength, color, thickness = 1, opacity = 1 }
) => {
  for (let i = 0; i < count; i += 1) {
    const xPosition = startX - i * stepX
    const yPositionStart = startY + i * stepX - i * 0.3
    const yPositionEnd = yPositionStart + lineLength

    drawLine(context, {
      startX: xPosition,
      startY: yPositionStart,
      endX: xPosition,
      endY: yPositionEnd,
      color,
      thickness,
      opacity,
    })
  }
}

export const drawDots = (
  context,
  {
    startX,
    startY,
    count,
    stepX,
    stepY,
    radius = 1.125,
    color,
    thickness = 1,
    opacity = 1,
    isFill = true,
  }
) => {
  for (let i = 0; i < count; i += 1) {
    const xPosition = startX + i * stepX
    const yPosition = startY + i * stepY

    if (isFill) {
      drawDot(context, { x: xPosition, y: yPosition, color, radius, opacity })
    } else {
      context.save()
      context.beginPath()
      context.arc(xPosition, yPosition, radius, 0, Math.PI * 2)
      prepareStroke(context, color, thickness, opacity)
      context.stroke()
      context.restore()
    }
  }
}

export const drawRotatedSquare = (
  context,
  {
    x,
    y,
    sideWidth,
    angleInDegrees,
    color,
    thickness = 1,
    isFill = false,
    opacity = 1,
  }
) => {
  context.save()
  context.translate(x, y)
  context.rotate((angleInDegrees * Math.PI) / 180)
  context.beginPath()
  context.rect(-sideWidth / 2, -sideWidth / 2, sideWidth, sideWidth)

  if (isFill) {
    context.fillStyle = convertColor(color, opacity)
    context.fill()
  } else {
    prepareStroke(context, color, thickness, opacity)
    context.stroke()
  }

  context.restore()
}

