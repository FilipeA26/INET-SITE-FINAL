/**
 * Ramificações da luz: onde a ponta "encosta" em algo da página e para onde os fios correm.
 *
 * Âncoras vêm do DOM: o título (h2) de cada seção e as imagens/vídeos grandes (produtos).
 * De cada âncora saem 2–4 fios finos: o primeiro vai até a borda da própria âncora, os outros
 * até cartões, imagens ou subtítulos logo abaixo; sem vizinhos, até o lado oposto da tela.
 * Tudo em coordenadas do SVG (x da página, y a partir do topo do SVG).
 */

export type Pt = { x: number; y: number };
export type Branch = { d: string; from: number; end: Pt };
export type Anchor = { at: number; branches: Branch[] };

type Box = { l: number; t: number; r: number; b: number };

const box = (el: Element, top: number): Box => {
  const r = el.getBoundingClientRect();
  return { l: r.left, t: r.top - top, r: r.right, b: r.bottom - top };
};

/** Fio em C: sai na direção da luz e dobra até o alvo, com uma barriga lateral leve. */
const curve = (p: Pt, dir: Pt, q: Pt) => {
  const dx = q.x - p.x, dy = q.y - p.y;
  const dist = Math.hypot(dx, dy) || 1;
  const k = Math.min(180, dist * 0.42);
  const c1 = { x: p.x + dir.x * k, y: p.y + Math.abs(dir.y) * k };
  const bow = dist * 0.14 * (dx >= 0 ? 1 : -1);
  const c2 = { x: p.x + dx * 0.72 - (dy / dist) * bow, y: p.y + dy * 0.72 + (dx / dist) * bow };
  return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
};

/** Ponto da caixa mais perto de p, um pouco para fora dela (o fio para na borda, não entra). */
const edge = (b: Box, p: Pt, pad = 10): Pt => {
  const x = Math.max(b.l - pad, Math.min(b.r + pad, p.x));
  const y = Math.max(b.t - pad, Math.min(b.b + pad, p.y));
  if (x !== p.x || y !== p.y) return { x, y };
  // p dentro da caixa: sai pelo lado mais perto
  const d = [p.x - b.l, b.r - p.x, p.y - b.t, b.b - p.y];
  const i = d.indexOf(Math.min(...d));
  return i === 0 ? { x: b.l - pad, y: p.y } : i === 1 ? { x: b.r + pad, y: p.y } : i === 2 ? { x: p.x, y: b.t - pad } : { x: p.x, y: b.b + pad };
};

export function planBranches(opts: {
  main: HTMLElement;
  top: number;
  start: number;
  end: number;
  w: number;
  vh: number;
  mobile: boolean;
  pointAt: (len: number) => Pt;
  lengthAtY: (y: number) => number;
}): Anchor[] {
  const { main, top, start, end, w, vh, mobile, pointAt, lengthAtY } = opts;
  const inside = (b: Box) => b.t >= start + 40 && b.b <= end && b.r - b.l > 2 && b.b - b.t > 2;

  // títulos de seção e mídias grandes de produto
  const raw: Box[] = [];
  for (const h of main.querySelectorAll("h2")) raw.push(box(h, top));
  for (const m of main.querySelectorAll("img, video")) {
    const b = box(m, top);
    if (b.r - b.l >= (mobile ? 140 : 200) && b.b - b.t >= 120 && b.r - b.l < w * 0.9) raw.push(b);
  }
  const cands = raw.filter(inside).sort((a, b) => a.t - b.t);

  // uma âncora a cada ~meia tela, no máximo
  const gap = vh * (mobile ? 0.6 : 0.5);
  const picked: Box[] = [];
  for (const b of cands) if (!picked.length || b.t - picked[picked.length - 1].t >= gap) picked.push(b);

  // vizinhos possíveis para os fios
  const near: Box[] = [];
  for (const el of main.querySelectorAll("img, video, h3, .card, [data-tube-hide]")) {
    // um subtítulo dentro de cartão: o alvo é o cartão (o fio para na borda dele, não entra)
    let host: Element = el;
    if (el.tagName === "H3")
      for (let p = el.parentElement; p && p !== main; p = p.parentElement)
        if ((parseFloat(getComputedStyle(p).borderTopLeftRadius) || 0) >= 12) {
          host = p;
          break;
        }
    const b = box(host, top);
    if (near.some((n) => n.l === b.l && n.t === b.t)) continue;
    if (inside(b) && b.r - b.l < w * 0.9) near.push(b);
  }

  const max = mobile ? 2 : 4;
  return picked.map((a) => {
    const cy = (a.t + a.b) / 2;
    const at = lengthAtY(cy);
    const p = pointAt(at);
    const p2 = pointAt(at + 6);
    const len = Math.hypot(p2.x - p.x, p2.y - p.y) || 1;
    const dir = { x: (p2.x - p.x) / len, y: (p2.y - p.y) / len };

    const ends: Pt[] = [edge(a, p, 14)];
    const others = near
      .filter((b) => b.t > a.t - vh * 0.1 && b.t < a.b + vh * 0.7 && !(b.l === a.l && b.t === a.t))
      .map((b) => edge(b, p, 8))
      .filter((q) => Math.hypot(q.x - p.x, q.y - p.y) > 90);
    // espalha: escolhe sempre o alvo mais longe dos já escolhidos
    while (ends.length < max && others.length) {
      let bi = 0, bd = -1;
      others.forEach((q, i) => {
        const d = Math.min(...ends.map((e) => Math.hypot(e.x - q.x, e.y - q.y)));
        if (d > bd) (bd = d), (bi = i);
      });
      if (bd < 120) break;
      ends.push(others.splice(bi, 1)[0]);
    }
    // sem vizinhos: corre para o lado oposto da tela
    if (ends.length < 2) ends.push({ x: p.x < w / 2 ? w * 0.9 : w * 0.1, y: Math.min(end - 20, cy + vh * 0.32) });
    if (ends.length < 3 && !mobile) ends.push({ x: w * 0.5 + (p.x < w / 2 ? 1 : -1) * w * 0.08, y: Math.min(end - 20, cy + vh * 0.5) });

    return { at, branches: ends.map((q, i) => ({ d: curve(p, dir, q), from: i * 0.12, end: q })) };
  });
}
