import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Photo from './Photo'
import { IMG } from '../lib/images'
import { Reveal, SplitWords } from './ui'

gsap.registerPlugin(ScrollTrigger)

const SYSTEMS = [
  {
    idx: '01',
    word: 'Read',
    title: 'See your whole business at once.',
    copy: 'Every source — ERP, POS, spreadsheets, logs, sensors — folded into one live graph. No sync jobs, no stale exports, no blind spots.',
    items: ['100+ connectors', 'live stream ingestion', 'schema unification'],
    img: IMG.systems[0],
    alt: 'macro circuit board with cyan glow',
  },
  {
    idx: '02',
    word: 'Understand',
    title: 'Learn how your operations really run.',
    copy: 'The system builds a working model of your business — demand, cash, capacity, constraints — and keeps it honest against reality every day.',
    items: ['demand forecasting', 'anomaly detection', 'self-correcting models'],
    img: IMG.systems[1],
    alt: 'cyber security digital glow',
  },
  {
    idx: '03',
    word: 'Decide',
    title: 'Make every call with full context.',
    copy: 'Recommendations and autonomous decisions scored against your policies, your guardrails, your risk appetite. Every choice explainable in plain terms.',
    items: ['policy-scored decisions', 'human-in-the-loop review', 'full audit trail'],
    img: IMG.systems[2],
    alt: 'matrix code rain',
  },
  {
    idx: '04',
    word: 'Deploy',
    title: 'Act the moment it matters.',
    copy: 'From decision to action in milliseconds — reordering stock, repricing, rerouting, invoicing — wired straight into the tools your teams already use.',
    items: ['real-time actions', 'no-code workflow hooks', 'execution telemetry'],
    img: IMG.systems[3],
    alt: 'rows of server racks',
  },
]

export default function Systems() {
  const pinRef = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  const active = SYSTEMS[idx]

  useEffect(() => {
    const el = pinRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => '+=' + window.innerHeight * 3,
        pin: el,
        scrub: 0.4,
        anticipatePin: 1,
        onUpdate: (self) => {
          setIdx(Math.min(SYSTEMS.length - 1, Math.floor(self.progress * SYSTEMS.length)))
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section id="systems" className="relative">
      {/* section heading */}
      <div className="mx-auto max-w-[1440px] px-5 pt-28 pb-14 md:px-10">
        <Reveal y={22}>
          <p className="mb-4 font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">The stack · 04 systems</p>
        </Reveal>
        <SplitWords
          trigger
          as="h2"
          text="One mind, running your operations."
          className="max-w-3xl font-display text-[clamp(2rem,5.5vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.02em] text-ink"
          stagger={0.05}
        />
      </div>

      {/* pinned stepper */}
      <div ref={pinRef} className="relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.3]" />

        <div className="relative mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-24 md:px-10 lg:grid-cols-2 lg:items-center">
          {/* left — index + word + copy */}
          <div key={`a-${idx}`} className="step-in">
            <div className="mb-8 flex items-baseline gap-6">
              <span
                className="font-display text-[clamp(5rem,14vw,11rem)] leading-none font-bold tracking-[-0.04em]"
                style={{ color: 'transparent', WebkitTextStroke: '1px rgba(233,240,255,0.4)' }}
              >
                {active.idx}
              </span>
              <span className="neon-text font-wide text-[clamp(1.5rem,3.5vw,2.6rem)] font-medium tracking-wide">
                {active.word}
              </span>
            </div>

            <h3 className="max-w-md font-display text-[clamp(1.6rem,3.2vw,2.6rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-ink">
              {active.title}
            </h3>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{active.copy}</p>
          </div>

          {/* right — 8K photo + capability list */}
          <div key={`b-${idx}`} className="step-in lg:justify-self-end">
            <div className="relative w-full max-w-md">
              <div className="glass grid-dot relative aspect-[4/3] overflow-hidden">
                <Photo src={active.img} alt={active.alt} className="absolute inset-0 h-full w-full" />
                {/* corner ticks */}
                <span className="absolute -top-px left-4 h-2 w-px bg-cyan" />
                <span className="absolute -top-px right-4 h-2 w-px bg-magenta" />
                <span className="absolute -bottom-px left-4 h-2 w-px bg-magenta" />
                <span className="absolute -bottom-px right-4 h-2 w-px bg-cyan" />
                <div className="absolute bottom-3 left-4 font-mono text-[10px] tracking-[0.22em] text-paper/90 uppercase">
                  frame {active.idx} / 04
                </div>
              </div>

              <div className="glass mt-4">
                <div className="flex items-center justify-between border-b border-line px-5 py-3">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">Capabilities</span>
                  <span className="font-mono text-[10px] tracking-[0.22em] text-cyan uppercase">
                    {active.idx} / 04
                  </span>
                </div>
                <ul className="divide-y divide-line">
                  {active.items.map((item, i) => (
                    <li key={item} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="font-mono text-[10px] text-cyan">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-display text-base text-ink">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* progress rail */}
        <div className="absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col gap-2 md:right-8 lg:flex">
          {SYSTEMS.map((s, i) => (
            <span
              key={s.idx}
              className={`h-8 w-1.5 rounded-full transition-colors duration-300 ${
                i <= idx ? 'bg-cyan' : 'bg-line-strong'
              }`}
              style={i <= idx ? { boxShadow: '0 0 10px rgba(0,224,255,0.7)' } : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
