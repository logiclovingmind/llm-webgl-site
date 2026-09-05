import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HeroFrame, CapabilityFrame, ProofFrame, CtaFrame } from './frames'
import { Mark } from './brand'

gsap.registerPlugin(ScrollTrigger)

type Frame = {
  id: string
  a: number
  b: number
  num: string
  node: React.ReactNode
}

const FRAMES: Frame[] = [
  { id: 'hero', a: 0.0, b: 0.18, num: '00', node: <HeroFrame /> },
  {
    id: 'see', a: 0.16, b: 0.32, num: '01',
    node: (
      <CapabilityFrame
        num="01" name="see" glyph="⌬"
        title="See everything at once."
        copy="Every system you run — databases, logs, APIs, spreadsheets, documents — stitched into one live model of the business. No more assembling reports by hand."
        telemetry={['sources connected · 6', 'streams normalized · 1.2k/s']}
      />
    ),
  },
  {
    id: 'understand', a: 0.30, b: 0.46, num: '02',
    node: (
      <CapabilityFrame
        num="02" name="understand" glyph="♡"
        title="Understand how you operate."
        copy="Models learn your constraints, goals, and trade-offs — not just your data. The system knows why an order matters, not only what it is."
        telemetry={['context depth · learned', 'drift watch · live']}
      />
    ),
  },
  {
    id: 'decide', a: 0.44, b: 0.60, num: '03',
    node: (
      <CapabilityFrame
        num="03" name="decide" glyph="∞"
        title="Decide at machine speed."
        copy="Every option weighed in milliseconds, inside your guardrails. The next best action is chosen and executed — auto-approved, rerouted, or flagged for a human."
        telemetry={['options weighed · 1.4k/s', 'decisions · auditable']}
      />
    ),
  },
  {
    id: 'deploy', a: 0.58, b: 0.74, num: '04',
    node: (
      <CapabilityFrame
        num="04" name="deploy" glyph="⊕"
        title="Deploy in weeks. Improve forever."
        copy="Integrated with your stack, monitored around the clock, retrained on new signal. Intelligence that compounds while you sleep."
        telemetry={['time to live · ~6 wks', 'uptime · 99.9%']}
      />
    ),
  },
  { id: 'proof', a: 0.72, b: 0.88, num: '05', node: <ProofFrame /> },
  { id: 'cta', a: 0.86, b: 1.0, num: '06', node: <CtaFrame /> },
]

export default function Narrative({ spacerRef }: {
  spacerRef: React.RefObject<HTMLDivElement | null>
}) {
  const refs = useRef<Record<string, HTMLDivElement | null>>({})
  const barRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    refs.current[id] = el
  }

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'none' } }).duration(1)

    for (const f of FRAMES) {
      const el = refs.current[f.id]
      if (!el) continue
      const fade = 0.05
      const hold = Math.max(f.b - f.a - fade * 2, 0.01)
      if (f.a === 0) {
        gsap.set(el, { autoAlpha: 1, y: 0 })
        if (hold > 0.02) tl.to(el, { autoAlpha: 1, duration: hold }, f.a)
        if (f.b < 1) {
          tl.to(el, { autoAlpha: 0, y: -30, duration: fade, ease: 'power2.in' }, f.b - fade)
        }
      } else {
        gsap.set(el, { autoAlpha: 0, y: 30 })
        tl.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: fade, ease: 'power2.out' }, f.a)
        if (hold > 0.02) tl.to(el, { autoAlpha: 1, duration: hold }, f.a + fade)
        if (f.b < 1) {
          tl.to(el, { autoAlpha: 0, y: -30, duration: fade, ease: 'power2.in' }, f.b - fade)
        }
      }
    }

    if (hintRef.current) {
      tl.to(hintRef.current, { opacity: 0, duration: 0.04, ease: 'power1.in' }, 0.06)
    }

    const st = ScrollTrigger.create({
      trigger: spacerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      animation: tl,
      onUpdate: (self) => {
        const p = self.progress
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
        if (counterRef.current) {
          let idx = 0
          for (let i = 0; i < FRAMES.length; i++) {
            if (p >= FRAMES[i].a + 0.02) idx = i
          }
          counterRef.current.textContent = `${FRAMES[idx].num} / 07`
        }
      },
    })

    return () => {
      st.kill()
      tl.kill()
    }
  }, [spacerRef])

  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
      {/* HUD — top-left brand */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-3">
        <Mark className="w-6 h-6 text-flame" />
        <span className="font-serif italic text-sm text-text/55 tracking-wide">
          Logic Loving Mind
        </span>
      </div>

      {/* HUD — top-right counter */}
      <div className="absolute top-7 right-6 md:top-8 md:right-8 font-mono text-[10px] tracking-[0.35em] text-text/35">
        <span ref={counterRef}>00 / 07</span>
      </div>

      {/* HUD — bottom-left scroll hint */}
      <div ref={hintRef} className="absolute bottom-7 left-6 md:bottom-8 md:left-8 flex items-center gap-3">
        <span className="w-px h-6 bg-gradient-to-b from-flame/0 via-flame/60 to-flame/0 scroll-pulse" />
        <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-text/35">
          scroll
        </span>
      </div>

      {/* HUD — bottom-center progress hairline */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 md:w-64 h-px bg-white/8 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full w-full origin-left bg-flame"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Frames */}
      {FRAMES.map((f) => (
        <div
          key={f.id}
          ref={setRef(f.id)}
          className="absolute inset-0 flex items-center justify-center px-6 text-center"
        >
          {f.node}
        </div>
      ))}
    </div>
  )
}
