#!/usr/bin/env python3
"""Daily refresh of the two live blocks in the Spotlight style (dark in both GitHub themes).

Input:  dist/github-snake.svg   (Platane/snk svg-only output)
        .github/data/contrib.json
Output: assets/hero-contrib.svg  (intro + contributions snake, one panel)
        assets/activity.svg      (last 31 days)
The intro is a locked template (.github/data/hero-contrib.tpl.svg, built by
brand/github-profile-2026-10-03/build_template.py); only the snake and the total are filled in.
Geist Mono is subset and embedded in activity.svg, so GitHub renders the real font.
Needs: pip install fonttools brotli
"""
import base64, html, io, json, re
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[2]
FONTS = {"mono": ROOT / ".github/fonts/GeistMono-Latin.woff2"}
TPL = ROOT / ".github/data/hero-contrib.tpl.svg"
CURSOR_BASE, MONO_ADV = 44, 7.8  # from build_template.py (Geist Mono 13px)
FAMILY = {"mono": "GeistMonoX, 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"}
W = 860

_m = {}
def tw(s, size, kind="mono", weight=400, ls=0.0):
    key = (kind, weight)
    if key not in _m:
        f = TTFont(FONTS[kind])
        if "fvar" in f: f = instancer.instantiateVariableFont(f, {"wght": weight})
        _m[key] = (f.getBestCmap(), f["hmtx"], f["head"].unitsPerEm)
    cmap, hmtx, upm = _m[key]
    return sum(hmtx[cmap.get(ord(c), cmap[ord("?")])][0] for c in s) * size / upm + ls * size * max(len(s) - 1, 0)

def font_b64(kind, chars):
    f = TTFont(FONTS[kind]); o = Options(); o.flavor = "woff2"; o.layout_features = ["kern", "liga", "calt"]
    s = Subsetter(o); s.populate(text="".join(chars) + " "); s.subset(f)
    b = io.BytesIO(); f.flavor = "woff2"; f.save(b)
    return base64.b64encode(b.getvalue()).decode()

class Svg:
    def __init__(self, w, h, label):
        self.w, self.h, self.label, self.parts, self.defs, self.style = w, h, label, [], [], []
        self.chars = {"mono": set()}; self.n = 0
    def uid(self, p): self.n += 1; return f"{p}{self.n}"
    def add(self, s): self.parts.append(s)
    def text(self, x, y, s, size, fill, kind="mono", weight=400, ls=0.0, anchor="start", opacity=None):
        self.chars[kind].update(s)
        a = f' text-anchor="{anchor}"' if anchor != "start" else ""
        o = f' fill-opacity="{opacity}"' if opacity is not None else ""
        l = f' letter-spacing="{ls*size:.2f}"' if ls else ""
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-family="{FAMILY[kind]}" font-size="{size}" font-weight="{weight}" fill="{fill}"{o}{l}{a}>{html.escape(s)}</text>')
    def render(self):
        faces = [f"@font-face{{font-family:{fam};font-weight:100 900;src:url(data:font/woff2;base64,{font_b64(k, self.chars[k])}) format('woff2')}}"
                 for k, fam in (("mono", "GeistMonoX"),) if self.chars[k]]
        return (f'<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}" fill="none" role="img" aria-label="{html.escape(self.label)}">'
                f'<style>{"".join(faces + self.style)}</style><defs>{"".join(self.defs)}</defs>{"".join(self.parts)}</svg>\n')

# ---- Spotlight panel: near-black, soft light from the top centre, the site's dot grid ----
def panel(w, h, label):
    s = Svg(w, h, label); c, g, p, m, r = (s.uid(x) for x in "cgpmr")
    s.defs.append(f'<clipPath id="{c}"><rect width="{w}" height="{h}" rx="16"/></clipPath>'
                  f'<radialGradient id="{g}" cx="{w/2}" cy="{-h*0.15}" r="{max(w*0.55, h)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>')
    x, y, gw, gh = w * 0.15, 0, w * 0.7, h * 0.8
    s.defs.append(f'<pattern id="{p}" width="6" height="6" patternUnits="userSpaceOnUse" x="{x}" y="{y}"><rect width="2" height="2" fill="#ffffff" fill-opacity="0.16"/></pattern>'
                  f'<radialGradient id="{r}" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
                  f'<mask id="{m}" maskUnits="userSpaceOnUse" x="{x}" y="{y}" width="{gw}" height="{gh}"><rect x="{x}" y="{y}" width="{gw}" height="{gh}" fill="url(#{r})"/></mask>')
    s.add(f'<g clip-path="url(#{c})"><rect width="{w}" height="{h}" fill="#050505"/><rect width="{w}" height="{h}" fill="url(#{g})"/>'
          f'<rect x="{x}" y="{y}" width="{gw}" height="{gh}" fill="url(#{p})" mask="url(#{m})"/></g>')
    s.add(f'<rect x="0.5" y="0.5" width="{w-1}" height="{h-1}" rx="16" stroke="#fff" stroke-opacity="0.12"/>')
    return s

def glass(s, x, y, label, sub=None):
    full = label + (" " + sub if sub else ""); w = tw(full, 11, "mono", 500, 0.08) + 20
    s.add(f'<rect x="{x}" y="{y-15}" width="{w:.1f}" height="22" rx="11" fill="#fff" fill-opacity="0.08" stroke="#fff" stroke-opacity="0.18"/>')
    s.text(x + 10, y, full, 11, "#ffffff", "mono", 500, ls=0.08)

def hero_contrib(vb, inner, total):
    lv = ["#1f1f22", "#3f3f46", "#71717a", "#a1a1aa", "#fafafa"]
    inner = re.sub(r":root\{[^}]*\}", f":root{{--cb:transparent;--cs:#ffffff;--ce:{lv[0]};--c0:{lv[0]};--c1:{lv[1]};--c2:{lv[2]};--c3:{lv[3]};--c4:{lv[4]}}}", inner, count=1)
    cx = CURSOR_BASE + len(f"$ {total} contributions in the last year ") * MONO_ADV
    return (TPL.read_text().replace("@@VB@@", vb).replace("@@TOTAL@@", total)
            .replace("@@CX@@", f"{cx:.1f}").replace("@@INNER@@", inner))

def activity(days):
    counts = [d["contributionCount"] for d in days]; n = len(counts); mx = max(1, *counts); total = sum(counts)
    h = 310; s = panel(W, h, f"{total} contributions in the last 31 days"); pad = 28
    glass(s, pad, 44, "// ACTIVITY", "/ LAST 31 DAYS"); s.text(W - pad, 44, f"{total} contributions · max {mx}/day", 11, "#ffffff", "mono", 500, opacity=0.6, anchor="end")
    padL, padR, top, bot = pad + 30, pad, 86, 252
    for f in (0.25, 0.5, 0.75, 1):
        gy = bot - (bot - top) * f
        s.add(f'<line x1="{padL}" x2="{W-padR}" y1="{gy:.1f}" y2="{gy:.1f}" stroke="#fff" stroke-opacity="0.1" stroke-dasharray="3 5"/>')
        s.text(padL - 10, gy + 4, str(round(mx * f)), 11, "#ffffff", "mono", opacity=0.5, anchor="end")
    s.add(f'<line x1="{padL}" x2="{W-padR}" y1="{bot+0.5}" y2="{bot+0.5}" stroke="#fff" stroke-opacity="0.18"/>')
    g = s.uid("a"); s.defs.append(f'<linearGradient id="{g}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.25"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.85"/></linearGradient>')
    step = (W - padL - padR) / n; bw = step - 8
    for i, c in enumerate(counts):
        bh = max((c / mx) * (bot - top), 2 if c else 0); x = padL + i * step + 4
        if bh: s.add(f'<rect x="{x:.1f}" y="{bot-bh:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="{min(5, bw/2):.1f}" fill="{"#ffffff" if i == n - 1 else "url(#" + g + ")"}"/>')
        if i % 5 == 0 or i == n - 1: s.text(x + bw / 2, bot + 24, days[i]["date"][5:], 11, "#ffffff", "mono", opacity=0.5, anchor="middle")
    return s

def main():
    raw = (ROOT / "dist/github-snake.svg").read_text()
    root = re.search(r"<svg[^>]*>", raw).group(0)
    vb = re.search(r'viewBox="([^"]+)"', root).group(1)
    inner = raw[raw.index(root) + len(root):raw.rindex("</svg>")]
    cal = json.loads((ROOT / ".github/data/contrib.json").read_text())["data"]["user"]["contributionsCollection"]["contributionCalendar"]
    total = f'{cal["totalContributions"]:,}'
    days = [d for w in cal["weeks"] for d in w["contributionDays"]][-31:]
    (ROOT / "assets/hero-contrib.svg").write_text(hero_contrib(vb, inner, total))
    (ROOT / "assets/activity.svg").write_text(activity(days).render())
    print(f"spotlight blocks: {total} contributions/yr, {sum(d['contributionCount'] for d in days)} in 31d")

if __name__ == "__main__":
    main()
