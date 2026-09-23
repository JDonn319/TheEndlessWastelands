import React, { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onLoaded: () => void
}

const PHRASES = [
  'ПОДКЛЮЧЕНИЕ СИСТЕМ НАВЕДЕНИЯ...',
  'КАЛИБРОВКА ДАТЧИКОВ ОКРУЖЕНИЯ...',
  'ЗАГРУЗКА СЕКТОРА ПУСТЫНИ...',
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
        if (next === 40) setPhraseIdx(1)
        if (next === 75) setPhraseIdx(2)
        return next
      })
    }, 25)
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
          marginBottom: '90px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(234, 179, 8, 0.22) 0%, rgba(200, 130, 10, 0.06) 45%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <img
          src="/logo.png"
          alt="Logo Base"
          style={{
            maxWidth: '360px',
            maxHeight: '130px',
            objectFit: 'contain',
            opacity: 0.2,
            filter: 'brightness(0.5)',
          }}
        />

        <img
          src="/logo.png"
          alt="Logo Active"
          style={{
            position: 'absolute',
            maxWidth: '360px',
            maxHeight: '130px',
            objectFit: 'contain',
            clipPath: `inset(${100 - progress}% 0 0 0)`,
            filter: 'drop-shadow(0 0 14px rgba(234, 179, 8, 0.5))',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '14%',
          width: '100%',
          maxWidth: '520px',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#eab308',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          {PHRASES[phraseIdx]}
        </div>

        <div
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: 'rgba(234, 179, 8, 0.12)',
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
              backgroundColor: '#eab308',
            }}
          />
        </div>
      </div>
    </div>
  )
}
