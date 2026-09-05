import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { WORDMARK_PATHS, WORDMARK_VIEWBOX } from './brand'

const MIN_MS = 2600
const HARD_MS = 6500

const CAPTIONS = [
  'igniting the core',
  'weaving the neural fabric',
  'calibrating perception',
  'awakening the mind',
]

function preload(url: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = url
  })
}

export default function Loader({ images, onFinish }: {
  images: string[]
  onFinish: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const botRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const wmRef = useRef<SVGSVGElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const capRef = useRef<HTMLSpanElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)

  const rafRef = useRef(0)
  const ready = useRef(false)
  const done = useRef(false)
  const mountRef = useRef(performance.now())

  const exit = () => {
    if (done.current) return
    done.current = true
    cancelAnimationFrame(rafRef.current)
    if (barRef.current) barRef.current.style.width = '100%'
    if (pctRef.current) pctRef.current.textContent = '100'

    gsap.timeline({ onComplete: onFinish })
      .to(contentRef.current, { opacity: 0, scale: 0.96, y: -16, duration: 0.5, ease: 'power2.in' }, 0)
      .to(topRef.current, { yPercent: -100, duration: 0.95, ease: 'power4.inOut' }, 0.14)
      .to(botRef.current, { yPercent: 100, duration: 0.95, ease: 'power4.inOut' }, 0.14)
  }

  useEffect(() => {
    const paths = wmRef.current ? wmRef.current.querySelectorAll('path') : []
    if (paths.length) {
      gsap.fromTo(paths, { opacity: 0, y: 30, filter: 'blur(14px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out', stagger: 0.05, delay: 0.1 })
    }

    const proxy = { v: 0 }
    gsap.to(proxy, {
      v: 100, duration: MIN_MS / 1000, ease: 'none', delay: 0.4,
      onUpdate: () => {
        if (barRef.current) barRef.current.style.width = `${proxy.v}%`
        if (pctRef.current) pctRef.current.textContent = String(Math.round(proxy.v)).padStart(2, '0')
      },
    })

    let capIdx = 0
    if (capRef.current) capRef.current.textContent = CAPTIONS[0]
    const capTimer = setInterval(() => {
      capIdx = (capIdx + 1) % CAPTIONS.length
      if (capRef.current) {
        gsap.fromTo(capRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, onStart: () => {
          if (capRef.current) capRef.current.textContent = CAPTIONS[capIdx]
        } })
      }
    }, 800)

    let m = true
    Promise.all([
      document.fonts?.load('600 64px "Space Grotesk"').catch(() => {}) ?? Promise.resolve(),
      document.fonts?.load('500 64px "Unbounded"').catch(() => {}) ?? Promise.resolve(),
      document.fonts?.load('400 64px "JetBrains Mono"').catch(() => {}) ?? Promise.resolve(),
      ...images.map(preload),
    ]).then(() => { if (m) ready.current = true })

    return () => {
      clearInterval(capTimer)
      gsap.killTweensOf(proxy)
      gsap.killTweensOf(paths)
      m = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [images])

  // Wait for assets + minimum dwell, then lift the curtain.
  useEffect(() => {
    let alive = true
    const check = () => {
      if (!alive || done.current) return
      const elapsed = performance.now() - mountRef.current
      // Hard deadline: never trap the page if font/image preloads stall.
      if (elapsed >= HARD_MS) ready.current = true
      const timeOk = elapsed >= MIN_MS
      if (timeOk && ready.current) exit()
      else rafRef.current = requestAnimationFrame(check)
    }
    rafRef.current = requestAnimationFrame(check)
    // Backup deadline on a timer: fires even under virtual time where the
    // performance clock stalls, so the curtain can never trap the page.
    const hard = setTimeout(() => {
      ready.current = true
      exit()
    }, HARD_MS)
    return () => {
      alive = false
      clearTimeout(hard)
    }
  }, [])

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 overflow-hidden bg-void" aria-hidden="true">
      {/* neon hairline seams */}
      <div className="neon-line absolute inset-x-0 top-1/2 opacity-30" />

      {/* curtain panels */}
      <div ref={topRef} className="absolute inset-x-0 top-0 h-1/2 bg-void border-b border-line" />
      <div ref={botRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-void border-t border-line" />

      {/* stage — wordmark and progress bar share one width so the bar tracks the lockup */}
      <div ref={contentRef} className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <svg
          ref={wmRef}
          viewBox={WORDMARK_VIEWBOX}
          className="h-auto w-[min(84vw,640px)] text-ink"
          fill="currentColor"
          role="img"
          aria-label="Logic Loving Mind"
          style={{ filter: 'drop-shadow(0 0 22px rgba(0,224,255,0.4)) drop-shadow(0 0 64px rgba(255,43,214,0.25))' }}
        >
          {WORDMARK_PATHS.map((d, i) => (
            <path key={i} fill="currentColor" d={d} />
          ))}
        </svg>

        <div className="mt-10 w-[min(84vw,640px)]">
          <div className="h-px overflow-hidden bg-line">
            <div
              ref={barRef}
              className="h-full"
              style={{ width: 0, background: 'linear-gradient(90deg,#00e0ff,#ff2bd6)' }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.3em] text-muted uppercase">
            <span ref={capRef} className="text-cyan/80">{CAPTIONS[0]}</span>
            <span ref={pctRef} className="tabular-nums text-ink/60">00</span>
          </div>
        </div>
      </div>
    </div>
  )
}
