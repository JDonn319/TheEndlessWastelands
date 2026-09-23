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
        fontFamily: 'monospace',
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
            fontSize: '11px',
            color: '#facc15',
            letterSpacing: '2px',
            textShadow: '0 0 8px rgba(250, 204, 21, 0.6)',
          }}
        >
          {playerName}
        </div>

        <button
          onClick={onTogglePause}
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'rgba(15, 12, 4, 0.75)',
            border: '1px solid #facc15',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#facc15',
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(250, 204, 21, 0.25)',
          }}
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
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
            fontSize: '15px',
            letterSpacing: '2px',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.75), 0 2px 4px #000000',
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
            backgroundColor: 'rgba(5, 4, 2, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              padding: '24px 40px',
              backgroundColor: 'rgba(15, 12, 4, 0.9)',
              border: '1px solid #facc15',
              boxShadow: '0 0 20px rgba(250, 204, 21, 0.3)',
              color: '#facc15',
              fontSize: '16px',
              letterSpacing: '4px',
            }}
          >
            ПАУЗА
          </div>
        </div>
      )}
    </div>
  )
}
