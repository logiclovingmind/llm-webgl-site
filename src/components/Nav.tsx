import { useEffect, useState } from 'react'
import { Mark, Wordmark } from './brand'
import { Magnetic } from './ui'

const LINKS = [
  { href: '#systems', label: 'Systems' },
  { href: '#engine', label: 'Engine' },
  { href: '#telemetry', label: 'Telemetry' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [prog, setProg] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const p = max > 0 ? el.scrollTop / max : 0
      setProg(p)
      setScrolled(el.scrollTop > 12)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* scroll progress — live neon instrument line */}
      <div className="h-px w-full bg-line">
        <div
          className="h-full origin-left bg-cyan"
          style={{ transform: `scaleX(${prog})`, transition: 'transform 80ms linear', boxShadow: '0 0 8px rgba(0,224,255,0.8)' }}
        />
      </div>

      <div
        className={`transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? 'border-b border-line bg-void/70 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-3.5 md:px-10">
          <a href="#top" className="flex items-center gap-3" aria-label="Logic Loving Mind home">
            <Mark className="h-8 w-8 text-cyan" />
            <Wordmark className="hidden h-3.5 w-auto text-ink sm:block md:h-4" />
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase transition-colors hover:text-cyan"
              >
                {l.label}
              </a>
            ))}
          </div>

          <Magnetic strength={0.3}>
            <a
              href="#contact"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-cyan px-5 py-2.5 text-void"
              style={{ boxShadow: '0 0 24px rgba(0,224,255,0.35)' }}
            >
              <span className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase">Book a demo</span>
              <span className="h-1.5 w-1.5 rounded-full bg-magenta transition-transform duration-300 group-hover:scale-150" />
            </a>
          </Magnetic>
        </nav>
      </div>
    </header>
  )
}
