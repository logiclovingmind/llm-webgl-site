const WORDS = ['See', 'Understand', 'Decide', 'Deploy']

function Row() {
  return (
    <>
      {WORDS.map((w, i) => (
        <span key={w} className="flex items-center gap-8 pr-8">
          <span className="font-wide text-2xl font-medium tracking-wide text-ink/70 md:text-3xl">{w}</span>
          <span
            className={`h-2 w-2 rotate-45 ${i % 2 === 0 ? 'bg-cyan' : 'bg-magenta'}`}
            style={i % 2 === 0
              ? { boxShadow: '0 0 12px rgba(0,224,255,0.8)' }
              : { boxShadow: '0 0 12px rgba(255,43,214,0.8)' }}
          />
        </span>
      ))}
    </>
  )
}

export default function Marquee() {
  return (
    <section aria-hidden="true" className="relative overflow-hidden border-y border-line bg-panel py-5">
      <div className="marquee-track">
        <div className="flex items-center">
          <Row />
        </div>
        <div className="flex items-center" aria-hidden="true">
          <Row />
        </div>
      </div>
    </section>
  )
}
