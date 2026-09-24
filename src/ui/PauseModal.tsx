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
  const [activeBtn, setActiveBtn] = useState<string | null>(null)

  const getBtnStyle = (name: string): React.CSSProperties => {
    const isPressed = activeBtn === name
    return {
      width: '100%',
      height: '38px',
      backgroundColor: isPressed ? '#facc15' : '#14110b',
      border: isPressed ? '1px solid #facc15' : '1px solid rgba(234, 179, 8, 0.4)',
      color: isPressed ? '#000000' : '#eab308',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      fontWeight: 800,
      letterSpacing: '2px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: isPressed
        ? 'none'
        : 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 0, 0, 0.35) 3px, rgba(0, 0, 0, 0.35) 4px)',
    }
  }

  return (
    <div
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
        style={{
          width: '320px',
          backgroundColor: '#0a0803',
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
            letterSpacing: '3px',
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          ПАУЗА
        </div>

        <button
          style={getBtnStyle('resume')}
          onTouchStart={() => setActiveBtn('resume')}
          onTouchEnd={() => {
            setActiveBtn(null)
            onResume()
          }}
          onClick={onResume}
        >
          ПРОХОДИТЬ
        </button>

        <button
          style={getBtnStyle('console')}
          onTouchStart={() => setActiveBtn('console')}
          onTouchEnd={() => {
            setActiveBtn(null)
            onOpenConsole()
          }}
          onClick={onOpenConsole}
        >
          КОНСОЛЬ
        </button>

        <button
          style={getBtnStyle('menu')}
          onTouchStart={() => setActiveBtn('menu')}
          onTouchEnd={() => {
            setActiveBtn(null)
            onExitMenu()
          }}
          onClick={onExitMenu}
        >
          ГЛАВНОЕ МЕНЮ
        </button>
      </div>
    </div>
  )
}
