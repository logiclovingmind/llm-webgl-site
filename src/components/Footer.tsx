import Photo from './Photo'
import { IMG } from '../lib/images'
import { Wordmark } from './brand'
import { Magnetic, Reveal, SplitWords } from './ui'

const EMAIL = 'hello@logiclovingmind.com'

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-void text-ink">
      <Photo src={IMG.footer} className="absolute inset-0 h-full w-full opacity-50" alt="" />
      <div className="pointer-events-none absolute inset-0 bg-void/75" />
      <div className="neon-line absolute inset-x-0 top-0" />

      <div className="relative mx-auto max-w-[1440px] px-5 pt-28 pb-10 md:px-10 md:pt-36">
        <Reveal y={20}>
          <p className="mb-5 font-mono text-[11px] tracking-[0.24em] text-cyan uppercase">Contact · deploy</p>
        </Reveal>

        <SplitWords
          trigger
          as="h2"
          text="Build your system."
          className="font-display text-[clamp(2.6rem,9vw,7rem)] leading-[0.98] font-semibold tracking-[-0.03em] text-ink"
          stagger={0.05}
        />

        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Magnetic strength={0.3}>
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-flex items-center gap-3 rounded-full bg-cyan px-7 py-3.5 font-mono text-[12px] font-medium tracking-[0.16em] text-void uppercase"
              style={{ boxShadow: '0 0 32px rgba(0,224,255,0.4)' }}
            >
              <span>Book a demo</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </Magnetic>
          <a
            href={`mailto:${EMAIL}`}
            className="font-mono text-[12px] tracking-[0.14em] text-muted underline decoration-line-strong underline-offset-8 transition-colors hover:text-cyan"
          >
            {EMAIL}
          </a>
        </div>

        {/* giant wordmark with neon glow */}
        <div
          className="mt-20 flex justify-center"
          style={{ filter: 'drop-shadow(0 0 18px rgba(0,224,255,0.3)) drop-shadow(0 0 60px rgba(255,43,214,0.2))' }}
        >
          <Wordmark className="w-[min(92vw,880px)] h-auto text-ink/25" />
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 md:flex-row">
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
            © 2026 Logic Loving Mind
          </span>
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
            intelligent systems for business
          </span>
        </div>
      </div>
    </footer>
  )
}
