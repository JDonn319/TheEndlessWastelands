import React, { useState, useEffect, useRef } from 'react'
import { OrientationPrompt } from '../ui/OrientationPrompt'
import { LoadingScreen } from '../ui/LoadingScreen'
import { NameModal } from '../ui/NameModal'
import { HUD } from '../ui/HUD'
import { DesertScene } from '../world/DesertScene'

export const App: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [phase, setPhase] = useState<'intro' | 'naming' | 'playing'>('intro')
  const [subtitle, setSubtitle] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [yaw, setYaw] = useState(0)

  const [moveVec, setMoveVec] = useState({ x: 0, y: 0 })
  const [lookDelta, setLookDelta] = useState({ x: 0, y: 0 })

  const moveTouchRef = useRef<{ id: number; startX: number; startY: number } | null>(null)
  const lookTouchRef = useRef<{ id: number; lastX: number; lastY: number } | null>(null)

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  useEffect(() => {
    if (!isLoading && phase === 'intro') {
      const subTimer = setTimeout(() => {
        setSubtitle('Игрок: где… где я..?')
      }, 2600)
      return () => clearTimeout(subTimer)
    }
  }, [isLoading, phase])

  const handleTouchMoveStart = (e: React.TouchEvent) => {
    if (moveTouchRef.current) return
    const touch = e.changedTouches[0]
    moveTouchRef.current = { id: touch.identifier, startX: touch.clientX, startY: touch.clientY }
  }

  const handleTouchMoveMove = (e: React.TouchEvent) => {
    if (!moveTouchRef.current) return
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === moveTouchRef.current.id) {
        const dx = touch.clientX - moveTouchRef.current.startX
        const dy = touch.clientY - moveTouchRef.current.startY
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 40)
        const angle = Math.atan2(dy, dx)
        setMoveVec({
          x: (Math.cos(angle) * dist) / 40,
          y: (-Math.sin(angle) * dist) / 40,
        })
      }
    }
  }

  const handleTouchMoveEnd = () => {
    moveTouchRef.current = null
    setMoveVec({ x: 0, y: 0 })
  }

  const handleTouchLookStart = (e: React.TouchEvent) => {
    if (lookTouchRef.current) return
    const touch = e.changedTouches[0]
    lookTouchRef.current = { id: touch.identifier, lastX: touch.clientX, lastY: touch.clientY }
  }

  const handleTouchLookMove = (e: React.TouchEvent) => {
    if (!lookTouchRef.current) return
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === lookTouchRef.current.id) {
        const dx = touch.clientX - lookTouchRef.current.lastX
        const dy = touch.clientY - lookTouchRef.current.lastY
        lookTouchRef.current.lastX = touch.clientX
        lookTouchRef.current.lastY = touch.clientY
        setLookDelta({ x: dx, y: dy })
      }
    }
  }

  const handleTouchLookEnd = () => {
    lookTouchRef.current = null
    setLookDelta({ x: 0, y: 0 })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes introBlink {
          0% { opacity: 1; }
          20% { opacity: 0; }
          35% { opacity: 0.9; }
          50% { opacity: 0.1; }
          65% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>

      {isPortrait && <OrientationPrompt />}

      {!isPortrait && isLoading && (
        <LoadingScreen onLoaded={() => setIsLoading(false)} />
      )}

      {!isLoading && (
        <>
          <DesertScene
            phase={phase}
            isPaused={isPaused}
            moveVector={moveVec}
            lookDelta={lookDelta}
            onYawChange={setYaw}
            onIntroComplete={() => {
              setSubtitle(null)
              setPhase('naming')
            }}
          />

          {phase === 'intro' && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: '#000000',
                pointerEvents: 'none',
                zIndex: 30,
                animation: 'introBlink 4s forwards ease-in-out',
              }}
            />
          )}

          {phase === 'naming' && (
            <NameModal
              onSubmit={(name) => {
                setPlayerName(name)
                setPhase('playing')
              }}
            />
          )}

          <HUD
            yaw={yaw}
            subtitle={subtitle}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            playerName={playerName}
            onTouchMoveStart={handleTouchMoveStart}
            onTouchMoveMove={handleTouchMoveMove}
            onTouchMoveEnd={handleTouchMoveEnd}
            onTouchLookStart={handleTouchLookStart}
            onTouchLookMove={handleTouchLookMove}
            onTouchLookEnd={handleTouchLookEnd}
          />
        </>
      )}
    </div>
  )
}
