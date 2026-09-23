import React, { useState } from 'react'

interface NameModalProps {
  onSubmit: (name: string) => void
}

const RANDOM_NAMES = ['NOMAD', 'ASH', 'ECHO', 'ROOK', 'GHOST', 'DUST', 'VALE']

export const NameModal: React.FC<NameModalProps> = ({ onSubmit }) => {
  const [value, setValue] = useState('')

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
        backgroundColor: 'rgba(5, 4, 2, 0.75)',
      }}
    >
      <div
        style={{
          width: '340px',
          backgroundColor: 'rgba(15, 12, 4, 0.92)',
          border: '1px solid #facc15',
          boxShadow: '0 0 25px rgba(250, 204, 21, 0.3), inset 0 0 15px rgba(250, 204, 21, 0.1)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          color: '#facc15',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            letterSpacing: '3px',
            textAlign: 'center',
            borderBottom: '1px dashed rgba(250, 204, 21, 0.4)',
            paddingBottom: '10px',
            textShadow: '0 0 8px rgba(250, 204, 21, 0.6)',
          }}
        >
          ИДЕНТИФИКАЦИЯ
        </div>

        <div style={{ fontSize: '11px', opacity: 0.8, textAlign: 'center', lineHeight: 1.4 }}>
          Введите имя (до 8 латинских букв). Пустое поле выдаст случайный позывной.
        </div>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="NAME..."
          maxLength={8}
          autoFocus
          style={{
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(250, 204, 21, 0.6)',
            outline: 'none',
            color: '#facc15',
            fontFamily: 'monospace',
            fontSize: '18px',
            textAlign: 'center',
            padding: '10px 0',
            letterSpacing: '4px',
            boxShadow: 'inset 0 0 10px rgba(250, 204, 21, 0.2)',
          }}
        />

        <button
          onClick={handleConfirm}
          style={{
            backgroundColor: 'rgba(250, 204, 21, 0.15)',
            border: '1px solid #facc15',
            color: '#facc15',
            fontFamily: 'monospace',
            fontSize: '13px',
            letterSpacing: '2px',
            padding: '12px 0',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(250, 204, 21, 0.2)',
            textTransform: 'uppercase',
          }}
        >
          ПОДТВЕРДИТЬ
        </button>
      </div>
    </div>
  )
}
