// SPDX-License-Identifier: MIT
// EMBERFALL — make.fun entry program (Node 22, standard library only).
// The game itself is the game/ folder beside this file: plain static files a
// desktop browser runs offline with no network request. This program hands it
// in: it copies game/ and screenshots/ to the output directory and writes
// dossier.json with the kit's vendored library, exactly as the scorer expects.
//
//   node main.ts                        // hand in to /output (or $MAKEFUN_OUTPUT_DIR)
//   node main.ts --serve                // also serve the game at http://localhost:8123/
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   // local dry run

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { buildDossier } from './vendor/makefun-game.ts';

const ROOT = dirname(fileURLToPath(import.meta.url));
const GAME_DIR = join(ROOT, 'game');
const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The bounty's own caps (kit reference/gate.json). Only text_max_bytes shapes
// the dossier; the others refuse an entry the scorer would refuse.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

export function imageSize(path: string): [number, number] {
  const b = readFileSync(path);
  if (b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG')
    return [b.readUInt32BE(16), b.readUInt32BE(20)];
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1]; i += 2;
    if (m === 0xd8 || m === 0xd9 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) continue;
    const len = b.readUInt16BE(i);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
      return [b.readUInt16BE(i + 5), b.readUInt16BE(i + 3)];
    i += len;
  }
  return [0, 0];
}

export function validate(): string[] {
  const problems: string[] = [];
  for (const f of ['index.html', 'style.css', 'game.js']) {
    const p = join(GAME_DIR, f);
    if (!existsSync(p) || statSync(p).size === 0) problems.push(`bad game/${f}`);
  }
  const html = existsSync(join(GAME_DIR, 'index.html'))
    ? readFileSync(join(GAME_DIR, 'index.html'), 'utf8') : '';
  if (html && !/<script[^>]+game\.js/.test(html)) problems.push('index.html does not load game.js');
  if (!existsSync(join(ROOT, 'vendor', 'makefun-game.ts'))) problems.push('missing vendor/makefun-game.ts');
  const shotDir = join(ROOT, 'screenshots');
  if (!existsSync(shotDir)) problems.push('missing screenshots/');
  else {
    const entries = readdirSync(shotDir).filter(f => !f.startsWith('.'));
    const shots = entries.filter(f => /\.(png|jpe?g)$/i.test(f));
    for (const f of entries)
      if (!/\.(png|jpe?g)$/i.test(f)) problems.push(`non-image file in screenshots/: ${f}`);
    if (shots.length < 3 || shots.length > CAPS.screenshots.max)
      problems.push(`expected 3-${CAPS.screenshots.max} screenshots, found ${shots.length}`);
    for (const f of shots) {
      const p = join(shotDir, f);
      if (!/^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/.test(f))
        problems.push(`bad screenshot filename ${f}`);
      if (statSync(p).size > CAPS.screenshots.max_bytes)
        problems.push(`screenshot ${f} exceeds ${CAPS.screenshots.max_bytes} bytes`);
      const [w, h] = imageSize(p);
      if (w === 0 || Math.max(w, h) > 1280 || Math.min(w, h) < 480)
        problems.push(`screenshot ${f} has invalid dimensions ${w}x${h}`);
    }
  }
  return problems;
}

export function handIn() {
  const problems = validate();
  if (problems.length) throw new Error('Invalid Emberfall bundle: ' + problems.join('; '));
  mkdirSync(OUT, { recursive: true });
  // Clear stale copies first so renamed/deleted files cannot leak into the dossier.
  for (const sub of ['game', 'screenshots'])
    rmSync(join(OUT, sub), { recursive: true, force: true });
  cpSync(GAME_DIR, join(OUT, 'game'), { recursive: true });
  mkdirSync(join(OUT, 'screenshots'), { recursive: true });
  cpSync(join(ROOT, 'screenshots'), join(OUT, 'screenshots'), { recursive: true });
  const dossier = buildDossier(OUT, CAPS);
  writeFileSync(join(OUT, 'dossier.json'), dossier);
  console.log(`Emberfall handed in to ${OUT}: game/, screenshots/, dossier.json (${Buffer.byteLength(dossier)} bytes)`);
}

export function serve(port = 8123) {
  const types: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png' };
  const root = resolve(GAME_DIR);
  const server = createServer((req, res) => {
    const url = (req.url || '/').split('?')[0];
    const rel = url === '/' ? 'index.html' : url.replace(/^\/+/, '');
    const file = resolve(GAME_DIR, rel);
    if ((file !== root && !file.startsWith(root + sep)) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' }); res.end('Not found'); return;
    }
    const ext = rel.slice(rel.lastIndexOf('.'));
    res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  });
  server.listen(port, () => console.log(`Emberfall playing at http://localhost:${port}/`));
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  // `node main.ts --serve` is a local-only convenience: don't try to write /output.
  const serving = process.argv.includes('--serve');
  if (!serving || process.env.MAKEFUN_OUTPUT_DIR != null) handIn();
  if (serving) serve(Number(process.env.PORT || 8123));
}
