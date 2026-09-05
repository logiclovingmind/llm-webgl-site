import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.documentElement.classList.add('has-cursor')

    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    // half-sizes baked in since inline transforms override the -50% utility classes
    dot.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' })
    const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' })
    rx(tx - 18); ry(ty - 18)

    const onMove = (e: MouseEvent) => {
      tx = e.clientX
      ty = e.clientY
      dot.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`
      rx(tx - 18); ry(ty - 18)
    }
    const onOver = (e: MouseEvent) => {
      const hit = (e.target as HTMLElement).closest?.('a, button, [data-hover], input')
      gsap.to(ring, { scale: hit ? 1.9 : 1, borderColor: hit ? '#00e0ff' : 'rgba(233,240,255,0.35)', duration: 0.35 })
    }
    const onLeaveWin = () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 })
    const onEnterWin = () => gsap.to([dot, ring], { opacity: 1, duration: 0.2 })

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseleave', onLeaveWin)
    document.addEventListener('mouseenter', onEnterWin)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', onLeaveWin)
      document.removeEventListener('mouseenter', onEnterWin)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="pointer-events-none fixed top-0 left-0 z-[60] hidden h-1.5 w-1.5 rounded-full bg-accent [html.has-cursor_&]:block" />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[60] hidden h-9 w-9 rounded-full border border-ink/35 [html.has-cursor_&]:block"
      />
    </>
  )
}
