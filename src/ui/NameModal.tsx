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
          width: '340px',
          backgroundColor: '#0e0b06',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#eab308',
            fontSize: '14px',
            fontWeight: 800,
            textAlign: 'center',
            borderBottom: '1px solid rgba(234, 179, 8, 0.25)',
            paddingBottom: '10px',
          }}
        >
          ИДЕНТИФИКАЦИЯ
        </div>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="ВВЕДИТЕ ИМЯ..."
          maxLength={8}
          autoFocus
          style={{
            width: '100%',
            height: '40px',
            backgroundColor: '#050402',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            outline: 'none',
            color: '#facc15',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            textAlign: 'center',
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
            height: '38px',
            backgroundColor: isPressed ? '#facc15' : '#191309',
            border: isPressed ? '1px solid #facc15' : '1px solid rgba(234, 179, 8, 0.4)',
            color: isPressed ? '#000000' : '#eab308',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          ПРИМЕНИТЬ
        </button>
      </div>
    </div>
  )
}
