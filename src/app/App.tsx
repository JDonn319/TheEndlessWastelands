import React, { useState, useEffect, useRef } from 'react'
import { OrientationPrompt } from '../ui/OrientationPrompt'
import { LoadingScreen } from '../ui/LoadingScreen'
import { MainMenu } from '../ui/MainMenu'
import { NameModal } from '../ui/NameModal'
import { PauseModal } from '../ui/PauseModal'
import { ConsoleModal } from '../ui/ConsoleModal'
import { HUD } from '../ui/HUD'
import { InventoryModal, InventoryItem } from '../ui/InventoryModal'
import { DesertScene } from '../world/DesertScene'

export const App: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false)
  const [appState, setAppState] = useState<'loading' | 'menu' | 'game'>('loading')
  const [phase, setPhase] = useState<'intro' | 'naming' | 'playing'>('intro')
  const [subtitle, setSubtitle] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [isConsoleOpen, setIsConsoleOpen] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const [yaw, setYaw] = useState(0)

  const [stamina, setStamina] = useState(100)
  const [isSprinting, setIsSprinting] = useState(false)
  const [thirst, setThirst] = useState(100)
  const [hunger, setHunger] = useState(100)

  const [isNearDoor, setIsNearDoor] = useState(false)
  const [doorAngle, setDoorAngle] = useState<number | null>(null)
  const [teleportTrigger, setTeleportTrigger] = useState(0)
  const [holdProgress, setHoldProgress] = useState(0)

  const [hasTargetedItem, setHasTargetedItem] = useState(false)
  const [pickupTrigger, setPickupTrigger] = useState(0)
  const [consumeTrigger, setConsumeTrigger] = useState(0)
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)

  const [inventorySlots, setInventorySlots] = useState<(InventoryItem | null)[]>(
    new Array(13).fill(null)
  )

  const moveRef = useRef({ x: 0, y: 0 })
  const lookDeltaRef = useRef({ x: 0, y: 0 })
  const isSprintingRef = useRef(false)

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  useEffect(() => {
    const survivalTimer = setInterval(() => {
      if (appState !== 'game' || phase !== 'playing' || isPaused) return
      setThirst((prev) => Math.max(0, +(prev - 0.25).toFixed(1)))
      setHunger((prev) => Math.max(0, +(prev - 0.15).toFixed(1)))
    }, 1000)
    return () => clearInterval(survivalTimer)
  }, [appState, phase, isPaused])

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
    setIsInventoryOpen(false)
    setIsFading(true)
    setTimeout(() => {
      setAppState('menu')
      setIsFading(false)
    }, 500)
  }

  const handleCompleteInteraction = () => {
    const name = playerName || 'Игрок'
    setSubtitle(`${name}: Заперто. Похоже, надо найти что-то наподобие ключа.`)
    setTimeout(() => {
      setSubtitle(null)
    }, 4500)
  }

  const handleDoorProximity = (isNear: boolean, angleDeg: number) => {
    setIsNearDoor(isNear)
    setDoorAngle(angleDeg)
  }

  const handleTeleportToDoor = () => {
    setTeleportTrigger((prev) => prev + 1)
  }

  const handleCollectItem = (item: InventoryItem) => {
    setInventorySlots((prev) => {
      const next = [...prev]
      const totalWeight = next.reduce((acc, it) => (it ? acc + it.weight * it.count : acc), 0)
      if (totalWeight + item.weight > 20) return prev

      const stackIndex = next.findIndex(
        (it) => it && it.type === item.type && it.count < 8
      )
      if (stackIndex !== -1) {
        next[stackIndex] = {
          ...next[stackIndex]!,
          count: next[stackIndex]!.count + 1,
        }
        return next
      }

      const emptyIndex = next.findIndex((it) => it === null)
      if (emptyIndex !== -1) {
        next[emptyIndex] = { ...item, count: 1 }
        return next
      }

      return prev
    })
  }

  const handlePickupTargetedItem = () => {
    setPickupTrigger((prev) => prev + 1)
  }

  const handleUseEquippedItem = () => {
    if (selectedSlotIndex === null) return
    const item = inventorySlots[selectedSlotIndex]
    if (!item) return

    setConsumeTrigger((prev) => prev + 1)

    setTimeout(() => {
      if (item.type === 'drink') {
        setThirst((prev) => Math.min(100, +(prev + 30).toFixed(1)))
      } else {
        setHunger((prev) => Math.min(100, +(prev + 30).toFixed(1)))
      }

      setInventorySlots((prev) => {
        const next = [...prev]
        const current = next[selectedSlotIndex]
        if (!current) return prev
        if (current.count > 1) {
          next[selectedSlotIndex] = { ...current, count: current.count - 1 }
        } else {
          next[selectedSlotIndex] = null
          setSelectedSlotIndex(null)
        }
        return next
      })
    }, 400)
  }

  const equippedItem = selectedSlotIndex !== null ? inventorySlots[selectedSlotIndex] : null

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
        @keyframes heatDistortion {
          0%, 100% { transform: scale(1) skewX(0deg); }
          50% { transform: scale(1.015) skewX(0.4deg); }
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            animation: thirst < 30 ? 'heatDistortion 4s infinite ease-in-out' : 'none',
          }}
        >
          <DesertScene
            phase={phase}
            isPaused={isPaused}
            isSprinting={isSprinting}
            hunger={hunger}
            holdProgress={holdProgress}
            equippedItem={equippedItem}
            consumeTrigger={consumeTrigger}
            pickupTrigger={pickupTrigger}
            moveRef={moveRef}
            lookDeltaRef={lookDeltaRef}
            teleportTrigger={teleportTrigger}
            onTargetItemChange={setHasTargetedItem}
            onItemCollected={handleCollectItem}
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
            thirst={thirst}
            hunger={hunger}
            isNearDoor={isNearDoor}
            hasTargetedItem={hasTargetedItem}
            quickSlots={inventorySlots.slice(0, 4)}
            selectedSlotIndex={selectedSlotIndex !== null && selectedSlotIndex < 4 ? selectedSlotIndex : null}
            onSelectQuickSlot={(idx) => setSelectedSlotIndex(selectedSlotIndex === idx ? null : idx)}
            onPickupTargetedItem={handlePickupTargetedItem}
            onUseEquippedItem={handleUseEquippedItem}
            onOpenInventory={() => setIsInventoryOpen(true)}
            onHoldProgressChange={setHoldProgress}
            onCompleteInteraction={handleCompleteInteraction}
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

          {isInventoryOpen && (
            <InventoryModal
              slots={inventorySlots}
              selectedSlotIndex={selectedSlotIndex}
              onSelectSlot={(idx) => setSelectedSlotIndex(selectedSlotIndex === idx ? null : idx)}
              onUpdateSlots={setInventorySlots}
              onClose={() => setIsInventoryOpen(false)}
            />
          )}

          {isPaused && (
            <PauseModal
              onResume={() => setIsPaused(false)}
              onOpenConsole={() => setIsConsoleOpen(true)}
              onExitMenu={handleExitToMenu}
            />
          )}

          {isConsoleOpen && (
            <ConsoleModal
              onClose={() => setIsConsoleOpen(false)}
              onTeleportToDoor={handleTeleportToDoor}
            />
          )}
        </div>
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
