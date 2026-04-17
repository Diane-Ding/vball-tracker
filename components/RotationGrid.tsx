'use client'
import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// Visual court layout maps to lineup indices:
// Back row:  [3, 2, 1]
// Front row: [4, 5, 0]  — index 0 is the server (position 1)
const COURT_INDICES = [
  [3, 2, 1],
  [4, 5, 0],
]

function DraggableCell({
  lineupIndex,
  name,
  isServer,
  isDragging,
}: {
  lineupIndex: number
  name: string
  isServer: boolean
  isDragging: boolean
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: String(lineupIndex),
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 50, position: 'relative' as const }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex-1 flex items-center justify-center py-4 text-sm font-semibold select-none touch-none cursor-grab active:cursor-grabbing rounded-lg transition-colors ${
        isDragging ? 'opacity-40' : ''
      } ${isServer ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-700'}`}
    >
      {name}
    </div>
  )
}

function DroppableCell({
  lineupIndex,
  children,
}: {
  lineupIndex: number
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `drop-${lineupIndex}` })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 rounded-lg transition-colors ${isOver ? 'ring-2 ring-green-400' : ''}`}
    >
      {children}
    </div>
  )
}

type Props = {
  lineup: string[]
  onChange: (lineup: string[]) => void
}

export default function RotationGrid({ lineup, onChange }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } })
  )

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return

    const fromIndex = Number(active.id)
    const toIndex = Number(String(over.id).replace('drop-', ''))
    if (fromIndex === toIndex) return

    const next = [...lineup]
    ;[next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-gray-400 text-center mb-1">← back court · front court →</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {COURT_INDICES.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map((lineupIndex) => {
              const name = lineup[lineupIndex]
              const isServer = lineupIndex === 0
              const isDragging = activeId === String(lineupIndex)
              return (
                <DroppableCell key={lineupIndex} lineupIndex={lineupIndex}>
                  <DraggableCell
                    lineupIndex={lineupIndex}
                    name={name}
                    isServer={isServer}
                    isDragging={isDragging}
                  />
                </DroppableCell>
              )
            })}
          </div>
        ))}
      </DndContext>
      <p className="text-xs text-green-600 text-center mt-1">
        🏐 Serving: {lineup[0]}
      </p>
    </div>
  )
}
