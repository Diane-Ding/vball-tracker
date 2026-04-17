'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRoster, savePlayer, deletePlayer } from '@/lib/db'
import type { Player } from '@/lib/types'

export default function RosterPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newName, setNewName] = useState('')

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

      <p className="text-xs text-gray-400 mb-2">{players.length} players</p>

      <ul className="flex flex-col divide-y divide-gray-100">
        {players.map((p) => (
          <li key={p.id} className="flex items-center justify-between py-3">
            <span className="font-medium">{p.name}</span>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-gray-300 hover:text-red-400 text-lg px-1"
              aria-label="Remove player"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {players.length === 0 && (
        <p className="text-gray-400 text-sm mt-4">No players yet. Add some above!</p>
      )}

      <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4 justify-around">
        <Link href="/" className="text-sm font-medium text-gray-500">🏐 Home</Link>
        <Link href="/roster" className="text-sm font-medium text-green-600">👥 Roster</Link>
      </div>
    </main>
  )
}
