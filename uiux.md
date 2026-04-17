# Volleyball Tracker — UI/UX Sketches

All screens are mobile-width (~390px). Navigation is bottom-tab or back-arrow only.

---

## 1. Home `/`

```
┌─────────────────────────────┐
│  🏐 Vball Tracker            │
│                             │
│  ┌───────────────────────┐  │
│  │  + New Game           │  │  ← big CTA button
│  └───────────────────────┘  │
│                             │
│  Recent Matches             │
│  ───────────────────────    │
│  ┌───────────────────────┐  │
│  │ vs Spikers  Apr 17    │  │
│  │ W  2–1                │ >│  ← tap to view report
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ vs Nets     Apr 10    │  │
│  │ L  0–2                │ >│
│  └───────────────────────┘  │
│                             │
│  ─────────────────────────  │
│  [  🏐 Home  ] [ 👥 Roster ]│  ← bottom tab bar
└─────────────────────────────┘
```

---

## 2. Roster `/roster`

```
┌─────────────────────────────┐
│  ← Roster                   │
│                             │
│  ┌─────────────────────┐    │
│  │ 🔍 Search players   │    │
│  └─────────────────────┘    │
│                             │
│  Players (8)                │
│  ───────────────────────    │
│  Anna                  ✕   │
│  ───────────────────────    │
│  Diane                 ✕   │
│  ───────────────────────    │
│  Jess                  ✕   │
│  ───────────────────────    │
│  Kai                   ✕   │
│  ───────────────────────    │
│  ...                        │
│                             │
│  ┌───────────────────────┐  │
│  │ + Add Player          │  │
│  └───────────────────────┘  │
│                             │
│  [  🏐 Home  ] [ 👥 Roster ]│
└─────────────────────────────┘
```

---

## 3. Game Setup `/game/setup`

Three steps, one screen with scroll or step indicator.

```
┌─────────────────────────────┐
│  ← New Game        1 2 3   │  ← step dots
│                             │
│  STEP 1 — Match Info        │
│                             │
│  Opponent name              │
│  ┌─────────────────────┐    │
│  │ e.g. Team Spikers   │    │
│  └─────────────────────┘    │
│                             │
│  Date                       │
│  ┌─────────────────────┐    │
│  │ Apr 17, 2026        │    │
│  └─────────────────────┘    │
│                             │
│  Format                     │
│  ┌──────────┐ ┌──────────┐  │
│  │ Best of 3│ │ Best of 5│  │  ← toggle
│  └──────────┘ └──────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │      Next →           │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

```
┌─────────────────────────────┐
│  ← New Game        1 ● 3   │
│                             │
│  STEP 2 — Pick Lineup       │
│  Select 6 starters          │
│                             │
│  ☑ Anna                    │
│  ☑ Diane                   │
│  ☑ Jess                    │
│  ☑ Kai                     │
│  ☑ Mia                     │
│  ☑ Sara                    │
│  ☐ Lily                    │
│  ☐ Tori                    │
│                             │
│  6 / 6 selected             │
│                             │
│  ┌───────────────────────┐  │
│  │      Next →           │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

```
┌─────────────────────────────┐
│  ← New Game        1 2 ●   │
│                             │
│  STEP 3 — Set Rotation      │
│  Drag to reorder            │
│                             │
│  ┌───────────────────────┐  │
│  │ 1 (Serving)  Anna   ☰│  │
│  ├───────────────────────┤  │
│  │ 2            Diane  ☰│  │
│  ├───────────────────────┤  │
│  │ 3            Jess   ☰│  │
│  ├───────────────────────┤  │
│  │ 4            Kai    ☰│  │
│  ├───────────────────────┤  │
│  │ 5            Mia    ☰│  │
│  ├───────────────────────┤  │
│  │ 6            Sara   ☰│  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │    🏐 Start Game      │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

---

## 4. Live Tracking `/game/[id]`  ← most important screen

```
┌─────────────────────────────┐
│  SET 2    vs Spikers    ↩  │  ← ↩ = undo last point
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │    14    │ │    12    │  │  ← big score
│  │   US     │ │  THEM    │  │
│  └──────────┘ └──────────┘  │
│                             │
│  Sets:  US 1 – 1 THEM       │
│                             │
│  ┌───────────────────────┐  │
│  │      OUR POINT  🏐    │  │  ← large green button
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │      THEIR POINT      │  │  ← large grey/red button
│  └───────────────────────┘  │
│                             │
│  Current Rotation           │
│  ┌────────┬────────┬──────┐ │
│  │  Kai   │  Mia   │ Sara │ │  ← back row
│  ├────────┼────────┼──────┤ │
│  │  Jess  │ Diane  │ Anna │ │  ← front row
│  └────────┴────────┴──────┘ │
│  ● Serving: Anna            │
│                             │
│  [End Set]      [End Game]  │
└─────────────────────────────┘
```

### Stat Bottom Sheet (slides up after any point)

```
┌─────────────────────────────┐
│                             │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← dimmed background
│                             │
│  ┌─────────────────────────┐│
│  │ ▔▔▔▔▔▔  (drag handle)  ││
│  │                         ││
│  │  Tag this point (opt.)  ││
│  │                         ││
│  │  ┌──────┐  ┌──────┐    ││  ← shown for OUR point
│  │  │ Kill │  │  Ace │    ││
│  │  └──────┘  └──────┘    ││
│  │  ┌──────┐              ││
│  │  │Block │              ││
│  │  └──────┘              ││
│  │                         ││
│  │  Who?  ─────────────── ││
│  │  ○ Anna  ○ Diane        ││
│  │  ○ Jess  ○ Kai          ││
│  │  ○ Mia   ○ Sara         ││
│  │                         ││
│  │  [  Skip  ] [ Save ✓ ] ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

> For THEIR point: shows Attack Error / Service Error instead of Kill/Ace/Block.

---

## 5. Match Report `/game/[id]/report`

```
┌─────────────────────────────┐
│  ← Match Report             │
│  vs Spikers · Apr 17        │
│  WIN  2–1                   │
│                             │
│  Sets                       │
│  ─────────────────────────  │
│  Set 1   US 25 – 22 THEM    │
│  Set 2   US 18 – 25 THEM    │
│  Set 3   US 11 –  9 THEM    │
│                             │
│  Player Stats               │
│  ─────────────────────────  │
│  Name   K  A  B  Err  Pts   │
│  Anna   5  1  2   1    8    │
│  Diane  3  2  0   2    5    │
│  Jess   2  0  1   0    3    │
│  ...                        │
│                             │
│  Rotation Performance       │
│  ─────────────────────────  │
│  Rot  +Pts  -Pts  Net       │
│   1    12     7   +5  ✅    │  ← best
│   2     9     6   +3        │
│   3     8     8    0        │
│   4     7    10   -3        │
│   5     5     9   -4        │
│   6     4    11   -7  ⚠️   │  ← weakest
│                             │
│  ┌───────────────────────┐  │
│  │  📄 Export PDF        │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

---

## 6. Match History `/history`

Accessible from Home by tapping a past match, or via a History tab.

```
┌─────────────────────────────┐
│  Match History              │
│                             │
│  ┌───────────────────────┐  │
│  │ vs Spikers  Apr 17    │  │
│  │ WIN   2–1          >  │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ vs Nets     Apr 10    │  │
│  │ LOSS  0–2          >  │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ vs Aces     Apr 3     │  │
│  │ WIN   2–0          >  │  │
│  └───────────────────────┘  │
│                             │
│  (swipe left to delete)     │
│                             │
│  [  🏐 Home  ] [ 👥 Roster ]│
└─────────────────────────────┘
```

---

## Navigation Summary

```
Home
 ├── New Game → Setup (3 steps) → Live Tracking → Report
 ├── Past Match → Report
 └── Roster (tab)
```
