import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { InventoryItem } from '../ui/InventoryModal'

interface DesertSceneProps {
  phase: 'intro' | 'naming' | 'playing'
  isPaused: boolean
  isSprinting: boolean
  hunger: number
  holdProgress: number
  equippedItem: InventoryItem | null
  consumeTrigger: number
  pickupTrigger: number
  moveRef: React.MutableRefObject<{ x: number; y: number }>
  lookDeltaRef: React.MutableRefObject<{ x: number; y: number }>
  teleportTrigger: number
  onTargetItemChange: (hasTarget: boolean) => void
  onItemCollected: (item: InventoryItem) => void
  onYawChange: (yaw: number) => void
  onDoorProximity: (isNear: boolean, angleDeg: number) => void
  onIntroComplete: () => void
}

interface Footprint {
  mesh: THREE.Mesh
  createdAt: number
}

interface PhysicsItem {
  id: string
  mesh: THREE.Group | THREE.Mesh
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  rotX: number
  rotZ: number
  vRotX: number
  vRotZ: number
  data: InventoryItem
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
  holdProgress,
  equippedItem,
  consumeTrigger,
  pickupTrigger,
  moveRef,
  lookDeltaRef,
  teleportTrigger,
  onTargetItemChange,
  onItemCollected,
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

  const holdProgressRef = useRef(holdProgress)
  holdProgressRef.current = holdProgress

  const onYawChangeRef = useRef(onYawChange)
  onYawChangeRef.current = onYawChange

  const onDoorProximityRef = useRef(onDoorProximity)
  onDoorProximityRef.current = onDoorProximity

  const onIntroCompleteRef = useRef(onIntroComplete)
  onIntroCompleteRef.current = onIntroComplete

  const onTargetItemChangeRef = useRef(onTargetItemChange)
  onTargetItemChangeRef.current = onTargetItemChange

  const onItemCollectedRef = useRef(onItemCollected)
  onItemCollectedRef.current = onItemCollected

  const yawRef = useRef(0)
  const pitchRef = useRef(0)

  const doorPosRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 })
  const playerPosRef = useRef({ x: 0, z: 0 })

  const mirageMeshRef = useRef<THREE.Mesh | null>(null)
  const doorPromptFillMeshRef = useRef<THREE.Mesh | null>(null)
  const physicsItemsRef = useRef<PhysicsItem[]>([])
  const targetedItemRef = useRef<PhysicsItem | null>(null)

  const handGroupRef = useRef<THREE.Group | null>(null)
  const handItemMeshRef = useRef<THREE.Group | THREE.Mesh | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)

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
    if (pickupTrigger > 0 && targetedItemRef.current && sceneRef.current) {
      const item = targetedItemRef.current
      sceneRef.current.remove(item.mesh)
      physicsItemsRef.current = physicsItemsRef.current.filter((it) => it.id !== item.id)
      onItemCollectedRef.current(item.data)
      targetedItemRef.current = null
      onTargetItemChangeRef.current(false)
    }
  }, [pickupTrigger])

  useEffect(() => {
    const handGroup = handGroupRef.current
    if (!handGroup) return

    if (handItemMeshRef.current) {
      handGroup.remove(handItemMeshRef.current)
      handItemMeshRef.current = null
    }

    if (!equippedItem) return

    const isDrink = equippedItem.type === 'drink'
    const gltfLoader = new GLTFLoader()
    const fileName = isDrink ? 'drink-1.glb' : 'food-1.glb'

    gltfLoader.load(
      `/${fileName}`,
      (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z) || 1
        const scale = 0.22 / maxDim
        model.scale.set(scale, scale, scale)
        model.position.set(0, 0, 0)
        handGroup.add(model)
        handItemMeshRef.current = model
      },
      undefined,
      () => {
        const fallback = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.18),
          new THREE.MeshStandardMaterial({ color: isDrink ? 0xffffff : 0xcccccc })
        )
        handGroup.add(fallback)
        handItemMeshRef.current = fallback
      }
    )
  }, [equippedItem])

  useEffect(() => {
    if (consumeTrigger > 0 && handItemMeshRef.current) {
      const itemMesh = handItemMeshRef.current
      let t = 0
      const timer = setInterval(() => {
        t += 0.1
        itemMesh.scale.multiplyScalar(0.85)
        itemMesh.position.y += 0.015
        if (t >= 0.6) {
          clearInterval(timer)
        }
      }, 30)
    }
  }, [consumeTrigger])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const skyColor = new THREE.Color(0xd49f60)
    const scene = new THREE.Scene()
    scene.background = skyColor
    scene.fog = new THREE.Fog(0xd49f60, 45, 140)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      320,
    )
    camera.position.set(0, 0.4, 0)
    camera.rotation.order = 'YXZ'

    const handGroup = new THREE.Group()
    handGroup.position.set(0.24, -0.22, -0.45)
    camera.add(handGroup)
    scene.add(camera)
    handGroupRef.current = handGroup

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
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x221a14, roughness: 0.8 })
    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat)
    doorFrame.position.y = 1.4
    doorGroup.add(doorFrame)

    const doorCanvas = document.createElement('canvas')
    doorCanvas.width = 256
    doorCanvas.height = 512
    const dctx = doorCanvas.getContext('2d')!
    dctx.fillStyle = '#8b1e1e'
    dctx.fillRect(0, 0, 256, 512)
    dctx.fillStyle = '#681313'
    dctx.fillRect(16, 24, 104, 210)
    dctx.fillRect(136, 24, 104, 210)
    dctx.fillRect(16, 260, 104, 220)
    dctx.fillRect(136, 260, 104, 220)
    const defaultDoorTex = new THREE.CanvasTexture(doorCanvas)

    const doorFaceMat = new THREE.MeshStandardMaterial({
      map: defaultDoorTex,
      color: 0xffffff,
      roughness: 0.6,
      side: THREE.DoubleSide,
    })

    texLoader.load('/door.png', (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace
      doorFaceMat.map = loaded
      doorFaceMat.needsUpdate = true
    })

    const frontPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.5), doorFaceMat)
    frontPlane.position.set(0, 1.4, 0.076)
    doorGroup.add(frontPlane)

    const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.5), doorFaceMat)
    backPlane.position.set(0, 1.4, -0.076)
    backPlane.rotation.y = Math.PI
    doorGroup.add(backPlane)

    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.16)
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 })
    const handle = new THREE.Mesh(handleGeo, handleMat)
    handle.rotation.z = Math.PI / 2
    handle.position.set(0.48, 1.35, 0.1)
    doorGroup.add(handle)

    const promptFrameGeo = new THREE.PlaneGeometry(0.35, 0.35)
    const promptFrameMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, side: THREE.DoubleSide })
    const promptFrameMesh = new THREE.Mesh(promptFrameGeo, promptFrameMat)
    promptFrameMesh.position.set(0, 1.6, 0.12)
    doorGroup.add(promptFrameMesh)

    const promptFillGeo = new THREE.PlaneGeometry(0.35, 0.35)
    const promptFillMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    const promptFillMesh = new THREE.Mesh(promptFillGeo, promptFillMat)
    promptFillMesh.position.set(0, 1.425, 0.13)
    promptFillMesh.scale.set(1, 0.001, 1)
    doorGroup.add(promptFillMesh)
    doorPromptFillMeshRef.current = promptFillMesh

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

    const spawnStructureItems = (parent: THREE.Group) => {
      const count = Math.floor(Math.random() * 3) + 2
      for (let i = 0; i < count; i++) {
        const isDrink = Math.random() > 0.5
        const itemType = isDrink ? 'drink-1.glb' : Math.random() > 0.5 ? 'food-1.glb' : 'food-2.glb'
        const itemData: InventoryItem = {
          id: `${Date.now()}-${Math.random()}`,
          name: isDrink ? 'ВОДА' : 'ПАЕК',
          type: isDrink ? 'drink' : 'food',
          count: 1,
          weight: isDrink ? 0.3 : 0.25,
        }

        const localX = (i - 1) * 0.7 + (Math.random() - 0.5) * 0.2
        const localZ = 0.2 + (Math.random() - 0.5) * 0.4
        const worldX = parent.position.x + localX
        const worldZ = parent.position.z + localZ
        const groundY = getTerrainHeight(worldX, worldZ)

        gltfLoader.load(
          `/${itemType}`,
          (gltf) => {
            const model = gltf.scene
            const box = new THREE.Box3().setFromObject(model)
            const size = box.getSize(new THREE.Vector3())
            const maxDim = Math.max(size.x, size.y, size.z) || 1
            const targetScale = 0.2 / maxDim
            model.scale.set(targetScale, targetScale, targetScale)
            model.position.set(worldX, groundY + 0.1, worldZ)
            scene.add(model)
            physicsItemsRef.current.push({
              id: itemData.id,
              mesh: model,
              x: worldX,
              y: groundY + 0.1,
              z: worldZ,
              vx: 0,
              vy: 0,
              vz: 0,
              rotX: 0,
              rotZ: 0,
              vRotX: 0,
              vRotZ: 0,
              data: itemData,
            })
          },
          undefined,
          () => {
            const fallbackMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(0.04, 0.04, 0.18),
              new THREE.MeshStandardMaterial({ color: isDrink ? 0xffffff : 0xcccccc })
            )
            fallbackMesh.position.set(worldX, groundY + 0.09, worldZ)
            scene.add(fallbackMesh)
            physicsItemsRef.current.push({
              id: itemData.id,
              mesh: fallbackMesh,
              x: worldX,
              y: groundY + 0.09,
              z: worldZ,
              vx: 0,
              vy: 0,
              vz: 0,
              rotX: 0,
              rotZ: 0,
              vRotX: 0,
              vRotZ: 0,
              data: itemData,
            })
          }
        )
      }
    }

    const spawnBigTent = (tx: number, tz: number) => {
      const camp = new THREE.Group()
      const ty = getTerrainHeight(tx, tz)
      camp.position.set(tx, ty, tz)

      const tentMat = new THREE.MeshStandardMaterial({ color: 0x6e5c46, roughness: 0.9, side: THREE.DoubleSide })
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x4a3b2b, roughness: 0.95 })

      const leftRoof = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 4.4), tentMat)
      leftRoof.position.set(-1.8, 2.2, 0)
      leftRoof.rotation.z = Math.PI / 4
      camp.add(leftRoof)

      const rightRoof = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 4.4), tentMat)
      rightRoof.position.set(1.8, 2.2, 0)
      rightRoof.rotation.z = -Math.PI / 4
      camp.add(rightRoof)

      const backWall = new THREE.Mesh(new THREE.BufferGeometry(), wallMat)
      const verts = new Float32Array([
        -3.2, 0, -2.5,
         3.2, 0, -2.5,
         0, 3.8, -2.5
      ])
      backWall.geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3))
      backWall.geometry.computeVertexNormals()
      camp.add(backWall)

      const poleMat = new THREE.MeshStandardMaterial({ color: 0x2e2116, roughness: 0.8 })
      const frontPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.8), poleMat)
      frontPole.position.set(0, 1.9, 2.4)
      camp.add(frontPole)

      const backPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.8), poleMat)
      backPole.position.set(0, 1.9, -2.4)
      camp.add(backPole)

      scene.add(camp)
      spawnStructureItems(camp)
    }

    const spawnStoneRuins = (rx: number, rz: number) => {
      const ruins = new THREE.Group()
      const ry = getTerrainHeight(rx, rz)
      ruins.position.set(rx, ry, rz)

      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9c8b74, roughness: 0.95 })
      for (let i = 0; i < 4; i++) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 3.2 + i * 0.3), stoneMat)
        pillar.position.set((i - 1.5) * 2.4, 1.6, (i % 2 === 0 ? 1 : -1) * 1.4)
        pillar.rotation.z = (Math.random() - 0.5) * 0.1
        ruins.add(pillar)
      }

      const arch = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 0.8), stoneMat)
      arch.position.set(0, 3.4, 1.4)
      ruins.add(arch)

      scene.add(ruins)
      spawnStructureItems(ruins)
    }

    const spawnWoodenHut = (hx: number, hz: number) => {
      const hut = new THREE.Group()
      const hy = getTerrainHeight(hx, hz)
      hut.position.set(hx, hy, hz)

      const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3724, roughness: 0.9 })
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 4.0), woodMat)
      leftWall.position.set(-2.0, 1.3, 0)
      hut.add(leftWall)

      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 4.0), woodMat)
      rightWall.position.set(2.0, 1.3, 0)
      hut.add(rightWall)

      const backWall = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.6, 0.2), woodMat)
      backWall.position.set(0, 1.3, -2.0)
      hut.add(backWall)

      const roofMat = new THREE.MeshStandardMaterial({ color: 0x2d2216, roughness: 0.8 })
      const roof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.2, 4.6), roofMat)
      roof.position.set(0, 2.8, 0)
      roof.rotation.x = 0.1
      hut.add(roof)

      scene.add(hut)
      spawnStructureItems(hut)
    }

    spawnBigTent(doorPosRef.current.x * 0.4, doorPosRef.current.z * 0.4)
    spawnStoneRuins(-doorPosRef.current.x * 0.35, doorPosRef.current.z * 0.35)
    spawnWoodenHut(doorPosRef.current.x * 0.25, -doorPosRef.current.z * 0.25)

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

        if (doorPromptFillMeshRef.current) {
          const p = Math.max(0.001, holdProgressRef.current / 100)
          doorPromptFillMeshRef.current.scale.set(1, p, 1)
          doorPromptFillMeshRef.current.position.y = 1.425 + 0.175 * p
          doorPromptFillMeshRef.current.visible = isNear
        }

        onDoorProximityRef.current(isNear, doorAngleDeg)

        const camDir = new THREE.Vector3()
        camera.getWorldDirection(camDir)

        let closestTarget: PhysicsItem | null = null
        let closestDist = 2.6

        const items = physicsItemsRef.current
        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i]
          const idx = item.x - playerPosRef.current.x
          const idz = item.z - playerPosRef.current.z
          const dist = Math.sqrt(idx * idx + idz * idz)

          if (dist < 0.5) {
            const pushAngle = Math.atan2(idz, idx)
            const kickSpeed = 4.2
            item.vx += Math.cos(pushAngle) * kickSpeed
            item.vz += Math.sin(pushAngle) * kickSpeed
            item.vy = 1.2
            item.vRotX = (Math.random() - 0.5) * 14
            item.vRotZ = (Math.random() - 0.5) * 14
          }

          item.x += item.vx * dt
          item.z += item.vz * dt
          item.y += item.vy * dt

          const terrainFloor = getTerrainHeight(item.x, item.z) + 0.08
          if (item.y <= terrainFloor) {
            item.y = terrainFloor
            item.vy = 0
            item.vx *= 0.88
            item.vz *= 0.88
            item.vRotX *= 0.9
            item.vRotZ *= 0.9
          } else {
            item.vy -= 9.8 * dt
          }

          item.rotX += item.vRotX * dt
          item.rotZ += item.vRotZ * dt

          item.mesh.position.set(item.x, item.y, item.z)
          item.mesh.rotation.set(item.rotX, 0, item.rotZ)

          const toItem = new THREE.Vector3(item.x - camera.position.x, item.y - camera.position.y, item.z - camera.position.z)
          const dist3D = toItem.length()
          if (dist3D < closestDist) {
            toItem.normalize()
            const dot = camDir.dot(toItem)
            if (dot > 0.96) {
              closestDist = dist3D
              closestTarget = item
            }
          }
        }

        if (closestTarget !== targetedItemRef.current) {
          targetedItemRef.current = closestTarget
          onTargetItemChangeRef.current(closestTarget !== null)
        }

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
      doorFaceMat.dispose()
      handleGeo.dispose()
      handleMat.dispose()
      promptFrameGeo.dispose()
      promptFrameMat.dispose()
      promptFillGeo.dispose()
      promptFillMat.dispose()
      mirageGeo.dispose()
      mirageMat.dispose()
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
