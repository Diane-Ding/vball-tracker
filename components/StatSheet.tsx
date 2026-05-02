'use client'
import { useState } from 'react'
import type { StatType, RallyStat } from '@/lib/types'

const OUR_STATS: { type: StatType; label: string }[] = [
  { type: 'kill', label: '💥 Kill' },
  { type: 'ace', label: '🎯 Ace' },
  { type: 'block', label: '🛡️ Block' },
  { type: 'opponentError', label: '💀 Opp Error' },
]

const THEIR_STATS: { type: StatType; label: string }[] = [
  { type: 'attackError', label: '❌ Attack Error' },
  { type: 'serviceError', label: '🚫 Service Error' },
]

type Props = {
  point: 'us' | 'them'
  lineup: string[]
  server: string
  opponent: string
  onSave: (stat: RallyStat | null) => void
}

export default function StatSheet({ point, lineup, server, opponent, onSave }: Props) {
  const [statType, setStatType] = useState<StatType | null>(null)
  const [player, setPlayer] = useState<string | null>(null)

  const statOptions = point === 'us' ? OUR_STATS : THEIR_STATS

  function handleSelectStat(type: StatType) {
    if (statType === type) {
      setStatType(null)
      setPlayer(null)
    } else {
      setStatType(type)
      // Ace auto-assigns to server; opponentError auto-assigns to opponent team
      if (type === 'ace') setPlayer(server)
      else if (type === 'opponentError') setPlayer(opponent)
      else setPlayer(null)
    }
  }

  function handleSave() {
    if (statType && player) {
      onSave({ type: statType, playerName: player })
    } else {
      onSave(null)
    }
  }

  const showPlayerPicker = statType !== null && statType !== 'ace' && statType !== 'opponentError'

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => onSave(null)} />
      <div className="relative bg-white rounded-t-2xl p-5 flex flex-col gap-4">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />

        <p className="text-sm font-semibold text-gray-500">
          Tag this {point === 'us' ? 'point' : 'error'} (optional)
        </p>

        <div className="flex gap-2 flex-wrap">
          {statOptions.map((s) => (
            <button
              key={s.type}
              onClick={() => handleSelectStat(s.type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                statType === s.type
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {statType === 'ace' && (
          <p className="text-sm text-green-600 font-medium">🎯 Ace by {server}</p>
        )}
        {statType === 'opponentError' && (
          <p className="text-sm text-orange-500 font-medium">💀 Error by {opponent}</p>
        )}

        {showPlayerPicker && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Who?</p>
            <div className="grid grid-cols-2 gap-2">
              {lineup.map((name) => (
                <button
                  key={name}
                  onClick={() => setPlayer(player === name ? null : name)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border ${
                    player === name
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-gray-50 text-gray-700 border-gray-100'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-1">
          <button
            onClick={() => onSave(null)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-medium"
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-green-500 text-white font-semibold active:bg-green-600"
          >
            Save ✓
          </button>
        </div>
      </div>
    </div>
  )
}
