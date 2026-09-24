import React, { useState, useRef } from 'react'

export interface InventoryItem {
  id: string
  name: string
  type: 'drink' | 'food'
  count: number
  weight: number
}

interface InventoryModalProps {
  slots: (InventoryItem | null)[]
  onUpdateSlots: (newSlots: (InventoryItem | null)[]) => void
  onClose: () => void
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  slots,
  onUpdateSlots,
  onClose,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement | null>(null)

  const totalWeight = slots.reduce((acc, item) => {
    if (!item) return acc
    return acc + item.weight * item.count
  }, 0)

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    if (!slots[index]) return
    const touch = e.touches[0]
    setDraggedIndex(index)
    setDragPos({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null) return
    const touch = e.touches[0]
    setDragPos({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (draggedIndex === null) return
    const touch = e.changedTouches[0]
    const targetElem = document.elementFromPoint(touch.clientX, touch.clientY)
    const targetSlotElem = targetElem?.closest('[data-slot-index]')

    if (targetSlotElem) {
      const targetIndex = Number(targetSlotElem.getAttribute('data-slot-index'))
      if (!isNaN(targetIndex) && targetIndex !== draggedIndex) {
        const next = [...slots]
        const source = next[draggedIndex]
        const dest = next[targetIndex]

        if (source && dest && source.type === dest.type) {
          const space = 8 - dest.count
          if (space > 0) {
            const added = Math.min(space, source.count)
            dest.count += added
            source.count -= added
            if (source.count === 0) {
              next[draggedIndex] = null
            }
          }
        } else {
          next[targetIndex] = source
          next[draggedIndex] = dest
        }
        onUpdateSlots(next)
      }
    }

    setDraggedIndex(null)
  }

  const renderSlot = (index: number) => {
    const item = slots[index]
    const isDraggingThis = draggedIndex === index

    return (
      <div
        key={index}
        data-slot-index={index}
        onTouchStart={(e) => handleTouchStart(index, e)}
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          opacity: isDraggingThis ? 0.3 : 1,
          userSelect: 'none',
        }}
      >
        {item && (
          <>
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '10px',
                fontWeight: 800,
                color: '#ffffff',
                textAlign: 'center',
                padding: '0 2px',
                lineHeight: 1.1,
              }}
            >
              {item.name}
            </span>
            <span
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '4px',
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 900,
                color: '#ffffff',
              }}
            >
              x{item.count}
            </span>
          </>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: '#0c0a07',
          border: '1px solid #ffffff',
          borderRadius: '8px',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          width: '320px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
            paddingBottom: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '13px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '2px',
            }}
          >
            ИНВЕНТАРЬ
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: totalWeight > 18 ? '#ef4444' : '#ffffff',
          }}
        >
          ВЕС: {totalWeight.toFixed(1)} / 20.0 КГ
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            justifyItems: 'center',
          }}
        >
          {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((idx) => renderSlot(idx))}
        </div>

        <div
          style={{
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            margin: '4px 0',
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            justifyItems: 'center',
          }}
        >
          {[0, 1, 2, 3].map((idx) => renderSlot(idx))}
        </div>
      </div>

      {draggedIndex !== null && slots[draggedIndex] && (
        <div
          style={{
            position: 'fixed',
            left: `${dragPos.x - 28}px`,
            top: `${dragPos.y - 28}px`,
            width: '56px',
            height: '56px',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            border: '1px solid #ffffff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <span
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '10px',
              fontWeight: 800,
              color: '#ffffff',
              textAlign: 'center',
            }}
          >
            {slots[draggedIndex]?.name}
          </span>
        </div>
      )}
    </div>
  )
}
