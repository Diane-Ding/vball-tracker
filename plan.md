# Volleyball Tracker — App Plan

## Overview

A live volleyball stat-tracking web app for use during matches. One person operates it courtside to log rallies, player stats, and rotations. No cloud — all data in browser (IndexedDB), with a downloadable match report at the end.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js (TypeScript) | Static export, fast dev |
| State | Zustand | Lightweight, syncs with IndexedDB |
| Local storage | IndexedDB via `idb` | Survives page refresh, no backend |
| Styling | Tailwind CSS | Mobile-first, fast |
| Report export | `jsPDF` + `html2canvas` | PDF download, no server |
| Hosting | Vercel (static) | Free, zero config |

---

## Core Features

### 1. Roster Setup
- Enter player names (name is the primary identifier — no jersey numbers)
- Roster persists in IndexedDB across sessions

### 2. New Game Flow
- Enter opponent name, date
- Choose format: best-of-3 or best-of-5 (sets end manually — no fixed point target enforced)
- Pick 6 starters from roster and set rotation order (positions 1–6)

### 3. Live Scoreboard (main screen)
- Large score display: our score vs opponent, current set, sets won
- **`Our Point`** button — logs rally, auto-advances rotation
- **`Their Point`** button — logs rally, no rotation change
- Undo last point
- **`End Set`** button — manually close the current set and start the next
- **`End Game`** button — ends the match at any point and generates a report (supports partial matches)

### 4. Rotation Tracking
- After tapping **Our Point**, rotation auto-advances (player in position 1 rotates to serve)
- Visual 6-position court grid always visible on live screen
- Each rotation slot shows the player name currently in that position
- Substitution: out of scope for v1

### 5. Player Stats (post-rally, optional)
After each point, a bottom sheet shows the current lineup to tag:
- **Kill** — player who finished the rally (our point)
- **Ace** — server who aced (our point)
- **Block** — player who blocked (our point)
- **Attack Error** — player who erred (their point)
- **Service Error** — player who served out (their point)

Tap "Skip" to dismiss without tagging. Stats are always optional.

### 6. Two Reporting Dimensions

**Individual stats** — per player across the match:
- Kills, aces, blocks, attack errors, service errors
- Points contributed (kills + aces + blocks)

**Rotation stats** — per rotation slot across the match:
- Points scored while in that rotation
- Points lost while in that rotation
- Net score differential
- Identifies strongest and weakest rotations

### 7. Match Report (export)
- Final scoreline by set
- Individual player stat table
- Rotation performance table (sorted by net differential)
- Export as PDF

### 8. Match History
- List of saved matches in IndexedDB
- Tap to review report
- Delete old matches

---

## Data Model

```ts
type Player = {
  id: string
  name: string
}

type RallyStat = {
  type: 'kill' | 'ace' | 'block' | 'attackError' | 'serviceError'
  playerName: string
}

type Rally = {
  id: string
  setNumber: number
  rotationIndex: number  // 0–5, which rotation was active
  scoreBefore: [number, number]
  point: 'us' | 'them'
  stat?: RallyStat
  timestamp: number
}

type SetResult = {
  setNumber: number
  score: [number, number]
}

type Match = {
  id: string
  date: string
  opponent: string
  format: 'bo3' | 'bo5'
  roster: string[]           // player names
  startingLineup: string[]   // 6 names, ordered by rotation position
  currentLineup: string[]    // updated as subs happen
  rotationIndex: number      // current active rotation (0–5)
  rallies: Rally[]
  sets: SetResult[]
  result?: 'win' | 'loss'
}
```

---

## Screens / Routes

| Route | Screen |
|---|---|
| `/` | Home — recent matches + New Game button |
| `/roster` | Manage team roster |
| `/game/setup` | New game setup (opponent, format, lineup) |
| `/game/[id]` | **Live tracking screen** (main use) |
| `/game/[id]/report` | Post-match report + PDF export |
| `/history` | All saved matches |

---

## UI Priorities

- **Mobile web** — large tap targets, one-thumb operable
- Score is the hero element on the live screen
- Stat bottom sheet is fast to dismiss (one tap skip)
- Rotation grid always visible without scrolling
- No dark mode (out of scope for v1)

---

## Implementation Phases

### Phase 1 — Core Tracker (MVP)
- [ ] Project scaffold (Next.js + Tailwind + Zustand + idb)
- [ ] Roster management screen
- [ ] New game setup + lineup/rotation order
- [ ] Live scoreboard with Our Point / Their Point + undo
- [ ] Auto-rotate on our point
- [ ] Manual End Set / End Game buttons (no auto-detection)
- [ ] Persist in-progress game to IndexedDB

### Phase 2 — Stats
- [ ] Post-rally stat bottom sheet (kill/ace/block/error/skip)
- [ ] Per-player stat accumulation

### Phase 3 — Report & History
- [ ] Individual stat summary
- [ ] Rotation performance table
- [ ] Match history list
- [ ] PDF export

### Phase 4 — Polish
- [ ] PWA support (installable, offline-capable)
- [ ] Haptic feedback on point tap

---

## Decisions

- **Player identity**: name only, no jersey numbers
- **Rotation**: auto-advances on every "Our Point" tap
- **Stats scope**: our team only
- **Stat types**: kills, aces, blocks, attack errors, service errors
- **Storage**: IndexedDB only, no cloud sync
- **Set/match end**: fully manual via End Set / End Game buttons — no score threshold logic
- **Partial reports**: End Game at any time generates a valid report
- **Report**: PDF download, no sharing/email
