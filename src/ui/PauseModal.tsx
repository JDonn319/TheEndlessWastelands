import React, { useState } from 'react'

interface PauseModalProps {
  onResume: () => void
  onOpenConsole: () => void
  onExitMenu: () => void
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOpenConsole,
  onExitMenu,
}) => {
  const [selectedBtn, setSelectedBtn] = useState<string | null>(null)

  const getBtnStyle = (name: string): React.CSSProperties => {
    const isSelected = selectedBtn === name
    return {
      width: '100%',
      height: '38px',
      backgroundColor: isSelected ? '#facc15' : '#141008',
      border: isSelected ? '1px solid #facc15' : '1px solid rgba(234, 179, 8, 0.4)',
      color: isSelected ? '#000000' : '#eab308',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      fontWeight: 800,
      letterSpacing: '2px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: isSelected
        ? 'none'
        : 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 0, 0, 0.35) 3px, rgba(0, 0, 0, 0.35) 4px)',
    }
  }

  return (
    <div
      onClick={() => setSelectedBtn(null)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '320px',
          backgroundColor: '#0d0a05',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#eab308',
            fontSize: '14px',
            fontWeight: 800,
            letterSpacing: '2px',
            textAlign: 'center',
            marginBottom: '6px',
          }}
        >
          ПАУЗА
        </div>

        <button
          style={getBtnStyle('resume')}
          onClick={() => {
            setSelectedBtn('resume')
            onResume()
          }}
        >
          ПРОДОЛЖИТЬ
        </button>

        <button
          style={getBtnStyle('console')}
          onClick={() => {
            setSelectedBtn('console')
            onOpenConsole()
          }}
        >
          КОНСОЛЬ
        </button>

        <button
          style={getBtnStyle('menu')}
          onClick={() => {
            setSelectedBtn('menu')
            onExitMenu()
          }}
        >
          ГЛАВНОЕ МЕНЮ
        </button>
      </div>
    </div>
  )
}
