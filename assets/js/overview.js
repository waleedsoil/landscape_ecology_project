/* Overview page: hill cross-section drawn at real pixel size (text stays 14px at any width). */
window.G4_OVERVIEW = true;
(function () {
'use strict';
var svg = document.getElementById('xsec');
if (!svg) return;
function draw() {
  var W = svg.clientWidth, H = svg.clientHeight;
  if (!W || !H) return;
  var xl = 10, xr = W - 10, xs = W / 2, ys = H * 0.2, yb = H - 6;
  var P1 = { x: xs - 30, y: ys + 12 }, P2 = { x: xs + 30, y: ys + 12 };
  var surfL = function (x) { return yb - (x - xl) / (P1.x - xl) * (yb - P1.y); };
  var surfR = function (x) { return P2.y + (x - P2.x) / (xr - P2.x) * (yb - P2.y); };
  var yc = ys + (yb - ys) * 0.48;
  var xL = xl + (yb - yc) / (yb - P1.y) * (P1.x - xl);
  var xR = P2.x + (yc - P2.y) / (yb - P2.y) * (xr - P2.x);
  var hill = 'M' + xl + ' ' + yb + 'L' + P1.x + ' ' + P1.y + 'Q' + xs + ' ' + (ys - 6) + ' ' + P2.x + ' ' + P2.y + 'L' + xr + ' ' + yb + 'Z';
  var s = '<defs><clipPath id="hc"><path d="' + hill + '"/></clipPath><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient></defs>';
  s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="12" fill="url(#sky)"/>';
  /* low December sun from the south (right) at 16 degrees */
  var ta = Math.tan(16 * Math.PI / 180), m = (yb - P2.y) / (xr - P2.x), sx = W - 26, sy = ys - 2;
  for (var k = 0; k < 3; k++) {
    var y0 = sy + 14 + k * H * 0.075, x0 = W - 8;
    var x = (y0 + x0 * ta - P2.y + P2.x * m) / (m + ta); x = Math.max(P2.x, Math.min(xr, x));
    s += '<line x1="' + x0 + '" y1="' + y0.toFixed(1) + '" x2="' + x.toFixed(1) + '" y2="' + surfR(x).toFixed(1) + '" stroke="#e0a030" stroke-width="2" stroke-dasharray="7 5"/>';
  }
  s += '<circle cx="' + sx + '" cy="' + sy + '" r="14" fill="#f2b233"/>';
  s += '<path d="' + hill + '" fill="var(--hill)"/>';
  s += '<rect x="0" y="0" width="' + xs + '" height="' + H + '" fill="var(--shade)" opacity=".75" clip-path="url(#hc)"/>';
  s += '<path d="' + hill + '" fill="none" stroke="var(--mut)" stroke-width="1.5"/>';
  s += '<line x1="' + xL.toFixed(1) + '" y1="' + yc.toFixed(1) + '" x2="' + xR.toFixed(1) + '" y2="' + yc.toFixed(1) + '" stroke="var(--red)" stroke-width="2" stroke-dasharray="6 5"/>';
  var tree = function (cx, base, type) {
    if (type === 'C') return '<path d="M' + (cx - 8) + ' ' + base + 'L' + (cx + 8) + ' ' + base + 'L' + cx + ' ' + (base - 26) + 'Z" fill="var(--c)"/>';
    return '<g stroke="var(--d)" stroke-width="2" stroke-linecap="round" fill="none"><path d="M' + cx + ' ' + base + 'V' + (base - 24) + 'M' + cx + ' ' + (base - 11) + 'L' + (cx - 7) + ' ' + (base - 21) + 'M' + cx + ' ' + (base - 14) + 'L' + (cx + 7) + ' ' + (base - 23) + '"/></g>';
  };
  s += tree(xL - 13, surfL(xL - 13), 'C') + tree(xL + 11, surfL(xL + 11), 'D');
  s += tree(xR - 11, surfR(xR - 11), 'D') + tree(xR + 13, surfR(xR + 13), 'C');
  var t = function (x, y, txt, anchor, bold) { return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="' + anchor + '"' + (bold ? ' style="font-weight:600"' : '') + '>' + txt + '</text>'; };
  s += t(xs, yc - 8, 'same contour', 'middle');
  s += t(xL + 8, yc + 22, 'N-C · N-D', 'start', true) + t(xR - 8, yc + 22, 'S-C · S-D', 'end', true);
  s += t(xs - W * 0.22, yb - 30, 'North-facing', 'middle', true) + t(xs - W * 0.22, yb - 12, 'in shade all day', 'middle');
  s += t(xs + W * 0.22, yb - 30, 'South-facing', 'middle', true) + t(xs + W * 0.22, yb - 12, 'low sun, 16° at noon', 'middle');
  svg.innerHTML = s;
}
new ResizeObserver(draw).observe(svg);
draw();
})();
