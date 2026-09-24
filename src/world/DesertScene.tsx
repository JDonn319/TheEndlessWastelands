import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface DesertSceneProps {
  phase: 'intro' | 'naming' | 'playing'
  isPaused: boolean
  isSprinting: boolean
  hunger: number
  moveRef: React.MutableRefObject<{ x: number; y: number }>
  lookDeltaRef: React.MutableRefObject<{ x: number; y: number }>
  teleportTrigger: number
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

const getTerrainHeight = (x: number, z: number): number => {
  const base1 = Math.sin(x * 0.014 + z * 0.008) * 3.0
  const base2 = Math.cos(x * 0.022 - z * 0.018) * 1.8
  const base3 = Math.sin(x * 0.045 + z * 0.038) * 0.65

  const ridgeWave = Math.sin(x * 0.005 + z * 0.004) * Math.cos(z * 0.004 - x * 0.003)
  const mountainFactor = Math.max(0, ridgeWave - 0.32) * 26.0

  return base1 + base2 + base3 + mountainFactor
}

export const DesertScene: React.FC<DesertSceneProps> = ({
  phase,
  isPaused,
  isSprinting,
  hunger,
  moveRef,
  lookDeltaRef,
  teleportTrigger,
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

  const hungerRef = useRef(hunger)
  hungerRef.current = hunger

  const onYawChangeRef = useRef(onYawChange)
  onYawChangeRef.current = onYawChange

  const onDoorProximityRef = useRef(onDoorProximity)
  onDoorProximityRef.current = onDoorProximity

  const onIntroCompleteRef = useRef(onIntroComplete)
  onIntroCompleteRef.current = onIntroComplete

  const yawRef = useRef(0)
  const pitchRef = useRef(0)

  const doorPosRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 })
  const playerPosRef = useRef({ x: 0, z: 0 })

  const mirageMeshRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2
    const dist = 350 + Math.random() * 250
    doorPosRef.current = {
      x: Math.cos(angle) * dist,
      z: Math.sin(angle) * dist,
    }
  }, [])

  useEffect(() => {
    if (teleportTrigger > 0) {
      playerPosRef.current.x = doorPosRef.current.x + 1.8
      playerPosRef.current.z = doorPosRef.current.z + 1.8
    }
  }, [teleportTrigger])

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
      320,
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

    const doorTex = texLoader.load('/door.png')
    const doorPanelGeo = new THREE.BoxGeometry(1.3, 2.5, 0.08)
    const doorPanelMat = new THREE.MeshStandardMaterial({
      map: doorTex,
      color: 0x991b1b,
      roughness: 0.6,
      side: THREE.DoubleSide,
    })
    const doorPanel = new THREE.Mesh(doorPanelGeo, doorPanelMat)
    doorPanel.position.set(0, 1.4, 0.02)
    doorGroup.add(doorPanel)

    const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.16)
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.3 })
    const handle = new THREE.Mesh(handleGeo, handleMat)
    handle.rotation.z = Math.PI / 2
    handle.position.set(0.48, 1.35, 0.08)
    doorGroup.add(handle)

    const iconCanvas = document.createElement('canvas')
    iconCanvas.width = 64
    iconCanvas.height = 64
    const ictx = iconCanvas.getContext('2d')!
    ictx.fillStyle = 'rgba(15, 12, 6, 0.85)'
    ictx.fillRect(0, 0, 64, 64)
    ictx.strokeStyle = '#ef4444'
    ictx.lineWidth = 4
    ictx.strokeRect(2, 2, 60, 60)
    ictx.fillStyle = '#ffffff'
    ictx.font = 'bold 36px sans-serif'
    ictx.textAlign = 'center'
    ictx.textBaseline = 'middle'
    ictx.fillText('E', 32, 34)
    const iconTex = new THREE.CanvasTexture(iconCanvas)

    const doorPromptMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, 0.4),
      new THREE.MeshBasicMaterial({ map: iconTex, transparent: true, side: THREE.DoubleSide })
    )
    doorPromptMesh.position.set(0, 1.6, 0.12)
    doorPromptMesh.visible = false
    doorGroup.add(doorPromptMesh)

    const initialDoorY = getTerrainHeight(doorPosRef.current.x, doorPosRef.current.z)
    doorGroup.position.set(doorPosRef.current.x, initialDoorY, doorPosRef.current.z)
    scene.add(doorGroup)

    const mirageGeo = new THREE.CylinderGeometry(0.4, 0.6, 3.2, 8)
    const mirageMat = new THREE.MeshBasicMaterial({ color: 0x1a150e, transparent: true, opacity: 0.0 })
    const mirageMesh = new THREE.Mesh(mirageGeo, mirageMat)
    mirageMesh.position.set(doorPosRef.current.x * 0.4, getTerrainHeight(doorPosRef.current.x * 0.4, doorPosRef.current.z * 0.4) + 1.6, doorPosRef.current.z * 0.4)
    scene.add(mirageMesh)
    mirageMeshRef.current = mirageMesh

    const gltfLoader = new GLTFLoader()
    const tentCamps: THREE.Group[] = []

    const spawnTentCamp = (tx: number, tz: number) => {
      const camp = new THREE.Group()
      const ty = getTerrainHeight(tx, tz)
      camp.position.set(tx, ty, tz)

      const tentGeo = new THREE.ConeGeometry(2.4, 2.0, 4)
      tentGeo.rotateY(Math.PI / 4)
      const tentMat = new THREE.MeshStandardMaterial({ color: 0x826c52, roughness: 0.9 })
      const tent = new THREE.Mesh(tentGeo, tentMat)
      tent.position.y = 1.0
      camp.add(tent)

      const totalItems = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < totalItems; i++) {
        const itemType = Math.random() > 0.5 ? 'drink-1.glb' : Math.random() > 0.5 ? 'food-1.glb' : 'food-2.glb'
        gltfLoader.load(
          `/${itemType}`,
          (gltf) => {
            const model = gltf.scene
            model.scale.set(0.3, 0.3, 0.3)
            model.position.set((i - 1) * 0.5 + 0.8, 0.1, 0.8)
            camp.add(model)
          },
          undefined,
          () => {
            const fallbackMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(0.08, 0.08, 0.25),
              new THREE.MeshStandardMaterial({ color: itemType.includes('drink') ? 0x38bdf8 : 0xf59e0b })
            )
            fallbackMesh.position.set((i - 1) * 0.5 + 0.8, 0.12, 0.8)
            camp.add(fallbackMesh)
          }
        )
      }
      scene.add(camp)
      tentCamps.push(camp)
    }

    spawnTentCamp(doorPosRef.current.x * 0.35, doorPosRef.current.z * 0.35)
    spawnTentCamp(-doorPosRef.current.x * 0.25, -doorPosRef.current.z * 0.25)

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

          playerPosRef.current.x += stepX
          playerPosRef.current.z += stepZ

          const walked = Math.sqrt(stepX * stepX + stepZ * stepZ)
          distanceCounter += walked

          const stepThreshold = isSprintingRef.current ? 2.9 : 2.2
          if (distanceCounter >= stepThreshold) {
            distanceCounter = 0
            const lateralOffset = isLeftFootNext ? -0.22 : 0.22
            const footX = playerPosRef.current.x + sideX * lateralOffset
            const footZ = playerPosRef.current.z + sideZ * lateralOffset
            spawnFootprint(footX, footZ, isLeftFootNext, yawRef.current, now)
            isLeftFootNext = !isLeftFootNext
          }

          updateChunks(playerPosRef.current.x, playerPosRef.current.z)

          const groundY = getTerrainHeight(playerPosRef.current.x, playerPosRef.current.z)
          const targetCamY = groundY + 1.7
          currentCamY += (targetCamY - currentCamY) * Math.min(1.0, 9 * dt)

          const headBob = Math.sin(now * (isSprintingRef.current ? 0.013 : 0.008)) * 0.04
          camera.position.set(playerPosRef.current.x, currentCamY + headBob, playerPosRef.current.z)
        } else {
          const groundY = getTerrainHeight(playerPosRef.current.x, playerPosRef.current.z)
          const targetCamY = groundY + 1.7
          currentCamY += (targetCamY - currentCamY) * Math.min(1.0, 9 * dt)
          camera.position.set(playerPosRef.current.x, currentCamY, playerPosRef.current.z)
        }

        const deltaX = doorPosRef.current.x - playerPosRef.current.x
        const deltaZ = doorPosRef.current.z - playerPosRef.current.z
        const distToDoor = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ)

        const doorAngleRad = Math.atan2(deltaX, -deltaZ)
        const doorAngleDeg = ((doorAngleRad * 180) / Math.PI + 360) % 360
        const isNear = distToDoor < 3.5

        doorPromptMesh.visible = isNear
        onDoorProximityRef.current(isNear, doorAngleDeg)

        if (mirageMeshRef.current) {
          const mdx = mirageMeshRef.current.position.x - playerPosRef.current.x
          const mdz = mirageMeshRef.current.position.z - playerPosRef.current.z
          const distToMirage = Math.sqrt(mdx * mdx + mdz * mdz)

          if (hungerRef.current < 30 && distToMirage > 45 && distToMirage < 180) {
            const opacity = Math.min(0.5, (distToMirage - 45) / 100)
            ;(mirageMeshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
          } else {
            ;(mirageMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0
          }
        }
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
      doorTex.dispose()
      iconTex.dispose()
      mirageGeo.dispose()
      mirageMat.dispose()
      tentCamps.forEach((c) => scene.remove(c))
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
