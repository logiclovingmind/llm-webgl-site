import { useEffect, useRef, useState } from 'react'
import { Reveal, SplitWords } from './ui'

const POOL: { tag: string; msg: string; ok?: boolean }[] = [
  { tag: 'ingest', msg: 'pipeline 14 — 2,381 events folded into graph' },
  { tag: 'model', msg: 'forecast refreshed · demand +6.2% next 48h' },
  { tag: 'decide', msg: 'policy check passed — margin guardrail within band', ok: true },
  { tag: 'deploy', msg: 'action executed · reorder 214 units @ A-12' },
  { tag: 'ingest', msg: 'schema drift detected — auto-unified 3 sources' },
  { tag: 'model', msg: 'anomaly: weekend staffing vs forecast gap' },
  { tag: 'decide', msg: 'risk score 0.04 — under threshold, cleared', ok: true },
  { tag: 'deploy', msg: 'invoice batch reconciled + posted' },
  { tag: 'ingest', msg: 'connector 09 latency 38ms · nominal' },
  { tag: 'model', msg: 'learning checkpoint saved · 12:04 UTC' },
]

const INITIAL: Row[] = [
  { id: 1, t: '09:58:12', tag: 'ingest', msg: 'pipeline 11 — 1,904 events folded into graph' },
  { id: 2, t: '09:58:13', tag: 'model', msg: 'forecast refreshed · demand +6.2% next 48h' },
  { id: 3, t: '09:58:15', tag: 'decide', msg: 'policy check passed — margin guardrail within band', ok: true },
  { id: 4, t: '09:58:16', tag: 'deploy', msg: 'action executed · reorder 214 units @ A-12' },
  { id: 5, t: '09:58:18', tag: 'ingest', msg: 'connector 09 latency 38ms · nominal' },
]

// start ids after INITIAL so streamed rows never collide with the seed rows
let seed = INITIAL.length

type Row = { id: number; t: string; tag: string; msg: string; ok?: boolean }

function stamp() {
  const d = new Date()
  return [String(d.getHours()).padStart(2, '0'), String(d.getMinutes()).padStart(2, '0'), String(d.getSeconds()).padStart(2, '0')].join(':')
}

function makeRow(): Row {
  const item = POOL[seed++ % POOL.length]
  return { id: seed, t: stamp(), ...item }
}

export default function Console() {
  const [rows, setRows] = useState<Row[]>(INITIAL)
  const [paused, setPaused] = useState(false)
  const hover = useRef(false)

  useEffect(() => {
    const id = window.setInterval(() => {
      if (hover.current) return
      setRows((prev) => [...prev.slice(-8), makeRow()])
    }, 1500)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section id="telemetry" className="border-y border-line bg-panel py-28 md:py-36">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <Reveal y={22}>
          <p className="mb-4 font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">Telemetry · live</p>
        </Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SplitWords
            trigger
            as="h2"
            text="Watch it work."
            className="font-display text-[clamp(2rem,5.5vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.02em] text-ink"
            stagger={0.05}
          />
          <Reveal y={16}>
            <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" style={{ boxShadow: '0 0 8px rgba(0,224,255,0.9)' }} />
              {paused ? 'paused' : 'streaming'}
            </span>
          </Reveal>
        </div>

        <Reveal y={26} className="mt-12">
          <div
            className="glass grid-dot relative overflow-hidden"
            onMouseEnter={() => { hover.current = true; setPaused(true) }}
            onMouseLeave={() => { hover.current = false; setPaused(false) }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">ops.console</span>
              <span className="font-mono text-[10px] tracking-[0.22em] text-cyan uppercase">tail -f</span>
            </div>

            <div className="max-h-[340px] min-h-[260px] overflow-hidden p-5 font-mono text-[13px] leading-[1.8] md:p-7">
              {rows.map((r) => (
                <div key={r.id} className="flex gap-3 whitespace-nowrap">
                  <span className="text-dim">{r.t}</span>
                  <span className={`w-14 shrink-0 tracking-[0.12em] uppercase ${r.ok ? 'text-cyan' : 'text-magenta'}`}>
                    {r.tag}
                  </span>
                  <span className="text-muted">{r.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
