import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface DesertSceneProps {
  phase: 'intro' | 'naming' | 'playing'
  isPaused: boolean
  moveVector: { x: number; y: number }
  lookDelta: { x: number; y: number }
  onYawChange: (yaw: number) => void
  onIntroComplete: () => void
}

const CHUNK_SIZE = 60
const CHUNK_SEGMENTS = 20
const VIEW_DISTANCE = 2

const getTerrainHeight = (x: number, z: number): number => {
  const dist = Math.sqrt(x * x + z * z)
  const gentle = Math.sin(x * 0.025) * 0.8 + Math.cos(z * 0.03) * 0.7
  const distant = Math.max(0, dist - 50) * 0.1 * Math.sin(x * 0.04 + z * 0.02)
  return gentle + distant
}

export const DesertScene: React.FC<DesertSceneProps> = ({
  phase,
  isPaused,
  moveVector,
  lookDelta,
  onYawChange,
  onIntroComplete,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const introStartTimeRef = useRef<number | null>(null)
  const isIntroCompleteRef = useRef(false)

  const moveRef = useRef(moveVector)
  moveRef.current = moveVector

  const lookRef = useRef(lookDelta)
  lookRef.current = lookDelta

  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const isPausedRef = useRef(isPaused)
  isPausedRef.current = isPaused

  const yawRef = useRef(0)
  const pitchRef = useRef(0)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const skyColor = new THREE.Color(0xd29d5b)
    const scene = new THREE.Scene()
    scene.background = skyColor
    scene.fog = new THREE.Fog(0xd29d5b, 35, 120)

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      250,
    )
    camera.position.set(0, 0.25, 0)
    camera.rotation.order = 'YXZ'

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const hemiLight = new THREE.HemisphereLight(0xfff0d0, 0x966028, 0.9)
    scene.add(hemiLight)

    const sun = new THREE.DirectionalLight(0xfff5dd, 1.3)
    sun.position.set(60, 50, -40)
    scene.add(sun)

    const texLoader = new THREE.TextureLoader()
    const sandTex = texLoader.load('/sand.png')
    sandTex.wrapS = THREE.RepeatWrapping
    sandTex.wrapT = THREE.RepeatWrapping
    sandTex.repeat.set(8, 8)

    const terrainMaterial = new THREE.MeshStandardMaterial({
      map: sandTex,
      color: 0xc89650,
      roughness: 0.92,
      metalness: 0.02,
    })

    const chunks = new Map<string, THREE.Mesh>()

    const createChunk = (cx: number, cz: number) => {
      const geo = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SEGMENTS, CHUNK_SEGMENTS)
      geo.rotateX(-Math.PI / 2)

      const pos = geo.attributes.position
      const originX = cx * CHUNK_SIZE
      const originZ = cz * CHUNK_SIZE

      for (let i = 0; i < pos.count; i++) {
        const localX = pos.getX(i)
        const localZ = pos.getZ(i)
        const worldX = originX + localX
        const worldZ = originZ + localZ
        pos.setY(i, getTerrainHeight(worldX, worldZ))
      }
      geo.computeVertexNormals()

      const mesh = new THREE.Mesh(geo, terrainMaterial)
      mesh.position.set(originX, 0, originZ)
      scene.add(mesh)
      return mesh
    }

    const updateChunks = (px: number, pz: number) => {
      const currentChunkX = Math.floor((px + CHUNK_SIZE / 2) / CHUNK_SIZE)
      const currentChunkZ = Math.floor((pz + CHUNK_SIZE / 2) / CHUNK_SIZE)
      const neededKeys = new Set<string>()

      for (let dx = -VIEW_DISTANCE; dx <= VIEW_DISTANCE; dx++) {
        for (let dz = -VIEW_DISTANCE; dz <= VIEW_DISTANCE; dz++) {
          const cx = currentChunkX + dx
          const cz = currentChunkZ + dz
          const key = `${cx},${cz}`
          neededKeys.add(key)

          if (!chunks.has(key)) {
            const mesh = createChunk(cx, cz)
            chunks.set(key, mesh)
          }
        }
      }

      chunks.forEach((mesh, key) => {
        if (!neededKeys.has(key)) {
          scene.remove(mesh)
          mesh.geometry.dispose()
          chunks.delete(key)
        }
      })
    }

    updateChunks(0, 0)

    let playerX = 0
    let playerZ = 0

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    let animId: number
    let lastTime = performance.now()

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate)
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      if (phaseRef.current === 'intro') {
        if (introStartTimeRef.current === null) {
          introStartTimeRef.current = now
        }
        const elapsed = (now - introStartTimeRef.current) / 1000
        const standT = Math.min(Math.max((elapsed - 2.0) / 3.0, 0), 1)

        const groundY = getTerrainHeight(0, 0)
        const eyeHeight = 0.25 + standT * 1.45

        const sway = Math.sin(now * 0.0035) * 0.015 * (1 - standT * 0.6)
        camera.position.set(0, groundY + eyeHeight, 0)
        camera.rotation.set(sway, yawRef.current, 0)

        if (elapsed >= 5.2 && !isIntroCompleteRef.current) {
          isIntroCompleteRef.current = true
          onIntroComplete()
        }
      } else if (phaseRef.current === 'playing' && !isPausedRef.current) {
        const look = lookRef.current
        if (look.x !== 0 || look.y !== 0) {
          yawRef.current -= look.x * 0.005
          pitchRef.current -= look.y * 0.005
          pitchRef.current = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, pitchRef.current))
          onYawChange(yawRef.current)
          lookRef.current = { x: 0, y: 0 }
        }
        camera.rotation.set(pitchRef.current, yawRef.current, 0)

        const move = moveRef.current
        if (move.x !== 0 || move.y !== 0) {
          const speed = 4.5 * dt
          const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current)
          const side = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current)

          playerX += (forward.x * move.y + side.x * move.x) * speed
          playerZ += (forward.z * move.y + side.x * move.x) * speed

          updateChunks(playerX, playerZ)

          const groundY = getTerrainHeight(playerX, playerZ)
          const bob = Math.sin(now * 0.007) * 0.035
          camera.position.set(playerX, groundY + 1.7 + bob, playerZ)
        } else {
          const groundY = getTerrainHeight(playerX, playerZ)
          camera.position.set(playerX, groundY + 1.7, playerZ)
        }
      }

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      terrainMaterial.dispose()
      sandTex.dispose()
      chunks.forEach((mesh) => mesh.geometry.dispose())
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [onIntroComplete, onYawChange])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        filter: phase === 'naming' ? 'blur(8px)' : 'none',
        transition: 'filter 0.5s ease',
      }}
    />
  )
}
