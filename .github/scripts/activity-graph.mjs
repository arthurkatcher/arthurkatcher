// Self-hosted replacement for github-readme-activity-graph (Vercel deploy died, 402).
// Input:  .github/data/contrib.json   (GraphQL contribution calendar, fetched by the workflow)
// Output: assets/activity.svg         (last 31 days, yellow line + area, neo-brutal terminal chrome)
// Run: node .github/scripts/activity-graph.mjs
import { writeFileSync, readFileSync } from "fs";

const cal = JSON.parse(readFileSync(new URL("../data/contrib.json", import.meta.url), "utf8"))
  .data.user.contributionsCollection.contributionCalendar;

const days = cal.weeks.flatMap((w) => w.contributionDays).slice(-31);
const counts = days.map((d) => d.contributionCount);
const max = Math.max(1, ...counts);
const total = counts.reduce((a, b) => a + b, 0);

const mono = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";
const INK = "#0d1117", BORDER = "#30363d", RULE = "#21262d", YELLOW = "#FFD500", DIM = "#999999", GREY = "#777777";

// Card geometry (same footprint/chrome as contrib.svg)
const OFF = 6, W = 833;
const cw = W - OFF - 4;
const plotX = 56, plotY = 70, plotW = cw - plotX - 24, plotH = 180;
const footerY = plotY + plotH + 52;
const H = footerY + 26 + OFF + 4;
const ch = H - OFF - 4;

const n = counts.length;
const xAt = (i) => plotX + (i * plotW) / (n - 1);
const yAt = (c) => plotY + plotH - (c / max) * plotH;

// Smooth monotone-ish curve via Catmull-Rom → cubic bezier
const pts = counts.map((c, i) => [xAt(i), yAt(c)]);
let path = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
for (let i = 0; i < n - 1; i++) {
  const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n - 1)];
  const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
  const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
  path += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
}
const area = `${path} L${xAt(n - 1).toFixed(1)},${(plotY + plotH).toFixed(1)} L${plotX},${plotY + plotH} Z`;

// Y gridlines: 0, max/2, max (nice-ish integers)
const yTicks = [0, Math.round(max / 2), max];
const grid = yTicks.map((t) =>
  `<line x1="${plotX}" y1="${yAt(t).toFixed(1)}" x2="${plotX + plotW}" y2="${yAt(t).toFixed(1)}" stroke="${RULE}" stroke-width="1"/>
  <text x="${plotX - 10}" y="${(yAt(t) + 4).toFixed(1)}" font-size="11" fill="${GREY}" font-family="${mono}" text-anchor="end">${t}</text>`).join("\n  ");

// X labels: every 5th day, MM-DD
const xLabels = days.map((d, i) => (i % 5 === 0 || i === n - 1) && !(i === n - 1 && (n - 1) % 5 < 2 && i % 5 !== 0)
  ? `<text x="${xAt(i).toFixed(1)}" y="${plotY + plotH + 22}" font-size="11" fill="${GREY}" font-family="${mono}" text-anchor="middle">${d.date.slice(5)}</text>` : "").join("\n  ");

const dots = pts.map(([x, y]) => `<rect x="${(x - 2.5).toFixed(1)}" y="${(y - 2.5).toFixed(1)}" width="5" height="5" fill="${INK}" stroke="${YELLOW}" stroke-width="1.5"/>`).join("\n  ");

const totalStr = total.toLocaleString("en-US");
const label = `${totalStr} contributions in the last 31 days`;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${YELLOW}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${YELLOW}" stop-opacity="0.02"/>
    </linearGradient>
  </defs>
  <rect x="${4 + OFF}" y="${4 + OFF}" width="${cw}" height="${ch}" fill="${YELLOW}"/>
  <rect x="2" y="2" width="${cw}" height="${ch}" fill="${INK}" stroke="${BORDER}" stroke-width="1"/>
  <rect x="24" y="24" width="10" height="10" fill="none" stroke="${DIM}" stroke-width="2"/>
  <rect x="44" y="24" width="10" height="10" fill="none" stroke="${DIM}" stroke-width="2"/>
  <rect x="64" y="24" width="10" height="10" fill="${YELLOW}"/>
  <text x="92" y="33" font-size="13" fill="${DIM}" font-family="${mono}">activity.log</text>
  <text x="${cw - 16}" y="33" font-size="11" fill="${DIM}" font-family="${mono}" text-anchor="end">last 31 days</text>
  <line x1="20" y1="46" x2="${cw - 16}" y2="46" stroke="${RULE}" stroke-width="2"/>
  ${grid}
  <path d="${area}" fill="url(#area)"/>
  <path d="${path}" stroke="${YELLOW}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  ${dots}
  ${xLabels}
  <text x="24" y="${footerY}" font-size="13" font-family="${mono}"><tspan fill="${YELLOW}">$</tspan><tspan fill="#FFFFFF"> ${label}</tspan></text>
  <rect x="${24 + (label.length + 2) * 7.9}" y="${footerY - 11}" width="7" height="14" fill="${YELLOW}">
    <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/>
  </rect>
</svg>
`;

writeFileSync(new URL("../../assets/activity.svg", import.meta.url), svg);
console.log(`activity.svg ${W}x${H}: ${label}, max/day ${max}`);
