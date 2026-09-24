import React, { useState, useRef } from 'react'

interface JoystickProps {
  onMove: (vector: { x: number; y: number }) => void
}

export const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const [active, setActive] = useState(false)
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 })
  const touchIdRef = useRef<number | null>(null)
  const baseCenterRef = useRef({ x: 0, y: 0 })
  const radius = 46

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return
    const touch = e.changedTouches[0]
    touchIdRef.current = touch.identifier
    const rect = e.currentTarget.getBoundingClientRect()
    baseCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    setActive(true)
    updateKnob(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY)
        break
      }
    }
  }

  const updateKnob = (clientX: number, clientY: number) => {
    const dx = clientX - baseCenterRef.current.x
    const dy = clientY - baseCenterRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)
    const clampedDist = Math.min(dist, radius)

    const x = Math.cos(angle) * clampedDist
    const y = Math.sin(angle) * clampedDist

    setKnobPos({ x, y })
    onMove({
      x: x / radius,
      y: -(y / radius),
    })
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null
        setActive(false)
        setKnobPos({ x: 0, y: 0 })
        onMove({ x: 0, y: 0 })
        break
      }
    }
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '28px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: 'rgba(12, 9, 4, 0.65)',
        border: '1.5px solid rgba(234, 179, 8, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        touchAction: 'none',
        zIndex: 60,
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: active ? '#facc15' : 'rgba(234, 179, 8, 0.45)',
          border: '1.5px solid #facc15',
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: active ? 'none' : 'transform 0.12s ease-out',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
