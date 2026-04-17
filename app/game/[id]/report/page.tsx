'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getMatch } from '@/lib/db'
import type { Match } from '@/lib/types'

type PlayerStats = {
  kills: number
  aces: number
  blocks: number
  attackErrors: number
  serviceErrors: number
  points: number
}

type RotationStats = {
  rotationIndex: number
  ptsFor: number
  ptsAgainst: number
  net: number
}

function computePlayerStats(match: Match): Record<string, PlayerStats> {
  const stats: Record<string, PlayerStats> = {}
  for (const name of match.roster) {
    stats[name] = { kills: 0, aces: 0, blocks: 0, attackErrors: 0, serviceErrors: 0, points: 0 }
  }
  for (const rally of match.rallies) {
    if (!rally.stat) continue
    const s = stats[rally.stat.playerName]
    if (!s) continue
    if (rally.stat.type === 'kill') { s.kills++; s.points++ }
    else if (rally.stat.type === 'ace') { s.aces++; s.points++ }
    else if (rally.stat.type === 'block') { s.blocks++; s.points++ }
    else if (rally.stat.type === 'attackError') s.attackErrors++
    else if (rally.stat.type === 'serviceError') s.serviceErrors++
  }
  return stats
}

function computeRotationStats(match: Match): RotationStats[] {
  const map: Record<number, RotationStats> = {}
  for (let i = 0; i < 6; i++) {
    map[i] = { rotationIndex: i, ptsFor: 0, ptsAgainst: 0, net: 0 }
  }
  for (const rally of match.rallies) {
    const r = map[rally.rotationIndex]
    if (!r) continue
    if (rally.point === 'us') r.ptsFor++
    else r.ptsAgainst++
  }
  for (const r of Object.values(map)) r.net = r.ptsFor - r.ptsAgainst
  return Object.values(map).sort((a, b) => b.net - a.net)
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const [match, setMatch] = useState<Match | null>(null)

  useEffect(() => {
    getMatch(id).then((m) => m && setMatch(m))
  }, [id])

  async function handleSaveImage() {
    if (!match) return

    const scale = 2
    const W = 390 * scale
    const margin = 28 * scale
    const lineH = 22 * scale
    const pStats = computePlayerStats(match)
    const rStats = computeRotationStats(match)
    const players = match.roster.filter((n) => match.startingLineup.includes(n))
    const setsUs = match.sets.filter((s) => s.score[0] > s.score[1]).length
    const setsThem = match.sets.filter((s) => s.score[1] > s.score[0]).length
    const resultLabel = match.result === 'win' ? 'WIN' : match.result === 'loss' ? 'LOSS' : '—'

    // First pass: measure total height
    const rows =
      4 +                      // header block
      1 + match.sets.length +  // sets
      1 + 1 + players.length + 1 + // player stats
      1 + 1 + rStats.length    // rotation stats
    const H = (rows + 4) * lineH + margin * 2

    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.scale(1, 1)

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    let y = margin + lineH

    function text(str: string, x: number, opts?: { size?: number; bold?: boolean; color?: string; align?: CanvasTextAlign }) {
      const size = (opts?.size ?? 13) * scale
      ctx.font = `${opts?.bold ? '700' : '400'} ${size}px -apple-system, sans-serif`
      ctx.fillStyle = opts?.color ?? '#1e1e1e'
      ctx.textAlign = opts?.align ?? 'left'
      ctx.fillText(str, x, y)
    }

    function rule() {
      y += 6
      ctx.strokeStyle = '#e5e5e5'
      ctx.lineWidth = scale
      ctx.beginPath()
      ctx.moveTo(margin, y)
      ctx.lineTo(W - margin, y)
      ctx.stroke()
      y += 12
    }

    function section(label: string) {
      text(label, margin, { size: 9, bold: true, color: '#888888' })
      y += lineH * 0.8
    }

    // Header
    text('🏐 Match Report', margin, { size: 17, bold: true })
    y += lineH * 1.3
    text(`vs ${match.opponent}  ·  ${match.date}`, margin, { size: 12, color: '#666666' })
    y += lineH
    text(`${resultLabel}  ${setsUs}–${setsThem}`, margin, {
      size: 15, bold: true,
      color: match.result === 'win' ? '#16a34a' : match.result === 'loss' ? '#dc2626' : '#888',
    })
    y += lineH * 1.2
    rule()

    // Sets
    section('SETS')
    for (const s of match.sets) {
      text(`Set ${s.setNumber}`, margin, { size: 12, color: '#666' })
      text(`US ${s.score[0]} – ${s.score[1]} THEM`, margin + 60 * scale, { size: 12, bold: true })
      y += lineH
    }
    y += 6
    rule()

    // Player stats
    section('PLAYER STATS')
    const c = [margin, margin + 130*scale, margin + 165*scale, margin + 200*scale, margin + 238*scale, margin + 276*scale]
    const headers = ['Name', 'K', 'A', 'B', 'Err', 'Pts']
    headers.forEach((h, i) => text(h, c[i], { size: 10, bold: true, color: '#888' }))
    y += lineH * 0.9

    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = scale
    ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(W - margin, y); ctx.stroke()
    y += lineH * 0.6

    for (const name of players) {
      const s = pStats[name] ?? { kills:0, aces:0, blocks:0, attackErrors:0, serviceErrors:0, points:0 }
      text(name,                               c[0], { size: 12 })
      text(String(s.kills),                    c[1], { size: 12 })
      text(String(s.aces),                     c[2], { size: 12 })
      text(String(s.blocks),                   c[3], { size: 12 })
      text(String(s.attackErrors + s.serviceErrors), c[4], { size: 12, color: '#dc2626' })
      text(String(s.points),                   c[5], { size: 12, bold: true, color: '#16a34a' })
      y += lineH
    }
    text('K=Kills  A=Aces  B=Blocks  Err=Errors  Pts=K+A+B', margin, { size: 9, color: '#aaa' })
    y += lineH
    rule()

    // Rotation stats
    section('ROTATION PERFORMANCE')
    const rc = [margin, margin + 140*scale, margin + 190*scale, margin + 235*scale]
    const rHeaders = ['Server', '+Pts', '-Pts', 'Net']
    rHeaders.forEach((h, i) => text(h, rc[i], { size: 10, bold: true, color: '#888' }))
    y += lineH * 0.9
    ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(W - margin, y); ctx.stroke()
    y += lineH * 0.6

    for (let i = 0; i < rStats.length; i++) {
      const r = rStats[i]
      const rotated = [...match.startingLineup.slice(r.rotationIndex), ...match.startingLineup.slice(0, r.rotationIndex)]
      const server = rotated[0]
      const netStr = r.net > 0 ? `+${r.net}` : String(r.net)
      const badge = i === 0 ? ' ★' : (i === rStats.length - 1 && r.net < 0 ? ' ▼' : '')
      const netColor = r.net >= 0 ? '#16a34a' : '#dc2626'

      text(server + badge, rc[0], { size: 12, bold: i === 0 })
      text(String(r.ptsFor),    rc[1], { size: 12, color: '#16a34a' })
      text(String(r.ptsAgainst),rc[2], { size: 12, color: '#dc2626' })
      text(netStr,              rc[3], { size: 12, bold: true, color: netColor })
      y += lineH
    }

    // Share or download
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], `vball-${match.opponent}-${match.date}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Match Report' })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        a.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  }

  if (!match) return <div className="p-8 text-center text-gray-400">Loading...</div>

  const playerStats = computePlayerStats(match)
  const rotationStats = computeRotationStats(match)
  const setsUs = match.sets.filter((s) => s.score[0] > s.score[1]).length
  const setsThem = match.sets.filter((s) => s.score[1] > s.score[0]).length
  const resultColor = match.result === 'win' ? 'text-green-600' : match.result === 'loss' ? 'text-red-500' : 'text-gray-400'
  const resultLabel = match.result === 'win' ? 'WIN' : match.result === 'loss' ? 'LOSS' : '—'

  const allRosterWithStats = match.roster.filter((name) =>
    match.startingLineup.includes(name)
  )

  return (
    <main className="flex flex-col min-h-dvh p-4">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/" className="text-gray-400 text-xl">←</Link>
        <h1 className="text-xl font-bold">Match Report</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-lg font-bold">vs {match.opponent}</div>
          <div className="text-sm text-gray-500">{match.date}</div>
          <div className={`text-2xl font-black mt-1 ${resultColor}`}>
            {resultLabel} {setsUs}–{setsThem}
          </div>
        </div>

        {/* Sets */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">Sets</h2>
          <div className="flex flex-col gap-1">
            {match.sets.map((s) => (
              <div key={s.setNumber} className="flex justify-between text-sm px-1">
                <span className="text-gray-500">Set {s.setNumber}</span>
                <span className="font-semibold">
                  US {s.score[0]} – {s.score[1]} THEM
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Player stats */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">Player Stats</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-100">
                  <th className="text-left py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">K</th>
                  <th className="py-2 font-medium">A</th>
                  <th className="py-2 font-medium">B</th>
                  <th className="py-2 font-medium">Err</th>
                  <th className="py-2 font-medium text-green-600">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allRosterWithStats.map((name) => {
                  const s = playerStats[name] ?? { kills: 0, aces: 0, blocks: 0, attackErrors: 0, serviceErrors: 0, points: 0 }
                  return (
                    <tr key={name} className="text-center">
                      <td className="text-left py-2 font-medium">{name}</td>
                      <td className="py-2">{s.kills}</td>
                      <td className="py-2">{s.aces}</td>
                      <td className="py-2">{s.blocks}</td>
                      <td className="py-2 text-red-400">{s.attackErrors + s.serviceErrors}</td>
                      <td className="py-2 font-bold text-green-600">{s.points}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-1">K=Kills A=Aces B=Blocks Err=Errors Pts=K+A+B</p>
          </div>
        </div>

        {/* Rotation stats */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">Rotation Performance</h2>
          <div className="flex flex-col gap-1">
            {rotationStats.map((r, i) => {
              const rotatedLineup = [
                ...match.startingLineup.slice(r.rotationIndex),
                ...match.startingLineup.slice(0, r.rotationIndex),
              ]
              const server = rotatedLineup[0]
              const isTop = i === 0
              const isBottom = i === rotationStats.length - 1
              return (
                <div
                  key={r.rotationIndex}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    isTop ? 'bg-green-50' : isBottom ? 'bg-red-50' : 'bg-gray-50'
                  }`}
                >
                  <span className="text-gray-400 text-xs w-4">{r.rotationIndex + 1}</span>
                  <span className="flex-1 text-gray-600 truncate text-xs">{server} serving</span>
                  <span className="text-green-600 font-medium">+{r.ptsFor}</span>
                  <span className="text-red-400 font-medium">-{r.ptsAgainst}</span>
                  <span className={`font-bold w-8 text-right ${r.net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {r.net > 0 ? `+${r.net}` : r.net}
                  </span>
                  {isTop && <span>✅</span>}
                  {isBottom && r.net < 0 && <span>⚠️</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveImage}
        className="mt-6 w-full bg-gray-800 text-white py-4 rounded-xl font-semibold active:bg-gray-900"
      >
        📸 Save Report Image
      </button>
    </main>
  )
}
