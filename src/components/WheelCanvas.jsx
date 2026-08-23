import { useEffect, useRef } from 'react'
import { getSegmentColors } from '../utils/colors'

// Lee un token CSS del tema (resuelto con .dark/.light). Devuelve el fallback si no existe.
function cssVar(name, fallback) {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  } catch {
    return fallback
  }
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  let rot = -Math.PI / 2
  const step = Math.PI / spikes
  ctx.beginPath()
  ctx.moveTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR)
  for (let i = 0; i < spikes; i++) {
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR)
  }
  ctx.closePath()
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) {
    t = t.slice(0, -1)
  }
  return t + '…'
}

function draw(ctx, width, height, estudiantes, rotation) {
  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(width, height) / 2 - 6

  const glassBg = cssVar('--glass-bg', 'rgba(255,255,255,0.06)')
  const glassStrong = cssVar('--glass-strong', 'rgba(255,255,255,0.1)')
  const glassBorder = cssVar('--glass-border', 'rgba(255,255,255,0.12)')
  const inkFaint = cssVar('--ink-faint', '#64748b')
  const accentGlow = cssVar('--accent-glow', 'rgba(129,140,248,0.5)')

  ctx.clearRect(0, 0, width, height)

  // Fondo del área: vidrio translúcido con gradiente radial sutil
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  bgGrad.addColorStop(0, glassStrong)
  bgGrad.addColorStop(1, glassBg)
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
  ctx.fillStyle = bgGrad
  ctx.fill()
  ctx.lineWidth = 1
  ctx.strokeStyle = glassBorder
  ctx.stroke()

  if (estudiantes.length === 0) {
    // Aro punteado y aviso con colores del tema
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
    ctx.setLineDash([8, 6])
    ctx.strokeStyle = inkFaint
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = inkFaint
    ctx.font = '600 14px Inter, system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Añade participantes para empezar', cx, cy)
    return
  }

  const n = estudiantes.length
  const arcSize = (2 * Math.PI) / n
  const colors = getSegmentColors(n)

  // Anillo exterior: gradiente slate con resplandor dinámico de acento
  ctx.save()
  ctx.shadowColor = accentGlow
  ctx.shadowBlur = 20
  const ringGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius)
  ringGrad.addColorStop(0, '#1e293b')
  ringGrad.addColorStop(1, '#0f172a')
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
  ctx.lineWidth = 10
  ctx.strokeStyle = ringGrad
  ctx.stroke()
  ctx.restore()

  const sliceRadius = radius - 7
  const fontSize = Math.max(10, Math.min(20, radius / 7))
  const maxTextWidth = Math.max(24, radius - 30)

  ctx.font = `800 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < n; i++) {
    const startAngle = rotation + i * arcSize
    const endAngle = startAngle + arcSize
    const midAngle = startAngle + arcSize / 2

    // Tajada
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, sliceRadius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = colors[i % colors.length]
    ctx.fill()
    ctx.lineWidth = 1.5
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.stroke()

    // Texto del nombre, rotado hacia afuera y legible
    const textRadius = sliceRadius * 0.65
    const tx = cx + Math.cos(midAngle) * textRadius
    const ty = cy + Math.sin(midAngle) * textRadius
    const label = fitText(ctx, estudiantes[i], maxTextWidth)

    ctx.save()
    ctx.translate(tx, ty)
    let labelAngle = midAngle
    if (midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2) {
      labelAngle += Math.PI
    }
    ctx.rotate(labelAngle)
    // Blanco puro, configurado dentro del bucle para que el texto se pinte nítido.
    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, 0, 0)
    ctx.restore()
  }

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Centro: gradiente indigo→violet, anillo blanco translúcido y estrella cyan→blanco
  const centerRadius = radius * 0.16
  const centerGrad = ctx.createRadialGradient(
    cx - centerRadius * 0.3,
    cy - centerRadius * 0.3,
    centerRadius * 0.1,
    cx,
    cy,
    centerRadius
  )
  centerGrad.addColorStop(0, '#6366f1')
  centerGrad.addColorStop(1, '#8b5cf6')
  ctx.beginPath()
  ctx.arc(cx, cy, centerRadius, 0, 2 * Math.PI)
  ctx.fillStyle = centerGrad
  ctx.fill()
  ctx.lineWidth = 2.5
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.stroke()

  const starR = centerRadius * 0.6
  const starGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, starR)
  starGrad.addColorStop(0, '#22d3ee')
  starGrad.addColorStop(1, '#ffffff')
  drawStar(ctx, cx, cy, 5, starR, starR * 0.45)
  ctx.fillStyle = starGrad
  ctx.fill()
  ctx.lineWidth = 1.5
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.stroke()
}

export default function WheelCanvas({ estudiantes = [], rotation = 0 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const render = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width === 0 || height === 0) return

      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      draw(ctx, width, height, estudiantes, rotation)
    }

    render()

    const resizeObserver = new ResizeObserver(render)
    resizeObserver.observe(canvas)

    // Redibuja al cambiar el tema (.dark/.light) para reflejar los tokens de vidrio
    const themeObserver = new MutationObserver(render)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      resizeObserver.disconnect()
      themeObserver.disconnect()
    }
  }, [estudiantes, rotation])

  return (
    <div className="relative aspect-square w-full">
      <div className="pointer-events-none absolute inset-0 p-4">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      {/* Puntero superior */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-12 w-14 drop-shadow-[0_0_14px_rgba(244,63,94,0.9)]">
          <div className="absolute inset-0 bg-white [clip-path:polygon(0_0,100%_0,50%_100%)]" />
          <div className="absolute inset-x-[4px] top-[3px] bottom-[5px] bg-gradient-to-b from-rose-400 to-rose-600 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        </div>
      </div>
    </div>
  )
}
