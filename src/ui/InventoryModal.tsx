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
  selectedSlotIndex: number | null
  onSelectSlot: (index: number) => void
  onUpdateSlots: (newSlots: (InventoryItem | null)[]) => void
  onClose: () => void
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  slots,
  selectedSlotIndex,
  onSelectSlot,
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
    } else {
      onSelectSlot(draggedIndex)
    }

    setDraggedIndex(null)
  }

  const renderItemGraphic = (type: 'drink' | 'food') => {
    if (type === 'drink') {
      return (
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
          <rect x="7" y="1" width="10" height="4" rx="1" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M5 8C5 6.5 6 5 8 5H16C18 5 19 6.5 19 8V24C19 25.5 18 27 16 27H8C6 27 5 25.5 5 24V8Z" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="8" y1="12" x2="16" y2="12" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      )
    }
    return (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="3" y="4" width="20" height="18" rx="2" stroke="#ffffff" strokeWidth="1.5" />
        <line x1="3" y1="10" x2="23" y2="10" stroke="#ffffff" strokeWidth="1.2" />
        <circle cx="13" cy="16" r="3" stroke="#ffffff" strokeWidth="1.2" />
      </svg>
    )
  }

  const renderSlot = (index: number) => {
    const item = slots[index]
    const isDraggingThis = draggedIndex === index
    const isSelected = selectedSlotIndex === index

    return (
      <div
        key={index}
        data-slot-index={index}
        onTouchStart={(e) => handleTouchStart(index, e)}
        onClick={() => onSelectSlot(index)}
        style={{
          width: '58px',
          height: '58px',
          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.06)',
          border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.35)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          opacity: isDraggingThis ? 0.3 : 1,
          cursor: 'pointer',
        }}
      >
        {item && (
          <>
            {renderItemGraphic(item.type)}
            <span
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '4px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
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
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
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
          padding: '22px 24px',
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
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '11px',
            fontWeight: 700,
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
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            margin: '2px 0',
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
            left: `${dragPos.x - 29}px`,
            top: `${dragPos.y - 29}px`,
            width: '58px',
            height: '58px',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            border: '2px solid #ffffff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {renderItemGraphic(slots[draggedIndex]!.type)}
        </div>
      )}
    </div>
  )
}
