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
  var LB = [[35.105,33.089],[35.1,33.101],[35.106,33.112],[35.125,33.133],[35.148,33.14],[35.168,33.17],[35.162,33.177],[35.171,33.177],[35.175,33.17],[35.205,33.225],[35.209,33.255],[35.188,33.28],[35.21,33.293],[35.225,33.312],[35.244,33.356],[35.25,33.41],[35.275,33.445],[35.271,33.458],[35.349,33.514],[35.401,33.643],[35.394,33.65],[35.41,33.661],[35.422,33.702],[35.438,33.711],[35.438,33.723],[35.477,33.804],[35.481,33.824],[35.483,33.872],[35.47,33.902],[35.487,33.913],[35.517,33.903],[35.572,33.91],[35.593,33.945],[35.586,33.951],[35.614,33.993],[35.641,33.999],[35.64,34.009],[35.627,34.02],[35.627,34.044],[35.643,34.088],[35.648,34.119],[35.63,34.153],[35.627,34.201],[35.648,34.222],[35.653,34.285],[35.665,34.311],[35.689,34.328],[35.706,34.317],[35.751,34.39],[35.806,34.415],[35.824,34.435],[35.805,34.465],[35.824,34.461],[35.903,34.478],[35.983,34.539],[35.989,34.553],[35.99,34.6],[35.981,34.638],[35.97,34.65],[35.991,34.648],[36.038,34.628],[36.156,34.627],[36.178,34.635],[36.201,34.624],[36.262,34.627],[36.281,34.639],[36.288,34.676],[36.309,34.688],[36.324,34.679],[36.347,34.644],[36.368,34.629],[36.391,34.622],[36.44,34.629],[36.436,34.598],[36.429,34.593],[36.404,34.604],[36.389,34.596],[36.384,34.554],[36.32,34.514],[36.335,34.493],[36.392,34.5],[36.433,34.494],[36.45,34.465],[36.48,34.449],[36.495,34.434],[36.525,34.423],[36.53,34.403],[36.517,34.37],[36.519,34.354],[36.556,34.311],[36.577,34.308],[36.582,34.3],[36.58,34.287],[36.563,34.263],[36.574,34.23],[36.604,34.199],[36.576,34.173],[36.553,34.141],[36.488,34.089],[36.475,34.054],[36.445,34.046],[36.412,34.054],[36.391,34.045],[36.358,34.01],[36.318,33.981],[36.289,33.947],[36.267,33.91],[36.275,33.897],[36.311,33.872],[36.35,33.866],[36.368,33.858],[36.37,33.837],[36.358,33.824],[36.338,33.821],[36.232,33.853],[36.187,33.83],[36.166,33.83],[36.138,33.851],[36.102,33.832],[36.05,33.816],[36.027,33.784],[35.994,33.761],[35.974,33.732],[35.948,33.709],[35.947,33.673],[35.925,33.662],[35.922,33.64],[36.03,33.598],[36.038,33.586],[36.035,33.568],[35.999,33.541],[35.933,33.528],[35.922,33.515],[35.935,33.494],[35.919,33.462],[35.821,33.407],[35.769,33.343],[35.744,33.331],[35.699,33.323],[35.652,33.277],[35.62,33.27],[35.618,33.256],[35.604,33.24],[35.585,33.252],[35.561,33.282],[35.549,33.281],[35.52,33.222],[35.512,33.147],[35.48,33.087],[35.449,33.085],[35.345,33.056],[35.332,33.057],[35.306,33.089],[35.284,33.101],[35.234,33.091],[35.207,33.095],[35.185,33.084]];
  function lebanonPath(x, y, h) {
    var k = h / 1.64, cosl = 0.83;
    return 'M' + LB.map(function (p) { return (x + (p[0] - 35.09) * k * cosl).toFixed(1) + ' ' + (y + (34.695 - p[1]) * k).toFixed(1); }).join(' L') + 'Z';
  }
  function lebanonPoint(x, y, h, lon, lat) { var k = h / 1.64; return [x + (lon - 35.09) * k * 0.83, y + (34.695 - lat) * k]; }
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
    'my-village': function (o) { return villageSVG(o || {}).svg; },
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


  // ---------- "My Village" desk map: drawn from the real Bambu Studio model ----------
  // Outlines (mm) come from the "3DBlaze My Village" .3mf: black plate (with the tab that sits in the base),
  // white map inset, and the pin. Pin placement = the file workflow: Hadchit pin at 34.2519N 35.9853E,
  // 0.755 mm per km, east = +x, north = +y; nudged inland (east) until the whole pin sits on the white map.
  var MPLATE=[[63.51, -4.35], [86.56, 0.0], [97.44, -7.83], [91.78, -17.4], [109.62, -42.63], [96.14, -55.68], [85.26, -67.86], [63.51, -90.48], [69.17, -97.44], [52.63, -122.67], [37.41, -123.54], [32.62, -138.33], [32.62, -139.2], [104.4, -139.2], [104.4, -149.0], [0.0, -149.0], [0.0, -139.2], [10.88, -112.23], [20.01, -93.09], [27.41, -70.47], [30.45, -58.29], [39.15, -36.54], [52.2, -22.62]];
  var MWHITE=[[15.51, -136.79], [31.16, -136.37], [35.93, -121.62], [51.51, -120.73], [66.69, -97.57], [60.84, -90.37], [83.79, -66.5], [94.69, -54.29], [107.0, -42.38], [89.4, -17.5], [94.79, -8.39], [86.09, -2.12], [64.75, -6.15], [53.8, -23.84], [40.87, -37.63], [32.36, -58.91], [29.33, -71.02], [21.87, -93.83], [12.71, -113.04], [3.0, -137.12]];
  var MPIN=[[-3.94, 6.36], [-3.82, 6.12], [0.0, 0.0], [3.82, 6.12], [4.18, 6.83], [4.41, 7.59], [4.5, 8.38], [4.48, 8.65], [4.45, 9.18], [4.26, 9.95], [3.94, 10.68], [3.49, 11.34], [2.93, 11.91], [2.28, 12.38], [1.56, 12.72], [1.31, 12.79], [0.79, 12.93], [0.0, 13.0], [-0.79, 12.93], [-1.56, 12.72], [-2.28, 12.38], [-2.93, 11.91], [-3.49, 11.34], [-3.93, 10.68], [-4.26, 9.95], [-4.45, 9.18], [-4.5, 8.38], [-4.41, 7.59], [-4.18, 6.83]];
  var MS = 2.2, MX = 200 - 52.2 * MS, MY = 30;          // mm -> px; plate tab centred on the base
  function mpx(q) { return [MX + q[0] * MS, MY - q[1] * MS]; }
  function mpath(poly, dx, dy) { return 'M' + poly.map(function (q) { var r = mpx([q[0] + (dx || 0), q[1] + (dy || 0)]); return r[0].toFixed(1) + ' ' + r[1].toFixed(1); }).join(' L') + ' Z'; }
  function pinside(poly, x, y) { var inside = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside; } return inside; }
  function pedge(poly, x, y) { var m = 1e9; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j], dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1))); m = Math.min(m, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy)); } return m; }
  function pinFits(tx, ty) { return MPIN.every(function (q) { var x = tx + q[0], y = ty + q[1]; return pinside(MWHITE, x, y) && pedge(MWHITE, x, y) > 0.6; }); }
  // returns the pin TIP position in mm (plate frame)
  function vpinmm(lat, lon) {
    var kx = 111.32 * Math.cos(34.07 * Math.PI / 180) * 0.755, ky = 110.95 * 0.755;
    var cx = 63.93 + (lon - 35.9853) * kx, cy = -31.61 + (lat - 34.2519) * ky, tx = cx, ty = cy - 6.5, n = 0;
    while (!pinFits(tx, ty) && n++ < 400) tx += 0.2;                       // nudge inland (east), like the files
    if (!pinFits(tx, ty)) { tx = cx; ty = cy - 6.5; n = 0; while (!pinFits(tx, ty) && n++ < 400) { tx += (55 - tx) * 0.02; ty += (-75 - ty) * 0.02; } }
    return [tx, ty];
  }
  function vpin(lat, lon) { return mpx(vpinmm(lat, lon)); }
  var PINPATH = 'M' + MPIN.map(function (q) { return (q[0] * MS).toFixed(1) + ' ' + (-q[1] * MS).toFixed(1); }).join(' L') + ' Z';
  function vfont(t) { return Math.max(10, Math.min(19, 250 / Math.max(1, t.length * 0.66))); }
  function villageSVG(o) {
    var id = 'v' + (++uid), on = o.lat != null && o.lon != null;
    var pin = on ? vpin(o.lat, o.lon) : vpin(34.05, 35.86);
    var name = String(o.text || 'Your village').toUpperCase().slice(0, 18), fs = vfont(name);
    var svg =
      '<svg class="vmap' + (on ? ' has-pin' : '') + '" viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="My Village desk map preview: ' + esc(name) + '">' +
      '<defs><linearGradient id="' + id + 'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7F7F5"/><stop offset="1" stop-color="#E4E4E2"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24262A"/><stop offset="1" stop-color="#101113"/></linearGradient></defs>' +
      '<ellipse cx="200" cy="398" rx="160" ry="10" fill="#0B1220" opacity=".14"/>' +
      '<path d="M66 334 H334 L344 350 H56 Z" fill="#2E3136"/><rect x="88" y="339.5" width="224" height="4" rx="2" fill="#0C0D0F"/>' +
      '<clipPath id="' + id + 'c"><rect x="0" y="0" width="400" height="341.5"/></clipPath>' +
      '<g clip-path="url(#' + id + 'c)"><path d="' + mpath(MPLATE, 1.6, -1.2) + '" fill="#0C0D0F"/>' +
      '<path d="' + mpath(MPLATE) + '" fill="#1B1C1F"/></g>' +
      '<path d="' + mpath(MWHITE) + '" fill="url(#' + id + 'f)"/>' +
      '<g class="vpin" style="transform:translate(' + pin[0].toFixed(1) + 'px,' + pin[1].toFixed(1) + 'px)">' +
        '<circle class="vping" r="5" fill="#E2262B"/>' +
        '<g class="vdrop"><ellipse cx="1.5" cy="0.5" rx="7" ry="2.2" fill="#0B1220" opacity=".2"/>' +
        '<path d="' + PINPATH + '" transform="translate(1.6 1.2)" fill="#8E1216"/>' +
        '<path d="' + PINPATH + '" fill="#E2262B"/>' +
        '<ellipse cx="-3.5" cy="-20" rx="2.8" ry="4" fill="#fff" opacity=".3"/></g></g>' +
      '<rect x="56" y="350" width="288" height="40" rx="6" fill="url(#' + id + 'b)"/><rect x="56" y="350" width="288" height="1.5" fill="#3A3D43"/>' +
      '<text class="vname" x="200" y="' + (376 - (19 - fs) * 0.25).toFixed(1) + '" text-anchor="middle" font-family="DejaVu Sans, Verdana, Arial, sans-serif" font-weight="700" letter-spacing=".6" font-size="' + fs.toFixed(1) + '" fill="#F4F4F2">' + esc(name) + '</text>' +
      '</svg>';
    return { svg: svg };
  }
  // live preview: drawn once, then the pin glides/drops and the name updates without redrawing
  function villageLive(el, o) {
    el.innerHTML = villageSVG(o || {}).svg;
    var svg = el.querySelector('svg'), pinG = el.querySelector('.vpin'), nameT = el.querySelector('.vname'), last = null;
    function set(v) {
      v = v || {};
      var name = String(v.text || 'Your village').toUpperCase().slice(0, 18), fs = vfont(name);
      nameT.textContent = name; nameT.setAttribute('font-size', fs.toFixed(1)); nameT.setAttribute('y', (376 - (19 - fs) * 0.25).toFixed(1));
      svg.setAttribute('aria-label', 'My Village desk map preview: ' + name);
      var on = v.lat != null && v.lon != null;
      var pos = on ? vpin(v.lat, v.lon) : vpin(34.05, 35.86), key = on ? pos[0].toFixed(0) + ',' + pos[1].toFixed(0) : null;
      pinG.style.transform = 'translate(' + pos[0].toFixed(1) + 'px,' + pos[1].toFixed(1) + 'px)';
      svg.classList.toggle('has-pin', on);
      if (on && key !== last) { svg.classList.remove('dropping'); void svg.getBoundingClientRect(); svg.classList.add('dropping'); }
      last = key;
    }
    // gentle 3D tilt that follows the pointer (desktop); phones get a slow idle sway from CSS
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      svg.style.transform = 'perspective(900px) rotateY(' + (x * 12).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
    });
    el.addEventListener('pointerleave', function () { svg.style.transform = ''; });
    set(o);
    return { set: set };
  }
  g.BlazeArt = {
    village: villageLive, villagePin: vpinmm,
    inLebanon: function (lat, lon) { var x = lon, y = lat, inside = false; for (var i = 0, j = LB.length - 1; i < LB.length; j = i++) { var a = LB[i], b = LB[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside; } return inside; },
    draw: function (id, opts) { return (ART[id] || ART.placeholder)(opts || {}); },
    has: function (id) { return !!ART[id]; },
    cedarPath: cedarPath, lebanonPath: lebanonPath, starPath: starPath, colors: C
  };
})(window);
