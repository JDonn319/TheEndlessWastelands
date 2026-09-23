import React, { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onLoaded: () => void
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onLoaded, 400)
          return 100
        }
        return prev + 2
      })
    }, 40)
    return () => clearInterval(timer)
  }, [onLoaded])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#060502',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '30px',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '240px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            maxWidth: '100%',
            maxHeight: '100%',
            opacity: 0.15,
            filter: 'grayscale(100%) brightness(0.6)',
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
            maxWidth: '100%',
            maxHeight: '100%',
            clipPath: `inset(${100 - progress}% 0 0 0)`,
            filter: 'drop-shadow(0 0 15px rgba(250, 204, 21, 0.7))',
            transition: 'clip-path 0.1s linear',
          }}
        />
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#facc15',
            letterSpacing: '4px',
            textShadow: '0 0 12px rgba(250,204,21,0.8)',
          }}
        >
          THE WASTELANDS
        </div>
      </div>

      <div
        style={{
          width: '260px',
          height: '6px',
          backgroundColor: 'rgba(250, 204, 21, 0.15)',
          border: '1px solid rgba(250, 204, 21, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 10px rgba(250, 204, 21, 0.2)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#facc15',
            boxShadow: '0 0 15px #facc15',
            transition: 'width 0.05s ease-out',
          }}
        />
      </div>

      <div
        style={{
          fontFamily: 'monospace',
          color: '#facc15',
          fontSize: '12px',
          letterSpacing: '2px',
          opacity: 0.8,
        }}
      >
        СИСТЕМА ИНИЦИАЛИЗАЦИИ: {progress}%
      </div>
    </div>
  )
}
