import React from 'react'

export const App: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    width: '100vw',
    height: '100dvh',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    overflow: 'hidden',
  }

  return <div style={containerStyle} />
}
