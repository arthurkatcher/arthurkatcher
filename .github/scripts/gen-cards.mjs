// Generates bespoke SVG cards for the profile README.
// Theme: DARK GITHUB — #0d1117 surfaces with 1px #30363d hairline borders,
// offset yellow slab shadows, one loud yellow (#FFD500), square corners,
// marker highlights. The small project cards keep the original light
// (white card / 2px ink border) treatment; the wide blocks (banner, hero,
// journey, stack) and the terminal install cards are dark.
// Run: node scripts/gen-cards.mjs
import { writeFileSync, mkdirSync } from "fs";

const OUT = new URL("../../assets/", import.meta.url);
const ASSETS = new URL("../../assets/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const C = {
  card: "#FFFFFF",
  ink: "#111111",
  desc: "#333333",
  faint: "#777777",
  yellow: "#FFD500",
  termBg: "#111111",
  termText: "#FFFFFF",
  termDim: "#999999",
  sans: "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif"
};
const mono = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";

// Dark GitHub-toned palette for the wide blocks and the terminal cards.
// C.ink splits by role here: text becomes D.text, surfaces become D.card and
// borders become the D.border hairline.
const D = {
  card: "#0d1117",    // dark surface; also the ink colour used ON yellow
  border: "#30363d",  // 1px hairline card border
  text: "#FFFFFF",    // primary text / strokes
  desc: "#BBBBBB",    // body copy
  faint: "#888888",   // secondary text
  rule: "#21262d",    // grid lines and the terminal window divider
  onYellow: "#6b6000" // dimmed separators sitting on the yellow banner
};

// Monochrome line icons (Lucide, MIT).
const ICON = {
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
  network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
  shuffle: '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  mapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  panels: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.09 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.09-1.62 0-5 0-5"/>',
  handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>'
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Shared theme fragments -----------------------------------------------------

// White card + 2px ink border + offset ink slab. Card sits at (2,2); the slab
// peeks out 6px right/down, so every canvas reserves 8px on those edges.
const OFF = 6;
function frame(w, h, slab = C.ink) {
  const cw = w - OFF - 4, ch = h - OFF - 4;
  return `<rect x="${4 + OFF}" y="${4 + OFF}" width="${cw}" height="${ch}" fill="${slab}"/>
  <rect x="2" y="2" width="${cw}" height="${ch}" fill="${C.card}" stroke="${C.ink}" stroke-width="2"/>`;
}

// Dark counterpart: #0d1117 card, 1px #30363d hairline, yellow slab shadow.
function darkFrame(w, h, slab = C.yellow) {
  const cw = w - OFF - 4, ch = h - OFF - 4;
  return `<rect x="${4 + OFF}" y="${4 + OFF}" width="${cw}" height="${ch}" fill="${slab}"/>
  <rect x="2" y="2" width="${cw}" height="${ch}" fill="${D.card}" stroke="${D.border}" stroke-width="1"/>`;
}

// Marker highlight behind mono uppercase text.
function marker(x, y, chars) {
  const w = Math.round(chars * 8.2 + 12);
  return `<rect x="${x - 6}" y="${y - 12}" width="${w}" height="17" fill="${C.yellow}"/>`;
}

// hotFill sits on the yellow marker, restFill on the card behind it, so both
// are caller-supplied: light cards pass ink/faint, dark blocks pass D tones.
function eyebrow(x, y, hot, rest, hotFill = C.ink, restFill = C.faint) {
  return `${marker(x, y, hot.length)}<text x="${x}" y="${y}" font-size="10" letter-spacing="2" font-weight="700" font-family="${mono}"><tspan fill="${hotFill}">${esc(hot)}</tspan><tspan fill="${restFill}">&#160;${esc(rest)}</tspan></text>`;
}

// Project cards --------------------------------------------------------------

const W = 480, PAD = 34;
const INNER = W - PAD * 2 - OFF;
const CHAR = 7.1;

function wrap(text, max = Math.floor(INNER / CHAR)) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) { lines.push(line.trim()); line = w; }
    else line += " " + w;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function card({ ic, eyebrow: eb, title, desc, chips }) {
  const H = 180;
  const x0 = PAD;
  const eyebrowY = 46, titleY = 78, descTop = 106, lineH = 21, chipY = 138;

  const [eb1, eb2] = eb.split(" / ");
  const lines = wrap(desc).slice(0, 2);
  const descSvg = lines
    .map((l, i) => `<text x="${x0}" y="${descTop + i * lineH}" font-size="13.5" fill="${C.desc}" font-family="${C.sans}">${esc(l)}</text>`)
    .join("\n  ");

  let cx = x0;
  const chipSvg = chips
    .map((t) => {
      const hot = t.startsWith("!");
      const label = hot ? t.slice(1) : t;
      const w = Math.round(label.length * 6.6 + 22);
      const fill = hot ? C.ink : C.yellow;
      const txt = hot ? C.yellow : C.ink;
      const r = `<g>
    <rect x="${cx}" y="${chipY}" width="${w}" height="24" fill="${fill}" stroke="${C.ink}" stroke-width="2"/>
    <text x="${cx + w / 2}" y="${chipY + 16}" font-size="10.5" font-weight="700" fill="${txt}" font-family="${mono}" text-anchor="middle">${esc(label)}</text>
  </g>`;
      cx += w + 10;
      return r;
    })
    .join("\n  ");

  const iconSvg = ic
    ? `<g transform="translate(${x0},${titleY - 17}) scale(0.8)" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="square" stroke-linejoin="miter">${ic}</g>`
    : "";
  const titleX = ic ? x0 + 30 : x0;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)}">
  ${frame(W, H)}
  ${eyebrow(x0, eyebrowY, eb1, "/ " + eb2)}
  ${iconSvg}
  <text x="${titleX}" y="${titleY}" font-size="17.5" font-weight="800" fill="${C.ink}" font-family="${C.sans}">${esc(title)}</text>
  ${descSvg}
  ${chipSvg}
</svg>\n`;
}

const building = [
  { file: "qoris", ic: ICON.shield, title: "Qoris",
    desc: "Trust layer for enterprise AI. A secure agent harness that deploys production agents for paying clients.", chips: ["agents", "docker", "mcp"] },
  { file: "agentparts", ic: ICON.panels, title: "agentparts",
    desc: "Terminal UI components for agent harnesses: status rows, approval prompts, harness chrome. 213 tests.", chips: ["opentui", "react", "!public soon"] },
  { file: "desktop-use", ic: ICON.monitor, title: "desktop-use",
    desc: "Self-hosted computer-use agent with a mission-control console: live VNC, snapshot replay, mid-flight takeover.", chips: ["computer use", "holo", "python"] },
  { file: "desktop-sandbox", ic: ICON.box, title: "desktop-sandbox",
    desc: "Headless desktop in a container for computer-use agents: Xvfb, apps, VNC, and a Desktop API.", chips: ["xvfb", "vnc", "docker"] },
  { file: "grok-delegate", ic: ICON.shuffle, title: "grok-delegate",
    desc: "Grok Build plugin that hands work to local Claude Code or Codex as a background task. Cancel-safe.", chips: ["grok", "claude code", "codex"] },
  { file: "meta-mcp", ic: ICON.network, title: "meta-mcp-manager",
    desc: "One retrieval-first endpoint for many MCP servers. Agents fetch tools on demand instead of loading them all.", chips: ["mcp", "fastapi"] }
];
const oss = [
  { file: "knox", ic: ICON.shield, title: "Knox",
    desc: "Security enforcement for Claude Code, Cursor and Codex. Blocks dangerous commands, detects prompt injection.", chips: ["security", "hooks", "plugin"] },
  { file: "gmaps", ic: ICON.mapPin, title: "gmaps-mcp",
    desc: "Google Maps MCP server: places search, directions, geocoding. Claude Desktop, Cursor, Claude Code.", chips: ["mcp", "python"] },
  { file: "agent-clock", ic: ICON.clock, title: "agent-clock",
    desc: "Give your coding agent an accurate clock. Injects the real date and time into context on every prompt.", chips: ["plugin", "claude code", "codex"] },
  { file: "x-search", ic: ICON.search, title: "x-search-via-hermes",
    desc: "Agent skill for X search through Hermes, installable as a Claude Code or Codex plugin.", chips: ["skill", "x"] },
  { file: "voice", ic: ICON.mic, title: "xai-voice-agent",
    desc: "Real-time voice conversations with Grok over the xAI Realtime API: barge-in, VAD, conversation history.", chips: ["voice", "fastapi"] },
  { file: "holo-cli", ic: ICON.bot, title: "holo-desktop-cli",
    desc: "Desktop agent built on H Company's Holo3 vision-language models.", chips: ["vlm", "cli"] }
];

const pad2 = (n) => String(n + 1).padStart(2, "0");
building.forEach((p, i) => writeFileSync(new URL(`${p.file}.svg`, OUT), card({ ...p, eyebrow: `BUILDING / ${pad2(i)}` })));
oss.forEach((p, i) => writeFileSync(new URL(`${p.file}.svg`, OUT), card({ ...p, eyebrow: `OPEN SOURCE / ${pad2(i)}` })));

// Terminal install cards: black windows with YELLOW slab shadows -------------

function termCard({ file, name, lines }) {
  const TW = 480, lineH = 24, top = 92;
  const promptY = top + lines.length * lineH;
  const TH = promptY + 28;
  const cw = TW - OFF - 4, ch = TH - OFF - 4;
  const wipeId = `wipe-${file}`;
  const lineSvg = lines
    .map((l, i) => {
      const y = top + i * lineH;
      const x = 26 + (l.indent || 0);
      const spans = l.spans.map(([txt, col]) => `<tspan fill="${col}">${esc(txt)}</tspan>`).join("");
      return `<text class="mono" x="${x}" y="${y}" font-size="14">${spans}</text>`;
    })
    .join("\n    ");
  return `<svg width="${TW}" height="${TH}" viewBox="0 0 ${TW} ${TH}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)}">
  <defs>
    <clipPath id="${wipeId}">
      <rect x="20" y="66" width="0" height="${lines.length * lineH + 12}">
        <animate attributeName="width" values="0;440" dur="2.2s" begin="0.4s" fill="freeze" calcMode="linear"/>
      </rect>
    </clipPath>
    <style>
      .mono { font-family: "SF Mono","Fira Code",ui-monospace,"DejaVu Sans Mono",monospace; }
    </style>
  </defs>
  <rect x="${4 + OFF}" y="${4 + OFF}" width="${cw}" height="${ch}" fill="${C.yellow}"/>
  <rect x="2" y="2" width="${cw}" height="${ch}" fill="${D.card}" stroke="${D.border}" stroke-width="1"/>
  <rect x="24" y="28" width="10" height="10" fill="none" stroke="${C.termDim}" stroke-width="2"/>
  <rect x="44" y="28" width="10" height="10" fill="none" stroke="${C.termDim}" stroke-width="2"/>
  <rect x="64" y="28" width="10" height="10" fill="${C.yellow}"/>
  <text class="mono" x="92" y="37" font-size="13" fill="${C.termDim}">${esc(name)}</text>
  <line x1="20" y1="54" x2="${cw - 16}" y2="54" stroke="${D.rule}" stroke-width="2"/>
  <g clip-path="url(#${wipeId})">
    ${lineSvg}
  </g>
  <text class="mono" x="26" y="${promptY}" font-size="14" fill="${C.yellow}">$</text>
  <rect x="44" y="${promptY - 12}" width="8" height="15" fill="${C.yellow}">
    <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" begin="2.6s" repeatCount="indefinite"/>
  </rect>
</svg>\n`;
}

const TXT = "#FFFFFF", DIM = "#999999", YEL = C.yellow;
writeFileSync(new URL("card-knox.svg", ASSETS), termCard({
  file: "knox", name: "knox.plugin",
  lines: [
    { spans: [["$", YEL], [" claude plugin marketplace add \\", TXT]] },
    { indent: 34, spans: [["qoris-ai/", DIM], ["qoris-marketplace", YEL]] },
    { spans: [["$", YEL], [" claude plugin install ", TXT], ["knox@qoris", YEL]] }
  ]
}));
writeFileSync(new URL("card-gmaps.svg", ASSETS), termCard({
  file: "gmaps", name: "gmaps-mcp",
  lines: [
    { spans: [["$", YEL], [" uvx ", TXT], ["gmaps-mcp", YEL]] },
    { spans: [["# Google Maps for your agent:", DIM]] },
    { spans: [["# places, directions, geocoding", DIM]] }
  ]
}));

// Professional Journey: career trajectory chart (up & to the right) ----------

const PTS = [
  { org: "Freelance", yr: "'21", ic: ICON.terminal, lvl: 1.0 },
  { org: "AI agents", yr: "'23", ic: ICON.bot, lvl: 2.2 },
  { org: "SalesGet", yr: "'24", ic: ICON.rocket, lvl: 3.6 },
  { org: "Acquired", yr: "'25", ic: ICON.handshake, lvl: 4.8 },
  { org: "Qoris CTO", yr: "'26", ic: ICON.shield, lvl: 6.2 },
  { org: "Open source", yr: "now", ic: ICON.network, lvl: 7.7 }
];

const LEGEND = [
  { org: "Open source", role: "computer-use agents, harness UI components, MCP infrastructure", yr: "2026" },
  { org: "Qoris", role: "CTO & Co-Founder · rebuilt the platform into a secure agent harness for paying clients", yr: "2026" },
  { org: "Qoris", role: "joined as founding engineer after it acquired SalesGet", yr: "2025" },
  { org: "SalesGet", role: "founded an AI sales agent that booked meetings on its own", yr: "2024" },
  { org: "AI", role: "started building with LLMs, then agents", yr: "2023" },
  { org: "Freelance", role: "self-taught Python: bots, chat widgets, client work", yr: "2021" }
];

function journeyGraphic() {
  const TW = 860, padL = 64, padR = 58, chartTop = 100, chartBot = 258;
  const n = PTS.length, plotW = TW - padL - padR;
  const min = 1, max = 7.7;
  const X = (i) => padL + i * (plotW / (n - 1));
  const Y = (l) => chartBot - ((l - min) / (max - min)) * (chartBot - chartTop);
  const co = PTS.map((p, i) => ({ ...p, x: X(i), y: Y(p.lvl) }));

  const line = co.map((c, i) => `${i ? "L" : "M"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `M${co[0].x.toFixed(1)},${chartBot} ` + co.map((c) => `L${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ") + ` L${co[n - 1].x.toFixed(1)},${chartBot} Z`;

  const grid = [0.25, 0.5, 0.75]
    .map((f) => { const gy = chartBot - (chartBot - chartTop) * f; return `<line x1="${padL - 10}" y1="${gy.toFixed(1)}" x2="${TW - padR + 10}" y2="${gy.toFixed(1)}" stroke="${D.rule}" stroke-width="2" stroke-dasharray="2 8"/>`; })
    .join("\n  ");

  const marks = co
    .map((c, i) => {
      const last = i === n - 1;
      const ly = c.y - 44;
      const s = last ? 14 : 10;
      const iconSvg = `<g transform="translate(${(c.x - 9).toFixed(1)},${(ly - 9).toFixed(1)}) scale(0.75)" fill="none" stroke="${D.text}" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">${c.ic}</g>`;
      return `${iconSvg}
  <rect x="${(c.x - s / 2).toFixed(1)}" y="${(c.y - s / 2).toFixed(1)}" width="${s}" height="${s}" fill="${last ? C.yellow : D.card}" stroke="${C.yellow}" stroke-width="2"/>
  <text x="${c.x.toFixed(1)}" y="${(c.y - 20).toFixed(1)}" font-size="12.5" font-weight="800" fill="${D.text}" font-family="${C.sans}" text-anchor="middle">${esc(c.org)}</text>
  <text x="${c.x.toFixed(1)}" y="${chartBot + 24}" font-size="11" font-weight="700" fill="${D.faint}" font-family="${mono}" text-anchor="middle">${esc(c.yr)}</text>`;
    })
    .join("");

  const dividerY = chartBot + 48;
  const legendTop = dividerY + 32;
  const rowH = 28;
  const legend = LEGEND
    .map((e, i) => {
      const ly = legendTop + i * rowH;
      return `
  <rect x="${padL}" y="${ly - 10}" width="8" height="8" fill="${C.yellow}" stroke="${D.text}" stroke-width="1.5"/>
  <text x="${padL + 20}" y="${ly}" font-size="12.5" font-family="${C.sans}"><tspan font-weight="800" fill="${D.text}">${esc(e.org)}</tspan><tspan fill="${D.desc}">&#160;&#160;·&#160;&#160;${esc(e.role)}</tspan></text>
  <text x="${TW - padR}" y="${ly}" font-size="11" fill="${D.faint}" font-family="${mono}" text-anchor="end">${esc(e.yr)}</text>`;
    })
    .join("");
  const H = legendTop + (LEGEND.length - 1) * rowH + 32;

  return `<svg width="${TW}" height="${H}" viewBox="0 0 ${TW} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${darkFrame(TW, H)}
  ${eyebrow(padL, 54, "TRAJECTORY", "/ 2021 → NOW", D.card, D.faint)}
  ${grid}
  <line x1="${padL - 10}" y1="${chartBot}" x2="${TW - padR + 10}" y2="${chartBot}" stroke="${D.text}" stroke-width="2"/>
  <path d="${area}" fill="${C.yellow}" fill-opacity="0.14"/>
  <path d="${line}" fill="none" stroke="${C.yellow}" stroke-width="3.5" stroke-linecap="square" stroke-linejoin="miter"/>${marks}
  <line x1="${padL}" y1="${dividerY}" x2="${TW - padR - OFF}" y2="${dividerY}" stroke="${D.text}" stroke-width="2"/>${legend}
</svg>\n`;
}
writeFileSync(new URL("journey.svg", OUT), journeyGraphic());

// Hero block: identity + CV summary, above the snake -------------------------

function heroGraphic() {
  const HW = 860, x0 = 38;
  const eyebrowY = 52, roleY = 92, subY = 120, dividerY = 144, sumTop = 174, sumLineH = 22;

  const summary = "Founder of an acquired AI startup with 5 years of engineering experience, now the technical co-founder who builds the infrastructure platform for AI agents and ships them into customer environments.";
  const sumLines = wrap(summary, 100);
  const sumSvg = sumLines
    .map((l, i) => `<text x="${x0}" y="${sumTop + i * sumLineH}" font-size="14" fill="${D.desc}" font-family="${C.sans}">${esc(l)}</text>`)
    .join("\n  ");
  const H = sumTop + (sumLines.length - 1) * sumLineH + 40;

  const tag = "SHIPPING DAILY";
  const tagW = Math.round(tag.length * 8.2 + 20);
  return `<svg width="${HW}" height="${H}" viewBox="0 0 ${HW} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${darkFrame(HW, H)}
  ${marker(x0, eyebrowY, "PROFILE".length)}<text x="${x0}" y="${eyebrowY}" font-size="10" letter-spacing="2" font-weight="700" fill="${D.card}" font-family="${mono}">PROFILE</text>
  <rect x="${HW - 42 - tagW}" y="${eyebrowY - 16}" width="${tagW}" height="24" fill="${C.yellow}"/>
  <text x="${HW - 42 - tagW / 2}" y="${eyebrowY}" font-size="10" letter-spacing="2" font-weight="700" fill="${D.card}" font-family="${mono}" text-anchor="middle">${tag}</text>
  <text x="${x0}" y="${roleY}" font-size="21" font-weight="800" font-family="${C.sans}"><tspan fill="${D.text}">Co-Founder &amp; CTO</tspan><tspan fill="${D.faint}">&#160;&#160;·&#160;&#160;</tspan><tspan fill="${D.text}">Qoris</tspan></text>
  <text x="${x0}" y="${subY}" font-size="15" font-family="${C.sans}"><tspan fill="${D.desc}">Agent infrastructure, in the open</tspan><tspan fill="${D.faint}">&#160;&#160;·&#160;&#160;</tspan><tspan fill="${D.text}" font-weight="700">arthurkatcher.com</tspan></text>
  <line x1="${x0}" y1="${dividerY}" x2="${HW - x0 - OFF}" y2="${dividerY}" stroke="${D.text}" stroke-width="2"/>
  ${sumSvg}
</svg>\n`;
}
writeFileSync(new URL("hero.svg", OUT), heroGraphic());

// Banner: replaces the third-party typing SVG. Inverted against the rest of
// the dark set — a YELLOW card on a #0d1117 slab, with dark ink text. ------

function bannerGraphic() {
  const BW = 860, BH = 64;
  const cw = BW - OFF - 4, ch = BH - OFF - 4;
  const line = [
    ["$ ", D.card],
    ["co-founder & cto @ qoris", D.card],
    ["  ·  ", D.onYellow],
    ["harnesses and runtimes for ai agents", D.card],
    ["  ·  ", D.onYellow],
    ["python / ts / mcp", D.card]
  ].map(([t, c]) => `<tspan fill="${c}">${esc(t)}</tspan>`).join("");
  return `<svg width="${BW}" height="${BH}" viewBox="0 0 ${BW} ${BH}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="${4 + OFF}" y="${4 + OFF}" width="${cw}" height="${ch}" fill="${D.card}"/>
  <rect x="2" y="2" width="${cw}" height="${ch}" fill="${C.yellow}" stroke="${D.border}" stroke-width="1"/>
  <text x="26" y="36" font-size="14.5" font-weight="700" font-family="${mono}">${line}</text>
  <rect x="${cw - 34}" y="21" width="9" height="17" fill="${D.card}">
    <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/>
  </rect>
</svg>\n`;
}
writeFileSync(new URL("banner.svg", OUT), bannerGraphic());

// Footer connect chips -------------------------------------------------------

const X_PATH = '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>';

function chip(text, markPath, color = "#111111") {
  const fs = 13.5, H = 22, padX = 4, markW = markPath ? 15 : 0, gap = markPath ? 7 : 0;
  const tw = text.length * 8.3;
  const CW = Math.round(padX + markW + gap + tw + padX);
  const tx = padX + markW + gap;
  const markSvg = markPath ? `<g transform="translate(${padX},4) scale(${(15 / 24).toFixed(4)})" fill="${color}">${markPath}</g>` : "";
  return `<svg width="${CW}" height="${H}" viewBox="0 0 ${CW} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(text)}">${markSvg}<text x="${tx}" y="16" font-size="${fs}" font-weight="700" fill="${color}" font-family="${mono}">${esc(text)}</text></svg>\n`;
}
writeFileSync(new URL("link-web.svg", OUT), chip("arthurkatcher.com", null));
writeFileSync(new URL("link-x.svg", OUT), chip("@arthurkatcher", X_PATH));
writeFileSync(new URL("link-qoris.svg", OUT), chip("qoris.ai", null));

// Tech stack (logo pills, grouped) -------------------------------------------

const STACK = [
  { label: "AGENTS & CLI", items: [["Claude Code", "anthropic"], ["Codex CLI", "openai"], ["Cursor", "cursor"], ["MCP", null], ["OpenAI Agents SDK", null]] },
  { label: "MODELS & APIs", items: [["Anthropic", "anthropic"], ["OpenAI", "openai"], ["xAI Grok", null], ["Gemini", "googlegemini"], ["OpenRouter", null], ["Holo3", null]] },
  { label: "LANGUAGES & BACKEND", items: [["Python", "python"], ["TypeScript", "typescript"], ["FastAPI", "fastapi"], ["Quart", null], ["React", "react"], ["Bun", "bun"]] },
  { label: "DATA & DEPLOY", items: [["PostgreSQL", "postgresql"], ["Redis", "redis"], ["Docker", "docker"], ["Hetzner", "hetzner"], ["Vercel", "vercel"]] },
  { label: "DEV & OPS", items: [["Linux", "linux"], ["Playwright", null], ["GitHub Actions", "githubactions"], ["Stripe", "stripe"], ["Logfire", null]] }
];

const stackPaths = {};
const slugs = [...new Set(STACK.flatMap((g) => g.items.map((i) => i[1])).filter(Boolean))];
for (const s of slugs) {
  try {
    const r = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${s}.svg`);
    if (r.ok) {
      const m = (await r.text()).match(/ d="([^"]+)"/);
      if (m) stackPaths[s] = m[1];
    }
  } catch { /* fall back to text-only pill */ }
}

// simple-icons v13 predates some logos (e.g. Cursor); inline monochrome paths as a fallback.
const EXTRA_PATHS = {
  cursor: "M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"
};
for (const [s, d] of Object.entries(EXTRA_PATHS)) if (!stackPaths[s]) stackPaths[s] = d;

function stackGraphic() {
  const SW = 860, fs = 12.5, pillH = 28, gap = 10, lineGap = 12, groupGap = 30, labelGap = 30, startX = 38, maxX = SW - 38 - OFF;
  let y = 56, body = "";
  for (const g of STACK) {
    body += `\n  ${marker(startX, y, 2)}<text x="${startX}" y="${y}" font-size="10" letter-spacing="2" font-weight="700" font-family="${mono}"><tspan fill="${D.card}">//</tspan><tspan fill="${D.faint}">&#160;${esc(g.label)}</tspan></text>`;
    y += labelGap;
    let x = startX;
    for (const [label, slug] of g.items) {
      const hasLogo = slug && stackPaths[slug];
      const logoW = hasLogo ? 15 : 0, innerGap = hasLogo ? 6 : 0;
      const pw = Math.round(12 + logoW + innerGap + label.length * 7 + 12);
      if (x + pw > maxX) { x = startX; y += pillH + lineGap; }
      const logoSvg = hasLogo ? `<g transform="translate(${x + 12},${y + 6.5}) scale(0.625)" fill="${D.text}"><path d="${stackPaths[slug]}"/></g>` : "";
      body += `\n  <rect x="${x}" y="${y}" width="${pw}" height="${pillH}" fill="${D.card}" stroke="${D.text}" stroke-width="2"/>${logoSvg}<text x="${x + 12 + logoW + innerGap}" y="${y + 18.5}" font-size="${fs}" font-weight="600" fill="${D.text}" font-family="${C.sans}">${esc(label)}</text>`;
      x += pw + gap;
    }
    y += pillH + groupGap;
  }
  const H = y - groupGap + 30;
  return `<svg width="${SW}" height="${H}" viewBox="0 0 ${SW} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${darkFrame(SW, H)}${body}
</svg>\n`;
}
writeFileSync(new URL("stack.svg", OUT), stackGraphic());

console.log("generated", building.length + oss.length, "cards + 2 terminal cards + journey + hero + banner + chips + stack (" + Object.keys(stackPaths).length + " logos)");
