# EMBERFALL — design dossier

## Idea

An original fantasy card duel between two alchemists who command four elements: Ember (aggression), Tide (defence), Grove (sustain) and Storm (tempo). Nothing is reused from an existing commercial game: the names, card text, elemental system, art, interface and sound are written and drawn for this entry.

## Complete rules

- Each alchemist starts at **30 life** with a shuffled 36-card deck (three copies of each of twelve cards) and a hand of three.
- On your turn your mana crystals refill to `min(10, round)`, all your elementals ready, and you draw one card. Running out of cards costs 2 life per draw (fatigue). Hands cap at nine cards.
- Playing an elemental costs its mana gem and places it in one of five battlefield slots. It cannot attack until the following turn unless it has **Rush**. Elementals keep damage until end of game.
- Attacking: click a ready elemental, then click a rival elemental or the rival alchemist. Against an elemental both deal their attack value to each other at once; against an alchemist the full attack value is deducted from life.
- Spell cards: **Cinder Bolt** (2 mana, 3 damage to any target), **Verdant Mend** (2, restore 5 life), **Arcane Insight** (2, draw 2), **Ember Storm** (5, 4 damage to the rival and 1 to each rival elemental).
- Card abilities are implemented mechanics, not flavour text: **Rush** (ready immediately), **Burn 1/2** (damage the rival alchemist on play), **Guard** (forces all attacks onto it first), **Ward** (ignores spell damage), **Swift** (strikes twice per turn) and **Bulwark** (each hit reduced by 1). All six are explained in the in-game rules.
- Reduce the rival to zero life to win. Losing your own last life point shows Defeat; simultaneous zero shows Draw. Win, loss and draw screens offer a rematch.
- Controls: mouse for everything; `1`–`9` select a hand card, `Space`/`Enter` end the turn, `Esc` clears a selection, `Shift`+`R` restarts, `?` opens the in-game rules.

## Opponent AI

The rival pays mana, ranks playable cards by a board-awareness score (creature stats, available targets, its own life for healing, board sweep value), places elementals in open slots, targets your weakest doomed elemental when trading is favourable, and otherwise strikes your alchemist. It acts with short pauses so its moves are visible.

## Presentation

A dark alchemical table with layered radial light, drifting ember particles, a central duelling midline, a five-slot battlefield per side, fanned hands with hover lift, glowing mana crystals, segmented life bars, cost gems, readable names and attack/health figures on every card. Card art is generated per card from inline SVG shapes and palette gradients, so the game is entirely self-contained and offline. Sound is synthesised on demand with Web Audio and can be muted.

## Files

- `main.ts` — Node 22 entrypoint, validates the bundle and serves the game.
- `game/` — static game: `index.html`, `style.css`, `game.js`.
- `vendor/makefun-game.ts` — kit-provided file, copied unchanged.
- `screenshots/` — four real Chrome renders (title, table, victory, defeat).

## Verification

The game was opened in desktop Chrome and played through its title, table, attack, spell and end screens; all screenshots in `screenshots/` are direct captures of the running game (`Page.captureScreenshot` over CDP), not mockups.
