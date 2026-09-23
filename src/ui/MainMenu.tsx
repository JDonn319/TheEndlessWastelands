import React, { useState } from 'react'
import { Globe, Volume2, VolumeX } from 'lucide-react'

interface MainMenuProps {
  onStartGame: () => void
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [lang, setLang] = useState<'RU' | 'EN'>('RU')
  const [activeBtn, setActiveBtn] = useState<string | null>(null)

  const getButtonStyle = (name: string): React.CSSProperties => {
    const isPressed = activeBtn === name
    return {
      position: 'relative',
      width: '100%',
      height: '44px',
      backgroundColor: isPressed ? '#eab308' : '#080602',
      border: isPressed ? '1px solid #eab308' : '1px solid rgba(234, 179, 8, 0.3)',
      color: isPressed ? '#000000' : '#eab308',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      fontWeight: 800,
      letterSpacing: '7px',
      textTransform: 'uppercase',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
      backgroundImage: isPressed
        ? 'none'
        : 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(234, 179, 8, 0.05) 3px, rgba(234, 179, 8, 0.05) 4px)',
      userSelect: 'none',
      transition: 'background-color 0.1s ease, color 0.1s ease',
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
        justifyContent: 'space-between',
        padding: '24px 32px',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}
      >
        <button
          onClick={() => setLang(lang === 'RU' ? 'EN' : 'RU')}
          style={{
            height: '34px',
            padding: '0 12px',
            backgroundColor: '#080602',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#eab308',
            fontFamily: 'monospace',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Globe size={14} />
          {lang}
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#080602',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(234, 179, 8, 0.22) 0%, rgba(200, 130, 10, 0.05) 50%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <img
          src="/logo.png"
          alt="Game Logo"
          style={{
            maxWidth: '380px',
            maxHeight: '140px',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 2,
          }}
        />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        <button
          style={getButtonStyle('play')}
          onMouseDown={() => setActiveBtn('play')}
          onMouseUp={() => setActiveBtn(null)}
          onTouchStart={() => setActiveBtn('play')}
          onTouchEnd={() => {
            setActiveBtn(null)
            onStartGame()
          }}
          onClick={onStartGame}
        >
          И Г Р А Т Ь
        </button>

        <button
          style={getButtonStyle('storage')}
          onMouseDown={() => setActiveBtn('storage')}
          onMouseUp={() => setActiveBtn(null)}
          onTouchStart={() => setActiveBtn('storage')}
          onTouchEnd={() => setActiveBtn(null)}
        >
          С К Л А Д
        </button>

        <button
          style={getButtonStyle('leaders')}
          onMouseDown={() => setActiveBtn('leaders')}
          onMouseUp={() => setActiveBtn(null)}
          onTouchStart={() => setActiveBtn('leaders')}
          onTouchEnd={() => setActiveBtn(null)}
        >
          Л И Д Е Р Ы
        </button>
      </div>

      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            color: 'rgba(234, 179, 8, 0.3)',
            fontSize: '11px',
            letterSpacing: '3px',
          }}
        >
          ALPHA v0.1.0
        </div>
      </div>
    </div>
  )
}
