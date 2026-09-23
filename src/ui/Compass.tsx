import React from 'react'

interface CompassProps {
  yaw: number
}

const MARKERS = [
  { label: 'С', angle: 0 },
  { label: 'СВ', angle: 45 },
  { label: 'В', angle: 90 },
  { label: 'ЮВ', angle: 135 },
  { label: 'Ю', angle: 180 },
  { label: 'ЮЗ', angle: 225 },
  { label: 'З', angle: 270 },
  { label: 'СЗ', angle: 315 },
]

export const Compass: React.FC<CompassProps> = ({ yaw }) => {
  const deg = (((yaw * 180) / Math.PI) % 360 + 360) % 360

  return (
    <div
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '280px',
        height: '28px',
        backgroundColor: 'rgba(10, 8, 3, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.35)',
        borderRadius: '2px',
        overflow: 'hidden',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '2px',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 6px #ffffff',
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {MARKERS.map((m) => {
          let diff = m.angle - deg
          if (diff < -180) diff += 360
          if (diff > 180) diff -= 360

          const pixelOffset = diff * 2.2

          if (Math.abs(pixelOffset) > 135) return null

          return (
            <div
              key={m.label}
              style={{
                position: 'absolute',
                left: `calc(50% + ${pixelOffset}px)`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#ffffff',
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '1px',
                opacity: 1 - Math.abs(pixelOffset) / 140,
                whiteSpace: 'nowrap',
              }}
            >
              {m.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
