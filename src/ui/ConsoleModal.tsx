import React, { useState } from 'react'

interface ConsoleModalProps {
  onClose: () => void
}

export const ConsoleModal: React.FC<ConsoleModalProps> = ({ onClose }) => {
  const [cmd, setCmd] = useState('')
  const [isPressed, setIsPressed] = useState(false)

  const handleApply = () => {
    setCmd('')
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '360px',
          backgroundColor: '#0d0a05',
          border: '1px solid rgba(234, 179, 8, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
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
          }}
        >
          ВВЕДИТЕ КОД
        </div>

        <input
          type="text"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          placeholder="ВВОД..."
          style={{
            width: '100%',
            height: '40px',
            backgroundColor: '#050402',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            color: '#facc15',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            textAlign: 'center',
            outline: 'none',
          }}
        />

        <button
          onClick={handleApply}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => {
            setIsPressed(false)
            handleApply()
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
