import React, { useState } from 'react'
import { Globe, Volume2, VolumeX } from 'lucide-react'

interface MainMenuProps {
  onStartGame: () => void
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [lang, setLang] = useState<'RU' | 'EN'>('RU')

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '46px',
    backgroundColor: 'rgba(10, 8, 3, 0.5)',
    border: '1px solid rgba(234, 179, 8, 0.35)',
    color: '#eab308',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '8px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    boxShadow: 'inset 0 0 15px rgba(234, 179, 8, 0.05)',
    backgroundImage:
      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(234, 179, 8, 0.04) 2px, rgba(234, 179, 8, 0.04) 4px)',
    transition: 'all 0.2s ease',
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = '#facc15'
    e.currentTarget.style.boxShadow = '0 0 18px rgba(250, 204, 21, 0.3), inset 0 0 15px rgba(250, 204, 21, 0.15)'
    e.currentTarget.style.color = '#fef08a'
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.35)'
    e.currentTarget.style.boxShadow = 'inset 0 0 15px rgba(234, 179, 8, 0.05)'
    e.currentTarget.style.color = '#eab308'
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#040302',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 32px',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.09) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setLang(lang === 'RU' ? 'EN' : 'RU')}
          style={{
            height: '36px',
            padding: '0 12px',
            backgroundColor: 'rgba(10, 8, 3, 0.6)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
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
            width: '36px',
            height: '36px',
            backgroundColor: 'rgba(10, 8, 3, 0.6)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            color: '#eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10,
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
          style={{
            maxHeight: '110px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.4))',
          }}
        />
        <div
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 900,
            fontSize: '34px',
            letterSpacing: '8px',
            color: '#facc15',
            textShadow: '0 0 25px rgba(250, 204, 21, 0.7), 0 2px 6px #000000',
            textAlign: 'center',
          }}
        >
          THE ENDLESS WASTELANDS
        </div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 10,
          marginBottom: '16px',
        }}
      >
        <button
          onClick={onStartGame}
          style={buttonStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          И Г Р А Т Ь
        </button>

        <button
          style={buttonStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          С К Л А Д
        </button>

        <button
          style={buttonStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Л И Д Е Р Ы
        </button>
      </div>

      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            color: 'rgba(234, 179, 8, 0.35)',
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
