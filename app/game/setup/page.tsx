'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getRoster, saveMatch, savePlayer } from '@/lib/db'
import type { Match, Player } from '@/lib/types'
import RotationGrid from '@/components/RotationGrid'

type Step = 1 | 2 | 3

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [opponent, setOpponent] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [format, setFormat] = useState<'bo3' | 'bo5'>('bo3')
  const [allPlayers, setAllPlayers] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [lineup, setLineup] = useState<string[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')

  useEffect(() => {
    getRoster().then((players) => {
      setAllPlayers(players.map((p) => p.name).sort())
    })
  }, [])

  async function handleAddPlayer() {
    const name = newPlayerName.trim()
    if (!name || allPlayers.includes(name)) return
    const player: Player = { id: crypto.randomUUID(), name }
    await savePlayer(player)
    setAllPlayers((prev) => [...prev, name].sort())
    setSelected((prev) => prev.size < 6 ? new Set([...prev, name]) : prev)
    setNewPlayerName('')
  }

  function togglePlayer(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else if (next.size < 6) {
        next.add(name)
      }
      return next
    })
  }

  function goToStep3() {
    setLineup(Array.from(selected))
    setStep(3)
  }


  async function handleStart() {
    const match: Match = {
      id: crypto.randomUUID(),
      date,
      opponent,
      format,
      roster: allPlayers,
      startingLineup: lineup,
      currentLineup: lineup,
      rotationIndex: 0,
      rallies: [],
      sets: [],
      currentScore: [0, 0],
      currentSet: 1,
      serving: 'us',
    }
    await saveMatch(match)
    router.push(`/game/${match.id}`)
  }

  const steps = [1, 2, 3]

  return (
    <main className="flex flex-col min-h-dvh p-4">
      <div className="flex items-center gap-3 mb-6">
        {step > 1 ? (
          <button onClick={() => setStep((s) => (s - 1) as Step)} className="text-gray-400 text-xl">←</button>
        ) : (
          <Link href="/" className="text-gray-400 text-xl">←</Link>
        )}
        <h1 className="text-xl font-bold flex-1">New Game</h1>
        <div className="flex gap-1">
          {steps.map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${s === step ? 'bg-green-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Opponent</label>
            <input
              type="text"
              placeholder="e.g. Team Spikers"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 outline-none focus:border-green-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 outline-none focus:border-green-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">Format</label>
            <div className="flex gap-2">
              {(['bo3', 'bo5'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm border ${
                    format === f
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {f === 'bo3' ? 'Best of 3' : 'Best of 5'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => opponent.trim() && setStep(2)}
            disabled={!opponent.trim()}
            className="mt-4 w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-40 active:bg-green-600"
          >
            Next →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500 mb-2">Select 6 starters ({selected.size}/6)</p>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add new player…"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
            />
            <button
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim()}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 active:bg-green-600"
            >
              + Add
            </button>
          </div>
          <ul className="divide-y divide-gray-100">
            {allPlayers.map((name) => {
              const isSelected = selected.has(name)
              const disabled = !isSelected && selected.size >= 6
              return (
                <li key={name}>
                  <button
                    onClick={() => togglePlayer(name)}
                    disabled={disabled}
                    className={`w-full flex items-center gap-3 py-3 text-left ${
                      disabled ? 'opacity-30' : ''
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                        isSelected ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && '✓'}
                    </span>
                    <span className="font-medium">{name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <button
            onClick={goToStep3}
            disabled={selected.size !== 6}
            className="mt-4 w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-40 active:bg-green-600"
          >
            Next →
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">Drag players to set rotation — the green cell serves first</p>
          <RotationGrid lineup={lineup} onChange={setLineup} />
          <button
            onClick={handleStart}
            className="mt-2 w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg active:bg-green-600"
          >
            🏐 Start Game
          </button>
        </div>
      )}
    </main>
  )
}
