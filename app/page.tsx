'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllMatches, deleteMatch } from '@/lib/db'
import type { Match } from '@/lib/types'

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    getAllMatches().then(setMatches)
  }, [])

  async function handleDelete(id: string) {
    await deleteMatch(id)
    setMatches((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <main className="flex flex-col min-h-dvh p-4">
      <h1 className="text-2xl font-bold mb-6">🏐 Vball Tracker</h1>

      <Link
        href="/game/setup"
        className="block w-full bg-green-500 text-white text-center text-lg font-semibold py-4 rounded-xl mb-8 active:bg-green-600"
      >
        + New Game
      </Link>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Recent Matches
      </h2>

      {matches.length === 0 && (
        <p className="text-gray-400 text-sm">No matches yet. Start a new game!</p>
      )}

      <ul className="flex flex-col gap-3">
        {matches.map((m) => {
          const setsUs = m.sets.filter((s) => s.score[0] > s.score[1]).length
          const setsThem = m.sets.filter((s) => s.score[1] > s.score[0]).length
          const resultColor =
            m.result === 'win' ? 'text-green-600' : m.result === 'loss' ? 'text-red-500' : 'text-gray-400'
          const resultLabel = m.result === 'win' ? 'W' : m.result === 'loss' ? 'L' : '—'

          return (
            <li key={m.id} className="flex items-center bg-gray-50 rounded-xl px-4 py-3 gap-3">
              <Link href={`/game/${m.id}/report`} className="flex-1 min-w-0">
                <div className="font-semibold truncate">vs {m.opponent}</div>
                <div className="text-sm text-gray-500">
                  <span className={`font-bold ${resultColor}`}>{resultLabel}</span>{' '}
                  {setsUs}–{setsThem} · {m.date}
                </div>
              </Link>
              <button
                onClick={() => handleDelete(m.id)}
                className="text-gray-300 hover:text-red-400 text-xl px-1"
                aria-label="Delete match"
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4 justify-around">
        <Link href="/" className="text-sm font-medium text-green-600">🏐 Home</Link>
        <Link href="/roster" className="text-sm font-medium text-gray-500">👥 Roster</Link>
        <Link href="/teams" className="text-sm font-medium text-gray-500">🤝 Teams</Link>
      </div>
    </main>
  )
}
