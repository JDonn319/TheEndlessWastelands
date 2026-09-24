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

interface Footprint {
  mesh: THREE.Mesh
  createdAt: number
}

const CHUNK_SIZE = 70
const CHUNK_SEGMENTS = 18

const getTerrainHeight = (x: number, z: number): number => {
  const d1 = Math.sin(x * 0.014 + z * 0.008) * 3.4
  const d2 = Math.cos(x * 0.022 - z * 0.018) * 2.1
  const d3 = Math.sin(x * 0.045 + z * 0.038) * 0.75
  return d1 + d2 + d3
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
    scene.fog = new THREE.Fog(0xd49f60, 45, 125)

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      250,
    )
    camera.position.set(0, 0.4, 0)
    camera.rotation.order = 'YXZ'

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const hemiLight = new THREE.HemisphereLight(0xfff5e0, 0x9b6b38, 1.15)
    scene.add(hemiLight)

    const sun = new THREE.DirectionalLight(0xfffaec, 1.3)
    sun.position.set(50, 70, -40)
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
      loadedTex.repeat.set(8, 8)
      terrainMaterial.map = loadedTex
      terrainMaterial.needsUpdate = true
    })

    const leftFootTex = texLoader.load('/leftleg.png')
    const rightFootTex = texLoader.load('/rightleg.png')

    const createFootprintMaterial = (map: THREE.Texture) =>
      new THREE.MeshBasicMaterial({
        map,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        color: 0x6e4b21,
      })

    const footprintGeo = new THREE.PlaneGeometry(0.35, 0.65)
    footprintGeo.rotateX(-Math.PI / 2)

    const footprints: Footprint[] = []

    const spawnFootprint = (x: number, z: number, isLeft: boolean, yaw: number, timeNow: number) => {
      const mat = createFootprintMaterial(isLeft ? leftFootTex : rightFootTex)
      const mesh = new THREE.Mesh(footprintGeo, mat)
      const groundH = getTerrainHeight(x, z)
      mesh.position.set(x, groundH + 0.02, z)
      mesh.rotation.y = yaw
      scene.add(mesh)
      footprints.push({ mesh, createdAt: timeNow })
    }

    const chunks = new Map<string, THREE.Mesh>()
    const chunkPool: THREE.Mesh[] = []

    const buildChunkVertices = (geo: THREE.PlaneGeometry, originX: number, originZ: number) => {
      const pos = geo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const localX = pos.getX(i)
        const localZ = pos.getZ(i)
        pos.setY(i, getTerrainHeight(originX + localX, originZ + localZ))
      }
      geo.computeVertexNormals()
      pos.needsUpdate = true
    }

    const getOrCreateChunkMesh = (cx: number, cz: number): THREE.Mesh => {
      let mesh = chunkPool.pop()
      const originX = cx * CHUNK_SIZE
      const originZ = cz * CHUNK_SIZE

      if (!mesh) {
        const geo = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SEGMENTS, CHUNK_SEGMENTS)
        geo.rotateX(-Math.PI / 2)
        mesh = new THREE.Mesh(geo, terrainMaterial)
        scene.add(mesh)
      } else {
        mesh.visible = true
      }

      mesh.position.set(originX, 0, originZ)
      buildChunkVertices(mesh.geometry as THREE.PlaneGeometry, originX, originZ)
      return mesh
    }

    let lastGridX = 9999
    let lastGridZ = 9999

    const updateChunks = (px: number, pz: number) => {
      const currentGridX = Math.floor((px + CHUNK_SIZE / 2) / CHUNK_SIZE)
      const currentGridZ = Math.floor((pz + CHUNK_SIZE / 2) / CHUNK_SIZE)

      if (currentGridX === lastGridX && currentGridZ === lastGridZ) return
      lastGridX = currentGridX
      lastGridZ = currentGridZ

      const needed = new Set<string>()

      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const cx = currentGridX + dx
          const cz = currentGridZ + dz
          const key = `${cx},${cz}`
          needed.add(key)

          if (!chunks.has(key)) {
            const mesh = getOrCreateChunkMesh(cx, cz)
            chunks.set(key, mesh)
          }
        }
      }

      chunks.forEach((mesh, key) => {
        if (!needed.has(key)) {
          mesh.visible = false
          chunkPool.push(mesh)
          chunks.delete(key)
        }
      })
    }

    updateChunks(0, 0)

    let playerX = 0
    let playerZ = 0
    let currentCamY = getTerrainHeight(0, 0) + 1.7
    let distanceCounter = 0
    let isLeftFootNext = true

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
        const eyeHeight = 0.35 + standT * 1.35
        const sway = Math.sin(now * 0.003) * 0.012 * (1 - standT * 0.5)

        currentCamY = groundY + eyeHeight
        camera.position.set(0, currentCamY, 0)
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
          pitchRef.current = Math.max(-Math.PI / 2.7, Math.min(Math.PI / 2.7, pitchRef.current))
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

          const stepX = (forwardX * move.y + sideX * move.x) * speed
          const stepZ = (forwardZ * move.y + sideZ * move.x) * speed

          playerX += stepX
          playerZ += stepZ

          const walked = Math.sqrt(stepX * stepX + stepZ * stepZ)
          distanceCounter += walked

          if (distanceCounter >= 1.25) {
            distanceCounter = 0
            const lateralOffset = isLeftFootNext ? -0.22 : 0.22
            const footX = playerX + sideX * lateralOffset
            const footZ = playerZ + sideZ * lateralOffset
            spawnFootprint(footX, footZ, isLeftFootNext, yawRef.current, now)
            isLeftFootNext = !isLeftFootNext
          }

          updateChunks(playerX, playerZ)

          const groundY = getTerrainHeight(playerX, playerZ)
          const targetCamY = groundY + 1.7
          currentCamY += (targetCamY - currentCamY) * Math.min(1.0, 9 * dt)

          const headBob = Math.sin(now * 0.008) * 0.035
          camera.position.set(playerX, currentCamY + headBob, playerZ)
        } else {
          const groundY = getTerrainHeight(playerX, playerZ)
          const targetCamY = groundY + 1.7
          currentCamY += (targetCamY - currentCamY) * Math.min(1.0, 9 * dt)
          camera.position.set(playerX, currentCamY, playerZ)
        }
      }

      for (let i = footprints.length - 1; i >= 0; i--) {
        const fp = footprints[i]
        const age = (now - fp.createdAt) / 1000
        const lifetime = 9.0

        if (age >= lifetime) {
          scene.remove(fp.mesh)
          fp.mesh.geometry.dispose()
          ;(fp.mesh.material as THREE.Material).dispose()
          footprints.splice(i, 1)
        } else {
          const fadeProgress = age / lifetime
          ;(fp.mesh.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - fadeProgress)
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
      leftFootTex.dispose()
      rightFootTex.dispose()
      footprintGeo.dispose()
      chunks.forEach((mesh) => mesh.geometry.dispose())
      chunkPool.forEach((mesh) => mesh.geometry.dispose())
      footprints.forEach((fp) => {
        scene.remove(fp.mesh)
        ;(fp.mesh.material as THREE.Material).dispose()
      })
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
