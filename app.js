/* 3DBlaze storefront + order manager */
(function () {
  'use strict';

  // ---------- self-update: never leave a visitor on an old version ----------
  // Checks the live page on load, when the tab comes back to the front, and every 5 min.
  // If a newer version is live, reloads (or, during checkout, shows a "tap to update" bar so nothing typed is lost).
  (function () {
    try {
      var me = [].slice.call(document.scripts).filter(function (s) { return /\/app\.js/.test(s.src); })[0];
      var mine = me && (me.src.match(/[?&]v=([^&]+)/) || [])[1];
      if (!mine || !window.fetch || location.protocol === 'file:') return;
      var busy = false, last = 0;
      var bar = function () {
        if (document.getElementById('blzUpd')) return;
        var b = document.createElement('button'); b.id = 'blzUpd'; b.type = 'button';
        b.textContent = 'A new version of the site is ready — tap to update';
        b.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;background:#0B1220;color:#fff;border:0;border-radius:999px;padding:12px 18px;font:600 14px/1.2 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer;max-width:92vw';
        b.onclick = function () { location.reload(); };
        document.body.appendChild(b);
      };
      var check = function () {
        var now = Date.now(); if (busy || now - last < 30000) return; busy = true; last = now;
        fetch(location.pathname + '?nc=' + now, { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
          busy = false;
          var live = (html.match(/app\.js\?v=([^"&]+)/) || [])[1];
          if (!live || live === mine) return;
          var k = 'blz_upd_' + live, done = null;
          try { done = sessionStorage.getItem(k); } catch (e) {}
          var typing = /^#(checkout|cart)/.test(location.hash) || (document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName));
          if (done || typing) { bar(); return; }
          try { sessionStorage.setItem(k, '1'); } catch (e) {}
          location.reload();
        }).catch(function () { busy = false; });
      };
      check();
      document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
      window.addEventListener('pageshow', function (e) { if (e.persisted) check(); });
      window.addEventListener('focus', check);
      setInterval(function () { if (!document.hidden) check(); }, 300000);
    } catch (e) {}
  })();

  // ---------- catalog (defaults; admin can override price / availability / photos) ----------
  var CATALOG = [
    { id: 'flag-keychain', col: 'lebanon', name: 'Lebanese Flag Keychain', price: 4, tag: 'Bestseller', printMin: 24,
      blurb: 'Red, white and cedar green, on your keys every day.',
      desc: 'Our Lebanese flag in three real colours of PLA, printed in one go so the cedar sits flush in the white band. Light, tough and made to be carried.',
      specs: ['About 6 × 4 cm', '3-colour print, no paint, no stickers', 'Metal key ring included'] },
    { id: 'flag-3pack', art: 'flag-keychain', col: 'lebanon', name: 'Flag Keychain — Pack of 3', price: 10, was: 12, tag: 'Save $2', printMin: 72,
      blurb: 'One for you, two to give.',
      desc: 'Three Lebanese flag keychains for the family, the car keys and the friend abroad. Perfect for 22 November.',
      specs: ['3 keychains, about 6 × 4 cm each', 'Metal key rings included', 'Great for diaspora gifts'] },
    { id: 'my-village', col: 'lebanon', name: '“My Village” Desk Map', price: 15, tag: 'Personalized', printMin: 150,
      colors: ['black'], text: { label: 'Your village or town', max: 18, ph: 'e.g. Hadchit', required: true },
      blurb: 'Lebanon in 3D, with your village on it.',
      desc: 'A raised map of Lebanon standing on a base with your village name printed in. We place a green pin where your village is. A desk piece that starts conversations.',
      specs: ['About 15 cm tall', 'Your village name in English and Arabic, with its elevation, on the base', 'Green pin placed on your village', 'Black base, white map'] },

    { id: 'name-ornament', col: 'xmas', name: 'Personalized Name Ornament', price: 7, tag: 'Personalized', printMin: 40,
      colors: ['red', 'green', 'white'], text: { label: 'Name on the ornament', max: 10, ph: 'e.g. Maria', required: true },
      blurb: 'A name for every branch of the tree.',
      desc: 'A round ornament with a name and the year, printed in two colours. Order one for each person in the family.',
      specs: ['About 7 cm across', 'Name up to 10 letters + “2026”', 'Gold string included'] },
    { id: 'cedar-ornament', col: 'xmas', name: 'Cedar Tree Ornament', price: 6, tag: 'New', printMin: 36,
      colors: ['green', 'red', 'white'],
      blurb: 'The cedar, hanging on your Christmas tree.',
      desc: 'Our own cedar design, made to hang. A little Lebanon on the tree this year.',
      specs: ['About 8 cm tall', 'Choose green, red or white', 'Gold string included'] },
    { id: 'snowflake-set', col: 'xmas', name: 'Snowflake Set of 3', price: 9, printMin: 60,
      blurb: 'Three different flakes, light as anything.',
      desc: 'Three snowflake ornaments in three sizes. Hang them on the tree, a window or the gift wrap.',
      specs: ['3 pieces: 6, 7 and 8 cm', 'White PLA', 'Strings included'] },
    { id: 'star-topper', col: 'xmas', name: 'Blaze Star Tree Topper', price: 14, printMin: 180,
      blurb: 'The top of the tree, with a spark.',
      desc: 'A bold red star with our lightning bolt, on a spring that grips the top of the tree.',
      specs: ['About 15 cm wide', 'Fits most tree tops', 'Red + white'] },
    { id: 'mini-nativity', col: 'xmas', name: 'Mini Nativity Scene', price: 22, tag: 'Limited', printMin: 300,
      blurb: 'The crib, small enough for a shelf.',
      desc: 'A simple, modern nativity: stable, Mary, Joseph and the Child under the star. Pieces stand on their own.',
      specs: ['Stable about 12 cm wide', '5 pieces', 'Limited number before Christmas'] },
    { id: 'gift-bundle', col: 'xmas', name: 'Christmas Gift Bundle', price: 15, was: 17, tag: 'Save $2', printMin: 100,
      text: { label: 'Name for the ornament', max: 10, ph: 'e.g. Elie', required: true },
      blurb: 'Flag keychain + cedar ornament + name ornament, boxed.',
      desc: 'Our three favourites in one gift box: a Lebanese flag keychain, a cedar ornament and a personalized name ornament.',
      specs: ['3 pieces in a gift box', 'Name on the ornament up to 10 letters', 'Ready to give'] }
  ];
  var COLOR_HEX = { black: '#30343B', white: '#F2F3F5', red: '#E2262B', green: '#1FA14E', orange: '#FF6A1F' };
  var STATUSES = [
    { k: 'new', l: 'New' }, { k: 'confirmed', l: 'Confirmed' }, { k: 'printing', l: 'Printing' },
    { k: 'ready', l: 'Ready' }, { k: 'out', l: 'Out for delivery' }, { k: 'delivered', l: 'Delivered' }, { k: 'cancelled', l: 'Cancelled' }
  ];
  var CUSTOMER_STEPS = [
    { k: 'new', l: 'Order received', d: 'We got it and will confirm on WhatsApp.' },
    { k: 'confirmed', l: 'Confirmed', d: 'Your order is in the print queue.' },
    { k: 'printing', l: 'Printing', d: 'Your piece is on our printer now.' },
    { k: 'ready', l: 'Ready', d: 'Checked, packed and waiting for the driver.' },
    { k: 'out', l: 'Out for delivery', d: 'On its way to you.' },
    { k: 'delivered', l: 'Delivered', d: 'Enjoy it!' }
  ];
  var REGIONS = [
    ['Beirut', 'beirut'], ['Metn', 'mount'], ['Baabda', 'mount'], ['Aley', 'mount'], ['Chouf', 'mount'],
    ['Keserwan', 'mount'], ['Jbeil (Byblos)', 'mount'], ['North (Tripoli, Batroun, Koura, Zgharta)', 'other'],
    ['Akkar', 'other'], ['South (Saida, Tyre, Jezzine)', 'other'], ['Nabatieh', 'other'],
    ['Bekaa (Zahle, West Bekaa)', 'other'], ['Baalbek-Hermel', 'other']
  ];
  var DEFAULT_SETTINGS = {
    whatsapp: '96178801186', whish: '', whishName: '3DBlaze', instagram: '3dblaze.lb',
    feeBeirut: 3, feeMount: 3, feeOther: 5, freeOver: 40, pickup: true, open: true,
    banner: '🇱🇧 Independence Day drop is live — order by 19 Nov for delivery before the 22nd',
    xmasCutoff: '2026-12-18',
    calcPla: 25, calcMachine: 0.35, calcPack: 0.25, calcFail: 10, calcMarkup: 3, calcMin: 5, calcInfill: 15, calcGph: 15
  };

  // ---------- utils ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(v) { v = Math.round((+v || 0) * 100) / 100; return '$' + (v % 1 === 0 ? v : v.toFixed(2)); }
  function ls(k, v) {
    try { if (v === undefined) { var s = localStorage.getItem('3db:' + k); return s ? JSON.parse(s) : null; } localStorage.setItem('3db:' + k, JSON.stringify(v)); } catch (e) { mem[k] = v; return v === undefined ? (mem[k] || null) : null; }
  }
  var mem = {};
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200); }
  function fmtDate(t) { var d = new Date(t); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  function newCode() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; var r = new Uint32Array(5); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(r) : r.forEach(function (_, i) { r[i] = Math.random() * 1e9; }); for (var i = 0; i < 5; i++) s += a[r[i] % a.length]; return '3DB-' + s; }
  function waLink(num, text) { num = String(num || '').replace(/\D/g, ''); if (num && num.length <= 8) num = '961' + num.replace(/^0/, ''); return 'https://wa.me/' + num + '?text=' + encodeURIComponent(text); }
  function copy(text, ok) {
    try { navigator.clipboard.writeText(text).then(function () { toast(ok || 'Copied'); }, function () { fallbackCopy(text, ok); }); } catch (e) { fallbackCopy(text, ok); }
  }
  function fallbackCopy(text, ok) { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast(ok || 'Copied'); } catch (e) { toast('Select and copy manually'); } ta.remove(); }
  function modal(html, onMount) {
    var m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = '<div class="box"><button class="x" aria-label="Close">✕</button>' + html + '</div>';
    document.body.appendChild(m); document.body.style.overflow = 'hidden';
    var close = function () { m.remove(); document.body.style.overflow = ''; };
    m.addEventListener('click', function (e) { if (e.target === m || e.target.classList.contains('x')) close(); });
    if (onMount) onMount(m.querySelector('.box'), close);
    return close;
  }
  function confirmBox(msg, yes, cb) {
    modal('<h3 style="font-size:18px;margin:0 40px 12px 0">' + esc(msg) + '</h3><div class="actions" style="margin-top:20px"><button class="btn pri" data-y>' + esc(yes) + '</button><button class="btn sec" data-n>Keep it</button></div>', function (box, close) {
      box.querySelector('[data-y]').onclick = function () { close(); cb(); };
      box.querySelector('[data-n]').onclick = close;
    });
  }
  function resizeImage(file, max, cb) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function () { toast('Can’t open this photo — save it as JPG or PNG (iPhone: Settings → Camera → Most Compatible) and try again'); };
      img.src = r.result;
    };
    r.onerror = function () { toast('Can’t read this file — try another photo'); };
    r.readAsDataURL(file);
  }

  // ---------- data store: demo (this browser) or live (Firebase) ----------
  var Store = (function () {
    var cfg = window.BLAZE_FIREBASE, live = !!(cfg && cfg.apiKey);
    var state = { overrides: {}, extra: {}, settings: Object.assign({}, DEFAULT_SETTINGS), orders: {}, requests: {}, user: null };
    var subs = [], rev = 0, got = { products: false, extra: false, settings: false }, offline = false, cacheT = null;
    function emit() { subs.forEach(function (f) { f(); }); }
    // Shop data (products / extra products / settings) is cached on the device so returning visitors see the
    // real shop instantly; live data then only redraws the page if something actually changed.
    function setShop(field, key, val) {
      var same = got[key] && JSON.stringify(state[field]) === JSON.stringify(val);
      state[field] = val; got[key] = true; if (!same) rev++;
      clearTimeout(cacheT); cacheT = setTimeout(function () { if (got.products && got.extra && got.settings) ls('shopCache', { overrides: state.overrides, extra: state.extra, settings: state.settings }); }, 400);
      emit();
    }
    function useCache() {
      var c = ls('shopCache'); if (!c || !c.settings) return false;
      state.overrides = c.overrides || {}; state.extra = c.extra || {}; state.settings = Object.assign({}, DEFAULT_SETTINGS, c.settings);
      got.products = got.extra = got.settings = true; rev++; return true;
    }
    var fb = null;

    function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }

    function init() {
      if (!live) {
        state.overrides = ls('overrides') || {}; state.extra = ls('extra') || {};
        state.settings = Object.assign({}, DEFAULT_SETTINGS, ls('settings') || {});
        state.orders = ls('orders') || {};
        state.requests = ls('requests') || {};
        state.user = ls('demoAdmin') ? { email: 'demo' } : null;
        window.addEventListener('storage', function () { state.orders = ls('orders') || {}; emit(); });
        return Promise.resolve();
      }
      if (!window.BLAZE_ADMIN) useCache();
      var v = '10.12.2', base = 'https://www.gstatic.com/firebasejs/' + v + '/';
      return loadScript(base + 'firebase-app-compat.js')
        .then(function () { return Promise.all([loadScript(base + 'firebase-database-compat.js'), loadScript(base + 'firebase-auth-compat.js')]); })
        .then(function () {
          firebase.initializeApp(cfg); fb = firebase.database();
          fb.ref('products').on('value', function (s) { setShop('overrides', 'products', s.val() || {}); });
          fb.ref('extraProducts').on('value', function (s) { setShop('extra', 'extra', s.val() || {}); });
          fb.ref('settings').on('value', function (s) { setShop('settings', 'settings', Object.assign({}, DEFAULT_SETTINGS, s.val() || {})); });
          var ordersRef = null;
          firebase.auth().onAuthStateChanged(function (u) {
            state.user = u ? { email: u.email, uid: u.uid } : null;
            if (ordersRef) { ordersRef.off(); ordersRef = null; state.orders = {}; fb.ref('requests').off(); state.requests = {}; }
            if (u) { ordersRef = fb.ref('orders'); ordersRef.on('value', function (s) { state.orders = s.val() || {}; emit(); }, function () { state.orders = {}; emit(); });
              fb.ref('requests').on('value', function (s) { state.requests = s.val() || {}; emit(); }, function () { state.requests = {}; emit(); }); }
            emit();
          });
        })
        .catch(function () {
          if (window.BLAZE_ADMIN) { live = false; toast('Could not reach the server — showing demo mode'); return init(); }
          // Customers: never fall back to demo mode (orders would only be saved on their phone). Show the shop
          // from the device cache / defaults; placing an order then shows a WhatsApp fallback.
          offline = true; got.products = got.extra = got.settings = true; rev++;
        });
    }

    function products() {
      var list = CATALOG.map(function (p) { return Object.assign({}, p, state.overrides[p.id] || {}); });
      Object.keys(state.extra || {}).forEach(function (k) { var e = state.extra[k]; if (e && e.name) list.push(Object.assign({ id: k, col: 'lebanon', price: 0, specs: [] }, e, state.overrides[k] || {})); });
      return list.filter(function (p) { return !p.removed; });
    }

    return {
      get live() { return live; },
      ready: function () { return !live || (got.products && got.extra && got.settings); },
      get offline() { return offline; },
      rev: function () { return rev; },
      init: init, on: function (f) { subs.push(f); },
      products: products,
      product: function (id) { return products().filter(function (p) { return p.id === id; })[0]; },
      settings: function () { return state.settings; },
      orders: function () { return Object.keys(state.orders).map(function (k) { return state.orders[k]; }).filter(Boolean).sort(function (a, b) { return b.createdAt - a.createdAt; }); },
      user: function () { return state.user; },
      requests: function () { return Object.keys(state.requests).map(function (k) { return Object.assign({ id: k }, state.requests[k]); }).sort(function (a, b) { return b.createdAt - a.createdAt; }); },
      saveRequest: function (id, data) {
        id = id || 'R' + Date.now().toString(36).toUpperCase();
        if (!live) { state.requests[id] = Object.assign(state.requests[id] || {}, data); ls('requests', state.requests); emit(); return Promise.resolve(id); }
        return fb.ref('requests/' + id).update(data).then(function () { return id; });
      },
      deleteRequest: function (id) {
        if (!live) { delete state.requests[id]; ls('requests', state.requests); emit(); return Promise.resolve(); }
        return fb.ref('requests/' + id).remove();
      },

      placeOrder: function (o) {
        var track = { status: o.status, total: o.total, paid: false, payment: o.payment, createdAt: o.createdAt, updatedAt: o.createdAt, items: o.items.reduce(function (n, i) { return n + i.qty; }, 0) };
        if (!live) {
          state.orders[o.code] = o; ls('orders', state.orders);
          var tr = ls('tracking') || {}; tr[o.code] = track; ls('tracking', tr); emit(); return Promise.resolve(o);
        }
        if (offline || !fb) return Promise.reject(new Error('offline'));
        return fb.ref('orders/' + o.code).set(o).then(function () { return fb.ref('tracking/' + o.code).set(track); }).then(function () { return o; });
      },
      track: function (code) {
        if (!live) { var tr = ls('tracking') || {}; return Promise.resolve(tr[code] || null); }
        return fb.ref('tracking/' + code).once('value').then(function (s) { return s.val(); });
      },
      updateOrder: function (code, patch) {
        var o = state.orders[code]; if (!o) return Promise.reject();
        var now = Date.now();
        if (patch.status && patch.status !== o.status) patch.history = (o.history || []).concat([{ s: patch.status, t: now }]);
        var tpatch = { updatedAt: now };
        if ('status' in patch) tpatch.status = patch.status;
        if ('paid' in patch) tpatch.paid = patch.paid;
        if (!live) {
          Object.assign(o, patch); ls('orders', state.orders);
          var tr = ls('tracking') || {}; tr[code] = Object.assign(tr[code] || {}, tpatch); ls('tracking', tr); emit(); return Promise.resolve();
        }
        return fb.ref('orders/' + code).update(patch).then(function () { return fb.ref('tracking/' + code).update(tpatch); });
      },
      saveProduct: function (id, patch) {
        if (!live) { state.overrides[id] = Object.assign(state.overrides[id] || {}, patch); ls('overrides', state.overrides); emit(); return Promise.resolve(); }
        return fb.ref('products/' + id).update(patch);
      },
      addProduct: function (p) {
        var id = 'p' + Date.now().toString(36);
        if (!live) { state.extra[id] = p; ls('extra', state.extra); emit(); return Promise.resolve(id); }
        return fb.ref('extraProducts/' + id).set(p).then(function () { return id; });
      },
      saveSettings: function (s) {
        if (!live) { state.settings = Object.assign({}, state.settings, s); ls('settings', state.settings); emit(); return Promise.resolve(); }
        return fb.ref('settings').update(s);
      },
      login: function (email, pass) {
        if (!live) { if (pass === 'blaze2026') { state.user = { email: 'demo' }; ls('demoAdmin', true); emit(); return Promise.resolve(); } return Promise.reject(new Error('Wrong passcode')); }
        var p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
        return firebase.auth().signInWithPopup(p).then(function (r) { if (!r.user || r.user.email !== '3dbllaze@gmail.com') { firebase.auth().signOut(); throw new Error('Not the shop account'); } });
      },
      logout: function () { if (!live) { state.user = null; ls('demoAdmin', false); emit(); return; } firebase.auth().signOut(); },
      seedDemo: function () {
        if (live) return;
        var now = Date.now(), H = 3600e3;
        var mk = function (code, ago, name, phone, region, town, items, pay, status, paid) {
          var sub = items.reduce(function (n, i) { return n + i.price * i.qty; }, 0), del = region === 'Beirut' || region === 'Metn' ? 3 : 5;
          return { code: code, demo: true, createdAt: now - ago * H, status: status, paid: paid, payment: pay, method: 'delivery',
            customer: { name: name, phone: phone, region: region, town: town, address: 'Near the church, 2nd floor', notes: '' },
            items: items, subtotal: sub, delivery: del, total: sub + del, history: [{ s: 'new', t: now - ago * H }] };
        };
        var it = function (id, qty, color, text) { var p = CATALOG.filter(function (x) { return x.id === id; })[0]; return { id: id, name: p.name, price: p.price, qty: qty, color: color || null, text: text || null }; };
        [
          mk('3DB-DEMO1', 1, 'Rita K.', '70123456', 'Metn', 'Jdeideh', [it('my-village', 1, 'black', 'Bikfaya'), it('flag-keychain', 2)], 'whish', 'new', false),
          mk('3DB-DEMO2', 5, 'Georges H.', '03987654', 'Keserwan', 'Jounieh', [it('name-ornament', 4, 'red', 'Elie'), it('cedar-ornament', 2, 'green')], 'cash', 'confirmed', false),
          mk('3DB-DEMO3', 26, 'Maya S.', '76111222', 'Beirut', 'Achrafieh', [it('flag-3pack', 1)], 'cash', 'printing', false),
          mk('3DB-DEMO4', 50, 'Charbel A.', '71333444', 'North (Tripoli, Batroun, Koura, Zgharta)', 'Batroun', [it('my-village', 1, 'black', 'Hadchit')], 'whish', 'delivered', true)
        ].forEach(function (o) { state.orders[o.code] = o; });
        ls('orders', state.orders); emit();
      },
      clearDemo: function () { if (live) return; Object.keys(state.orders).forEach(function (k) { if (state.orders[k].demo) delete state.orders[k]; }); ls('orders', state.orders); emit(); }
    };
  })();

  // ---------- cart ----------
  var Cart = {
    items: ls('cart') || [],
    save: function () { ls('cart', this.items); var cc = $('#cartCount'); if (cc) cc.textContent = this.count(); },
    count: function () { return this.items.reduce(function (n, i) { return n + i.qty; }, 0); },
    add: function (p, qty, color, text, geo) {
      if (!p || p.col === 'xmas') return;
      var key = p.id + '|' + (color || '') + '|' + (text || '');
      var ex = this.items.filter(function (i) { return i.key === key; })[0];
      if (ex) ex.qty += qty; else this.items.push({ key: key, id: p.id, qty: qty, color: color || null, text: text || null, geo: geo || null });
      this.save();
    },
    lines: function () {
      return this.items.map(function (i) { var p = Store.product(i.id); return p && p.col !== 'xmas' ? Object.assign({}, i, { p: p, total: p.price * i.qty }) : null; }).filter(Boolean);
    },
    subtotal: function () { return this.lines().reduce(function (n, l) { return n + l.total; }, 0); },
    clear: function () { this.items = []; this.save(); }
  };

  // product options (e.g. colours), each with its own photo — set in the manager
  function optList(p) {
    var o = p && p.options; if (!o) return [];
    if (!Array.isArray(o)) o = Object.keys(o).sort(function (a, b) { return a - b; }).map(function (k) { return o[k]; });
    return o.filter(function (x) { return x && x.name; });
  }
  function optFor(p, name) { return name ? optList(p).filter(function (o) { return o.name === name; })[0] : null; }
  function allOptsOut(p) { var l = optList(p); return l.length > 0 && l.every(function (o) { return o.out; }); }
  function thumb(p, opts) {
    var so = opts && opts.color ? optFor(p, opts.color) : null;
    if (so && so.photo) return '<img src="' + so.photo + '" alt="' + esc(p.name + ' — ' + so.name) + '">';
    if (p.photo) return '<img src="' + p.photo + '" alt="' + esc(p.name) + '">';
    var fo = (p.art || p.id) === 'my-village' ? null : optList(p).filter(function (o) { return o.photo; })[0];
    if (fo) return '<img src="' + fo.photo + '" alt="' + esc(p.name) + '">';
    if ((p.art || p.id) === 'my-village' && (!opts || !opts.text)) return '<img src="img/my-village.jpg" alt="' + esc(p.name) + ' — real printed piece">';
    if ((p.art || p.id) === 'my-village' && window.BlazeArt) return '<div class="mapart">' + BlazeArt.draw('my-village', opts) + '</div>';
    return '<div class="ph"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="13" width="36" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M17 13 l3-5 h8 l3 5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="26" r="7" fill="none" stroke="currentColor" stroke-width="2.5"/></svg><span>' + esc(p.name) + '</span><small>Photo coming soon</small></div>';
  }
  function fee(region) {
    var s = Store.settings(), g = (REGIONS.filter(function (r) { return r[0] === region; })[0] || [0, 'other'])[1];
    return g === 'beirut' ? +s.feeBeirut : g === 'mount' ? +s.feeMount : +s.feeOther;
  }

  // cost of one piece from its print data (grams + minutes)
  function pieceCost(grams, minutes) {
    if (grams == null && minutes == null) return null;
    var S = Store.settings(), base = (+grams || 0) * S.calcPla / 1000 + (+minutes || 0) / 60 * S.calcMachine + (+S.calcPack || 0);
    return Math.round(base * (1 + S.calcFail / 100) * 100) / 100;
  }
  function orderCost(o) {
    var c = 0, known = true;
    o.items.forEach(function (i) {
      if (i.id === 'design') return;
      var u = i.unitCost != null ? i.unitCost : (function () { var p = Store.product(i.id); return p && p.grams != null ? pieceCost(p.grams, p.printMin) : null; })();
      if (u == null) known = false; else c += u * i.qty;
    });
    return known ? Math.round(c * 100) / 100 : null;
  }


  // ---------- town lookup (OpenStreetMap) for the village pin ----------
  var Geo = {
    cache: ls('geo2') || {}, t: null, seq: 0, eleC: ls('ele') || {},
    find: function (q, cb) {
      q = (q || '').trim(); var key = q.toLowerCase();
      clearTimeout(this.t);
      if (q.length < 3) { cb(null, q.length ? 'typing' : ''); return; }
      if (this.cache[key] !== undefined) { cb(this.cache[key], this.cache[key] ? 'found' : 'none'); return; }
      cb(null, 'searching');
      var self = this, my = ++this.seq;
      this.t = setTimeout(function () {
        fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=lb&limit=3&accept-language=en&namedetails=1&q=' + encodeURIComponent(q))
          .then(function (r) { return r.json(); })
          .then(function (res) {
            if (my !== self.seq) return;
            var hit = null;
            (res || []).some(function (x) { var la = +x.lat, lo = +x.lon; if (BlazeArt.inLebanon(la, lo)) { var nd = x.namedetails || {}, ar = nd['name:ar'] || (/[\u0600-\u06FF]/.test(nd.name || '') ? nd.name : ''); hit = { lat: la, lon: lo, label: (x.display_name || '').split(',').slice(0, 3).join(','), ar: ar || null }; return true; } return false; });
            self.cache[key] = hit; ls('geo2', self.cache); cb(hit, hit ? 'found' : 'none');
            if (hit && hit.ele == null) self.elev(hit.lat, hit.lon, function (e) { if (e == null) return; hit.ele = e; ls('geo2', self.cache); if (my === self.seq) cb(hit, 'found'); });
          }).catch(function () { if (my === self.seq) cb(null, 'offline'); });
      }, 650);
    },
    // elevation at the pin (Open-Meteo, Copernicus 90 m DEM), rounded: under 100 m to 5 m, else to 10 m
    elev: function (lat, lon, cb) {
      var k = lat.toFixed(4) + ',' + lon.toFixed(4), self = this;
      if (this.eleC[k] != null) { cb(this.eleC[k]); return; }
      fetch('https://api.open-meteo.com/v1/elevation?latitude=' + lat.toFixed(5) + '&longitude=' + lon.toFixed(5)).then(function (r) { return r.json(); }).then(function (j) {
        var e = j && j.elevation && j.elevation[0]; if (e == null || !isFinite(e)) { cb(null); return; }
        e = Math.max(0, e < 100 ? Math.round(e / 5) * 5 : Math.round(e / 10) * 10);
        self.eleC[k] = e; ls('ele', self.eleC); cb(e);
      }).catch(function () { cb(null); });
    },
    status: function (hit, st) {
      return st === 'searching' ? '<span class="muted">Finding it on the map…</span>' :
        st === 'found' ? '<span style="color:var(--green)">📍 ' + esc(hit.label) + (hit.ele != null ? ' · ' + hit.ele + ' m' : '') + '</span>' :
        st === 'none' ? '<span class="muted">We couldn’t find it on the map — no problem, we’ll place the pin by hand.</span>' :
        st === 'offline' ? '<span class="muted">Map search is unavailable right now — we’ll place the pin by hand.</span>' : '';
    }
  };

  // ---------- views ----------
  var app = $('#app');

  // ---------- motion: scroll reveals, floating section tabs, header on scroll ----------
  var Motion = (function () {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
    var SEL = '.hero .grid > div, .stage, .sechead, .pcard, .step, .faq details, .panel, .countdown, .cd, .ppage > *, .soon-badge';
    function scan() {
      if (window.BLAZE_ADMIN) return;
      var groups = {};
      $$(SEL, app).forEach(function (el) {
        if (el.classList.contains('rv')) return;
        el.classList.add('rv');
        var p = el.parentNode, k = p ? (p.__rvk || (p.__rvk = Math.random())) : 0;
        var i = groups[k] = (groups[k] || 0) + 1;
        el.style.transitionDelay = Math.min(i - 1, 6) * 70 + 'ms';
        if (reduce || !io) el.classList.add('in'); else io.observe(el);
      });
    }
    // floating section tabs
    var bar = document.createElement('nav');
    bar.className = 'sectabs'; bar.setAttribute('aria-label', 'Sections');
    bar.innerHTML = [['shop', 'Lebanon drop'], ['christmas', 'Christmas'], ['how', 'How it works'], ['faq', 'FAQ']].map(function (t) { return '<a href="#' + (t[0] === 'how' ? 'home' : t[0]) + '" data-sec="' + t[0] + '">' + t[1] + '</a>'; }).join('');
    if (!window.BLAZE_ADMIN) document.body.appendChild(bar);
    $$('a', bar).forEach(function (a) { a.addEventListener('click', function (e) { var el = $('#sec-' + a.dataset.sec); if (el) { e.preventDefault(); el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); } }); });
    var head = $('header.top'), prog = document.createElement('div'); prog.className = 'scrollprog'; document.body.appendChild(prog);
    var ticking = false;
    function onScroll() {
      ticking = false;
      var y = window.scrollY || 0;
      var home = !window.BLAZE_ADMIN && $('#sec-shop');
      if (head) head.classList.toggle('scrolled', y > 10);
      $$('.rv:not(.in)', app).forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); });
      var hero = $('.hero');
      var on = !!home && !!hero && y > hero.offsetHeight - 120; bar.classList.toggle('show', on); document.body.classList.toggle('tabs-on', on);
      var max = document.documentElement.scrollHeight - innerHeight;
      prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      if (home) {
        var cur = null;
        ['shop', 'christmas', 'how', 'faq'].forEach(function (k) { var el = $('#sec-' + k); if (el && el.getBoundingClientRect().top < 160) cur = k; });
        $$('a', bar).forEach(function (a) { a.classList.toggle('on', a.dataset.sec === cur); });
      }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    new MutationObserver(function () { scan(); onScroll(); }).observe(app, { childList: true });
    return { scan: scan };
  })();

  function card(p) {
    var out = p.soldOut || p.available === false || allOptsOut(p);
    return '<a class="pcard" href="#p-' + p.id + '"><div class="art">' + thumb(p) +
      (out ? '<span class="tag out">Sold out</span>' : p.tag ? '<span class="tag">' + esc(p.tag) + '</span>' : '') +
      '</div><div class="info"><h3>' + esc(p.name) + '</h3><div class="muted" style="font-size:14px">' + esc(p.blurb || '') + '</div>' +
      '<div class="row"><span class="price">' + money(p.price) + (p.was ? '<s>' + money(p.was) + '</s>' : '') + '</span><span class="add">' + (out ? 'View' : 'Order') + '</span></div></div></a>';
  }

  function viewHome(anchor) {
    var s = Store.settings(), all = Store.products();
    var leb = all.filter(function (p) { return p.col === 'lebanon'; }), xm = all.filter(function (p) { return p.col === 'xmas'; });
    var vp = leb.filter(function (p) { return (p.art || p.id) === 'my-village'; })[0], others = leb.filter(function (p) { return p !== vp; });
    var fee = (s.feeMount === s.feeBeirut ? money(s.feeBeirut) + ' in Beirut &amp; Mount Lebanon' : money(s.feeBeirut) + ' in Beirut, ' + money(s.feeMount) + ' in Mount Lebanon') + ', ' + money(s.feeOther) + ' elsewhere' + (s.freeOver ? ', free over ' + money(s.freeOver) : '');
    app.innerHTML =
      '<section class="hero2"><div class="wrap">' +
        '<h1>Ideas you can <span class="bl">hold</span>.</h1>' +
        '<p class="lead">3D printed gifts, made to order on our own printers and delivered anywhere in Lebanon.</p>' +
        '<div class="hcta"><a class="btn pri" href="#shop">Shop now</a>' + (vp ? '<a class="btn sec" href="#make">Make my village</a>' : '') + '</div>' +
        '<div class="trust"><span>✓ Cash on delivery</span><span>✓ Whish accepted</span><span>✓ Ready in 2–4 days</span><span class="dk">✓ Delivery all over Lebanon</span></div>' +
      '</div></section>' +

      '<section class="blk2" id="sec-shop"><div class="wrap">' +
        '<div class="shead"><h2>Lebanon drop</h2><span class="muted">' + leb.length + ' piece' + (leb.length === 1 ? '' : 's') + '</span></div>' +
        '<div class="pgrid">' + (vp ? villageFeature(vp) : '') + others.map(card2).join('') + (vp ? villageCompact(vp) : '') + '</div>' +
        '<div class="cdline" id="countdown"></div>' +
      '</div></section>' +

      (xm.length ? '<section class="blk2" id="sec-christmas"><div class="wrap"><div class="shead"><h2>Christmas collection</h2><span class="soonlbl">Coming soon</span></div>' +
        '<div class="xrow" role="list">' + xm.map(function (p) { return '<a class="xc" role="listitem" href="#p-' + p.id + '"><div class="xc-img">' + thumb(p) + '</div><b>' + esc(p.name) + '</b><span>' + money(p.price) + '</span></a>'; }).join('') + '</div></div></section>' : '') +

      '<section class="blk2" id="sec-how"><div class="wrap"><div class="shead"><h2>How it works</h2></div><div class="steps2">' +
        step2(1, 'Pick', 'A piece and a colour') + step2(2, 'Confirm', 'We WhatsApp you') + step2(3, 'Print', 'Ready in 2–4 days') + step2(4, 'Deliver', 'Cash or Whish') +
        '</div><p class="feeline">Delivery ' + fee + '.' + (s.pickup ? ' Pickup available.' : '') + ' Pay the driver in cash, or by Whish with your order code.</p>' +
        '<form class="trackbox" id="homeTrack"><div><h3>Track your order</h3><p class="muted">Type the code you got when you ordered (3DB-XXXXX).</p></div><div class="trackin"><input name="code" placeholder="3DB-XXXXX" aria-label="Order code" autocomplete="off"><button class="btn pri" type="submit">Track</button></div></form>' +
      '</div></section>' +

      '<section class="blk2" id="sec-faq"><div class="wrap"><div class="shead"><h2>Questions</h2></div><div class="faq faq2">' +
        faq('How long does it take?', 'Most orders are printed in 2–4 days, then delivered within 1–2 days. Personalized pieces are printed one by one, so order early for 22 November and Christmas.') +
        faq('Where do you deliver?', 'All over Lebanon through our delivery partner. Delivery is ' + fee + '.') +
        faq('How do I pay?', 'Cash to the driver on delivery, or Whish Money. If you choose Whish, the payment details appear right after you order.') +
        faq('What is it made of?', 'PLA, a plant-based plastic. It is strong and light, but keep it away from high heat like a car dashboard in summer.') +
        faq('Can I order something custom?', 'Custom designs are coming soon. For now, send us a message on Instagram @' + esc(s.instagram) + ' and we will tell you what we can do.') +
        faq('Where is my order?', 'Use <a href="#track" style="color:var(--accent2)">Track order</a> with the code you got when you ordered (it looks like 3DB-XXXXX).') +
      '</div></div></section>';

    countdown();
    $$('[data-q]').forEach(function (b) { b.onclick = function (e) { e.preventDefault(); quickAdd(b.dataset.q, b); }; });
    var ht = $('#homeTrack'), lastO = ls('lastOrder'); if (lastO) ht.code.value = lastO.code;
    ht.onsubmit = function (e) { e.preventDefault(); var c = ht.code.value.trim().toUpperCase().replace(/\s/g, ''); location.hash = c ? 'track-' + c : 'track'; };
    var hi = $('#heroInput');
    if (hi) {
      var hpos = null, live = BlazeArt.village($('#heroArt'), { text: 'Your village' });
      var hdraw = function () { live.set({ text: hi.value || 'Your village', lat: hpos && hpos.lat, lon: hpos && hpos.lon, ar: hpos && hpos.ar, ele: hpos && hpos.ele }); };
      // while nobody is typing, the preview tours a few villages so the pin keeps moving
      var DEMO = [['Hadchit', 34.2519, 35.9853, 'حدشيت'], ['Jbeil', 34.1230, 35.6519, 'جبيل'], ['Zahle', 33.8463, 35.9020, 'زحلة'], ['Tyre', 33.2705, 35.2038, 'صور'], ['Batroun', 34.2553, 35.6581, 'البترون'], ['Saida', 33.5630, 35.3688, 'صيدا'], ['Bcharre', 34.2508, 36.0106, 'بشري']];
      var demoEle = {}; DEMO.forEach(function (d) { Geo.elev(d[1], d[2], function (e) { demoEle[d[0]] = e; }); });
      var di = 0, demoT = null, demo = function () { if (hi.value || !document.body.contains(hi)) return; var d = DEMO[di++ % DEMO.length]; live.set({ text: d[0], lat: d[1], lon: d[2], ar: d[3], ele: demoEle[d[0]] }); demoT = setTimeout(demo, 2600); };
      setTimeout(demo, 700);
      hi.addEventListener('input', function () { clearTimeout(demoT); if (!hi.value) { hpos = null; hdraw(); $('#heroGeo').innerHTML = '<span class="muted">Type your village — the pin moves there.</span>'; demoT = setTimeout(demo, 2500); return; } hdraw(); Geo.find(hi.value, function (hit, st) { if (!document.body.contains(hi)) return; if (st !== 'searching') hpos = hit; hdraw(); $('#heroGeo').innerHTML = Geo.status(hit, st); }); });
      $('#heroGo').addEventListener('click', function () { ls('prefillVillage', hi.value); });
    }
    if (anchor) { var el = $('#sec-' + anchor); if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30); }
    else window.scrollTo(0, 0);
  }
  function villageFeature(p) {
    return '<div class="vfeat" id="sec-make"><div class="vprev"><div class="art mapart live" id="heroArt"></div></div><div class="vinfo">' +
      '<span class="ptag">Personalized</span><h3>' + esc(p.name) + '</h3>' +
      '<p>Type your village — the pin moves there. Its name in English and Arabic with the elevation, printed on the base.</p>' +
      '<div class="try"><input id="heroInput" maxlength="18" placeholder="Your village…" aria-label="Type your village"><a class="btn pri" id="heroGo" href="#p-' + p.id + '">Order · ' + money(p.price) + '</a></div>' +
      '<div class="geo" id="heroGeo"><span class="muted">Type your village — the pin moves there.</span></div>' +
      '<a class="vreal" href="#p-' + p.id + '">See the real piece →</a></div></div>';
  }
  function villageCompact(p) {
    return '<a class="vcomp" href="#p-' + p.id + '"><div class="vc-img">' + thumb(p) + '</div><div class="vc-txt"><span class="ptag">Personalized</span><b>' + esc(p.name) + '</b><span class="muted">Your village pinned, its name in English &amp; Arabic + elevation.</span><div class="vc-row"><b>' + money(p.price) + '</b><span>Personalize →</span></div></div></a>';
  }
  function pdots(p) {
    var ol = optList(p), list = ol.length ? ol.map(function (o) { return o.name; }) : (p.colors && p.colors.length > 1 ? p.colors : []);
    return list.length ? '<span class="dots" aria-label="' + esc(list.join(', ')) + '">' + list.slice(0, 5).map(function (c) { return '<i style="background:' + (COLOR_HEX[String(c).toLowerCase()] || '#D9DDE3') + '"></i>'; }).join('') + '</span>' : '';
  }
  function card2(p) {
    var out = p.soldOut || p.available === false || allOptsOut(p);
    return '<div class="pc"><div class="pc-media"><a class="pc-img" href="#p-' + p.id + '">' + thumb(p) +
      (out ? '<span class="tag out">Sold out</span>' : p.tag ? '<span class="tag">' + esc(p.tag) + '</span>' : '') + '</a>' +
      (out ? '' : '<button type="button" class="qadd" data-q="' + p.id + '" aria-label="Add ' + esc(p.name) + ' to cart">+</button>') + '</div>' +
      '<a class="pc-info" href="#p-' + p.id + '"><h3>' + esc(p.name) + '</h3><div class="pc-row"><span class="price">' + money(p.price) + (p.was ? '<s>' + money(p.was) + '</s>' : '') + '</span>' + pdots(p) + '</div></a></div>';
  }
  function quickAdd(id, btn) {
    var p = Store.product(id); if (!p) return;
    if (p.text && p.text.required) { location.hash = 'p-' + id; return; }
    var ol = optList(p).filter(function (o) { return !o.out; }), color = ol.length ? ol[0].name : (p.colors ? p.colors[0] : null);
    Cart.add(p, 1, color);
    toast('Added: ' + p.name + (color ? ' (' + color + ')' : '') + ' — tap the photo to pick another colour');
    if (btn) { btn.classList.add('ok'); btn.textContent = '✓'; setTimeout(function () { btn.classList.remove('ok'); btn.textContent = '+'; }, 1400); }
    var cb = $('.cartbtn'); if (cb) { cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump'); }
  }
  function step2(n, h, p) { return '<div class="st2"><b class="n">' + n + '</b><b>' + h + '</b><span>' + p + '</span></div>'; }
  function step(n, h, p) { return '<div class="step"><div class="n">' + n + '</div><h3>' + h + '</h3><p>' + p + '</p></div>'; }
  function faq(q, a) { return '<details><summary>' + q + '</summary><p>' + a + '</p></details>'; }

  var cdTimer;
  function countdown() {
    clearInterval(cdTimer);
    var s = Store.settings();
    var tick = function () {
      var el = $('#countdown'); if (!el) return clearInterval(cdTimer);
      var now = new Date(), indep = new Date('2026-11-22T00:00:00+02:00'), xmas = new Date('2026-12-25T00:00:00+02:00');
      var target, title, sub;
      if (now < indep) { target = indep; title = '<span class="flagbar"></span>Independence Day · 22 November'; sub = 'Order by 19 November to get it in time.'; }
      else { target = xmas; title = 'Christmas · 25 December'; sub = 'Order by ' + new Date(s.xmasCutoff).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) + ' for delivery before Christmas.'; }
      var d = Math.max(0, target - now), D = Math.floor(d / 864e5), H = Math.floor(d / 36e5) % 24, M = Math.floor(d / 6e4) % 60, S = Math.floor(d / 1e3) % 60;
      el.innerHTML = '<span class="cd-t">' + title + '</span><span class="cd-s muted">' + sub + '</span><span class="cd-n">' + D + 'd ' + H + 'h ' + (M < 10 ? '0' : '') + M + 'm ' + (S < 10 ? '0' : '') + S + 's</span>';
    };
    tick(); cdTimer = setInterval(tick, 1000);
  }

  function viewProduct(id) {
    var p = Store.product(id);
    if (!p) { app.innerHTML = '<div class="wrap page empty"><h1>Not found</h1><a class="btn pri" href="#shop">Back to the shop</a></div>'; return; }
    var soon = p.col === 'xmas';
    var ol = optList(p);
    var out = soon || p.soldOut || p.available === false || allOptsOut(p);
    var st = { color: ol.length ? (ol.filter(function (o) { return !o.out; })[0] || ol[0]).name : p.colors ? p.colors[0] : null, text: '', qty: 1 };
    if (p.id === 'my-village') st.text = ls('prefillVillage') || '';
    app.innerHTML = '<div class="wrap"><a class="back" href="#' + (p.col === 'xmas' ? 'christmas' : 'shop') + '">← Back</a><div class="ppage">' +
      '<div class="big" id="pArt"></div><div>' +
      '<div class="eyebrow">' + (p.col === 'xmas' ? 'Christmas 2026' : 'The Lebanon drop') + '</div>' +
      '<h1>' + esc(p.name) + '</h1><div class="price">' + money(p.price) + (p.was ? '<s>' + money(p.was) + '</s>' : '') + '</div>' +
      '<p style="color:#3A4352;font-size:17px;margin:16px 0 0">' + esc(p.desc || p.blurb || '') + '</p>' +
      (ol.length ? '<div class="opt"><span class="lab">' + esc(p.optLabel || 'Colour') + '</span><div class="swatches">' + ol.map(function (o) { return '<button class="sw osw' + (o.name === st.color ? ' on' : '') + '" data-c="' + esc(o.name) + '"' + (o.out ? ' disabled title="Sold out"' : '') + '>' + (o.photo ? '<img src="' + o.photo + '" alt="">' : '<i style="background:' + (COLOR_HEX[o.name.toLowerCase()] || '#D9DDE3') + '"></i>') + esc(o.name) + (o.out ? '<small>sold out</small>' : '') + '</button>'; }).join('') + '</div></div>' :
       p.colors && p.colors.length > 1 ? '<div class="opt"><span class="lab">Colour</span><div class="swatches">' + p.colors.map(function (c) { return '<button class="sw' + (c === st.color ? ' on' : '') + '" data-c="' + c + '"><i style="background:' + (COLOR_HEX[c] || c) + '"></i>' + c + '</button>'; }).join('') + '</div></div>' : '') +
      (p.text ? '<div class="opt"><label class="field">' + esc(p.text.label) + '<input id="pText" maxlength="' + p.text.max + '" placeholder="' + esc(p.text.ph) + '" value="' + esc(st.text) + '"></label><div class="err" id="pErr"></div></div>' : '') +
      '<div class="opt"><span class="lab">Quantity</span><div class="qty"><button data-q="-1" aria-label="Less">−</button><span id="pQty">1</span><button data-q="1" aria-label="More">+</button></div></div>' +
      '<div class="buyrow"><button class="btn pri" id="pAdd"' + (out ? ' disabled' : '') + '>' + (soon ? 'Coming soon' : out ? 'Sold out' : 'Add to cart') + '</button>' + (out ? '' : '<button class="btn sec" id="pBuy">Buy now</button>') + '</div>' +
      '<div class="specs">' + (p.specs || []).map(function (s) { return '<div>' + esc(s) + '</div>'; }).join('') + '<div>Made to order · ready in 2–4 days</div><div>Cash on delivery or Whish</div></div>' +
      '</div></div></div>';
    var isMapP = (p.art || p.id) === 'my-village', mlive = null;
    if (isMapP) {
      $('#pArt').classList.add('mapbig');
      $('#pArt').innerHTML = '<div class="mapart live" id="pLive"></div><img class="realph hidden" src="img/my-village.jpg" alt="Real printed My Village map"><div class="viewsw" role="group" aria-label="View"><button type="button" class="on" data-v="live">Your preview</button><button type="button" data-v="photo">Real photo</button></div>';
      mlive = BlazeArt.village($('#pLive'), { text: st.text || 'Your village' });
      $$('[data-v]').forEach(function (b) { b.onclick = function () { var ph = b.dataset.v === 'photo'; $$('[data-v]').forEach(function (x) { x.classList.toggle('on', x === b); }); $('#pLive').classList.toggle('hidden', ph); $('.realph').classList.toggle('hidden', !ph); }; });
    }
    var draw = function () {
      if (!document.getElementById('pArt')) return;   // customer already left this page (late map search)
      if (mlive) { if ($('#pLive').classList.contains('hidden') && st.text) $('[data-v=live]').click(); mlive.set({ text: st.text || 'Your village', ar: st.geo && st.geo.ar, ele: st.geo && st.geo.ele, lat: st.geo && st.geo.lat, lon: st.geo && st.geo.lon }); return; }
      $('#pArt').innerHTML = thumb(p, { color: st.color, text: st.text || undefined, lat: st.geo && st.geo.lat, lon: st.geo && st.geo.lon });
    };
    draw();
    $$('.sw').forEach(function (b) { b.onclick = function () { st.color = b.dataset.c; $$('.sw').forEach(function (x) { x.classList.toggle('on', x === b); }); draw(); }; });
    var isMap = (p.art || p.id) === 'my-village';
    var geoLook = function () { Geo.find(st.text, function (hit, gs) { if (gs !== 'searching') st.geo = hit; draw(); var g = $('#pGeo'); if (g) g.innerHTML = Geo.status(hit, gs); }); };
    var ti = $('#pText'); if (ti) ti.oninput = function () { st.text = ti.value.trim(); $('#pErr').textContent = ''; if (isMap) geoLook(); else draw(); };
    if (isMap && ti) { ti.insertAdjacentHTML('afterend', '<div class="geo" id="pGeo"></div>'); if (st.text) geoLook(); }
    $$('[data-q]').forEach(function (b) { b.onclick = function () { st.qty = Math.max(1, Math.min(50, st.qty + +b.dataset.q)); $('#pQty').textContent = st.qty; }; });
    var add = function () {
      var so = optFor(p, st.color); if (so && so.out) { toast(so.name + ' is sold out'); return false; }
      if (p.text && p.text.required && !st.text) { $('#pErr').textContent = 'Please fill in “' + p.text.label + '”.'; ti.focus(); return false; }
      Cart.add(p, st.qty, st.color, st.text, isMap ? st.geo : null); return true;
    };
    if (!out) {
      $('#pAdd').onclick = function () { if (add()) toast('Added to cart ✓'); };
      $('#pBuy').onclick = function () { if (add()) location.hash = 'checkout'; };
    }
    window.scrollTo(0, 0);
  }

  function lineHTML(l, ctl) {
    var opts = [l.color ? l.color : '', l.text ? '“' + l.text + '”' : ''].filter(Boolean).join(' · ');
    return '<div class="line"><div class="th">' + thumb(l.p, { color: l.color, text: l.text, lat: l.geo && l.geo.lat, lon: l.geo && l.geo.lon, ar: l.geo && l.geo.ar, ele: l.geo && l.geo.ele }) + '</div><div><div class="nm">' + esc(l.p.name) + '</div><div class="meta">' + esc(opts) + (ctl ? '' : (opts ? ' · ' : '') + '× ' + l.qty) + '</div>' +
      (ctl ? '<div class="ctl"><button data-k="' + esc(l.key) + '" data-d="-1">−</button><b>' + l.qty + '</b><button data-k="' + esc(l.key) + '" data-d="1">+</button><button class="rm" data-rm="' + esc(l.key) + '">Remove</button></div>' : '') +
      '</div><div class="price" style="font-size:17px">' + money(l.total) + '</div></div>';
  }

  function viewCart() {
    var lines = Cart.lines();
    if (!lines.length) { app.innerHTML = '<div class="wrap page empty"><h1>Your cart is empty</h1><p class="muted">The Lebanon drop and the Christmas collection are waiting.</p><a class="btn pri" href="#shop">Start shopping</a></div>'; return; }
    var s = Store.settings(), sub = Cart.subtotal();
    app.innerHTML = '<div class="wrap page"><h1>Your cart</h1><div class="two"><div class="panel">' + lines.map(function (l) { return lineHTML(l, true); }).join('') + '</div>' +
      '<div class="panel"><h3>Summary</h3><div class="sum"><div><span>Items</span><b>' + money(sub) + '</b></div><div><span class="muted">Delivery</span><span class="muted">from ' + money(Math.min(s.feeBeirut, s.feeMount)) + '</span></div>' +
      (s.freeOver && sub < s.freeOver ? '<div class="muted" style="font-size:13px">Add ' + money(s.freeOver - sub) + ' more for free delivery</div>' : s.freeOver ? '<div style="color:var(--green);font-size:13px">Free delivery unlocked ✓</div>' : '') +
      '</div><a class="btn pri full" style="margin-top:20px" href="#checkout">Checkout</a><a class="btn sec full" style="margin-top:10px" href="#shop">Keep shopping</a></div></div></div>';
    $$('[data-d]').forEach(function (b) { b.onclick = function () { var i = Cart.items.filter(function (x) { return x.key === b.dataset.k; })[0]; i.qty = Math.max(1, i.qty + +b.dataset.d); Cart.save(); viewCart(); }; });
    $$('[data-rm]').forEach(function (b) { b.onclick = function () { Cart.items = Cart.items.filter(function (x) { return x.key !== b.dataset.rm; }); Cart.save(); viewCart(); }; });
    window.scrollTo(0, 0);
  }

  function viewCheckout() {
    var lines = Cart.lines(), s = Store.settings();
    if (!lines.length) { location.hash = 'cart'; return; }
    if (s.open === false) { app.innerHTML = '<div class="wrap page empty"><h1>We’re taking a short break</h1><p class="muted">Orders are paused for now. Follow @' + esc(s.instagram) + ' to know when we reopen.</p></div>'; return; }
    var saved = ls('customer') || {};
    app.innerHTML = '<div class="wrap page"><h1>Checkout</h1><form class="two" id="co" novalidate><div style="display:grid;gap:18px">' +
      '<div class="panel"><h3>Your details</h3><div class="grid2">' +
        '<label class="field">Full name<input name="name" autocomplete="name" required value="' + esc(saved.name) + '"></label>' +
        '<label class="field">Phone (WhatsApp)<input name="phone" type="tel" autocomplete="tel" placeholder="70 123 456" required value="' + esc(saved.phone) + '"></label>' +
      '</div></div>' +
      '<div class="panel"><h3>Delivery</h3><div class="paysel" style="margin-bottom:14px"><label class="on"><input type="radio" name="method" value="delivery" checked><span><b>Delivery</b><small>Anywhere in Lebanon</small></span></label>' +
        (s.pickup ? '<label><input type="radio" name="method" value="pickup"><span><b>Pickup</b><small>Free · we send the location</small></span></label>' : '') + '</div>' +
        '<div class="grid2" id="addr"><label class="field">Area<select name="region">' + REGIONS.map(function (r) { return '<option' + (saved.region === r[0] ? ' selected' : '') + '>' + esc(r[0]) + '</option>'; }).join('') + '</select></label>' +
        '<label class="field">Town / village<input name="town" required value="' + esc(saved.town) + '"></label>' +
        '<label class="field wide">Address details<input name="address" placeholder="Street, building, floor, landmark" required value="' + esc(saved.address) + '"></label></div>' +
        '<label class="field" style="margin-top:14px">Notes (optional)<textarea name="notes" placeholder="Gift message, best time to call…"></textarea></label></div>' +
      '<div class="panel"><h3>Payment</h3><div class="paysel"><label class="on"><input type="radio" name="payment" value="cash" checked><span><b>Cash on delivery</b><small>Pay the driver</small></span></label>' +
        '<label><input type="radio" name="payment" value="whish"><span><b>Whish Money</b><small>Send to our Whish number</small></span></label></div>' +
        '<div class="note hidden" id="whishNote">After you place the order you’ll see our Whish number and your order code. Send the total with the code as the note — we start printing once it arrives.</div></div>' +
      '</div><div class="panel" style="position:sticky;top:90px"><h3>Order summary</h3>' + lines.map(function (l) { return lineHTML(l, false); }).join('') +
        '<div class="sum" style="margin-top:14px" id="sumBox"></div><div class="err" id="coErr" style="margin-top:10px"></div>' +
        '<button class="btn pri full" type="submit" id="coBtn" style="margin-top:8px">Place order</button><p class="muted" style="font-size:13px;margin:12px 0 0;text-align:center">We confirm every order on WhatsApp before printing.</p></div></form></div>';
    var f = $('#co');
    var calc = function () {
      var sub = Cart.subtotal(), method = f.method.value, del = method === 'pickup' ? 0 : fee(f.region.value);
      if (s.freeOver && sub >= s.freeOver) del = 0;
      $('#sumBox').innerHTML = '<div><span>Items</span><b>' + money(sub) + '</b></div><div><span>Delivery</span><b>' + (del ? money(del) : 'Free') + '</b></div><div class="tot"><span>Total</span><span>' + money(sub + del) + '</span></div>';
      $('#addr').style.display = method === 'pickup' ? 'none' : '';
      $('#whishNote').classList.toggle('hidden', f.payment.value !== 'whish');
      $$('.paysel label', f).forEach(function (l) { l.classList.toggle('on', l.querySelector('input').checked); });
      return { sub: sub, del: del };
    };
    f.addEventListener('change', calc); calc();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var method = f.method.value, err = '';
      var phone = f.phone.value.replace(/[^\d+]/g, '');
      if (!f.name.value.trim()) err = 'Please enter your name.';
      else if (phone.replace(/\D/g, '').length < 7) err = 'Please enter a valid phone number.';
      else if (method === 'delivery' && (!f.town.value.trim() || !f.address.value.trim())) err = 'Please add your town and address.';
      if (err) { $('#coErr').textContent = err; return; }
      var c = calc(), now = Date.now();
      var cust = { name: f.name.value.trim(), phone: phone, region: method === 'pickup' ? '' : f.region.value, town: method === 'pickup' ? '' : f.town.value.trim(), address: method === 'pickup' ? '' : f.address.value.trim(), notes: f.notes.value.trim() };
      ls('customer', cust);
      var order = {
        code: newCode(), createdAt: now, status: 'new', paid: false, payment: f.payment.value, method: method, customer: cust,
        items: Cart.lines().map(function (l) { var it = { id: l.id, name: l.p.name, price: l.p.price, qty: l.qty, color: l.color, text: l.text }; if (l.geo) it.geo = l.geo; if (l.p.grams != null) { it.unitCost = pieceCost(l.p.grams, l.p.printMin); it.printMin = l.p.printMin; } return it; }),
        subtotal: c.sub, delivery: c.del, total: c.sub + c.del, history: [{ s: 'new', t: now }]
      };
      $('#coBtn').disabled = true; $('#coBtn').textContent = 'Placing order…';
      Store.placeOrder(order).then(function () { Cart.clear(); ls('lastOrder', order); var mine = (ls('myOrders') || []).filter(function (c) { return c !== order.code; }); mine.unshift(order.code); ls('myOrders', mine.slice(0, 10)); location.hash = 'order-' + order.code; })
        .catch(function () { $('#coBtn').disabled = false; $('#coBtn').textContent = 'Place order'; $('#coErr').innerHTML = 'We couldn’t reach our server, so your order was <b>not</b> placed. Check your connection and try again, or <a href="' + waLink(Store.settings().whatsapp, orderText(order)) + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">send it to us on WhatsApp</a>.'; });
    });
    window.scrollTo(0, 0);
  }

  function orderText(o) {
    return 'Hi 3DBlaze! I just ordered ⚡\nOrder: ' + o.code + '\n' + o.items.map(function (i) { return '• ' + i.name + (i.color ? ' (' + i.color + ')' : '') + (i.text ? ' “' + i.text + '”' : '') + ' × ' + i.qty; }).join('\n') +
      '\nTotal: ' + money(o.total) + ' — ' + (o.payment === 'whish' ? 'Whish' : 'cash on delivery') + '\nName: ' + o.customer.name + (o.customer.town ? '\nTo: ' + o.customer.town + ', ' + o.customer.region : '\nPickup');
  }

  function viewDone(code) {
    var o = ls('lastOrder'), s = Store.settings();
    if (!o || o.code !== code) { location.hash = 'track'; setTimeout(function () { var i = $('#trCode'); if (i) { i.value = code; $('#trBtn').click(); } }, 50); return; }
    var wa = s.whatsapp ? waLink(s.whatsapp, orderText(o)) : 'https://instagram.com/' + s.instagram;
    app.innerHTML = '<div class="wrap page"><div class="done"><div class="ok"><svg width="40" height="40" viewBox="0 0 32 32"><path d="M18.5 4 L8.5 18 H15 L13 28 L24 13 H17.5 Z" fill="#1A8CFF"/></svg></div>' +
      '<h1 style="margin-bottom:8px">Order received!</h1><p class="muted">Thank you, ' + esc(o.customer.name.split(' ')[0]) + '. Keep your order code:</p><div class="code">' + esc(o.code) + '</div>' +
      (o.payment === 'whish' ? '<div class="panel"><h3>Pay with Whish</h3><div class="kv"><span>Send</span><b class="price" style="font-size:20px">' + money(o.total) + '</b><span>To</span><b>' + (s.whish ? esc(s.whish) + ' (' + esc(s.whishName) + ')' : 'we’ll send you the number on WhatsApp') + '</b><span>Note</span><b>' + esc(o.code) + '</b></div>' +
        (s.whish ? '<button class="btn sec" id="cpW">Copy Whish number</button>' : '') + '</div>' :
        '<div class="panel"><h3>Cash on delivery</h3><p class="muted" style="margin:0">Have ' + money(o.total) + ' ready for the driver' + (o.method === 'pickup' ? ' — or pay at pickup.' : '.') + '</p></div>') +
      '<div class="panel"><h3>Next: confirm on ' + (s.whatsapp ? 'WhatsApp' : 'Instagram') + '</h3><p class="muted" style="margin:0 0 14px">Send us your order so we can confirm the details and start printing.</p>' +
      '<a class="btn ' + (s.whatsapp ? 'wa' : 'blue') + ' full" href="' + wa + '" target="_blank" rel="noopener">' + (s.whatsapp ? 'Send on WhatsApp' : 'Message @' + esc(s.instagram)) + '</a>' +
      '<button class="btn sec full" style="margin-top:10px" id="cpO">Copy order details</button></div>' +
      '<div class="panel"><h3>Your order</h3>' + o.items.map(function (i) { return '<div class="line" style="grid-template-columns:1fr auto"><div><div class="nm">' + esc(i.name) + '</div><div class="meta">' + esc([i.color, i.text ? '“' + i.text + '”' : ''].filter(Boolean).join(' · ')) + ' × ' + i.qty + '</div></div><div class="price" style="font-size:16px">' + money(i.price * i.qty) + '</div></div>'; }).join('') +
      '<div class="sum" style="margin-top:12px"><div><span>Delivery</span><b>' + (o.delivery ? money(o.delivery) : 'Free') + '</b></div><div class="tot"><span>Total</span><span>' + money(o.total) + '</span></div></div></div>' +
      '<a class="btn sec" style="margin-top:20px" href="#track-' + esc(o.code) + '">Track this order</a></div></div>';
    var w = $('#cpW'); if (w) w.onclick = function () { copy(s.whish, 'Whish number copied'); };
    $('#cpO').onclick = function () { copy(orderText(o), 'Order copied'); };
    window.scrollTo(0, 0);
  }

  function viewTrack(code0) {
    var last = ls('lastOrder'), mine = ls('myOrders') || (last ? [last.code] : []);
    app.innerHTML = '<div class="wrap page"><div class="done" style="text-align:left"><h1>Track your order</h1><div class="panel"><label class="field">Order code<input id="trCode" placeholder="3DB-XXXXX" value="' + esc(code0 || (last ? last.code : '')) + '" autocomplete="off" style="text-transform:uppercase"></label>' + (mine.length ? '<div class="mychips"><span class="muted">Your orders on this phone:</span>' + mine.map(function (c) { return '<button type="button" class="chip" data-tc="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>' : '') + '<button class="btn pri full" id="trBtn" style="margin-top:14px">Track</button><div id="trOut"></div></div></div></div>';
    $('#trBtn').onclick = function () {
      var code = $('#trCode').value.trim().toUpperCase().replace(/\s/g, ''); if (code && code.indexOf('3DB-') !== 0) code = '3DB-' + code.replace(/^3DB/, '');
      $('#trOut').innerHTML = '<p class="muted">Looking…</p>';
      Store.track(code).then(function (t) {
        if (!t) { $('#trOut').innerHTML = '<p class="err" style="margin-top:14px">We couldn’t find ' + esc(code) + '. Check the code, or message us on Instagram.</p>'; return; }
        if (t.status === 'cancelled') { $('#trOut').innerHTML = '<p style="margin-top:16px">This order was cancelled. Message us if that’s a surprise.</p>'; return; }
        var idx = CUSTOMER_STEPS.map(function (s) { return s.k; }).indexOf(t.status);
        $('#trOut').innerHTML = '<div style="display:flex;justify-content:space-between;margin:20px 0 14px"><b class="code" style="margin:0;font-size:18px">' + esc(code) + '</b><span class="price">' + money(t.total) + '</span></div>' +
          '<div class="timeline">' + CUSTOMER_STEPS.map(function (s, i) { return '<div class="tl' + (i <= idx ? ' on' : '') + (i === idx ? ' cur' : '') + '"><i>' + (i <= idx ? '✓' : '') + '</i><div><b>' + s.l + '</b><small>' + s.d + '</small></div></div>'; }).join('') + '</div>' +
          '<p class="muted" style="font-size:13px;margin:4px 0 0">Payment: ' + (t.payment === 'whish' ? 'Whish' : 'Cash on delivery') + ' · ' + (t.paid ? '<span class="paid">Paid</span>' : 'Not paid yet') + '</p>';
      }).catch(function () { $('#trOut').innerHTML = '<p class="err">Could not check right now. Try again.</p>'; });
    };
    if (last) $('#trBtn').click();
    $('#trCode').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#trBtn').click(); });
    $$('[data-tc]').forEach(function (b) { b.onclick = function () { $('#trCode').value = b.dataset.tc; $('#trBtn').click(); }; });
    if (code0 || last) $('#trBtn').click();
    window.scrollTo(0, 0);
  }


  // ---------- live visitors (who has the shop open right now) ----------
  var Presence = (function () {
    var id = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    var count = 0, watching = false, me = null, subs = [];
    function emit() { subs.forEach(function (f) { f(count); }); }
    function isStaff() { return !!window.BLAZE_ADMIN; }
    function liveOk() { return Store.live && window.firebase && firebase.apps && firebase.apps.length; }
    function demoBeat() {
      var m = ls('presence') || {}, now = Date.now();
      Object.keys(m).forEach(function (k) { if (now - m[k] > 15000) delete m[k]; });
      if (isStaff()) delete m[id]; else m[id] = now;
      ls('presence', m); recount();
    }
    function recount() {
      if (!watching) return;
      var m = ls('presence') || {}, now = Date.now();
      var n = Object.keys(m).filter(function (k) { return now - m[k] <= 15000; }).length;
      if (n !== count) { count = n; emit(); }
    }
    function liveSync() {
      if (isStaff()) return;
      var db = firebase.database();
      if (!me) me = db.ref('presence/' + id);
      me.onDisconnect().remove();
      me.set({ t: firebase.database.ServerValue.TIMESTAMP, page: (location.hash || '#home').slice(1).slice(0, 40) });
    }
    function start() {
      if (liveOk()) {
        if (isStaff()) return;
        firebase.database().ref('.info/connected').on('value', function (s) { if (s.val()) liveSync(); });
        window.addEventListener('hashchange', function () { if (me) liveSync(); });
      } else {
        demoBeat(); setInterval(demoBeat, 5000);
        window.addEventListener('storage', function (e) { if (e.key === '3db:presence') recount(); });
        window.addEventListener('beforeunload', function () { var m = ls('presence') || {}; delete m[id]; ls('presence', m); });
      }
    }
    function watch() {
      if (watching) return; watching = true;
      if (liveOk()) firebase.database().ref('presence').on('value', function (s) { count = s.numChildren(); emit(); }, function () { count = 0; emit(); });
      else recount();
    }
    return { start: start, watch: watch, count: function () { return count; }, on: function (f) { subs.push(f); } };
  })();

  // ---------- admin ----------
  var adm = { tab: 'orders', filter: 'active', q: '' };
  function statusBadge(k) { var s = STATUSES.filter(function (x) { return x.k === k; })[0] || STATUSES[0]; return '<span class="badge s-' + s.k + '">' + s.l + '</span>'; }

  function viewAdmin() {
    var u = Store.user();
    if (!u) {
      app.innerHTML = '<div class="wrap"><div class="login"><h1 style="font-size:28px">3DBlaze Studio</h1><p class="muted">3DBlaze order manager</p><form class="panel" id="lg">' +
        (Store.live ? '<p class="muted" style="margin:0">Sign in with the 3DBlaze Google account.</p>' : '<div class="demo">Demo mode — passcode is <b>blaze2026</b>.</div><label class="field">Passcode<input name="pass" type="password" autocomplete="current-password"></label>') +
        '<div class="err" id="lgErr"></div><button class="btn pri full">' + (Store.live ? 'Sign in with Google' : 'Log in') + '</button></form></div></div>';
      $('#lg').onsubmit = function (e) { e.preventDefault(); var f = e.target; Store.login('', f.pass ? f.pass.value : '').then(function () { viewAdmin(); }).catch(function () { $('#lgErr').textContent = 'Wrong login.'; }); };
      return;
    }
    if (!Store.live && !ls('demoSeeded')) { ls('demoSeeded', true); Store.seedDemo(); }
    renderAdmin();
  }

  function renderAdmin() {
    var orders = Store.orders();
    var newCount = orders.filter(function (o) { return o.status === 'new'; }).length;
    document.title = (newCount ? '(' + newCount + ') ' : '') + '3DBlaze — Orders';
    var now = new Date(), monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime(), dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var valid = orders.filter(function (o) { return o.status !== 'cancelled'; });
    var revMonth = valid.filter(function (o) { return o.createdAt >= monthStart; }).reduce(function (n, o) { return n + (o.subtotal || 0); }, 0);
    var profMonth = valid.filter(function (o) { return o.createdAt >= monthStart; }).reduce(function (n, o) { var c = orderCost(o); return n + (c == null ? 0 : (o.subtotal || 0) - c); }, 0);
    var toCollect = valid.filter(function (o) { return !o.paid && o.status !== 'delivered'; }).reduce(function (n, o) { return n + o.total; }, 0);
    var inQueue = valid.filter(function (o) { return ['confirmed', 'printing'].indexOf(o.status) >= 0; }).length;
    var today = orders.filter(function (o) { return o.createdAt >= dayStart; }).length;

    app.innerHTML = '<div class="wrap admin">' + (Store.live ? '' : '<div class="demo">Demo mode: orders are saved in this browser only. <button class="upl" id="clrDemo">Clear sample orders</button></div>') +
      '<div class="adm-top"><h1>Manager</h1><div class="tabs">' + [['orders', 'Orders' + (newCount ? ' (' + newCount + ')' : '')], ['customers', 'Customers'], ['queue', 'Print queue'], ['requests', 'Design requests' + (function () { var n = Store.requests().filter(function (r) { return r.status !== 'done'; }).length; return n ? ' (' + n + ')' : ''; })()], ['calc', 'Calculator'], ['products', 'Products'], ['settings', 'Settings']].map(function (t) { return '<button data-tab="' + t[0] + '" class="' + (adm.tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') +
      '</div><button class="btn sec" id="logout" style="min-height:42px;padding:8px 14px;font-size:14px">Log out</button></div>' +
      '<div class="kpis"><div class="kpi live"><small><i class="dot"></i>On the site now</small><b id="liveNow">' + Presence.count() + '</b></div><div class="kpi o"><small>New orders</small><b>' + newCount + '</b></div><div class="kpi"><small>Orders today</small><b>' + today + '</b></div><div class="kpi g"><small>Sales · profit this month</small><b>' + money(revMonth) + ' · ' + money(profMonth) + '</b></div><div class="kpi"><small>To collect · in queue</small><b>' + money(toCollect) + ' · ' + inQueue + '</b></div></div>' +
      '<div id="admBody"></div></div>';
    $$('[data-tab]').forEach(function (b) { b.onclick = function () { adm.tab = b.dataset.tab; renderAdmin(); }; });
    $('#logout').onclick = function () { Store.logout(); viewAdmin(); };
    Presence.watch();
    var cd = $('#clrDemo'); if (cd) cd.onclick = function () { Store.clearDemo(); toast('Sample orders removed'); };
    ({ orders: admOrders, customers: admCustomers, queue: admQueue, requests: admRequests, calc: admCalc, products: admProducts, settings: admSettings })[adm.tab]();
  }

  function admOrders() {
    var orders = Store.orders();
    var counts = { active: 0, all: orders.length };
    STATUSES.forEach(function (s) { counts[s.k] = 0; });
    orders.forEach(function (o) { counts[o.status] = (counts[o.status] || 0) + 1; if (['delivered', 'cancelled'].indexOf(o.status) < 0) counts.active++; });
    var list = orders.filter(function (o) {
      if (adm.filter === 'active' && ['delivered', 'cancelled'].indexOf(o.status) >= 0) return false;
      if (adm.filter !== 'active' && adm.filter !== 'all' && o.status !== adm.filter) return false;
      if (adm.q) { var h = (o.code + ' ' + o.customer.name + ' ' + o.customer.phone + ' ' + o.customer.town).toLowerCase(); if (h.indexOf(adm.q.toLowerCase()) < 0) return false; }
      return true;
    });
    $('#admBody').innerHTML = '<div class="filters">' + [['active', 'Active'], ['new', 'New'], ['confirmed', 'Confirmed'], ['printing', 'Printing'], ['ready', 'Ready'], ['out', 'Out'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled'], ['all', 'All']].map(function (f) {
        return '<button class="fchip' + (adm.filter === f[0] ? ' on' : '') + '" data-f="' + f[0] + '">' + f[1] + '<em>' + (counts[f[0]] || 0) + '</em></button>'; }).join('') +
      '<input class="search" id="oq" placeholder="Search name, phone, code, town" value="' + esc(adm.q) + '"><button class="btn pri" id="newO" style="min-height:42px;padding:8px 14px;font-size:14px">+ New order</button><button class="btn sec" id="csv" style="min-height:42px;padding:8px 14px;font-size:14px">Copy as CSV</button></div>' +
      '<div class="olist">' + (list.length ? list.map(function (o) {
        var n = o.items.reduce(function (a, i) { return a + i.qty; }, 0);
        return '<div class="orow" data-o="' + esc(o.code) + '"><div><div class="c">' + esc(o.code) + '</div><small class="muted">' + fmtDate(o.createdAt) + '</small></div>' +
          '<div class="n"><b>' + esc(o.customer.name) + '</b><small>' + esc(o.method === 'pickup' ? 'Pickup' : [o.customer.town, o.customer.region].filter(Boolean).join(' · ')) + '</small><small class="ph">' + esc(fmtPhone(o.customer.phone)) + '</small></div>' +
          '<div class="it"><small>' + n + ' item' + (n > 1 ? 's' : '') + ' · ' + esc(o.items.map(function (i) { return i.name; }).join(', ')) + '</small></div>' +
          '<div class="pm"><small class="' + (o.paid ? 'paid' : 'unpaid') + '">' + (o.payment === 'whish' ? 'Whish' : 'Cash') + (o.paid ? ' ✓' : '') + '</small></div>' +
          '<div>' + statusBadge(o.status) + '</div><div class="tt">' + money(o.total) + '</div></div>';
      }).join('') : '<div class="panel empty"><p class="muted">No orders here yet. Share the site on Instagram and they’ll show up live.</p></div>') + '</div>';
    $$('[data-f]').forEach(function (b) { b.onclick = function () { adm.filter = b.dataset.f; admOrders(); }; });
    var q = $('#oq'); q.oninput = function () { adm.q = q.value; var pos = q.selectionStart; admOrders(); var nq = $('#oq'); nq.focus(); nq.setSelectionRange(pos, pos); };
    $$('[data-o]').forEach(function (r) { r.onclick = function () { orderModal(r.dataset.o); }; });
    $('#newO').onclick = function () { adm.tab = 'calc'; renderAdmin(); toast('Price it, then press “Turn into order”'); };
    $('#csv').onclick = function () {
      var rows = [['code', 'date', 'status', 'name', 'phone', 'region', 'town', 'address', 'items', 'subtotal', 'delivery', 'total', 'payment', 'paid']].concat(orders.map(function (o) {
        return [o.code, new Date(o.createdAt).toISOString().slice(0, 16).replace('T', ' '), o.status, o.customer.name, o.customer.phone, o.customer.region, o.customer.town, o.customer.address, o.items.map(function (i) { return i.qty + 'x ' + i.name + (i.color ? ' ' + i.color : '') + (i.text ? ' "' + i.text + '"' : ''); }).join('; '), o.subtotal, o.delivery, o.total, o.payment, o.paid ? 'yes' : 'no'];
      }));
      copy(rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n'), 'CSV copied — paste into Sheets or Excel');
    };
  }

  var CUSTOMER_MSG = {
    new: function (o) { return 'Hi ' + o.customer.name.split(' ')[0] + '! This is 3DBlaze ⚡ We got your order ' + o.code + ':\n' + o.items.map(function (i) { return '• ' + i.name + (i.color ? ' (' + i.color + ')' : '') + (i.text ? ' “' + i.text + '”' : '') + ' × ' + i.qty; }).join('\n') + '\nTotal ' + money(o.total) + '. Can you confirm the details are right?'; },
    confirmed: function (o) { return 'Confirmed ✅ Your order ' + o.code + ' is in the print queue. We’ll message you when it’s ready.\nTrack it any time: https://3dblazelb.com/#track-' + o.code + (o.payment === 'whish' && !o.paid ? '\nWhish: please send ' + money(o.total) + ' to ' + (Store.settings().whish || '[our Whish number]') + ' with the note ' + o.code + '.' : ''); },
    printing: function (o) { return 'Your 3DBlaze order ' + o.code + ' is printing right now 🖨️'; },
    ready: function (o) { return 'Your order ' + o.code + ' is ready! ' + (o.method === 'pickup' ? 'When can you pass by to pick it up?' : 'It goes out with the driver soon.'); },
    out: function (o) { return 'Your order ' + o.code + ' is on its way 🚚' + (o.payment === 'cash' ? ' Please have ' + money(o.total) + ' ready for the driver.' : ''); },
    delivered: function (o) { return 'Thanks for ordering from 3DBlaze! 🙌 If you like it, tag us @' + Store.settings().instagram + ' — we repost our favourites.'; },
    cancelled: function (o) { return 'Hi ' + o.customer.name.split(' ')[0] + ', your order ' + o.code + ' has been cancelled. Message us if you have any question.'; }
  };

  // ---------- customers & delivery helpers ----------
  function phoneKey(p) { var d = String(p || '').replace(/\D/g, ''); if (d.indexOf('00961') === 0) d = d.slice(5); else if (d.indexOf('961') === 0 && d.length > 8) d = d.slice(3); return d.replace(/^0/, ''); }
  function fmtPhone(p) { var d = phoneKey(p); if (!d) return ''; if (d.length === 7) d = '0' + d; return '+961 ' + d.replace(/^(\d{2})(\d{3})(\d{3})$/, '$1 $2 $3'); }
  function telHref(p) { var d = phoneKey(p); return 'tel:+961' + (d.length === 7 ? '0' + d : d); }
  function mapHref(c) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([c.address, c.town, c.region, 'Lebanon'].filter(Boolean).join(', ')); }
  function itemsText(o) { return o.items.map(function (i) { return i.qty + '× ' + i.name + (i.color ? ' (' + i.color + ')' : '') + (i.text ? ' “' + i.text + '”' : ''); }).join('\n'); }
  function driverText(o) {
    var c = o.customer, pickup = o.method === 'pickup';
    return '3DBlaze ' + (pickup ? 'pickup' : 'delivery') + ' — ' + o.code + '\n' +
      'Customer: ' + c.name + '\nPhone: ' + fmtPhone(c.phone) + '\n' +
      (pickup ? 'PICKUP (no delivery)\n' : 'Area: ' + (c.region || '-') + '\nTown: ' + (c.town || '-') + '\nAddress: ' + (c.address || '-') + '\n') +
      (c.notes ? 'Notes: ' + c.notes + '\n' : '') +
      'Items:\n' + itemsText(o) + '\n' +
      'Collect: ' + (o.paid ? '$0 — already paid' + (o.payment === 'whish' ? ' (Whish)' : '') : money(o.total) + (o.payment === 'whish' ? ' (Whish — check if paid)' : ' cash')) +
      (pickup ? '' : '\nMap: ' + mapHref(c));
  }
  function customerList() {
    var map = {};
    Store.orders().forEach(function (o) {
      var c = o.customer || {}, k = phoneKey(c.phone) || ('n:' + (c.name || '').toLowerCase());
      var e = map[k] || (map[k] = { key: k, name: c.name, phone: c.phone, orders: [], spent: 0, addrs: [], last: 0, first: Infinity });
      e.orders.push(o);
      if (o.createdAt >= e.last) { e.last = o.createdAt; e.name = c.name || e.name; e.phone = c.phone || e.phone; }
      e.first = Math.min(e.first, o.createdAt);
      if (o.status !== 'cancelled') e.spent += o.total || 0;
      if (o.method !== 'pickup' && (c.address || c.town)) {
        var a = { region: c.region, town: c.town, address: c.address, t: o.createdAt }, sig = [a.region, a.town, a.address].join('|').toLowerCase();
        var ex = e.addrs.filter(function (x) { return x.sig === sig; })[0];
        if (ex) ex.t = Math.max(ex.t, a.t); else { a.sig = sig; e.addrs.push(a); }
      }
    });
    return Object.keys(map).map(function (k) { var e = map[k]; e.addrs.sort(function (a, b) { return b.t - a.t; }); e.orders.sort(function (a, b) { return b.createdAt - a.createdAt; }); e.active = e.orders.filter(function (o) { return o.status !== 'cancelled'; }).length; return e; })
      .sort(function (a, b) { return b.last - a.last; });
  }
  function admCustomers() {
    var all = customerList(), q = (adm.cq || '').toLowerCase();
    var list = all.filter(function (e) { if (!q) return true; return (e.name + ' ' + e.phone + ' ' + fmtPhone(e.phone) + ' ' + e.addrs.map(function (a) { return a.town + ' ' + a.region + ' ' + a.address; }).join(' ')).toLowerCase().indexOf(q) >= 0; });
    $('#admBody').innerHTML = '<div class="filters"><input class="search" id="cq" placeholder="Search name, phone, town" value="' + esc(adm.cq || '') + '"><button class="btn sec" id="ccsv" style="min-height:42px;padding:8px 14px;font-size:14px">Copy as CSV</button></div>' +
      '<p class="muted" style="font-size:13px;margin:0 0 10px">' + all.length + ' customer' + (all.length === 1 ? '' : 's') + ' · built from your orders (same phone = same customer)</p>' +
      '<div class="olist">' + (list.length ? list.map(function (e) {
        var a = e.addrs[0];
        return '<div class="crow" data-c="' + esc(e.key) + '"><div class="n"><b>' + esc(e.name) + '</b><small>' + esc(fmtPhone(e.phone)) + '</small></div>' +
          '<div class="ad"><small>' + (a ? esc([a.town, a.region].filter(Boolean).join(' · ')) + '<br>' + esc(a.address || '') : 'Pickup only') + '</small></div>' +
          '<div class="st"><b>' + e.active + '</b><small> order' + (e.active === 1 ? '' : 's') + '</small></div>' +
          '<div class="tt">' + money(e.spent) + '<small>last ' + fmtDate(e.last).split(' · ')[0] + '</small></div></div>';
      }).join('') : '<div class="panel empty"><p class="muted">' + (all.length ? 'No customer matches your search.' : 'No customers yet — they appear here automatically with their first order.') + '</p></div>') + '</div>';
    var inp = $('#cq'); inp.oninput = function () { adm.cq = inp.value; var pos = inp.selectionStart; admCustomers(); var n = $('#cq'); n.focus(); n.setSelectionRange(pos, pos); };
    $$('[data-c]').forEach(function (r) { r.onclick = function () { customerModal(r.dataset.c); }; });
    $('#ccsv').onclick = function () {
      var rows = [['name', 'phone', 'orders', 'spent', 'last order', 'area', 'town', 'address']].concat(all.map(function (e) { var a = e.addrs[0] || {}; return [e.name, fmtPhone(e.phone), e.active, e.spent, new Date(e.last).toISOString().slice(0, 10), a.region || '', a.town || '', a.address || '']; }));
      copy(rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n'), 'Customers copied — paste into Sheets or Excel');
    };
  }
  function customerModal(key) {
    var e = customerList().filter(function (x) { return x.key === key; })[0]; if (!e) return;
    modal('<h3 style="font-size:22px;margin:0 44px 4px 0">' + esc(e.name) + '</h3><p class="muted" style="margin:0 0 14px;font-size:14px">Customer since ' + fmtDate(e.first).split(' · ')[0] + ' · ' + e.active + ' order' + (e.active === 1 ? '' : 's') + ' · ' + money(e.spent) + ' spent</p>' +
      '<div class="kv"><span>Phone</span><b>' + esc(fmtPhone(e.phone)) + ' · <a href="' + telHref(e.phone) + '">Call</a> · <a href="' + waLink(e.phone, 'Hi ' + (e.name || '').split(' ')[0] + '! This is 3DBlaze ⚡') + '" target="_blank" rel="noopener">WhatsApp</a></b>' +
      (e.addrs.length ? e.addrs.map(function (a, i) { return '<span>' + (i ? 'Older address' : 'Address') + '</span><b>' + esc([a.address, a.town, a.region].filter(Boolean).join(', ')) + ' · <a href="' + mapHref(a) + '" target="_blank" rel="noopener">Map</a></b>'; }).join('') : '<span>Address</span><b>Pickup only</b>') + '</div>' +
      '<div class="lab muted" style="font-size:13px;margin-bottom:8px">Past orders</div><div class="olist">' + e.orders.map(function (o) {
        return '<div class="orow mini" data-mo="' + esc(o.code) + '"><div><div class="c">' + esc(o.code) + '</div><small class="muted">' + fmtDate(o.createdAt) + '</small></div><div class="it"><small>' + esc(o.items.map(function (i) { return i.qty + '× ' + i.name; }).join(', ')) + '</small></div><div>' + statusBadge(o.status) + '</div><div class="tt">' + money(o.total) + '</div></div>';
      }).join('') + '</div>', function (box, close) {
        $$('[data-mo]', box).forEach(function (r) { r.onclick = function () { close(); orderModal(r.dataset.mo); }; });
      });
  }

  function orderModal(code) {
    var o = Store.orders().filter(function (x) { return x.code === code; })[0]; if (!o) return;
    var c = o.customer;
    modal('<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-right:44px"><h3 style="font-size:22px">' + esc(o.code) + '</h3>' + statusBadge(o.status) + (o.demo ? '<span class="badge s-cancelled">sample</span>' : '') + '</div>' +
      '<p class="muted" style="margin:4px 0 16px;font-size:14px">' + fmtDate(o.createdAt) + '</p>' +
      '<div class="lab muted" style="font-size:13px">Move to</div><div class="stepper">' + STATUSES.map(function (s) { return '<button data-s="' + s.k + '" class="' + (o.status === s.k ? 'on' : '') + '">' + s.l + '</button>'; }).join('') + '</div>' +
      '<div class="panel" style="padding:16px 18px;background:var(--card2)">' + o.items.map(function (i) { var p = Store.product(i.id) || { id: i.id, name: i.name }; return '<div class="line" style="grid-template-columns:56px 1fr auto"><div class="th" style="width:56px;height:56px">' + thumb(p, { color: i.color, text: i.text, lat: i.geo && i.geo.lat, lon: i.geo && i.geo.lon, ar: i.geo && i.geo.ar, ele: i.geo && i.geo.ele }) + '</div><div><div class="nm">' + esc(i.name) + ' × ' + i.qty + '</div><div class="meta">' + esc([i.color, i.text ? '“' + i.text + '”' : ''].filter(Boolean).join(' · ')) + '</div></div><b>' + money(i.price * i.qty) + '</b></div>'; }).join('') +
      '<div class="sum" style="margin-top:10px">' + (function () { var c = orderCost(o); return c == null ? '<div class="muted" style="font-size:13px"><span>Profit</span><span>add the Bambu file to each product to see it</span></div>' : '<div><span>Cost · profit</span><b style="color:var(--green)">' + money(c) + ' · ' + money((o.subtotal || 0) - c) + '</b></div>'; })() + '<div><span>Delivery</span><b>' + (o.delivery ? money(o.delivery) : 'Free') + '</b></div><div class="tot" style="font-size:18px"><span>Total</span><span>' + money(o.total) + '</span></div></div></div>' +
      '<div class="dlv"><div class="dlv-h"><b>' + (o.method === 'pickup' ? 'Pickup' : 'Delivery') + ' details</b><span>' + (o.paid ? 'Paid' : 'Collect ' + money(o.total) + (o.payment === 'whish' ? ' (Whish)' : ' cash')) + '</span></div>' +
        '<div class="kv"><span>Customer</span><b>' + esc(c.name) + '</b>' +
        '<span>Phone</span><b>' + esc(fmtPhone(c.phone)) + ' · <a href="' + telHref(c.phone) + '">Call</a></b>' +
        (o.method === 'pickup' ? '<span>Method</span><b>Pickup — no delivery</b>' :
          '<span>Area</span><b>' + esc(c.region || '-') + '</b><span>Town</span><b>' + esc(c.town || '-') + '</b><span>Address</span><b>' + esc(c.address || '-') + ' · <a href="' + mapHref(c) + '" target="_blank" rel="noopener">Map</a></b>') +
        (c.notes ? '<span>Notes</span><b>' + esc(c.notes) + '</b>' : '') +
        '<span>Items</span><b style="white-space:pre-line">' + esc(itemsText(o)) + '</b></div>' +
        '<div class="actions" style="margin-top:0"><button class="btn pri" id="mCpAddr">Copy for driver</button><a class="btn sec" id="mDrv" target="_blank" rel="noopener">Send to driver (WhatsApp)</a></div></div>' +
      '<div class="kv">' +
      '<span>Payment</span><b>' + (o.payment === 'whish' ? 'Whish' : 'Cash on delivery') + ' · <label class="switch" style="display:inline-flex"><input type="checkbox" id="mPaid"' + (o.paid ? ' checked' : '') + '> paid</label></b>' +
      '<span>Internal note</span><input id="mNote" class="search" style="min-width:0" placeholder="Only you see this" value="' + esc(o.note || '') + '"></div>' +
      '<div class="actions">' + (o.items.some(function (i) { return i.id === 'my-village' || (i.text && i.id !== 'design'); }) ? '<button class="btn pri" id="mReq">Request 3MF</button>' : '') + '<a class="btn wa" id="mWa" target="_blank" rel="noopener">WhatsApp customer</a><button class="btn sec" id="mCpMsg">Copy message</button></div>' +
      '<p class="muted" style="font-size:13px;margin:12px 0 0" id="mMsgPrev"></p>', function (box, close) {
        var setWa = function () { var msg = CUSTOMER_MSG[o.status](o); box.querySelector('#mWa').href = waLink(c.phone, msg); box.querySelector('#mMsgPrev').textContent = 'Message for “' + (STATUSES.filter(function (s) { return s.k === o.status; })[0].l) + '”: ' + msg; return msg; };
        setWa();
        $$('[data-s]', box).forEach(function (b) {
          b.onclick = function () {
            var go = function () { Store.updateOrder(o.code, { status: b.dataset.s }).then(function () { o.status = b.dataset.s; $$('[data-s]', box).forEach(function (x) { x.classList.toggle('on', x === b); }); setWa(); renderAdmin(); toast('Moved to ' + b.textContent); }); };
            if (b.dataset.s === 'cancelled') confirmBox('Cancel order ' + o.code + '?', 'Cancel order', go); else go();
          };
        });
        box.querySelector('#mPaid').onchange = function (e) { Store.updateOrder(o.code, { paid: e.target.checked }).then(function () { o.paid = e.target.checked; renderAdmin(); toast(e.target.checked ? 'Marked paid' : 'Marked unpaid'); }); };
        var nt; box.querySelector('#mNote').oninput = function (e) { clearTimeout(nt); nt = setTimeout(function () { Store.updateOrder(o.code, { note: e.target.value }); }, 600); };
        var rqb = box.querySelector('#mReq'); if (rqb) rqb.onclick = function () {
          var it = o.items.filter(function (i) { return i.id === 'my-village'; })[0] || o.items.filter(function (i) { return i.text; })[0];
          var data = { type: it.id === 'my-village' ? 'map' : 'custom', geo: it.geo || null, title: it.id === 'my-village' ? (it.text || '') : it.name + (it.text ? ' with “' + it.text + '”' : ''), base: it.id === 'my-village' ? 'black' : (it.color === 'white' ? 'white' : 'black'), mapc: it.id === 'my-village' ? 'white' : (it.color === 'white' ? 'green' : 'white'), place: o.customer.region || '', notes: '', size: '', order: o.code, status: 'sent', createdAt: Date.now() };
          Store.saveRequest(null, data).then(function (id) { data.id = id; copy(requestText(data), 'Copied — paste it in your Claude chat'); close(); adm.tab = 'requests'; renderAdmin(); });
        };
        box.querySelector('#mCpMsg').onclick = function () { copy(setWa(), 'Message copied'); };
        var setDrv = function () { box.querySelector('#mDrv').href = 'https://wa.me/?text=' + encodeURIComponent(driverText(o)); };
        setDrv();
        box.querySelector('#mPaid').addEventListener('change', setDrv);
        box.querySelector('#mCpAddr').onclick = function () { copy(driverText(o), 'Driver details copied'); };
      });
  }


  // ---------- design requests (files Claude makes) ----------
  var REQ_STATUS = [['new', 'New'], ['sent', 'Sent to Claude'], ['ready', 'File ready'], ['done', 'Printed']];
  function requestText(r) {
    var t = '3DBlaze design request ' + r.id + '\n';
    if (r.type === 'map') t += 'Product: "My Village" map (.3mf for Bambu Studio)\nVillage / name on it: ' + r.title + (r.geo ? '\nPin (from the customer’s search): ' + r.geo.lat.toFixed(5) + ', ' + r.geo.lon.toFixed(5) + ' — ' + r.geo.label + (r.geo.ar ? '\nArabic name (OpenStreetMap): ' + r.geo.ar : '') + (r.geo.ele != null ? '\nElevation at pin (Open-Meteo DEM, shown to customer): ' + r.geo.ele + ' m — verify before printing' : '') : '') + (r.place ? '\nWhere: ' + r.place : '') + '\nColours: black base, white map, white name, green pin (black only)';
    else t += 'Product: custom design (.3mf for Bambu Studio)\nWhat: ' + r.title;
    if (r.size) t += '\nSize: ' + r.size;
    if (r.notes) t += '\nNotes: ' + r.notes;
    if (r.order) t += '\nFor order: ' + r.order;
    return t;
  }
  function admRequests() {
    var list = Store.requests();
    $('#admBody').innerHTML = '<div class="calc"><form class="panel" id="rq" style="display:grid;gap:12px;align-self:start">' +
      '<h3 style="margin:0">New design request</h3><p class="muted" style="margin:0;font-size:14px">Write what you need, press <b>Copy for Claude</b>, and paste it in your Claude chat. Claude makes the .3mf for Bambu Studio and sends it back.</p>' +
      '<div class="paysel"><label class="on"><input type="radio" name="type" value="map" checked><span><b>Village map</b><small>Lebanon + pin + name</small></span></label><label><input type="radio" name="type" value="custom"><span><b>Custom</b><small>Anything else</small></span></label></div>' +
      '<label class="field" id="rqT">Village / name on it<input name="title" placeholder="e.g. Hadchit" required></label>' +
      '<label class="field" id="rqP">Where is it? (district, optional)<input name="place" placeholder="e.g. Bsharri district"></label>' +
      '<div class="muted" id="rqC" style="font-size:14px">Colours: black base, white map, white name, green pin (black only).</div>' +
      '<label class="field">Size (optional)<input name="size" placeholder="Standard is 9 × 15 cm"></label>' +
      '<label class="field">Notes<textarea name="notes" placeholder="Anything special…"></textarea></label>' +
      '<label class="field">Order code (optional)<input name="order" placeholder="3DB-XXXXX"></label>' +
      '<div class="err" id="rqErr"></div><button class="btn pri">Save & copy for Claude</button></form>' +
      '<div style="display:grid;gap:10px;align-self:start">' + (list.length ? list.map(function (r) {
        return '<div class="panel" style="padding:18px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><div><b>' + esc(r.type === 'map' ? 'Village map — ' + r.title : r.title) + '</b><div class="muted" style="font-size:13px">' + esc(r.id) + ' · ' + fmtDate(r.createdAt) + (r.order ? ' · ' + esc(r.order) : '') + '</div></div>' +
          '<select data-rs="' + r.id + '" class="search" style="flex:none;min-width:0;width:auto">' + REQ_STATUS.map(function (s) { return '<option value="' + s[0] + '"' + (r.status === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></div>' +
          (r.notes ? '<p style="font-size:14px;margin:8px 0 0">' + esc(r.notes) + '</p>' : '') +
          '<div class="actions" style="margin-top:12px"><button class="btn sec" data-rc="' + r.id + '">Copy for Claude</button><button class="btn sec" data-rd="' + r.id + '">Delete</button></div></div>';
      }).join('') : '<div class="panel empty"><p class="muted">No requests yet. When a “My Village” order comes in, open it and press “Request 3MF”.</p></div>') + '</div></div>';
    var f = $('#rq');
    var sync = function () { var m = f.type.value === 'map'; $('#rqP').style.display = m ? '' : 'none'; $('#rqC').style.display = m ? '' : 'none'; $('#rqT').firstChild.textContent = m ? 'Village / name on it' : 'What should Claude design?'; $$('.paysel label', f).forEach(function (l) { l.classList.toggle('on', l.querySelector('input').checked); }); };
    f.addEventListener('change', sync); sync();
    f.onsubmit = function (e) {
      e.preventDefault(); if (!f.title.value.trim()) { $('#rqErr').textContent = 'Write the village or what you need.'; return; }
      var data = { type: f.type.value, title: f.title.value.trim(), place: f.place.value.trim(), base: 'black', mapc: 'white', size: f.size.value.trim(), notes: f.notes.value.trim(), order: f.order.value.trim().toUpperCase(), status: 'sent', createdAt: Date.now() };
      Store.saveRequest(null, data).then(function (id) { data.id = id; copy(requestText(data), 'Copied — paste it in your Claude chat'); admRequests(); });
    };
    $$('[data-rc]').forEach(function (b) { b.onclick = function () { var r = list.filter(function (x) { return x.id === b.dataset.rc; })[0]; copy(requestText(r), 'Copied — paste it in your Claude chat'); if (r.status === 'new') Store.saveRequest(r.id, { status: 'sent' }); }; });
    $$('[data-rs]').forEach(function (s) { s.onchange = function () { Store.saveRequest(s.dataset.rs, { status: s.value }).then(function () { toast('Updated'); }); }; });
    $$('[data-rd]').forEach(function (b) { b.onclick = function () { confirmBox('Delete this request?', 'Delete', function () { Store.deleteRequest(b.dataset.rd).then(admRequests); }); }; });
  }

  function admQueue() {
    var orders = Store.orders().filter(function (o) { return ['confirmed', 'printing'].indexOf(o.status) >= 0; });
    var groups = {}, mins = 0;
    orders.forEach(function (o) { o.items.forEach(function (i) {
      if (i.id === 'design') return;
      var k = i.id + '|' + (i.color || ''); var p = Store.product(i.id) || { id: i.id, name: i.name, printMin: i.printMin || 60 };
      if (!groups[k]) groups[k] = { p: p, color: i.color, qty: 0, texts: [], orders: [] };
      groups[k].qty += i.qty; if (i.text) groups[k].texts.push(i.text + (i.qty > 1 ? ' ×' + i.qty : '')); if (groups[k].orders.indexOf(o.code) < 0) groups[k].orders.push(o.code);
      mins += (p.printMin != null ? p.printMin : 60) * i.qty;
    }); });
    var keys = Object.keys(groups);
    $('#admBody').innerHTML = '<div class="panel" style="margin-bottom:14px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:center"><div><b style="font-family:var(--head)">Print queue</b><div class="muted" style="font-size:14px">Everything confirmed or printing, grouped so you can batch plates.</div></div><div class="price">≈ ' + Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm of printing</div></div>' +
      (keys.length ? keys.map(function (k) { var g = groups[k];
        return '<div class="qcard"><div class="th">' + thumb(g.p, { color: g.color, text: g.texts[0] }) + '</div><div><b>' + g.qty + ' × ' + esc(g.p.name) + '</b>' + (g.color ? ' <span class="muted">· ' + esc(g.color) + '</span>' : '') +
          (g.texts.length ? '<div class="names">Names: ' + esc(g.texts.join(', ')) + '</div>' : '') + '<div class="muted" style="font-size:13px;margin-top:2px">' + esc(g.orders.join(', ')) + '</div></div><div class="muted" style="font-size:13px;text-align:right">≈ ' + Math.round((g.p.printMin || 60) * g.qty / 6) / 10 + ' h</div></div>';
      }).join('') : '<div class="panel empty"><p class="muted">Nothing to print. Confirm new orders to fill the queue.</p></div>');
  }


  // ---------- price calculator (owner only) ----------
  var PRESETS = [
    { n: 'Name keychain', g: 6, m: 24, p: 4 }, { n: 'Cedar keychain', g: 7, m: 30, p: 4 }, { n: 'Christmas ornament', g: 10, m: 36, p: 6 },
    { n: 'Phone stand', g: 35, m: 78, p: 9 }, { n: 'Desk name plate', g: 45, m: 108, p: 12 }, { n: 'Centerpiece', g: 60, m: 150, p: 14 },
    { n: 'Scout woggle', g: 5, m: 15, p: 2.5 }, { n: 'Troop keychain', g: 6, m: 18, p: 2 }, { n: 'Custom print', g: 20, m: 60, p: null }
  ];
  var calcIn = Object.assign({ preset: 'Custom print', name: 'Custom print', qty: 1, grams: 20, hours: 1, mins: 0, design: 0, delivery: 3, rush: false, pickup: false, bulk: true, fixed: null }, ls('calc') || {});
  var calcOpen = false, lastQuote = null;

  function calcRun() {
    var S = Store.settings(), c = calcIn;
    var qty = Math.max(1, parseInt(c.qty) || 1), g = +c.grams || 0, h = (+c.hours || 0) + (+c.mins || 0) / 60;
    var design = +c.design || 0, delivery = c.pickup ? 0 : (+c.delivery || 0);
    var mat = g * S.calcPla / 1000, mac = h * S.calcMachine, pack = +S.calcPack, base = mat + mac + pack, fail = base * S.calcFail / 100, unitCost = base + fail;
    var unit = c.fixed != null ? c.fixed : Math.max(Math.ceil(unitCost * S.calcMarkup), +S.calcMin);
    if (c.rush) unit *= 1.25;
    var disc = 0;
    if (c.bulk && c.fixed !== 2 && c.fixed !== 2.5) disc = qty >= 20 ? .35 : qty >= 10 ? .25 : qty >= 3 ? .15 : 0;
    var unitFinal = Math.round(unit * (1 - disc) * 2) / 2, items = unitFinal * qty + design, total = items + delivery, cost = unitCost * qty, profit = items - cost;
    return { qty: qty, unitFinal: unitFinal, disc: disc, design: design, delivery: delivery, items: items, total: total, cost: cost, profit: profit, margin: items > 0 ? profit / items * 100 : 0,
      parts: [mat, mac, pack, fail], unitCost: unitCost, minutes: Math.round(h * 60) };
  }


  // ---------- read a 3D file and estimate weight + time ----------
  var FileCost = (function () {
    function loadZip() {
      if (window.JSZip) return Promise.resolve(window.JSZip);
      return new Promise(function (res, rej) { var sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; sc.onload = function () { res(window.JSZip); }; sc.onerror = function () { rej(new Error('Could not load the 3MF reader')); }; document.head.appendChild(sc); });
    }
    function meshStats(tris) { // tris: Float array of 9 numbers per triangle (mm)
      var vol = 0, area = 0, mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
      for (var i = 0; i < tris.length; i += 9) {
        var ax = tris[i], ay = tris[i + 1], az = tris[i + 2], bx = tris[i + 3], by = tris[i + 4], bz = tris[i + 5], cx = tris[i + 6], cy = tris[i + 7], cz = tris[i + 8];
        vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
        var ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
        var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        area += Math.sqrt(nx * nx + ny * ny + nz * nz) / 2;
        for (var k = 0; k < 9; k += 3) for (var d = 0; d < 3; d++) { var v = tris[i + k + d]; if (v < mn[d]) mn[d] = v; if (v > mx[d]) mx[d] = v; }
      }
      return { vol: Math.abs(vol) / 1000, area: area / 100, size: [0, 1, 2].map(function (d) { return Math.round(mx[d] - mn[d]); }).join(' × ') + ' mm' };
    }
    function estimate(st, S) {
      var shell = Math.min(st.vol, st.area * 0.1); // ~1 mm of walls / top / bottom
      var grams = 1.24 * (shell + (st.vol - shell) * (S.calcInfill || 15) / 100);
      var minutes = grams / (S.calcGph || 15) * 60 + 8;
      return { grams: grams, minutes: minutes, volume: st.vol, size: st.size, exact: false };
    }
    function parseSTL(buf) {
      var dv = new DataView(buf), n = buf.byteLength >= 84 ? dv.getUint32(80, true) : 0;
      if (n > 0 && 84 + n * 50 === buf.byteLength) {
        var t = new Float32Array(n * 9);
        for (var i = 0; i < n; i++) for (var j = 0; j < 9; j++) t[i * 9 + j] = dv.getFloat32(84 + i * 50 + 12 + j * 4, true);
        return t;
      }
      var txt = new TextDecoder().decode(buf), re = /vertex\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)/g, m, a = [];
      while ((m = re.exec(txt))) a.push(+m[1], +m[2], +m[3]);
      if (!a.length) throw new Error('This STL looks empty');
      return new Float32Array(a);
    }
    function parseOBJ(txt) {
      var v = [], t = [];
      txt.split('\n').forEach(function (l) {
        var p = l.trim().split(/\s+/);
        if (p[0] === 'v') v.push([+p[1], +p[2], +p[3]]);
        else if (p[0] === 'f') { var ix = p.slice(1).map(function (q) { var k = parseInt(q, 10); return k < 0 ? v.length + k : k - 1; }); for (var i = 1; i + 1 < ix.length; i++) [ix[0], ix[i], ix[i + 1]].forEach(function (k) { t.push(v[k][0], v[k][1], v[k][2]); }); }
      });
      return new Float32Array(t);
    }
    function parse3MFModel(xml) {
      var d = new DOMParser().parseFromString(xml, 'application/xml'), out = [];
      Array.prototype.forEach.call(d.getElementsByTagName('mesh'), function (mesh) {
        var vs = mesh.getElementsByTagName('vertex'), v = new Float32Array(vs.length * 3);
        for (var i = 0; i < vs.length; i++) { v[i * 3] = +vs[i].getAttribute('x'); v[i * 3 + 1] = +vs[i].getAttribute('y'); v[i * 3 + 2] = +vs[i].getAttribute('z'); }
        var ts = mesh.getElementsByTagName('triangle');
        for (var j = 0; j < ts.length; j++) ['v1', 'v2', 'v3'].forEach(function (a) { var k = +ts[j].getAttribute(a) * 3; out.push(v[k], v[k + 1], v[k + 2]); });
      });
      return out;
    }
    function gcodeHeader(txt) { // Bambu / Orca / Prusa comments
      var g = txt.match(/total filament weight \[g\]\s*:\s*([\d.]+)/i) || txt.match(/filament used \[g\]\s*=\s*([\d.]+)/i);
      var t = txt.match(/(?:model printing time|total estimated time|estimated printing time \(normal mode\))\s*[:=]\s*([^;\n]+)/i);
      if (!g || !t) return null;
      var s = 0, tm = t[1]; [['d', 86400], ['h', 3600], ['m', 60], ['s', 1]].forEach(function (u) { var mm = tm.match(new RegExp('(\\d+)\\s*' + u[0])); if (mm) s += +mm[1] * u[1]; });
      return { grams: +g[1], minutes: s / 60, exact: true };
    }
    return {
      read: function (file, S) {
        var name = file.name.replace(/\.(gcode\.3mf|3mf|stl|gcode|obj)$/i, '').replace(/[_-]+/g, ' ').trim() || 'Custom print';
        var ext = (file.name.match(/\.(gcode\.3mf|3mf|stl|gcode|obj)$/i) || [, ''])[1].toLowerCase();
        var done = function (r) { r.name = name; r.file = file.name; return r; };
        if (!ext) return Promise.reject(new Error('Use an STL, 3MF, OBJ or G-code file'));
        if (file.size > 150e6) return Promise.reject(new Error('File is too big (max 150 MB)'));
        return file.arrayBuffer().then(function (buf) {
          if (ext === 'stl') return done(estimate(meshStats(parseSTL(buf)), S));
          if (ext === 'obj') return done(estimate(meshStats(parseOBJ(new TextDecoder().decode(buf))), S));
          if (ext === 'gcode') { var h = gcodeHeader(new TextDecoder().decode(buf.slice(0, Math.min(buf.byteLength, 400000)))) || gcodeHeader(new TextDecoder().decode(buf.slice(Math.max(0, buf.byteLength - 400000)))); if (!h) throw new Error('No weight/time found in this G-code'); return done(h); }
          return loadZip().then(function (JSZip) { return JSZip.loadAsync(buf); }).then(function (zip) {
            var info = zip.file(/slice_info\.config$/i)[0];
            if (info) return info.async('string').then(function (x) {
              var d = new DOMParser().parseFromString(x, 'application/xml'), g = 0, sec = 0, plates = 0;
              Array.prototype.forEach.call(d.getElementsByTagName('plate'), function (pl) {
                var md = {}; Array.prototype.forEach.call(pl.getElementsByTagName('metadata'), function (m) { md[m.getAttribute('key')] = m.getAttribute('value'); });
                if (md.weight || md.prediction) { plates++; g += +md.weight || 0; sec += +md.prediction || 0; }
              });
              if (!plates) return null;
              return { grams: g, minutes: sec / 60, exact: true, plates: plates };
            }).then(function (r) { return r || fromMeshes(zip); });
            return fromMeshes(zip);
          }).then(done);
          function fromMeshes(zip) {
            var files = zip.file(/\.model$/i);
            if (!files.length) throw new Error('No 3D model found inside this 3MF');
            return Promise.all(files.map(function (f) { return f.async('string'); })).then(function (xs) {
              var all = []; xs.forEach(function (x) { all = all.concat(parse3MFModel(x)); });
              if (!all.length) throw new Error('No 3D model found inside this 3MF');
              return estimate(meshStats(new Float32Array(all)), S);
            });
          }
        });
      }
    };
  })();

  function admCalc() {
    var S = Store.settings(), c = calcIn;
    var num = function (id, label, val, step, extra) { return '<label class="field">' + label + '<input type="number" id="' + id + '" min="0" step="' + step + '" value="' + esc(val) + '"' + (extra || '') + '></label>'; };
    $('#admBody').innerHTML = '<div class="calc"><div style="display:grid;gap:16px"><div class="panel">' +
      '<h3>1 · Drop your file</h3><label class="drop" id="c_drop"><input type="file" id="c_file" accept=".stl,.3mf,.gcode,.obj" hidden><b>Drop a file here or tap to choose</b><span>Best: the sliced <b>.gcode.3mf</b> from Bambu Studio (File → Export → Export plate sliced file) gives the exact weight and time. STL / 3MF also work as an estimate.</span></label><div id="c_fileinfo"></div>' +
      '<h3 style="margin-top:22px">…or pick a product</h3><div class="presets">' + PRESETS.map(function (p) { return '<button class="preset' + (c.preset === p.n ? ' on' : '') + '" data-pr="' + esc(p.n) + '">' + esc(p.n) + '</button>'; }).join('') + '</div>' +
      '<h3>2 · Print details</h3><div class="grid2">' +
        '<label class="field">Product name<input id="c_name" value="' + esc(c.name) + '"></label>' + num('c_qty', 'Quantity', c.qty, 1, ' min="1"') +
        num('c_grams', 'Weight per piece (g)', c.grams, 1) +
        '<label class="field">Print time per piece<div class="grid2" style="gap:8px"><input type="number" id="c_hours" min="0" step="1" value="' + esc(c.hours) + '" aria-label="Hours" placeholder="h"><input type="number" id="c_mins" min="0" max="59" step="5" value="' + esc(c.mins) + '" aria-label="Minutes" placeholder="min"></div></label>' +
        num('c_design', 'Design / personalization fee ($, whole order)', c.design, 1) + num('c_delivery', 'Delivery ($)', c.delivery, 0.5) +
      '</div><div class="toggles"><label class="tog"><input type="checkbox" id="c_rush"' + (c.rush ? ' checked' : '') + '> Rush (24 h) +25%</label><label class="tog"><input type="checkbox" id="c_pickup"' + (c.pickup ? ' checked' : '') + '> Free pickup</label><label class="tog"><input type="checkbox" id="c_bulk"' + (c.bulk ? ' checked' : '') + '> Quantity discount</label></div>' +
      '<p class="hint">Discount: 3+ pieces −15%, 10+ −25%, 20+ −35%. Weight and time come straight from Bambu Studio after slicing.</p></div>' +
      '<div class="panel"><button class="upl" id="c_tog" style="font-size:15px">' + (calcOpen ? '▾' : '▸') + ' Cost settings</button><div id="c_set"' + (calcOpen ? '' : ' class="hidden"') + ' style="margin-top:14px"><div class="grid3">' +
        num('s_calcPla', 'PLA price ($/kg)', S.calcPla, 0.5) + num('s_calcMachine', 'Machine cost ($/hour)', S.calcMachine, 0.05) + num('s_calcPack', 'Packaging ($/piece)', S.calcPack, 0.05) +
        num('s_calcFail', 'Failure buffer (%)', S.calcFail, 1) + num('s_calcMarkup', 'Markup (× cost)', S.calcMarkup, 0.1) + num('s_calcMin', 'Minimum price / piece ($)', S.calcMin, 0.5) + num('s_calcInfill', 'Infill % (for STL estimates)', S.calcInfill, 5) + num('s_calcGph', 'Print speed (grams / hour)', S.calcGph, 1) +
      '</div><p class="hint">Machine cost = electricity (~$0.05/h on generator power) + wear and spares (~$0.30/h). Saved to your shop settings.</p></div></div></div>' +
      '<div class="panel res"><div class="lbl">Customer pays</div><div class="big" id="r_total"></div><div class="muted" id="r_sub" style="font-size:15px"></div>' +
      '<div class="stats"><div class="stat"><div class="k">Your cost</div><div class="v" id="r_cost"></div></div><div class="stat"><div class="k">Profit</div><div class="v good" id="r_profit"></div></div><div class="stat"><div class="k">Margin</div><div class="v good" id="r_margin"></div></div></div>' +
      '<div class="lbl">Where your cost goes</div><div class="bar"><div id="b0" style="background:#1A8CFF"></div><div id="b1" style="background:#7ABEFF"></div><div id="b2" style="background:#0B1220"></div><div id="b3" style="background:#B4BDC9"></div></div>' +
      '<div class="legend"><div><span style="background:#1A8CFF"></span>Filament<b id="l0"></b></div><div><span style="background:#7ABEFF"></span>Machine<b id="l1"></b></div><div><span style="background:#0B1220"></span>Packaging<b id="l2"></b></div><div><span style="background:#B4BDC9"></span>Failure buffer<b id="l3"></b></div></div>' +
      '<div class="lbl">WhatsApp quote</div><div class="quote" id="r_quote"></div>' +
      '<div class="actions"><button class="btn pri" id="c_copy" style="flex:1">Copy quote</button><button class="btn sec" id="c_order" style="flex:1">Turn into order</button></div></div></div>';

    var save = function () { ls('calc', calcIn); };
    var draw = function () {
      var r = calcRun(), m = money;
      $('#r_total').textContent = m(r.total);
      $('#r_sub').innerHTML = '<b style="color:var(--text)">' + r.qty + ' × ' + m(r.unitFinal) + '</b>' + (r.disc ? ' (−' + Math.round(r.disc * 100) + '%)' : '') + (r.design ? ' + ' + m(r.design) + ' design' : '') + (r.delivery ? ' + ' + m(r.delivery) + ' delivery' : ' · pickup');
      $('#r_cost').textContent = m(r.cost); $('#r_profit').textContent = m(r.profit); $('#r_margin').textContent = Math.round(r.margin) + '%';
      var sum = r.unitCost || 1; r.parts.forEach(function (v, i) { $('#b' + i).style.width = (v / sum * 100) + '%'; $('#l' + i).textContent = m(v * r.qty); });
      var name = calcIn.name || 'Custom print';
      lastQuote = 'Hey! Here’s your 3DBlaze quote ⚡\n' + name + ' × ' + r.qty + ' — ' + m(r.unitFinal * r.qty) + '\n' + (r.design ? 'Design / personalization — ' + m(r.design) + '\n' : '') +
        (r.delivery ? 'Delivery — ' + m(r.delivery) + '\n' : 'Free pickup\n') + 'Total: ' + m(r.total) + (r.delivery ? ' (cash on delivery or Whish)' : '') + '\nReady in ' + (calcIn.rush ? '24 hours' : '3 days') + '. Reply YES to confirm 🙌';
      $('#r_quote').textContent = lastQuote;
      return r;
    };
    var bind = function (id, key, kind) {
      var el = $('#' + id);
      el.addEventListener(kind === 'check' ? 'change' : 'input', function () {
        calcIn[key] = kind === 'check' ? el.checked : kind === 'text' ? el.value : el.value;
        if (['grams', 'hours', 'mins'].indexOf(key) >= 0) { calcIn.fixed = null; calcIn.fileInfo = null; }
        save(); draw();
      });
    };
    var fin = $('#c_file'), drop = $('#c_drop');
    var useFile = function (f) {
      if (!f) return;
      $('#c_fileinfo').innerHTML = '<p class="muted" style="font-size:14px">Reading ' + esc(f.name) + '…</p>';
      FileCost.read(f, Store.settings()).then(function (r) {
        var mins = Math.max(1, Math.round(r.minutes));
        Object.assign(calcIn, { preset: null, name: r.name, grams: Math.round(r.grams * 10) / 10, hours: Math.floor(mins / 60), mins: mins % 60, fixed: null, fileInfo: r });
        save(); admCalc();
      }).catch(function (e) { $('#c_fileinfo').innerHTML = '<p class="err" style="font-size:14px">' + esc(e.message || 'Could not read this file') + '</p>'; });
    };
    fin.onchange = function () { useFile(fin.files[0]); };
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
    drop.addEventListener('drop', function (e) { useFile(e.dataTransfer.files[0]); });
    if (calcIn.fileInfo) { var fi = calcIn.fileInfo; $('#c_fileinfo').innerHTML = '<div class="note" style="margin-top:12px"><b>' + esc(fi.file) + '</b> — ' + (fi.exact ? '✓ exact from Bambu slice' : 'estimate from model') + '<br>' + Math.round(fi.grams * 10) / 10 + ' g · ' + Math.floor(fi.minutes / 60) + 'h ' + Math.round(fi.minutes % 60) + 'm' + (fi.volume ? ' · ' + fi.volume.toFixed(1) + ' cm³ · ' + fi.size : '') + (fi.plates > 1 ? ' · ' + fi.plates + ' plates' : '') + '</div>'; }
    bind('c_name', 'name', 'text'); ['qty', 'grams', 'hours', 'mins', 'design', 'delivery'].forEach(function (k) { bind('c_' + k, k); });
    ['rush', 'pickup', 'bulk'].forEach(function (k) { bind('c_' + k, k, 'check'); });
    $$('[data-pr]').forEach(function (b) { b.onclick = function () {
      var p = PRESETS.filter(function (x) { return x.n === b.dataset.pr; })[0];
      Object.assign(calcIn, { preset: p.n, name: p.n, grams: p.g, hours: Math.floor(p.m / 60), mins: p.m % 60, fixed: p.p, fileInfo: null }); save(); admCalc();
    }; });
    var st;
    ['calcPla', 'calcMachine', 'calcPack', 'calcFail', 'calcMarkup', 'calcMin', 'calcInfill', 'calcGph'].forEach(function (k) {
      var el = $('#s_' + k);
      el.addEventListener('input', function () { Store.settings()[k] = +el.value || 0; draw(); clearTimeout(st); st = setTimeout(function () { var o = {}; ['calcPla', 'calcMachine', 'calcPack', 'calcFail', 'calcMarkup', 'calcMin', 'calcInfill', 'calcGph'].forEach(function (x) { o[x] = +$('#s_' + x).value || 0; }); Store.saveSettings(o); }, 700); });
    });
    $('#c_tog').onclick = function () { calcOpen = !calcOpen; $('#c_set').classList.toggle('hidden', !calcOpen); this.textContent = (calcOpen ? '▾' : '▸') + ' Cost settings'; };
    $('#c_copy').onclick = function () { copy(lastQuote, 'Quote copied'); };
    $('#c_order').onclick = function () {
      var r = draw();
      modal('<h3 style="font-size:20px;margin-bottom:6px">New order from quote</h3><p class="muted" style="margin:0 0 16px">' + esc(calcIn.name) + ' × ' + r.qty + ' · total ' + money(r.total) + '</p><form id="mo" style="display:grid;gap:12px"><div class="grid2"><label class="field">Customer name<input name="name"></label><label class="field">Phone<input name="phone" type="tel"></label></div>' +
        '<div class="grid2"><label class="field">Area<select name="region">' + REGIONS.map(function (x) { return '<option>' + esc(x[0]) + '</option>'; }).join('') + '</select></label><label class="field">Town<input name="town"></label></div>' +
        '<label class="field">Address / notes<input name="address"></label><div class="grid2"><label class="field">Payment<select name="payment"><option value="cash">Cash on delivery</option><option value="whish">Whish</option></select></label><label class="field">Personalization (optional)<input name="text"></label></div><div class="err" id="moErr"></div><button class="btn pri">Create order</button></form>', function (box, close) {
        box.querySelector('#mo').onsubmit = function (e) {
          e.preventDefault(); var f = e.target; if (!f.name.value.trim()) { box.querySelector('#moErr').textContent = 'Add the customer name.'; return; }
          var now = Date.now(), sub = r.items;
          var o = { code: newCode(), createdAt: now, status: 'confirmed', paid: false, payment: f.payment.value, method: calcIn.pickup ? 'pickup' : 'delivery', source: 'manual',
            customer: { name: f.name.value.trim(), phone: f.phone.value.replace(/[^\d+]/g, ''), region: calcIn.pickup ? '' : f.region.value, town: f.town.value.trim(), address: f.address.value.trim(), notes: '' },
            items: [{ id: 'custom', name: calcIn.name || 'Custom print', price: r.unitFinal, qty: r.qty, color: null, text: f.text.value.trim() || null, printMin: r.minutes, unitCost: Math.round(r.unitCost * 100) / 100 }].concat(r.design ? [{ id: 'design', name: 'Design / personalization', price: r.design, qty: 1, color: null, text: null, printMin: 0 }] : []),
            subtotal: sub, delivery: r.delivery, total: r.total, history: [{ s: 'confirmed', t: now }] };
          Store.placeOrder(o).then(function () { close(); adm.tab = 'orders'; adm.filter = 'active'; renderAdmin(); toast('Order ' + o.code + ' created'); });
        };
      });
    };
    draw();
  }

  function admProducts() {
    var list = Store.products();
    $('#admBody').innerHTML = '<div class="panel" style="margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div><b style="font-family:var(--head)">Products</b><div class="muted" style="font-size:14px">These are <b>example items</b> to show the layout. Edit, remove or replace them with what you actually sell, and upload real photos.</div></div><button class="btn pri" id="addP" style="min-height:44px;padding:10px 16px;font-size:14px">+ Add product</button></div>' +
      list.map(function (p) {
        var pc = p.grams != null ? pieceCost(p.grams, p.printMin) : null;
        var costLine = pc == null ? '<div class="muted" style="font-size:12px;margin-top:3px">No print file yet — add one to see cost & profit</div>' :
          '<div style="font-size:12px;margin-top:3px;color:#2C3443">' + (Math.round(p.grams * 10) / 10) + ' g · ' + Math.floor(p.printMin / 60) + 'h ' + Math.round(p.printMin % 60) + 'm' + (p.printFile ? ' · ' + esc(p.printFile) : '') + (p.printExact ? ' ✓' : ' (estimate)') + '<br>Cost ' + money(pc) + ' · <b style="color:' + (p.price - pc > 0 ? 'var(--green)' : 'var(--red)') + '">profit ' + money(p.price - pc) + ' (' + (p.price > 0 ? Math.round((p.price - pc) / p.price * 100) : 0) + '%)</b> per piece</div>';
        return '<div class="prow" data-p="' + p.id + '"><div class="th">' + thumb(p) + '</div><div><b>' + esc(p.name) + '</b><div class="muted" style="font-size:13px">' + (p.col === 'xmas' ? 'Christmas' : 'Lebanon drop') + ' · <button class="upl" data-ed="' + p.id + '">Edit</button> · <button class="upl" data-bf="' + p.id + '">' + (p.grams != null ? 'Replace Bambu file' : '+ Bambu file') + '</button> · <button class="upl" data-up="' + p.id + '">' + (p.photo ? 'Change photo' : 'Upload photo') + '</button> · <button class="upl" data-opt="' + p.id + '">Colours & photos' + (optList(p).length ? ' (' + optList(p).length + ')' : '') + '</button> · <button class="upl" data-del="' + p.id + '">Remove</button></div>' + costLine + '</div>' +
          '<label class="field" style="font-size:12px">Price $<input type="number" min="0" step="0.5" value="' + p.price + '" data-price="' + p.id + '"></label>' +
          '<label class="switch"><input type="checkbox" data-av="' + p.id + '"' + (p.available === false ? '' : ' checked') + '> On sale</label>' +
          '<label class="switch"><input type="checkbox" data-so="' + p.id + '"' + (p.soldOut ? ' checked' : '') + '> Sold out</label></div>';
      }).join('') + '<input type="file" accept="image/*" id="photoIn" class="hidden"><input type="file" accept=".3mf,.gcode,.stl,.obj" id="bambuIn" class="hidden">';
    var target = null;
    $$('[data-price]').forEach(function (i) { i.onchange = function () { Store.saveProduct(i.dataset.price, { price: Math.max(0, +i.value || 0) }).then(function () { toast('Price saved'); }); }; });
    $$('[data-av]').forEach(function (i) { i.onchange = function () { Store.saveProduct(i.dataset.av, { available: i.checked }).then(function () { toast(i.checked ? 'Back on sale' : 'Hidden as unavailable'); }); }; });
    $$('[data-so]').forEach(function (i) { i.onchange = function () { Store.saveProduct(i.dataset.so, { soldOut: i.checked }).then(function () { toast(i.checked ? 'Marked sold out' : 'Back in stock'); }); }; });
    $$('[data-up]').forEach(function (b) { b.onclick = function () { target = b.dataset.up; $('#photoIn').click(); }; });
    var bTarget = null;
    $$('[data-bf]').forEach(function (b) { b.onclick = function () { bTarget = b.dataset.bf; $('#bambuIn').value = ''; $('#bambuIn').click(); }; });
    $('#bambuIn').onchange = function (e) {
      var f = e.target.files[0]; if (!f || !bTarget) return;
      toast('Reading ' + f.name + '…');
      FileCost.read(f, Store.settings()).then(function (r) {
        return Store.saveProduct(bTarget, { grams: Math.round(r.grams * 10) / 10, printMin: Math.max(1, Math.round(r.minutes)), printFile: f.name, printExact: !!r.exact }).then(function () {
          toast((r.exact ? 'Exact from Bambu: ' : 'Estimate: ') + Math.round(r.grams) + ' g, ' + Math.floor(r.minutes / 60) + 'h ' + Math.round(r.minutes % 60) + 'm'); admProducts();
        });
      }).catch(function (err) { toast(err.message || 'Could not read that file'); });
    };
    $$('[data-opt]').forEach(function (b) { b.onclick = function () { optionsModal(b.dataset.opt); }; });
    $$('[data-del]').forEach(function (b) { b.onclick = function () { var p = Store.product(b.dataset.del); confirmBox('Remove “' + p.name + '” from the shop?', 'Remove', function () { Store.saveProduct(p.id, { removed: true }).then(function () { toast('Removed'); admProducts(); }); }); }; });
    $$('[data-ed]').forEach(function (b) { b.onclick = function () { var p = Store.product(b.dataset.ed);
      modal('<h3 style="font-size:20px;margin-bottom:16px">Edit product</h3><form id="ep" style="display:grid;gap:12px"><label class="field">Name<input name="name" value="' + esc(p.name) + '"></label><div class="grid2"><label class="field">Price $<input name="price" type="number" min="0" step="0.5" value="' + p.price + '"></label><label class="field">Collection<select name="col"><option value="lebanon"' + (p.col !== 'xmas' ? ' selected' : '') + '>Lebanon drop</option><option value="xmas"' + (p.col === 'xmas' ? ' selected' : '') + '>Christmas</option></select></label></div><label class="field">Label on the card (e.g. New, Bestseller)<input name="tag" value="' + esc(p.tag || '') + '"></label><label class="field">Short line<input name="blurb" value="' + esc(p.blurb || '') + '"></label><label class="field">Description<textarea name="desc">' + esc(p.desc || '') + '</textarea></label><label class="field">Details (one per line)<textarea name="specs">' + esc((p.specs || []).join('\n')) + '</textarea></label>' + (optList(p).length ? '<div class="muted" style="font-size:13px">Colours are set in <b>Colours & photos</b> (' + optList(p).map(function (o) { return esc(o.name); }).join(', ') + ').</div>' : '<label class="field">Colours to choose from (comma separated, empty = none)<input name="colors" value="' + esc((p.colors || []).join(', ')) + '"><small class="muted" style="font-weight:400">To add a photo for each colour, use <b>Colours & photos</b> instead.</small></label>') + '<label class="field">Personalization question (empty = none)<input name="tq" value="' + esc(p.text ? p.text.label : '') + '"></label><button class="btn pri">Save</button></form>', function (box, close) {
        box.querySelector('#ep').onsubmit = function (e) { e.preventDefault(); var f = e.target;
          var cols = (f.colors ? f.colors.value : (p.colors || []).join(',')).split(',').map(function (c) { return c.trim().toLowerCase(); }).filter(Boolean);
          Store.saveProduct(p.id, { name: f.name.value.trim() || p.name, price: Math.max(0, +f.price.value || 0), col: f.col.value, tag: f.tag.value.trim(), blurb: f.blurb.value.trim(), desc: f.desc.value.trim(),
            specs: f.specs.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean), colors: cols.length ? cols : null,
            text: f.tq.value.trim() ? { label: f.tq.value.trim(), max: (p.text && p.text.max) || 20, ph: '', required: true } : null }).then(function () { close(); toast('Saved'); admProducts(); });
        };
      }); }; });
    $('#photoIn').onchange = function (e) { var f = e.target.files[0]; if (!f || !target) return; resizeImage(f, 900, function (url) { Store.saveProduct(target, { photo: url }).then(function () { toast('Photo saved'); admProducts(); }); }); };
    $('#addP').onclick = function () {
      modal('<h3 style="font-size:20px;margin-bottom:16px">New product</h3><form id="np" style="display:grid;gap:12px"><label class="field">Name<input name="name" required></label><div class="grid2"><label class="field">Price $<input name="price" type="number" min="0" step="0.5" required></label><label class="field">Collection<select name="col"><option value="lebanon">Lebanon drop</option><option value="xmas">Christmas</option></select></label></div><label class="field">Short line<input name="blurb"></label><label class="field">Description<textarea name="desc"></textarea></label><label class="field">Photo<input name="photo" type="file" accept="image/*"></label><div class="err" id="npErr"></div><button class="btn pri">Add product</button></form>', function (box, close) {
        box.querySelector('#np').onsubmit = function (e) {
          e.preventDefault(); var f = e.target; if (!f.name.value.trim() || !(+f.price.value > 0)) { box.querySelector('#npErr').textContent = 'Name and price are needed.'; return; }
          var save = function (photo) { Store.addProduct({ name: f.name.value.trim(), price: +f.price.value, col: f.col.value, blurb: f.blurb.value.trim(), desc: f.desc.value.trim(), photo: photo || null, printMin: 60, specs: [] }).then(function () { close(); toast('Product added'); admProducts(); }); };
          if (f.photo.files[0]) resizeImage(f.photo.files[0], 900, save); else save(null);
        };
      });
    };
  }

  function optionsModal(id) {
    var p = Store.product(id); if (!p) return;
    var arr = optList(p).map(function (o) { return { name: o.name, photo: o.photo || null, out: !!o.out }; });
    if (!arr.length && p.colors && p.colors.length) arr = p.colors.map(function (c) { return { name: c.charAt(0).toUpperCase() + c.slice(1), photo: null, out: false }; });
    modal('<h3 style="font-size:20px;margin:0 40px 6px 0">Colours & photos · ' + esc(p.name) + '</h3><p class="muted" style="font-size:14px;margin:0 0 16px">One line per colour. Click <b>Add photo</b> to give each colour its own picture, then <b>Save</b>. Customers see them in this order.</p>' +
      '<label class="field" style="margin-bottom:14px">Title above the choices<input id="oLab" value="' + esc(p.optLabel || 'Colour') + '" maxlength="24"></label>' +
      '<div id="oList"></div><button class="btn sec" id="oAdd" style="margin-top:6px">+ Add colour</button><div class="err" id="oErr"></div>' +
      '<div class="actions" style="margin-top:18px"><button class="btn pri" id="oSave">Save</button></div><input type="file" accept="image/*" id="oPhoto" class="hidden">', function (box, close) {
      var q = function (s) { return box.querySelector(s); }, qa = function (s) { return [].slice.call(box.querySelectorAll(s)); }, tgt = null;
      var render = function () {
        q('#oList').innerHTML = arr.length ? arr.map(function (o, i) {
          return '<div class="optrow"><div class="ophw"><button class="oth" data-ph="' + i + '" title="Choose photo">' + (o.photo ? '<img src="' + o.photo + '" alt="">' : '<span>No photo</span>') + '</button><button class="ophb" data-ph="' + i + '">' + (o.photo ? 'Change photo' : 'Add photo') + '</button></div>' +
            '<input data-n="' + i + '" value="' + esc(o.name) + '" placeholder="Colour name, e.g. Black" maxlength="24" aria-label="Colour name">' +
            '<label class="switch"><input type="checkbox" data-out="' + i + '"' + (o.out ? ' checked' : '') + '> Sold out</label>' +
            '<div class="obtn"><button data-mv="' + i + '" data-d="-1" aria-label="Move up"' + (i ? '' : ' disabled') + '>↑</button><button data-mv="' + i + '" data-d="1" aria-label="Move down"' + (i < arr.length - 1 ? '' : ' disabled') + '>↓</button><button data-rmo="' + i + '" aria-label="Remove">✕</button></div></div>';
        }).join('') : '<div class="muted" style="font-size:14px;padding:10px 0">No colours yet. Click “+ Add colour”.</div>';
        qa('[data-n]').forEach(function (i) { i.oninput = function () { arr[+i.dataset.n].name = i.value; }; });
        qa('[data-out]').forEach(function (i) { i.onchange = function () { arr[+i.dataset.out].out = i.checked; }; });
        qa('[data-ph]').forEach(function (b) { b.onclick = function () { tgt = +b.dataset.ph; q('#oPhoto').value = ''; q('#oPhoto').click(); }; });
        qa('[data-mv]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.mv, j = i + +b.dataset.d; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; render(); }; });
        qa('[data-rmo]').forEach(function (b) { b.onclick = function () { arr.splice(+b.dataset.rmo, 1); render(); }; });
      };
      render();
      q('#oPhoto').onchange = function (e) { var f = e.target.files[0]; if (!f || tgt == null) return; var i = tgt; resizeImage(f, 800, function (url) { arr[i].photo = url; render(); }); };
      q('#oAdd').onclick = function () { arr.push({ name: '', photo: null, out: false }); render(); var ins = qa('[data-n]'); ins[ins.length - 1].focus(); };
      q('#oSave').onclick = function () {
        var clean = arr.map(function (o) { return { name: String(o.name || '').trim(), photo: o.photo || null, out: !!o.out }; });
        var seen = {}, bad = '';
        clean.forEach(function (o) { var k = o.name.toLowerCase(); if (!o.name) bad = 'Every colour needs a name.'; else if (seen[k]) bad = '“' + o.name + '” is there twice.'; seen[k] = 1; });
        if (bad) { q('#oErr').textContent = bad; return; }
        var lab = q('#oLab').value.trim() || 'Colour';
        q('#oSave').disabled = true;
        Store.saveProduct(id, { options: clean.length ? clean : null, optLabel: lab === 'Colour' ? null : lab, colors: clean.length ? clean.map(function (o) { return o.name.toLowerCase(); }) : null }).then(function () { close(); toast('Colours & photos saved'); admProducts(); })
          .catch(function () { q('#oSave').disabled = false; q('#oErr').textContent = 'Could not save — check you are signed in, then try again.'; });
      };
    });
  }

  function admSettings() {
    var s = Store.settings();
    var f = function (k, l, t, ph) { return '<label class="field">' + l + '<input name="' + k + '" type="' + (t || 'text') + '" value="' + esc(s[k]) + '" placeholder="' + esc(ph || '') + '"' + (t === 'number' ? ' min="0" step="0.5"' : '') + '></label>'; };
    $('#admBody').innerHTML = '<form class="panel" id="st" style="display:grid;gap:18px;max-width:760px">' +
      '<div><b style="font-family:var(--head)">Contact & payment</b><div class="grid2" style="margin-top:12px">' + f('whatsapp', 'WhatsApp number (orders go here)', 'tel', '70 123 456') + f('instagram', 'Instagram handle', 'text') + f('whish', 'Whish number', 'tel', '70 123 456') + f('whishName', 'Whish account name') + '</div></div>' +
      '<div><b style="font-family:var(--head)">Delivery</b><div class="grid2" style="margin-top:12px">' + f('feeBeirut', 'Beirut fee $', 'number') + f('feeMount', 'Mount Lebanon fee $', 'number') + f('feeOther', 'Rest of Lebanon fee $', 'number') + f('freeOver', 'Free delivery over $ (0 = never)', 'number') + '</div>' +
        '<label class="switch" style="margin-top:12px"><input type="checkbox" name="pickup"' + (s.pickup ? ' checked' : '') + '> Offer free pickup</label></div>' +
      '<div><b style="font-family:var(--head)">Shop</b><div style="display:grid;gap:12px;margin-top:12px">' + f('banner', 'Top banner text') + f('xmasCutoff', 'Christmas order cut-off', 'date') +
        '<label class="switch"><input type="checkbox" name="open"' + (s.open !== false ? ' checked' : '') + '> Shop open for orders</label></div></div>' +
      '<button class="btn pri" style="justify-self:start">Save settings</button></form>';
    $('#st').onsubmit = function (e) {
      e.preventDefault(); var t = e.target, out = {};
      ['whatsapp', 'instagram', 'whish', 'whishName', 'banner', 'xmasCutoff'].forEach(function (k) { out[k] = t[k].value.trim(); });
      ['feeBeirut', 'feeMount', 'feeOther', 'freeOver'].forEach(function (k) { out[k] = Math.max(0, +t[k].value || 0); });
      out.pickup = t.pickup.checked; out.open = t.open.checked; out.instagram = out.instagram.replace(/^@/, '');
      Store.saveSettings(out).then(function () { toast('Settings saved'); renderAdmin(); });
    };
  }

  // ---------- router ----------
  function route() {
    var h = (location.hash || '#home').slice(1);
    var s = Store.settings(), an = $('#announce');
    an.textContent = s.banner || ''; an.classList.toggle('hidden', !s.banner || !!window.BLAZE_ADMIN);
    if (window.BLAZE_ADMIN) return viewAdmin();
    if (h !== 'admin') document.title = '3DBlaze — Personalized 3D printed gifts';
    if (h === 'home' || h === '') return viewHome();
    if (h === 'shop' || h === 'christmas' || h === 'faq' || h === 'make' || h === 'how') return viewHome(h);
    if (h.indexOf('p-') === 0) return viewProduct(h.slice(2));
    if (h === 'cart') return viewCart();
    if (h === 'checkout') return viewCheckout();
    if (h.indexOf('order-') === 0) return viewDone(h.slice(6));
    if (h === 'track') return viewTrack();
    if (h.indexOf('track-') === 0) return viewTrack(decodeURIComponent(h.slice(6)));
    if (h === 'admin') return viewHome();
    viewHome();
  }

  window.addEventListener('hashchange', route);
  Cart.save();
  Presence.on(function (n) { var el = document.getElementById('liveNow'); if (el) el.textContent = n; });
  Store.init().then(function () {
    Presence.start();
    if (Store.ready() || window.BLAZE_ADMIN) route();
    else {
      app.innerHTML = '<div class="wrap page" style="min-height:60vh;display:flex;align-items:center;justify-content:center"><div class="muted" style="font-size:15px">Loading the shop…</div></div>';
      setTimeout(function () { if (!Store.ready()) route(); }, 4000);
    }
    // Re-draw the shop whenever products / settings arrive or change, so photos, prices and stock are always current.
    // Pages where the customer is typing (checkout, product page after first draw) are not redrawn under them.
    var drawnRev = Store.ready() ? Store.rev() : -1, firstFull = Store.ready(), redrawT = null;
    Store.on(function () {
      var cc = $('#cartCount'); if (cc) cc.textContent = Cart.count();
      if (window.BLAZE_ADMIN) { if (Store.user() && !document.querySelector('.modal')) renderAdmin(); return; }
      if (!Store.ready() || Store.rev() === drawnRev) return;
      clearTimeout(redrawT);
      redrawT = setTimeout(function () {
        if (Store.rev() === drawnRev) return;
        var h = (location.hash || '#home').slice(1), first = !firstFull;
        drawnRev = Store.rev(); firstFull = true;
        var calm = h === '' || h === 'home' || h === 'shop' || h === 'christmas' || h === 'faq' || h === 'cart' || h === 'track' || h.indexOf('order-') === 0;
        if (!first && !calm) return;
        var y = window.scrollY, typing = document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
        if (!first && typing) return;
        route();
        if (!first) { try { window.scrollTo({ top: y, behavior: 'instant' }); } catch (e) { window.scrollTo(0, y); } }
      }, 120);
    });
  });
})();
