import { useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { burstSignal } from '../lib/signal'

const INK = '#e9f0ff'
const ACCENT = '#00e0ff'
const MAGENTA = '#ff2bd6'

function Core() {
  const group = useRef<THREE.Group>(null)     // parallax + bob
  const spin = useRef<THREE.Group>(null)      // constant rotation + burst scale
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const smooth = useRef(1)
  const burstStart = useRef(0)
  const lastBurst = useRef(0)

  const cloud = useMemo(() => {
    const n = 720
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const phi = i * 2.399963
      arr[i * 3] = Math.cos(phi) * r * 2.55
      arr[i * 3 + 1] = y * 2.55
      arr[i * 3 + 2] = Math.sin(phi) * r * 2.55
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    const now = performance.now()
    if (burstSignal.burst && burstSignal.burst !== lastBurst.current) {
      lastBurst.current = burstSignal.burst
      burstStart.current = now
    }
    let target = 1
    if (burstStart.current) {
      const pt = (now - burstStart.current) / 640
      if (pt < 1) target = 1 + 0.32 * Math.sin(pt * Math.PI)
      else burstStart.current = 0
    }
    smooth.current += (target - smooth.current) * Math.min(1, delta * 7)
    if (spin.current) spin.current.scale.setScalar(smooth.current)

    if (spin.current) {
      spin.current.rotation.y += delta * 0.42
      spin.current.rotation.x += delta * 0.13
    }
    if (ringA.current) ringA.current.rotation.z += delta * 0.5
    if (ringB.current) ringB.current.rotation.z -= delta * 0.36

    const t = state.clock.elapsedTime
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.6) * 0.14
      group.current.rotation.x += (state.pointer.y * 0.28 - group.current.rotation.x) * Math.min(1, delta * 3)
      group.current.rotation.y += (state.pointer.x * 0.42 - group.current.rotation.y) * Math.min(1, delta * 3)
    }
  })

  return (
    <group ref={group}>
      <group ref={spin}>
        {/* outer wireframe shell */}
        <mesh>
          <icosahedronGeometry args={[2.1, 1]} />
          <meshBasicMaterial color={INK} wireframe transparent opacity={0.32} />
        </mesh>
        {/* inner solid-ish core */}
        <mesh rotation={[0.4, 0.8, 0]}>
          <octahedronGeometry args={[1.05, 0]} />
          <meshBasicMaterial color={INK} wireframe transparent opacity={0.16} />
        </mesh>
        {/* cobalt point cloud */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[cloud, 3]} />
          </bufferGeometry>
          <pointsMaterial color={ACCENT} size={0.035} sizeAttenuation transparent opacity={0.85} />
        </points>
        {/* orbital rings */}
        <mesh ref={ringA} rotation={[Math.PI / 2.4, 0.2, 0]}>
          <torusGeometry args={[3.05, 0.008, 8, 140]} />
          <meshBasicMaterial color={INK} transparent opacity={0.4} />
        </mesh>
        <mesh ref={ringB} rotation={[Math.PI / 1.9, 0.7, 0]}>
          <torusGeometry args={[3.35, 0.006, 8, 140]} />
          <meshBasicMaterial color={MAGENTA} transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  )
}

function StaticRing() {
  // Non-WebGL fallback: a plain CSS ring so the hero still has a "core".
  return (
    <div className="spin-slow relative aspect-square w-[70%] rounded-full border border-line-strong">
      <div className="absolute inset-6 rounded-full border border-line" />
      <div className="absolute inset-0 rounded-full border-t-2 border-accent" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
    </div>
  )
}

export default function Core3D({ className }: { className?: string }) {
  let body: ReactNode
  if (typeof window !== 'undefined' && typeof window.WebGL2RenderingContext !== 'undefined') {
    body = (
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 7], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <Core />
      </Canvas>
    )
  } else {
    body = <StaticRing />
  }
  return (
    <div className={className} style={{ pointerEvents: 'none' }} aria-hidden="true">
      {body}
    </div>
  )
}
