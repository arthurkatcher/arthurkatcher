// Self-hosted activity chart (replaces github-readme-activity-graph, upstream died with 402).
// Neo-brutal GH-dark card, yellow bars (past days 45%, today solid). Style source: profile-v2 scripts/variants.mjs.
// Input: .github/data/contrib.json   Output: assets/activity.svg
import { writeFileSync, readFileSync } from "fs";
const cal = JSON.parse(readFileSync(new URL("../data/contrib.json", import.meta.url),"utf8")).data.user.contributionsCollection.contributionCalendar;
const days = cal.weeks.flatMap(w=>w.contributionDays).slice(-31);
const counts = days.map(d=>d.contributionCount);
const max = Math.max(1,...counts), total = counts.reduce((a,b)=>a+b,0), n = counts.length;
const YEL="#FFD500", mono="ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace", sans="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const esc=s=>s.replace(/&/g,"&amp;");
const skins = {
  bare:  { card:null,      ink:"#777777", faint:"#777777", grid:"#777777", gridOp:0.35, area:YEL, areaOp:0.14, line:YEL, dot:"#111111", rule:"#777777", slab:null,  stroke:null },
  dark:  { card:"#111111", ink:"#FFFFFF", faint:"#888888", grid:"#333333", gridOp:1,    area:YEL, areaOp:0.14, line:YEL, dot:"#111111", rule:"#FFFFFF", slab:YEL,   stroke:"#111111" },
  gh:    { card:"#0d1117", ink:"#FFFFFF", faint:"#999999", grid:"#21262d", gridOp:1,    area:YEL, areaOp:0.14, line:YEL, dot:"#0d1117", rule:"#30363d", slab:YEL,   stroke:"#30363d" },
  yellow:{ card:YEL,       ink:"#111111", faint:"#6b6000", grid:"#c4a900", gridOp:1,    area:"#111111", areaOp:0.08, line:"#111111", dot:YEL, rule:"#111111", slab:"#111111", stroke:"#111111" },
  light: { card:"#FFFFFF", ink:"#111111", faint:"#777777", grid:"#E5E1D8", gridOp:1,    area:YEL, areaOp:0.14, line:"#111111", dot:YEL, rule:"#111111", slab:"#111111", stroke:"#111111" },
};
function chart(P, {bars=false, barStyle="solid", label="ACTIVITY", sub="/ LAST 31 DAYS"}={}){
  const W=860, OFF=P.card?6:0, padL=P.card?64:40, padR=P.card?58:24, top=P.card?96:36, bot=P.card?258:196;
  const X=i=>padL+i*((W-padL-padR-OFF)/(n-1)), Y=c=>bot-(c/max)*(bot-top);
  const co=counts.map((c,i)=>({x:X(i),y:Y(c)}));
  const lineD=co.map((c,i)=>`${i?"L":"M"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaD=`M${co[0].x.toFixed(1)},${bot} `+co.map(c=>`L${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ")+` L${co[n-1].x.toFixed(1)},${bot} Z`;
  const grid=[0.25,0.5,0.75,1].map(f=>{const gy=bot-(bot-top)*f;return `<line x1="${padL-10}" y1="${gy.toFixed(1)}" x2="${W-padR-OFF+10}" y2="${gy.toFixed(1)}" stroke="${P.grid}" stroke-opacity="${P.gridOp}" stroke-width="2" stroke-dasharray="2 8"/><text x="${padL-18}" y="${(gy+4).toFixed(1)}" font-size="11" font-weight="700" fill="${P.faint}" font-family="${mono}" text-anchor="end">${Math.round(max*f)}</text>`;}).join("\n  ");
  const xl=days.map((d,i)=>(i%5===0||i===n-1)?`<text x="${X(i).toFixed(1)}" y="${bot+24}" font-size="11" font-weight="700" fill="${P.faint}" font-family="${mono}" text-anchor="middle">${d.date.slice(5)}</text>`:"").join("");
  let body;
  if(bars){
    const bw=Math.floor((W-padL-padR-OFF)/n)-(barStyle==="thin"?12:6);
    body=co.map((c,i)=>{const last=i===n-1, h=Math.max(bot-c.y, counts[i]?2:0);
      if(barStyle==="outline") return `<rect x="${(c.x-bw/2).toFixed(1)}" y="${(bot-h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" fill="${last?P.line:P.card}" fill-opacity="${last?1:1}" stroke="${P.line}" stroke-width="2"/>`;
      if(barStyle==="dim") return `<rect x="${(c.x-bw/2).toFixed(1)}" y="${(bot-h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" fill="${P.line}" fill-opacity="${last?1:0.45}" stroke="${P.line}" stroke-width="1.5"/>`;
      return `<rect x="${(c.x-bw/2).toFixed(1)}" y="${(bot-h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" fill="${last?P.line:P.area}" fill-opacity="${last?1:0.85}"/>`;}).join("");
  } else {
    const dots=co.map((c,i)=>{const s=i===n-1?12:8;return `<rect x="${(c.x-s/2).toFixed(1)}" y="${(c.y-s/2).toFixed(1)}" width="${s}" height="${s}" fill="${i===n-1?P.line:P.dot}" stroke="${P.line}" stroke-width="2"/>`;}).join("");
    body=`<path d="${areaD}" fill="${P.area}" fill-opacity="${P.areaOp}"/><path d="${lineD}" fill="none" stroke="${P.line}" stroke-width="3.5" stroke-linecap="square" stroke-linejoin="miter"/>${dots}`;
  }
  const H=bot+(P.card?48:40)+OFF;
  const frame=P.card?`<rect x="${4+OFF}" y="${4+OFF}" width="${W-OFF-4}" height="${H-OFF-4}" fill="${P.slab}"/><rect x="2" y="2" width="${W-OFF-4}" height="${H-OFF-4}" fill="${P.card}" stroke="${P.stroke}" stroke-width="2"/>`:"";
  const eyebrow=P.card?`<rect x="${padL}" y="46" width="8" height="8" fill="${P.line===YEL?YEL:"#111111"}" stroke="${P.rule}" stroke-width="1.5"/><text x="${padL+20}" y="54" font-size="10" letter-spacing="2" font-weight="700" font-family="${mono}"><tspan fill="${P.line}">//</tspan><tspan fill="${P.faint}">&#160;${label} ${sub}</tspan></text><text x="${W-padR-OFF}" y="54" font-size="11" font-weight="700" fill="${P.ink}" font-family="${mono}" text-anchor="end">${total} total · max ${max}/day</text>`
    :`<text x="${padL}" y="18" font-size="10" letter-spacing="2" font-weight="700" font-family="${mono}"><tspan fill="${YEL}">//</tspan><tspan fill="${P.faint}">&#160;${label} ${sub}</tspan></text><text x="${W-padR}" y="18" font-size="11" font-weight="700" fill="${P.faint}" font-family="${mono}" text-anchor="end">${total} total · max ${max}/day</text>`;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${total} contributions in the last 31 days">
  ${frame}${eyebrow}
  ${grid}
  <line x1="${padL-10}" y1="${bot}" x2="${W-padR-OFF+10}" y2="${bot}" stroke="${P.rule}" stroke-width="2"/>
  ${body}${xl}
</svg>`;
}
writeFileSync(new URL("../../assets/activity.svg", import.meta.url), chart(skins.gh,{bars:true,barStyle:"dim"})+"\n");
console.log(`activity.svg: ${total} contributions / 31d, max ${max}`);
