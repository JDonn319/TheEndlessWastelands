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
        backgroundColor: 'rgba(4, 3, 2, 0.85)',
      }}
    >
      <div
        style={{
          width: '380px',
          backgroundColor: 'rgba(10, 8, 3, 0.95)',
          border: '1px solid rgba(234, 179, 8, 0.5)',
          boxShadow: '0 0 35px rgba(234, 179, 8, 0.25), inset 0 0 20px rgba(234, 179, 8, 0.08)',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(234, 179, 8, 0.03) 2px, rgba(234, 179, 8, 0.03) 4px)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          color: '#eab308',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            letterSpacing: '5px',
            fontWeight: 700,
            textAlign: 'center',
            borderBottom: '1px solid rgba(234, 179, 8, 0.25)',
            paddingBottom: '12px',
            textShadow: '0 0 10px rgba(250, 204, 21, 0.6)',
          }}
        >
          И Д Е Н Т И Ф И К А Ц И Я
        </div>

        <div
          style={{
            fontSize: '11px',
            opacity: 0.75,
            textAlign: 'center',
            lineHeight: 1.5,
            letterSpacing: '1px',
          }}
        >
          ВВЕДИТЕ ПОЗЫВНОЙ (ДО 8 ЛАТИНСКИХ БУКВ)
        </div>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="ПОЗЫВНОЙ..."
          maxLength={8}
          autoFocus
          style={{
            width: '100%',
            height: '42px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(234, 179, 8, 0.5)',
            outline: 'none',
            color: '#facc15',
            fontFamily: 'monospace',
            fontSize: '16px',
            fontWeight: 700,
            textAlign: 'center',
            letterSpacing: '6px',
            boxShadow: 'inset 0 0 10px rgba(234, 179, 8, 0.2)',
          }}
        />

        <button
          onClick={handleConfirm}
          style={{
            height: '44px',
            backgroundColor: 'rgba(234, 179, 8, 0.12)',
            border: '1px solid #facc15',
            color: '#facc15',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '6px',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(250, 204, 21, 0.25)',
            textTransform: 'uppercase',
          }}
        >
          П О Д Т В Е Р Д И Т Ь
        </button>
      </div>
    </div>
  )
}
