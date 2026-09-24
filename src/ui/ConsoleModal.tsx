import React, { useState } from 'react'

interface ConsoleModalProps {
  onClose: () => void
  onTeleportToDoor: () => void
}

export const ConsoleModal: React.FC<ConsoleModalProps> = ({ onClose, onTeleportToDoor }) => {
  const [cmd, setCmd] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleApply = () => {
    const cleanCmd = cmd.trim().toLowerCase()
    if (cleanCmd === 'jjkol19') {
      setErrorMsg('')
      setCmd('')
      onTeleportToDoor()
      onClose()
    } else {
      setErrorMsg('НЕВЕРНЫЙ КОД')
    }
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
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: '#eab308',
              fontSize: '14px',
              fontWeight: 800,
            }}
          >
            ВВЕДИТЕ КОД
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#eab308',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              color: '#ef4444',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '12px',
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            {errorMsg}
          </div>
        )}

        <input
          type="text"
          value={cmd}
          onChange={(e) => {
            setCmd(e.target.value)
            if (errorMsg) setErrorMsg('')
          }}
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
          style={{
            height: '38px',
            backgroundColor: '#191309',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            color: '#eab308',
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
