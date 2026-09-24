import React, { useState } from 'react'
import { Globe, Volume2, VolumeX } from 'lucide-react'

interface MainMenuProps {
  onStartGame: () => void
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [lang, setLang] = useState<'RU' | 'EN'>('RU')
  const [selectedBtn, setSelectedBtn] = useState<string | null>(null)

  const getButtonStyle = (name: string): React.CSSProperties => {
    const isSelected = selectedBtn === name
    return {
      position: 'relative',
      width: '100%',
      height: '38px',
      backgroundColor: isSelected ? '#facc15' : '#141008',
      border: isSelected ? '1px solid #facc15' : '1px solid rgba(234, 179, 8, 0.35)',
      color: isSelected ? '#000000' : '#eab308',
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
      backgroundImage: isSelected
        ? 'none'
        : 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 0, 0, 0.4) 3px, rgba(0, 0, 0, 0.4) 4px)',
      userSelect: 'none',
      transition: 'background-color 0.1s ease, color 0.1s ease',
    }
  }

  return (
    <div
      onClick={() => setSelectedBtn(null)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0c0803',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 24px',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes floatDust {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-160px) translateX(80px); opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, #1b1207 0%, #0a0602 100%)',
          pointerEvents: 'none',
        }}
      />

      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${(i * 17) % 100}%`,
            top: `${(i * 23) % 100}%`,
            width: `${(i % 3) + 2}px`,
            height: `${(i % 3) + 2}px`,
            backgroundColor: '#eab308',
            borderRadius: '50%',
            pointerEvents: 'none',
            opacity: 0.4,
            animation: `floatDust ${5 + (i % 6)}s infinite linear`,
            animationDelay: `${(i * 0.4) % 4}s`,
          }}
        />
      ))}

      <div
        onClick={(e) => e.stopPropagation()}
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
            backgroundColor: '#120d06',
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
            backgroundColor: '#120d06',
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
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '560px',
          zIndex: 5,
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
            filter: 'drop-shadow(0 0 24px rgba(234, 179, 8, 0.45))',
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
            style={getButtonStyle('play')}
            onClick={() => {
              setSelectedBtn('play')
              onStartGame()
            }}
          >
            НАЧАТЬ
          </button>

          <button
            style={getButtonStyle('storage')}
            onClick={() => setSelectedBtn('storage')}
          >
            АНГАР
          </button>

          <button
            style={getButtonStyle('leaders')}
            onClick={() => setSelectedBtn('leaders')}
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
          color: 'rgba(234, 179, 8, 0.35)',
          fontSize: '11px',
          letterSpacing: '2px',
          zIndex: 5,
        }}
      >
        ALPHA v0.1.5
      </div>
    </div>
  )
}
