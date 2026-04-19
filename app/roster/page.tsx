'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRoster, savePlayer, deletePlayer } from '@/lib/db'
import type { Player } from '@/lib/types'

const POSITIONS = ['Setter', 'Outside Hitter', 'Opposite', 'Middle Blocker', 'Libero', 'Defensive Specialist']

export default function RosterPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newName, setNewName] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingPosition, setEditingPosition] = useState<string>('')

  useEffect(() => {
    getRoster().then((p) => setPlayers(p.sort((a, b) => a.name.localeCompare(b.name))))
  }, [])

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    const player: Player = { id: crypto.randomUUID(), name }
    await savePlayer(player)
    setPlayers((prev) => [...prev, player].sort((a, b) => a.name.localeCompare(b.name)))
    setNewName('')
  }

  async function handleDelete(id: string) {
    await deletePlayer(id)
    setPlayers((prev) => prev.filter((p) => p.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  function handleExpand(player: Player) {
    if (expandedId === player.id) {
      setExpandedId(null)
    } else {
      setExpandedId(player.id)
      setEditingPosition(player.position ?? '')
    }
  }

  async function handleSavePosition(player: Player) {
    const updated = { ...player, position: editingPosition.trim() || undefined }
    await savePlayer(updated)
    setPlayers((prev) => prev.map((p) => p.id === updated.id ? updated : p))
    setExpandedId(null)
  }

  return (
    <main className="flex flex-col min-h-dvh p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 text-xl">←</Link>
        <h1 className="text-xl font-bold">👥 Roster</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Player name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
        />
        <button
          onClick={handleAdd}
          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold active:bg-green-600"
        >
          + Add
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-2">{players.length} players · tap to edit position</p>

      <ul className="flex flex-col divide-y divide-gray-100">
        {players.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => handleExpand(p)}
              className="w-full flex items-center justify-between py-3 text-left"
            >
              <div>
                <div className="font-medium">{p.name}</div>
                {p.position && (
                  <div className="text-xs text-gray-400 mt-0.5">{p.position}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">{expandedId === p.id ? '▲' : '▼'}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id) }}
                  className="text-gray-300 hover:text-red-400 text-lg px-1"
                  aria-label="Remove player"
                >
                  ✕
                </button>
              </div>
            </button>

            {expandedId === p.id && (
              <div className="pb-4 flex flex-col gap-2">
                <p className="text-xs text-gray-400 font-semibold uppercase">Position (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setEditingPosition(editingPosition === pos ? '' : pos)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                        editingPosition === pos
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type custom position…"
                  value={editingPosition}
                  onChange={(e) => setEditingPosition(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                />
                <button
                  onClick={() => handleSavePosition(p)}
                  className="bg-green-500 text-white py-2 rounded-lg text-sm font-semibold active:bg-green-600"
                >
                  Save
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {players.length === 0 && (
        <p className="text-gray-400 text-sm mt-4">No players yet. Add some above!</p>
      )}

      <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4 justify-around">
        <Link href="/" className="text-sm font-medium text-gray-500">🏐 Home</Link>
        <Link href="/roster" className="text-sm font-medium text-green-600">👥 Roster</Link>
        <Link href="/teams" className="text-sm font-medium text-gray-500">🤝 Teams</Link>
      </div>
    </main>
  )
}
