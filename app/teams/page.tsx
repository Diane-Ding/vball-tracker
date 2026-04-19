'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getTeams, deleteTeam } from '@/lib/db'
import type { TeamPreset } from '@/lib/types'

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamPreset[]>([])

  useEffect(() => {
    getTeams().then(setTeams)
  }, [])

  async function handleDelete(id: string) {
    await deleteTeam(id)
    setTeams((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <main className="flex flex-col min-h-dvh p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 text-xl">←</Link>
        <h1 className="text-xl font-bold flex-1">🤝 Teams</h1>
        <Link
          href="/teams/new"
          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold active:bg-green-600"
        >
          + New
        </Link>
      </div>

      {teams.length === 0 && (
        <p className="text-gray-400 text-sm">No teams saved yet. Create one to speed up game setup!</p>
      )}

      <ul className="flex flex-col gap-3">
        {teams.map((t) => (
          <li key={t.id} className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <Link href={`/teams/${t.id}`} className="flex-1 min-w-0">
              <div className="font-semibold">{t.name}</div>
              <div className="text-xs text-gray-400 mt-0.5 truncate">{t.players.join(', ')}</div>
            </Link>
            <button
              onClick={() => handleDelete(t.id)}
              className="text-gray-300 hover:text-red-400 text-xl px-1"
              aria-label="Delete team"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4 justify-around">
        <Link href="/" className="text-sm font-medium text-gray-500">🏐 Home</Link>
        <Link href="/roster" className="text-sm font-medium text-gray-500">👥 Roster</Link>
        <Link href="/teams" className="text-sm font-medium text-green-600">🤝 Teams</Link>
      </div>
    </main>
  )
}
