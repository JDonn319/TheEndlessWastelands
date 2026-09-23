import React from 'react'
import { Pause, Play } from 'lucide-react'
import { Compass } from './Compass'

interface HUDProps {
  yaw: number
  subtitle: string | null
  isPaused: boolean
  onTogglePause: () => void
  playerName: string
  onTouchMoveStart: (e: React.TouchEvent) => void
  onTouchMoveMove: (e: React.TouchEvent) => void
  onTouchMoveEnd: () => void
  onTouchLookStart: (e: React.TouchEvent) => void
  onTouchLookMove: (e: React.TouchEvent) => void
  onTouchLookEnd: () => void
}

export const HUD: React.FC<HUDProps> = ({
  yaw,
  subtitle,
  isPaused,
  onTogglePause,
  playerName,
  onTouchMoveStart,
  onTouchMoveMove,
  onTouchMoveEnd,
  onTouchLookStart,
  onTouchLookMove,
  onTouchLookEnd,
}) => {
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
          onClick={onTogglePause}
          style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#0a0803',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#eab308',
            cursor: 'pointer',
          }}
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '50vw',
          height: '75vh',
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
        onTouchStart={onTouchMoveStart}
        onTouchMove={onTouchMoveMove}
        onTouchEnd={onTouchMoveEnd}
        onTouchCancel={onTouchMoveEnd}
      />

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '50vw',
          height: '75vh',
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
        onTouchStart={onTouchLookStart}
        onTouchMove={onTouchLookMove}
        onTouchEnd={onTouchLookEnd}
        onTouchCancel={onTouchLookEnd}
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

      {isPaused && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              padding: '20px 48px',
              backgroundColor: '#0a0803',
              border: '1px solid rgba(234, 179, 8, 0.5)',
              color: '#eab308',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '6px',
            }}
          >
            ПАУЗА
          </div>
        </div>
      )}
    </div>
  )
}
