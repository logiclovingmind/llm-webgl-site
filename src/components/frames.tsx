import { useEffect, useRef, useState } from 'react'
import { scrollState } from '../three/scrollState'
import { Mark, Wordmark } from './brand'

/* ------------------------------------------------------------------ */
/* Hero — the ask-the-system demo                                      */
/* ------------------------------------------------------------------ */

type Phase = 'idle' | 'processing' | 'done'

type Output = {
  detected: string
  reads: string
  decides: string
  impact: string
}

function generate(q: string): Output {
  const s = q.toLowerCase()
  let reads = 'order flow, pricing, and ops data across 6 systems'
  let decides = 'rank the next best action and act inside your guardrails'
  let impact = '−42% handling time within 90 days'

  if (/(fraud|risk|chargeback|scam)/.test(s)) {
    reads = 'transactions, device signals, and account history in real time'
    decides = 'score every transaction and auto-hold only genuine anomalies'
    impact = '−61% fraud losses · 3× more cases per analyst'
  } else if (/(cost|spend|budget|procure)/.test(s)) {
    reads = 'purchase history, supplier pricing, and usage patterns'
    decides = 'route spend to the lowest-risk, lowest-cost option'
    impact = '−18% procurement cost with no headcount change'
  } else if (/(stock|inventory|supply|warehouse|forecast)/.test(s)) {
    reads = 'demand forecasts, lead times, and stock positions'
    decides = 'set reorder points and reroute inventory before shortages'
    impact = '−34% stockouts · −22% holding cost'
  } else if (/(support|customer|ticket|call)/.test(s)) {
    reads = 'ticket volume, sentiment, and agent availability'
    decides = 'auto-resolve the common cases, route the rest to the right human'
    impact = '−52% first-response time · +31% CSAT'
  } else if (/(slow|latency|queue|delay|time|bottleneck)/.test(s)) {
    reads = 'workflow timestamps and bottleneck queues'
    decides = 'reroute work to the fastest available path, in real time'
    impact = '−38% end-to-end processing time'
  }

  return { detected: q.trim(), reads, decides, impact }
}

function Stage({ name, on, ms }: { name: string; on: boolean; ms: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-2 last:mb-0">
      <span className={on ? 'text-emerald' : 'text-text/20'}>{on ? '✓' : '○'}</span>
      <span className={`uppercase tracking-widest ${on ? 'text-text/80' : 'text-text/30'}`}>{name}</span>
      {on && <span className="ml-auto text-text/35 tabular-nums">{ms}ms</span>}
    </div>
  )
}

function Row({ label, value, d = 0, cursor, accent }: {
  label: string
  value: string
  d?: number
  cursor?: boolean
  accent?: boolean
}) {
  return (
    <div className="fade-rise flex gap-3 mb-2 last:mb-0" style={{ animationDelay: `${d * 0.12}s` }}>
      <span className="text-text/35 shrink-0 uppercase tracking-widest w-20 text-left">{label}</span>
      <span className={accent ? 'text-flame' : 'text-text/85'}>
        {value}
        {cursor && <span className="caret-blink">▌</span>}
      </span>
    </div>
  )
}

export function HeroFrame() {
  const [value, setValue] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [ms, setMs] = useState(0)
  const [out, setOut] = useState<Output | null>(null)
  const [typed, setTyped] = useState('')
  const [burstN, setBurstN] = useState(0)
  const raf = useRef(0)
  const startRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  useEffect(() => {
    if (phase !== 'done' || !out) return
    let i = 0
    const id = setInterval(() => {
      i++
      setTyped(out.detected.slice(0, i))
      if (i >= out.detected.length) clearInterval(id)
    }, 14)
    return () => clearInterval(id)
  }, [phase, out])

  const run = () => {
    const q = value.trim()
    if (!q || phase !== 'idle') return
    setPhase('processing')
    setMs(0)
    setOut(null)
    setTyped('')
    startRef.current = performance.now()
    scrollState.burst = startRef.current
    setBurstN((n) => n + 1)

    const tick = () => {
      const elapsed = performance.now() - startRef.current
      if (elapsed >= 900) {
        setMs(900)
        setOut(generate(q))
        setPhase('done')
        return
      }
      setMs(elapsed)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  const reset = () => {
    setPhase('idle')
    setValue('')
    setOut(null)
    setTyped('')
    setMs(0)
    inputRef.current?.focus()
  }

  return (
    <div className="pointer-events-none max-w-3xl mx-auto">
      {burstN > 0 && <div key={burstN} className="burst-flash" />}

      <div className="flex justify-center mb-7 pointer-events-none">
        <Mark className="w-14 h-14 md:w-16 md:h-16 text-flame logo-float" />
      </div>

      <div className="font-sans text-[10px] md:text-xs tracking-[0.35em] text-flame/80 uppercase mb-5">
        Logic Loving Mind — intelligent systems for business
      </div>

      <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.92] text-bright">
        Give us a{' '}
        <em className="italic text-flame font-normal">problem.</em>
      </h1>

      <p className="mt-7 text-subtle text-base md:text-xl font-light tracking-wide">
        This page is a living demo. We build systems that read your data, learn your
        operations, and act in real time. Type a challenge below — and watch one think.
      </p>

      <div className="pointer-events-auto mt-9 mx-auto max-w-xl">
        {phase === 'idle' && (
          <div className="flex items-center gap-2 border border-white/12 rounded-lg bg-white/[0.03] px-4 py-3 focus-within:border-flame/60 focus-within:shadow-[0_0_28px_rgba(255,77,90,0.14)] transition-all">
            <span className="font-mono text-flame text-lg leading-none">›</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') run() }}
              placeholder="describe a business problem…"
              className="flex-1 bg-transparent outline-none font-mono text-sm text-text placeholder:text-text/30"
            />
            <button
              onClick={run}
              className="font-mono text-[10px] tracking-[0.3em] text-void font-semibold bg-flame px-4 py-2 rounded-md hover:brightness-110 transition"
            >
              RUN
            </button>
          </div>
        )}

        {phase === 'processing' && (
          <div className="border border-white/12 rounded-lg bg-white/[0.03] px-5 py-4 text-left font-mono text-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="tracking-[0.3em] text-text/60 uppercase">System thinking</span>
              <span className="text-gold tabular-nums">{Math.round(ms)}ms</span>
            </div>
            <Stage name="ingest" on ms={96} />
            <Stage name="understand" on={ms >= 340} ms={412} />
            <Stage name="decide" on={ms >= 620} ms={214} />
          </div>
        )}

        {phase === 'done' && out && (
          <div className="border border-flame/30 rounded-lg bg-white/[0.03] px-5 py-5 text-left font-mono text-xs md:text-sm shadow-[0_0_40px_rgba(255,77,90,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <span className="tracking-[0.3em] text-flame uppercase">System output</span>
              <span className="text-emerald">● live</span>
            </div>
            <Row label="detected" value={`“${typed}”`} cursor />
            <Row label="reads" value={out.reads} d={1} />
            <Row label="decides" value={out.decides} d={2} />
            <Row label="impact" value={out.impact} d={3} accent />
            <div className="mt-4 pt-3 border-t border-white/10 text-text/40">
              <span className="text-gold tabular-nums">900ms</span> to decide · deployable in ~6 weeks
            </div>
          </div>
        )}
      </div>

      {phase === 'done' && (
        <button
          onClick={reset}
          className="pointer-events-auto mt-6 font-sans text-[10px] tracking-[0.35em] uppercase text-text/40 hover:text-text/80 transition"
        >
          try another problem
        </button>
      )}

      <div className="mt-10 font-sans text-[10px] tracking-[0.4em] uppercase text-text/30">
        Finance · Logistics · Retail · Operations
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Capability plates — See / Understand / Decide / Deploy              */
/* ------------------------------------------------------------------ */

export function CapabilityFrame({ num, name, glyph, title, copy, telemetry }: {
  num: string
  name: string
  glyph: string
  title: string
  copy: string
  telemetry: [string, string]
}) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="w-10 md:w-14 h-px bg-white/12" />
        <span className="font-sans text-[10px] md:text-xs tracking-[0.35em] uppercase">
          <span className="text-flame">{num}</span>
          <span className="text-text/45"> · {name}</span>
        </span>
        <div className="w-10 md:w-14 h-px bg-white/12" />
      </div>

      <span
        className="block text-4xl md:text-5xl mb-8 text-flame"
        style={{ filter: 'drop-shadow(0 0 18px rgba(255,77,90,0.35))' }}
      >
        {glyph}
      </span>

      <h2 className="font-serif text-5xl md:text-6xl font-light tracking-tight leading-[0.95] text-bright mb-6">
        {title}
      </h2>

      <p className="text-subtle text-base md:text-lg font-light leading-relaxed">
        {copy}
      </p>

      <div className="mt-10 font-sans text-[10px] md:text-xs tracking-[0.25em] uppercase text-text/30">
        {telemetry.join(' · ')}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Proof — a live ops console                                          */
/* ------------------------------------------------------------------ */

const KINDS: Array<[string, string, string]> = [
  ['order #', 'auto-approved', '0.99'],
  ['route #', 'rerouted', '0.97'],
  ['claim #', '→ human review', '0.81'],
  ['quote #', 'priced', '0.95'],
  ['anomaly #', 'contained', '0.98'],
]

const stamp = () => new Date().toISOString().slice(11, 19)

function nextRow() {
  const [k, v, c] = KINDS[Math.floor(Math.random() * KINDS.length)]
  const id = 4000 + Math.floor(Math.random() * 900)
  const ms = 90 + Math.floor(Math.random() * 190)
  return `${stamp()} · ${k}${id} ${v} · ${ms}ms · ${c}`
}

const seedRows = Array.from({ length: 6 }, nextRow)

export function ProofFrame() {
  const [rows, setRows] = useState<string[]>(seedRows)
  const [dpm, setDpm] = useState(4821)
  const [p50, setP50] = useState(214)
  const [acc, setAcc] = useState(99.2)

  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) => [nextRow(), ...prev].slice(0, 9))
      setDpm((v) => v + Math.floor(Math.random() * 9 - 3))
      setP50((v) => Math.max(182, v + Math.floor(Math.random() * 6 - 3)))
      setAcc((v) => Math.min(99.9, +(v + (Math.random() * 0.2 - 0.1)).toFixed(1)))
    }, 1600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="max-w-3xl mx-auto text-left w-full">
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="w-10 md:w-14 h-px bg-white/12" />
        <span className="font-sans text-[10px] md:text-xs tracking-[0.35em] uppercase">
          <span className="text-flame">Live</span>
          <span className="text-text/45"> — a system we deployed</span>
        </span>
        <div className="w-10 md:w-14 h-px bg-white/12" />
      </div>

      <h2 className="font-serif text-5xl md:text-6xl font-light tracking-tight leading-[0.95] text-bright text-center mb-8">
        Watch it <em className="italic text-flame font-normal">run.</em>
      </h2>

      <div className="border border-white/12 rounded-xl bg-white/[0.03] overflow-hidden backdrop-blur-sm shadow-[0_0_60px_rgba(255,77,90,0.06)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-text/60">
            LLM ops console
          </span>
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-flame flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-flame animate-pulse" />
            live
          </span>
        </div>

        <div className="grid grid-cols-3 border-b border-white/10">
          {[
            { label: 'decisions / min', value: dpm.toLocaleString() },
            { label: 'p50 latency', value: `${p50}ms` },
            { label: 'accuracy', value: `${acc.toFixed(1)}%` },
          ].map((s) => (
            <div key={s.label} className="px-5 py-4 text-center">
              <div className="font-serif text-2xl md:text-3xl font-light text-bright tabular-nums">{s.value}</div>
              <div className="mt-1 font-sans text-[9px] tracking-[0.25em] uppercase text-text/40">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 font-mono text-[11px] md:text-xs leading-relaxed">
          {rows.map((r, i) => (
            <div key={r + i} className={`fade-rise truncate ${i === 0 ? 'text-text/90' : 'text-text/35'}`} style={{ animationDelay: `${i * 0.05}s` }}>
              {r}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center font-sans text-[10px] tracking-[0.3em] uppercase text-text/25">
        Live demo · metrics are illustrative
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* CTA + footer                                                        */
/* ------------------------------------------------------------------ */

export function CtaFrame() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="font-sans text-[10px] md:text-xs tracking-[0.35em] text-flame/80 uppercase mb-6">
        Get started
      </div>

      <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[0.95] text-bright mb-6">
        Give us your{' '}
        <em className="italic text-flame font-normal">hardest</em>
        <br />
        problem.
      </h2>

      <p className="text-subtle text-base md:text-lg font-light leading-relaxed mb-10 max-w-xl mx-auto">
        Tell us about your operations. We'll map what an intelligent system can do for them —
        and how fast it can be live. The demo you just ran is the seed of that conversation.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="mailto:hello@logiclovingmind.com"
          className="inline-block font-sans text-[11px] md:text-xs tracking-[0.3em] uppercase text-void font-semibold bg-flame px-7 py-3.5 rounded-md hover:brightness-110 transition"
        >
          Book a demo
        </a>
        <a
          href="mailto:hello@logiclovingmind.com"
          className="inline-block font-sans text-[11px] md:text-xs tracking-[0.3em] uppercase text-text/70 border border-white/15 px-7 py-3.5 rounded-md hover:border-white/30 hover:text-text transition"
        >
          hello@logiclovingmind.com
        </a>
      </div>

      <div className="mt-14 flex flex-col items-center gap-5">
        <Wordmark className="w-52 md:w-72 h-auto text-bright/70" />
        <div className="font-sans text-[10px] tracking-[0.3em] uppercase text-text/25">
          © 2026 Logic Loving Mind · built with logic, love, and mind
        </div>
      </div>
    </div>
  )
}
