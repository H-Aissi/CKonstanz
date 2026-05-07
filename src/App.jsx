import React, { useEffect, useRef, useState, useCallback } from 'react'

// ── Canvas & projection setup ──────────────────────────────────────────────
const W = 800
const H = 490

// Grid origin (bottom-center area)
const OX = W * 0.43
const OY = H * 0.84

// Isometric axis vectors (matching screenshot style)
const S_VEC = { x: 162, y: 70 }   // Raum: right + slightly down
const T_VEC = { x: 0,   y: -218 } // Zeit: straight up

function proj(s, t) {
  return { x: OX + s * S_VEC.x, y: OY + s * S_VEC.y + t * T_VEC.y }
}

// Apple is fixed at this spacetime coordinate — it never moves on screen
const APPLE_S = 1.05
const APPLE_T = 0.90
const APPLE_POS = proj(APPLE_S, APPLE_T)

const N_GHOSTS = 8
const GHOST_DT = 0.10   // time-step between each ghost

const MAX_BETA = 0.999

// ── Static stars ────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 160 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  r: Math.random() * 1.5 + 0.25,
  o: Math.random() * 0.55 + 0.25,
}))

// ── Apple SVG ───────────────────────────────────────────────────────────────
function Apple({ x, y, opacity = 1, scale = 1, ghost = false }) {
  const bodyFill   = ghost ? '#3a5070' : '#d42020'
  const bodyFill2  = ghost ? '#4a6080' : '#e83030'
  const stemColor  = ghost ? '#334' : '#7a5228'
  const leafColor  = ghost ? '#2a4060' : '#3a9030'

  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
      {/* floor shadow */}
      {!ghost && (
        <ellipse cx="1" cy="16" rx="12" ry="4.5" fill="rgba(0,0,0,0.28)"/>
      )}
      {/* body */}
      <path d="M-1,-14 Q-16,-12 -15,1 Q-14,14 0,14 Q14,14 15,1 Q16,-12 1,-14" fill={bodyFill}/>
      <path d="M1,-14 Q16,-12 15,1 Q14,11 5,14 Q11,8 12,-1 Q13,-11 1,-14" fill={bodyFill2}/>
      {/* top indent */}
      <ellipse cx="0" cy="-13" rx="4.5" ry="3" fill={ghost ? '#283a50' : '#aa1515'}/>
      {/* stem */}
      <path d="M0,-15 Q1,-22 5,-23" stroke={stemColor} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* leaf */}
      <path d="M5,-21 Q14,-26 11,-16 Q7,-18 5,-21Z" fill={leafColor}/>
      {/* highlight (only on real apple) */}
      {!ghost && <>
        <ellipse cx="-5.5" cy="-4" rx="3.8" ry="5.8"
          fill="rgba(255,255,255,0.22)" transform="rotate(-20,-5.5,-4)"/>
        <ellipse cx="-4" cy="-9" rx="2" ry="2.5"
          fill="rgba(255,255,255,0.16)"/>
      </>}
    </g>
  )
}

// ── Isometric grid ──────────────────────────────────────────────────────────
function Grid() {
  const dim   = 'rgba(70,130,200,0.20)'
  const axis  = 'rgba(85,170,240,0.60)'
  const lines = []

  // Horizontal grid lines (parallel to Raum axis)
  for (let t = 0; t <= 5; t++) {
    const frac = t / 5
    const p0 = proj(-0.3, frac), p1 = proj(2.6, frac)
    lines.push(
      <line key={`t${t}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y}
        stroke={t === 0 ? axis : dim} strokeWidth={t === 0 ? 1.8 : 0.8}/>
    )
  }
  // Vertical grid lines (parallel to Zeit axis)
  for (let s = -0.3; s <= 2.6; s += 0.5) {
    const ss = Math.round(s * 10) / 10
    const p0 = proj(ss, 0), p1 = proj(ss, 1)
    lines.push(
      <line key={`s${ss}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y}
        stroke={ss === 0 ? axis : dim} strokeWidth={ss === 0 ? 1.8 : 0.8}/>
    )
  }
  return <g>{lines}</g>
}

// ── Axis arrows ─────────────────────────────────────────────────────────────
function Axes() {
  const o = proj(0, 0)
  const sEnd = proj(2.75, 0)
  const tEnd = proj(0,    1.10)
  const color = '#55b8ff'

  return (
    <g>
      <defs>
        <marker id="aS" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3Z" fill={color}/>
        </marker>
        <marker id="aT" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3Z" fill={color}/>
        </marker>
      </defs>
      <line x1={o.x} y1={o.y} x2={sEnd.x} y2={sEnd.y}
        stroke={color} strokeWidth="2.2" markerEnd="url(#aS)"/>
      <line x1={o.x} y1={o.y} x2={tEnd.x} y2={tEnd.y}
        stroke={color} strokeWidth="2.2" markerEnd="url(#aT)"/>
      <text x={sEnd.x + 14} y={sEnd.y + 5}
        fill={color} fontSize="15" fontWeight="700" fontFamily="system-ui">Raum</text>
      <text x={tEnd.x - 8} y={tEnd.y - 12}
        fill={color} fontSize="15" fontWeight="700" fontFamily="system-ui" textAnchor="middle">Zeit</text>
    </g>
  )
}

// ── "Always at c" quarter-circle diagram ────────────────────────────────────
function SpeedCircle({ beta }) {
  const cx = 70, cy = 72, r = 48
  const timeComp  = Math.sqrt(1 - beta * beta)  // c·√(1-β²)
  const spaceComp = beta                         // β·c

  const tipX = cx + spaceComp * r
  const tipY = cy - timeComp  * r

  // Arc: top (pure Zeit) → right (pure Raum)
  const arcD = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`

  return (
    <g>
      <rect x="0" y="0" width="145" height="148" rx="10"
        fill="rgba(4,8,28,0.88)" stroke="rgba(80,140,220,0.35)" strokeWidth="1"/>

      <text x="72" y="14" textAnchor="middle" fill="#9ac8f0"
        fontSize="9" fontFamily="system-ui" fontWeight="600">
        Geschwindigkeit durch Raumzeit
      </text>

      {/* Arc (represents constant c) */}
      <path d={arcD} fill="none" stroke="rgba(160,210,255,0.30)"
        strokeWidth="1.5" strokeDasharray="4,2"/>

      {/* Axis guides */}
      <line x1={cx} y1={cy} x2={cx}     y2={cy - r - 6} stroke="#55b8ff" strokeWidth="1" opacity="0.35"/>
      <line x1={cx} y1={cy} x2={cx+r+6} y2={cy}         stroke="#ff8c00" strokeWidth="1" opacity="0.35"/>

      {/* Zeit component */}
      <line x1={cx} y1={cy} x2={cx}   y2={tipY}
        stroke="#55b8ff" strokeWidth="2.2" strokeLinecap="round"/>

      {/* Raum component */}
      <line x1={cx} y1={tipY} x2={tipX} y2={tipY}
        stroke="#ff8c00" strokeWidth="2.2" strokeLinecap="round"/>

      {/* Resultant vector (always = c = radius) */}
      <line x1={cx} y1={cy} x2={tipX} y2={tipY}
        stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx={tipX} cy={tipY} r="4.5" fill="white" opacity="0.9"/>

      {/* "= c" label */}
      <text x={cx + 6} y={cy + 15} fill="rgba(255,255,255,0.65)"
        fontSize="9" fontFamily="monospace">immer = c</text>

      {/* Axis labels */}
      <text x={cx - 6} y={cy - r - 8} fill="#55b8ff"
        fontSize="8.5" fontFamily="system-ui" textAnchor="middle">Zeit</text>
      <text x={cx + r + 7} y={cy + 4} fill="#ff8c00"
        fontSize="8.5" fontFamily="system-ui">Raum</text>

      {/* Percentages */}
      <text x={cx - 8} y={tipY - 4} fill="#55b8ff"
        fontSize="7.5" fontFamily="monospace" textAnchor="end">
        {(timeComp * 100).toFixed(0)}%
      </text>
      <text x={tipX + 4} y={tipY + 4} fill="#ff8c00"
        fontSize="7.5" fontFamily="monospace">
        {(spaceComp * 100).toFixed(0)}%
      </text>
    </g>
  )
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [beta, setBeta]         = useState(0.0)
  const [properTime, setProperTime] = useState(0)
  const [coordTime, setCoordTime]   = useState(0)
  const [running, setRunning]   = useState(true)

  const animRef  = useRef(null)
  const lastRef  = useRef(null)
  const timeRef  = useRef({ proper: 0, coord: 0 })
  const betaRef  = useRef(0)

  useEffect(() => { betaRef.current = beta }, [beta])

  const tick = useCallback((ts) => {
    if (!lastRef.current) lastRef.current = ts
    const dt = Math.min((ts - lastRef.current) / 1000, 0.05) * 0.45
    lastRef.current = ts

    const b = betaRef.current
    const gamma = 1 / Math.sqrt(1 - b * b)
    timeRef.current.coord  += dt
    timeRef.current.proper += dt / gamma

    setCoordTime(timeRef.current.coord)
    setProperTime(timeRef.current.proper)

    animRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (running) {
      lastRef.current = null
      animRef.current = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(animRef.current)
    }
    return () => cancelAnimationFrame(animRef.current)
  }, [running, tick])

  const gamma     = beta < 0.001 ? 1 : 1 / Math.sqrt(1 - beta * beta)
  const sliderPct = (beta / MAX_BETA) * 100

  // Ghost positions: each step back in time moves back beta*GHOST_DT in space
  const ghosts = Array.from({ length: N_GHOSTS }, (_, i) => {
    const n   = i + 1
    const s   = APPLE_S - n * beta  * GHOST_DT
    const t   = APPLE_T - n         * GHOST_DT
    const pos = proj(s, t)
    const fade = 1 - n / (N_GHOSTS + 1.5)
    return { pos, fade }
  })

  // Trail path through apple + all ghosts
  const pts   = [APPLE_POS, ...ghosts.map(g => g.pos)]
  const trailD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  // Red swept triangle: apple → oldest ghost → "pure-time" point below apple
  const oldest       = ghosts[N_GHOSTS - 1].pos
  const pureTimePt   = proj(APPLE_S, APPLE_T - N_GHOSTS * GHOST_DT)
  const triangleD    = [
    `M${APPLE_POS.x.toFixed(1)},${APPLE_POS.y.toFixed(1)}`,
    `L${oldest.x.toFixed(1)},${oldest.y.toFixed(1)}`,
    `L${pureTimePt.x.toFixed(1)},${pureTimePt.y.toFixed(1)}`,
    'Z',
  ].join(' ')

  return (
    <div style={{
      minHeight: '100vh', background: '#07071a',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: 'system-ui, sans-serif', color: '#dde',
    }}>

      {/* ── Title ── */}
      <div style={{ paddingTop: 28, paddingBottom: 4, textAlign: 'center', maxWidth: 680, padding: '28px 16px 4px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#aad4ff', letterSpacing: 0.4 }}>
          Raumzeit &amp; Spezielle Relativitätstheorie
        </h1>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: '#5a7a99', lineHeight: 1.5 }}>
          Du bewegst dich <strong style={{ color: '#ffffff' }}>immer mit Lichtgeschwindigkeit</strong> durch die
          Raumzeit — nur die Aufteilung zwischen Zeit und Raum ändert sich.
        </p>
      </div>

      {/* ── SVG Canvas ── */}
      <div style={{ margin: '10px 0', position: 'relative' }}>
        <svg width={W} height={H} style={{
          borderRadius: 14,
          background: 'radial-gradient(ellipse at 48% 32%, #0d1535 0%, #07071a 100%)',
          display: 'block',
          boxShadow: '0 0 60px rgba(0,60,180,0.18)',
        }}>

          {/* Stars */}
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o}/>
          ))}

          {/* Grid */}
          <Grid/>
          <Axes/>

          {/* Light-cone guide (v = c) */}
          {(() => {
            const o  = proj(0, 0)
            const lc = proj(1, 1)  // slope 1 = c in natural units
            return (
              <line x1={o.x} y1={o.y} x2={lc.x} y2={lc.y}
                stroke="rgba(255,240,100,0.18)" strokeWidth="1.5"
                strokeDasharray="6,4"/>
            )
          })()}

          {/* Swept triangle */}
          <path d={triangleD}
            fill="rgba(210,60,30,0.13)"
            stroke="rgba(220,80,40,0.42)" strokeWidth="1.2"/>

          {/* Worldline trail glow */}
          <path d={trailD} fill="none"
            stroke="rgba(255,100,50,0.18)" strokeWidth="14" strokeLinecap="round"/>
          <path d={trailD} fill="none"
            stroke="rgba(255,130,60,0.45)" strokeWidth="3.5" strokeLinecap="round"/>

          {/* Ghost apples (shadow worldline) */}
          {ghosts.map((g, i) => (
            <Apple key={i}
              x={g.pos.x} y={g.pos.y}
              opacity={g.fade * 0.60}
              scale={0.60 + g.fade * 0.10}
              ghost={true}/>
          ))}

          {/* Main apple — always at APPLE_POS */}
          <Apple x={APPLE_POS.x} y={APPLE_POS.y} opacity={1} scale={0.80}/>

          {/* ── Speed circle inset (top-left) ── */}
          <g transform="translate(12,12)">
            <SpeedCircle beta={beta}/>
          </g>

          {/* ── Readout box (top-right) ── */}
          <g transform={`translate(${W - 198},14)`}>
            <rect rx="9" width="184" height="92"
              fill="rgba(4,8,28,0.84)" stroke="rgba(80,140,220,0.30)" strokeWidth="1"/>
            <text x="10" y="24" fill="#88ccff" fontSize="12" fontFamily="monospace">
              v = {(beta * 100).toFixed(1)} % c
            </text>
            <text x="10" y="42" fill="#88ccff" fontSize="12" fontFamily="monospace">
              γ = {gamma.toFixed(3)}
            </text>
            <text x="10" y="62" fill="#ffa040" fontSize="12" fontFamily="monospace">
              τ Eigenzeit   = {properTime.toFixed(2)} s
            </text>
            <text x="10" y="80" fill="#70b8ff" fontSize="12" fontFamily="monospace">
              t Koordinaten = {coordTime.toFixed(2)} s
            </text>
          </g>

          {/* Worldline angle label */}
          {beta > 0.03 && (() => {
            const mid = ghosts[Math.floor(N_GHOSTS / 2)].pos
            const angleRad = Math.atan2(
              APPLE_POS.x - oldest.x,
              oldest.y    - APPLE_POS.y
            )
            const angleDeg = (angleRad * 180 / Math.PI).toFixed(1)
            return (
              <text x={mid.x + 12} y={mid.y - 6}
                fill="rgba(255,160,80,0.8)" fontSize="11" fontFamily="monospace">
                {angleDeg}°
              </text>
            )
          })()}
        </svg>
      </div>

      {/* ── Slider ── */}
      <div style={{ width: W, maxWidth: '96vw', padding: '0 4px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'rgba(6,12,38,0.90)', borderRadius: 14,
          padding: '15px 24px', border: '1px solid rgba(80,140,220,0.22)',
        }}>
          <span style={{ color: '#88ccff', fontWeight: 700, fontSize: 14, minWidth: 36 }}>Zeit</span>

          <div style={{ flex: 1, position: 'relative', height: 28, display: 'flex', alignItems: 'center' }}>
            {/* Colored track */}
            <div style={{
              position: 'absolute', left: 0, right: 0, height: 11, borderRadius: 6,
              background: `linear-gradient(to right, #7fc8ff ${sliderPct}%, #ff8c00 ${sliderPct}%)`,
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.45)',
            }}/>
            {/* Native range input (invisible, on top) */}
            <input type="range" min="0" max="100" step="0.3"
              value={sliderPct}
              onChange={e => setBeta((parseFloat(e.target.value) / 100) * MAX_BETA)}
              style={{
                position: 'absolute', left: 0, right: 0, width: '100%',
                margin: 0, opacity: 0, height: 28, cursor: 'pointer', zIndex: 2,
              }}/>
            {/* Custom thumb */}
            <div style={{
              position: 'absolute', left: `calc(${sliderPct}% - 11px)`,
              width: 22, height: 22, borderRadius: '50%',
              background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.55)',
              border: '3px solid #7fc8ff', pointerEvents: 'none', zIndex: 1,
            }}/>
          </div>

          <span style={{ color: '#ff8c00', fontWeight: 700, fontSize: 14, minWidth: 40 }}>Raum</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: 7, fontSize: 12, color: '#445566' }}>
          Links = ruhend (maximale Eigenzeit) · Rechts = nahe Lichtgeschwindigkeit (Eigenzeit verlangsamt sich)
        </div>

        {/* Pause button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <button onClick={() => setRunning(r => !r)} style={{
            padding: '7px 26px', borderRadius: 8, border: 'none',
            background: running ? 'rgba(80,140,220,0.20)' : 'rgba(255,140,0,0.20)',
            color:      running ? '#88ccff'              : '#ffaa40',
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
            outline: `1px solid ${running ? 'rgba(80,140,220,0.45)' : 'rgba(255,140,0,0.45)'}`,
            transition: 'all 0.2s',
          }}>
            {running ? '⏸ Pause' : '▶ Weiter'}
          </button>
        </div>
      </div>

      {/* ── Explanation ── */}
      <div style={{
        maxWidth: 680, margin: '22px 16px 0',
        padding: '18px 24px',
        background: 'rgba(6,12,38,0.70)', borderRadius: 12,
        border: '1px solid rgba(80,140,220,0.18)',
        fontSize: 13, lineHeight: 1.78, color: '#99aacc',
      }}>
        <strong style={{ color: '#aad4ff' }}>Was du siehst:</strong> Der Apfel bewegt sich <em>nicht</em> im Raum — er steht still.
        Trotzdem bewegt er sich mit konstant <strong style={{ color: '#fff' }}>c</strong> durch die Raumzeit.
        Bei <strong style={{ color: '#88ccff' }}>v = 0</strong> (Slider links) geht seine gesamte Bewegung in die Zeitrichtung —
        die blauen Schatten stapeln sich senkrecht <em>nach unten</em> (= in die Vergangenheit).
        Ziehst du den Slider nach rechts, fließt mehr Bewegungsbudget in den <strong style={{ color: '#ff8c00' }}>Raum</strong>:
        die Schatten kippen zur Seite, der <strong>Winkel der Weltlinie</strong> ändert sich,
        und die Eigenzeit τ verlangsamt sich gegenüber der Koordinatenzeit t.
        Das kleine Diagramm (oben links) zeigt: der weiße Pfeil liegt immer auf dem Kreis — die Gesamtgeschwindigkeit durch die Raumzeit bleibt stets gleich c.
      </div>

      {/* ── Footer ── */}
      <footer style={{
        marginTop: 30, marginBottom: 20,
        fontSize: 13, color: '#3d5068', textAlign: 'center', letterSpacing: 0.4,
      }}>
        Erstellt von{' '}
        <span style={{ color: '#607a99', fontWeight: 600 }}>Hamsa</span>
        {' & '}
        <span style={{ color: '#607a99', fontWeight: 600 }}>Julian</span>
        <span style={{ margin: '0 8px' }}>·</span>
        Spezielle Relativitätstheorie — Konstanz 2026
      </footer>
    </div>
  )
}
