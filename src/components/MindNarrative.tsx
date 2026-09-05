import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { scrollSignal } from '../lib/scroll'
import { Mark, Wordmark } from './brand'

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const seg = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const trap = (p: number, a: number, b: number, c: number, d: number) =>
  Math.min(seg(p, a, b), 1 - seg(p, c, d))

type Frame = { id: string; a: number; b: number; c: number; d: number }
const FRAMES: Frame[] = [
  { id: 'intro', a: 0.0, b: 0.03, c: 0.16, d: 0.21 },
  { id: 'read', a: 0.18, b: 0.23, c: 0.40, d: 0.45 },
  { id: 'understand', a: 0.42, b: 0.47, c: 0.60, d: 0.65 },
  { id: 'decide', a: 0.62, b: 0.67, c: 0.80, d: 0.85 },
  { id: 'deploy', a: 0.80, b: 0.85, c: 0.92, d: 0.96 },
  { id: 'core', a: 0.93, b: 0.98, c: 1.02, d: 1.03 },
]

const stageFor = (p: number) =>
  p < 0.2 ? 'DESCENT' : p < 0.45 ? 'READ' : p < 0.65 ? 'UNDERSTAND' : p < 0.85 ? 'DECIDE' : p < 0.95 ? 'DEPLOY' : 'CORE'

const Overline = ({ children }: { children: string }) => (
  <div className="flex items-center gap-3">
    <span className="h-px w-8 bg-cyan" style={{ boxShadow: '0 0 8px rgba(0,224,255,0.8)' }} />
    <span className="font-mono text-[10px] tracking-[0.34em] text-cyan/90 uppercase md:text-[11px]">{children}</span>
  </div>
)

export default function MindNarrative({ spacerRef }: { spacerRef: RefObject<HTMLDivElement | null> }) {
  const els = useRef<Record<string, HTMLDivElement | null>>({})
  const fillRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const stageRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    let prev = -1
    let last = 0
    let v = 0
    const tick = (t: number) => {
      const spacer = spacerRef.current
      if (spacer) {
        const rect = spacer.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const target = total > 0 ? clamp01(-rect.top / total) : 0
        // Exponential smoothing decouples the dive from discrete scroll-wheel
        // steps so both the HUD and the camera ride one liquid progress signal.
        const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016
        last = t
        v += (target - v) * (1 - Math.exp(-9 * dt))
        const p = v
        scrollSignal.progress = p

        if (Math.abs(p - prev) > 0.0001) {
          prev = p
          for (const f of FRAMES) {
            const node = els.current[f.id]
            if (!node) continue
            const o = trap(p, f.a, f.b, f.c, f.d)
            node.style.opacity = String(o)
            node.style.transform = `translateY(${(1 - o) * 34}px)`
          }
          if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`
          if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
          if (stageRef.current) stageRef.current.textContent = stageFor(p)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [spacerRef])

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none" aria-label="Logic Loving Mind">
      {/* top bar */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 md:p-7">
        <div className="flex items-center gap-3">
          <Mark className="h-8 w-8 text-cyan" />
          <Wordmark className="hidden h-3.5 w-auto text-ink/90 sm:block" />
        </div>
        <div className="glass flex items-center gap-3 rounded-full px-4 py-2 font-mono text-[10px] tracking-[0.24em] text-muted uppercase md:text-[11px]">
          <span ref={stageRef} className="text-cyan">DESCENT</span>
          <span className="h-3 w-px bg-line-strong" />
          <span ref={pctRef} className="tabular-nums text-ink/80">000</span>
          <span className="text-cyan">%</span>
        </div>
      </div>

      {/* right progress rail */}
      <div className="absolute top-1/2 right-5 h-36 w-px -translate-y-1/2 bg-line md:right-8">
        <div
          ref={fillRef}
          className="h-full w-px origin-top bg-cyan"
          style={{ boxShadow: '0 0 8px rgba(0,224,255,0.9)' }}
        />
      </div>

      {/* narrative frames */}
      <div className="absolute inset-0">
        {/* intro */}
        <div ref={(n) => { els.current.intro = n }} className="step-frame absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-[clamp(3rem,13vw,9rem)] font-semibold leading-[0.95] tracking-tight text-ink" style={{ textShadow: '0 0 40px rgba(0,224,255,0.25)' }}>
            One mind.
          </h1>
          <div className="mt-16 flex flex-col items-center gap-3" aria-hidden="true">
            <span className="font-mono text-[9px] tracking-[0.4em] text-dim uppercase">Scroll</span>
            <span className="relative block h-10 w-px overflow-hidden bg-line">
              <span className="scroll-drip absolute inset-x-0 top-0 h-full w-px bg-cyan" />
            </span>
          </div>
        </div>

        {/* read */}
        <div ref={(n) => { els.current.read = n }} className="step-frame absolute inset-x-0 bottom-[10vh] px-6 opacity-0 md:px-16" style={{ opacity: 0 }}>
          <Overline>01 · Read</Overline>
          <h2 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-tight text-ink md:text-7xl" style={{ textShadow: '0 0 30px rgba(0,224,255,0.2)' }}>
            Perceives <span className="neon-cyan">your world.</span>
          </h2>
        </div>

        {/* understand */}
        <div ref={(n) => { els.current.understand = n }} className="step-frame absolute inset-x-0 bottom-[10vh] px-6 opacity-0 md:px-16" style={{ opacity: 0 }}>
          <Overline>02 · Understand</Overline>
          <h2 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-tight text-ink md:text-7xl" style={{ textShadow: '0 0 30px rgba(0,224,255,0.2)' }}>
            Builds the <span className="neon-cyan">model.</span>
          </h2>
        </div>

        {/* decide */}
        <div ref={(n) => { els.current.decide = n }} className="step-frame absolute inset-x-0 bottom-[10vh] px-6 opacity-0 md:px-16" style={{ opacity: 0 }}>
          <Overline>03 · Decide</Overline>
          <h2 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-tight text-ink md:text-7xl" style={{ textShadow: '0 0 30px rgba(0,224,255,0.2)' }}>
            Reasons it <span className="neon-cyan">through.</span>
          </h2>
        </div>

        {/* deploy */}
        <div ref={(n) => { els.current.deploy = n }} className="step-frame absolute inset-x-0 bottom-[10vh] px-6 opacity-0 md:px-16" style={{ opacity: 0 }}>
          <Overline>04 · Deploy</Overline>
          <h2 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-tight text-ink md:text-7xl" style={{ textShadow: '0 0 30px rgba(0,224,255,0.2)' }}>
            Acts with <span className="neon-cyan">certainty.</span>
          </h2>
        </div>

        {/* core / logo reveal */}
        <div ref={(n) => { els.current.core = n }} className="step-frame absolute inset-0 flex flex-col items-center justify-end px-6 pb-[12vh] text-center opacity-0" style={{ opacity: 0 }}>
          <Overline>The mind&rsquo;s core</Overline>
          <h2 className="neon-text mt-6 font-display text-[clamp(2.4rem,8vw,5.5rem)] font-semibold leading-[0.98] tracking-tight">
            Logic, loving, alive.
          </h2>
          <div className="pointer-events-auto mt-12 flex flex-col items-center gap-4">
            <a
              href="mailto:hello@logiclovingmind.com"
              className="group inline-flex items-center gap-3 rounded-full bg-cyan px-8 py-3.5 font-mono text-xs font-medium tracking-[0.2em] text-void uppercase"
              style={{ boxShadow: '0 0 32px rgba(0,224,255,0.45)' }}
            >
              Book a demo
              <span className="h-1.5 w-1.5 rounded-full bg-magenta transition-transform duration-300 group-hover:scale-150" />
            </a>
            <span className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase">hello@logiclovingmind.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}
