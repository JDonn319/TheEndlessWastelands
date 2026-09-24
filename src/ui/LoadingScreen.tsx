import React, { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onLoaded: () => void
}

const PHRASES = [
  'ПОДКЛЮЧЕНИЕ СИСТЕМ НАВЕДЕНИЯ...',
  'КАЛИБРОВКА ДАТЧИКОВ ОКРУЖЕНИЯ...',
  'ЗАГРУЗКА АУДИОСИСТЕМ...',
]

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0)
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onLoaded, 300)
          return 100
        }
        const next = prev + 1
        if (next === 35) setPhraseIdx(1)
        if (next === 75) setPhraseIdx(2)
        return next
      })
    }, 22)
    return () => clearInterval(timer)
  }, [onLoaded])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '50px',
        }}
      >
        <img
          src="/logo.png"
          alt="Logo Outline"
          style={{
            maxWidth: '560px',
            maxHeight: '180px',
            objectFit: 'contain',
            opacity: 0.15,
            filter: 'brightness(0.3)',
          }}
        />

        <img
          src="/logo.png"
          alt="Logo Active"
          style={{
            position: 'absolute',
            maxWidth: '560px',
            maxHeight: '180px',
            objectFit: 'contain',
            clipPath: `inset(${100 - progress}% 0 0 0)`,
            filter: 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.55))',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          width: '75vw',
          maxWidth: '820px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#eab308',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          {PHRASES[phraseIdx]}
        </div>

        <div
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#0c0a04',
            border: '1px solid rgba(234, 179, 8, 0.25)',
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
            }}
          />
        </div>
      </div>
    </div>
  )
}
