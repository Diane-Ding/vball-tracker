'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getRoster, getTeams, saveTeam } from '@/lib/db'
import type { TeamPreset } from '@/lib/types'
import RotationGrid from '@/components/RotationGrid'

export default function EditTeamPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [team, setTeam] = useState<TeamPreset | null>(null)
  const [allPlayers, setAllPlayers] = useState<{ name: string; position?: string }[]>([])
  const [teamName, setTeamName] = useState('')
  const [lineup, setLineup] = useState<string[]>([])

  useEffect(() => {
    Promise.all([getTeams(), getRoster()]).then(([teams, players]) => {
      const t = teams.find((t) => t.id === id)
      if (!t) { router.push('/teams'); return }
      setTeam(t)
      setTeamName(t.name)
      setLineup(t.players)
      setAllPlayers(players.sort((a, b) => a.name.localeCompare(b.name)))
    })
  }, [id])

  async function handleSave() {
    if (!team) return
    const updated: TeamPreset = { ...team, name: teamName.trim(), players: lineup }
    await saveTeam(updated)
    router.push('/teams')
  }

  if (!team) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <main className="flex flex-col min-h-dvh p-4 gap-6">
      <div className="flex items-center gap-3">
        <Link href="/teams" className="text-gray-400 text-xl">←</Link>
        <h1 className="text-xl font-bold">Edit Team</h1>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-600 block mb-1">Team name</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-3 outline-none focus:border-green-400"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">Rotation order — drag to swap</p>
        <RotationGrid lineup={lineup} onChange={setLineup} />
      </div>

      <button
        onClick={handleSave}
        disabled={!teamName.trim()}
        className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-40 active:bg-green-600"
      >
        💾 Save Changes
      </button>
    </main>
  )
}
