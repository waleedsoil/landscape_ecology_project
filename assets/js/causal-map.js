/* Group 4 cause-effect map (Mulder-style ring).
   EDIT HERE: the three lists below (NODES, EDGES, HYP). The ring, the arrows and every tool on the page
   are built from them, so a new box or arrow appears everywhere at once.
   Arrow signs: '+' = more of the source gives more of the target, '-' = gives less,
                '0' = changes the strength of another effect (direction depends), 'x' = removed by the study design. */
window.G4_MAP = true;
(function () {
'use strict';
var $ = function (q) { return document.querySelector(q); };
var $$ = function (q) { return Array.prototype.slice.call(document.querySelectorAll(q)); };

var CATS = {
  drv:  { n: 'Factors and site',          col: 'var(--ink)' },
  nrg:  { n: 'Radiation and temperature', col: 'var(--s)' },
  wat:  { n: 'Water',                     col: 'var(--rain)' },
  soil: { n: 'Litter and soil',           col: 'var(--d)' }
};

/* Ring order = order of this list (clockwise, the first six centred at the top). */
var NODES = [
  { id: 'par', cat: 'drv', s: 'Parent material|& texture', l: 'Parent material and texture', meas: true,
    m: 'Finger test on the auger cores and in the spade profile.',
    d: 'Muschelkalk limestone with loess and slope debris, in places covered by imported clay-rich, calcareous topsoil. Sets water storage and acid buffering, so it has to be similar at all four plots.' },
  { id: 'for', cat: 'drv', k: 'Coniferous forest', s: 'Forest type|coniferous', l: 'Forest type (more coniferous)', design: true,
    m: 'Design factor: stand description at each plot.',
    d: 'Design factor 2: coniferous vs deciduous stand. Read its arrows as "more coniferous gives ...".' },
  { id: 'elv', cat: 'drv', k: 'Elevation', s: 'Elevation|held constant', l: 'Elevation (held constant)', design: true,
    m: 'All plots on one contour line taken from the 1 m DGM and checked with GPS.',
    d: 'Kept the same at all plots, so its effect on temperature is removed by the design.' },
  { id: 'asp', cat: 'drv', k: 'South-facing aspect', s: 'Aspect|south-facing', l: 'Aspect (more south-facing)', design: true,
    m: 'Design factor: compass and DGM.',
    d: 'Design factor 1: north- vs south-facing slope. Read its arrows as "more south-facing gives ...".' },
  { id: 'slo', cat: 'drv', s: 'Slope|angle', l: 'Slope angle', meas: true,
    m: '1 m DGM and clinometer; recorded as a covariate.',
    d: 'Steepness changes how strongly aspect acts on radiation and how fast water drains away.' },
  { id: 'cld', cat: 'drv', s: 'Cloud|cover', l: 'Cloud cover', meas: true,
    m: 'Weather data from the garden’s bioclimatology station, or an open-field logger.',
    d: 'Weather during the logging period. Decides on which days aspect effects can show at all.' },
  { id: 'rad', cat: 'nrg', s: 'Direct sun|on the slope', l: 'Direct sunlight on the slope',
    m: 'Not measured; calculated from the DGM and the sun position (see the simulator).',
    d: 'Direct beam radiation received by the slope surface above the canopy.' },
  { id: 'can', cat: 'nrg', s: 'Canopy|closure', l: 'Canopy closure in winter', meas: true,
    m: 'GLAMA hemispherical photos; canopy openness is its inverse.',
    d: 'How much of the sky the crowns cover in November and December.' },
  { id: 'lgt', cat: 'nrg', s: 'Light at the|forest floor', l: 'Light at the forest floor', meas: true,
    m: 'HOBO Pendant at 2 m (lux), 2 per plot.',
    d: 'Radiation that actually reaches the understorey.' },
  { id: 'ngt', cat: 'nrg', s: 'Night-time|cooling', l: 'Night-time radiative cooling',
    m: 'Not measured directly; it shows in the daily minimum temperature.',
    d: 'Long-wave heat loss from the forest floor to the night sky.' },
  { id: 'tmp', cat: 'nrg', s: 'Temp. max|& daily range', l: 'Daily maximum and range of temperature', meas: true,
    m: 'TOMST TMS-4 at +2 and +15 cm, HOBO Pro v2 at 1 m.',
    d: 'Daytime peak and day-night swing of surface and near-ground air temperature.' },
  { id: 'rhu', cat: 'nrg', s: 'Relative|humidity', l: 'Relative humidity', meas: true,
    m: 'HOBO Pro v2 at 1 m.',
    d: 'Moisture of the air relative to saturation; low values mean strong drying.' },
  { id: 'tsl', cat: 'nrg', s: 'Topsoil temp.|range', l: 'Topsoil temperature range', meas: true,
    m: 'TOMST TMS-4 sensor at −6 cm.',
    d: 'Day-night swing of temperature in the mineral topsoil.' },
  { id: 'eva', cat: 'wat', s: 'Evaporation', l: 'Evaporation from litter and soil',
    m: 'Not measured.',
    d: 'Water lost to the air from the litter layer and the topsoil.' },
  { id: 'int', cat: 'wat', s: 'Rain|interception', l: 'Rain interception by the canopy',
    m: 'Not measured.',
    d: 'Rain caught by the crowns that evaporates before it reaches the ground.' },
  { id: 'trn', cat: 'wat', s: 'Winter|transpiration', l: 'Winter transpiration',
    m: 'Not measured.',
    d: 'Water drawn from the soil by trees that keep their foliage in winter.' },
  { id: 'smo', cat: 'wat', s: 'Soil|moisture', l: 'Soil moisture (0–15 cm)', meas: true,
    m: 'TOMST moisture probe, calibrated for the soil texture.',
    d: 'Water content of the topsoil.' },
  { id: 'lea', cat: 'wat', s: 'Leaching of|base cations', l: 'Leaching of base cations',
    m: 'Not measured.',
    d: 'Ca, Mg and K carried down and out of the topsoil by draining water.' },
  { id: 'dec', cat: 'soil', s: 'Decomposition', l: 'Litter decomposition rate',
    m: 'Not measured directly; inferred from the O-horizon and the humus form.',
    d: 'How fast litter is broken down and mixed into the mineral soil.' },
  { id: 'ohz', cat: 'soil', s: 'O-horizon|thickness', l: 'O-horizon thickness', meas: true,
    m: 'Ruler at the profile and at the 4 sampling points per plot (L, Of, Oh layers).',
    d: 'The organic layer on top of the mineral soil: years of litter input minus decomposition.' },
  { id: 'wrm', cat: 'soil', s: 'Earthworm|activity', l: 'Earthworm activity', meas: true,
    m: 'Observed in the profile: worm channels, mixing, humus form.',
    d: 'Earthworms shred litter and mix it into the mineral soil (bioturbation).' },
  { id: 'ph', cat: 'soil', s: 'Topsoil pH', l: 'Topsoil pH', meas: true,
    m: 'pH meter, 0.01 M CaCl₂, 2 depths × 4 replicates per plot.',
    d: 'Acidity of the uppermost mineral soil; the main chemical response we measure.' },
  { id: 'alu', cat: 'soil', s: 'Dissolved|aluminium', l: 'Dissolved aluminium (Al³⁺)',
    m: 'Not measured; follows from pH.',
    d: 'Becomes mobile, and can become toxic, below about pH 4.2.' },
  { id: 'nut', cat: 'soil', s: 'Nutrient|availability', l: 'Nutrient availability (Ca, Mg, K, P)',
    m: 'Not measured; follows from pH.',
    d: 'Supply of base cations and phosphorus to roots and soil life.' },
  { id: 'lit', cat: 'soil', s: 'Litter|quality', l: 'Litter quality (nutrients, base cations)',
    m: 'Not measured; set by the tree species.',
    d: 'Nutrient and base-cation content of fresh litter; low in needles.' },
  { id: 'aci', cat: 'soil', s: 'Acid|input', l: 'Acid input (organic acids, N and S deposition)',
    m: 'Not measured.',
    d: 'Acids from decomposing litter plus nitrogen and sulphur deposited with throughfall.' },
  { id: 'buf', cat: 'soil', s: 'Acid buffer|capacity', l: 'Acid buffer capacity (carbonates, clay)',
    m: 'Not measured; follows from the parent material and the texture.',
    d: 'Ability of the soil to neutralise acids without its pH falling.' }
];

var EDGES = [
  { f: 'asp', t: 'rad', s: '+', h: ['H1'], n: 'South slopes face the low winter sun; a north slope of about 20° gets almost no direct beam in December.' },
  { f: 'slo', t: 'rad', s: '0', h: ['H1'], n: 'Steeper slopes strengthen the aspect effect: more sun on a steep south slope, less on a steep north slope.' },
  { f: 'cld', t: 'rad', s: '-', h: ['H1'], n: 'Clouds block the direct beam. Germany averages about 42 hours of sunshine in December.' },
  { f: 'cld', t: 'ngt', s: '-', h: [], n: 'A cloud layer sends long-wave radiation back and reduces cooling at night.' },
  { f: 'elv', t: 'tmp', s: 'x', h: [], n: 'Air cools by about 0.65 K per 100 m of height. Putting all plots on one contour removes this path.' },
  { f: 'for', t: 'can', s: '+', h: ['H1', 'H2'], n: 'Evergreen conifers keep their crowns in winter; deciduous trees are leafless.' },
  { f: 'rad', t: 'lgt', s: '+', h: ['H1'], n: 'More direct sun above the canopy means more light below it.' },
  { f: 'can', t: 'lgt', s: '-', h: ['H1', 'H2'], n: 'A closed canopy intercepts light, the low winter beam most of all.' },
  { f: 'can', t: 'ngt', s: '-', h: ['H2'], n: 'Crowns shield the forest floor from the cold night sky.' },
  { f: 'can', t: 'int', s: '+', h: ['H2'], n: 'Dense evergreen crowns catch more rain.' },
  { f: 'lgt', t: 'tmp', s: '+', h: ['H1', 'H2'], n: 'Radiation absorbed at the floor heats the surface and the air above it by day.' },
  { f: 'ngt', t: 'tmp', s: '+', h: ['H2'], n: 'Stronger cooling at night lowers the minimum and widens the daily range.' },
  { f: 'tmp', t: 'tsl', s: '+', h: ['H1', 'H2'], n: 'Surface temperature swings travel down into the topsoil.' },
  { f: 'ohz', t: 'tsl', s: '-', h: [], n: 'The O-horizon insulates the mineral soil and damps its temperature swings.' },
  { f: 'tmp', t: 'rhu', s: '-', h: ['H1'], n: 'Warmer air can hold more water vapour, so relative humidity drops.' },
  { f: 'lgt', t: 'eva', s: '+', h: ['H1'], n: 'Absorbed radiation supplies the energy for evaporation.' },
  { f: 'rhu', t: 'eva', s: '-', h: ['H1'], n: 'Humid air takes up less water vapour.' },
  { f: 'ohz', t: 'eva', s: '-', h: [], n: 'The litter layer acts as a mulch over the mineral soil.' },
  { f: 'eva', t: 'smo', s: '-', h: ['H1', 'H2'], n: 'Evaporation dries the topsoil.' },
  { f: 'int', t: 'smo', s: '-', h: ['H2'], n: 'Intercepted rain evaporates from the crowns and never reaches the soil.' },
  { f: 'for', t: 'trn', s: '+', h: ['H2'], n: 'Evergreen conifers keep transpiring on mild winter days.' },
  { f: 'trn', t: 'smo', s: '-', h: ['H2'], n: 'Transpiration draws water out of the soil.' },
  { f: 'slo', t: 'smo', s: '-', h: [], n: 'Steeper slopes shed and drain water faster.' },
  { f: 'par', t: 'smo', s: '+', h: [], n: 'Clay- and silt-rich soils hold more water.' },
  { f: 'par', t: 'buf', s: '+', h: ['H2'], n: 'Carbonates from the limestone and the calcareous fill, and clay, neutralise acids.' },
  { f: 'tmp', t: 'dec', s: '+', h: ['H1'], n: 'A warmer litter layer decomposes faster.' },
  { f: 'smo', t: 'dec', s: '+', h: ['H1'], n: 'Moist (not waterlogged) litter decomposes faster.' },
  { f: 'for', t: 'lit', s: '-', h: ['H2'], n: 'Needle litter is poorer in nutrients and base cations, and more acidic, than broadleaf litter.' },
  { f: 'lit', t: 'dec', s: '+', h: ['H2'], n: 'Nutrient-rich broadleaf litter decomposes faster.' },
  { f: 'lit', t: 'wrm', s: '+', h: ['H2'], n: 'Earthworms prefer palatable, nutrient-rich litter.' },
  { f: 'smo', t: 'wrm', s: '+', h: [], n: 'Earthworms need moist soil.' },
  { f: 'ph', t: 'wrm', s: '+', h: ['H2'], n: 'Most earthworms avoid strongly acidic soils.' },
  { f: 'wrm', t: 'dec', s: '+', h: ['H2'], n: 'Earthworms shred litter and mix it into the mineral soil.' },
  { f: 'dec', t: 'ohz', s: '-', h: ['H1', 'H2'], n: 'Faster decomposition and mixing leave less organic matter on top.' },
  { f: 'for', t: 'aci', s: '+', h: ['H2'], n: 'Decomposing needle litter releases organic acids, and conifer stands receive more nitrogen and sulphur with throughfall.' },
  { f: 'aci', t: 'ph', s: '-', h: ['H2'], n: 'Acids use up buffer capacity and lower pH.' },
  { f: 'lit', t: 'ph', s: '+', h: ['H2'], n: 'Base-rich litter returns calcium and magnesium to the topsoil.' },
  { f: 'buf', t: 'ph', s: '+', h: ['H2'], n: 'While carbonates remain, pH stays in the carbonate buffer range (pH 8.6–6.2).' },
  { f: 'smo', t: 'lea', s: '+', h: [], n: 'More water draining through the soil carries more base cations away.' },
  { f: 'lea', t: 'ph', s: '-', h: [], n: 'Losing base cations acidifies the topsoil.' },
  { f: 'ph', t: 'nut', s: '+', h: [], n: 'In acidic forest soils a higher pH means more exchangeable Ca, Mg and K and a better P supply.' },
  { f: 'ph', t: 'alu', s: '-', h: [], n: 'Below about pH 4.2 (aluminium buffer range) aluminium dissolves.' },
  { f: 'alu', t: 'nut', s: '-', h: [], n: 'Al³⁺ displaces base cations from exchange sites and binds phosphorus.' }
];

/* Hypotheses: same wording as on the overview page. 'exp' = predicted direction (1 up, -1 down). */
var HYP = [
  { id: 'H1', from: 'asp', exp: { lgt: 1, tmp: 1, tsl: 1, rhu: -1, smo: -1, ohz: -1 },
    t: 'South-facing plots have more light at the forest floor, a higher daily maximum and larger daily range of air, surface and topsoil temperature, and lower relative humidity and soil moisture than north-facing plots, especially on clear days; the difference between coniferous and deciduous plots is larger on the south-facing slope; and the O-horizon is thicker on the north-facing slope, thickest in N-C and thinnest in S-D.',
    note: 'All microclimate chains start with direct sun, and clouds cut that first link, so the effect should show mainly on clear days. The interaction is not a chain of its own: it sits where two arrows meet at light at the forest floor, which is the direct sun that arrives multiplied by the share the canopy lets through. Where more sun arrives (south), the same canopy removes more, so the gap between conifer and deciduous plots is larger there. O-horizon: chains point both ways; a warmer south slope speeds decomposition (thinner), a drier one slows it (thicker). The hypothesis assumes warmth wins, as in this humid climate moisture limits decomposition only in dry spells. The chains through decomposition act over years and are already built into the O-horizon we measure.' },
  { id: 'H2', from: 'for', exp: { ohz: 1, ph: -1, lgt: -1, tmp: -1, smo: -1 },
    t: 'Compared with deciduous forests, coniferous forests exhibit a thicker O-horizon, lower mineral soil pH (particularly in the upper mineral soil), less light at the forest floor, a smaller daily temperature range, and drier topsoil in early winter.',
    note: 'O-horizon: chains point both ways. Poorer needle litter, fewer earthworms and drier soil (interception, winter transpiration) lead to a thicker O-horizon; but less light under conifers also means less evaporation and moister soil, which would speed decomposition. Field studies find thicker forest floors under evergreen conifers (Augusto et al. 2015), so the litter chains seem to dominate. pH: most chains point down; the two counter-chains run through drier soil and less leaching, and carbonate buffering can mask the effect below the top few centimetres. Soil moisture: interception and winter transpiration dry the soil, while less light and a thicker O-horizon reduce evaporation; field studies find drier soils under evergreen conifers overall. Counting chains is not weighing them: one strong chain can outweigh several weak ones.' }
];

/* ------------------------------------------------------------------ */
var IDX = {}, OUT = {}, IN = {};
NODES.forEach(function (n, i) { IDX[n.id] = i; OUT[n.id] = []; IN[n.id] = []; n.k = n.k || n.s.replace('|', ' '); });
EDGES = EDGES.filter(function (e) {
  var ok = e.f in IDX && e.t in IDX && ['+', '-', '0', 'x'].indexOf(e.s) >= 0;
  if (!ok && window.console) console.warn('Skipped arrow with an unknown box or sign:', e);
  return ok;
});
EDGES.forEach(function (e, k) {
  e.sv = e.s === '+' ? 1 : e.s === '-' ? -1 : 0;
  e.blocked = e.s === 'x';
  OUT[e.f].push(k); IN[e.t].push(k);
});
var LAB = function (id) { return NODES[IDX[id]].k; };
/* lower-case the first letter unless the word is an abbreviation (pH, O-horizon, Al) */
var lc = function (t) { return t.length > 1 && /[a-z]/.test(t.charAt(1)) ? t.charAt(0).toLowerCase() + t.slice(1) : t; };
var CLS = function (v) { return v === 1 ? 'up' : v === -1 ? 'down' : 'mix'; };
var GLY = function (v) { return v === 1 ? '↑' : v === -1 ? '↓' : '±'; };
var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

function pathsFrom(src, max) {
  max = max || 10; var res = {}, seen = {}; seen[src] = 1;
  (function dfs(v, sg, es) {
    OUT[v].forEach(function (k) {
      var e = EDGES[k]; if (e.blocked || seen[e.t]) return;
      var s = sg * e.sv, p = es.concat(k);
      (res[e.t] = res[e.t] || []).push({ s: s, e: p });
      if (p.length < max) { seen[e.t] = 1; dfs(e.t, s, p); delete seen[e.t]; }
    });
  })(src, 1, []);
  return res;
}
function pathsTo(dst, max) {
  max = max || 10; var res = {}, seen = {}; seen[dst] = 1;
  (function dfs(v, sg, es) {
    IN[v].forEach(function (k) {
      var e = EDGES[k]; if (e.blocked || seen[e.f]) return;
      var s = sg * e.sv, p = [k].concat(es);
      (res[e.f] = res[e.f] || []).push({ s: s, e: p });
      if (p.length < max) { seen[e.f] = 1; dfs(e.f, s, p); delete seen[e.f]; }
    });
  })(dst, 1, []);
  return res;
}
function net(list) {
  var up = false, dn = false, z = false;
  list.forEach(function (p) { if (p.s === 1) up = true; else if (p.s === -1) dn = true; else z = true; });
  return up && !dn && !z ? 1 : dn && !up && !z ? -1 : 0;
}
function cycles(max) {
  max = max || 10; var out = [];
  NODES.forEach(function (sn, si) {
    var seen = {}; seen[sn.id] = 1;
    (function dfs(v, es) {
      OUT[v].forEach(function (k) {
        var e = EDGES[k]; if (e.blocked) return;
        if (e.t === sn.id) { out.push(es.concat(k)); return; }
        if (IDX[e.t] < si || seen[e.t] || es.length + 1 >= max) return;
        seen[e.t] = 1; dfs(e.t, es.concat(k)); delete seen[e.t];
      });
    })(sn.id, []);
  });
  return out.map(function (es) { var s = 1; es.forEach(function (k) { s *= EDGES[k].sv; }); return { e: es, s: s }; });
}
var LOOPS = cycles();

/* ---------- drawing ---------- */
var svg = $('#ring'), box = $('#ringbox'), panel = $('#panel');
var PW = 126, PH = 44, POS = {}, G = null;
function geom(W, H) {
  var cx = W / 2, cy = H / 2, rx = cx - PW / 2 - 10, ry = cy - PH / 2 - 10, S = 2400, pts = [], cum = [0], L = 0;
  for (var i = 0; i <= S; i++) {
    var t = -Math.PI / 2 + i / S * 2 * Math.PI;
    pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]);
    if (i) { var dx = Math.abs(pts[i][0] - pts[i - 1][0]), dy = Math.abs(pts[i][1] - pts[i - 1][1]); L += Math.max(dx / (PW + 8), dy / (PH + 8)); cum.push(L); }
  }
  return { W: W, H: H, cx: cx, cy: cy, pts: pts, cum: cum, L: L };
}
function at(g, target) { var lo = 0, hi = g.cum.length - 1; while (lo < hi) { var m = (lo + hi) >> 1; if (g.cum[m] < target) lo = m + 1; else hi = m; } return g.pts[lo]; }
function edgeD(e) {
  var p = POS[e.f], q = POS[e.t], mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, c = { x: mx + (G.cx - mx) * 0.5, y: my + (G.cy - my) * 0.5 };
  var a = rim(p, c, 2), b = rim(q, c, 3);
  return 'M' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + 'Q' + c.x.toFixed(1) + ' ' + c.y.toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
}
function rim(p, c, pad) {
  var dx = c.x - p.x, dy = c.y - p.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  var t = Math.min((PW / 2 + pad) / Math.max(Math.abs(ux), 1e-6), (PH / 2 + pad) / Math.max(Math.abs(uy), 1e-6));
  return { x: p.x + ux * t, y: p.y + uy * t };
}
function draw() {
  var W = Math.max(760, Math.round(box.clientWidth)), H = Math.round(W * 0.72), N = NODES.length;
  for (var k = 0; k < 16; k++) { G = geom(W, H); if (G.L >= N * 1.06) break; H = Math.round(H * 1.06); }
  var step = G.L / N;
  NODES.forEach(function (n, i) { var pt = at(G, ((i - 2.5) * step + G.L) % G.L); POS[n.id] = { x: pt[0], y: pt[1] }; });
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('height', H);
  var mk = function (id, col) { return '<marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + col + '"/></marker>'; };
  var s = '<defs>' + mk('ap', 'var(--pos)') + mk('am', 'var(--neg)') + mk('az', 'var(--mut)') + '</defs><g id="eds">';
  EDGES.forEach(function (e, k) {
    var cls = e.blocked ? 'b' : e.s === '+' ? 'p' : e.s === '-' ? 'm' : 'z', m = e.s === '+' ? 'ap' : e.s === '-' ? 'am' : 'az', d = edgeD(e);
    s += '<path class="ed ' + cls + '" data-k="' + k + '" d="' + d + '" marker-end="url(#' + m + ')"/>';
  });
  s += '</g><g id="hits">';
  EDGES.forEach(function (e, k) { s += '<path class="hit" data-k="' + k + '" d="' + edgeD(e) + '"><title>' + esc(LAB(e.f) + ' → ' + LAB(e.t) + ': ' + e.n) + '</title></path>'; });
  s += '</g><g id="nds">';
  NODES.forEach(function (n) {
    var p = POS[n.id], lines = n.s.split('|'), col = CATS[n.cat].col, txt = '';
    lines.forEach(function (ln, i) { txt += '<text x="0" y="' + (lines.length === 1 ? 5 : i === 0 ? -3 : 13) + '" text-anchor="middle">' + esc(ln) + '</text>'; });
    s += '<g class="nd' + (n.design ? ' dz' : '') + '" data-id="' + n.id + '" transform="translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')" tabindex="0" role="button" aria-label="' + esc(n.l) + '">' +
      '<rect x="' + (-PW / 2) + '" y="' + (-PH / 2) + '" width="' + PW + '" height="' + PH + '" rx="10" stroke="' + col + '"/>' + txt +
      (n.meas ? '<circle cx="' + (PW / 2 - 8) + '" cy="' + (-PH / 2 + 8) + '" r="3.5" fill="' + col + '"/>' : '') +
      '<g class="bd" style="display:none"><circle cx="' + (-PW / 2 + 2) + '" cy="' + (-PH / 2 + 2) + '" r="10" fill="var(--bg)" stroke="currentColor"/><text class="gl" x="' + (-PW / 2 + 2) + '" y="' + (-PH / 2 + 7) + '" text-anchor="middle"></text></g></g>';
  });
  svg.innerHTML = s + '</g>';
  apply();
}

/* ---------- state ---------- */
/* the other end of the two design factors: same box, every direction reversed */
var FLIP = { 'for~': { id: 'for', k: 'Deciduous forest', l: 'Forest type (more deciduous)' },
             'asp~': { id: 'asp', k: 'North-facing aspect', l: 'Aspect (more north-facing)' } };
var base = function (v) { return FLIP[v] ? FLIP[v].id : v; };
var sgn = function (v) { return FLIP[v] ? -1 : 1; };
var LABV = function (v) { return FLIP[v] ? FLIP[v].k : LAB(v); };
var flipList = function (L, f) { return f === 1 ? L : L.map(function (p) { return { s: p.s * f, e: p.e }; }); };
var word = function (v) { return v === 1 ? 'increases' : v === -1 ? 'decreases' : 'changes the strength of'; };
var ST = { kind: null };
function apply() {
  var eds = $$('#ring .ed'), nds = $$('#ring .nd'), hiE = {}, nodeSet = null, netMap = {}, sel = null;
  if (ST.kind === 'node') {
    sel = base(ST.id); nodeSet = {}; nodeSet[sel] = 1; var fs = ST.mode === 'causes' ? 1 : sgn(ST.id);
    var r = ST.mode === 'causes' ? pathsTo(sel) : pathsFrom(sel);
    Object.keys(r).forEach(function (id) { nodeSet[id] = 1; netMap[id] = net(flipList(r[id], fs)); r[id].forEach(function (p) { p.e.forEach(function (k) { hiE[k] = 1; }); }); });
  } else if (ST.kind === 'hyp') {
    var h = ST.h; nodeSet = {};
    EDGES.forEach(function (e, k) { if (e.h.indexOf(h.id) >= 0) { hiE[k] = 1; nodeSet[e.f] = 1; nodeSet[e.t] = 1; } });
    if (h.from) { var rr = pathsFrom(h.from); sel = h.from; Object.keys(h.exp).forEach(function (id) { netMap[id] = net(rr[id] || []); }); }
  } else if (ST.kind === 'paths') {
    nodeSet = {}; ST.list.forEach(function (p) { p.e.forEach(function (k) { hiE[k] = 1; nodeSet[EDGES[k].f] = 1; nodeSet[EDGES[k].t] = 1; }); });
    if (ST.a) { sel = base(ST.a); nodeSet[sel] = 1; }
    if (ST.b && ST.list.length) netMap[ST.b] = net(ST.list);
  } else if (ST.kind === 'edge') {
    var e = EDGES[ST.k]; hiE[ST.k] = 1; nodeSet = {}; nodeSet[e.f] = 1; nodeSet[e.t] = 1;
  }
  eds.forEach(function (el) { var k = +el.getAttribute('data-k'); el.classList.toggle('hi', !!hiE[k]); el.classList.toggle('lo', ST.kind !== null && !hiE[k]); });
  nds.forEach(function (el) {
    var id = el.getAttribute('data-id'), bd = el.querySelector('.bd'), v = netMap[id];
    el.classList.toggle('fade', !!nodeSet && !nodeSet[id]);
    el.classList.toggle('sel', id === sel);
    ['up', 'down', 'mix'].forEach(function (c) { el.classList.toggle(c, id !== sel && v !== undefined && CLS(v) === c); });
    if (v !== undefined && id !== sel) { bd.style.display = ''; bd.style.color = v === 1 ? 'var(--pos)' : v === -1 ? 'var(--neg)' : 'var(--mix)'; bd.querySelector('text').textContent = GLY(v); bd.querySelector('text').style.fill = bd.style.color; }
    else bd.style.display = 'none';
  });
  $$('#hyps button[data-h]').forEach(function (b) { b.setAttribute('aria-pressed', ST.kind === 'hyp' && ST.h.id === b.getAttribute('data-h')); });
  renderPanel();
}

/* ---------- panel ---------- */
function pathHTML(p, startId) {
  var s = sgn(startId), h = '<b>' + esc(LABV(startId)) + '</b>';
  p.e.forEach(function (k) { var e = EDGES[k]; s *= e.sv; h += ' → <span class="ar ' + CLS(s) + '">' + GLY(s) + '</span>' + esc(LAB(e.t)); });
  return h;
}
function sortPaths(list) { return list.slice().sort(function (a, b) { return a.e.length - b.e.length; }); }
function pathsBlock(list, startId, limit) {
  limit = limit || 12; var L = sortPaths(list), h = '<ul class="paths">';
  L.slice(0, limit).forEach(function (p) { h += '<li>' + pathHTML(p, startId) + '</li>'; });
  if (L.length > limit) h += '<li class="note">and ' + (L.length - limit) + ' longer chains</li>';
  return h + '</ul>';
}
function summary(list) {
  var u = 0, d = 0, z = 0; list.forEach(function (p) { if (p.s === 1) u++; else if (p.s === -1) d++; else z++; });
  var parts = []; if (u) parts.push(u + ' ↑'); if (d) parts.push(d + ' ↓'); if (z) parts.push(z + ' ±');
  return parts.join(', ');
}
function edgeWord(e) { return e.blocked ? 'removed by the design' : e.s === '+' ? 'increases' : e.s === '-' ? 'decreases' : 'changes the strength of'; }
function intro() {
  var loops = LOOPS.map(function (L, i) {
    var ids = L.e.map(function (k) { return EDGES[k].f; }); ids.push(ids[0]);
    return '<li><span class="g ' + CLS(L.s) + '">' + (L.s === 1 ? 'R' : L.s === -1 ? 'B' : '±') + '</span><span><button data-go="loop:' + i + '">' + esc(ids.map(LAB).join(' → ')) + '</button><small>' + (L.s === 1 ? 'Reinforcing: the change feeds itself.' : L.s === -1 ? 'Balancing: the change damps itself.' : 'Depends on aspect.') + '</small></span></li>';
  }).join('');
  return '<span class="tag">How to use the map</span><h3>Pick a box, a hypothesis or two boxes to trace</h3>' +
    '<p>Click a box to see everything it changes along all chains of arrows. Signs multiply along a chain: two “decreases” in a row make an increase. ' +
    'A blue ↑ means the box goes up when the selected one goes up, a red ↓ that it goes down, a purple ± that chains disagree. Counting chains is not weighing them: the panel shows how many chains point each way, not which one is stronger.</p>' +
    '<h4>Feedback loops (' + LOOPS.length + ')</h4><ul class="plist">' + loops + '</ul><p class="note">R = reinforcing, B = balancing. Loops act over seasons and years, not within our two weeks of logging.</p>';
}
function renderPanel() {
  var h = '';
  if (ST.kind === 'node') {
    var n = NODES[IDX[base(ST.id)]], causes = ST.mode === 'causes', fl = causes ? 1 : sgn(ST.id), nk = causes ? n.k : LABV(ST.id);
    h += '<span class="tag">' + esc(CATS[n.cat].n) + (n.design ? ' · design factor' : n.meas ? ' · measured or observed by us' : ' · not measured') + '</span><h3>' + esc(FLIP[ST.id] ? FLIP[ST.id].l : n.l) + '</h3><p>' + (FLIP[ST.id] ? 'The other end of the same design factor as the ' + esc(lc(n.k)) + ' box: every arrow points the other way.' : esc(n.d)) + '</p><p class="note">' + esc(n.m) + '</p>';
    h += '<div class="seg" role="group" aria-label="Direction"><button data-go="mode:effects" aria-pressed="' + !causes + '">What it changes</button><button data-go="mode:causes" aria-pressed="' + causes + '">What changes it</button></div>';
    var direct = causes ? IN[n.id] : OUT[n.id];
    h += '<h4>' + (causes ? 'Direct arrows into it' : 'Direct arrows out of it') + '</h4><ul class="plist">';
    if (!direct.length) h += '<li><span></span><span class="note">None</span></li>';
    direct.forEach(function (k) {
      var e = EDGES[k], other = causes ? e.f : e.t, v = e.blocked ? null : e.sv * fl, ew = e.blocked ? edgeWord(e) : word(v);
      h += '<li><span class="g ' + (v === null ? '' : CLS(v)) + '">' + (v === null ? '×' : GLY(v)) + '</span><span><button data-go="node:' + other + '">' + esc(LAB(other)) + '</button><small>' + esc((causes ? LAB(other) + ' ' + ew + ' ' + lc(n.k) : nk + ' ' + ew + ' ' + lc(LAB(other))) + '. ' + e.n) + '</small></span></li>';
    });
    h += '</ul>';
    var r0 = causes ? pathsTo(n.id) : pathsFrom(n.id), r = {}; Object.keys(r0).forEach(function (id) { r[id] = flipList(r0[id], fl); }); var ids = Object.keys(r).sort(function (a, b) { return IDX[a] - IDX[b]; });
    h += '<h4>' + (causes ? 'Everything upstream' : 'Along all chains') + ' (' + ids.length + ' boxes)</h4><ul class="plist">';
    [1, -1, 0].forEach(function (want) {
      ids.filter(function (id) { return net(r[id]) === want; }).forEach(function (id) {
        var a = causes ? id : ST.id, b = causes ? n.id : id;
        h += '<li><span class="g ' + CLS(want) + '">' + GLY(want) + '</span><span><button data-go="trace:' + a + ':' + b + '">' + esc(LAB(id)) + '</button><small>' + r[id].length + (r[id].length === 1 ? ' chain' : ' chains') + ': ' + summary(r[id]) + '</small></span></li>';
      });
    });
    h += '</ul><p class="note">' + (causes ? 'Arrows show what happens to this box when the listed box goes up. ' : 'Arrows show what happens when this box goes up. ') + 'Click a name to see its chains.</p>';
  } else if (ST.kind === 'hyp') {
    var hy = ST.h;
    h += '<span class="tag">Hypothesis ' + hy.id + '</span><h3>' + esc(hy.t) + '</h3>';
    if (hy.inter) {
      h += '<p>' + esc(hy.note) + '</p><p class="note">Highlighted: direct sun → light at the forest floor, and canopy closure → light at the forest floor. The simulator computes this interaction from the two together.</p>';
    } else {
      var rr = pathsFrom(hy.from);
      h += '<ul class="plist">';
      Object.keys(hy.exp).forEach(function (id) {
        var L = rr[id] || [], v = net(L), want = hy.exp[id], ok = v === want;
        h += '<li><span class="g ' + CLS(v) + '">' + GLY(v) + '</span><span><button data-go="trace:' + hy.from + ':' + id + '">' + esc(LAB(id)) + '</button><small>Predicted ' + GLY(want) + '. Chains: ' + (L.length ? summary(L) : 'none') + (ok ? ' — all agree.' : ' — chains disagree; see below.') + '</small></span></li>';
      });
      h += '</ul><p>' + esc(hy.note) + '</p>';
    }
  } else if (ST.kind === 'paths') {
    h += '<span class="tag">Chains from ' + esc(LABV(ST.a)) + ' to ' + esc(LAB(ST.b)) + '</span>';
    if (!ST.list.length) h += '<h3>No chain connects them</h3><p>' + esc(LABV(ST.a)) + ' has no effect on ' + esc(LAB(ST.b)) + ' in this map. Try the other direction.</p>';
    else {
      var v2 = net(ST.list);
      h += '<h3><span class="ar ' + CLS(v2) + '">' + GLY(v2) + '</span> ' + esc(LAB(ST.b)) + (v2 === 1 ? ' goes up' : v2 === -1 ? ' goes down' : ': chains disagree') + ' when ' + esc(lc(LABV(ST.a))) + ' goes up</h3><p class="note">' + ST.list.length + (ST.list.length === 1 ? ' chain' : ' chains') + ' (' + summary(ST.list) + '). The arrow before each box shows its direction at that point of the chain.</p>' + pathsBlock(ST.list, ST.a, 14);
    }
  } else if (ST.kind === 'edge') {
    var e = EDGES[ST.k];
    h += '<span class="tag">Arrow</span><h3>' + esc(LAB(e.f)) + ' ' + edgeWord(e) + ' ' + esc(lc(LAB(e.t))) + '</h3><p>' + esc(e.n) + '</p>' + (e.h.length ? '<p class="note">Part of ' + e.h.join(', ') + '.</p>' : '') +
      '<div class="btns"><button class="btn" data-go="node:' + e.f + '">Open ' + esc(LAB(e.f)) + '</button><button class="btn" data-go="node:' + e.t + '">Open ' + esc(LAB(e.t)) + '</button></div>';
  } else if (ST.kind === 'loop') {
    h = intro();
  } else h = intro();
  panel.innerHTML = h;
}

/* ---------- controls ---------- */
function selectNode(id) { ST = { kind: 'node', id: id, mode: FLIP[id] ? 'effects' : ST.kind === 'node' ? ST.mode : 'effects' }; syncPick(id); apply(); }
function trace(a, b) { var L = flipList(pathsFrom(base(a))[b] || [], sgn(a)); ST = { kind: 'paths', a: a, b: b, list: L }; $('#tf').value = a; $('#tt').value = b; apply(); }
function syncPick(id) { $('#pick').value = id || ''; }
function clearAll() { ST = { kind: null }; syncPick(''); apply(); }
var optList = function (key) { return NODES.map(function (n) { var o = '<option value="' + n.id + '">' + esc(n[key]) + '</option>'; Object.keys(FLIP).forEach(function (v) { if (FLIP[v].id === n.id) o += '<option value="' + v + '">' + esc(FLIP[v][key]) + '</option>'; }); return o; }).join(''); };
var opts = optList('l'), optsShort = optList('k');
var optsTo = NODES.map(function (n) { return '<option value="' + n.id + '">' + esc(n.k) + '</option>'; }).join('');
$('#pick').innerHTML = '<option value="">Pick a box…</option>' + opts;
$('#tf').innerHTML = optsShort; $('#tt').innerHTML = optsTo; $('#tf').value = 'for'; $('#tt').value = 'ohz';
$('#hyps').innerHTML = HYP.map(function (h) { return '<button data-h="' + h.id + '" aria-pressed="false">' + h.id + '</button>'; }).join('') + '<button id="clr">Clear</button>';
$('#hyps').addEventListener('click', function (ev) {
  var b = ev.target.closest('button'); if (!b) return;
  if (b.id === 'clr') { clearAll(); return; }
  var h = HYP.filter(function (x) { return x.id === b.getAttribute('data-h'); })[0];
  if (ST.kind === 'hyp' && ST.h === h) clearAll(); else { ST = { kind: 'hyp', h: h }; syncPick(''); apply(); }
});
$('#pick').addEventListener('change', function () { if (this.value) selectNode(this.value); else clearAll(); });
$('#go').addEventListener('click', function () { trace($('#tf').value, $('#tt').value); });
svg.addEventListener('click', function (ev) {
  var nd = ev.target.closest('.nd'); if (nd) { var id = nd.getAttribute('data-id'); if (ST.kind === 'node' && ST.id === id) clearAll(); else selectNode(id); return; }
  var hit = ev.target.closest('.hit'); if (hit) { ST = { kind: 'edge', k: +hit.getAttribute('data-k') }; syncPick(''); apply(); return; }
  clearAll();
});
svg.addEventListener('keydown', function (ev) {
  if (ev.key !== 'Enter' && ev.key !== ' ') return; var nd = ev.target.closest('.nd'); if (!nd) return; ev.preventDefault(); selectNode(nd.getAttribute('data-id'));
});
svg.addEventListener('mouseover', function (ev) {
  if (ST.kind !== null) return; var nd = ev.target.closest('.nd'); if (!nd) return; var id = nd.getAttribute('data-id');
  $$('#ring .ed').forEach(function (el) { var e = EDGES[+el.getAttribute('data-k')]; var on = e.f === id || e.t === id; el.classList.toggle('hi', on); el.classList.toggle('lo', !on); });
});
svg.addEventListener('mouseout', function (ev) {
  if (ST.kind !== null) return; if (ev.relatedTarget && ev.relatedTarget.closest && ev.relatedTarget.closest('.nd')) return;
  $$('#ring .ed').forEach(function (el) { el.classList.remove('hi', 'lo'); });
});
panel.addEventListener('click', function (ev) {
  var b = ev.target.closest('[data-go]'); if (!b) return; var a = b.getAttribute('data-go').split(':');
  if (a[0] === 'node') selectNode(a[1]);
  else if (a[0] === 'mode') { ST.mode = a[1]; apply(); }
  else if (a[0] === 'trace') trace(a[1], a[2]);
  else if (a[0] === 'loop') { var L = LOOPS[+a[1]]; ST = { kind: 'paths', a: EDGES[L.e[0]].f, b: EDGES[L.e[0]].f, list: [{ s: L.s, e: L.e }], loop: true }; apply(); panel.innerHTML = '<span class="tag">' + (L.s === 1 ? 'Reinforcing loop' : L.s === -1 ? 'Balancing loop' : 'Loop') + '</span><h3>A change that comes back to itself</h3>' + pathsBlock([{ s: L.s, e: L.e }], EDGES[L.e[0]].f) + '<p class="note">' + (L.s === 1 ? 'Each pass amplifies the first change.' : L.s === -1 ? 'Each pass works against the first change, which keeps the system near a balance.' : 'The sign depends on aspect.') + '</p><div class="btns"><button class="btn" data-go="back:1">Back to all loops</button></div>'; }
  else if (a[0] === 'back') clearAll();
});
var rt = null;
new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(draw, 60); }).observe(box);
draw();
/* on narrow screens start with the middle of the ring in view */
var rw = document.querySelector('.ringwrap');
if (rw && rw.scrollWidth > rw.clientWidth) rw.scrollLeft = (rw.scrollWidth - rw.clientWidth) / 2;
})();
