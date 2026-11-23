/* SPDX-License-Identifier: MIT */
/* EMBERFALL — a complete two-player elemental card duel.
   Original rules, art (inline SVG/CSS), names and sound. No network, no assets. */
'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // A Guard elemental forces every attack (not every spell) to hit it first.
  function guardSlots(who) {
    return S[who].board.map((u, i) => u && (LIB[u.key].ability || '').includes('Guard') ? i : -1).filter(i => i >= 0);
  }

  /* ---------------- card library ---------------- */
  const LIB = {
    wisp:      { name:'Ember Wisp',   cost:1, type:'creature', race:'Sprite',  element:'ember', atk:2, hp:1, art:'flame',   ability:'Rush' },
    squire:    { name:'Tide Squire',  cost:2, type:'creature', race:'Guard',   element:'tide',  atk:1, hp:3, art:'wave',    ability:'Guard' },
    imp:       { name:'Cinder Imp',   cost:2, type:'creature', race:'Imp',     element:'ember', atk:3, hp:1, art:'imp',     ability:'Burn 1' },
    keeper:    { name:'Grove Keeper', cost:3, type:'creature', race:'Warden',  element:'grove', atk:2, hp:4, art:'leaf',    ability:'Ward' },
    stag:      { name:'Moonlit Stag', cost:3, type:'creature', race:'Beast',   element:'grove', atk:3, hp:3, art:'moon',    ability:'Swift · 2 strikes' },
    herald:    { name:'Storm Herald', cost:4, type:'creature', race:'Scout',   element:'storm', atk:4, hp:2, art:'bolt',    ability:'Rush' },
    golem:     { name:'Rune Golem',   cost:5, type:'creature', race:'Construct',element:'storm', atk:4, hp:6, art:'shield',  ability:'Bulwark' },
    phoenix:   { name:'Ash Phoenix',  cost:6, type:'creature', race:'Avatar',  element:'ember', atk:6, hp:5, art:'phoenix', ability:'Burn 2 · Rush' },
    bolt:      { name:'Cinder Bolt',  cost:2, type:'spell', element:'ember', art:'bolt',  text:'Deal 3 damage to a rival target.' },
    mend:      { name:'Verdant Mend', cost:2, type:'spell', element:'grove', art:'leaf',  text:'Restore 5 life to your alchemist.' },
    insight:   { name:'Arcane Insight',cost:2, type:'spell', element:'storm', art:'star',  text:'Draw 2 cards.' },
    storm:     { name:'Ember Storm',  cost:5, type:'spell', element:'ember', art:'storm', text:'Deal 4 to the rival and 1 to each of their elementals.' }
  };
  const POOL = Object.keys(LIB);
  const PALETTE = {
    ember:['#ffe0a3','#ff7a3c','#4a160e'], tide:['#c8f4ff','#3fa9d6','#0a2b45'],
    grove:['#d6ffc4','#5cb85c','#12351c'], storm:['#ecdcff','#a06ce0','#2c1647']
  };
  const SHAPES = {
    flame:'<path d="M60 6 C74 28 50 32 64 46 C74 56 58 70 60 72 C42 64 38 46 52 32 C44 40 44 22 60 6Z"/><path d="M60 38 C66 48 56 52 60 62 C50 56 52 44 60 38Z" fill="#fff" opacity=".65"/>',
    wave:'<path d="M4 46 Q24 28 44 46 T84 46 T124 46 L124 78 L4 78Z" opacity=".75"/><path d="M4 58 Q24 40 44 58 T84 58 T124 58" fill="none" stroke="#ffffff" stroke-width="2.5" opacity=".55"/>',
    leaf:'<path d="M60 72 C16 68 16 28 60 6 C104 28 104 68 60 72Z"/><path d="M60 68 L60 14 M60 44 L38 30 M60 50 L82 36" fill="none" stroke="#0d2a16" stroke-width="2" opacity=".75"/>',
    bolt:'<path d="M68 4 L36 42 H56 L48 74 L86 28 H64 Z"/><circle cx="60" cy="40" r="30" fill="none" stroke="#fff" stroke-width="1" opacity=".35"/>',
    star:'<path d="M60 6 L68 30 L94 30 L74 46 L82 70 L60 56 L38 70 L46 46 L26 30 L52 30 Z"/><circle cx="60" cy="39" r="6" fill="#fff" opacity=".8"/>',
    moon:'<path d="M72 6 A34 34 0 1 0 72 72 A27 27 0 1 1 72 6Z"/><circle cx="90" cy="18" r="2" fill="#fff"/><circle cx="98" cy="34" r="1.5" fill="#fff"/>',
    shield:'<path d="M60 4 L96 20 V46 C96 66 78 74 60 78 C42 74 24 66 24 46 V20Z"/><path d="M60 16 L60 62 M36 32 H84" fill="none" stroke="#0f1630" stroke-width="3" opacity=".65"/>',
    imp:'<path d="M42 26 L28 4 L50 18Z M78 26 L92 4 L70 18Z"/><circle cx="60" cy="38" r="19"/><path d="M38 74 Q60 48 82 74Z"/><circle cx="53" cy="36" r="2.6" fill="#1a0a0a"/><circle cx="67" cy="36" r="2.6" fill="#1a0a0a"/>',
    phoenix:'<path d="M60 4 C84 16 100 34 92 56 L70 42 L80 72 L60 58 L40 72 L50 42 L28 56 C20 34 36 16 60 4Z"/><circle cx="60" cy="32" r="7" fill="#fff" opacity=".8"/>',
    storm:'<path d="M26 46 Q28 24 50 26 Q62 8 84 24 Q104 22 102 46Z"/><path d="M64 40 L46 64 H58 L50 78 L82 48 H68Z"/><path d="M20 52 L14 60 M100 54 L106 62" stroke="#fff" stroke-width="2" fill="none"/>'
  };
  let artSeq = 0;
  function artSVG(key, element) {
    const p = PALETTE[element], id = 'ag' + (++artSeq);
    return `<svg viewBox="0 0 120 78" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><radialGradient id="${id}" cx="50%" cy="42%" r="72%">
        <stop offset="0" stop-color="${p[1]}" stop-opacity=".85"/><stop offset="1" stop-color="${p[2]}"/>
      </radialGradient></defs>
      <rect width="120" height="78" fill="url(#${id})"/>
      <g fill="${p[0]}" stroke="${p[0]}" stroke-width="1.5" stroke-linejoin="round" opacity=".95">${SHAPES[key] || SHAPES.star}</g>
      <g fill="#fff" opacity=".5"><circle cx="16" cy="14" r="1.7"/><circle cx="104" cy="60" r="1.4"/><circle cx="92" cy="12" r="1"/><circle cx="26" cy="68" r="1.1"/></g>
    </svg>`;
  }
  function cardHTML(defKey, inst, extraCls = '') {
    const d = LIB[defKey];
    const creature = d.type === 'creature';
    const atk = inst ? inst.atk : d.atk, hp = inst ? inst.hp : d.hp;
    const stats = creature
      ? `<div class="stats"><span class="atk">${atk}</span><span class="hp">${hp}</span></div>` : '';
    const buffs = inst ? `<div class="card-buffs">${inst.ready ? 'READY' : 'REST'}</div>` : '';
    return `<div class="card ${d.element} ${extraCls}">
      <div class="cost">${d.cost}</div>
      <div class="cname">${d.name}</div>
      <div class="art">${artSVG(d.art, d.element)}</div>
      <div class="type">${creature ? d.race + ' · ELEMENTAL' : 'ARCANE SPELL'}</div>
      <div class="rules">${creature ? d.ability : d.text}</div>
      ${stats}${buffs}</div>`;
  }

  /* ---------------- state ---------------- */
  let S, seq = 0, soundOn = true, audio = null;
  function shuffled(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function makeDeck() { const out = []; for (const k of POOL) for (let n = 0; n < 3; n++) out.push(k); return shuffled(out); }
  function side(life) { return { life, maxLife:30, mana:0, maxMana:0, deck:makeDeck(), hand:[], board:new Array(5).fill(null) }; }
  function newGame() {
    S = { token:++seq, turn:'player', round:1, player:side(30), enemy:side(30),
          selHand:-1, selAtk:-1, targeting:null, over:false, screen:'title',
          log:'The duel begins. Your move, alchemist.',
          stats:{ played:0, damage:0, killed:0 } };
  }
  function uid() { return 'e' + (++seq); }
  function spawn(key) { const d = LIB[key]; return { uid:uid(), key, atk:d.atk, hp:d.hp, maxHp:d.hp, ready:false, attacksLeft:1 }; }
  function readyUp(u) { u.ready = true; u.attacksLeft = (LIB[u.key].ability || '').includes('Swift') ? 2 : 1; }
  function draw(who, n) {
    const s = S[who];
    for (let i = 0; i < n; i++) {
      if (s.deck.length === 0) { s.life -= 2; floatText(who, '-2', 'dmg'); log(`${who === 'player' ? 'You' : 'Your rival'} take 2 fatigue damage.`); continue; }
      if (s.hand.length >= 9) { s.deck.pop(); log('A card is burned — hand is full.'); continue; }
      s.hand.push(s.deck.pop());
    }
  }
  function log(t) { if (S) S.log = t; }
  function beep(freq = 440, dur = .08, type = 'sine', gain = .05) {
    if (!soundOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = type; o.frequency.value = freq; g.gain.value = gain;
      o.connect(g); g.connect(audio.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + dur); o.stop(audio.currentTime + dur);
    } catch (_) {}
  }
  function floatText(who, txt, kind) {
    const host = who === 'player' ? $('#player-hero') : $('#enemy-hero');
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'fx-float ' + (kind || ''); el.textContent = txt;
    el.style.left = (40 + Math.random() * 40) + '%'; el.style.top = '12%';
    host.appendChild(el); setTimeout(() => el.remove(), 1000);
  }

  /* ---------------- screens ---------------- */
  function show(name) {
    S.screen = name;
    for (const s of ['title', 'battle', 'end']) $('#screen-' + s).classList.toggle('active', s === name);
  }
  function startGame() {
    newGame(); show('battle');
    draw('player', 3); draw('enemy', 3);
    S.player.mana = 1; S.player.maxMana = 1;
    log('Round 1 — you have 1 mana. Play a card or end your turn.');
    renderBattle(); beep(520, .12, 'triangle');
  }
  function restart() { startGame(); }

  /* ---------------- rendering ---------------- */
  function heroHTML(who) {
    const s = S[who], enemy = who === 'enemy';
    const crystals = Array.from({ length: Math.max(s.maxMana, s.mana) }, (_, i) => `<div class="crystal ${i < s.mana ? 'on' : ''}"></div>`).join('');
    return `<div class="hero ${enemy ? 'enemy' : ''}" data-act="hero" data-side="${who}">
      <div class="hero-top">
        <div class="portrait">${enemy ? '☾' : '✦'}</div>
        <div><div class="hero-name">${enemy ? 'THE ASHEN RIVAL' : 'YOU · THE ALCHEMIST'}</div>
          <div class="hero-role">${enemy ? 'Opponent' : 'Your champion'}</div></div>
        <div style="margin-left:auto" class="hero-life">${Math.max(0, s.life)}<small>/${s.maxLife}</small></div>
      </div>
      <div class="life-track"><div class="life-fill" style="width:${Math.max(0, s.life) / s.maxLife * 100}%"></div></div>
      <div class="mana-row">${crystals}<span class="mana-text">${s.mana}/${s.maxMana} MANA</span></div>
    </div>`;
  }
  function handHTML(who) {
    const s = S[who];
    if (who === 'enemy') return s.hand.map(() => '<div class="card-back">◆</div>').join('');
    return s.hand.map((key, i) => cardHTML(key, null,
      (S.selHand === i ? 'selected ' : '') + (LIB[key].cost > s.mana ? 'unplayable' : '')))
      .map((h, i) => h.replace('class="card ', `data-act="hand" data-i="${i}" class="card `)).join('');
  }
  function boardHTML(who) {
    const s = S[who];
    return s.board.map((inst, i) => {
      if (!inst) {
        const canPlay = who === 'player' && S.selHand >= 0 && LIB[S.player.hand[S.selHand]]?.type === 'creature';
        return `<div class="slot ${canPlay ? 'target-ok' : ''}" data-act="${canPlay ? 'play-slot' : 'noop'}" data-i="${i}">
          <span class="empty-glyph">${canPlay ? '+' : '◇'}</span></div>`;
      }
      const mine = who === 'player';
      const canAttack = mine && S.turn === 'player' && inst.ready && !S.over && S.targeting == null;
      const attacking = S.selAtk >= 0 && S.player.board[S.selAtk]?.ready;
      const guards = !mine && attacking ? guardSlots('enemy') : [];
      const targetable = !mine && ((attacking && (!guards.length || guards.includes(i))) || (S.targeting != null));
      let act = 'noop';
      if (canAttack) act = 'select-attacker';
      else if (targetable) act = 'target-creature';
      const cls = inst.ready ? 'ready' : 'exhausted';
      return `<div class="slot" data-act="${act}" data-i="${i}" data-side="${who}">
        <div class="card ${LIB[inst.key].element} ${cls} ${S.selAtk === i && mine ? 'attacker' : ''}" data-inst="${inst.uid}">
          <div class="cost">${LIB[inst.key].cost}</div><div class="cname">${LIB[inst.key].name}</div>
          <div class="art">${artSVG(LIB[inst.key].art, LIB[inst.key].element)}</div>
          <div class="type">${LIB[inst.key].race} · ELEMENTAL</div>
          <div class="rules">${LIB[inst.key].ability || ''}</div>
          <div class="stats"><span class="atk">${inst.atk}</span><span class="hp">${inst.hp}</span></div>
          <div class="card-buffs">${inst.ready ? 'READY' : 'REST'}</div>
        </div></div>`;
    }).join('');
  }
  function deckHTML(who) {
    const s = S[who];
    return `<div class="deck-pile"><span class="deck-glyph">✦</span><span class="deck-count">${s.deck.length}</span></div>
      <div class="deck-label">${who === 'player' ? 'YOUR DECK' : 'RIVAL DECK'}</div>`;
  }
  function renderBattle() {
    if (!S) return;
    $('#enemy-hero').innerHTML = heroHTML('enemy');
    $('#player-hero').innerHTML = heroHTML('player');
    $('#enemy-hand').innerHTML = handHTML('enemy');
    $('#player-hand').innerHTML = handHTML('player');
    $('#enemy-board').innerHTML = boardHTML('enemy');
    $('#player-board').innerHTML = boardHTML('player');
    $('#enemy-deck').innerHTML = deckHTML('enemy');
    $('#player-deck').innerHTML = deckHTML('player');
    $('#turn-label').textContent = S.turn === 'player' ? 'YOUR TURN' : 'RIVAL TURN';
    $('#turn-label').classList.toggle('enemy', S.turn !== 'player');
    $('#round-label').textContent = 'ROUND ' + S.round;
    $('#battle-log').innerHTML = '<b>›</b> ' + S.log;
    $('#hint-bar').textContent = hint();
    $('#end-turn-btn').disabled = S.turn !== 'player' || S.over;
    $$('[data-act]').forEach(el => { el.onclick = () => handleAct(el.dataset); });
    // highlight heroes as targets
    const enemyHero = $('#enemy-hero .hero');
    const attacking = S.selAtk >= 0 && S.player.board[S.selAtk]?.ready;
    const canHitHero = S.targeting != null || (attacking && guardSlots('enemy').length === 0);
    if (canHitHero) enemyHero?.classList.add('target-ok');
  }
  function hint() {
    if (S.over) return 'The duel is decided.';
    if (S.turn !== 'player') return 'Your rival is moving…';
    if (S.targeting) return `Choose a target for ${LIB[S.player.hand[S.targeting.i]]?.name || 'the spell'} — click a foe or their alchemist. Esc cancels.`;
    if (S.selAtk >= 0) return 'Choose a target: click a foe elemental or the rival alchemist. Esc cancels.';
    if (S.selHand >= 0) {
      const d = LIB[S.player.hand[S.selHand]];
      return 'Click an empty slot on your battlefield to summon ' + d.name + '.';
    }
    return 'Click a card to play it · click a ready elemental to attack · Space ends your turn.';
  }

  /* ---------------- actions ---------------- */
  function handleAct(d) {
    if (S.over) return;
    const a = d.act, i = Number(d.i);
    if (a === 'hand' && S.turn === 'player') {
      const key = S.player.hand[i], def = LIB[key];
      if (def.cost > S.player.mana) { log('Not enough mana for ' + def.name + '.'); renderBattle(); beep(160, .1, 'square'); return; }
      if (def.type === 'spell' && (key === 'bolt' || key === 'storm')) {
        if (S.targeting?.i === i) { S.targeting = null; S.selHand = -1; log('Targeting cancelled.'); renderBattle(); return; }
        if (key === 'storm') { S.selHand = -1; cast('storm', null); }
        else { S.selHand = i; S.targeting = { i, key }; S.selAtk = -1; log('Cinder Bolt needs a target.'); renderBattle(); }
        return;
      }
      if (def.type === 'spell') { S.selHand = -1; cast(key, null); return; }
      S.selHand = S.selHand === i ? -1 : i; S.selAtk = -1; S.targeting = null;
      log(S.selHand >= 0 ? `Summoning ${def.name} — choose a slot.` : 'Selection cleared.');
      renderBattle(); beep(560, .05);
      return;
    }
    if (a === 'play-slot' && S.selHand >= 0) { playCreature(S.selHand, i); return; }
    if (a === 'select-attacker') {
      if (S.selAtk === i) { S.selAtk = -1; log('Attack cancelled.'); }
      else { S.selAtk = i; S.targeting = null; S.selHand = -1; log(LIB[S.player.board[i].key].name + ' readies a strike.'); beep(620, .05); }
      renderBattle(); return;
    }
    if (a === 'target-creature' && d.side === 'enemy') {
      if (S.selHand >= 0 && S.selAtk < 0 && !S.targeting) { log('Click an empty slot on your battlefield to summon.'); renderBattle(); return; }
      if (S.targeting) { cast(S.targeting.key, { kind:'creature', side:'enemy', i }, S.targeting.i); return; }
      if (S.selAtk >= 0) {
        const guards = guardSlots('enemy');
        if (guards.length && !guards.includes(i)) { log('A Guard elemental blocks that strike.'); renderBattle(); return; }
        attack('player', S.selAtk, { kind:'creature', side:'enemy', i }); return;
      }
    }
    if (a === 'hero' && d.side === 'enemy' && S.turn === 'player') {
      if (S.targeting) { cast(S.targeting.key, { kind:'hero', side:'enemy' }, S.targeting.i); return; }
      if (S.selAtk >= 0) {
        if (guardSlots('enemy').length) { log('A Guard elemental blocks that strike.'); renderBattle(); return; }
        attack('player', S.selAtk, { kind:'hero', side:'enemy' }); return;
      }
    }
  }
  function spend(who, n) { S[who].mana -= n; }
  function playCreature(handIdx, slot) {
    const key = S.player.hand[handIdx], def = LIB[key];
    if (S.player.board[slot]) { log('That slot is occupied.'); renderBattle(); return; }
    if (def.cost > S.player.mana) return;
    spend('player', def.cost);
    S.player.hand.splice(handIdx, 1);
    const u = spawn(key); S.player.board[slot] = u;
    S.stats.played++;
    applyOnPlay('player', key, u);
    log(def.name + ' enters the arena.' + (u.ready ? ' It readies at once.' : ' It will ready next turn.'));
    S.selHand = -1; beep(430, .12, 'triangle');
    cleanupDead(); checkWin(); renderBattle();
  }
  function applyOnPlay(who, key, u) {
    const foe = who === 'player' ? 'enemy' : 'player';
    const d = LIB[key];
    if (!d.ability) return;
    if (d.ability.includes('Burn 1')) dealTo(foe, 'hero', 1, who);
    if (d.ability.includes('Burn 2')) dealTo(foe, 'hero', 2, who);
    if (d.ability.includes('Rush')) readyUp(u);
  }
  function cast(key, target, handIdx = -1) {
    const def = LIB[key];
    if (!def || S.player.mana < def.cost) return;
    spend('player', def.cost);
    const idx = handIdx >= 0 ? handIdx : S.player.hand.indexOf(key);
    if (idx >= 0) S.player.hand.splice(idx, 1);
    S.stats.played++;
    S.selHand = -1; S.targeting = null;
    if (key === 'bolt') {
      if (!target) return;
      const amt = 3;
      dealTo('enemy', target.kind, amt, 'player', target.i, true);
      log(`Cinder Bolt scorches ${target.kind === 'hero' ? 'the rival' : 'an elemental'} for 3.`);
    } else if (key === 'mend') {
      S.player.life = Math.min(S.player.maxLife, S.player.life + 5);
      floatText('player', '+5', 'heal'); log('Verdant Mend restores 5 life.');
    } else if (key === 'insight') {
      draw('player', 2); log('Arcane Insight draws two cards.');
    } else if (key === 'storm') {
      log('Ember Storm sweeps the rival board!');
      dealTo('enemy', 'hero', 4, 'player');
      for (let i = 0; i < 5; i++) if (S.enemy.board[i]) dealTo('enemy', 'creature', 1, 'player', i, true);
    }
    beep(300, .18, 'sawtooth');
    cleanupDead(); checkWin(); renderBattle();
  }
  function dealTo(sideName, kind, amt, from, slot, spell = false) {
    const s = S[sideName];
    if (kind === 'hero') { s.life -= amt; floatText(sideName, '-' + amt, 'dmg'); if (from === 'player') S.stats.damage += amt; }
    else {
      const u = s.board[slot]; if (!u) return;
      const ability = LIB[u.key].ability || '';
      if (spell && ability.includes('Ward')) { log(LIB[u.key].name + ' wards off the spell.'); return; }
      const actual = ability.includes('Bulwark') ? Math.max(0, amt - 1) : amt;
      u.hp -= actual;
      const hostEl = $(`.slot[data-side="${sideName}"][data-i="${slot}"]`);
      if (hostEl) { const f = document.createElement('div'); f.className = 'fx-float dmg'; f.textContent = '-' + actual; hostEl.appendChild(f); setTimeout(() => f.remove(), 950); }
    }
  }
  function cleanupDead() {
    for (const sideName of ['player', 'enemy']) {
      for (let i = 0; i < 5; i++) {
        const u = S[sideName].board[i];
        if (u && u.hp <= 0) {
          if (sideName === 'enemy' && S.stats) S.stats.killed++;
          S[sideName].board[i] = null;
        }
      }
    }
  }
  function attack(who, slot, target) {
    const attacker = S[who].board[slot];
    if (!attacker || !attacker.ready || S.over) return;
    attacker.attacksLeft--;
    attacker.ready = attacker.attacksLeft > 0;
    const foe = who === 'player' ? 'enemy' : 'player';
    const name = LIB[attacker.key].name;
    if (target.kind === 'hero') {
      dealTo(foe, 'hero', attacker.atk, who);
      log(`${name} strikes the ${foe === 'enemy' ? 'rival' : 'alchemist'} for ${attacker.atk}.`);
    } else {
      const victim = S[foe].board[target.i];
      if (!victim) { readyUp(attacker); renderBattle(); return; }
      const vAtk = victim.atk;
      dealTo(foe, 'creature', attacker.atk, who, target.i);
      dealTo(who, 'creature', vAtk, foe, slot);
      log(`${name} clashes with ${LIB[victim.key].name}.`);
    }
    beep(210, .12, 'square', .07);
    S.selAtk = -1; S.targeting = null;
    cleanupDead(); checkWin(); renderBattle();
  }
  function checkWin() {
    const p = S.player.life <= 0, e = S.enemy.life <= 0;
    if (!p && !e) return;
    S.over = true;
    const drawGame = p && e;
    const win = !p;
    $('#screen-end').classList.toggle('defeat', !win);
    $('#end-eyebrow').textContent = drawGame ? 'BOTH ALCHEMISTS FALL' : (win ? 'THE EMBER IS YOURS' : 'YOUR FLAME GOES OUT');
    $('#end-title').textContent = drawGame ? 'DRAW' : (win ? 'VICTORY' : 'DEFEAT');
    $('#end-sub').textContent = drawGame ? 'Neither alchemist stands. The arena falls silent.'
      : win ? 'The Ashen Rival bows to the elements you commanded.'
            : 'The Ashen Rival stands amid the cinders. Another duel awaits.';
    $('#end-stats').innerHTML =
      `<div><b>${Math.max(0, S.player.life)}</b><span>Your life</span></div>
       <div><b>${S.round}</b><span>Rounds</span></div>
       <div><b>${S.stats.played}</b><span>Cards played</span></div>
       <div><b>${S.stats.damage}</b><span>Damage dealt</span></div>`;
    const tok = S.token;
    setTimeout(() => { if (S.over && S.token === tok) show('end'); }, 650);
    beep(win ? 660 : 140, .5, win ? 'triangle' : 'sawtooth', .08);
  }

  /* ---------------- turn flow & rival AI ---------------- */
  function beginTurn(who) {
    if (S.over) return;
    S.turn = who; S.selHand = -1; S.selAtk = -1; S.targeting = null;
    if (who === 'player') {
      S.round++;
      S.player.maxMana = Math.min(10, S.round);
      S.player.mana = S.player.maxMana;
      for (const u of S.player.board) if (u) readyUp(u);
      draw('player', 1);
      checkWin(); if (S.over) { renderBattle(); return; }
      log('Your turn — mana refilled. Draw a card and make your move.');
    } else {
      S.enemy.maxMana = Math.min(10, S.round);
      S.enemy.mana = S.enemy.maxMana;
      for (const u of S.enemy.board) if (u) readyUp(u);
      draw('enemy', 1);
      checkWin(); if (S.over) { renderBattle(); return; }
      log('The Ashen Rival takes their turn…');
    }
    renderBattle(); beep(who === 'player' ? 600 : 220, .09, 'triangle');
    if (who === 'enemy') aiTurn();
  }
  function endTurn() {
    if (S.turn !== 'player' || S.over) return;
    log('You end your turn.');
    beginTurn('enemy');
  }
  function aiScore(key) {
    const d = LIB[key];
    if (d.type === 'creature') return d.atk * 2 + d.hp + d.cost * .4;
    if (key === 'storm') return S.player.board.filter(Boolean).length >= 2 ? 11 : 4;
    if (key === 'bolt') return S.player.board.some(u => u && u.hp <= 3) ? 9 : 5;
    if (key === 'mend') return S.enemy.life <= 22 ? 8 : 1;
    return 4;
  }
  async function aiTurn() {
    const token = S.token;
    const alive = () => !S.over && S.token === token;
    await sleep(520); if (!alive()) return;
    for (let guard = 0; guard < 10; guard++) {
      const opts = S.enemy.hand.map((k, i) => ({ k, i })).filter(o =>
        LIB[o.k].cost <= S.enemy.mana &&
        !(o.k === 'mend' && S.enemy.life >= 27) &&
        !(o.k === 'insight' && S.enemy.hand.length >= 8) &&
        (S.enemy.board.indexOf(null) >= 0 || LIB[o.k].type !== 'creature'));
      if (!opts.length) break;
      opts.sort((a, b) => aiScore(b.k) - aiScore(a.k));
      const { k, i } = opts[0], d = LIB[k];
      if (d.type === 'creature') {
        const slot = S.enemy.board.indexOf(null);
        if (slot < 0) break;
        S.enemy.mana -= d.cost; S.enemy.hand.splice(i, 1);
        const u = spawn(k); S.enemy.board[slot] = u;
        applyOnPlay('enemy', k, u);
        log('Your rival summons ' + d.name + '.');
      } else {
        S.enemy.mana -= d.cost; S.enemy.hand.splice(i, 1);
        if (k === 'bolt') {
          if (S.player.life <= 3) {
            dealTo('player', 'hero', 3, 'enemy'); log('Cinder Bolt finishes you for 3.');
          } else {
            let best = -1, bestScore = -1;
            for (let j = 0; j < 5; j++) {
              const u = S.player.board[j];
              if (!u || (LIB[u.key].ability || '').includes('Ward')) continue;
              const kills = u.hp <= ((LIB[u.key].ability || '').includes('Bulwark') ? 2 : 3);
              const score = (kills ? 100 : 0) + u.atk;
              if (score > bestScore) { bestScore = score; best = j; }
            }
            if (best >= 0) { dealTo('player', 'creature', 3, 'enemy', best, true); log('Cinder Bolt hits your ' + LIB[S.player.board[best].key].name + '.'); }
            else { dealTo('player', 'hero', 3, 'enemy'); log('Cinder Bolt scorches you for 3.'); }
          }
        } else if (k === 'mend') {
          S.enemy.life = Math.min(30, S.enemy.life + 5); log('Your rival mends 5 life.');
        } else if (k === 'insight') {
          draw('enemy', 2); log('Your rival draws two cards.');
        } else if (k === 'storm') {
          dealTo('player', 'hero', 4, 'enemy');
          for (let j = 0; j < 5; j++) if (S.player.board[j]) dealTo('player', 'creature', 1, 'enemy', j, true);
          log('Ember Storm sweeps your board!');
        }
      }
      cleanupDead(); checkWin(); renderBattle();
      beep(340, .07, 'triangle');
      await sleep(560); if (!alive()) return;
    }
    const readyPower = S.enemy.board.reduce((n, u) => n + (u && u.ready ? u.atk * (u.attacksLeft || 1) : 0), 0);
    const playerGuards = guardSlots('player');
    const lethal = playerGuards.length === 0 && readyPower >= S.player.life;
    for (let i = 0; i < 5; i++) {
      if (!alive()) return;
      let u = S.enemy.board[i];
      if (!u || !u.ready) continue;
      let strikes = 0;
      while (alive() && (u = S.enemy.board[i]) && u.ready && strikes++ < 3) {
        const guards = guardSlots('player');
        let best = -1, bestScore = -99;
        for (let j = 0; j < 5; j++) {
          const v = S.player.board[j]; if (!v) continue;
          if (guards.length && !guards.includes(j)) continue;
          const va = LIB[v.key].ability || '';
          const ua = LIB[u.key].ability || '';
          const effAtk = va.includes('Bulwark') ? Math.max(0, u.atk - 1) : u.atk;
          const effVAtk = ua.includes('Bulwark') ? Math.max(0, v.atk - 1) : v.atk;
          const sc = (effAtk >= v.hp ? 6 : 0) - (effVAtk >= u.hp ? 5 : 0) + u.atk * .7 + (va.includes('Guard') ? 3 : 0);
          if (sc > bestScore) { bestScore = sc; best = j; }
        }
        const target = guards.length
          ? { kind:'creature', side:'player', i: best >= 0 ? best : guards[0] }
          : (!lethal && best >= 0 && bestScore > 0 ? { kind:'creature', side:'player', i:best } : { kind:'hero', side:'player' });
        attack('enemy', i, target);
        await sleep(520);
      }
    }
    if (alive()) { await sleep(320); if (alive()) beginTurn('player'); }
  }

  /* ---------------- input ---------------- */
  $('#btn-start').onclick = startGame;
  $('#btn-again').onclick = restart;
  $('#btn-rules').onclick = () => $('#rules-modal').classList.remove('hidden');
  $('#btn-rules-title').onclick = () => $('#rules-modal').classList.remove('hidden');
  $('#rules-close').onclick = () => $('#rules-modal').classList.add('hidden');
  $('#end-turn-btn').onclick = endTurn;
  $('#btn-sound').onclick = () => { soundOn = !soundOn; $('#btn-sound').textContent = soundOn ? '♪' : '✕'; };
  document.addEventListener('keydown', e => {
    if (!$('#rules-modal').classList.contains('hidden')) {
      if (e.key === 'Escape') $('#rules-modal').classList.add('hidden');
      return;
    }
    if (e.key === 'Escape') {
      $('#rules-modal').classList.add('hidden');
      if (S) { S.selHand = -1; S.selAtk = -1; S.targeting = null; if (S.screen === 'battle') renderBattle(); }
      return;
    }
    if (S?.screen === 'title' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); startGame(); return; }
    if (S?.screen === 'end' && e.key === 'Enter') { restart(); return; }
    if (S?.screen !== 'battle' || S.over || S.turn !== 'player') return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); endTurn(); return; }
    if (e.key === 'R' && e.shiftKey) { restart(); return; }
    if (/^[1-9]$/.test(e.key)) {
      const i = Number(e.key) - 1;
      if (i < S.player.hand.length) handleAct({ act:'hand', i:String(i) });
    }
  });

  /* ---------------- ambient particles ---------------- */
  (function embers() {
    const host = $('#embers');
    for (let i = 0; i < 28; i++) {
      const e = document.createElement('div'); e.className = 'ember';
      e.style.left = (Math.random() * 100) + '%';
      e.style.animationDuration = (7 + Math.random() * 11) + 's';
      e.style.animationDelay = (-Math.random() * 16) + 's';
      e.style.width = e.style.height = (2 + Math.random() * 4) + 'px';
      host.appendChild(e);
    }
  })();

  newGame();
  show('title');
