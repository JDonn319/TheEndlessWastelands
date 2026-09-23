import React from 'react'

export const OrientationPrompt: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#050401',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        color: '#facc15',
        fontFamily: 'monospace',
      }}
    >
      <style>{`
        @keyframes rotatePhoneLoop {
          0%, 15% {
            transform: rotate(0deg);
          }
          45%, 70% {
            transform: rotate(-90deg);
          }
          90%, 100% {
            transform: rotate(0deg);
          }
        }
      `}</style>

      <div
        style={{
          width: '56px',
          height: '96px',
          border: '3px solid #facc15',
          borderRadius: '12px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'rotatePhoneLoop 3.6s infinite ease-in-out',
          boxShadow: '0 0 20px rgba(250, 204, 21, 0.35)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#facc15',
          }}
        />
      </div>

      <div
        style={{
          fontSize: '13px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: '0 20px',
          textShadow: '0 0 10px rgba(250, 204, 21, 0.6)',
        }}
      >
        Переверните устройство в горизонтальный режим
      </div>
    </div>
  )
}
