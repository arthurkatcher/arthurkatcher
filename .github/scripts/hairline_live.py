#!/usr/bin/env python3
"""Daily refresh of the two live charts in the Hairline style (light + dark).

Input:  dist/github-snake.svg   (Platane/snk svg-only output)
        .github/data/contrib.json
Output: assets/contrib-{light,dark}.svg, assets/activity-{light,dark}.svg
Geist Mono is subset per file and embedded, so GitHub renders the real font.
Needs: pip install fonttools brotli
"""
import base64, html, io, json, re
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options

ROOT = Path(__file__).resolve().parents[2]
FONT = ROOT / ".github/fonts/GeistMono-Latin.woff2"
FAMILY = "GeistMonoX, 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
W = 860

THEMES = {
    "light": dict(fg="#0a0a0a", fg2="#262626", muted="#737373", line="#e5e5e5", lineop=1.0, pill="#171717", pillfg="#fafafa",
                  levels=["#f0f0f0", "#d4d4d4", "#a3a3a3", "#525252", "#0a0a0a"]),
    "dark": dict(fg="#fafafa", fg2="#e5e5e5", muted="#a1a1a1", line="#ffffff", lineop=0.10, pill="#e5e5e5", pillfg="#171717",
                 levels=["#1f1f1f", "#404040", "#737373", "#a3a3a3", "#fafafa"]),
}

_font = TTFont(FONT)
_cmap, _hmtx, _upm = _font.getBestCmap(), _font["hmtx"], _font["head"].unitsPerEm
def tw(s, size, ls=0.0):
    w = sum(_hmtx[_cmap.get(ord(c), _cmap[ord("?")])][0] for c in s) * size / _upm
    return w + ls * size * max(len(s) - 1, 0)

def font_b64(chars):
    f = TTFont(FONT); o = Options(); o.flavor = "woff2"
    s = Subsetter(o); s.populate(text="".join(chars) + " "); s.subset(f)
    b = io.BytesIO(); f.flavor = "woff2"; f.save(b)
    return base64.b64encode(b.getvalue()).decode()

class Svg:
    def __init__(self, w, h, label):
        self.w, self.h, self.label, self.parts, self.chars = w, h, label, [], set()
    def add(self, s): self.parts.append(s)
    def text(self, x, y, s, size, fill, weight=400, ls=0.0, anchor="start"):
        self.chars.update(s)
        a = f' text-anchor="{anchor}"' if anchor != "start" else ""
        l = f' letter-spacing="{ls*size:.2f}"' if ls else ""
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-family="{FAMILY}" font-size="{size}" font-weight="{weight}" fill="{fill}"{l}{a}>{html.escape(s)}</text>')
    def render(self):
        css = f"@font-face{{font-family:GeistMonoX;font-weight:100 900;src:url(data:font/woff2;base64,{font_b64(self.chars)}) format('woff2')}}"
        return (f'<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}" fill="none" role="img" aria-label="{html.escape(self.label)}">'
                f'<style>{css}</style>{"".join(self.parts)}</svg>\n')

def bd(t): return f'stroke="{t["line"]}" stroke-opacity="{t["lineop"]}"'

def pill(s, x, y, label, t):
    w = tw(label, 11, 0.08) + 20
    s.add(f'<rect x="{x}" y="{y-15}" width="{w:.1f}" height="22" rx="11" fill="{t["pill"]}"/>')
    s.text(x + 10, y, label, 11, t["pillfg"], 500, ls=0.08)

def contrib(t, snake_vb, snake_inner, total):
    vx, vy, vw, vh = map(float, snake_vb.split())
    gh = W * vh / vw; top = 60; h = round(top + gh + 56)
    s = Svg(W, h, f"{total} contributions in the last year")
    pill(s, 0, 36, "contributions.log", t)
    s.text(W, 36, "last 365 days", 11, t["muted"], anchor="end")
    lv = t["levels"]
    inner = re.sub(r":root\{[^}]*\}", f":root{{--cb:transparent;--cs:{t['fg']};--ce:{lv[0]};--c0:{lv[0]};--c1:{lv[1]};--c2:{lv[2]};--c3:{lv[3]};--c4:{lv[4]}}}", snake_inner, count=1)
    s.add(f'<svg x="0" y="{top}" width="{W}" height="{gh:.1f}" viewBox="{snake_vb}">{inner}</svg>')
    fy = top + gh + 34; line = f"{total} contributions in the last year"
    s.text(4, fy, "$", 13, t["muted"]); s.text(4 + tw("$ ", 13), fy, line, 13, t["fg"], 500)
    cx = 4 + tw(f"$ {line} ", 13)
    s.add(f'<rect x="{cx:.1f}" y="{fy-11}" width="7" height="14" rx="1" fill="{t["fg"]}"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/></rect>')
    return s

def activity(t, days):
    counts = [d["contributionCount"] for d in days]; n = len(counts); mx = max(1, *counts); total = sum(counts)
    h = 300; s = Svg(W, h, f"{total} contributions in the last 31 days")
    pill(s, 0, 44, "// ACTIVITY / LAST 31 DAYS", t)
    s.text(W, 44, f"{total} contributions · max {mx}/day", 11, t["muted"], 500, anchor="end")
    padL, padR, top, bot = 34, 6, 84, 246
    for f in (0.25, 0.5, 0.75, 1):
        gy = bot - (bot - top) * f
        s.add(f'<line x1="{padL}" x2="{W-padR}" y1="{gy:.1f}" y2="{gy:.1f}" {bd(t)} stroke-dasharray="3 5"/>')
        s.text(padL - 10, gy + 4, str(round(mx * f)), 11, t["muted"], anchor="end")
    s.add(f'<line x1="{padL}" x2="{W-padR}" y1="{bot+0.5}" y2="{bot+0.5}" {bd(t)}/>')
    step = (W - padL - padR) / n; bw = step - 8
    for i, c in enumerate(counts):
        bh = max((c / mx) * (bot - top), 2 if c else 0); x = padL + i * step + 4
        if bh:
            s.add(f'<rect x="{x:.1f}" y="{bot-bh:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="{min(5, bw/2):.1f}" fill="{t["fg"]}" fill-opacity="{1 if i == n - 1 else 0.22}"/>')
        if i % 5 == 0 or i == n - 1:
            s.text(x + bw / 2, bot + 24, days[i]["date"][5:], 11, t["muted"], anchor="middle")
    return s

def main():
    raw = (ROOT / "dist/github-snake.svg").read_text()
    root = re.search(r"<svg[^>]*>", raw).group(0)
    vb = re.search(r'viewBox="([^"]+)"', root).group(1)
    inner = raw[raw.index(root) + len(root):raw.rindex("</svg>")]
    cal = json.loads((ROOT / ".github/data/contrib.json").read_text())["data"]["user"]["contributionsCollection"]["contributionCalendar"]
    total = f'{cal["totalContributions"]:,}'
    days = [d for w in cal["weeks"] for d in w["contributionDays"]][-31:]
    for th, t in THEMES.items():
        (ROOT / f"assets/contrib-{th}.svg").write_text(contrib(t, vb, inner, total).render())
        (ROOT / f"assets/activity-{th}.svg").write_text(activity(t, days).render())
    print(f"hairline charts: {total} contributions/yr, {sum(d['contributionCount'] for d in days)} in 31d")

if __name__ == "__main__":
    main()
