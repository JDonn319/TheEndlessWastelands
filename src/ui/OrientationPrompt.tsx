import React from 'react'

export const OrientationPrompt: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0a0804',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <style>{`
        @keyframes rotatePhoneMinimal {
          0%, 15% { transform: rotate(0deg); }
          45%, 70% { transform: rotate(-90deg); }
          90%, 100% { transform: rotate(0deg); }
        }
      `}</style>

      <div
        style={{
          width: '54px',
          height: '96px',
          border: '2px solid #ffffff',
          borderRadius: '10px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          animation: 'rotatePhoneMinimal 3.4s infinite ease-in-out',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '6px',
            width: '20px',
            height: '3px',
            backgroundColor: '#ffffff',
            borderRadius: '2px',
          }}
        />
      </div>

      <div
        style={{
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: '0 24px',
          color: '#ffffff',
        }}
      >
        Пожалуйста, переверните устройство
      </div>
    </div>
  )
}
