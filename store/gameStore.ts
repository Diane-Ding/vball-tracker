'use client'
import { create } from 'zustand'
import type { Match, Rally, RallyStat, SetResult } from '@/lib/types'
import { saveMatch } from '@/lib/db'

type GameStore = {
  match: Match | null
  pendingStat: { point: 'us' | 'them' } | null

  loadMatch: (match: Match) => void
  addPoint: (point: 'us' | 'them') => void
  undoLastPoint: () => void
  saveStat: (stat: RallyStat | null) => void
  endSet: () => void
  endGame: (result: 'win' | 'loss') => void
  clearPendingStat: () => void
}

function persist(match: Match) {
  saveMatch(match).catch(console.error)
}

export const useGameStore = create<GameStore>((set, get) => ({
  match: null,
  pendingStat: null,

  loadMatch: (match) => set({ match }),

  addPoint: (point) => {
    const { match } = get()
    if (!match) return

    const scoreBefore: [number, number] = [...match.currentScore]
    const newScore: [number, number] = [
      match.currentScore[0] + (point === 'us' ? 1 : 0),
      match.currentScore[1] + (point === 'them' ? 1 : 0),
    ]

    // Rotation only on sideout: we score while they were serving
    const isSideout = point === 'us' && match.serving === 'them'
    const nextRotationIndex = isSideout ? (match.rotationIndex + 1) % 6 : match.rotationIndex
    const nextServing: 'us' | 'them' = point === 'us' ? 'us' : 'them'

    const rally: Rally = {
      id: crypto.randomUUID(),
      setNumber: match.currentSet,
      rotationIndex: match.rotationIndex,
      scoreBefore,
      point,
      timestamp: Date.now(),
    }

    const updatedMatch: Match = {
      ...match,
      currentScore: newScore,
      rotationIndex: nextRotationIndex,
      serving: nextServing,
      rallies: [...match.rallies, rally],
    }

    persist(updatedMatch)
    set({ match: updatedMatch, pendingStat: { point } })
  },

  undoLastPoint: () => {
    const { match } = get()
    if (!match || match.rallies.length === 0) return

    const rallies = [...match.rallies]
    const last = rallies.pop()!

    const updatedMatch: Match = {
      ...match,
      currentScore: last.scoreBefore,
      rotationIndex: last.rotationIndex,
      rallies,
    }

    persist(updatedMatch)
    set({ match: updatedMatch, pendingStat: null })
  },

  saveStat: (stat) => {
    const { match } = get()
    if (!match) return

    const rallies = [...match.rallies]
    const lastIdx = rallies.length - 1
    if (lastIdx < 0) return

    if (stat) {
      rallies[lastIdx] = { ...rallies[lastIdx], stat }
    }

    const updatedMatch = { ...match, rallies }
    persist(updatedMatch)
    set({ match: updatedMatch, pendingStat: null })
  },

  clearPendingStat: () => set({ pendingStat: null }),

  endSet: () => {
    const { match } = get()
    if (!match) return

    const setResult: SetResult = {
      setNumber: match.currentSet,
      score: match.currentScore,
    }

    const updatedMatch: Match = {
      ...match,
      sets: [...match.sets, setResult],
      currentSet: match.currentSet + 1,
      currentScore: [0, 0],
    }

    persist(updatedMatch)
    set({ match: updatedMatch })
  },

  endGame: (result) => {
    const { match } = get()
    if (!match) return

    // Save current unfinished set if there are points
    const sets = [...match.sets]
    if (match.currentScore[0] > 0 || match.currentScore[1] > 0) {
      sets.push({ setNumber: match.currentSet, score: match.currentScore })
    }

    const updatedMatch: Match = {
      ...match,
      sets,
      result,
      completedAt: Date.now(),
    }

    persist(updatedMatch)
    set({ match: updatedMatch })
  },
}))
