import { lazy, Suspense, useEffect, useState } from 'react'
import Photo from './Photo'
import { IMG } from '../lib/images'
import { Reveal, SplitWords } from './ui'

const Core3D = lazy(() => import('./Core3D'))

function jitter(min: number, max: number, dp = 0) {
  return (min + Math.random() * (max - min)).toFixed(dp)
}

function LiveCell({ label, min, max, suffix, dp = 0 }: {
  label: string
  min: number
  max: number
  suffix: string
  dp?: number
}) {
  const [val, setVal] = useState(() => jitter(min, max, dp))
  useEffect(() => {
    const id = setInterval(() => setVal(jitter(min, max, dp)), 1600)
    return () => clearInterval(id)
  }, [min, max, dp])
  return (
    <div className="flex flex-col gap-1.5 px-5 py-4 md:border-l md:border-line md:first:border-l-0">
      <span className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">{label}</span>
      <span className="font-mono text-xl tabular-nums text-ink">
        {val}
        <span className="text-cyan">{suffix}</span>
      </span>
    </div>
  )
}

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden">
      {/* 8K neon-graded backdrop */}
      <Photo src={IMG.hero} eager className="absolute inset-0 h-full w-full" alt="" />
      <div className="pointer-events-none absolute inset-0 bg-void/62" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-void via-void/70 to-transparent" />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 pt-32 pb-8 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pt-40">
        {/* headline */}
        <div>
          <Reveal onMount delay={0.1} y={16}>
            <p className="mb-7 inline-flex items-center gap-3 rounded-full border border-line bg-void/40 px-4 py-1.5 font-mono text-[11px] tracking-[0.24em] text-muted uppercase backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" style={{ boxShadow: '0 0 10px rgba(0,224,255,0.9)' }} />
              Intelligent systems for business
            </p>
          </Reveal>

          <h1 className="font-display text-[clamp(3rem,9vw,7.25rem)] leading-[0.94] font-semibold tracking-[-0.03em] text-ink">
            <SplitWords as="span" text="Intelligence," className="block" delay={0.25} stagger={0.055} />
            <SplitWords as="span" text="engineered." className="neon-text block" delay={0.45} stagger={0.055} />
          </h1>

          <Reveal onMount delay={0.75} y={22}>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">
              Logic Loving Mind designs systems that read your data, learn your
              operations, and act in real time — so every decision is yours, faster.
            </p>
          </Reveal>

          <Reveal onMount delay={0.9} y={22}>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <a
                href="#engine"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-cyan px-7 py-3.5 text-void"
                style={{ boxShadow: '0 0 32px rgba(0,224,255,0.4)' }}
              >
                <span className="font-mono text-[12px] font-medium tracking-[0.18em] uppercase">Run the engine</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
              <a
                href="#systems"
                className="font-mono text-[12px] tracking-[0.18em] text-ink uppercase underline decoration-magenta/60 underline-offset-8 transition-colors hover:text-cyan"
              >
                See the systems
              </a>
            </div>
          </Reveal>
        </div>

        {/* live core panel */}
        <Reveal onMount delay={0.5} y={40} className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-[440px]">
            <div className="glass grid-dot absolute inset-0" />
            {/* corner ticks */}
            <span className="absolute -top-px left-5 h-2 w-px bg-cyan" />
            <span className="absolute -top-px right-5 h-2 w-px bg-magenta" />
            <span className="absolute -bottom-px left-5 h-2 w-px bg-magenta" />
            <span className="absolute -bottom-px right-5 h-2 w-px bg-cyan" />

            <Suspense
              fallback={
                <div className="absolute inset-0 grid place-items-center">
                  <div className="spin-slow h-24 w-24 rounded-full border-2 border-line-strong border-t-cyan" />
                </div>
              }
            >
              <Core3D className="absolute inset-0" />
            </Suspense>

            <div className="absolute top-3 left-4 font-mono text-[10px] tracking-[0.22em] text-cyan uppercase">
              Core · active
            </div>
            <div className="absolute right-4 bottom-3 font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
              x·y·z — decision engine
            </div>
          </div>
        </Reveal>
      </div>

      {/* live readout strip */}
      <Reveal onMount delay={1.05} y={16}>
        <div className="glass relative mx-auto grid max-w-[1440px] grid-cols-2 gap-y-0 md:grid-cols-4">
          <LiveCell label="Decision latency" min={42} max={56} suffix="ms" />
          <LiveCell label="Agents live" min={11} max={13} suffix="" dp={0} />
          <LiveCell label="Data volume" min={2.3} max={2.6} suffix="TB/d" dp={1} />
          <LiveCell label="Uptime" min={99.97} max={99.99} suffix="%" dp={2} />
        </div>
      </Reveal>
    </section>
  )
}
