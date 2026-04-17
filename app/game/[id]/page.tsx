'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getMatch } from '@/lib/db'
import { useGameStore } from '@/store/gameStore'
import StatSheet from '@/components/StatSheet'
import type { RallyStat } from '@/lib/types'

const POSITION_LABELS = [
  // [row, col] in a 2×3 grid — back row left to right, front row left to right
  // Volleyball court: positions 4,3,2 (back) / 5,6,1 (front)
  // In rotation order: pos1=front-right(serve), 2=back-right, 3=back-middle...
  // We display as: back row [4,3,2] / front row [5,6,1]
]

export default function LiveGamePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { match, loadMatch, addPoint, undoLastPoint, saveStat, endSet, endGame, pendingStat, clearPendingStat } =
    useGameStore()
  const [confirmEnd, setConfirmEnd] = useState<'set' | 'game' | null>(null)
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null)

  useEffect(() => {
    if (!match || match.id !== id) {
      getMatch(id).then((m) => {
        if (m) loadMatch(m)
        else router.push('/')
      })
    }
  }, [id])

  if (!match) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>
  }

  // Build display rotation: rotate the starting lineup based on current rotationIndex
  const rotatedLineup = [
    ...match.currentLineup.slice(match.rotationIndex),
    ...match.currentLineup.slice(0, match.rotationIndex),
  ]

  // Court grid: back row = positions 4,3,2 (indices 3,2,1 in rotated), front row = 5,6,1 (indices 4,5,0)
  const courtGrid = [
    [rotatedLineup[3], rotatedLineup[2], rotatedLineup[1]], // back row
    [rotatedLineup[4], rotatedLineup[5], rotatedLineup[0]], // front row, [0] = server
  ]

  const server = rotatedLineup[0]

  function handleEndSet() {
    endSet()
    setConfirmEnd(null)
  }

  function handleEndGame() {
    if (!gameResult) return
    endGame(gameResult)
    router.push(`/game/${id}/report`)
  }

  const setsUs = match.sets.filter((s) => s.score[0] > s.score[1]).length
  const setsThem = match.sets.filter((s) => s.score[1] > s.score[0]).length

  return (
    <main className="flex flex-col min-h-dvh p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">SET {match.currentSet}</span>
        <span className="text-sm font-medium text-gray-600">vs {match.opponent}</span>
        <button
          onClick={undoLastPoint}
          disabled={match.rallies.length === 0}
          className="text-sm text-gray-400 disabled:opacity-30 active:text-gray-600"
        >
          ↩ Undo
        </button>
      </div>

      {/* Score */}
      <div className="flex gap-4 justify-center items-center">
        <div className="flex-1 text-center">
          <div className="text-6xl font-black leading-none">{match.currentScore[0]}</div>
          <div className="text-xs font-semibold text-gray-500 mt-1">US</div>
        </div>
        <div className="text-2xl font-light text-gray-300">–</div>
        <div className="flex-1 text-center">
          <div className="text-6xl font-black leading-none">{match.currentScore[1]}</div>
          <div className="text-xs font-semibold text-gray-500 mt-1">THEM</div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        Sets: <span className="font-bold text-black">US {setsUs}</span> – <span className="font-bold text-black">{setsThem} THEM</span>
      </div>

      {/* Point buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => addPoint('us')}
          className="w-full bg-green-500 text-white text-xl font-bold py-6 rounded-2xl active:bg-green-600 shadow-sm"
        >
          🏐 OUR POINT
        </button>
        <button
          onClick={() => addPoint('them')}
          className="w-full bg-gray-100 text-gray-700 text-xl font-bold py-6 rounded-2xl active:bg-gray-200"
        >
          THEIR POINT
        </button>
      </div>

      {/* Rotation grid */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
          Current Rotation · {match.serving === 'us'
            ? <span className="text-green-600">🏐 Serving: {server}</span>
            : <span className="text-orange-500">🏐 Their serve</span>
          }
        </p>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {courtGrid.map((row, ri) => (
            <div key={ri} className={`flex ${ri === 0 ? 'border-b border-gray-200' : ''}`}>
              {row.map((name, ci) => (
                <div
                  key={ci}
                  className={`flex-1 py-3 text-center text-sm font-medium ${
                    ri === 1 && ci === 2 ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-700'
                  } ${ci < row.length - 1 ? 'border-r border-gray-200' : ''}`}
                >
                  {name}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">← back · front →</p>
      </div>

      {/* End buttons */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => setConfirmEnd('set')}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm active:bg-gray-50"
        >
          End Set
        </button>
        <button
          onClick={() => setConfirmEnd('game')}
          className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 font-medium text-sm active:bg-red-50"
        >
          End Game
        </button>
      </div>

      {/* Stat sheet */}
      {pendingStat && (() => {
        const lastRally = match.rallies[match.rallies.length - 1]
        const preRotationServer = match.currentLineup[lastRally?.rotationIndex ?? match.rotationIndex]
        return (
        <StatSheet
          point={pendingStat.point}
          lineup={match.currentLineup}
          server={preRotationServer}
          onSave={(stat: RallyStat | null) => saveStat(stat)}
        />
        )
      })()}

      {/* End Set confirm */}
      {confirmEnd === 'set' && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmEnd(null)} />
          <div className="relative bg-white rounded-t-2xl p-5 flex flex-col gap-4">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />
            <p className="font-semibold text-center">End Set {match.currentSet}?</p>
            <p className="text-sm text-gray-500 text-center">
              Score: {match.currentScore[0]} – {match.currentScore[1]}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmEnd(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500">Cancel</button>
              <button onClick={handleEndSet} className="flex-1 py-3 rounded-xl bg-green-500 text-white font-semibold">End Set</button>
            </div>
          </div>
        </div>
      )}

      {/* End Game confirm */}
      {confirmEnd === 'game' && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmEnd(null)} />
          <div className="relative bg-white rounded-t-2xl p-5 flex flex-col gap-4">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />
            <p className="font-semibold text-center">End Game?</p>
            <div className="flex gap-2">
              {(['win', 'loss'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setGameResult(r)}
                  className={`flex-1 py-3 rounded-xl font-semibold border text-sm ${
                    gameResult === r
                      ? r === 'win' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {r === 'win' ? '🏆 Win' : '💀 Loss'}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmEnd(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500">Cancel</button>
              <button
                onClick={handleEndGame}
                disabled={!gameResult}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-40"
              >
                End & Report
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
