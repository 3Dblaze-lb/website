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
  // Relief edition (Hadchit relief sample .3mf, 16 Nov 2026). Map object frame, mm, x east, y north (y=0 = bottom of the tab):
  // black plate 123.9 x 167.6 (tab y<9.9 sits in the base slot), white relief map, black district borders, green pin.
  // img/map-face.webp = top view of plate + relief + borders rendered from the file (0.2 mm/px, covers x -0.5..124.5, y -0.5..168).
  // Pin: TIP on the village, same projection as the map tool (build2.py): Hadchit 34.2519N 35.9853E -> tip (71.359, 123.616).
  var MPLATE=[[118.45,-0.1],[-0.1,-0.05],[0.1,16.65],[1.2,19.35],[4.2,21.55],[5.4,23.95],[7.1,25.45],[7.4,26.75],[8.0,27.45],[8.2,29.25],[6.8,31.25],[6.8,33.25],[7.3,34.45],[8.9,35.65],[9.5,37.25],[11.0,39.25],[11.5,43.25],[12.9,46.85],[13.6,49.95],[15.2,52.25],[17.0,53.35],[19.9,56.95],[20.4,60.65],[21.8,62.35],[22.1,64.25],[22.9,65.65],[22.9,68.15],[24.2,69.95],[24.5,72.65],[26.5,74.85],[27.2,78.45],[29.2,81.85],[28.9,85.25],[29.2,86.85],[28.1,90.15],[28.5,92.15],[30.35,93.9],[34.05,94.5],[35.45,95.3],[37.15,95.2],[38.4,97.15],[38.7,98.85],[40.4,100.95],[40.2,103.25],[40.7,105.15],[42.0,107.35],[42.3,109.05],[41.8,111.15],[40.8,112.45],[40.5,114.25],[41.0,115.75],[41.2,119.45],[42.6,121.55],[43.0,122.85],[42.5,125.75],[42.9,127.75],[45.95,131.8],[48.4,132.75],[48.5,135.05],[50.05,137.3],[51.15,138.1],[53.95,138.7],[55.0,139.75],[54.3,142.25],[54.5,143.25],[55.55,144.8],[58.45,146.8],[59.85,146.8],[61.55,145.8],[63.25,146.3],[66.55,150.0],[68.7,151.45],[68.5,155.85],[67.5,159.35],[68.5,162.35],[70.35,163.6],[71.85,163.7],[74.35,163.1],[75.75,161.9],[77.25,162.4],[78.95,162.1],[82.15,163.0],[85.25,162.0],[87.15,162.5],[89.75,162.0],[91.35,162.4],[92.65,162.1],[93.8,164.95],[95.05,166.4],[97.25,167.4],[98.75,167.6],[100.05,167.3],[102.2,165.95],[103.1,164.45],[103.1,162.95],[103.55,162.6],[105.65,161.9],[107.45,162.5],[110.25,161.9],[111.2,160.75],[111.6,159.35],[111.0,155.45],[110.1,153.55],[107.6,151.85],[107.1,150.15],[108.7,149.05],[110.65,146.2],[113.05,145.8],[114.8,143.25],[116.85,142.2],[118.0,140.75],[119.0,136.95],[118.6,135.55],[117.2,133.85],[118.9,131.75],[119.1,130.55],[120.55,129.8],[121.7,128.25],[121.7,126.05],[120.6,124.55],[120.9,123.25],[123.3,120.75],[123.8,117.75],[123.3,116.55],[121.2,115.15],[119.0,110.85],[115.3,108.25],[115.2,105.75],[114.3,104.45],[114.1,103.35],[113.05,102.1],[109.85,100.7],[106.95,101.5],[103.7,98.25],[103.1,96.65],[101.85,95.6],[100.45,95.3],[98.3,92.55],[98.95,91.8],[100.35,91.5],[103.75,89.7],[105.6,87.95],[105.9,83.85],[104.55,81.9],[102.35,81.3],[99.45,81.2],[97.85,81.7],[95.05,81.6],[93.25,82.8],[92.05,81.8],[87.15,81.2],[84.25,81.9],[81.95,80.4],[79.35,79.7],[77.6,76.65],[74.9,74.55],[73.4,72.35],[73.5,70.35],[72.7,68.65],[73.25,68.0],[75.65,67.3],[79.4,63.95],[80.6,61.75],[80.3,59.55],[76.35,54.9],[72.95,54.1],[72.3,53.45],[71.6,50.25],[70.8,48.85],[66.45,45.0],[61.75,42.1],[60.7,38.55],[57.45,36.3],[55.35,33.9],[53.95,33.4],[49.95,28.3],[47.55,27.1],[45.35,27.2],[43.45,26.6],[41.85,26.8],[40.35,28.0],[40.0,27.75],[39.7,27.05],[40.1,25.45],[39.0,20.65],[39.1,18.65],[37.3,15.65],[37.3,10.35],[37.75,9.8],[118.45,9.8]];
  var MWHITE=[[24.25,12.2],[22.25,12.4],[20.0,14.85],[20.0,16.25],[19.45,16.8],[18.25,16.3],[17.55,16.9],[13.55,15.6],[11.65,16.3],[10.95,15.2],[9.95,14.9],[8.65,15.8],[7.15,15.1],[6.75,15.6],[3.0,15.95],[3.6,17.45],[6.3,19.05],[7.8,22.25],[9.15,22.8],[9.8,23.85],[10.1,25.45],[10.9,26.45],[11.3,30.35],[11.1,31.35],[10.25,32.0],[9.75,31.9],[9.7,32.65],[10.75,32.5],[11.2,32.95],[12.2,35.95],[13.8,37.95],[14.3,42.15],[15.7,45.75],[16.4,48.95],[17.45,50.3],[18.95,50.9],[19.9,51.85],[21.1,53.45],[21.4,54.35],[22.6,55.65],[23.1,59.25],[24.1,60.15],[24.9,62.25],[25.0,63.55],[25.9,64.55],[25.8,67.45],[27.2,68.25],[27.2,71.25],[27.75,71.9],[28.65,72.1],[29.2,73.05],[29.8,76.75],[32.1,81.05],[32.3,82.65],[31.9,85.35],[32.4,85.85],[32.0,87.55],[32.2,88.15],[32.0,89.05],[31.1,90.15],[31.2,90.85],[33.45,91.5],[33.75,91.2],[34.35,91.6],[34.75,91.4],[35.95,92.2],[36.15,91.8],[36.95,91.7],[37.95,90.8],[39.25,91.3],[40.0,92.35],[40.0,93.75],[41.5,96.75],[41.4,97.55],[42.1,97.95],[42.55,99.0],[43.95,98.8],[44.8,100.05],[44.8,101.05],[43.45,101.6],[43.1,102.55],[43.6,103.05],[43.4,103.75],[44.0,105.05],[44.8,105.85],[45.4,109.65],[45.2,110.75],[44.7,111.25],[44.7,112.65],[43.6,113.55],[43.5,114.15],[44.0,115.05],[43.9,118.15],[44.5,119.25],[45.2,119.75],[46.1,122.75],[45.8,123.65],[46.0,124.95],[45.5,125.65],[45.6,126.45],[45.95,126.4],[46.9,127.25],[47.0,128.45],[47.75,129.3],[48.85,129.3],[49.75,128.7],[50.7,129.45],[51.0,131.15],[51.6,131.95],[51.2,133.85],[51.9,134.15],[52.25,135.3],[55.35,136.0],[58.3,138.35],[58.5,139.65],[57.9,140.45],[58.0,141.45],[57.3,142.15],[57.95,143.0],[58.75,142.3],[59.75,143.4],[60.35,142.8],[61.35,142.6],[64.75,143.6],[67.7,146.45],[68.15,147.5],[71.1,148.95],[71.8,151.25],[71.8,152.45],[71.5,156.25],[70.5,159.05],[71.05,160.7],[71.85,160.7],[72.25,160.1],[73.05,160.2],[74.35,159.0],[75.25,159.0],[75.55,158.6],[76.55,158.7],[77.35,159.4],[78.15,158.7],[78.75,159.2],[79.45,158.8],[79.95,159.4],[81.45,159.2],[82.05,160.0],[85.55,158.7],[87.05,159.5],[88.25,159.5],[89.85,158.6],[90.65,158.8],[91.35,159.4],[92.75,158.7],[93.75,158.6],[95.05,159.0],[95.8,159.75],[96.4,161.05],[96.0,162.45],[96.6,163.75],[98.75,164.6],[100.2,163.75],[99.7,161.75],[100.4,160.45],[102.25,159.0],[102.95,158.9],[103.75,159.6],[105.35,158.5],[107.35,159.5],[108.6,159.35],[108.0,158.05],[108.3,157.55],[108.1,156.25],[107.45,155.2],[106.45,155.1],[105.25,156.5],[104.45,156.8],[104.0,156.45],[103.8,154.35],[103.3,153.85],[104.7,152.75],[104.5,151.65],[102.95,151.2],[102.15,150.0],[101.25,149.8],[99.5,147.95],[100.45,147.1],[102.25,147.2],[102.85,146.6],[103.95,146.9],[105.95,146.6],[106.45,147.0],[108.75,143.2],[110.55,142.8],[111.45,143.3],[111.6,142.85],[111.0,142.35],[111.25,142.0],[111.95,141.9],[112.4,141.45],[112.4,140.95],[113.45,140.5],[113.95,139.8],[115.2,139.65],[116.0,136.95],[113.6,134.45],[114.9,131.85],[116.2,130.45],[115.7,128.95],[117.15,127.7],[118.9,127.15],[117.1,125.55],[117.9,123.45],[117.8,121.65],[120.6,119.45],[120.9,118.45],[119.25,117.9],[118.3,116.95],[118.0,115.35],[116.8,114.15],[117.1,113.65],[116.6,112.65],[114.95,112.1],[112.1,109.55],[111.9,108.35],[112.5,107.15],[111.3,105.55],[111.4,104.65],[110.65,104.7],[109.55,103.7],[105.65,105.1],[104.95,104.1],[103.95,104.1],[104.0,102.65],[103.15,102.8],[102.7,102.45],[102.3,101.05],[101.3,100.45],[100.65,98.4],[98.95,98.0],[97.0,96.25],[94.3,91.65],[94.45,91.0],[97.25,89.3],[98.55,88.6],[99.25,88.7],[102.75,86.8],[103.0,84.45],[99.45,84.2],[98.35,84.7],[95.75,84.5],[94.15,86.4],[92.25,86.9],[91.2,85.95],[90.95,84.6],[88.05,84.6],[87.25,84.2],[85.95,84.4],[85.05,85.9],[83.95,85.7],[83.25,84.6],[81.75,84.5],[80.85,83.2],[79.25,82.8],[78.05,83.4],[75.1,78.35],[73.65,78.4],[71.7,74.75],[70.5,74.55],[70.1,72.15],[70.6,71.15],[69.85,69.9],[68.4,69.45],[68.4,68.65],[67.4,67.65],[67.85,66.5],[69.25,66.2],[70.35,66.6],[71.65,65.4],[74.15,64.6],[75.55,63.0],[77.0,62.15],[77.7,61.05],[77.1,60.25],[74.55,57.4],[70.15,56.7],[68.3,55.65],[68.3,54.45],[69.4,53.65],[68.7,50.95],[64.65,47.4],[59.75,44.5],[58.6,43.15],[58.3,40.45],[56.45,39.0],[54.95,38.3],[54.3,37.65],[54.05,36.7],[52.05,36.0],[48.15,30.7],[46.85,30.0],[45.35,30.3],[43.05,29.6],[40.4,31.75],[40.3,33.15],[39.25,34.0],[38.8,33.55],[38.1,30.95],[37.4,30.45],[37.4,29.15],[36.7,28.55],[36.6,26.65],[37.1,25.45],[35.9,20.35],[36.2,19.45],[35.25,17.8],[33.9,17.45],[34.1,15.45],[29.75,15.5],[28.45,13.2],[25.05,12.8]];
  var MPIN=[[0.05,-0.1],[-3.8,5.95],[-4.5,7.55],[-4.5,9.25],[-4.4,9.75],[-3.9,10.85],[-2.85,12.1],[-2.65,12.1],[-1.75,12.8],[-1.35,12.8],[-0.95,13.0],[0.95,13.0],[1.35,12.8],[1.75,12.8],[2.05,12.5],[2.55,12.3],[2.65,12.1],[2.85,12.1],[3.9,10.85],[4.4,9.75],[4.5,9.25],[4.5,7.55],[4.3,6.95],[3.8,5.95],[0.4,0.65]];
  var MTOP = 167.55, MS = 1.82, MX = 200 - 59.1 * MS, MY = 54.7;   // mm -> px; plate tab centred on the base
  function mpx(q) { return [MX + q[0] * MS, MY + (MTOP - q[1]) * MS]; }
  function mpath(poly, dx, dy) { return 'M' + poly.map(function (q) { var r = mpx([q[0] + (dx || 0), q[1] + (dy || 0)]); return r[0].toFixed(1) + ' ' + r[1].toFixed(1); }).join(' L') + ' Z'; }
  function pinside(poly, x, y) { var inside = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside; } return inside; }
  function pedge(poly, x, y) { var m = 1e9; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j], dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1))); m = Math.min(m, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy)); } return m; }
  function pinFits(tx, ty) { return MPIN.every(function (q) { var x = tx + q[0], y = ty + q[1]; return pinside(MWHITE, x, y) && pedge(MWHITE, x, y) > 0.6; }); }
  // returns the pin TIP position in mm (map object frame of the .3mf)
  function vpinmm(lat, lon) {
    // exactly the map tool's projection (build2.py): 0.839 mm/km, LON0 35.104, LATMIN 33.055, tab bottom = 0
    var kx = 111.32 * Math.cos(33.85 * Math.PI / 180) * 0.839, ky = 110.95 * 0.839;
    var cx = 3 + (lon - 35.104) * kx, cy = 12.2 + (lat - 33.055) * ky, tx = cx, ty = cy, n = 0;
    while (!pinFits(tx, ty) && n++ < 400) tx += 0.2;                       // nudge inland (east), like the files
    if (!pinFits(tx, ty)) { tx = cx; ty = cy; n = 0; while (!pinFits(tx, ty) && n++ < 400) { tx += (75 - tx) * 0.02; ty += (95 - ty) * 0.02; } }
    return [tx, ty];
  }
  function vpin(lat, lon) { return mpx(vpinmm(lat, lon)); }
  var PINPATH = 'M' + MPIN.map(function (q) { return (q[0] * MS).toFixed(1) + ' ' + (-q[1] * MS).toFixed(1); }).join(' L') + ' Z';
  // base text like the print: "ENGLISH NAME  ### m  الاسم بالعربي" on the base's top face
  function vparts(o) {
    var en = String(o.text || 'Your village').toUpperCase().slice(0, 18);
    var ele = o.ele != null && isFinite(o.ele) ? ' ' + o.ele + ' m' : '';
    return { lat: en + ele, ar: o.ar ? String(o.ar).replace(/\s+/g, ' ').trim().slice(0, 24) : '' };
  }
  function vlabel(o) { var q = vparts(o); return q.lat + (q.ar ? ' ' + q.ar : ''); }
  // estimated widths (static drawings); the live preview measures the real text instead
  function vest(q, fs) { return { a: q.lat.length * fs * 0.8, b: q.ar ? q.ar.length * fs * 0.6 : 0 }; }
  function vfit(q) { var w = vest(q, 1), tot = w.a + w.b + (q.ar ? 0.5 : 0); return Math.max(8, Math.min(18, 272 / Math.max(1, tot))); }
  function vplace(wa, wb, gap) { var tot = wa + (wb ? gap + wb : 0), x0 = -tot / 2; return { latX: x0, arX: x0 + tot }; }
  function vfont(t) { var n = 0; for (var i = 0; i < t.length; i++) n += /[\u0600-\u06FF]/.test(t[i]) ? 0.8 : 1; return Math.max(8, Math.min(18, 272 / Math.max(1, n * 0.62))); }
  var TXY = 361;
  function villageSVG(o) {
    var id = 'v' + (++uid), on = o.lat != null && o.lon != null;
    var pin = on ? vpin(o.lat, o.lon) : vpin(34.05, 35.86);
    var label = vlabel(o), fs = vfont(label);
    var svg =
      '<svg class="vmap' + (on ? ' has-pin' : '') + '" viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="My Village desk map preview: ' + esc(label) + '">' +
      '<defs><linearGradient id="' + id + 'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7F7F5"/><stop offset="1" stop-color="#E4E4E2"/></linearGradient>' +
      '<linearGradient id="' + id + 't" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26292E"/><stop offset="1" stop-color="#1A1C20"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16181B"/><stop offset="1" stop-color="#0C0D0F"/></linearGradient></defs>' +
      '<ellipse cx="200" cy="402" rx="170" ry="10" fill="#0B1220" opacity=".14"/>' +
      // base: top face (seen from slightly above) with the slot at the back, then the front face
      '<path d="M65 334 H335 L356 374 H44 Z" fill="url(#' + id + 't)"/>' +
      '<rect x="90" y="339.5" width="220" height="4" rx="2" fill="#09090B"/>' +
      '<clipPath id="' + id + 'c"><rect x="0" y="0" width="400" height="341.5"/></clipPath>' +
      '<g clip-path="url(#' + id + 'c)"><path d="' + mpath(MPLATE, 1.4, -1.1) + '" fill="#0C0D0F"/>' +
      '<image href="img/map-face.webp" x="' + (MX - 0.5 * MS).toFixed(2) + '" y="' + (MY + (MTOP - 168) * MS).toFixed(2) + '" width="' + (125 * MS).toFixed(2) + '" height="' + (168.5 * MS).toFixed(2) + '" preserveAspectRatio="none"/></g>' +
      '<g class="vpin" style="transform:translate(' + pin[0].toFixed(1) + 'px,' + pin[1].toFixed(1) + 'px)">' +
        '<circle class="vping" r="5" fill="#1FA14E"/>' +
        '<g class="vdrop"><ellipse cx="1.5" cy="0.5" rx="7" ry="2.2" fill="#0B1220" opacity=".2"/>' +
        '<path d="' + PINPATH + '" transform="translate(1.6 1.2)" fill="#0E5A2A"/>' +
        '<path d="' + PINPATH + '" fill="#1FA14E"/>' +
        '<ellipse cx="-3.5" cy="-20" rx="2.8" ry="4" fill="#fff" opacity=".28"/></g></g>' +
      // raised white text lying on the top face (squashed for the viewing angle), like the print
      (function () {
        var q = vparts(o), f = vfit(q), w = vest(q, f), pl = vplace(w.a, w.b, f * 0.5);
        if (!o.__live) return '<g class="vlab" transform="translate(200 ' + TXY + ') scale(1 .66)"><text x="0" y="0" text-anchor="middle" font-family="DejaVu Sans, Verdana, Arial, sans-serif" font-weight="700" font-size="' + f.toFixed(1) + '" fill="#F2F2F0" dominant-baseline="middle"><tspan letter-spacing=".4">' + esc(q.lat) + '</tspan>' + (q.ar ? '<tspan letter-spacing="0" font-family="Geeza Pro, SF Arabic, Noto Sans Arabic, DejaVu Sans, Tahoma, Arial, sans-serif"> ' + esc(q.ar) + '</tspan>' : '') + '</text></g>';
        return '<g class="vlab" transform="translate(200 ' + TXY + ') scale(1 .66)">' +
          '<text class="vname" x="' + pl.latX.toFixed(1) + '" y="0" text-anchor="start" direction="ltr" font-family="DejaVu Sans, Verdana, Arial, sans-serif" font-weight="700" letter-spacing=".4" font-size="' + f.toFixed(1) + '" fill="#F2F2F0" dominant-baseline="middle">' + esc(q.lat) + '</text>' +
          // Arabic on its own: no letter-spacing (Safari breaks joined letters with it), right-to-left, right edge aligned
          '<text class="var" x="' + pl.arX.toFixed(1) + '" y="0" text-anchor="end" xml:lang="ar" font-family="Geeza Pro, SF Arabic, Noto Sans Arabic, DejaVu Sans, Tahoma, Arial, sans-serif" font-weight="700" font-size="' + (f * 1.08).toFixed(1) + '" fill="#F2F2F0" dominant-baseline="middle">' + esc(q.ar) + '</text></g>';
      })() +
      '<path d="M44 374 H356 V390 Q356 394 352 394 H48 Q44 394 44 390 Z" fill="url(#' + id + 'b)"/><rect x="44" y="374" width="312" height="1.2" fill="#34373D"/>' +
      '</svg>';
    return { svg: svg };
  }
  // live preview: drawn once, then the pin glides/drops and the name updates without redrawing
  function villageLive(el, o) {
    el.innerHTML = villageSVG(Object.assign({ __live: true }, o || {})).svg;
    var svg = el.querySelector('svg'), pinG = el.querySelector('.vpin'), nameT = el.querySelector('.vname'), last = null;
    function set(v) {
      v = v || {};
      var q = vparts(v), name = vlabel(v), arT = el.querySelector('.var'), fs = vfit(q);
      nameT.textContent = q.lat; arT.textContent = q.ar;
      var lay = function (f) {
        nameT.setAttribute('font-size', f.toFixed(1)); arT.setAttribute('font-size', (f * 1.08).toFixed(1));
        var wa, wb; try { wa = nameT.getComputedTextLength(); wb = q.ar ? arT.getComputedTextLength() : 0; } catch (e) { var g = vest(q, f); wa = g.a; wb = g.b; }
        return { wa: wa, wb: wb, tot: wa + (wb ? f * 0.5 + wb : 0) };
      };
      var m = lay(fs); if (m.tot > 274 && m.tot > 0) { fs = fs * 274 / m.tot; m = lay(fs); }
      var pl = vplace(m.wa, m.wb, fs * 0.5);
      nameT.setAttribute('x', pl.latX.toFixed(1)); arT.setAttribute('x', pl.arX.toFixed(1));
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
  // ---------- Holy Night ornament (3DBlaze original): body image + the customer's name, laid out exactly like the .3mf tool ----------
  var OM = {" ":[0.3481,0,0,0,0],"!":[0.4561,0.1402,0.3159,0.0,0.7291],"\"":[0.5209,0.0952,0.4258,0.458,0.7291],"#":[0.838,0.0678,0.77,0.0,0.7178],"$":[0.6958,0.0781,0.628,-0.147,0.7598],"%":[1.002,0.0322,0.9702,-0.0142,0.7422],"&":[0.872,0.06,0.8302,-0.0142,0.7422],"'":[0.3061,0.0952,0.2109,0.458,0.7291],"(":[0.457,0.0859,0.377,-0.1319,0.7588],")":[0.457,0.0802,0.3711,-0.1319,0.7588],"*":[0.523,0.02,0.503,0.2778,0.7422],"+":[0.838,0.1059,0.7319,0.0,0.627],",":[0.3798,0.0533,0.2778,-0.142,0.1889],"-":[0.415,0.0542,0.3608,0.2169,0.3589],".":[0.3798,0.102,0.2778,0.0,0.1889],"/":[0.3653,0.0,0.3653,-0.0928,0.7291],"0":[0.6958,0.0478,0.648,-0.0142,0.7422],"1":[0.6958,0.1128,0.627,0.0,0.7291],"2":[0.6958,0.0791,0.6089,0.0,0.7422],"3":[0.6958,0.0669,0.6162,-0.0142,0.7422],"4":[0.6958,0.045,0.6498,0.0,0.7291],"5":[0.6958,0.0772,0.6259,-0.0142,0.7291],"6":[0.6958,0.062,0.642,-0.0142,0.7412],"7":[0.6958,0.0669,0.6162,0.0,0.7291],"8":[0.6958,0.0611,0.6338,-0.0142,0.7422],"9":[0.6958,0.0517,0.6319,-0.0142,0.7412],":":[0.3998,0.1119,0.2881,0.0,0.5469],";":[0.3998,0.063,0.2881,-0.142,0.5469],"<":[0.838,0.1059,0.7319,0.0298,0.5972],"=":[0.838,0.1059,0.7319,0.1441,0.4819],">":[0.838,0.1059,0.7319,0.0298,0.5972],"?":[0.5802,0.0689,0.5152,0.0,0.7422],"@":[1.0,0.0659,0.9292,-0.1739,0.7031],"A":[0.7739,0.0048,0.7691,0.0,0.7291],"B":[0.7622,0.0919,0.6919,0.0,0.7291],"C":[0.7339,0.0498,0.67,-0.0142,0.7422],"D":[0.8302,0.0919,0.7778,0.0,0.7291],"E":[0.6831,0.0919,0.6098,0.0,0.7291],"F":[0.6831,0.0919,0.5991,0.0,0.7291],"G":[0.8208,0.0498,0.747,-0.0142,0.7422],"H":[0.8369,0.0919,0.7452,0.0,0.7291],"I":[0.372,0.0919,0.2798,0.0,0.7291],"J":[0.372,-0.0561,0.2798,-0.2002,0.7291],"K":[0.7748,0.0919,0.8052,0.0,0.7291],"L":[0.6372,0.0919,0.6098,0.0,0.7291],"M":[0.9952,0.0919,0.9028,0.0,0.7291],"N":[0.8369,0.0919,0.7452,0.0,0.7291],"O":[0.8502,0.0498,0.7998,-0.0142,0.7422],"P":[0.733,0.0919,0.6919,0.0,0.7291],"Q":[0.8502,0.0498,0.7998,-0.1459,0.7422],"R":[0.77,0.0919,0.75,0.0,0.7291],"S":[0.7202,0.0717,0.647,-0.0142,0.7422],"T":[0.6822,0.0048,0.6767,0.0,0.7291],"U":[0.812,0.0919,0.7202,-0.0142,0.7291],"V":[0.7739,0.0048,0.7691,0.0,0.7291],"W":[1.103,0.0298,1.0717,0.0,0.7291],"X":[0.7709,0.0191,0.7509,0.0,0.7291],"Y":[0.7241,-0.0098,0.7339,0.0,0.7291],"Z":[0.7252,0.045,0.6802,0.0,0.7291],"[":[0.457,0.0859,0.3892,-0.1319,0.7598],"\\":[0.3653,0.0,0.3653,-0.0928,0.7291],"]":[0.457,0.0678,0.3711,-0.1319,0.7598],"^":[0.838,0.1011,0.7369,0.457,0.7291],"_":[0.5,0.0,0.5,-0.2358,-0.1431],"`":[0.5,0.0459,0.3217,0.6162,0.7998],"a":[0.6748,0.043,0.5963,-0.0142,0.56],"b":[0.7158,0.0841,0.6709,-0.0142,0.7598],"c":[0.5928,0.043,0.5259,-0.0142,0.56],"d":[0.7158,0.045,0.6319,-0.0142,0.7598],"e":[0.6783,0.043,0.6298,-0.0142,0.56],"f":[0.435,0.0191,0.4439,0.0,0.7598],"g":[0.7158,0.045,0.6319,-0.2158,0.5591],"h":[0.7119,0.0841,0.6338,0.0,0.7598],"i":[0.3428,0.0841,0.2588,0.0,0.7598],"j":[0.3428,-0.0333,0.2588,-0.2158,0.7598],"k":[0.665,0.0841,0.6841,0.0,0.7598],"l":[0.3428,0.0841,0.2588,0.0,0.7598],"m":[1.042,0.083,0.963,0.0,0.56],"n":[0.7119,0.0841,0.6338,0.0,0.56],"o":[0.687,0.043,0.6441,-0.0142,0.56],"p":[0.7158,0.0841,0.6709,-0.208,0.56],"q":[0.7158,0.045,0.6319,-0.208,0.5591],"r":[0.4931,0.0841,0.4903,0.0,0.56],"s":[0.5952,0.0517,0.5478,-0.0142,0.56],"t":[0.478,0.0131,0.4552,0.0,0.7022],"u":[0.7119,0.0781,0.628,-0.0142,0.5469],"v":[0.6519,0.0152,0.6372,0.0,0.5469],"w":[0.9239,0.0352,0.8892,0.0,0.5469],"x":[0.645,0.0152,0.6298,0.0,0.5469],"y":[0.6519,0.0122,0.6338,-0.2158,0.5469],"z":[0.582,0.045,0.5342,0.0,0.5469],"{":[0.7119,0.125,0.5869,-0.1631,0.7598],"|":[0.3653,0.127,0.2378,-0.2358,0.7642],"}":[0.7119,0.125,0.5869,-0.1631,0.7598],"~":[0.838,0.1059,0.7319,0.2119,0.415]};
  function ornName(t) {
    t = String(t || '').trim(); try { t = t.normalize('NFKD').replace(/[\u0300-\u036f]/g, ''); } catch (e) {}
    return t.split(/\s+/).filter(Boolean).map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }
  function ornLayout(name) {
    var x = 0, xs0 = 1e9, xs1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (var i = 0; i < name.length; i++) { var m = OM[name[i]] || OM.H; if (name[i] !== ' ') { xs0 = Math.min(xs0, x + m[1]); xs1 = Math.max(xs1, x + m[2]); y0 = Math.min(y0, m[3]); y1 = Math.max(y1, m[4]); } x += m[0]; }
    if (xs1 < xs0) return null;
    var w = xs1 - xs0, h = y1 - y0, size = Math.max(Math.min(48 / w, 8 / h, 10.5 / 0.73), 5.6 / 0.73);
    return { size: size, dx: -(xs0 * size + w * size / 2), dy: 24.5 - (y0 * size + h * size / 2) };
  }
  function ornament(o, gx) {
    var nm = ornName(o.text || 'Gabriel'), L = ornLayout(nm);
    return '<g' + (gx ? ' transform="' + gx + '"' : '') + '><image href="img/holy-ornament.webp" x="-46" y="-54" width="92" height="100"/>' +
      (L ? '<text x="' + L.dx.toFixed(2) + '" y="' + (-L.dy).toFixed(2) + '" font-size="' + L.size.toFixed(2) + '" font-family="DVSB, DejaVu Sans, Verdana, sans-serif" font-weight="700" fill="#F7F5F0">' + esc2(nm) + '</text>' : '') + '</g>';
  }
  function esc2(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  ART['holy-ornament'] = function (o) { return '<svg viewBox="-50 -57 100 106" class="orn" role="img" aria-label="Holy Night ornament">' + ornament(o) + '</svg>'; };
  ART['holy-ornament-3'] = function (o) {
    var d = ['Gabriel', 'Maria', 'Elie'], n = o.texts || (o.text ? String(o.text).split(' · ') : d); n = [n[0] || d[0], n[1] || d[1], n[2] || d[2]];
    return '<svg viewBox="-99 -40 198 76" class="orn" role="img" aria-label="Three Holy Night ornaments">' + ornament({ text: n[0] }, 'translate(-64 0) scale(.64)') + ornament({ text: n[1] }, 'translate(0 0) scale(.64)') + ornament({ text: n[2] }, 'translate(64 0) scale(.64)') + '</svg>';
  };
  g.BlazeArt = {
    village: villageLive, villagePin: vpinmm,
    inLebanon: function (lat, lon) { var x = lon, y = lat, inside = false; for (var i = 0, j = LB.length - 1; i < LB.length; j = i++) { var a = LB[i], b = LB[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside; } return inside; },
    draw: function (id, opts) { return (ART[id] || ART.placeholder)(opts || {}); },
    has: function (id) { return !!ART[id]; },
    cedarPath: cedarPath, lebanonPath: lebanonPath, starPath: starPath, colors: C
  };
})(window);
