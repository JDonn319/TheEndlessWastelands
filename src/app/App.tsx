import React, { useState, useEffect } from 'react'
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

  const [moveVec, setMoveVec] = useState({ x: 0, y: 0 })
  const [lookDelta, setLookDelta] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
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
            subtitle={subtitle}
            playerName={playerName}
            onOpenPause={() => setIsPaused(true)}
            onMove={setMoveVec}
            onLookDelta={(delta) => setLookDelta(delta)}
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
