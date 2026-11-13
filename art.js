/* 3DBlaze product art — extruded "printed" look, pure SVG, no images needed */
(function (g) {
  var C = { white: '#F2F3F5', black: '#30343B', red: '#E2262B', orange: '#FF6A1F', green: '#1FA14E', blue: '#1A8CFF', gold: '#F2F3F5' };

  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
    var m = function (v) { return Math.max(0, Math.min(255, Math.round(v * f))); };
    return '#' + ((1 << 24) + (m(r) << 16) + (m(gg) << 8) + m(b)).toString(16).slice(1);
  }
  // stacked side layers = the visible "print thickness"
  function sides(shape, color, depth) {
    var s = '', side = shade(color, 0.5);
    for (var i = depth; i > 0; i--) s += '<g transform="translate(0 ' + i + ')" style="color:' + (i === depth ? shade(color, 0.32) : side) + '">' + shape + '</g>';
    return s;
  }
  function top(shape, color) { return '<g style="color:' + color + '">' + shape + '</g>'; }
  function solid(shape, color, depth) { return sides(shape, color, depth) + top(shape, color); }
  // faint layer lines on top surface
  function lines(id, x, y, w, h) {
    var s = '<g opacity=".10" clip-path="url(#' + id + ')">';
    for (var yy = y; yy < y + h; yy += 4) s += '<line x1="' + x + '" y1="' + yy + '" x2="' + (x + w) + '" y2="' + yy + '" stroke="#000" stroke-width="1"/>';
    return s + '</g>';
  }
  var uid = 0;
  function svg(inner, bg) {
    return '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img">' +
      '<defs><radialGradient id="glow' + (++uid) + '" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="' + (bg || '#1A8CFF') + '" stop-opacity="0"/><stop offset="1" stop-color="' + (bg || '#1A8CFF') + '" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="400" height="400" fill="url(#glow' + uid + ')"/>' +
      '<ellipse cx="200" cy="320" rx="125" ry="12" fill="#0B1220" opacity=".10"/>' + inner + '</svg>';
  }

  // ---- shapes ----
  function cedarPath(cx, top, w, h) {
    var tiers = 5, d = '', th = h * 0.26;
    for (var i = 0; i < tiers; i++) {
      var y0 = top + i * (h - th) / tiers * 0.95, wi = w * (0.28 + 0.72 * i / (tiers - 1));
      d += 'M' + cx + ' ' + y0 + ' L' + (cx + wi / 2) + ' ' + (y0 + th) + ' Q' + cx + ' ' + (y0 + th * 0.72) + ' ' + (cx - wi / 2) + ' ' + (y0 + th) + 'Z ';
    }
    var tw = w * 0.07, ty = top + h * 0.86;
    d += 'M' + (cx - tw) + ' ' + ty + 'h' + (2 * tw) + 'v' + (h * 0.14) + 'h' + (-2 * tw) + 'Z';
    return d;
  }
  var LB = [[35.10, 33.09], [35.19, 33.27], [35.30, 33.45], [35.37, 33.56], [35.47, 33.83], [35.48, 33.90], [35.55, 33.98], [35.64, 34.12], [35.66, 34.26], [35.72, 34.33], [35.82, 34.44], [35.90, 34.53], [35.98, 34.64], [36.15, 34.63], [36.35, 34.69], [36.45, 34.60], [36.60, 34.50], [36.62, 34.42], [36.47, 34.28], [36.36, 34.10], [36.27, 33.92], [36.08, 33.83], [35.95, 33.65], [35.82, 33.45], [35.81, 33.32], [35.66, 33.25], [35.62, 33.28], [35.57, 33.27], [35.55, 33.12], [35.45, 33.09], [35.30, 33.08]];
  function lebanonPath(x, y, h) {
    var k = h / 1.62, cosl = 0.83;
    return 'M' + LB.map(function (p) { return (x + (p[0] - 35.08) * k * cosl).toFixed(1) + ' ' + (y + (34.70 - p[1]) * k).toFixed(1); }).join(' L') + 'Z';
  }
  function lebanonPoint(x, y, h, lon, lat) { var k = h / 1.62; return [x + (lon - 35.08) * k * 0.83, y + (34.70 - lat) * k]; }
  function starPath(cx, cy, R, r) {
    var d = '';
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); }
    return d + 'Z';
  }
  function flake(cx, cy, R) {
    var s = '';
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3, c = Math.cos(a), sn = Math.sin(a);
      var p = function (d, off) { var x = cx + d * c - off * sn, y = cy + d * sn + off * c; return x.toFixed(1) + ' ' + y.toFixed(1); };
      s += 'M' + p(0, 0) + 'L' + p(R, 0) + 'M' + p(R * .55, 0) + 'L' + p(R * .78, R * .2) + 'M' + p(R * .55, 0) + 'L' + p(R * .78, -R * .2) + 'M' + p(R * .3, 0) + 'L' + p(R * .45, R * .14) + 'M' + p(R * .3, 0) + 'L' + p(R * .45, -R * .14);
    }
    return s;
  }
  function esc(t) { return String(t || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ring(cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#C9CDD3" stroke-width="5"/><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="8 30"/>'; }
  function hook(cx, y1, y2) { return '<path d="M' + cx + ' ' + y1 + ' V' + y2 + '" stroke="#C9CDD3" stroke-width="2.5"/><circle cx="' + cx + '" cy="' + y1 + '" r="9" fill="none" stroke="#C9CDD3" stroke-width="2.5"/>'; }

  var ART = {
    'flag-keychain': function () {
      var body = '<rect x="95" y="130" width="230" height="150" rx="22" fill="currentColor"/>';
      var id = 'cf' + (++uid);
      return svg(
        '<g transform="rotate(-8 210 205)">' + sides(body, C.red, 12) +
        '<clipPath id="' + id + '"><rect x="95" y="130" width="230" height="150" rx="22"/></clipPath>' +
        '<g clip-path="url(#' + id + ')"><rect x="95" y="130" width="230" height="150" fill="' + C.red + '"/><rect x="95" y="168" width="230" height="74" fill="' + C.white + '"/></g>' +
        '<path d="' + cedarPath(210, 172, 70, 66) + '" fill="' + C.green + '"/>' +
        lines(id, 95, 130, 230, 150) +
        '<circle cx="122" cy="157" r="11" fill="#0E0F12"/>' + ring(100, 136, 34) + '</g>', C.red);
    },
    'my-village': function (o) {
      o = o || {};
      var base = o.color === 'white' ? C.white : C.black;
      var mapC = o.color === 'white' ? C.green : '#F7F8FA';
      var plate = '<rect x="80" y="246" width="240" height="50" rx="10" fill="currentColor"/>';
      var map = '<path d="' + lebanonPath(130, 40, 190) + '" fill="currentColor" stroke="#AEB8C5" stroke-width="1.6" stroke-linejoin="round"/>';
      var pin = lebanonPoint(130, 40, 190, 35.85, 34.05);
      var name = esc((o.text || 'Your village').slice(0, 18));
      return svg(
        solid(plate, base, 12) +
        solid(map, mapC, 10) +
        '<g transform="translate(' + pin[0].toFixed(1) + ' ' + (pin[1] - 4).toFixed(1) + ')"><path d="M0 0 C-14 -18 -14 -34 0 -34 C14 -34 14 -18 0 0Z" fill="' + C.red + '"/><circle cx="0" cy="-23" r="5" fill="#fff"/></g>' +
        '<text x="200" y="279" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="700" font-size="' + (name.length > 12 ? 17 : 21) + '" fill="' + (o.color === 'white' ? '#30343B' : '#F2F3F5') + '">' + name + '</text>', C.blue);
    },
    'cedar-ornament': function (o) {
      o = o || {}; var col = C[o.color] || C.green;
      var tree = '<path d="' + cedarPath(200, 110, 190, 190) + '" fill="currentColor"/>';
      return svg(hook(200, 70, 112) + solid(tree, col, 11), col === C.white ? '#9fd' : col);
    },
    'name-ornament': function (o) {
      o = o || {}; var col = C[o.color] || C.red;
      var disc = '<circle cx="200" cy="200" r="102" fill="currentColor"/>';
      var name = esc((o.text || 'Maria').slice(0, 10));
      var tc = col === C.white ? '#E2262B' : '#fff';
      return svg(hook(200, 70, 98) + solid(disc, col, 12) +
        '<circle cx="200" cy="200" r="84" fill="none" stroke="' + tc + '" stroke-opacity=".45" stroke-width="3" stroke-dasharray="2 7"/>' +
        '<path d="' + starPath(200, 150, 14, 6) + '" fill="' + tc + '"/>' +
        '<text x="200" y="' + (name.length > 6 ? 214 : 220) + '" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="900" font-size="' + (name.length > 7 ? 26 : name.length > 5 ? 32 : 40) + '" fill="' + tc + '">' + name + '</text>' +
        '<text x="200" y="252" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="15" letter-spacing="3" fill="' + tc + '" opacity=".8">2026</text>', col);
    },
    'snowflake-set': function () {
      var f = function (x, y, r, sw) { return '<path d="' + flake(x, y, r) + '" fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round"/>'; };
      return svg(solid(f(125, 215, 62, 13), C.white, 8) + solid(f(280, 230, 54, 12), C.white, 8) + solid(f(205, 145, 70, 14), C.white, 9), '#7cc4ff');
    },
    'star-topper': function () {
      var star = '<path d="' + starPath(200, 165, 118, 50) + '" fill="currentColor" stroke="currentColor" stroke-width="10" stroke-linejoin="round"/>';
      var bolt = '<path d="M212 105 L168 178 H202 L186 232 L238 150 H204 Z" fill="' + C.white + '"/>';
      return svg(solid(star, C.red, 14) + bolt +
        '<path d="M188 288 q12 10 24 0 q-12 -10 -24 0Z M188 300 q12 10 24 0 M188 312 q12 10 24 0" fill="none" stroke="#C9CDD3" stroke-width="5" stroke-linecap="round"/>', C.red);
    },
    'mini-nativity': function () {
      var stable = '<path d="M90 300 V170 L200 95 L310 170 V300 Z" fill="currentColor"/>';
      var hole = '<path d="M120 300 V185 L200 128 L280 185 V300 Z" fill="#0E0F12" opacity=".55"/>';
      var fig = function (x, h, c) { return '<path d="M' + (x - 18) + ' 300 Q' + x + ' ' + (300 - h * 2) + ' ' + (x + 18) + ' 300Z" fill="' + c + '"/><circle cx="' + x + '" cy="' + (300 - h - 8) + '" r="10" fill="' + c + '"/>'; };
      return svg(solid(stable, C.black, 12) + hole + fig(160, 46, C.white) + fig(242, 52, C.white) +
        '<rect x="183" y="272" width="34" height="18" rx="4" fill="' + C.red + '"/><circle cx="200" cy="268" r="8" fill="' + C.white + '"/>' +
        '<path d="' + starPath(200, 74, 20, 8) + '" fill="' + C.white + '"/>', '#9fd0ff');
    },
    'gift-bundle': function () {
      var box = '<rect x="105" y="170" width="190" height="130" rx="10" fill="currentColor"/>';
      var lid = '<rect x="95" y="145" width="210" height="36" rx="8" fill="currentColor"/>';
      return svg(solid(box, C.red, 10) + solid(lid, C.red, 8) +
        '<rect x="188" y="145" width="24" height="155" fill="' + C.white + '"/>' +
        '<path d="M200 145 C170 105 140 120 160 140 C170 148 190 147 200 145 C210 147 230 148 240 140 C260 120 230 105 200 145Z" fill="' + C.white + '"/>' +
        '<path d="' + cedarPath(140, 205, 46, 50) + '" fill="' + C.green + '" opacity=".95"/>' +
        '<path d="' + starPath(255, 235, 24, 10) + '" fill="' + C.gold + '"/>', C.red);
    },
    'cedar-keychain': function () {
      var body = '<path d="' + cedarPath(205, 110, 200, 200) + '" fill="currentColor"/>';
      return svg('<g transform="rotate(6 200 200)">' + solid(body, C.green, 11) + ring(205, 86, 30) + '</g>', C.green);
    },
    placeholder: function () {
      return svg('<path d="M212 95 L150 215 H200 L178 305 L262 175 H210 Z" fill="' + C.blue + '" opacity=".9"/>', C.blue);
    }
  };

  g.BlazeArt = {
    draw: function (id, opts) { return (ART[id] || ART.placeholder)(opts || {}); },
    has: function (id) { return !!ART[id]; },
    cedarPath: cedarPath, lebanonPath: lebanonPath, starPath: starPath, colors: C
  };
})(window);
