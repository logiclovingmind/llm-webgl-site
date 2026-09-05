import { useEffect, useRef, useState } from 'react'
import Photo from './Photo'
import { IMG } from '../lib/images'
import { fireBurst } from '../lib/signal'
import { Reveal, SplitWords } from './ui'

const STAGES = ['analyze', 'model', 'decide'] as const

const ACTIONS = [
  'autonomous reorder placed — 214 units',
  'pricing adjusted across 38 skus',
  'inbound shipment rerouted to A-12',
  'invoicing run + reconciliation posted',
]
const DECISIONS = [
  'replenish to safety stock +18%',
  'hold — margin guardrail triggered',
  'escalate to ops review queue',
  'accelerate — confidence 0.94',
]

function pick(pool: string[], seed: number) {
  return pool[Math.abs(seed) % pool.length]
}

type Line = { k: string; v: string; accent?: boolean }

export default function Demo() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState<'idle' | 'processing' | 'done'>('idle')
  const [stage, setStage] = useState(0)
  const [lines, setLines] = useState<Line[]>([])
  const [burst, setBurst] = useState(0)

  const timers = useRef<number[]>([])

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => clear, [])

  const run = (raw: string) => {
    const q = raw.trim().replace(/\s+/g, ' ')
    if (!q || phase === 'processing') return
    clear()
    setQuery('')
    setPhase('processing')
    setStage(0)
    setLines([])
    setBurst(0)

    const seed = q.length * 7 + q.charCodeAt(0)
    const finalLat = 42 + (seed % 15)
    const action = pick(ACTIONS, seed)
    const decision = pick(DECISIONS, seed >> 2)

    STAGES.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStage(i + 1), 420 * (i + 1)))
    })
    timers.current.push(
      window.setTimeout(() => {
        setLines([
          { k: 'intent', v: q },
          { k: 'agent', v: action },
          { k: 'decision', v: decision, accent: true },
          { k: 'latency', v: `${finalLat}ms` },
          { k: 'status', v: 'deployed · audit logged' },
        ])
        setPhase('done')
        setBurst(Date.now())
        fireBurst()
      }, 420 * STAGES.length + 260),
    )
  }

  return (
    <section id="engine" className="relative overflow-hidden py-28 md:py-36">
      {/* faint 8K backdrop */}
      <Photo src={IMG.demo} className="absolute inset-0 h-full w-full opacity-40" alt="" />
      <div className="pointer-events-none absolute inset-0 bg-void/80" />
      <div className="grid-dot pointer-events-none absolute inset-0 opacity-[0.25]" />

      <div className="relative mx-auto max-w-[1200px] px-5 md:px-10">
        <Reveal y={22}>
          <p className="mb-4 font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">The engine · live demo</p>
        </Reveal>
        <SplitWords
          trigger
          as="h2"
          text="Ask it a business problem."
          className="max-w-3xl font-display text-[clamp(2rem,5.5vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.02em] text-ink"
          stagger={0.05}
        />

        <Reveal y={26} className="mt-12">
          <div className="glass relative overflow-hidden">
            {/* top bar */}
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan" style={{ boxShadow: '0 0 8px rgba(0,224,255,0.8)' }} />
                <span className="h-2.5 w-2.5 rounded-full bg-magenta" style={{ boxShadow: '0 0 8px rgba(255,43,214,0.8)' }} />
                <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
              </div>
              <span className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
                Engine // {phase === 'idle' ? 'idle' : phase === 'processing' ? 'thinking' : 'acting'}
              </span>
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-cyan uppercase">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" style={{ boxShadow: '0 0 8px rgba(0,224,255,0.9)' }} /> Live
              </span>
            </div>

            {/* body */}
            <div className="relative min-h-[300px] p-5 font-mono text-sm md:p-7">
              {/* burst ring on decision */}
              {burst > 0 && (
                <span key={burst} className="burst-ring pointer-events-none absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-magenta" />
              )}

              {/* input row */}
              <div className="flex items-center gap-3">
                <span className="text-cyan">$</span>
                <input
                  ref={inputRef}
                  value={query}
                  disabled={phase === 'processing'}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') run(query)
                  }}
                  placeholder="replenish stock before the weekend rush…"
                  autoFocus
                  spellCheck={false}
                  className="w-full flex-1 bg-transparent text-ink caret-cyan placeholder:text-muted/60 focus:outline-none disabled:opacity-60"
                />
                <span className="caret-blink text-cyan">▍</span>
              </div>

              {/* processing stages */}
              {(phase === 'processing' || (phase === 'done' && stage >= 1)) && (
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
                  {STAGES.map((s, i) => {
                    const doneStage = stage > i
                    const active = stage === i + 1
                    return (
                      <span
                        key={s}
                        className={`flex items-center gap-2 text-[12px] tracking-[0.16em] uppercase transition-colors ${
                          doneStage ? 'text-cyan' : active ? 'pulse-dot text-magenta' : 'text-dim'
                        }`}
                      >
                        <span>{doneStage ? '✓' : active ? '→' : '·'}</span>
                        {s}
                      </span>
                    )
                  })}
                  {phase === 'done' && <span className="text-[12px] tracking-[0.16em] text-muted uppercase">done</span>}
                </div>
              )}

              {/* output */}
              {lines.length > 0 && (
                <div className="mt-8 space-y-2 border-t border-line pt-6">
                  {lines.map((l, i) => (
                    <div key={l.k} className="step-in flex gap-4" style={{ animationDelay: `${i * 0.09}s` }}>
                      <span className="w-20 shrink-0 text-[12px] tracking-[0.14em] text-muted uppercase">{l.k}</span>
                      <span className={`break-words text-ink ${l.accent ? 'text-cyan' : ''}`}>{l.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal y={18} className="mt-6">
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted">
            Illustrative output — the site runs a live decision engine, not a demo script.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
