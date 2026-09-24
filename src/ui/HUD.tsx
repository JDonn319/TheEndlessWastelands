import React, { useRef } from 'react'
import { Pause, Flame } from 'lucide-react'
import { Compass } from './Compass'
import { Joystick } from './Joystick'

interface HUDProps {
  yaw: number
  doorAngle: number | null
  subtitle: string | null
  playerName: string
  stamina: number
  isNearDoor: boolean
  onInteractDoor: () => void
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
  isNearDoor,
  onInteractDoor,
  onOpenPause,
  onMove,
  onLookDelta,
  onSprintStart,
  onSprintEnd,
}) => {
  const lookTouchIdRef = useRef<number | null>(null)
  const lastTouchRef = useRef({ x: 0, y: 0 })

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

      <button
        onTouchStart={onSprintStart}
        onTouchEnd={onSprintEnd}
        onMouseDown={onSprintStart}
        onMouseUp={onSprintEnd}
        style={{
          position: 'fixed',
          bottom: '160px',
          left: '52px',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: stamina > 5 ? 'rgba(20, 15, 6, 0.65)' : 'rgba(30, 10, 10, 0.65)',
          border: stamina > 5 ? '1.5px solid rgba(234, 179, 8, 0.5)' : '1.5px solid rgba(200, 50, 50, 0.5)',
          color: stamina > 5 ? '#facc15' : '#888888',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          touchAction: 'none',
          zIndex: 60,
          cursor: 'pointer',
        }}
      >
        <Flame size={22} />
      </button>

      {isNearDoor && (
        <button
          onClick={onInteractDoor}
          style={{
            position: 'fixed',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            height: '40px',
            padding: '0 24px',
            backgroundColor: '#141008',
            border: '1px solid #ef4444',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            pointerEvents: 'auto',
            cursor: 'pointer',
            zIndex: 65,
          }}
        >
          ОСМОТРЕТЬ ДВЕРЬ
        </button>
      )}

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
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
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
