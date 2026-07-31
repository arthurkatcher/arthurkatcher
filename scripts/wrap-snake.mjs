// Wraps the Platane/snk-generated snake SVG in the neo-brutal terminal window.
// Input:  dist/github-snake.svg  (from the snk svg-only action, custom palette)
//         data/contrib.json      (for the footer counter)
// Output: assets/cards/contrib.svg
// Run: node scripts/wrap-snake.mjs
import { writeFileSync, readFileSync } from "fs";

const snakeRaw = readFileSync(new URL("../dist/github-snake.svg", import.meta.url), "utf8");
const cal = JSON.parse(readFileSync(new URL("../data/contrib.json", import.meta.url), "utf8"))
  .data.user.contributionsCollection.contributionCalendar;

const mono = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";
const INK = "#0d1117", BORDER = "#30363d", YELLOW = "#FFD500", DIM = "#999999";

// Pull the snk root tag's dimensions, keep everything inside it verbatim
// (its <style> holds the whole animation).
const rootMatch = snakeRaw.match(/<svg[^>]*>/);
if (!rootMatch) throw new Error("no <svg> root in dist/github-snake.svg");
const root = rootMatch[0];
const num = (name) => {
  const m = root.match(new RegExp(`${name}="([\\d.]+)"`));
  return m ? parseFloat(m[1]) : null;
};
const vb = root.match(/viewBox="([^"]+)"/);
const [vbX, vbY, vbW, vbH] = vb ? vb[1].split(/\s+/).map(Number) : [0, 0, num("width"), num("height")];
const inner = snakeRaw.slice(snakeRaw.indexOf(root) + root.length, snakeRaw.lastIndexOf("</svg>"));

// Terminal card geometry
const OFF = 6, titleH = 56;
const W = 833; // match the previous contrib card footprint
const cw = W - OFF - 4;
const gx = 20, targetW = cw - gx * 2;
const scaledH = Math.round(targetW * (vbH / vbW));
const gy = titleH + 6;
const footerY = gy + scaledH + 30;
const H = footerY + 26 + OFF + 4;
const ch = H - OFF - 4;

const total = cal.totalContributions.toLocaleString("en-US");

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${total} contributions in the last year">
  <rect x="${4 + OFF}" y="${4 + OFF}" width="${cw}" height="${ch}" fill="${YELLOW}"/>
  <rect x="2" y="2" width="${cw}" height="${ch}" fill="${INK}" stroke="${BORDER}" stroke-width="1"/>
  <rect x="24" y="24" width="10" height="10" fill="none" stroke="${DIM}" stroke-width="2"/>
  <rect x="44" y="24" width="10" height="10" fill="none" stroke="${DIM}" stroke-width="2"/>
  <rect x="64" y="24" width="10" height="10" fill="${YELLOW}"/>
  <text x="92" y="33" font-size="13" fill="${DIM}" font-family="${mono}">contributions.log</text>
  <text x="${cw - 16}" y="33" font-size="11" fill="${DIM}" font-family="${mono}" text-anchor="end">last 365 days</text>
  <line x1="20" y1="46" x2="${cw - 16}" y2="46" stroke="#21262d" stroke-width="2"/>
  <svg x="${gx}" y="${gy}" width="${targetW}" height="${scaledH}" viewBox="${vbX} ${vbY} ${vbW} ${vbH}">${inner}</svg>
  <text x="${gx + 4}" y="${footerY}" font-size="13" font-family="${mono}"><tspan fill="${YELLOW}">$</tspan><tspan fill="#FFFFFF"> ${total} contributions in the last year</tspan></text>
  <rect x="${gx + 4 + (total.length + 34) * 7.9}" y="${footerY - 11}" width="7" height="14" fill="${YELLOW}">
    <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/>
  </rect>
</svg>\n`;

writeFileSync(new URL("../assets/cards/contrib.svg", import.meta.url), svg);
console.log(`wrapped snk snake ${vbW}x${vbH} → contrib.svg ${W}x${H}, ${total} contributions`);
