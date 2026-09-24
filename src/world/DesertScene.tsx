import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface DesertSceneProps {
  phase: 'intro' | 'naming' | 'playing'
  isPaused: boolean
  isSprinting: boolean
  moveRef: React.MutableRefObject<{ x: number; y: number }>
  lookDeltaRef: React.MutableRefObject<{ x: number; y: number }>
  onYawChange: (yaw: number) => void
  onDoorProximity: (isNear: boolean, angleDeg: number) => void
  onIntroComplete: () => void
}

interface Footprint {
  mesh: THREE.Mesh
  createdAt: number
}

const CHUNK_SIZE = 70
const CHUNK_SEGMENTS = 18
const FOOTPRINT_LIFETIME = 30.0
const DOOR_POS = { x: 80, z: -110 }

const getTerrainHeight = (x: number, z: number): number => {
  const base1 = Math.sin(x * 0.014 + z * 0.008) * 3.0
  const base2 = Math.cos(x * 0.022 - z * 0.018) * 1.8
  const base3 = Math.sin(x * 0.045 + z * 0.038) * 0.65

  const ridgeWave = Math.sin(x * 0.006 + z * 0.005) * Math.cos(z * 0.005 - x * 0.003)
  const mountainFactor = Math.max(0, ridgeWave - 0.35) * 22.0

  return base1 + base2 + base3 + mountainFactor
}

export const DesertScene: React.FC<DesertSceneProps> = ({
  phase,
  isPaused,
  isSprinting,
  moveRef,
  lookDeltaRef,
  onYawChange,
  onDoorProximity,
  onIntroComplete,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const introStartTimeRef = useRef<number | null>(null)
  const isIntroCompleteRef = useRef(false)

  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const isPausedRef = useRef(isPaused)
  isPausedRef.current = isPaused

  const isSprintingRef = useRef(isSprinting)
  isSprintingRef.current = isSprinting

  const onYawChangeRef = useRef(onYawChange)
  onYawChangeRef.current = onYawChange

  const onDoorProximityRef = useRef(onDoorProximity)
  onDoorProximityRef.current = onDoorProximity

  const onIntroCompleteRef = useRef(onIntroComplete)
  onIntroCompleteRef.current = onIntroComplete

  const yawRef = useRef(0)
  const pitchRef = useRef(0)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const skyColor = new THREE.Color(0xd49f60)
    const scene = new THREE.Scene()
    scene.background = skyColor
    scene.fog = new THREE.Fog(0xd49f60, 45, 140)

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      300,
    )
    camera.position.set(0, 0.4, 0)
    camera.rotation.order = 'YXZ'

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const hemiLight = new THREE.HemisphereLight(0xfff5e0, 0x9b6b38, 1.2)
    scene.add(hemiLight)

    const sun = new THREE.DirectionalLight(0xfffaec, 1.4)
    sun.position.set(60, 80, -70)
    scene.add(sun)

    const sunGeo = new THREE.SphereGeometry(7, 16, 16)
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffbe8 })
    const sunMesh = new THREE.Mesh(sunGeo, sunMat)
    sunMesh.position.copy(sun.position).normalize().multiplyScalar(220)
    scene.add(sunMesh)

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

    const footprintGeo = new THREE.PlaneGeometry(0.35, 0.65)
    footprintGeo.rotateX(-Math.PI / 2)

    const footprints: Footprint[] = []

    const spawnFootprint = (x: number, z: number, isLeft: boolean, yaw: number, timeNow: number) => {
      const mat = new THREE.MeshBasicMaterial({
        map: isLeft ? leftFootTex : rightFootTex,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3,
        color: 0x543818,
      })

      const mesh = new THREE.Mesh(footprintGeo, mat)
      const groundH = getTerrainHeight(x, z)

      const slopeX = (getTerrainHeight(x + 0.2, z) - getTerrainHeight(x - 0.2, z)) / 0.4
      const slopeZ = (getTerrainHeight(x, z + 0.2) - getTerrainHeight(x, z - 0.2)) / 0.4

      mesh.position.set(x, groundH + 0.035, z)
      mesh.rotation.order = 'YXZ'
      mesh.rotation.y = yaw
      mesh.rotation.x = -slopeZ
      mesh.rotation.z = slopeX

      scene.add(mesh)
      footprints.push({ mesh, createdAt: timeNow })
    }

    const doorGroup = new THREE.Group()
    const doorFrameGeo = new THREE.BoxGeometry(1.6, 2.8, 0.15)
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x1f140e, roughness: 0.8 })
    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat)
    doorFrame.position.y = 1.4
    doorGroup.add(doorFrame)

    const doorPanelGeo = new THREE.BoxGeometry(1.3, 2.5, 0.08)
    const doorPanelMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 })
    const doorPanel = new THREE.Mesh(doorPanelGeo, doorPanelMat)
    doorPanel.position.set(0, 1.4, 0.02)
    doorGroup.add(doorPanel)

    const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.16)
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.3 })
    const handle = new THREE.Mesh(handleGeo, handleMat)
    handle.rotation.z = Math.PI / 2
    handle.position.set(0.48, 1.35, 0.08)
    doorGroup.add(handle)

    const doorGroundY = getTerrainHeight(DOOR_POS.x, DOOR_POS.z)
    doorGroup.position.set(DOOR_POS.x, doorGroundY, DOOR_POS.z)
    scene.add(doorGroup)

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
          onIntroCompleteRef.current()
        }
      } else if (phaseRef.current === 'playing' && !isPausedRef.current) {
        const look = lookDeltaRef.current
        if (look.x !== 0 || look.y !== 0) {
          yawRef.current -= look.x * 0.005
          pitchRef.current -= look.y * 0.005
          pitchRef.current = Math.max(-Math.PI / 2.7, Math.min(Math.PI / 2.7, pitchRef.current))
          onYawChangeRef.current(yawRef.current)
          lookDeltaRef.current = { x: 0, y: 0 }
        }
        camera.rotation.set(pitchRef.current, yawRef.current, 0)

        const move = moveRef.current
        const isMoving = move.x !== 0 || move.y !== 0

        if (isMoving) {
          const moveSpeed = isSprintingRef.current ? 8.2 : 5.0
          const speed = moveSpeed * dt
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

          if (distanceCounter >= (isSprintingRef.current ? 1.5 : 1.25)) {
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

          const headBob = Math.sin(now * (isSprintingRef.current ? 0.013 : 0.008)) * 0.04
          camera.position.set(playerX, currentCamY + headBob, playerZ)
        } else {
          const groundY = getTerrainHeight(playerX, playerZ)
          const targetCamY = groundY + 1.7
          currentCamY += (targetCamY - currentCamY) * Math.min(1.0, 9 * dt)
          camera.position.set(playerX, currentCamY, playerZ)
        }

        const distToDoor = Math.sqrt(
          (playerX - DOOR_POS.x) ** 2 + (playerZ - DOOR_POS.z) ** 2
        )
        const doorAngleRad = Math.atan2(DOOR_POS.x - playerX, -(DOOR_POS.z - playerZ))
        const doorAngleDeg = ((doorAngleRad * 180) / Math.PI + 360) % 360
        onDoorProximityRef.current(distToDoor < 3.5, doorAngleDeg)
      }

      for (let i = footprints.length - 1; i >= 0; i--) {
        const fp = footprints[i]
        const age = (now - fp.createdAt) / 1000

        if (age >= FOOTPRINT_LIFETIME) {
          scene.remove(fp.mesh)
          ;(fp.mesh.material as THREE.Material).dispose()
          footprints.splice(i, 1)
        } else {
          const fadeProgress = age / FOOTPRINT_LIFETIME
          ;(fp.mesh.material as THREE.MeshBasicMaterial).opacity = 0.45 * (1 - fadeProgress)
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
      sunGeo.dispose()
      sunMat.dispose()
      doorFrameGeo.dispose()
      doorFrameMat.dispose()
      doorPanelGeo.dispose()
      doorPanelMat.dispose()
      handleGeo.dispose()
      handleMat.dispose()
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
  }, [])

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
