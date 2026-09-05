import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type RevealProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  delay?: number
  y?: number
  once?: boolean
  onMount?: boolean
}

/** Fade + rise a block when it scrolls into view (or on mount). */
export function Reveal({ children, className, style, delay = 0, y = 26, once = true, onMount = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y },
        {
          opacity: 1, y: 0, duration: 1.0, delay, ease: 'power3.out',
          scrollTrigger: onMount ? undefined : { trigger: el, start: 'top 88%', once },
        },
      )
    })
    return () => ctx.revert()
  }, [delay, y, once, onMount])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}

type SplitWordsProps = {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span'
  trigger?: boolean
  delay?: number
  stagger?: number
  from?: number
}

/** Splits text into masked words, each rising with a springy skew-out. */
export function SplitWords({
  text, className, as = 'div', trigger = false, delay = 0.05, stagger = 0.05, from = 115,
}: SplitWordsProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const words = Array.from(root.querySelectorAll<HTMLElement>('.wrap-word > span'))
    const ctx = gsap.context(() => {
      gsap.fromTo(words, { yPercent: from, opacity: 0 }, {
        yPercent: 0, opacity: 1, ease: 'power4.out', duration: 0.9, stagger, delay,
        scrollTrigger: trigger
          ? { trigger: root, start: 'top 86%', once: true }
          : undefined,
      })
    })
    return () => ctx.revert()
  }, [trigger, delay, stagger, from])

  const words = text.split(' ')
  const Tag = as

  return (
    <Tag ref={ref as never} className={className}>
      {words.map((w, i) => (
        <span key={i} className="wrap-word">
          <span className="will-change-transform">{w}</span>
          {i < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  )
}

type CountUpProps = {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  duration?: number
}

/** Rolls a number up from 0 when scrolled into view. */
export function CountUp({ value, prefix = '', suffix = '', decimals = 0, className, duration = 1.6 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obj = { v: 0 }
    const fmt = (n: number) => prefix + n.toFixed(decimals) + suffix
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: value, duration, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: () => {
          if (el) el.textContent = fmt(obj.v)
        },
      })
    })
    return () => ctx.revert()
  }, [value, prefix, suffix, decimals, duration])

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>
}

type MagneticProps = {
  children: ReactNode
  className?: string
  strength?: number
}

/** Pulls its child toward the cursor, then springs it back on leave. */
export function Magnetic({ children, className, strength = 0.32 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      xTo(dx * strength)
      yTo(dy * strength)
    }
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
