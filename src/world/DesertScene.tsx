import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface DesertSceneProps {
  phase: 'intro' | 'naming' | 'playing'
  isPaused: boolean
  moveRef: React.MutableRefObject<{ x: number; y: number }>
  lookDeltaRef: React.MutableRefObject<{ x: number; y: number }>
  onYawChange: (yaw: number) => void
  onIntroComplete: () => void
}

const CHUNK_SIZE = 60
const CHUNK_SEGMENTS = 20

const getTerrainHeight = (x: number, z: number): number => {
  return (
    Math.sin(x * 0.02) * 0.75 +
    Math.cos(z * 0.025) * 0.65 +
    Math.sin(x * 0.05 + z * 0.04) * 0.35
  )
}

export const DesertScene: React.FC<DesertSceneProps> = ({
  phase,
  isPaused,
  moveRef,
  lookDeltaRef,
  onYawChange,
  onIntroComplete,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const introStartTimeRef = useRef<number | null>(null)
  const isIntroCompleteRef = useRef(false)

  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const isPausedRef = useRef(isPaused)
  isPausedRef.current = isPaused

  const yawRef = useRef(0)
  const pitchRef = useRef(0)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const skyColor = new THREE.Color(0xd49f60)
    const scene = new THREE.Scene()
    scene.background = skyColor
    scene.fog = new THREE.Fog(0xd49f60, 40, 110)

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      250,
    )
    camera.position.set(0, 0.3, 0)
    camera.rotation.order = 'YXZ'

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const hemiLight = new THREE.HemisphereLight(0xfff3db, 0xa3713d, 1.1)
    scene.add(hemiLight)

    const sun = new THREE.DirectionalLight(0xfffaec, 1.25)
    sun.position.set(50, 60, -40)
    scene.add(sun)

    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#c7924c'
    ctx.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#b8823d' : '#d29e59'
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2)
    }
    const fallbackTex = new THREE.CanvasTexture(canvas)
    fallbackTex.wrapS = THREE.RepeatWrapping
    fallbackTex.wrapT = THREE.RepeatWrapping
    fallbackTex.repeat.set(4, 4)

    const terrainMaterial = new THREE.MeshStandardMaterial({
      map: fallbackTex,
      color: 0xc7924c,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: true,
    })

    const texLoader = new THREE.TextureLoader()
    texLoader.load('/sand.png', (loadedTex) => {
      loadedTex.wrapS = THREE.RepeatWrapping
      loadedTex.wrapT = THREE.RepeatWrapping
      loadedTex.repeat.set(6, 6)
      terrainMaterial.map = loadedTex
      terrainMaterial.needsUpdate = true
    })

    const chunks: { mesh: THREE.Mesh; cx: number; cz: number }[] = []

    const buildChunkGeometry = (geo: THREE.PlaneGeometry, originX: number, originZ: number) => {
      const pos = geo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const localX = pos.getX(i)
        const localZ = pos.getZ(i)
        pos.setY(i, getTerrainHeight(originX + localX, originZ + localZ))
      }
      geo.computeVertexNormals()
      pos.needsUpdate = true
    }

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const geo = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SEGMENTS, CHUNK_SEGMENTS)
        geo.rotateX(-Math.PI / 2)
        buildChunkGeometry(geo, dx * CHUNK_SIZE, dz * CHUNK_SIZE)
        const mesh = new THREE.Mesh(geo, terrainMaterial)
        mesh.position.set(dx * CHUNK_SIZE, 0, dz * CHUNK_SIZE)
        scene.add(mesh)
        chunks.push({ mesh, cx: dx, cz: dz })
      }
    }

    let lastGridX = 0
    let lastGridZ = 0

    const updateInfiniteChunks = (px: number, pz: number) => {
      const currentGridX = Math.round(px / CHUNK_SIZE)
      const currentGridZ = Math.round(pz / CHUNK_SIZE)

      if (currentGridX === lastGridX && currentGridZ === lastGridZ) return
      lastGridX = currentGridX
      lastGridZ = currentGridZ

      let idx = 0
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const targetCX = currentGridX + dx
          const targetCZ = currentGridZ + dz
          const chunk = chunks[idx]
          chunk.cx = targetCX
          chunk.cz = targetCZ
          chunk.mesh.position.set(targetCX * CHUNK_SIZE, 0, targetCZ * CHUNK_SIZE)
          buildChunkGeometry(chunk.mesh.geometry as THREE.PlaneGeometry, targetCX * CHUNK_SIZE, targetCZ * CHUNK_SIZE)
          idx++
        }
      }
    }

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
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      if (phaseRef.current === 'intro') {
        if (introStartTimeRef.current === null) {
          introStartTimeRef.current = now
        }
        const elapsed = (now - introStartTimeRef.current) / 1000
        const standT = Math.min(Math.max((elapsed - 2.0) / 3.0, 0), 1)

        const groundY = getTerrainHeight(0, 0)
        const eyeHeight = 0.3 + standT * 1.4

        const sway = Math.sin(now * 0.003) * 0.012 * (1 - standT * 0.5)
        camera.position.set(0, groundY + eyeHeight, 0)
        camera.rotation.set(sway, yawRef.current, 0)

        if (elapsed >= 5.2 && !isIntroCompleteRef.current) {
          isIntroCompleteRef.current = true
          onIntroComplete()
        }
      } else if (phaseRef.current === 'playing' && !isPausedRef.current) {
        const look = lookDeltaRef.current
        if (look.x !== 0 || look.y !== 0) {
          yawRef.current -= look.x * 0.005
          pitchRef.current -= look.y * 0.005
          pitchRef.current = Math.max(-Math.PI / 2.8, Math.min(Math.PI / 2.8, pitchRef.current))
          onYawChange(yawRef.current)
          lookDeltaRef.current = { x: 0, y: 0 }
        }
        camera.rotation.set(pitchRef.current, yawRef.current, 0)

        const move = moveRef.current
        if (move.x !== 0 || move.y !== 0) {
          const speed = 5.2 * dt
          const forwardX = -Math.sin(yawRef.current)
          const forwardZ = -Math.cos(yawRef.current)
          const sideX = Math.cos(yawRef.current)
          const sideZ = -Math.sin(yawRef.current)

          playerX += (forwardX * move.y + sideX * move.x) * speed
          playerZ += (forwardZ * move.y + sideZ * move.x) * speed

          updateInfiniteChunks(playerX, playerZ)

          const groundY = getTerrainHeight(playerX, playerZ)
          camera.position.set(playerX, groundY + 1.7, playerZ)
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
      fallbackTex.dispose()
      terrainMaterial.dispose()
      chunks.forEach((c) => c.mesh.geometry.dispose())
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
