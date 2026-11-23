# card-game-entry-23

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/q514168795/card-game-entry-23/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/q514168795/card-game-entry-23/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

## EMBERFALL — A Duel of Elements

An original, complete two-player card duel that runs entirely from local static files. Two alchemists, four elements (Ember, Tide, Grove, Storm), thirty life each. Summon elementals, cast spells, trade blows on a five-slot battlefield, and bring your rival to zero.

Everything you see is drawn by this repository: card art is generated inline with SVG and CSS gradients, names and rules are original, and sound effects are synthesised with the Web Audio API. There are no images, fonts, libraries or network requests.

### Run it

```sh
# Option 1: open game/index.html in a desktop Chrome window
# Option 2: serve it locally with Node 22
node main.ts --serve   # then visit http://localhost:8123/
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts  # hand the game in to out/
```

### Play

- Click a card in your hand, then click an empty battlefield slot to summon an elemental.
- Click a READY elemental, then click a rival elemental or the rival alchemist to attack. Each strikes once per turn.
- Spells target a foe (Cinder Bolt), sweep the board (Ember Storm), heal you (Verdant Mend) or draw cards (Arcane Insight).
- **Space** or **End Turn** passes the turn; mana refills and grows to 10; you draw one card.
- Keys: `1`–`9` play, `Space` end turn, `Esc` cancel, `Shift`+`R` restart. The `?` button shows the full rules in-game.

The keyword rules are implemented, not decorative: Rush readies on entry, Guard forces every attack onto it first, Ward ignores spell damage, Bulwark reduces each hit by 1, Swift strikes twice per turn, and Burn damages the rival alchemist on entry.

The rival is a real opponent: it manages mana, chooses cards by board state, picks favourable trades and presses its advantage. Reaching 0 life shows Victory or Defeat, both with a rematch button.

### Layout

- `main.ts` — Node 22 entrypoint: copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored kit library; also validates the bundle and can serve the game locally.
- `game/index.html`, `game/style.css`, `game/game.js` — the playable game, no dependencies.
- `vendor/makefun-game.ts` — kit-provided dossier library, copied unchanged from the competition kit.
- `screenshots/` — four real Chrome renders: title, mid-game table, victory and defeat.
- `DOSSIER.md` — design and rules dossier.

### Screenshots

| Screen | File |
| --- | --- |
| Title | `screenshots/01-title.jpg` |
| Table (mid-duel) | `screenshots/02-table.jpg` |
| Victory | `screenshots/03-victory.jpg` |
| Defeat | `screenshots/04-defeat.jpg` |

---

<sub>Entered on [make.fun](https://make.fun/?ref=q514168795&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
