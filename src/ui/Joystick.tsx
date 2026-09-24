import React, { useState, useRef } from 'react'

interface JoystickProps {
  onMove: (vector: { x: number; y: number }) => void
}

export const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const [active, setActive] = useState(false)
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 })
  const touchIdRef = useRef<number | null>(null)
  const baseCenterRef = useRef({ x: 0, y: 0 })
  const radius = 45

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
    updatePosition(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === touchIdRef.current) {
        updatePosition(touch.clientX, touch.clientY)
        break
      }
    }
  }

  const updatePosition = (clientX: number, clientY: number) => {
    const dx = clientX - baseCenterRef.current.x
    const dy = clientY - baseCenterRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const clampedDist = Math.min(distance, radius)
    const angle = Math.atan2(dy, dx)
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
        bottom: '24px',
        right: '28px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: 'rgba(14, 11, 6, 0.55)',
        border: '1px solid rgba(234, 179, 8, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        touchAction: 'none',
        zIndex: 55,
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: active ? '#facc15' : 'rgba(234, 179, 8, 0.45)',
          border: '1px solid #facc15',
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: active ? 'none' : 'transform 0.15s ease-out',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
