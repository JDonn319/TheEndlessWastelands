import React, { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onLoaded: () => void
}

const PHRASES = [
  'ИНИЦИАЛИЗАЦИЯ НЕЙРОИНТЕРФЕЙСА...',
  'ПОДКЛЮЧЕНИЕ СИСТЕМ НАВЕДЕНИЯ...',
  'СИНХРОНИЗАЦИЯ СЕКТОРА ПУСТЫНИ...',
  'ГОТОВНОСТЬ СИСТЕМЫ...',
]

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0)
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onLoaded, 500)
          return 100
        }
        const next = prev + 1
        if (next === 30) setPhraseIndex(1)
        if (next === 65) setPhraseIndex(2)
        if (next === 90) setPhraseIndex(3)
        return next
      })
    }, 30)
    return () => clearInterval(timer)
  }, [onLoaded])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#040302',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.08) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '420px',
          height: '180px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '50px',
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
          style={{
            position: 'absolute',
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain',
            opacity: 0.15,
            filter: 'brightness(0.4)',
          }}
        />
        <img
          src="/logo.png"
          alt="Logo Fill"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
          style={{
            position: 'absolute',
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain',
            clipPath: `inset(${100 - progress}% 0 0 0)`,
            filter: 'drop-shadow(0 0 16px rgba(234, 179, 8, 0.65))',
            transition: 'clip-path 0.05s linear',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 900,
            fontSize: '32px',
            letterSpacing: '6px',
            color: '#facc15',
            textShadow: '0 0 25px rgba(250, 204, 21, 0.6), 0 2px 4px #000000',
            textAlign: 'center',
          }}
        >
          THE ENDLESS WASTELANDS
        </div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            color: '#eab308',
            fontSize: '11px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            opacity: 0.85,
            textShadow: '0 0 8px rgba(234, 179, 8, 0.5)',
          }}
        >
          {PHRASES[phraseIndex]}
        </div>

        <div
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: 'rgba(234, 179, 8, 0.15)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progress}%`,
              backgroundColor: '#facc15',
              boxShadow: '0 0 12px #facc15, 0 0 24px rgba(250, 204, 21, 0.8)',
              transition: 'width 0.05s linear',
            }}
          />
        </div>
      </div>
    </div>
  )
}
