'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getRoster, getTeams, saveMatch, savePlayer } from '@/lib/db'
import type { Match, Player, TeamPreset } from '@/lib/types'
import RotationGrid from '@/components/RotationGrid'

type Step = 1 | 2 | 3 | 4

// Court grid layout indices: back row [3,2,1], front row [4,5,0]
const COURT_INDICES = [[3, 2, 1], [4, 5, 0]]

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  // Step 1
  const [opponent, setOpponent] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [format, setFormat] = useState<'bo3' | 'bo5'>('bo3')

  // Step 2
  const [teams, setTeams] = useState<TeamPreset[]>([])
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamPreset | null>(null)
  const [customSelected, setCustomSelected] = useState<Set<string>>(new Set())
  const [newPlayerName, setNewPlayerName] = useState('')
  const [mode, setMode] = useState<'team' | 'custom'>('team')

  // Step 3 (custom only) — rotation order
  const [lineup, setLineup] = useState<string[]>([])

  // Step 3 (team) or Step 4 (custom) — pick starting server
  const [servingIndex, setServingIndex] = useState(0) // index in lineup array

  useEffect(() => {
    Promise.all([getTeams(), getRoster()]).then(([t, p]) => {
      setTeams(t)
      setAllPlayers(p.sort((a, b) => a.name.localeCompare(b.name)))
      if (t.length === 0) setMode('custom')
    })
  }, [])

  async function handleAddPlayer() {
    const name = newPlayerName.trim()
    if (!name || allPlayers.some((p) => p.name === name)) return
    const player: Player = { id: crypto.randomUUID(), name }
    await savePlayer(player)
    setAllPlayers((prev) => [...prev, player].sort((a, b) => a.name.localeCompare(b.name)))
    setCustomSelected((prev) => prev.size < 6 ? new Set([...prev, name]) : prev)
    setNewPlayerName('')
  }

  function togglePlayer(name: string) {
    setCustomSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else if (next.size < 6) next.add(name)
      return next
    })
  }

  function goStep2to3() {
    if (mode === 'team' && selectedTeam) {
      setLineup(selectedTeam.players)
      setServingIndex(0)
      setStep(3)
    } else {
      setLineup(Array.from(customSelected))
      setServingIndex(0)
      setStep(3)
    }
  }

  function goStep3to4() {
    // custom only: after rotation order, go to pick server
    setServingIndex(0)
    setStep(4)
  }

  async function handleStart(finalLineup: string[], finalServingIndex: number) {
    const match: Match = {
      id: crypto.randomUUID(),
      date,
      opponent,
      format,
      roster: allPlayers.map((p) => p.name),
      startingLineup: finalLineup,
      currentLineup: finalLineup,
      rotationIndex: finalServingIndex,
      serving: 'us',
      rallies: [],
      sets: [],
      currentScore: [0, 0],
      currentSet: 1,
    }
    await saveMatch(match)
    router.push(`/game/${match.id}`)
  }

  const isTeamMode = mode === 'team'
  // Steps: 1=match info, 2=pick team or custom lineup, 3=rotation order (custom) or pick server (team), 4=pick server (custom only)
  const totalSteps = isTeamMode ? 3 : 4
  const stepDots = Array.from({ length: totalSteps }, (_, i) => i + 1)

  // Server picker component (shared between step 3 team and step 4 custom)
  function ServerPicker({ currentLineup }: { currentLineup: string[] }) {
    const courtGrid = COURT_INDICES.map((row) => row.map((idx) => currentLineup[idx]))
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500">Tap the player who is serving first</p>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {COURT_INDICES.map((row, ri) => (
            <div key={ri} className={`flex ${ri === 0 ? 'border-b border-gray-200' : ''}`}>
              {row.map((lineupIdx, ci) => {
                const name = currentLineup[lineupIdx]
                const isServer = lineupIdx === servingIndex
                return (
                  <button
                    key={ci}
                    onClick={() => setServingIndex(lineupIdx)}
                    className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
                      isServer ? 'bg-green-500 text-white font-bold' : 'bg-white text-gray-700 active:bg-gray-50'
                    } ${ci < row.length - 1 ? 'border-r border-gray-200' : ''}`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">← back court · front court →</p>
        <p className="text-sm text-center font-medium text-green-600">
          🏐 {currentLineup[servingIndex]} serving first
        </p>
        <button
          onClick={() => handleStart(currentLineup, servingIndex)}
          className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg active:bg-green-600"
        >
          🏐 Start Game
        </button>
      </div>
    )
  }

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
          {stepDots.map((s) => (
            <div key={s} className={`w-2 h-2 rounded-full ${s === step ? 'bg-green-500' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      {/* Step 1 — match info */}
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
                    format === f ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {f === 'bo3' ? 'Best of 3' : 'Best of 5'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!opponent.trim()}
            className="mt-4 w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-40 active:bg-green-600"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 2 — pick team or custom lineup */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('team')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${
                mode === 'team' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              Saved Team
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${
                mode === 'custom' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              Custom Lineup
            </button>
          </div>

          {mode === 'team' && (
            <>
              {teams.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No saved teams.{' '}
                  <Link href="/teams/new" className="text-green-500 underline">Create one</Link>{' '}
                  or use Custom Lineup.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {teams.map((t) => (
                    <li key={t.id}>
                      <button
                        onClick={() => setSelectedTeam(selectedTeam?.id === t.id ? null : t)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left ${
                          selectedTeam?.id === t.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs flex-shrink-0 ${
                          selectedTeam?.id === t.id ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                        }`}>
                          {selectedTeam?.id === t.id && '✓'}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold">{t.name}</div>
                          <div className="text-xs text-gray-400 truncate">{t.players.join(', ')}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={goStep2to3}
                disabled={!selectedTeam}
                className="mt-2 w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-40 active:bg-green-600"
              >
                Next →
              </button>
            </>
          )}

          {mode === 'custom' && (
            <>
              <div className="flex gap-2">
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
              <p className="text-sm text-gray-500">Select 6 starters ({customSelected.size}/6)</p>
              <ul className="divide-y divide-gray-100">
                {allPlayers.map((p) => {
                  const isSelected = customSelected.has(p.name)
                  const disabled = !isSelected && customSelected.size >= 6
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => togglePlayer(p.name)}
                        disabled={disabled}
                        className={`w-full flex items-center gap-3 py-3 text-left ${disabled ? 'opacity-30' : ''}`}
                      >
                        <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                          isSelected ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                        }`}>
                          {isSelected && '✓'}
                        </span>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          {p.position && <div className="text-xs text-gray-400">{p.position}</div>}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <button
                onClick={goStep2to3}
                disabled={customSelected.size !== 6}
                className="mt-2 w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-40 active:bg-green-600"
              >
                Next →
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 3 — rotation order (custom) or pick server (team) */}
      {step === 3 && (
        isTeamMode
          ? <ServerPicker currentLineup={lineup} />
          : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-500">Set rotation order — drag to swap</p>
              <RotationGrid lineup={lineup} onChange={setLineup} />
              <button
                onClick={goStep3to4}
                className="mt-2 w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg active:bg-green-600"
              >
                Next →
              </button>
            </div>
          )
      )}

      {/* Step 4 — pick server (custom only) */}
      {step === 4 && <ServerPicker currentLineup={lineup} />}
    </main>
  )
}
