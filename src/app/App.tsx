import React, { useState, useEffect, useRef } from 'react'
import { OrientationPrompt } from '../ui/OrientationPrompt'
import { LoadingScreen } from '../ui/LoadingScreen'
import { MainMenu } from '../ui/MainMenu'
import { NameModal } from '../ui/NameModal'
import { PauseModal } from '../ui/PauseModal'
import { ConsoleModal } from '../ui/ConsoleModal'
import { HUD } from '../ui/HUD'
import { DesertScene } from '../world/DesertScene'

export const App: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false)
  const [appState, setAppState] = useState<'loading' | 'menu' | 'game'>('loading')
  const [phase, setPhase] = useState<'intro' | 'naming' | 'playing'>('intro')
  const [subtitle, setSubtitle] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [isConsoleOpen, setIsConsoleOpen] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const [yaw, setYaw] = useState(0)

  const [stamina, setStamina] = useState(100)
  const [isSprinting, setIsSprinting] = useState(false)
  const [isNearDoor, setIsNearDoor] = useState(false)
  const [doorAngle, setDoorAngle] = useState<number | null>(null)
  const [isDoorMarked, setIsDoorMarked] = useState(false)

  const moveRef = useRef({ x: 0, y: 0 })
  const lookDeltaRef = useRef({ x: 0, y: 0 })
  const isSprintingRef = useRef(false)
  const doorAngleTempRef = useRef<number | null>(null)

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  useEffect(() => {
    const staminaTimer = setInterval(() => {
      const isMoving = moveRef.current.x !== 0 || moveRef.current.y !== 0
      setStamina((prev) => {
        if (isSprintingRef.current && isMoving) {
          const next = Math.max(0, prev - 1.2)
          if (next === 0) {
            isSprintingRef.current = false
            setIsSprinting(false)
          }
          return next
        } else {
          return Math.min(100, prev + 1.5)
        }
      })
    }, 100)
    return () => clearInterval(staminaTimer)
  }, [])

  const handleStartGame = () => {
    setIsFading(true)
    setTimeout(() => {
      setAppState('game')
      setPhase('intro')
      setIsFading(false)
      setTimeout(() => {
        setSubtitle('Игрок: где… где я..?')
      }, 2600)
    }, 600)
  }

  const handleExitToMenu = () => {
    setIsPaused(false)
    setIsConsoleOpen(false)
    setIsFading(true)
    setTimeout(() => {
      setAppState('menu')
      setIsFading(false)
    }, 500)
  }

  const handleInteractDoor = () => {
    setIsDoorMarked(true)
    if (doorAngleTempRef.current !== null) {
      setDoorAngle(doorAngleTempRef.current)
    }
    setSubtitle('Игрок: Красная дверь посреди пустоты... Заперто. Куда она ведет?')
    setTimeout(() => {
      setSubtitle(null)
    }, 4500)
  }

  const handleDoorProximity = (isNear: boolean, angleDeg: number) => {
    setIsNearDoor(isNear)
    doorAngleTempRef.current = angleDeg
    if (isDoorMarked) {
      setDoorAngle(angleDeg)
    }
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
          22% { opacity: 0; }
          38% { opacity: 0.95; }
          52% { opacity: 0.05; }
          68% { opacity: 0.85; }
          100% { opacity: 0; }
        }
      `}</style>

      {isPortrait && <OrientationPrompt />}

      {!isPortrait && appState === 'loading' && (
        <LoadingScreen onLoaded={() => setAppState('menu')} />
      )}

      {!isPortrait && appState === 'menu' && (
        <MainMenu onStartGame={handleStartGame} />
      )}

      {!isPortrait && appState === 'game' && (
        <>
          <DesertScene
            phase={phase}
            isPaused={isPaused}
            isSprinting={isSprinting}
            moveRef={moveRef}
            lookDeltaRef={lookDeltaRef}
            onYawChange={setYaw}
            onDoorProximity={handleDoorProximity}
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
                animation: 'introBlink 4.5s forwards ease-in-out',
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
            doorAngle={doorAngle}
            subtitle={subtitle}
            playerName={playerName}
            stamina={stamina}
            isNearDoor={isNearDoor}
            onInteractDoor={handleInteractDoor}
            onOpenPause={() => setIsPaused(true)}
            onMove={(vec) => {
              moveRef.current = vec
            }}
            onLookDelta={(delta) => {
              lookDeltaRef.current = {
                x: lookDeltaRef.current.x + delta.x,
                y: lookDeltaRef.current.y + delta.y,
              }
            }}
            onSprintStart={() => {
              if (stamina > 10) {
                isSprintingRef.current = true
                setIsSprinting(true)
              }
            }}
            onSprintEnd={() => {
              isSprintingRef.current = false
              setIsSprinting(false)
            }}
          />

          {isPaused && (
            <PauseModal
              onResume={() => setIsPaused(false)}
              onOpenConsole={() => setIsConsoleOpen(true)}
              onExitMenu={handleExitToMenu}
            />
          )}

          {isConsoleOpen && (
            <ConsoleModal onClose={() => setIsConsoleOpen(false)} />
          )}
        </>
      )}

      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000000',
          pointerEvents: 'none',
          zIndex: 900,
          opacity: isFading ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />
    </div>
  )
}
