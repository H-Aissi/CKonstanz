import React, { useEffect, useRef, useState, useCallback } from 'react'

// ── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg: '#F7F3EE',
  surface: '#EDE8E0',
  border: '#E2DBD0',
  text: '#2C2825',
  textSec: '#6B6560',
  textTer: '#9E9790',
  accent: '#8B4513',
  gold: '#C4930A',
  blue: '#3B6E8F',
  serif: '"Source Serif 4", Georgia, serif',
  display: '"Playfair Display", Georgia, serif',
  mono: '"JetBrains Mono", "Courier New", monospace',
}

// ── Shared styles ──────────────────────────────────────────────────────────
const S = {
  sectionGap: { marginBottom: '3.5rem' },
  h2: {
    fontFamily: T.display,
    fontSize: 27,
    fontWeight: 600,
    color: T.text,
    margin: '0 0 1.2rem',
    lineHeight: 1.25,
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
  },
  h2num: {
    fontFamily: T.mono,
    fontSize: 13,
    color: T.textTer,
    fontStyle: 'normal',
    fontWeight: 400,
    flexShrink: 0,
  },
  h3: {
    fontFamily: T.display,
    fontSize: 20,
    fontWeight: 500,
    color: T.text,
    margin: '2rem 0 0.8rem',
    lineHeight: 1.3,
  },
  p: {
    fontFamily: T.serif,
    fontSize: 17,
    lineHeight: 1.78,
    margin: '0 0 1.1rem',
    color: T.text,
  },
  callout: {
    background: 'rgba(139,69,19,0.07)',
    borderLeft: `3px solid ${T.accent}`,
    padding: '14px 20px',
    margin: '1.4rem 0',
    borderRadius: '0 3px 3px 0',
  },
  calloutLabel: {
    fontFamily: T.mono,
    fontSize: 11,
    color: T.accent,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: 7,
    display: 'block',
  },
  bq: {
    borderLeft: `2px solid ${T.accent}`,
    margin: '1.4rem 0',
    padding: '8px 20px',
    fontFamily: T.serif,
    fontStyle: 'italic',
    color: T.textSec,
    fontSize: 16.5,
    lineHeight: 1.75,
  },
  formulaBox: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 3,
    padding: '16px 24px',
    margin: '1.4rem 0',
    textAlign: 'center',
  },
  vizWrap: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 3,
    padding: '20px 20px 14px',
    margin: '1.4rem 0',
  },
  vizCaption: {
    fontFamily: T.serif,
    fontSize: 13,
    color: T.textSec,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
    display: 'block',
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────
function Heading({ num, children }) {
  return (
    <h2 style={S.h2}>
      <span style={S.h2num}>{num}</span>
      <span>{children}</span>
    </h2>
  )
}

function Callout({ label, children }) {
  return (
    <div style={S.callout}>
      {label && <span style={S.calloutLabel}>{label}</span>}
      <div style={{ fontFamily: T.serif, fontSize: 16, lineHeight: 1.72, color: T.text }}>{children}</div>
    </div>
  )
}

function Formula({ f, caption }) {
  return (
    <div style={S.formulaBox}>
      <span style={{ fontFamily: T.mono, fontSize: 20, color: T.blue, letterSpacing: '0.5px' }}>{f}</span>
      {caption && (
        <span style={{ fontFamily: T.serif, fontSize: 13, color: T.textSec, marginTop: 6, display: 'block', fontStyle: 'italic' }}>
          {caption}
        </span>
      )}
    </div>
  )
}

// ── 1. Speed Bars ──────────────────────────────────────────────────────────
const SPEEDS = [
  { label: 'Mensch (Gehen)', pct: 0.000002 },
  { label: 'Schall',         pct: 0.0001   },
  { label: 'Erde um Sonne',  pct: 0.036    },
  { label: 'Licht',          pct: 100      },
]
const BAR_COLORS = [T.blue, T.blue, T.gold, T.accent]
const MIN_VIS_PCT = 0.25 // Mindestbreite damit ein Balken überhaupt sichtbar ist
const linearScale = (pct) => pct === 100 ? 100 : Math.max((pct / 100) * 100, MIN_VIS_PCT)

function SpeedBars() {
  const [visible, setVisible] = useState(false)
  const fired = useRef(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired.current) { fired.current = true; setVisible(true) }
    }, { threshold: 0.25 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={S.vizWrap}>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textTer, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 18 }}>
        Geschwindigkeitsvergleich — lineare Skala (c = 100 %)
      </div>
      {SPEEDS.map((s, i) => {
        const pctStr = s.pct < 0.001
          ? s.pct.toFixed(6)
          : s.pct < 1
          ? s.pct.toFixed(3)
          : s.pct.toFixed(0)
        return (
          <div key={i} style={{ marginBottom: i < SPEEDS.length - 1 ? 18 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
              <span style={{ fontFamily: T.serif, fontSize: 14.5, color: T.text }}>{s.label}</span>
              <span style={{ fontFamily: T.mono, fontSize: 12.5, color: BAR_COLORS[i] }}>{pctStr} % c</span>
            </div>
            <div style={{ background: T.border, borderRadius: 2, height: 7, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: visible ? `${linearScale(s.pct)}%` : '0%',
                background: BAR_COLORS[i],
                borderRadius: 2,
                transition: `width 1.3s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 220}ms`,
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── 2. Interferometer ──────────────────────────────────────────────────────
function Interferometer() {
  const [prog, setProg] = useState(0)
  const rafRef = useRef(null)
  const pRef = useRef(0)

  useEffect(() => {
    const tick = () => {
      pRef.current = (pRef.current + 0.007) % 1
      setProg(pRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // layout
  const cx = 200, cy = 170
  const arm = 110

  // photon travels: right arm → back → up arm → back (4 quarters)
  let px = cx, py = cy
  if (prog < 0.25) {
    px = cx + (prog / 0.25) * arm; py = cy
  } else if (prog < 0.5) {
    px = cx + arm - ((prog - 0.25) / 0.25) * arm; py = cy
  } else if (prog < 0.75) {
    px = cx; py = cy - ((prog - 0.5) / 0.25) * arm
  } else {
    px = cx; py = cy - arm + ((prog - 0.75) / 0.25) * arm
  }

  const glow = 0.65 + 0.35 * Math.sin(prog * Math.PI * 24)

  return (
    <div style={S.vizWrap}>
      <svg width="100%" viewBox="0 0 400 260" style={{ display: 'block' }}>
        {/* Dashed arms */}
        <line x1={cx} y1={cy} x2={cx + arm} y2={cy}
          stroke={T.border} strokeWidth="1.5" strokeDasharray="6,4" />
        <line x1={cx} y1={cy} x2={cx} y2={cy - arm}
          stroke={T.border} strokeWidth="1.5" strokeDasharray="6,4" />

        {/* Source beam */}
        <line x1={cx - arm} y1={cy} x2={cx - 10} y2={cy}
          stroke={T.gold} strokeWidth="1.5" opacity="0.45" strokeDasharray="5,3" />

        {/* Source */}
        <circle cx={cx - arm} cy={cy} r="11" fill="none" stroke={T.gold} strokeWidth="2" />
        <circle cx={cx - arm} cy={cy} r="5.5" fill={T.gold} opacity="0.7" />

        {/* Beamsplitter — 45° square */}
        <rect x={cx - 11} y={cy - 11} width="22" height="22"
          fill="none" stroke={T.accent} strokeWidth="2"
          transform={`rotate(45,${cx},${cy})`} />

        {/* Mirror A (horizontal) */}
        <rect x={cx + arm - 5} y={cy - 20} width="10" height="40"
          fill={T.blue} rx="2" opacity="0.75" />

        {/* Mirror B (vertical) */}
        <rect x={cx - 20} y={cy - arm - 5} width="40" height="10"
          fill={T.blue} rx="2" opacity="0.75" />

        {/* Photon glow + core */}
        <circle cx={px} cy={py} r={8 * glow} fill={T.gold} opacity="0.22" />
        <circle cx={px} cy={py} r="4.5" fill={T.gold} opacity="0.95" />

        {/* Labels */}
        <text x={cx + arm + 18} y={cy + 5}
          fontFamily={T.mono} fontSize="12" fill={T.textSec}>Spiegel A</text>
        <text x={cx} y={cy - arm - 14}
          fontFamily={T.mono} fontSize="12" fill={T.textSec} textAnchor="middle">Spiegel B</text>
        <text x={cx + 16} y={cy + 20}
          fontFamily={T.mono} fontSize="11" fill={T.textSec}>Strahlteiler</text>
        <text x={cx - arm} y={cy + 28}
          fontFamily={T.mono} fontSize="12" fill={T.textSec} textAnchor="middle">Quelle</text>
      </svg>
      <span style={S.vizCaption}>Michelson-Morley-Interferometer (schematisch)</span>
    </div>
  )
}

// ── 3. Lorentz-Faktor Canvas ───────────────────────────────────────────────
function LorentzCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth || 660
    const H = 240
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const pl = 52, pr = 16, pt = 16, pb = 42
    const gW = W - pl - pr
    const gH = H - pt - pb
    const yMax = 10

    const toX = v => pl + (v / 1) * gW
    const toY = g => pt + gH - (Math.min(g, yMax) / yMax) * gH

    // fill
    ctx.fillStyle = T.surface
    ctx.fillRect(0, 0, W, H)

    // grid
    ctx.strokeStyle = T.border
    ctx.lineWidth = 0.7
    for (let g = 0; g <= yMax; g += 2) {
      const y = toY(g)
      ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(pl + gW, y); ctx.stroke()
    }
    for (let v = 0; v <= 1; v += 0.2) {
      const x = toX(v)
      ctx.beginPath(); ctx.moveTo(x, pt); ctx.lineTo(x, pt + gH); ctx.stroke()
    }

    // curve
    ctx.beginPath()
    ctx.strokeStyle = T.accent
    ctx.lineWidth = 2.2
    let first = true
    for (let i = 0; i <= 998; i++) {
      const v = i / 1000
      const g = 1 / Math.sqrt(1 - v * v)
      if (first) { ctx.moveTo(toX(v), toY(g)); first = false }
      else ctx.lineTo(toX(v), toY(g))
    }
    ctx.stroke()

    // marker at 86.6% c, γ=2
    const mx = toX(0.866), my = toY(2)
    ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2)
    ctx.fillStyle = T.accent; ctx.fill()
    ctx.strokeStyle = T.surface; ctx.lineWidth = 2; ctx.stroke()
    ctx.fillStyle = T.textSec
    ctx.font = `500 11px ${T.mono}`
    ctx.fillText('γ = 2.0 bei 86.6% c', mx + 9, my - 5)

    // axes
    ctx.strokeStyle = T.textSec; ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(pl, pt); ctx.lineTo(pl, pt + gH)
    ctx.lineTo(pl + gW, pt + gH); ctx.stroke()

    // x-labels
    ctx.fillStyle = T.textSec
    ctx.font = `11px ${T.mono}`
    ctx.textAlign = 'center'
    for (let v = 0; v <= 1; v += 0.2) {
      ctx.fillText(`${Math.round(v * 100)}%`, toX(v), pt + gH + 14)
    }
    ctx.fillText('v / c', pl + gW / 2, pt + gH + 30)

    // y-labels
    ctx.textAlign = 'right'
    for (let g = 0; g <= yMax; g += 2) {
      ctx.fillText(String(g), pl - 7, toY(g) + 4)
    }
    ctx.save()
    ctx.translate(12, pt + gH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('γ', 0, 0)
    ctx.restore()
  }, [])

  return (
    <div style={{ margin: '1.4rem 0' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 240, display: 'block', border: `1px solid ${T.border}`, borderRadius: 3 }}
      />
      <span style={S.vizCaption}>
        Der Lorentz-Faktor steigt nahe c dramatisch an — Raum und Zeit verzerren sich immer stärker
      </span>
    </div>
  )
}

// ── 4. Raumzeit-Vektor ────────────────────────────────────────────────────
function RaumzeitVektor() {
  const [vel, setVel] = useState(0)
  const beta = vel / 100
  const vRaum = beta
  const vZeit = Math.sqrt(Math.max(0, 1 - beta * beta))
  const gamma = beta >= 0.9999 ? 9999 : 1 / Math.sqrt(1 - beta * beta)

  const origX = 60, origY = 255, R = 185
  const px = origX + beta * R
  const py = origY - vZeit * R
  const hasRaum = beta > 0.01
  const hasZeit = vZeit > 0.01
  const raSize = 10

  // Senkrechter Offset für das "c"-Label
  const dx = px - origX, dy = py - origY
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const labelX = (origX + px) / 2 + (dy / len) * 14
  const labelY = (origY + py) / 2 - (dx / len) * 14

  return (
    <div style={S.vizWrap}>
      <svg width="100%" viewBox="0 0 360 300" style={{ display: 'block' }}>
        <defs>
          <marker id="rzArrowC" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={T.text} />
          </marker>
          <marker id="rzArrowAx" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={T.textSec} />
          </marker>
        </defs>

        {/* Achsen */}
        <line x1={origX} y1={origY} x2={origX + R + 30} y2={origY}
          stroke={T.textSec} strokeWidth="1.5" markerEnd="url(#rzArrowAx)" />
        <line x1={origX} y1={origY} x2={origX} y2={origY - R - 30}
          stroke={T.textSec} strokeWidth="1.5" markerEnd="url(#rzArrowAx)" />

        {/* Achsenbeschriftungen */}
        <text x={origX + R + 38} y={origY + 4}
          fontFamily={T.mono} fontSize="10" fill={T.textSec}>v_Raum</text>
        <text x={origX} y={origY - R - 36}
          textAnchor="middle" fontFamily={T.mono} fontSize="10" fill={T.textSec}>v_Zeit</text>

        {/* Ticks X */}
        <line x1={origX + R * 0.5} y1={origY - 4} x2={origX + R * 0.5} y2={origY + 4}
          stroke={T.textSec} strokeWidth="1" />
        <text x={origX + R * 0.5} y={origY + 15}
          textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.textTer}>0.5c</text>
        <line x1={origX + R} y1={origY - 4} x2={origX + R} y2={origY + 4}
          stroke={T.textSec} strokeWidth="1" />
        <text x={origX + R} y={origY + 15}
          textAnchor="middle" fontFamily={T.mono} fontSize="9.5" fill={T.textTer}>c</text>

        {/* Ticks Y */}
        <line x1={origX - 4} y1={origY - R * 0.5} x2={origX + 4} y2={origY - R * 0.5}
          stroke={T.textSec} strokeWidth="1" />
        <text x={origX - 8} y={origY - R * 0.5 + 4}
          textAnchor="end" fontFamily={T.mono} fontSize="9.5" fill={T.textTer}>0.5c</text>
        <line x1={origX - 4} y1={origY - R} x2={origX + 4} y2={origY - R}
          stroke={T.textSec} strokeWidth="1" />
        <text x={origX - 8} y={origY - R + 4}
          textAnchor="end" fontFamily={T.mono} fontSize="9.5" fill={T.textTer}>c</text>

        {/* Viertelkreisbogen */}
        <path d={`M ${origX} ${origY - R} A ${R} ${R} 0 0 1 ${origX + R} ${origY}`}
          fill="none" stroke={T.textTer} strokeWidth="1.6" strokeDasharray="6,4" />

        {/* Projektionslinien */}
        {hasRaum && hasZeit && <>
          <line x1={px} y1={py} x2={px} y2={origY}
            stroke={T.border} strokeWidth="1" strokeDasharray="4,3" />
          <line x1={px} y1={py} x2={origX} y2={py}
            stroke={T.border} strokeWidth="1" strokeDasharray="4,3" />
        </>}

        {/* v_Raum Komponente (blau, horizontal) */}
        <line x1={origX} y1={origY} x2={px} y2={origY}
          stroke="#3B8BD4" strokeWidth="2.5" />
        {hasRaum && (
          <text x={(origX + px) / 2} y={origY + 18}
            textAnchor="middle" fontFamily={T.serif} fontSize="11" fill="#3B8BD4" fontStyle="italic">
            v_Raum
          </text>
        )}

        {/* v_Zeit Komponente (orange, vertikal) */}
        <line x1={origX} y1={origY} x2={origX} y2={py}
          stroke="#D85A30" strokeWidth="2.5" />
        {hasZeit && (
          <text
            x={origX - 20} y={(origY + py) / 2}
            textAnchor="middle" fontFamily={T.serif} fontSize="11" fill="#D85A30" fontStyle="italic"
            transform={`rotate(-90, ${origX - 20}, ${(origY + py) / 2})`}>
            v_Zeit
          </text>
        )}

        {/* Rechter-Winkel-Marker am Ursprung */}
        {hasRaum && hasZeit && (
          <path d={`M ${origX + raSize} ${origY} L ${origX + raSize} ${origY - raSize} L ${origX} ${origY - raSize}`}
            fill="none" stroke={T.textSec} strokeWidth="1" />
        )}

        {/* Hauptvektor c */}
        <line x1={origX} y1={origY} x2={px} y2={py}
          stroke={T.text} strokeWidth="2" markerEnd="url(#rzArrowC)" />
        <text x={labelX} y={labelY}
          textAnchor="middle" fontFamily={T.serif} fontSize="14" fill={T.text} fontStyle="italic">c</text>

        {/* Punkt auf dem Bogen */}
        <circle cx={px} cy={py} r="9" fill={T.accent} opacity="0.2" />
        <circle cx={px} cy={py} r="5" fill={T.accent} />
      </svg>

      {/* Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 14px' }}>
        <input type="range" min="0" max="99" step="0.5"
          value={vel}
          onChange={e => setVel(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: T.accent }}
        />
        <span style={{ fontFamily: T.mono, fontSize: 16, color: T.accent, minWidth: 52, textAlign: 'right' }}>
          {(vel / 100).toFixed(2)} c
        </span>
      </div>

      {/* Kennzahlen-Karten */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 3, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textTer, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
            Raumgeschwindigkeit
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: '#3B8BD4' }}>{vRaum.toFixed(2)} c</div>
        </div>
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 3, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textTer, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
            Zeitgeschwindigkeit
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: '#D85A30' }}>{vZeit.toFixed(2)} c</div>
        </div>
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 3, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textTer, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
            Lorentzfaktor γ
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: T.accent }}>{gamma.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

// ── 5. Lichtuhr ────────────────────────────────────────────────────────────
function LichtUhr() {
  const [running, setRunning] = useState(true)
  const [phase, setPhase] = useState(0)
  const rafRef = useRef(null)
  const pRef = useRef(0)
  const runRef = useRef(true)

  useEffect(() => { runRef.current = running }, [running])

  useEffect(() => {
    const tick = () => {
      if (runRef.current) {
        pRef.current = (pRef.current + 0.006) % 1
        setPhase(pRef.current)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const H = 110 // mirror separation
  const lCX = 90, rCX = 290
  const topY = 55, botY = topY + H
  const drift = 32
  const innerTop = topY + 4  // untere Kante des oberen Spiegels
  const innerBot = botY - 4  // obere Kante des unteren Spiegels

  // left: straight vertical bounce
  const bounce = phase < 0.5 ? phase / 0.5 : 1 - (phase - 0.5) / 0.5
  const lX = lCX
  const lY = innerBot - bounce * (innerBot - innerTop)

  // right: whole unit (mirrors + photon) drifts together
  const halfProg = phase < 0.5 ? phase / 0.5 : (phase - 0.5) / 0.5
  const xOffset = phase < 0.5
    ? -drift + halfProg * 2 * drift
    : +drift - halfProg * 2 * drift
  const mirrorX = rCX + xOffset
  const rX = rCX + xOffset
  const rY = phase < 0.5
    ? innerBot - halfProg * (innerBot - innerTop)
    : innerTop + halfProg * (innerBot - innerTop)

  const mirrorFill = T.blue
  const glow = 0.6 + 0.4 * Math.sin(phase * Math.PI * 20)

  return (
    <div style={S.vizWrap}>
      <svg width="100%" viewBox="0 0 380 385" style={{ display: 'block' }}>
        {/* Labels */}
        <text x={lCX} y="34" textAnchor="middle"
          fontFamily={T.serif} fontSize="13" fill={T.text} fontStyle="italic">Ruhende Uhr</text>
        <text x={rCX} y="34" textAnchor="middle"
          fontFamily={T.serif} fontSize="13" fill={T.text} fontStyle="italic">Bewegte Uhr</text>

        {/* Divider */}
        <line x1="190" y1="40" x2="190" y2="195"
          stroke={T.border} strokeWidth="1" strokeDasharray="4,3" />

        {/* Left mirrors */}
        <rect x={lCX - 26} y={topY - 5} width="52" height="9" fill={mirrorFill} rx="2" opacity="0.72" />
        <rect x={lCX - 26} y={botY - 4} width="52" height="9" fill={mirrorFill} rx="2" opacity="0.72" />

        {/* Left path */}
        <line x1={lCX} y1={innerTop} x2={lCX} y2={innerBot}
          stroke={T.border} strokeWidth="1.2" strokeDasharray="4,3" />

        {/* Left photon */}
        <circle cx={lX} cy={lY} r={7 * glow} fill={T.gold} opacity="0.2" />
        <circle cx={lX} cy={lY} r="4.5" fill={T.gold} />

        {/* Right mirrors — both travel together */}
        <rect x={mirrorX - 26} y={topY - 5} width="52" height="9" fill={mirrorFill} rx="2" opacity="0.72" />
        <rect x={mirrorX - 26} y={botY - 4} width="52" height="9" fill={mirrorFill} rx="2" opacity="0.72" />

        {/* Right diagonal paths — static guides showing the photon trace */}
        <line x1={rCX - drift} y1={innerBot} x2={rCX + drift} y2={innerTop}
          stroke={T.border} strokeWidth="1.2" strokeDasharray="4,3" />
        <line x1={rCX + drift} y1={innerTop} x2={rCX - drift} y2={innerBot}
          stroke={T.border} strokeWidth="1.2" strokeDasharray="4,3" />

        {/* Right photon */}
        <circle cx={rX} cy={rY} r={7 * glow} fill={T.gold} opacity="0.2" />
        <circle cx={rX} cy={rY} r="4.5" fill={T.gold} />

        {/* Motion arrow */}
        <text x={rCX + 58} y={botY + 12}
          fontFamily={T.mono} fontSize="12" fill={T.accent}>v →</text>

        {/* ── Pythagoras-Dreieck (statisch) ── */}
        {/* A(160,350) B(220,350) C(220,240) — Rechter Winkel bei B */}
        <line x1="20" y1="210" x2="360" y2="210"
          stroke={T.border} strokeWidth="0.7" />
        <text x="190" y="224" textAnchor="middle"
          fontFamily={T.mono} fontSize="10" fill={T.textTer} letterSpacing="1">
          PYTHAGORAS · ZEITDILATATION
        </text>

        {/* Vertikale Kathete BC — c·t₀ */}
        <line x1="220" y1="240" x2="220" y2="350"
          stroke={T.blue} strokeWidth="1.8" />

        {/* Horizontale Kathete AB — v·t */}
        <line x1="160" y1="350" x2="220" y2="350"
          stroke={T.textSec} strokeWidth="1.8" strokeDasharray="5,3" />

        {/* Hypotenuse AC — c·t */}
        <line x1="160" y1="350" x2="220" y2="240"
          stroke={T.gold} strokeWidth="2.5" />

        {/* Rechter-Winkel-Marker bei B(220,350) */}
        <path d="M212,350 L212,342 L220,342"
          fill="none" stroke={T.textSec} strokeWidth="1.2" />

        {/* Label: c·t₀ (rechts der vertikalen Kathete) */}
        <text x="226" y="299" fontFamily={T.serif} fontSize="12"
          fill={T.blue} fontStyle="italic">c · t₀</text>

        {/* Label: v·t (unter der horizontalen Kathete) */}
        <text x="190" y="366" textAnchor="middle"
          fontFamily={T.serif} fontSize="12" fill={T.textSec} fontStyle="italic">v · t</text>

        {/* Label: c·t (entlang der Hypotenuse) — Mittelpunkt (190,295), Winkel −61° */}
        <text x="183" y="295" textAnchor="middle"
          fontFamily={T.serif} fontSize="12" fill={T.gold} fontStyle="italic"
          transform="rotate(-61, 183, 295)">c · t</text>

        {/* Pythagoräische Formel */}
        <text x="190" y="380" textAnchor="middle"
          fontFamily={T.mono} fontSize="11" fill={T.text}>
          (c·t)² = (v·t)² + (c·t₀)²
        </text>
      </svg>
      <span style={S.vizCaption}>Das Licht legt in der bewegten Uhr einen längeren, diagonalen Weg zurück</span>
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button
          onClick={() => setRunning(r => !r)}
          style={{
            fontFamily: T.mono, fontSize: 13,
            padding: '6px 20px',
            background: 'transparent',
            border: `1px solid ${T.border}`,
            borderRadius: 2,
            color: T.textSec,
            cursor: 'pointer',
            letterSpacing: '0.5px',
          }}
        >
          {running ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>
    </div>
  )
}

// ── 5. Zeitdilatations-Rechner ─────────────────────────────────────────────
function ZeitRechner() {
  const [vel, setVel] = useState(50)
  const beta = vel / 100
  const gamma = beta >= 0.9999 ? 9999 : 1 / Math.sqrt(1 - beta * beta)
  const dilated = (1 * gamma).toFixed(3)
  const contracted = (100 * Math.sqrt(Math.max(0, 1 - beta * beta))).toFixed(2)

  return (
    <div style={S.vizWrap}>
      <div style={{ marginBottom: 16 }}>
        <input type="range" min="0" max="99" step="0.2"
          value={vel}
          onChange={e => setVel(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: T.accent }}
        />
        <div style={{ textAlign: 'center', fontFamily: T.mono, fontSize: 20, color: T.accent, marginTop: 6 }}>
          {vel.toFixed(1)} % c
        </div>
      </div>
      <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 3, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textTer, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>
            Lorentz-Faktor γ
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 28, color: T.accent }}>{gamma.toFixed(3)}</div>
        </div>
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 3, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textTer, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>
            1 h an Bord =
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 28, color: T.blue }}>{dilated} h</div>
          <div style={{ fontFamily: T.serif, fontSize: 12, color: T.textSec, marginTop: 2 }}>für ruhenden Beobachter</div>
        </div>
      </div>
      <div style={{ fontFamily: T.serif, fontSize: 14, color: T.textSec, textAlign: 'center' }}>
        Längenkontraktion: Ein 100-m-Objekt erscheint als{' '}
        <span style={{ fontFamily: T.mono, color: T.text }}>{contracted} m</span>
      </div>
    </div>
  )
}

// ── 6. E=mc² Rechner ──────────────────────────────────────────────────────
// ── Timeline ───────────────────────────────────────────────────────────────
const TIMELINE = [
  { year: '1887', title: 'Michelson-Morley-Experiment', text: 'Das Gründungsexperiment: Kein Ätherwind nachweisbar. Das Licht breitet sich in jede Richtung gleich schnell aus. Seitdem hundertfach mit immer höherer Präzision wiederholt — stets dasselbe Nullergebnis.' },
  { year: '1932', title: 'Kennedy-Thorndike-Experiment', text: 'Eine Variante mit ungleich langen Armen. Testete, ob die Lichtgeschwindigkeit von der Laborgeschwindigkeit abhängt. Ergebnis: keine Abhängigkeit.' },
  { year: '1938', title: 'Ives-Stilwell-Experiment', text: 'Erster direkter Nachweis der Zeitdilatation durch Messung des transversalen Doppler-Effekts an schnell bewegten Wasserstoffionen. Die Frequenzverschiebung entsprach exakt der Vorhersage.' },
  { year: '1971', title: 'Hafele-Keating-Experiment', text: 'Atomuhren wurden in Flugzeugen um die Erde geflogen und mit einer am Boden verbliebenen Uhr verglichen. Die Gangdifferenzen bestätigten sowohl die spezielle als auch die allgemeine Relativitätstheorie.' },
  { year: 'Täglich', title: 'GPS-Satelliten', text: 'Jedes GPS-System korrigiert relativistische Zeiteffekte. Ohne diese Korrektur würde die Positionsbestimmung täglich um etwa 10 Kilometer abdriften — ein permanenter, globaler Beweis.' },
  { year: 'Laufend', title: 'Myonen und Teilchenbeschleuniger', text: 'Myonen aus der oberen Atmosphäre haben eine Lebensdauer von nur 2,2 μs — dennoch erreichen sie die Erdoberfläche, weil die Zeitdilatation bei 99,5 % c ihre Lebensdauer verzehnfacht.' },
]

function Timeline() {
  return (
    <div style={{ position: 'relative', paddingLeft: 32, margin: '1.4rem 0' }}>
      <div style={{ position: 'absolute', left: 8, top: 6, bottom: 6, width: 2, background: T.border }} />
      {TIMELINE.map((item, i) => (
        <div key={i} style={{ position: 'relative', marginBottom: i < TIMELINE.length - 1 ? 28 : 0 }}>
          <div style={{
            position: 'absolute', left: -28, top: 5,
            width: 10, height: 10, borderRadius: '50%',
            background: T.accent, border: `2px solid ${T.bg}`,
          }} />
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.accent, marginBottom: 3 }}>{item.year}</div>
          <div style={{ fontFamily: T.display, fontSize: 16, fontWeight: 500, color: T.text, marginBottom: 5 }}>{item.title}</div>
          <div style={{ fontFamily: T.serif, fontSize: 15.5, lineHeight: 1.7, color: T.textSec }}>{item.text}</div>
        </div>
      ))}
    </div>
  )
}

// ── Modern physics list ────────────────────────────────────────────────────
const MODERN = [
  { title: 'Quantenfeldtheorie', text: 'Die Vereinigung von Quantenmechanik und spezieller Relativitätstheorie führte zur Quantenfeldtheorie — dem erfolgreichsten theoretischen Rahmen der Physik. Das Standardmodell der Teilchenphysik basiert vollständig auf der Lorentz-Symmetrie.' },
  { title: 'Allgemeine Relativitätstheorie', text: 'Einstein erweiterte 1915 seine Theorie um die Gravitation. Auch hier bleibt c die fundamentale Grenzgeschwindigkeit — Gravitationswellen breiten sich mit Lichtgeschwindigkeit aus, was 2015 durch LIGO erstmals direkt gemessen wurde.' },
  { title: 'Technologische Anwendungen', text: 'Ohne relativistische Korrekturen wären GPS, Satellitennavigation und Teilchenbeschleuniger nicht funktionsfähig. Auch in der Nuklearmedizin (PET-Scans) und Materialforschung spielen relativistische Effekte eine praktische Rolle.' },
  { title: 'Offene Forschungsfragen', text: 'Ob c unter allen Bedingungen konstant ist, wird aktiv erforscht. Theorien der Quantengravitation diskutieren, ob c bei extrem hohen Energien — nahe der Planck-Skala — minimal variieren könnte. Bisherige Messungen zeigen keine Abweichung.' },
]

// ── TOC ────────────────────────────────────────────────────────────────────
const TOC = [
  { n: '01', t: 'Einführung — Was bedeutet Konstanz der Lichtgeschwindigkeit?' },
  { n: '02', t: 'Das Michelson-Morley-Experiment' },
  { n: '04', t: 'Einsteins Postulate der speziellen Relativitätstheorie' },
  { n: '05', t: 'Was macht c so besonders?' },
  { n: '06', t: 'Die revolutionären Konsequenzen' },
  { n: '07', t: 'Experimentelle Bestätigungen' },
  { n: '08', t: 'Bedeutung für die moderne Physik' },
]

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const bgStyle = {
    background: [
      'radial-gradient(ellipse at 80% 5%, rgba(196,147,10,0.045) 0%, transparent 55%)',
      'radial-gradient(ellipse at 5% 95%, rgba(139,69,19,0.055) 0%, transparent 50%)',
      '#F7F3EE',
    ].join(', '),
    minHeight: '100vh',
  }

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,300;1,8..60,400&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div style={bgStyle}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>

          {/* ── HEADER ── */}
          <header style={{ paddingTop: '3rem', paddingBottom: '2.5rem', borderBottom: `1px solid ${T.border}` }}>
            <div style={{
              fontFamily: T.mono, fontSize: 11, color: T.accent,
              textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '1.4rem',
            }}>
              Spezielle Relativitätstheorie
            </div>
            <h1 style={{
              fontFamily: T.display, fontSize: 38, fontWeight: 500,
              lineHeight: 1.2, margin: '0 0 1rem', color: T.text,
            }}>
              Die Konstanz der<br />Lichtgeschwindigkeit
            </h1>
            <p style={{
              fontFamily: T.serif, fontSize: 17, color: T.textSec,
              lineHeight: 1.65, margin: '0 0 1.6rem', maxWidth: 580,
            }}>
              Warum sich Licht für jeden Beobachter gleich schnell bewegt — und wie diese Erkenntnis
              unser Verständnis von Raum und Zeit revolutionierte
            </p>
            <div style={{ fontFamily: T.mono, fontSize: 22, color: T.accent, letterSpacing: '1px' }}>
              c = 299 792 458 m/s
            </div>
            <div style={{ fontFamily: T.serif, fontSize: 13, color: T.textSec, marginTop: 5 }}>
              exakt, per Definition seit 1983
            </div>
          </header>

          {/* ── TOC ── */}
          <nav style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 3, padding: '18px 22px', margin: '2.5rem 0',
          }}>
            <div style={{
              fontFamily: T.mono, fontSize: 11, color: T.textTer,
              textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 14,
            }}>Inhalt</div>
            {TOC.map((item, i) => (
              <div key={item.n} style={{
                display: 'flex', gap: 14, padding: '5px 0',
                borderBottom: i < TOC.length - 1 ? `1px solid ${T.border}` : 'none',
              }}>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.accent, minWidth: 22 }}>{item.n}</span>
                <span style={{ fontFamily: T.serif, fontSize: 15, color: T.textSec }}>{item.t}</span>
              </div>
            ))}
          </nav>

          {/* ── 01 EINFÜHRUNG ── */}
          <section style={S.sectionGap}>
            <Heading num="01">Einführung</Heading>
            <p style={S.p}>
              Stell dir vor, du stehst an einer Straße und ein Auto fährt mit 100 km/h an dir vorbei.
              Wenn du selbst mit 60 km/h in die gleiche Richtung fährst, misst du die Geschwindigkeit
              des Autos relativ zu dir als nur noch 40 km/h. Das ist Alltagsphysik — Geschwindigkeiten
              addieren und subtrahieren sich, ganz intuitiv. Doch Licht verhält sich grundlegend anders.
            </p>
            <p style={S.p}>
              Die Konstanz der Lichtgeschwindigkeit besagt: Die Geschwindigkeit des Lichts im Vakuum
              beträgt immer exakt c ≈ 299 792 458 m/s — unabhängig davon, wie schnell sich die
              Lichtquelle bewegt und unabhängig davon, wie schnell sich der Beobachter bewegt. Ein
              Astronaut, der mit 90 % der Lichtgeschwindigkeit auf einen Lichtstrahl zufliegt, misst
              denselben Wert c wie ein Beobachter, der stillsteht. Das ist zutiefst kontraintuitiv und
              widerspricht unserer alltäglichen Erfahrung.
            </p>
            <Callout label="Kernaussage">
              Die Lichtgeschwindigkeit im Vakuum ist eine absolute Konstante der Natur. Sie ist
              unabhängig vom Bewegungszustand der Quelle und des Beobachters. Kein materielles Objekt
              kann diese Geschwindigkeit erreichen oder überschreiten. Dieses Prinzip bildet das
              Fundament der speziellen Relativitätstheorie.
            </Callout>
            <p style={S.p}>
              Dieses Prinzip ist nicht einfach eine Annahme, die Einstein aus dem Nichts aufstellte.
              Es ergab sich aus jahrzehntelanger experimenteller und theoretischer Arbeit — insbesondere
              aus James Clerk Maxwells Theorie des Elektromagnetismus, die in den 1860er-Jahren zeigte,
              dass Licht eine elektromagnetische Welle ist, deren Geschwindigkeit direkt aus den
              Naturkonstanten der elektrischen und magnetischen Feldstärke folgt. In Maxwells Gleichungen
              taucht kein Bezugssystem auf — die Lichtgeschwindigkeit ist dort eine universelle Konstante,
              nicht relativ zu irgendetwas.
            </p>
            <SpeedBars />
          </section>

          {/* ── 02 MICHELSON-MORLEY ── */}
          <section style={S.sectionGap}>
            <Heading num="02">Das Michelson-Morley-Experiment</Heading>
            <p style={S.p}>
              Im Jahr 1887 führten Albert A. Michelson und Edward W. Morley in Cleveland, Ohio, eines
              der folgenreichsten Experimente der Physikgeschichte durch. Sie konstruierten ein
              Interferometer: Ein Lichtstrahl wird durch einen halbdurchlässigen Spiegel in zwei
              Teilstrahlen aufgeteilt, die senkrecht zueinander laufen. Jeder Strahl wird an einem
              Spiegel reflektiert und kehrt zum Ausgangspunkt zurück, wo beide wieder vereinigt werden.
            </p>
            <Interferometer />
            <p style={S.p}>
              Die Physiker erwarteten eine Verschiebung der Interferenzstreifen beim Drehen des
              Apparats, weil ein Strahl „mit" und der andere „gegen" den Ätherwind laufen sollte. Bei
              der Geschwindigkeit der Erde hätte diese Verschiebung zwar winzig sein sollen — etwa
              0,4 Streifenbreiten —, aber Michelsons Instrument war präzise genug, um selbst ein Zehntel
              davon zu messen.
            </p>
            <Callout label="Das Ergebnis">
              Es gab keine Verschiebung. Null. In keiner Richtung und zu keiner Jahreszeit. Das Licht
              bewegte sich in jeder Richtung exakt gleich schnell. Dieses „Nullergebnis" war eine der
              größten Überraschungen der Physikgeschichte.
            </Callout>
            <p style={S.p}>
              In den folgenden Jahren wurden verschiedene Rettungsversuche für den Äther unternommen.
              Hendrik Lorentz und George FitzGerald postulierten unabhängig voneinander, dass sich
              Körper in Bewegungsrichtung physisch verkürzen — gerade genug, um den Effekt zu maskieren.
              Diese „Lorentz-Kontraktion" war mathematisch korrekt, aber ad hoc. Erst Einstein lieferte
              1905 eine elegante Erklärung, die keinen Äther mehr benötigte.
            </p>
          </section>

          {/* ── 04 EINSTEINS POSTULATE ── */}
          <section style={S.sectionGap}>
            <Heading num="04">Einsteins Postulate</Heading>
            <p style={S.p}>
              Im Jahr 1905 veröffentlichte der damals 26-jährige Albert Einstein seine Arbeit „Zur
              Elektrodynamik bewegter Körper". Statt das Michelson-Morley-Ergebnis durch komplizierte
              Hilfskonstruktionen zu erklären, stellte er zwei einfache, aber radikale Postulate auf:
            </p>
            <div className="two-col" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 16, margin: '1.4rem 0',
            }}>
              {[
                { roman: 'I', title: 'Relativitätsprinzip', text: 'Die Gesetze der Physik haben in allen Inertialsystemen dieselbe Form. Es gibt kein bevorzugtes Bezugssystem — kein „absolutes Ruhesystem". Kein physikalisches Experiment kann feststellen, ob man sich gleichförmig bewegt oder ruht.' },
                { roman: 'II', title: 'Konstanz von c', text: 'Die Lichtgeschwindigkeit im Vakuum hat in allen Inertialsystemen denselben Wert c, unabhängig von der Bewegung der Lichtquelle oder des Beobachters. Licht braucht kein Medium und seine Geschwindigkeit addiert sich nicht mit der Quellengeschwindigkeit.' },
              ].map(card => (
                <div key={card.roman} style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 3,
                  padding: '20px 20px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 6, right: 12,
                    fontFamily: T.display, fontSize: 52, fontWeight: 400,
                    color: T.accent, opacity: 0.16, lineHeight: 1, userSelect: 'none',
                  }}>{card.roman}</div>
                  <div style={{ fontFamily: T.display, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 10 }}>
                    {card.title}
                  </div>
                  <div style={{ fontFamily: T.serif, fontSize: 15, lineHeight: 1.72, color: T.textSec }}>
                    {card.text}
                  </div>
                </div>
              ))}
            </div>
            <p style={S.p}>
              Das Revolutionäre war nicht die Mathematik — es war der Mut, die Konsequenzen zweier
              einfacher Prinzipien radikal zu Ende zu denken. Wenn die Lichtgeschwindigkeit für alle
              Beobachter gleich ist, dann können Raum und Zeit nicht absolut sein. Was als Grundlage
              seit Newton galt — universelle Zeit und absoluter Raum —, musste aufgegeben werden.
            </p>
            <Callout label="Entscheidend">
              Das zweite Postulat ist keine bloße Annahme, sondern folgt konsequent aus Maxwells
              Elektrodynamik und wird durch Experimente immer wieder bestätigt. Einstein hat es nicht
              „erfunden", sondern ernst genommen, was die Gleichungen bereits sagten.
            </Callout>
          </section>

          {/* ── 05 WAS MACHT C BESONDERS ── */}
          <section style={S.sectionGap}>
            <Heading num="05">Was macht c so besonders?</Heading>
            <p style={S.p}>
              Die Lichtgeschwindigkeit c ist nicht einfach „die Geschwindigkeit, mit der sich Licht
              zufällig bewegt". Sie ist eine fundamentale Strukturkonstante des Universums — eine
              kosmische Geschwindigkeitsbegrenzung, die tief in der Geometrie der Raumzeit verankert ist.
            </p>
            <p style={S.p}>
              <strong style={{ color: T.accent }}>c ist die Grenzgeschwindigkeit der Kausalität.</strong>{' '}
              Keine Information, keine Energie und kein materielles Objekt kann sich schneller als c
              ausbreiten. Das ist keine technische Einschränkung — es ist ein fundamentales Naturgesetz.
              Je mehr Energie man einem Teilchen zuführt, desto näher kommt es an c heran — aber es
              erreicht c nie. Die benötigte Energie steigt ins Unendliche.
            </p>
            <LorentzCanvas />
            <p style={S.p}>
              <strong style={{ color: T.accent }}>c verbindet Raum und Zeit.</strong>{' '}
              In der speziellen Relativitätstheorie ist c der Umrechnungsfaktor zwischen Raum- und
              Zeitkoordinaten. Eine Sekunde in der Zeit entspricht knapp 300 000 Kilometern im Raum.
              Raum und Zeit bilden eine vierdimensionale Raumzeit, in der c die „Wechselkursrate"
              festlegt.
            </p>
            <RaumzeitVektor />
            <p style={S.p}>
              <strong style={{ color: T.accent }}>c folgt aus den Naturkonstanten.</strong>{' '}
              Die Lichtgeschwindigkeit ergibt sich direkt aus der elektrischen Feldkonstante ε₀ und der
              magnetischen Feldkonstante μ₀. Sie ist also keine willkürliche Zahl, sondern eine
              zwingende Konsequenz der elektromagnetischen Grundgesetze.
            </p>
            <Formula
              f="c = 1 / √(ε₀ · μ₀)"
              caption="Die Lichtgeschwindigkeit folgt direkt aus den elektromagnetischen Feldkonstanten"
            />
            <p style={S.p}>
              Seit 1983 wird der Meter über die Lichtgeschwindigkeit definiert: Ein Meter ist die
              Strecke, die Licht im Vakuum in 1/299 792 458 Sekunden zurücklegt. Damit ist c nicht mehr
              ein Messwert, sondern eine exakte Definitionskonstante.
            </p>
          </section>

          {/* ── 06 KONSEQUENZEN ── */}
          <section style={S.sectionGap}>
            <Heading num="06">Die revolutionären Konsequenzen</Heading>
            <p style={S.p}>
              Wenn man die Konstanz der Lichtgeschwindigkeit akzeptiert, folgen daraus Konsequenzen, die
              unser Alltagsverständnis sprengen. Diese Effekte sind keine Gedankenspiele — sie sind
              experimentell vielfach bestätigt.
            </p>

            <h3 style={S.h3}>Zeitdilatation</h3>
            <p style={S.p}>
              Bewegte Uhren gehen langsamer. Je schneller sich ein Objekt bewegt, desto langsamer
              vergeht seine Zeit relativ zu einem ruhenden Beobachter. Bei 87 % von c vergeht die Zeit
              nur noch halb so schnell. Dies ist kein Fehler der Uhren — die Zeit selbst vergeht
              tatsächlich langsamer.
            </p>
            <Formula
              f="Δt' = Δt / √(1 − v²/c²)"
              caption="Zeitdilatationsformel — die bewegte Zeit Δt' ist immer größer als die Eigenzeit Δt"
            />
            <LichtUhr />
            <ZeitRechner />

            <h3 style={S.h3}>Längenkontraktion</h3>
            <p style={S.p}>
              Bewegte Objekte werden in Bewegungsrichtung kürzer. Ein Raumschiff, das mit 87 % von c
              fliegt, erscheint für einen ruhenden Beobachter nur noch halb so lang. Das Objekt selbst
              „merkt" davon nichts — für die Insassen ist alles normal.
            </p>
            <Formula
              f="L' = L · √(1 − v²/c²)"
              caption="Längenkontraktion — die beobachtete Länge L' ist kürzer als die Eigenlänge L"
            />

            <h3 style={S.h3}>Relativität der Gleichzeitigkeit</h3>
            <p style={S.p}>
              Zwei Ereignisse, die für einen Beobachter gleichzeitig stattfinden, können für einen
              bewegten Beobachter zu unterschiedlichen Zeiten geschehen. „Gleichzeitig" ist kein
              absolutes Konzept mehr, sondern hängt vom Bezugssystem ab. Das erschüttert unser
              fundamentalstes Zeitverständnis.
            </p>
          </section>

          {/* ── 07 EXPERIMENTE ── */}
          <section style={S.sectionGap}>
            <Heading num="07">Experimentelle Bestätigungen</Heading>
            <p style={S.p}>
              Die Konstanz der Lichtgeschwindigkeit gehört zu den am besten überprüften Aussagen der
              gesamten Physik. Hier die wichtigsten Meilensteine:
            </p>
            <Timeline />
          </section>

          {/* ── 08 MODERNE PHYSIK ── */}
          <section style={S.sectionGap}>
            <Heading num="08">Bedeutung für die moderne Physik</Heading>
            <p style={S.p}>
              Die Konstanz der Lichtgeschwindigkeit ist das Fundament, auf dem weite Teile der modernen
              Physik aufgebaut sind. Praktisch jede fundamentale Theorie setzt die Lorentz-Invarianz —
              und damit c = const — als Grundlage voraus.
            </p>
            <div style={{ margin: '1.4rem 0' }}>
              {MODERN.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 20, marginBottom: i < MODERN.length - 1 ? 26 : 0 }}>
                  <div style={{
                    flexShrink: 0,
                    width: 36, height: 36, borderRadius: '50%',
                    background: T.surface, border: `1px solid ${T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: T.mono, fontSize: 14, color: T.accent, fontWeight: 600,
                  }}>{i + 1}</div>
                  <div>
                    <div style={{ fontFamily: T.display, fontSize: 17, fontWeight: 500, color: T.text, marginBottom: 5 }}>
                      {item.title}
                    </div>
                    <div style={{ fontFamily: T.serif, fontSize: 15.5, lineHeight: 1.72, color: T.textSec }}>
                      {item.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Callout label="Fazit">
              Die Konstanz der Lichtgeschwindigkeit ist eine der tiefgreifendsten Erkenntnisse der
              Naturwissenschaft. Sie zwingt uns, unsere Alltagsintuition über Raum und Zeit
              aufzugeben, und eröffnet ein Universum, das seltsamer, eleganter und faszinierender ist,
              als es die klassische Physik je ahnen ließ. Was als Nullergebnis eines gescheiterten
              Experiments begann, wurde zur Grundlage des modernen Weltbildes.
            </Callout>
          </section>

          {/* ── DIVIDER ── */}
          <div style={{
            textAlign: 'center',
            color: T.border,
            letterSpacing: '10px',
            fontSize: 20,
            margin: '0.5rem 0 3rem',
          }}>
            * * *
          </div>

          {/* ── FOOTER ── */}
          <footer style={{ borderTop: `1px solid ${T.border}`, padding: '2rem 0 2.5rem', textAlign: 'center' }}>
            <div style={{ fontFamily: T.serif, fontSize: 14, color: T.textTer, marginBottom: 6 }}>
              Erstellt von
            </div>
            <div style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 500, letterSpacing: '1px', color: T.text, marginBottom: 8 }}>
              Hamsa &amp; Julian
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textTer }}>
              © {new Date().getFullYear()} — Die Konstanz der Lichtgeschwindigkeit
            </div>
          </footer>

        </div>
      </div>
    </>
  )
}
