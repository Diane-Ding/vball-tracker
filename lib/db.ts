'use client'
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Match, Player } from './types'

interface VballDB extends DBSchema {
  matches: { key: string; value: Match }
  roster: { key: string; value: Player }
}

let db: IDBPDatabase<VballDB> | null = null

async function getDB() {
  if (!db) {
    db = await openDB<VballDB>('vball-tracker', 1, {
      upgrade(database) {
        database.createObjectStore('matches', { keyPath: 'id' })
        database.createObjectStore('roster', { keyPath: 'id' })
      },
    })
  }
  return db
}

export async function saveMatch(match: Match) {
  const database = await getDB()
  await database.put('matches', match)
}

export async function getMatch(id: string): Promise<Match | undefined> {
  const database = await getDB()
  return database.get('matches', id)
}

export async function getAllMatches(): Promise<Match[]> {
  const database = await getDB()
  const all = await database.getAll('matches')
  return all.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
}

export async function deleteMatch(id: string) {
  const database = await getDB()
  await database.delete('matches', id)
}

export async function getRoster(): Promise<Player[]> {
  const database = await getDB()
  return database.getAll('roster')
}

export async function savePlayer(player: Player) {
  const database = await getDB()
  await database.put('roster', player)
}

export async function deletePlayer(id: string) {
  const database = await getDB()
  await database.delete('roster', id)
}
