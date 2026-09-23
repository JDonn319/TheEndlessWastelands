import React, { useState } from 'react'

interface NameModalProps {
  onSubmit: (name: string) => void
}

const RANDOM_NAMES = ['NOMAD', 'ASH', 'ECHO', 'ROOK', 'GHOST', 'DUST', 'VALE']

export const NameModal: React.FC<NameModalProps> = ({ onSubmit }) => {
  const [value, setValue] = useState('')
  const [isPressed, setIsPressed] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 8)
    setValue(raw.toUpperCase())
  }

  const handleConfirm = () => {
    if (value.trim().length > 0) {
      onSubmit(value.trim())
    } else {
      const picked = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]
      onSubmit(picked)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
      }}
    >
      <div
        style={{
          width: '360px',
          backgroundColor: '#0a0803',
          border: '1px solid rgba(234, 179, 8, 0.35)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(234, 179, 8, 0.03) 3px, rgba(234, 179, 8, 0.03) 4px)',
        }}
      >
        <div
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#eab308',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '5px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
            paddingBottom: '12px',
          }}
        >
          И Д Е Н Т И Ф И К А Ц И Я
        </div>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="ПОЗЫВНОЙ"
          maxLength={8}
          autoFocus
          style={{
            width: '100%',
            height: '42px',
            backgroundColor: '#000000',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            outline: 'none',
            color: '#eab308',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '15px',
            fontWeight: 700,
            textAlign: 'center',
            letterSpacing: '5px',
          }}
        />

        <button
          onClick={handleConfirm}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => {
            setIsPressed(false)
            handleConfirm()
          }}
          style={{
            height: '42px',
            backgroundColor: isPressed ? '#eab308' : '#080602',
            border: isPressed ? '1px solid #eab308' : '1px solid rgba(234, 179, 8, 0.35)',
            color: isPressed ? '#000000' : '#eab308',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.1s ease, color 0.1s ease',
          }}
        >
          П О Д Т В Е Р Д И Т Ь
        </button>
      </div>
    </div>
  )
}
