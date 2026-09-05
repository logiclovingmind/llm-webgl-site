import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing'
import { rayMarchVertex, rayMarchFragment } from './rayMarch'
import { scrollState } from './scrollState'

const LOGIC = new THREE.Color('#00d4ff')
const LOVE = new THREE.Color('#ff3366')
const MIND = new THREE.Color('#aa66ff')
const GOLD = new THREE.Color('#ffaa00')

const CAM_Z_PER_PROGRESS = 160
const WORLD_LENGTH = 175

function makeBackgroundMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: rayMarchVertex,
    fragmentShader: rayMarchFragment,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uCamPos: { value: new THREE.Vector3(0, 2.3, 0) },
      uCamRight: { value: new THREE.Vector3(1, 0, 0) },
      uCamUp: { value: new THREE.Vector3(0, 1, 0) },
      uCamForward: { value: new THREE.Vector3(0, 0, 1) },
      uFovTan: { value: Math.tan((50 / 2) * (Math.PI / 180)) },
      uAspect: { value: 1 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    depthTest: false,
    depthWrite: false,
  })
}

// Huge plane that raymarches the entire world; kept far ahead of the camera.
function BackgroundQuad({ mat, planeRef }: {
  mat: THREE.ShaderMaterial
  planeRef: React.RefObject<THREE.Mesh | null>
}) {
  return (
    <mesh
      ref={planeRef}
      material={mat}
      position={[0, 0, -500]}
      renderOrder={-2}
      frustumCulled={false}
    >
      <planeGeometry args={[1400, 1400]} />
    </mesh>
  )
}

// Drives the camera along the world and feeds the raymarch uniforms.
function CameraRig({ mat, planeRef }: {
  mat: THREE.ShaderMaterial
  planeRef: React.RefObject<THREE.Mesh | null>
}) {
  const { camera, pointer } = useThree()
  const look = useRef(new THREE.Vector3())

  useFrame((state) => {
    const p = scrollState.progress
    const z = p * CAM_Z_PER_PROGRESS

    const burstAge = scrollState.burst > 0 ? state.clock.elapsedTime - scrollState.burst / 1000 : 999
    const burstLift = burstAge < 1.2 ? Math.sin((burstAge / 1.2) * Math.PI) * 0.55 : 0
    const targetY = 2.3 + Math.sin(p * Math.PI * 2) * 0.7 + pointer.y * 1.2 + burstLift
    camera.position.x += (pointer.x * 1.7 - camera.position.x) * 0.04
    camera.position.y += (targetY - camera.position.y) * 0.04
    camera.position.z += (z - camera.position.z) * 0.08
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -4, 4)

    look.current.set(pointer.x * 2.4, 1.2 + pointer.y * 0.9, z + 14)
    camera.lookAt(look.current)
    camera.updateMatrixWorld(true)

    const cam = camera as THREE.PerspectiveCamera
    const u = mat.uniforms
    const m = camera.matrixWorld.elements
    u.uCamPos.value.set(camera.position.x, camera.position.y, camera.position.z)
    u.uCamRight.value.set(m[0], m[1], m[2])
    u.uCamUp.value.set(m[4], m[5], m[6])
    u.uCamForward.value.set(-m[8], -m[9], -m[10])
    u.uFovTan.value = Math.tan((cam.fov / 2) * (Math.PI / 180))
    u.uAspect.value = cam.aspect
    u.uTime.value = state.clock.elapsedTime
    u.uProgress.value = p
    u.uMouse.value.set(pointer.x, pointer.y)

    if (planeRef.current) {
      planeRef.current.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z + 420,
      )
    }
  })

  return null
}

// Cosmic dust that follows the camera so it never runs out.
function SkyDust() {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (group.current) group.current.position.copy(state.camera.position)
  })
  return (
    <group ref={group}>
      <Stars radius={170} depth={50} count={2600} factor={5} saturation={0} fade speed={0.6} />
    </group>
  )
}

// Additive particle flow spread along the entire flight path.
function ParticleFlow() {
  const ref = useRef<THREE.Points>(null)
  const { positions, colors } = useMemo(() => {
    const n = 1300
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const palette = [LOGIC, LOVE, MIND, GOLD]
    const tmp = new THREE.Color()
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = Math.random() * 7 - 1.5
      pos[i * 3 + 2] = Math.random() * WORLD_LENGTH
      tmp.copy(palette[Math.floor(Math.random() * palette.length)])
      const d = 0.35 + Math.random() * 0.6
      col[i * 3] = tmp.r * d
      col[i * 3 + 1] = tmp.g * d
      col[i * 3 + 2] = tmp.b * d
    }
    return { positions: pos, colors: col }
  }, [])

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02
  })

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Real 3D geometry near the camera for strong parallax.
function FloatingShards() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = 60
  const dummy = useRef(new THREE.Object3D())

  const geo = useMemo(() => new THREE.OctahedronGeometry(1, 0), [])
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 18,
        y: Math.random() * 6 - 1.5,
        z: Math.random() * WORLD_LENGTH,
        s: 0.08 + Math.random() * 0.22,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        spd: 0.2 + Math.random() * 0.5,
      })),
    [],
  )

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const palette = [LOGIC, LOVE, MIND, GOLD]
    const tmp = new THREE.Color()
    for (let i = 0; i < count; i++) {
      tmp.copy(palette[i % palette.length]).multiplyScalar(0.6 + Math.random() * 0.4)
      arr[i * 3] = tmp.r
      arr[i * 3 + 1] = tmp.g
      arr[i * 3 + 2] = tmp.b
    }
    return arr
  }, [])

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    const burstAge = scrollState.burst > 0 ? t - scrollState.burst / 1000 : 999
    const pulse = burstAge < 1.2 ? 1 + Math.sin((burstAge / 1.2) * Math.PI) * 0.9 : 1
    for (let i = 0; i < count; i++) {
      const d = data[i]
      const obj = dummy.current
      obj.position.set(d.x, d.y + Math.sin(t * 0.6 + i) * 0.6, d.z)
      obj.rotation.set(d.rx + t * d.spd, d.ry + t * d.spd * 0.7, 0)
      obj.scale.setScalar(d.s * pulse)
      obj.updateMatrix()
      mesh.setMatrixAt(i, obj.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshBasicMaterial
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
      <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
    </instancedMesh>
  )
}

export default function Scene({ onReady }: { onReady?: () => void }) {
  const planeRef = useRef<THREE.Mesh | null>(null)
  const mat = useMemo(() => makeBackgroundMaterial(), [])

  return (
    <Canvas
      dpr={[0.8, 1.2]}
      gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 900, position: [0, 2.3, 0] }}
      onCreated={() => onReady?.()}
    >
      <color attach="background" args={['#07070a']} />
      <BackgroundQuad mat={mat} planeRef={planeRef} />
      <CameraRig mat={mat} planeRef={planeRef} />
      <SkyDust />
      <ParticleFlow />
      <FloatingShards />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.45} luminanceSmoothing={0.25} radius={0.7} />
        <ChromaticAberration offset={new THREE.Vector2(0.0012, 0.0008)} />
        <Vignette eskil={false} offset={0.22} darkness={0.9} />
        <Noise opacity={0.03} />
      </EffectComposer>
    </Canvas>
  )
}
