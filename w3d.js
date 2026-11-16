/* 3DBlaze — tiny WebGL viewer for print models (drag to rotate). No external libraries.
   Blaze3D.mount(el, { src: 'models/x.bin', colors: ['#fff', ...], pitch: -55, spin: true, poster: 'img/x.webp' }) → { setColors(arr), destroy() } */
(function (g) {
  var cache = {};
  function load(src) {
    if (!cache[src]) cache[src] = fetch(src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(parse);
    return cache[src];
  }
  function parse(buf) {
    var dv = new DataView(buf), o = 8, n = dv.getUint32(4, true), parts = [];
    for (var i = 0; i < n; i++) {
      var name = String.fromCharCode.apply(null, new Uint8Array(buf, o, 32)).trim(); o += 32;
      var nv = dv.getUint32(o, true), nt = dv.getUint32(o + 4, true), big = dv.getUint32(o + 8, true); o += 12;
      var mn = [dv.getFloat32(o, true), dv.getFloat32(o + 4, true), dv.getFloat32(o + 8, true)], sc = [dv.getFloat32(o + 12, true), dv.getFloat32(o + 16, true), dv.getFloat32(o + 20, true)]; o += 24;
      var q = new Uint16Array(buf.slice(o, o + nv * 6)); o += nv * 6;
      var idx = big ? new Uint32Array(buf.slice(o, o + nt * 12)) : new Uint16Array(buf.slice(o, o + nt * 6)); o += nt * (big ? 12 : 6);
      if (o % 4) o += 4 - o % 4;
      var pos = new Float32Array(nv * 3);
      for (var k = 0; k < nv; k++) for (var c = 0; c < 3; c++) pos[k * 3 + c] = q[k * 3 + c] * sc[c] + mn[c];
      var nor = new Float32Array(nv * 3);
      for (var t = 0; t < nt; t++) {
        var a = idx[t * 3] * 3, b = idx[t * 3 + 1] * 3, d = idx[t * 3 + 2] * 3;
        var ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[d] - pos[a], vy = pos[d + 1] - pos[a + 1], vz = pos[d + 2] - pos[a + 2];
        var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        nor[a] += nx; nor[a + 1] += ny; nor[a + 2] += nz; nor[b] += nx; nor[b + 1] += ny; nor[b + 2] += nz; nor[d] += nx; nor[d + 1] += ny; nor[d + 2] += nz;
      }
      parts.push({ name: name, pos: pos, nor: nor, idx: idx, big: !!big });
    }
    var r = 0; parts.forEach(function (p) { for (var i = 0; i < p.pos.length; i += 3) { var d = Math.hypot(p.pos[i], p.pos[i + 1], p.pos[i + 2]); if (d > r) r = d; } });
    return { parts: parts, radius: r };
  }
  function hex(h) { h = String(h || '#cccccc').replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var v = parseInt(h, 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; }
  var VS = 'attribute vec3 p;attribute vec3 n;uniform mat4 m;uniform mat4 pr;varying vec3 vn;varying vec3 vp;void main(){vec4 w=m*vec4(p,1.0);vp=w.xyz;vn=mat3(m)*n;gl_Position=pr*w;}';
  var FS = 'precision mediump float;varying vec3 vn;varying vec3 vp;uniform vec3 col;void main(){vec3 N=normalize(vn);if(!gl_FrontFacing)N=-N;vec3 L=normalize(vec3(-0.45,0.6,0.75));vec3 V=normalize(-vp);vec3 H=normalize(L+V);' +
    'float lum=dot(col,vec3(0.299,0.587,0.114));float d=max(dot(N,L),0.0);float back=max(dot(N,normalize(vec3(0.5,-0.3,0.4))),0.0)*0.25;float s=pow(max(dot(N,H),0.0),48.0)*(0.25+0.25*(1.0-lum));' +
    'vec3 c=col*(0.36+0.62*d+back)+vec3(s);if(lum<0.2)c+=vec3(0.05);gl_FragColor=vec4(min(c,vec3(1.0)),1.0);}';
  function mount(el, opt) {
    opt = opt || {};
    var cv = document.createElement('canvas'); cv.className = 'w3d'; cv.setAttribute('aria-label', opt.label || '3D view — drag to rotate');
    el.innerHTML = ''; el.appendChild(cv);
    var hint = document.createElement('div'); hint.className = 'w3d-hint'; hint.textContent = '↻ Drag to rotate'; el.appendChild(hint);
    var gl = null; try { gl = cv.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false }); } catch (e) {}
    if (!gl) { el.innerHTML = opt.poster ? '<img src="' + opt.poster + '" alt="">' : ''; return { setColors: function () {}, destroy: function () {} }; }
    var ext = gl.getExtension('OES_element_index_uint');
    function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; }
    var pg = gl.createProgram(); gl.attachShader(pg, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pg); gl.useProgram(pg);
    var aP = gl.getAttribLocation(pg, 'p'), aN = gl.getAttribLocation(pg, 'n'), uM = gl.getUniformLocation(pg, 'm'), uPr = gl.getUniformLocation(pg, 'pr'), uC = gl.getUniformLocation(pg, 'col');
    gl.enable(gl.DEPTH_TEST);
    var model = null, bufs = [], colors = (opt.colors || []).map(hex), yaw = opt.yaw || 0, pitch = (opt.pitch == null ? -55 : opt.pitch) * Math.PI / 180, spin = opt.spin !== false, dead = false, dirty = true, visible = true;
    yaw = yaw * Math.PI / 180;
    load(opt.src).then(function (md) {
      if (dead) return; model = md;
      bufs = md.parts.map(function (p) {
        var b = { n: p.idx.length, big: p.big && !!ext };
        b.p = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b.p); gl.bufferData(gl.ARRAY_BUFFER, p.pos, gl.STATIC_DRAW);
        b.nn = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b.nn); gl.bufferData(gl.ARRAY_BUFFER, p.nor, gl.STATIC_DRAW);
        b.i = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.i); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, p.idx, gl.STATIC_DRAW);
        return b;
      });
      dirty = true; el.classList.add('w3d-ready');
    }, function () { if (opt.poster) el.innerHTML = '<img src="' + opt.poster + '" alt="">'; });
    function mul(a, b) { var r = new Float32Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; r[i * 4 + j] = s; } return r; }
    function rx(t) { var c = Math.cos(t), s = Math.sin(t); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
    function rz(t) { var c = Math.cos(t), s = Math.sin(t); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
    function frame() {
      if (dead) return;
      requestAnimationFrame(frame);
      if (!visible) return;
      if (spin && !drag) { yaw += 0.008; dirty = true; }
      var w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); dirty = true; }
      if (!dirty || !model || !w) return; dirty = false;
      gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      var R = model.radius * 1.14, asp = w / h, half = 0.26, f = 1 / Math.tan(half), dist = R / Math.sin(half), near = dist - R * 1.2, far = dist + R * 1.2;
      var sx = asp >= 1 ? f / asp : f, sy = asp >= 1 ? f : f * asp;
      var pr = new Float32Array([sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0]);
      var m = mul(rx(pitch), rz(yaw)); m[14] -= dist;
      gl.uniformMatrix4fv(uPr, false, pr); gl.uniformMatrix4fv(uM, false, m);
      bufs.forEach(function (b, i) {
        var c = colors[i] || colors[colors.length - 1] || [0.85, 0.85, 0.85]; gl.uniform3fv(uC, c);
        gl.bindBuffer(gl.ARRAY_BUFFER, b.p); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, b.nn); gl.enableVertexAttribArray(aN); gl.vertexAttribPointer(aN, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.i); gl.drawElements(gl.TRIANGLES, b.n, b.big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
      });
    }
    var drag = null;
    cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, yaw: yaw, pitch: pitch }; spin = false; hint.style.opacity = 0; try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
    cv.addEventListener('pointermove', function (e) { if (!drag) return; yaw = drag.yaw + (e.clientX - drag.x) * 0.012; pitch = Math.max(-1.55, Math.min(1.2, drag.pitch + (e.clientY - drag.y) * 0.012)); dirty = true; });
    var up = function () { drag = null; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.style.touchAction = 'pan-y';
    if (window.IntersectionObserver) { var io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) dirty = true; }); io.observe(cv); }
    requestAnimationFrame(frame);
    return {
      setColors: function (c) { colors = (c || []).map(hex); dirty = true; },
      destroy: function () { dead = true; }
    };
  }
  g.Blaze3D = { mount: mount, preload: load };
})(window);
