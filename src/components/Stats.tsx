import { CountUp, Reveal } from './ui'

const STATS = [
  { label: 'median decision latency', value: 47, suffix: 'ms', decimals: 0 },
  { label: 'system uptime', value: 99.98, suffix: '%', decimals: 2 },
  { label: 'decisions per month', value: 4.9, suffix: 'M', decimals: 1 },
  { label: 'data connectors', value: 100, suffix: '+', decimals: 0 },
]

export default function Stats() {
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
      <div className="grid grid-cols-2 gap-y-12 gap-x-8 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} y={22} delay={i * 0.07}>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">{s.label}</span>
              <span className="neon-cyan font-display text-[clamp(2.4rem,6vw,4rem)] leading-none font-semibold tracking-[-0.02em]">
                <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals} />
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
