/* Group 4 predictions page: design factors → processes → measured variables → instruments,
   and, for every variable we measure, what H1 and H2 predict at each of the four plots.
   EDIT HERE: VARS (the predictions), NODES and EDGES (the chart). Measured values go in data/results.js. */
window.G4_PRED = true;
(function () {
'use strict';
var $ = function (q) { return document.querySelector(q); };
var $$ = function (q) { return Array.prototype.slice.call(document.querySelectorAll(q)); };
var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
var PLOTS = ['N-C', 'N-D', 'S-C', 'S-D'];

/* Predicted direction of each effect, defined as in the analysis plan on the Methods page:
     asp = south − north,  for = coniferous − deciduous,  int = (S-D − N-D) − (S-C − N-C)
   '+' higher, '-' lower, '0' no difference expected, 'n' not predicted, '?' chains disagree.
   pat = the predicted pattern on a relative 0–1 scale, used only for the sketch; it is checked against exp on load. */
var VARS = [
  { id: 'open', node: 'can', name: 'Canopy openness', stat: 'mean of the 2 GLAMA photos', inst: 'GLAMA smartphone photo at each Pendant', hyp: 'Design check',
    exp: { asp: '0', for: '-', int: 'n' }, pat: { 'N-C': .2, 'N-D': .8, 'S-C': .2, 'S-D': .8 },
    why: 'This checks the design rather than a hypothesis: evergreen conifers should keep a closed canopy in winter, and the leafless deciduous stands should be open on both slopes. If this contrast is weak, H2 and the interaction in H1 have little to work with.' },
  { id: 'lgt', node: 'lgt', name: 'Light at the forest floor', stat: 'daytime mean', inst: 'HOBO Pendant at 2 m, 2 per plot', hyp: 'H1, H2',
    exp: { asp: '+', for: '-', int: '+' }, pat: { 'N-C': .1, 'N-D': .25, 'S-C': .35, 'S-D': .9 },
    why: 'Direct sun reaches the slope (H1) and then has to pass the canopy (H2). Where more sun arrives, the same canopy removes more of it, so the gap between the coniferous and the deciduous plot should be largest on the south slope. That is the interaction in H1.' },
  { id: 'tair', node: 'tmp', name: 'Air temperature range at 1 m', stat: 'mean daily maximum − minimum', inst: 'HOBO Pro v2 at 1 m, 3 per plot', hyp: 'H1, H2',
    exp: { asp: '+', for: '-', int: '+' }, pat: { 'N-C': .2, 'N-D': .35, 'S-C': .4, 'S-D': .85 },
    why: 'Sunlit ground heats the air by day, and an open canopy lets heat escape to the night sky. Both widen the daily range, so it should be largest where sun and an open canopy meet, in S-D. H1 also predicts a higher daily maximum on the south slope.' },
  { id: 'tsur', node: 'tmp', name: 'Surface temperature range (+2 cm)', stat: 'mean daily maximum − minimum', inst: 'TOMST TMS-4, 3 per plot', hyp: 'H1, H2',
    exp: { asp: '+', for: '-', int: '+' }, pat: { 'N-C': .15, 'N-D': .3, 'S-C': .4, 'S-D': .9 },
    why: 'The ground surface is where the radiation is absorbed, so the aspect and canopy contrasts should be largest here.' },
  { id: 'tsoil', node: 'tsl', name: 'Topsoil temperature range (−6 cm)', stat: 'mean daily maximum − minimum', inst: 'TOMST TMS-4, 3 per plot', hyp: 'H1, H2',
    exp: { asp: '+', for: '-', int: '+' }, pat: { 'N-C': .15, 'N-D': .25, 'S-C': .3, 'S-D': .6 },
    why: 'Temperature swings at the surface travel down into the topsoil, damped by the O-horizon. The pattern should be the same as at the surface, but smaller.' },
  { id: 'rh', node: 'rhu', name: 'Relative humidity at 1 m', stat: 'daily mean', inst: 'HOBO Pro v2 at 1 m, 3 per plot', hyp: 'H1',
    exp: { asp: '-', for: 'n', int: '-' }, pat: { 'N-C': .8, 'N-D': .78, 'S-C': .6, 'S-D': .35 },
    why: 'Warmer air can hold more water vapour, so relative humidity falls where it is warmest. H2 makes no prediction for humidity, but the light chain puts the lowest values in S-D, so the coniferous–deciduous gap should again be largest on the south slope.' },
  { id: 'smo', node: 'smo', name: 'Soil moisture (0–15 cm)', stat: 'daily mean', inst: 'TOMST TMS-4 moisture probe, 3 per plot', hyp: 'H1, H2',
    exp: { asp: '-', for: '-', int: '?' }, pat: { 'N-C': .55, 'N-D': .8, 'S-C': .35, 'S-D': .6 },
    why: 'Sun and evaporation dry the south slope (H1). Under conifers, rain interception and winter transpiration dry the soil (H2), but their shade also reduces evaporation. On the south slope these chains pull in opposite directions, so no interaction is predicted. Texture shifts soil moisture too, which is one reason for the auger cores.' },
  { id: 'ohz', node: 'ohz', name: 'O-horizon thickness', stat: 'mean of the 4 points (L + Of + Oh)', inst: 'Folding ruler at the 4 sampling points and in the profile', hyp: 'H1, H2',
    exp: { asp: '-', for: '+', int: 'n' }, pat: { 'N-C': .9, 'N-D': .5, 'S-C': .6, 'S-D': .2 }, rank: true,
    why: 'Litter decomposes more slowly where it is cool (the north slope, H1) and where it is needle litter (H2), so N-C should have the thickest O-horizon and S-D the thinnest. The O-horizon records years of litter input and decomposition, not the two logging weeks.' },
  { id: 'ph1', node: 'ph', name: 'Topsoil pH, upper depth (0–5 cm)', stat: 'mean of 4 replicates', inst: 'pH meter in 0.01 M CaCl₂, samples from the auger cores', hyp: 'H2',
    exp: { asp: 'n', for: '-', int: 'n' }, pat: { 'N-C': .3, 'N-D': .7, 'S-C': .3, 'S-D': .7 },
    why: 'Decomposing needles release organic acids, and conifers receive more nitrogen and sulphur with throughfall, so the topsoil under conifers should be more acidic (H2). Neither hypothesis predicts an aspect effect on pH.' },
  { id: 'ph2', node: 'ph', name: 'Topsoil pH, lower depth (5–15 cm)', stat: 'mean of 4 replicates', inst: 'pH meter in 0.01 M CaCl₂, samples from the auger cores', hyp: 'H2',
    exp: { asp: 'n', for: '-', int: 'n' }, pat: { 'N-C': .5, 'N-D': .62, 'S-C': .5, 'S-D': .62 },
    why: 'Same direction as the upper depth but weaker, because carbonates from the limestone and the calcareous fill can buffer the acids below the top few centimetres. H2 says the difference is largest in the upper mineral soil.' }
];

/* Chart. Columns: 0 design factors, 1 processes, 2 measured variables, 3 instruments.
   k: 'dz' design factor, 'm' measured, 'u' not measured (calculated or assumed), 'h' held constant, 'i' instrument. */
var COLS = [{ x: 10, w: 150, t: 'Design and weather' }, { x: 250, w: 190, t: 'Processes' }, { x: 540, w: 200, t: 'Measured at each plot' }, { x: 830, w: 160, t: 'Instruments' }];
var NODES = [
  { id: 'cld', c: 0, y: 90, k: 'm', t: 'Cloud cover', s: 'weather reference',
    d: 'Weather during the logging period, from the garden’s bioclimatology station or an open-field logger. It sorts the days into clear and overcast; H1 is tested on the clear days.' },
  { id: 'asp', c: 0, y: 190, k: 'dz', t: 'Aspect', s: 'more south-facing',
    d: 'Design factor 1: north- versus south-facing slope. Read its arrows as “more south-facing gives more (+) or less (−) of …”.' },
  { id: 'for', c: 0, y: 360, k: 'dz', t: 'Forest type', s: 'more coniferous',
    d: 'Design factor 2: coniferous versus deciduous stand. Read its arrows as “more coniferous gives more (+) or less (−) of …”.' },
  { id: 'elv', c: 0, y: 520, k: 'h', t: 'Elevation', s: 'held constant',
    d: 'All four plots lie on one contour line (about 259 m on the DGM), so differences in elevation cannot explain differences between the plots. It has no arrows here because the design removes them.' },
  { id: 'rad', c: 1, y: 150, k: 'u', t: 'Direct sun on the slope', s: 'calculated in the simulator',
    d: 'Direct beam on the slope above the canopy, not measured. Calculated in the simulator for the plot positions of 21 Nov, for a clear sky and the terrain only, as a mean over 27 Nov – 9 Dec: N-C 0.0×, N-D 0.1×, S-C 1.9× and S-D 1.5× the direct sun on open flat ground. S-D gets less than S-C because its slope is gentler (6° against 13°).' },
  { id: 'can', c: 1, y: 260, k: 'm', t: 'Canopy closure', s: 'in winter · GLAMA photo', v: ['open'],
    d: 'How much of the sky the crowns cover in November and December, measured as canopy openness with GLAMA photos. It checks that the forest-type contrast is really there.' },
  { id: 'wat', c: 1, y: 390, k: 'u', t: 'Rain interception', s: 'and winter transpiration',
    d: 'Rain caught by evergreen crowns evaporates before it reaches the ground, and conifers keep drawing water from the soil on mild winter days. Not measured; assumed from the literature.' },
  { id: 'lit', c: 1, y: 503, k: 'u', t: 'Needle litter', s: 'poor in bases, acidic',
    d: 'Needles are poorer in nutrients and base cations than broadleaf litter, decompose slowly and release organic acids. Not measured; set by the tree species.' },
  { id: 'lgt', c: 2, y: 90, k: 'm', t: 'Light at the floor', s: 'lux', v: ['lgt'],
    d: 'Radiation that actually reaches the understorey. The interaction in H1 sits here: the direct sun that arrives, times the share the canopy lets through.' },
  { id: 'tmp', c: 2, y: 165, k: 'm', t: 'Temperature max & range', s: 'air 1 m, +15 cm, surface', v: ['tair', 'tsur'],
    d: 'Daytime peak and day-night swing of the surface and of the air near the ground.' },
  { id: 'tsl', c: 2, y: 240, k: 'm', t: 'Topsoil temperature', s: 'daily range at −6 cm', v: ['tsoil'],
    d: 'Day-night swing of temperature in the mineral topsoil.' },
  { id: 'rhu', c: 2, y: 315, k: 'm', t: 'Relative humidity', s: 'air at 1 m', v: ['rh'],
    d: 'Moisture of the air relative to saturation; low values mean strong drying of litter and soil.' },
  { id: 'smo', c: 2, y: 390, k: 'm', t: 'Soil moisture', s: '0–15 cm', v: ['smo'],
    d: 'Water content of the topsoil. Two of its incoming arrows come from forest type with opposite signs, so the forest-type effect depends on which chain is stronger.' },
  { id: 'ohz', c: 2, y: 465, k: 'm', t: 'O-horizon thickness', s: 'L, Of, Oh', v: ['ohz'],
    d: 'The organic layer on top of the mineral soil: years of litter input minus decomposition.' },
  { id: 'ph', c: 2, y: 540, k: 'm', t: 'Topsoil pH', s: 'CaCl₂, 2 depths', v: ['ph1', 'ph2'],
    d: 'Acidity of the uppermost mineral soil, the main chemical response we measure.' },
  { id: 'pen', c: 3, y: 90, k: 'i', t: 'HOBO Pendant', s: '2 m · 2 per plot',
    d: 'Light (lux) and air temperature at 2 m, mounted level on a pole at least 1 m from stems. A GLAMA photo is taken at each Pendant.' },
  { id: 'pro', c: 3, y: 230, k: 'i', t: 'HOBO Pro v2', s: '1 m · 3 per plot',
    d: 'Air temperature and relative humidity at 1 m, in a radiation shield.' },
  { id: 'tms', c: 3, y: 330, k: 'i', t: 'TOMST TMS-4', s: '3 per plot',
    d: 'Air at +15 cm, surface at +2 cm and soil at −6 cm temperature, and soil moisture at 0–15 cm.' },
  { id: 'soil', c: 3, y: 503, k: 'i', t: 'Ruler, auger, pH', s: '4 points + profile',
    d: 'O-horizon measured with a folding ruler before augering; pH samples from the auger cores at two depths, measured in 0.01 M CaCl₂.' }
];
/* s: '+' / '-' effect, 'm' measured by. h: hypotheses the arrow belongs to. */
var EDGES = [
  { f: 'cld', t: 'rad', s: '-', h: ['H1'], n: 'Clouds block the direct beam, so the aspect effect should show mainly on clear days.' },
  { f: 'asp', t: 'rad', s: '+', h: ['H1'], n: 'South slopes face the low December sun; the north plots get almost no direct beam.' },
  { f: 'for', t: 'can', s: '+', h: ['H1', 'H2'], n: 'Evergreen conifers keep their crowns in winter; deciduous trees are leafless.' },
  { f: 'for', t: 'wat', s: '+', h: ['H2'], n: 'Dense evergreen crowns catch more rain and keep transpiring on mild days.' },
  { f: 'for', t: 'lit', s: '+', h: ['H2'], n: 'More conifers, more needle litter.' },
  { f: 'rad', t: 'lgt', s: '+', h: ['H1'], n: 'More direct sun above the canopy means more light below it.' },
  { f: 'can', t: 'lgt', s: '-', h: ['H1', 'H2'], n: 'A closed canopy intercepts light, the low winter beam most of all. Where more sun arrives, it removes more: the interaction in H1.' },
  { f: 'rad', t: 'tmp', s: '+', h: ['H1'], n: 'Sunlit ground heats the surface and the air above it by day.' },
  { f: 'can', t: 'tmp', s: '-', h: ['H1', 'H2'], n: 'Crowns shade the floor by day and shield it from the cold night sky, which narrows the daily range.' },
  { f: 'rad', t: 'tsl', s: '+', h: ['H1'], n: 'Surface temperature swings travel down into the topsoil.' },
  { f: 'can', t: 'tsl', s: '-', h: ['H2'], n: 'A smaller swing at the surface means a smaller swing below.' },
  { f: 'rad', t: 'rhu', s: '-', h: ['H1'], n: 'Warmer air holds more water vapour, so relative humidity drops.' },
  { f: 'rad', t: 'smo', s: '-', h: ['H1'], n: 'Sun supplies the energy for evaporation from litter and soil.' },
  { f: 'can', t: 'smo', s: '+', h: ['H2'], n: 'Shade reduces evaporation, which keeps the soil moister: against the interception chain.' },
  { f: 'wat', t: 'smo', s: '-', h: ['H2'], n: 'Intercepted rain never reaches the soil, and transpiration draws water out of it.' },
  { f: 'rad', t: 'ohz', s: '-', h: ['H1'], n: 'A warmer litter layer decomposes faster and leaves less on top. H1 assumes warmth outweighs drying.' },
  { f: 'lit', t: 'ohz', s: '+', h: ['H2'], n: 'Needle litter decomposes slowly and earthworms avoid it, so it builds up.' },
  { f: 'lit', t: 'ph', s: '-', h: ['H2'], n: 'Decomposing needles release organic acids, and conifers receive more N and S deposition.' },
  { f: 'lgt', t: 'pen', s: 'm' }, { f: 'tmp', t: 'pro', s: 'm' }, { f: 'rhu', t: 'pro', s: 'm' }, { f: 'tmp', t: 'tms', s: 'm' },
  { f: 'tsl', t: 'tms', s: 'm' }, { f: 'smo', t: 'tms', s: 'm' }, { f: 'ohz', t: 'soil', s: 'm' }, { f: 'ph', t: 'soil', s: 'm' }
];
var HYPS = {
  H1: ['H1 · aspect', 'Direct sun drives the microclimate chains. The canopy decides how much of it reaches the floor, which is where the interaction sits. Through decomposition, a warmer south slope should also have a thinner O-horizon.'],
  H2: ['H2 · forest type', 'The canopy, water loss through the crowns and needle litter drive light, temperature range, soil moisture, the O-horizon and pH.']
};

/* ------------------------------------------------------------------ */
var NH = 50, BY = {};
NODES.forEach(function (n) { n.x = COLS[n.c].x; n.w = COLS[n.c].w; BY[n.id] = n; });
EDGES = EDGES.filter(function (e) { return BY[e.f] && BY[e.t]; });
var VBY = {}; VARS.forEach(function (v) { VBY[v.id] = v; });
var R = window.G4_RESULTS || {};
var ST = { node: null, hyp: null, v: 'lgt' };

/* the sketch must show what exp says */
var eff = function (p) {
  return { asp: (p['S-C'] + p['S-D'] - p['N-C'] - p['N-D']) / 2, for: (p['N-C'] + p['S-C'] - p['N-D'] - p['S-D']) / 2,
    int: (p['S-D'] - p['N-D']) - (p['S-C'] - p['N-C']) };
};
VARS.forEach(function (v) {
  var e = eff(v.pat);
  ['asp', 'for', 'int'].forEach(function (k) {
    var x = v.exp[k], ok = x === '+' ? e[k] > 0.01 : x === '-' ? e[k] < -0.01 : x === '0' ? Math.abs(e[k]) < 0.01 : true;
    if (!ok && window.console) console.warn('Predicted pattern of ' + v.id + ' does not match its ' + k + ' prediction');
  });
});

/* ---------- chart ---------- */
function bez(e) {
  var a = BY[e.f], b = BY[e.t], x0 = a.x + a.w, y0 = a.y, x1 = b.x - 4, y1 = b.y, dx = (x1 - x0) * 0.5;
  return [x0, y0, x0 + dx, y0, x1 - dx, y1, x1, y1];
}
function at(p, t) {
  var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p[0] + b * p[2] + c * p[4] + d * p[6], a * p[1] + b * p[3] + c * p[5] + d * p[7]];
}
function drawFlow() {
  var svg = $('#flow'), s = '', placed = [];
  var mk = function (id, col) { return '<marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + col + '"/></marker>'; };
  s += '<defs>' + mk('fp', 'var(--pos)') + mk('fm', 'var(--neg)') + mk('fq', 'var(--mut)') + '</defs>';
  COLS.forEach(function (c) { s += '<text class="fh" x="' + (c.x + c.w / 2) + '" y="34" text-anchor="middle">' + esc(c.t) + '</text>'; });
  var badges = '';
  EDGES.forEach(function (e, k) {
    var p = bez(e), cls = e.s === '+' ? 'p' : e.s === '-' ? 'm' : 'q', m = e.s === '+' ? 'fp' : e.s === '-' ? 'fm' : 'fq';
    s += '<path class="fe ' + cls + '" data-k="' + k + '" d="M' + p[0] + ' ' + p[1] + 'C' + p.slice(2).join(' ') + '" marker-end="url(#' + m + ')"><title>' +
      esc(BY[e.f].t + ' → ' + BY[e.t].t + (e.n ? ': ' + e.n : '')) + '</title></path>';
    if (e.s === 'm') return;
    /* sign badge: near the target, moved along the arrow until it overlaps no other badge */
    var ts = [0.72, 0.62, 0.8, 0.54, 0.86, 0.46], pt = null;
    for (var i = 0; i < ts.length; i++) {
      var q = at(p, ts[i]);
      if (placed.every(function (o) { return Math.hypot(o[0] - q[0], o[1] - q[1]) > 21; })) { pt = q; break; }
    }
    pt = pt || at(p, 0.72); placed.push(pt);
    badges += '<g class="fb ' + cls + '" data-k="' + k + '" transform="translate(' + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1) + ')"><circle r="9.5"/><text y="4.5">' + (e.s === '+' ? '+' : '−') + '</text></g>';
  });
  s += badges;
  NODES.forEach(function (n) {
    s += '<g class="fn ' + n.k + '" data-n="' + n.id + '" tabindex="0" role="button" aria-label="' + esc(n.t + ', ' + n.s) + '">' +
      '<rect x="' + n.x + '" y="' + (n.y - NH / 2) + '" width="' + n.w + '" height="' + NH + '" rx="8"/>' +
      '<text class="ft" x="' + (n.x + 12) + '" y="' + (n.y - 3) + '">' + esc(n.t) + '</text>' +
      '<text class="fs" x="' + (n.x + 12) + '" y="' + (n.y + 14) + '">' + esc(n.s) + '</text></g>';
  });
  svg.innerHTML = s;
  $$('#flow .fn').forEach(function (g) {
    var go = function () { pick(g.getAttribute('data-n')); };
    g.addEventListener('click', go);
    g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
  });
}
/* all arrows upstream and downstream of a box */
function reach(id) {
  var es = {}, ns = {}; ns[id] = 1;
  (function up(v) { EDGES.forEach(function (e, k) { if (e.t === v && !es[k]) { es[k] = 1; ns[e.f] = 1; up(e.f); } }); })(id);
  (function dn(v) { EDGES.forEach(function (e, k) { if (e.f === v && !es[k]) { es[k] = 1; ns[e.t] = 1; dn(e.t); } }); })(id);
  return { es: es, ns: ns };
}
function hypReach(h) {
  var es = {}, ns = {};
  EDGES.forEach(function (e, k) { if (e.h && e.h.indexOf(h) >= 0) { es[k] = 1; ns[e.f] = 1; ns[e.t] = 1; } });
  EDGES.forEach(function (e, k) { if (e.s === 'm' && ns[e.f]) { es[k] = 1; ns[e.t] = 1; } });
  return { es: es, ns: ns };
}
function paintFlow() {
  var r = ST.node ? reach(ST.node) : ST.hyp ? hypReach(ST.hyp) : null;
  $$('#flow .fe').forEach(function (p) { var k = p.getAttribute('data-k'); p.classList.toggle('hi', !!(r && r.es[k])); p.classList.toggle('lo', !!(r && !r.es[k])); });
  $$('#flow .fb').forEach(function (b) { b.classList.toggle('lo', !!(r && !r.es[b.getAttribute('data-k')])); });
  $$('#flow .fn').forEach(function (g) { var id = g.getAttribute('data-n'); g.classList.toggle('sel', id === ST.node); g.classList.toggle('fade', !!(r && !r.ns[id])); });
  $$('#hyps button').forEach(function (b) { b.setAttribute('aria-pressed', String((b.dataset.h || null) === ST.hyp && !ST.node)); });
  var box = $('#fdetail');
  if (ST.node) {
    var n = BY[ST.node], kind = { dz: 'design factor', m: 'measured or observed', u: 'not measured', h: 'held constant by the design', i: 'instrument' }[n.k];
    var li = function (e, dir) {
      var o = BY[dir === 'in' ? e.f : e.t];
      return '<li><span class="g ' + (e.s === '+' ? 'up' : 'down') + '">' + (e.s === '+' ? '+' : '−') + '</span><span>' + (dir === 'in' ? 'from ' : 'to ') +
        '<b>' + esc(o.t) + '</b><small>' + esc(e.n) + '</small></span></li>';
    };
    var ins = EDGES.filter(function (e) { return e.t === n.id && e.s !== 'm'; }), outs = EDGES.filter(function (e) { return e.f === n.id && e.s !== 'm'; });
    var h = '<span class="tag">' + esc(kind) + '</span><h3>' + esc(n.t) + '</h3><p>' + esc(n.d) + '</p>';
    if (ins.length) h += '<h4>Arrows into it</h4><ul class="plist">' + ins.map(function (e) { return li(e, 'in'); }).join('') + '</ul>';
    if (outs.length) h += '<h4>Arrows out of it</h4><ul class="plist">' + outs.map(function (e) { return li(e, 'out'); }).join('') + '</ul>';
    var meas = EDGES.filter(function (e) { return e.f === n.id && e.s === 'm'; }).map(function (e) { return BY[e.t].t; });
    if (meas.length) h += '<p class="note">Measured with: ' + esc(meas.join(', ')) + '.</p>';
    if (n.v) h += '<p class="note"><a href="#plots">Prediction for each plot below</a>.</p>';
    box.innerHTML = h;
  } else {
    box.innerHTML = ST.hyp ? '<h3>' + esc(HYPS[ST.hyp][0]) + '</h3><p>' + esc(HYPS[ST.hyp][1]) + '</p><p class="note">Full wording on the <a href="index.html#hypotheses">Overview</a>.</p>' :
      '<h3>How to read it</h3><p>Every arrow means “more of the source gives more (+) or less (−) of the target”. Aspect is read as “more south-facing”, forest type as “more coniferous”. Solid boxes are measured, dashed boxes are calculated or assumed. Click a box to follow its arrows.</p>';
  }
}
function pick(id) {
  ST.node = ST.node === id ? null : id; ST.hyp = null;
  var n = BY[id];
  if (ST.node && n.v) setVar(n.v[0]);
  paintFlow();
}

/* ---------- plot by plot ---------- */
var LBL = {
  asp: { name: 'Aspect', def: 'south − north', '+': 'higher on the south slope', '-': 'lower on the south slope' },
  for: { name: 'Forest type', def: 'coniferous − deciduous', '+': 'higher under conifers', '-': 'lower under conifers' },
  int: { name: 'Interaction', def: '(S-D − N-D) − (S-C − N-C)', '+': 'positive: the deciduous plot gains more from north to south', '-': 'negative: the deciduous plot drops more from north to south' }
};
var OTHER = { '0': 'no difference expected', n: 'not predicted', '?': 'chains disagree' };
var GLY = { '+': ['↑', 'up'], '-': ['↓', 'down'], '0': ['=', 'zero'], n: ['–', 'none'], '?': ['±', 'mix'] };
var val = function (x) { return x == null ? null : Array.isArray(x) ? (x[0] == null ? null : +x[0]) : +x; };
var spr = function (x) { return Array.isArray(x) && x[1] != null ? +x[1] : null; };
var dec = function (v) { var a = Math.abs(v); return a >= 100 ? 0 : a >= 10 ? 1 : 2; };
var fmt = function (v, ref) { return v.toFixed(dec(ref == null ? v : ref)); };
function measured(v) {
  var r = R[v.id] || {}, m = {}, all = true;
  PLOTS.forEach(function (p) { m[p] = val(r[p]); if (m[p] == null || isNaN(m[p])) all = false; });
  return { m: m, all: all, any: PLOTS.some(function (p) { return m[p] != null && !isNaN(m[p]); }), unit: r.unit || '' };
}
function verdict(x, e) {
  if (x !== '+' && x !== '-') return '';
  if (Math.abs(e) < 1e-9) return '<span class="vd no">no difference</span>';
  return (x === '+') === (e > 0) ? '<span class="vd ok">✓ as predicted</span>' : '<span class="vd warn">✗ opposite</span>';
}
function ichart(v, mode) {
  var W = 320, H = 200, L = 46, Rr = 86, T = 16, B = 30, xN = L + 18, xS = W - Rr - 8, M = measured(v);
  var get = function (p) { return mode === 'exp' ? v.pat[p] : M.m[p]; };
  var lo, hi;
  if (mode === 'exp') { lo = 0; hi = 1; } else {
    var ys = []; PLOTS.forEach(function (p) { var s = spr(R[v.id][p]) || 0; ys.push(M.m[p] - s, M.m[p] + s); });
    lo = Math.min.apply(null, ys); hi = Math.max.apply(null, ys); var pad = (hi - lo) * 0.12 || Math.abs(hi) * 0.1 || 1, pos = lo >= 0; lo -= pad; hi += pad; if (pos && lo < 0) lo = 0;
  }
  var y = function (q) { return T + (H - T - B) * (1 - (q - lo) / (hi - lo)); };
  var s = '<line class="ax" x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (H - B) + '"/><line class="ax" x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - Rr) + '" y2="' + (H - B) + '"/>';
  s += '<text x="' + xN + '" y="' + (H - 10) + '" text-anchor="middle">North</text><text x="' + xS + '" y="' + (H - 10) + '" text-anchor="middle">South</text>';
  if (mode === 'exp') s += '<text x="' + (L - 6) + '" y="' + (T + 10) + '" text-anchor="end">higher</text><text x="' + (L - 6) + '" y="' + (H - B) + '" text-anchor="end">lower</text>';
  else s += '<text x="' + (L - 6) + '" y="' + (T + 10) + '" text-anchor="end">' + fmt(hi) + '</text><text x="' + (L - 6) + '" y="' + (H - B) + '" text-anchor="end">' + fmt(lo) + '</text>' +
    (M.unit ? '<text x="' + (L - 6) + '" y="' + ((T + H - B) / 2 + 4) + '" text-anchor="end">' + esc(M.unit) + '</text>' : '');
  var labs = [];
  [['C', 'N-C', 'S-C', 'Coniferous'], ['D', 'N-D', 'S-D', 'Deciduous']].forEach(function (L2) {
    var a = y(get(L2[1])), b = y(get(L2[2])), cls = L2[0].toLowerCase();
    s += '<line class="ln ' + cls + (mode === 'exp' ? ' ex' : '') + '" x1="' + xN + '" y1="' + a.toFixed(1) + '" x2="' + xS + '" y2="' + b.toFixed(1) + '"/>';
    [[xN, L2[1], a], [xS, L2[2], b]].forEach(function (q) {
      var sp = mode === 'exp' ? 0 : spr(R[v.id][q[1]]);
      if (sp) s += '<line class="eb ' + cls + '" x1="' + q[0] + '" y1="' + y(get(q[1]) - sp).toFixed(1) + '" x2="' + q[0] + '" y2="' + y(get(q[1]) + sp).toFixed(1) + '"/>';
      s += '<circle class="pt ' + cls + '" cx="' + q[0] + '" cy="' + q[2].toFixed(1) + '" r="5"><title>' + q[1] + (mode === 'exp' ? '' : ': ' + fmt(get(q[1])) + ' ' + M.unit) + '</title></circle>';
    });
    labs.push([b, L2[3], cls]);
  });
  if (Math.abs(labs[0][0] - labs[1][0]) < 15) { var mid = (labs[0][0] + labs[1][0]) / 2, up = labs[0][0] <= labs[1][0] ? 0 : 1; labs[up][0] = mid - 8; labs[1 - up][0] = mid + 8; }
  labs.forEach(function (l) { s += '<text class="ll ' + l[2] + '" x="' + (xS + 12) + '" y="' + (l[0] + 4).toFixed(1) + '">' + l[1] + '</text>'; });
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (mode === 'exp' ? 'Predicted' : 'Measured') + ' pattern of ' + esc(v.name) + ' on the north and south slope, coniferous and deciduous">' + s + '</svg>';
}
function renderVar() {
  var v = VBY[ST.v], M = measured(v), mx = Math.max.apply(null, PLOTS.map(function (p) { return v.pat[p]; })), mn = Math.min.apply(null, PLOTS.map(function (p) { return v.pat[p]; }));
  var only = function (x) { return PLOTS.filter(function (p) { return v.pat[p] === x; }).length === 1; };
  $$('#vtabs button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === ST.v)); });
  var cell = function (p) {
    var w = v.pat[p] === mx && only(mx) ? 'highest' : v.pat[p] === mn && only(mn) ? 'lowest' : '', m = M.m[p], sp = spr((R[v.id] || {})[p]);
    return '<div class="cell ' + (p.charAt(0) === 'N' ? 'aN' : 'aS') + '"><b>' + p + '</b>' + (w ? '<small class="xw">predicted ' + w + '</small>' : '<small class="xw">&nbsp;</small>') +
      '<div class="xb" title="predicted, relative"><i style="width:' + Math.round(v.pat[p] * 100) + '%"></i></div>' +
      '<span class="mv">' + (m == null || isNaN(m) ? '<small>not measured yet</small>' : fmt(m) + (sp ? ' ± ' + fmt(sp, m) : '') + (M.unit ? ' ' + esc(M.unit) : '')) + '</span></div>';
  };
  var e = M.all ? eff(M.m) : null;
  var rows = ['asp', 'for', 'int'].map(function (k) {
    var x = v.exp[k];
    return '<tr><td><b>' + LBL[k].name + '</b><small>' + LBL[k].def + '</small></td><td><span class="ar ' + GLY[x][1] + '">' + GLY[x][0] + '</span> ' + esc(LBL[k][x] || OTHER[x]) + '</td>' +
      '<td class="n">' + (e ? (e[k] > 0 ? '+' : e[k] < 0 ? '−' : '') + fmt(Math.abs(e[k])) + (M.unit ? ' ' + esc(M.unit) : '') + '<br>' + verdict(x, e[k]) : '<small>—</small>') + '</td></tr>';
  }).join('');
  if (v.rank) {
    var ok = M.all ? PLOTS.every(function (p) { return M.m['N-C'] >= M.m[p] && M.m['S-D'] <= M.m[p]; }) : null;
    rows += '<tr><td><b>Ranking</b><small>all four plots</small></td><td>N-C thickest, S-D thinnest</td><td class="n">' + (ok === null ? '<small>—</small>' : ok ? '<span class="vd ok">✓ as predicted</span>' : '<span class="vd warn">✗ not as predicted</span>') + '</td></tr>';
  }
  $('#vpanel').innerHTML =
    '<div class="vhead"><span class="tag">' + esc(v.hyp) + '</span><h3>' + esc(v.name) + '</h3><p class="note">' + esc(v.stat) + ' · ' + esc(v.inst) + '</p></div>' +
    '<div class="pgrid">' +
      '<div><h4>The four plots</h4><div class="cells"><span></span><span class="mh">Coniferous</span><span class="mh">Deciduous</span>' +
        '<span class="mh r">North</span>' + cell('N-C') + cell('N-D') + '<span class="mh r">South</span>' + cell('S-C') + cell('S-D') + '</div>' +
        '<p class="note">Grey bars: predicted level, relative (no units). Numbers: measured plot means from <code>data/results.js</code>.</p></div>' +
      '<div><h4>Predicted pattern</h4><div class="ich">' + ichart(v, 'exp') + '</div>' +
        '<h4>Measured</h4><div class="ich">' + (M.all ? ichart(v, 'obs') : '<p class="empty">Appears when all four plots have a value in <code>data/results.js</code>.</p>') + '</div></div>' +
      '<div><h4>Effects</h4><table class="etab"><thead><tr><th>Effect</th><th>Predicted</th><th class="n">Measured</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<h4>Why</h4><p class="why">' + esc(v.why) + '</p>' + (R.note && M.any ? '<p class="note">' + esc(R.note) + '</p>' : '') + '</div>' +
    '</div>';
}
function setVar(id) { ST.v = id; renderVar(); }

/* ---------- all predictions ---------- */
function renderMatrix() {
  var h = '';
  VARS.forEach(function (v) {
    var M = measured(v), e = M.all ? eff(M.m) : null, n = 0, ok = 0;
    var td = function (k) {
      var x = v.exp[k], t = '<span class="ar ' + GLY[x][1] + '" title="' + esc(LBL[k][x] || OTHER[x]) + '">' + GLY[x][0] + '</span>';
      if (e && (x === '+' || x === '-')) { n++; var good = Math.abs(e[k]) > 1e-9 && (x === '+') === (e[k] > 0); if (good) ok++; t += good ? ' <span class="vd ok">✓</span>' : ' <span class="vd warn">✗</span>'; }
      return '<td class="c" data-l="' + LBL[k].name + '">' + t + '</td>';
    };
    var cells = td('asp') + td('for') + td('int');
    h += '<tr><td data-l=""><button type="button" class="lk" data-v="' + v.id + '">' + esc(v.name) + '</button></td>' + cells +
      '<td data-l="Hypothesis">' + esc(v.hyp) + '</td><td data-l="Measured with">' + esc(v.inst) + '</td>' +
      '<td data-l="Result">' + (e ? (n ? ok + ' of ' + n + ' as predicted' : 'measured') : M.any ? 'partly measured' : '<span class="mut">not measured yet</span>') + '</td></tr>';
  });
  $('#matrix tbody').innerHTML = h;
  $$('#matrix .lk').forEach(function (b) { b.onclick = function () { setVar(b.dataset.v); var t = $('#plots'); if (t.scrollIntoView) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }; });
}

/* ---------- boot ---------- */
$('#vtabs').innerHTML = VARS.map(function (v) { return '<button type="button" data-v="' + v.id + '">' + esc(v.name.replace(/ \(.*\)$/, '').replace('Topsoil pH, upper depth', 'pH 0–5 cm').replace('Topsoil pH, lower depth', 'pH 5–15 cm')) + '</button>'; }).join('');
$$('#vtabs button').forEach(function (b) { b.onclick = function () { setVar(b.dataset.v); }; });
$$('#hyps button').forEach(function (b) { b.onclick = function () { ST.node = null; ST.hyp = b.dataset.h || null; paintFlow(); }; });
var anyResult = VARS.some(function (v) { return measured(v).any; });
$('#rstate').textContent = anyResult ? (R.note || 'Measured values are loaded from data/results.js.') : 'No measured values yet: everything below is a prediction. Fill in data/results.js after the fieldwork.';
drawFlow(); paintFlow(); renderVar(); renderMatrix();
})();
