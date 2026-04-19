'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getRoster, saveTeam } from '@/lib/db'
import type { TeamPreset } from '@/lib/types'
import RotationGrid from '@/components/RotationGrid'

type Step = 1 | 2 | 3

export default function NewTeamPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [teamName, setTeamName] = useState('')
  const [allPlayers, setAllPlayers] = useState<{ name: string; position?: string }[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [lineup, setLineup] = useState<string[]>([])

  useEffect(() => {
    getRoster().then((players) =>
      setAllPlayers(players.sort((a, b) => a.name.localeCompare(b.name)))
    )
  }, [])

  function togglePlayer(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else if (next.size < 6) next.add(name)
      return next
    })
  }

  async function handleSave() {
    const team: TeamPreset = { id: crypto.randomUUID(), name: teamName.trim(), players: lineup }
    await saveTeam(team)
    router.push('/teams')
  }

  const steps = [1, 2, 3]

  return (
    <main className="flex flex-col min-h-dvh p-4">
      <div className="flex items-center gap-3 mb-6">
        {step > 1 ? (
          <button onClick={() => setStep((s) => (s - 1) as Step)} className="text-gray-400 text-xl">←</button>
        ) : (
          <Link href="/teams" className="text-gray-400 text-xl">←</Link>
        )}
        <h1 className="text-xl font-bold flex-1">New Team</h1>
        <div className="flex gap-1">
          {steps.map((s) => (
            <div key={s} className={`w-2 h-2 rounded-full ${s === step ? 'bg-green-500' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Team name</label>
            <input
              type="text"
              placeholder="e.g. Friday Night Squad"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && teamName.trim() && setStep(2)}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 outline-none focus:border-green-400"
            />
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!teamName.trim()}
            className="mt-2 w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-40 active:bg-green-600"
          >
            Next →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500 mb-2">Select 6 players ({selected.size}/6)</p>
          {allPlayers.length === 0 && (
            <p className="text-gray-400 text-sm">
              No players in roster.{' '}
              <Link href="/roster" className="text-green-500 underline">Add players first</Link>.
            </p>
          )}
          <ul className="divide-y divide-gray-100">
            {allPlayers.map(({ name, position }) => {
              const isSelected = selected.has(name)
              const disabled = !isSelected && selected.size >= 6
              return (
                <li key={name}>
                  <button
                    onClick={() => togglePlayer(name)}
                    disabled={disabled}
                    className={`w-full flex items-center gap-3 py-3 text-left ${disabled ? 'opacity-30' : ''}`}
                  >
                    <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                      isSelected ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && '✓'}
                    </span>
                    <div>
                      <div className="font-medium">{name}</div>
                      {position && <div className="text-xs text-gray-400">{position}</div>}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          <button
            onClick={() => { setLineup(Array.from(selected)); setStep(3) }}
            disabled={selected.size !== 6}
            className="mt-4 w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-40 active:bg-green-600"
          >
            Next →
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">Set default rotation order — drag to swap</p>
          <RotationGrid lineup={lineup} onChange={setLineup} />
          <button
            onClick={handleSave}
            className="mt-2 w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg active:bg-green-600"
          >
            💾 Save Team
          </button>
        </div>
      )}
    </main>
  )
}
