import { useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { scrollSignal } from '../lib/scroll'
import { MARK_PATH, WORDMARK_PATHS } from '../components/brand'

const CYAN = '#00e0ff'
const MAGENTA = '#ff2bd6'

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (t: number) => t * t * (3 - 2 * t)
const seg = (p: number, a: number, b: number) => smooth(clamp01((p - a) / (b - a)))

type V3 = [number, number, number]
const KEYS: { p: number; pos: V3; tgt: V3 }[] = [
  { p: 0.00, pos: [0, 1.15, 13.5], tgt: [0, 0.45, 0] },
  { p: 0.16, pos: [0, 0.75, 8.2], tgt: [0, 0.45, 0] },
  { p: 0.40, pos: [0, 0.55, 3.4], tgt: [0, 0.4, 0] },
  { p: 0.58, pos: [0, 0.62, 1.3], tgt: [0, 0.55, -1.8] },
  { p: 0.80, pos: [0, 0.7, -1.0], tgt: [0, 0.85, -3.6] },
  { p: 1.00, pos: [0, 0.95, -2.4], tgt: [0, 0.92, -3.9] },
]

function pathFor(p: number) {
  let i = 0
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const t = smooth(clamp01((p - a.p) / (b.p - a.p)))
  const lerp = (x: V3, y: V3): V3 => [x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]
  return { pos: lerp(a.pos, b.pos), tgt: lerp(a.tgt, b.tgt) }
}

function logoTexture() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 512
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 1024, 512)
  ctx.fillStyle = '#ffffff'
  const ms = 320 / 556
  ctx.save()
  ctx.translate(512 - (552 * ms) / 2, 42)
  ctx.scale(ms, ms)
  ctx.fill(new Path2D(MARK_PATH))
  ctx.restore()
  const ws = 780 / 1177
  ctx.save()
  ctx.translate((1024 - 1177 * ws) / 2, 446)
  ctx.scale(ws, ws)
  WORDMARK_PATHS.forEach((d) => ctx.fill(new Path2D(d)))
  ctx.restore()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

function Robot() {
  const leftRef = useRef<THREE.Group>(null)
  const rightRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const shellRef = useRef<THREE.Mesh>(null)
  const logoMat = useRef<THREE.MeshBasicMaterial>(null)
  const coreMat = useRef<THREE.MeshPhysicalMaterial>(null)
  const outerMat = useRef<THREE.PointsMaterial>(null)
  const innerMat = useRef<THREE.PointsMaterial>(null)

  const outerCloud = useMemo(() => {
    const n = 2600
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 2.6 + Math.random() * 2.2
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = Math.sin(ph) * Math.cos(th) * r
      arr[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * r + 0.3
      arr[i * 3 + 2] = Math.cos(ph) * r - 1.4
    }
    return arr
  }, [])

  const innerCloud = useMemo(() => {
    const n = 1300
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = Math.pow(Math.random(), 0.6) * 1.6
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = Math.sin(ph) * Math.cos(th) * r
      arr[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * r
      arr[i * 3 + 2] = Math.cos(ph) * r - 1.8
    }
    return arr
  }, [])

  const logo = useMemo(() => logoTexture(), [])
  const glow = useMemo(() => glowTexture(), [])

  useFrame((state, delta) => {
    const p = scrollSignal.progress
    const open = seg(p, 0.3, 0.55)
    const rot = open * 2.5
    if (leftRef.current) leftRef.current.rotation.y = -rot
    if (rightRef.current) rightRef.current.rotation.y = rot

    const t = state.clock.elapsedTime
    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + 0.12 * Math.sin(t * 1.6))
    }
    if (shellRef.current) {
      shellRef.current.rotation.y += delta * 0.7
      shellRef.current.rotation.x += delta * 0.3
      const s = seg(p, 0.45, 0.8)
      shellRef.current.scale.setScalar(0.6 + s * 0.8)
    }
    if (coreMat.current) coreMat.current.emissiveIntensity = 0.4 + seg(p, 0.42, 0.75) * 2.6
    if (logoMat.current) logoMat.current.opacity = seg(p, 0.8, 0.97)
    if (outerMat.current) outerMat.current.opacity = seg(p, 0.5, 0.8) * 0.9
    if (innerMat.current) innerMat.current.opacity = seg(p, 0.62, 0.85) * 0.95
  })

  return (
    <group>
      {/* shoulders + neck */}
      <mesh position={[0, -2.0, 0]}>
        <cylinderGeometry args={[1.05, 1.95, 1.5, 32]} />
        <meshPhysicalMaterial color="#10131a" metalness={0.95} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.4} envMapIntensity={1.1} />
      </mesh>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.24, 0.31, 0.62, 24]} />
        <meshPhysicalMaterial color="#141821" metalness={0.95} roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.2} envMapIntensity={1.2} />
      </mesh>

      {/* head shell — opens into two halves */}
      <group position={[0, 0.18, 0]}>
        {/* left half */}
        <group ref={leftRef}>
          <mesh position={[0, 0, 0]} scale={[1, 1.06, 0.9]}>
            <sphereGeometry args={[0.92, 40, 32, 0, Math.PI * 2, Math.PI, Math.PI]} />
            <meshPhysicalMaterial color="#1a1e27" metalness={1} roughness={0.16} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={1.4} side={THREE.DoubleSide} />
          </mesh>
          {/* eye strip */}
          <mesh position={[-0.34, 0.06, 0.82]}>
            <boxGeometry args={[0.5, 0.06, 0.05]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
          {/* forehead sensor */}
          <mesh position={[-0.26, 0.62, 0.74]}>
            <boxGeometry args={[0.4, 0.03, 0.05]} />
            <meshBasicMaterial color={MAGENTA} toneMapped={false} />
          </mesh>
          {/* ear cap */}
          <mesh position={[-0.98, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.2, 0.22, 24]} />
            <meshPhysicalMaterial color="#161a23" metalness={0.95} roughness={0.3} clearcoat={1} clearcoatRoughness={0.15} envMapIntensity={1.2} />
          </mesh>
        </group>

        {/* right half (mirror) */}
        <group ref={rightRef}>
          <mesh position={[0, 0, 0]} scale={[1, 1.06, 0.9]}>
            <sphereGeometry args={[0.92, 40, 32, 0, Math.PI * 2, 0, Math.PI]} />
            <meshPhysicalMaterial color="#1a1e27" metalness={1} roughness={0.16} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={1.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.34, 0.06, 0.82]}>
            <boxGeometry args={[0.5, 0.06, 0.05]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
          <mesh position={[0.26, 0.62, 0.74]}>
            <boxGeometry args={[0.4, 0.03, 0.05]} />
            <meshBasicMaterial color={MAGENTA} toneMapped={false} />
          </mesh>
          <mesh position={[0.98, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.2, 0.22, 24]} />
            <meshPhysicalMaterial color="#161a23" metalness={0.95} roughness={0.3} clearcoat={1} clearcoatRoughness={0.15} envMapIntensity={1.2} />
          </mesh>
        </group>

        {/* the mind core inside the head */}
        <mesh ref={coreRef} position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.46, 48, 48]} />
          <meshPhysicalMaterial
            ref={coreMat}
            color="#04222b"
            metalness={0.3}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.04}
            emissive={CYAN}
            emissiveIntensity={0.4}
            envMapIntensity={0.8}
          />
        </mesh>
        <mesh ref={shellRef} position={[0, -0.05, 0]}>
          <icosahedronGeometry args={[0.62, 1]} />
          <meshBasicMaterial color={MAGENTA} wireframe transparent opacity={0.55} toneMapped={false} />
        </mesh>
      </group>

      {/* mind particles */}
      <points position={[0, 0.3, -1.4]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[outerCloud, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={outerMat} color={CYAN} size={0.045} sizeAttenuation transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <points position={[0, 0.3, -1.6]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[innerCloud, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={innerMat} color={MAGENTA} size={0.05} sizeAttenuation transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* the logo deep in the mind */}
      <group position={[0, 0.9, -3.7]}>
        <sprite scale={[9, 9, 1]}>
          <spriteMaterial map={glow} color={CYAN} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </sprite>
        <mesh>
          <planeGeometry args={[3.3, 1.65]} />
          <meshBasicMaterial ref={logoMat} map={logo} transparent opacity={0} toneMapped={false} />
        </mesh>
      </group>

      {/* floor glow ring */}
      <mesh position={[0, -2.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.9, 3.02, 80]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <mesh position={[0, -2.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 48]} />
        <meshBasicMaterial color="#05070d" transparent opacity={0.92} toneMapped={false} />
      </mesh>
    </group>
  )
}

function CameraRig() {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3())
  const target = useRef(new THREE.Vector3())
  useFrame((state, delta) => {
    const p = scrollSignal.progress
    const { pos, tgt } = pathFor(p)
    // Frame-rate independent exponential smoothing keeps the dive liquid.
    const k = 1 - Math.exp(-18 * delta)
    const px = state.pointer.x * 0.45
    const py = state.pointer.y * 0.28
    camera.position.x += ((pos[0] + px) - camera.position.x) * k
    camera.position.y += ((pos[1] + py) - camera.position.y) * k
    camera.position.z += (pos[2] - camera.position.z) * k
    target.current.set(tgt[0] + px * 0.3, tgt[1] + py * 0.2, tgt[2])
    look.current.lerp(target.current, k)
    camera.lookAt(look.current)
  })
  return null
}

export default function MindScene({ className }: { className?: string }) {
  let body: ReactNode
  if (typeof window !== 'undefined' && typeof window.WebGL2RenderingContext !== 'undefined') {
    body = (
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.15, 13.5], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, scene }) => {
          const pmrem = new THREE.PMREMGenerator(gl)
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
          pmrem.dispose()
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 9, 8]} intensity={2.2} color="#bfe8ff" />
        <directionalLight position={[-7, -2, 6]} intensity={1.1} color="#ff8ef0" />
        <pointLight position={[0, 0.5, -2.5]} intensity={80} distance={16} color={CYAN} />
        <Robot />
        <CameraRig />
        <EffectComposer>
          <Bloom intensity={1.15} luminanceThreshold={0.12} mipmapBlur />
          <Vignette eskil={false} offset={0.22} darkness={0.82} />
        </EffectComposer>
      </Canvas>
    )
  } else {
    body = null
  }
  return (
    <div className={className} aria-hidden="true">
      {body}
    </div>
  )
}
