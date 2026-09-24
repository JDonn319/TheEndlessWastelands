import React, { useState } from 'react'
import { Globe, Volume2, VolumeX } from 'lucide-react'

interface MainMenuProps {
  onStartGame: () => void
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [lang, setLang] = useState<'RU' | 'EN'>('RU')
  const [activeBtn, setActiveBtn] = useState<string | null>(null)

  const getButtonStyle = (name: string, isPrimary = false): React.CSSProperties => {
    const isPressed = activeBtn === name
    const bgNormal = isPrimary ? '#991b1b' : '#14110b'
    const bgPressed = '#facc15'
    const borderNormal = isPrimary ? '#ef4444' : 'rgba(234, 179, 8, 0.35)'
    const textNormal = isPrimary ? '#ffffff' : '#eab308'

    return {
      position: 'relative',
      width: '100%',
      height: '38px',
      backgroundColor: isPressed ? bgPressed : bgNormal,
      border: isPressed ? '1px solid #facc15' : `1px solid ${borderNormal}`,
      color: isPressed ? '#000000' : textNormal,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      fontWeight: 800,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
      backgroundImage: isPressed
        ? 'none'
        : 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 0, 0, 0.4) 3px, rgba(0, 0, 0, 0.4) 4px)',
      userSelect: 'none',
      transition: 'background-color 0.08s ease, color 0.08s ease',
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 24px',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '18px',
          display: 'flex',
          gap: '8px',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setLang(lang === 'RU' ? 'EN' : 'RU')}
          style={{
            height: '32px',
            padding: '0 10px',
            backgroundColor: '#0d0b06',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#eab308',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
          }}
        >
          <Globe size={13} />
          {lang}
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#0d0b06',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '560px',
        }}
      >
        <img
          src="/logo.png"
          alt="Game Logo"
          style={{
            maxWidth: '100%',
            maxHeight: '160px',
            objectFit: 'contain',
            marginBottom: '18px',
            filter: 'drop-shadow(0 0 22px rgba(234, 179, 8, 0.45))',
          }}
        />

        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <button
            style={getButtonStyle('play', true)}
            onMouseDown={() => setActiveBtn('play')}
            onMouseUp={() => setActiveBtn(null)}
            onTouchStart={() => setActiveBtn('play')}
            onTouchEnd={() => {
              setActiveBtn(null)
              onStartGame()
            }}
            onClick={onStartGame}
          >
            НАЧАТЬ
          </button>

          <button
            style={getButtonStyle('storage')}
            onMouseDown={() => setActiveBtn('storage')}
            onMouseUp={() => setActiveBtn(null)}
            onTouchStart={() => setActiveBtn('storage')}
            onTouchEnd={() => setActiveBtn(null)}
          >
            СКЛАД
          </button>

          <button
            style={getButtonStyle('leaders')}
            onMouseDown={() => setActiveBtn('leaders')}
            onMouseUp={() => setActiveBtn(null)}
            onTouchStart={() => setActiveBtn('leaders')}
            onTouchEnd={() => setActiveBtn(null)}
          >
            ЛИДЕРЫ
          </button>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: '12px',
          right: '18px',
          fontFamily: 'monospace',
          color: 'rgba(234, 179, 8, 0.3)',
          fontSize: '11px',
          letterSpacing: '2px',
        }}
      >
        ALPHA v0.1.5
      </div>
    </div>
  )
}
