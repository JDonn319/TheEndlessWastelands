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

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xd7a15c)
    scene.fog = new THREE.FogExp2(0xd7a15c, 0.015)

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 0.2, 0)
    camera.rotation.order = 'YXZ'

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    const hemiLight = new THREE.HemisphereLight(0xffecc4, 0xb87b38, 0.8)
    scene.add(hemiLight)

    const sunLight = new THREE.DirectionalLight(0xfff1cf, 1.4)
    sunLight.position.set(60, 40, -50)
    scene.add(sunLight)

    const geo = new THREE.PlaneGeometry(600, 600, 100, 100)
    geo.rotateX(-Math.PI / 2)

    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const dist = Math.sqrt(x * x + z * z)
      const duneNoise =
        Math.sin(x * 0.02 + z * 0.015) * 2.5 +
        Math.cos(z * 0.03 - x * 0.01) * 1.5
      const distantHills = Math.max(0, dist - 40) * 0.12 * Math.sin(x * 0.04)
      pos.setY(i, duneNoise + distantHills)
    }
    geo.computeVertexNormals()

    const mat = new THREE.MeshStandardMaterial({
      color: 0xc89650,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    })
    const terrain = new THREE.Mesh(geo, mat)
    scene.add(terrain)

    let yaw = 0
    let pitch = 0
    let introElapsed = 0
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
        introElapsed = (now - introStartTimeRef.current) / 1000

        const standT = Math.min(Math.max((introElapsed - 2.0) / 3.0, 0), 1)
        const currentH = 0.2 + standT * 1.5
        const shakeX = Math.sin(now * 0.004) * 0.02 * (1 - standT * 0.5)
        const shakeY = Math.cos(now * 0.007) * 0.015 * (1 - standT * 0.5)

        camera.position.set(0, currentH + shakeY, 0)
        camera.rotation.set(shakeX, yaw, 0)

        if (introElapsed >= 5.5 && !isIntroCompleteRef.current) {
          isIntroCompleteRef.current = true
          onIntroComplete()
        }
      } else if (phaseRef.current === 'playing' && !isPausedRef.current) {
        const look = lookRef.current
        yaw -= look.x * 0.004
        pitch -= look.y * 0.004
        pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch))
        camera.rotation.set(pitch, yaw, 0)
        onYawChange(yaw)

        const move = moveRef.current
        if (move.x !== 0 || move.y !== 0) {
          const speed = 4.5 * dt
          const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
          const side = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)

          playerX += (forward.x * move.y + side.x * move.x) * speed
          playerZ += (forward.z * move.y + side.z * move.x) * speed

          const bob = Math.sin(now * 0.008) * 0.04
          camera.position.set(playerX, 1.7 + bob, playerZ)
        } else {
          camera.position.set(playerX, 1.7, playerZ)
        }
      }

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
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
        filter: phase === 'naming' ? 'blur(10px)' : 'none',
        transition: 'filter 0.6s ease',
      }}
    />
  )
}
