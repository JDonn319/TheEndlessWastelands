import React, { useState } from 'react'

interface ConsoleModalProps {
  onClose: () => void
}

export const ConsoleModal: React.FC<ConsoleModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<string[]>([
    'KERNEL: Wasteland System online',
    'RENDERER: ThreeJS procedural chunks running',
    'Ready for input commands.',
  ])
  const [cmd, setCmd] = useState('')

  const handleSend = () => {
    if (!cmd.trim()) return
    const input = cmd.trim()
    setLogs((prev) => [...prev, `> ${input}`, `COMMAND [${input}] EXECUTED.`])
    setCmd('')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '540px',
          height: '280px',
          backgroundColor: '#0a0803',
          border: '1px solid rgba(234, 179, 8, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(234, 179, 8, 0.3)',
            paddingBottom: '8px',
            marginBottom: '10px',
            fontFamily: 'monospace',
            color: '#eab308',
            fontSize: '12px',
          }}
        >
          <span>СИСТЕМНАЯ КОНСОЛЬ</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#eab308',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#eab308',
            lineHeight: 1.5,
          }}
        >
          {logs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <input
            type="text"
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="ВВЕДИТЕ КОМАНДУ..."
            style={{
              flex: 1,
              height: '32px',
              backgroundColor: '#000000',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              color: '#facc15',
              fontFamily: 'monospace',
              fontSize: '12px',
              padding: '0 8px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            style={{
              height: '32px',
              padding: '0 16px',
              backgroundColor: '#eab308',
              border: 'none',
              color: '#000000',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ВВОД
          </button>
        </div>
      </div>
    </div>
  )
}
