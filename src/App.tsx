import { useEffect, useRef, useState } from 'react'
import MindScene from './three/MindScene'
import MindNarrative from './components/MindNarrative'
import Cursor from './components/Cursor'
import Loader from './components/Loader'
import { IMG } from './lib/images'

export default function App() {
  const [booted, setBooted] = useState(false)
  const spacerRef = useRef<HTMLDivElement>(null)
  const [webgl] = useState(
    () => typeof window !== 'undefined' && typeof window.WebGL2RenderingContext !== 'undefined',
  )

  // Lock scroll behind the cinematic boot, so the dive starts on its own.
  useEffect(() => {
    document.body.style.overflow = booted ? '' : 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [booted])

  return (
    <div className="relative bg-void text-ink antialiased">
      <Cursor />

      {/* the 3D world */}
      <div className="fixed inset-0 z-0">
        {webgl ? <MindScene className="h-full w-full" /> : (
          <div className="photo absolute inset-0">
            <img src={IMG.hero} alt="" />
          </div>
        )}
      </div>

      {/* scroll-synced HUD */}
      <MindNarrative spacerRef={spacerRef} />

      {/* the scroll runway that drives the dive */}
      <div ref={spacerRef} style={{ height: '720vh' }} aria-hidden="true" />

      <div className="grain" aria-hidden="true" />
      {!booted && <Loader images={webgl ? [] : [IMG.hero]} onFinish={() => setBooted(true)} />}
    </div>
  )
}
