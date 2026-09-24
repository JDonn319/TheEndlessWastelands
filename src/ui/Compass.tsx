import React from 'react'

interface CompassProps {
  yaw: number
  doorAngle: number | null
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

export const Compass: React.FC<CompassProps> = ({ yaw, doorAngle }) => {
  const currentHeadingDeg = (((-yaw * 180) / Math.PI) % 360 + 360) % 360

  return (
    <div
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        height: '26px',
        backgroundColor: 'rgba(10, 8, 4, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '2px',
        overflow: 'hidden',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          let diff = m.angle - currentHeadingDeg
          if (diff < -180) diff += 360
          if (diff > 180) diff -= 360

          const pixelOffset = diff * 2.1
          if (Math.abs(pixelOffset) > 145) return null

          return (
            <div
              key={m.label}
              style={{
                position: 'absolute',
                left: `calc(50% + ${pixelOffset}px)`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#ffffff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '10px',
                fontWeight: 700,
                opacity: 1 - Math.abs(pixelOffset) / 150,
                whiteSpace: 'nowrap',
              }}
            >
              {m.label}
            </div>
          )
        })}

        {doorAngle !== null && (() => {
          let diff = doorAngle - currentHeadingDeg
          if (diff < -180) diff += 360
          if (diff > 180) diff -= 360
          const pixelOffset = diff * 2.1
          if (Math.abs(pixelOffset) > 145) return null

          return (
            <div
              key="doorMarker"
              style={{
                position: 'absolute',
                left: `calc(50% + ${pixelOffset}px)`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#ef4444',
                fontSize: '14px',
                textShadow: '0 0 6px #ef4444',
                whiteSpace: 'nowrap',
              }}
            >
              ◆
            </div>
          )
        })()}
      </div>
    </div>
  )
}
