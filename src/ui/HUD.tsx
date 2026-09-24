import React, { useRef, useState, useEffect } from 'react'
import { Pause, Flame, Droplet, Utensils } from 'lucide-react'
import { Compass } from './Compass'
import { Joystick } from './Joystick'

interface HUDProps {
  yaw: number
  doorAngle: number | null
  subtitle: string | null
  playerName: string
  stamina: number
  thirst: number
  hunger: number
  isNearDoor: boolean
  onCompleteInteraction: () => void
  onOpenPause: () => void
  onMove: (vector: { x: number; y: number }) => void
  onLookDelta: (delta: { x: number; y: number }) => void
  onSprintStart: () => void
  onSprintEnd: () => void
}

export const HUD: React.FC<HUDProps> = ({
  yaw,
  doorAngle,
  subtitle,
  playerName,
  stamina,
  thirst,
  hunger,
  isNearDoor,
  onCompleteInteraction,
  onOpenPause,
  onMove,
  onLookDelta,
  onSprintStart,
  onSprintEnd,
}) => {
  const lookTouchIdRef = useRef<number | null>(null)
  const lastTouchRef = useRef({ x: 0, y: 0 })

  const [holdProgress, setHoldProgress] = useState(0)
  const isHoldingRef = useRef(false)

  useEffect(() => {
    let timer: number
    if (isHoldingRef.current) {
      timer = window.setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer)
            isHoldingRef.current = false
            onCompleteInteraction()
            return 0
          }
          return prev + 6.6
        })
      }, 100)
    }
    return () => clearInterval(timer)
  }, [onCompleteInteraction])

  const handleInteractStart = () => {
    if (!isNearDoor) return
    isHoldingRef.current = true
    setHoldProgress(0)
  }

  const handleInteractEnd = () => {
    isHoldingRef.current = false
    setHoldProgress(0)
  }

  const handleTouchLookStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchIdRef.current !== null) return
    const touch = e.changedTouches[0]
    lookTouchIdRef.current = touch.identifier
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchLookMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === lookTouchIdRef.current) {
        const dx = touch.clientX - lastTouchRef.current.x
        const dy = touch.clientY - lastTouchRef.current.y
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY }
        onLookDelta({ x: dx, y: dy })
        break
      }
    }
  }

  const handleTouchLookEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null
        break
      }
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      <Compass yaw={yaw} doorAngle={doorAngle} />

      <div
        style={{
          position: 'fixed',
          top: '14px',
          right: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'auto',
          zIndex: 70,
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#eab308',
            letterSpacing: '2px',
          }}
        >
          {playerName}
        </div>

        <button
          onClick={onOpenPause}
          style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#120d06',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            color: '#eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Pause size={16} />
        </button>
      </div>

      <Joystick onMove={onMove} />

      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
          zIndex: 60,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Droplet size={14} color="#38bdf8" />
          <div
            style={{
              width: '90px',
              height: '4px',
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${thirst}%`,
                backgroundColor: '#38bdf8',
                transition: 'width 0.2s linear',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Utensils size={14} color="#f59e0b" />
          <div
            style={{
              width: '90px',
              height: '4px',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${hunger}%`,
                backgroundColor: '#f59e0b',
                transition: 'width 0.2s linear',
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          pointerEvents: 'auto',
          zIndex: 65,
        }}
      >
        {isNearDoor && (
          <div
            onTouchStart={handleInteractStart}
            onTouchEnd={handleInteractEnd}
            onMouseDown={handleInteractStart}
            onMouseUp={handleInteractEnd}
            style={{
              position: 'relative',
              width: '56px',
              height: '56px',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 12, 6, 0.75)',
              border: '2px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(239, 68, 68, 0.4)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: `${holdProgress}%`,
                backgroundColor: 'rgba(239, 68, 68, 0.65)',
                transition: 'height 0.1s linear',
              }}
            />
            <span
              style={{
                position: 'relative',
                zIndex: 2,
                color: '#ffffff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '18px',
                fontWeight: 900,
              }}
            >
              E
            </span>
          </div>
        )}

        <button
          onTouchStart={onSprintStart}
          onTouchEnd={onSprintEnd}
          onMouseDown={onSprintStart}
          onMouseUp={onSprintEnd}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: stamina > 5 ? 'rgba(20, 15, 6, 0.75)' : 'rgba(30, 10, 10, 0.75)',
            border: stamina > 5 ? '1.5px solid rgba(234, 179, 8, 0.6)' : '1.5px solid rgba(200, 50, 50, 0.5)',
            color: stamina > 5 ? '#facc15' : '#888888',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'none',
            cursor: 'pointer',
          }}
        >
          <Flame size={24} />
        </button>
      </div>

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '55vw',
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
        onTouchStart={handleTouchLookStart}
        onTouchMove={handleTouchLookMove}
        onTouchEnd={handleTouchLookEnd}
        onTouchCancel={handleTouchLookEnd}
      />

      <div
        style={{
          position: 'fixed',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '180px',
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
          borderRadius: '1px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${stamina}%`,
            backgroundColor: '#ffffff',
            transition: 'width 0.1s linear',
          }}
        />
      </div>

      {subtitle && (
        <div
          style={{
            position: 'fixed',
            bottom: '42px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '1px',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 70,
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  )
}
