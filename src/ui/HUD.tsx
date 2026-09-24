import React, { useRef } from 'react'
import { Pause } from 'lucide-react'
import { Compass } from './Compass'
import { Joystick } from './Joystick'

interface HUDProps {
  yaw: number
  subtitle: string | null
  playerName: string
  onOpenPause: () => void
  onMove: (vector: { x: number; y: number }) => void
  onLookDelta: (delta: { x: number; y: number }) => void
}

export const HUD: React.FC<HUDProps> = ({
  yaw,
  subtitle,
  playerName,
  onOpenPause,
  onMove,
  onLookDelta,
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
      <Compass yaw={yaw} />

      <div
        style={{
          position: 'fixed',
          top: '12px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'auto',
          zIndex: 60,
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'rgba(234, 179, 8, 0.8)',
            letterSpacing: '2px',
          }}
        >
          {playerName}
        </div>

        <button
          onClick={onOpenPause}
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#0a0803',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            color: '#eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Pause size={15} />
        </button>
      </div>

      <Joystick onMove={onMove} />

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

      {subtitle && (
        <div
          style={{
            position: 'fixed',
            bottom: '36px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '2px',
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
