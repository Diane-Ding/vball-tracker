export type Player = {
  id: string
  name: string
}

export type StatType = 'kill' | 'ace' | 'block' | 'attackError' | 'serviceError'

export type RallyStat = {
  type: StatType
  playerName: string
}

export type Rally = {
  id: string
  setNumber: number
  rotationIndex: number
  scoreBefore: [number, number]
  point: 'us' | 'them'
  stat?: RallyStat
  timestamp: number
}

export type SetResult = {
  setNumber: number
  score: [number, number]
}

export type Match = {
  id: string
  date: string
  opponent: string
  format: 'bo3' | 'bo5'
  roster: string[]
  startingLineup: string[]
  currentLineup: string[]
  rotationIndex: number
  serving: 'us' | 'them'
  rallies: Rally[]
  sets: SetResult[]
  currentScore: [number, number]
  currentSet: number
  result?: 'win' | 'loss'
  completedAt?: number
}
