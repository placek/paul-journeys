(function () {
  var J = window.PAUL_JOURNEYS, active = {};
  J.forEach(function (j) { active[j.id] = true; });
  var INK = '#2a2016', PARCH = '#efe6d2';

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var cur = null, curMap = null;
  function init() {
    var el = document.getElementById('pmap');
    if (!el || el === cur || typeof L === 'undefined') return;
    if (curMap) { try { curMap.remove(); } catch (e) {} }
    cur = el;
    var map = L.map(el, { scrollWheelZoom: false, zoomSnap: 0.25 });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 12,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(map);
    curMap = map;
    var layer = L.layerGroup().addTo(map);

    var all = [];
    J.forEach(function (j) { j.stops.forEach(function (s) { all.push([s.lat, s.lng]); }); });
    var bounds = L.latLngBounds(all).pad(0.08);
    map.fitBounds(bounds);

    function draw() {
      layer.clearLayers();
      var places = {};
      J.forEach(function (j) {
        if (!active[j.id]) return;
        j.stops.forEach(function (s, i) {
          var k = s.lat.toFixed(2) + ',' + s.lng.toFixed(2);
          (places[k] = places[k] || { lat: s.lat, lng: s.lng, visits: [] }).visits.push({ j: j, s: s });
          var nx = j.stops[i + 1];
          if (nx && (nx.lat !== s.lat || nx.lng !== s.lng)) {
            L.polyline([[s.lat, s.lng], [nx.lat, nx.lng]], {
              color: j.color, weight: 3.5, opacity: 0.85,
              dashArray: s.sea ? '7 7' : null, lineCap: 'round'
            }).addTo(layer);
          }
        });
      });
      Object.keys(places).forEach(function (k) {
        var p = places[k], v0 = p.visits[0], approx = p.visits.every(function (v) { return v.s.approx; });
        var multi = p.visits.length > 1, size = multi ? 18 : 14;
        var icon = L.divIcon({
          className: '',
          iconSize: [size, size],
          html: '<span style="display:block;width:' + size + 'px;height:' + size + 'px;box-sizing:border-box;border-radius:50%;border:2.5px solid ' +
            (approx ? v0.j.color : PARCH) + ';background:' + (approx ? PARCH : v0.j.color) +
            ';box-shadow:0 0 0 1px ' + INK + ',0 2px 5px rgba(42,32,22,.45)"></span>'
        });
        var rows = p.visits.map(function (v) {
          return '<div style="margin-top:4px"><span style="color:' + v.j.color + ';font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:11px">' +
            esc(v.j.eyebrow) + '</span><br><a href="#' + v.j.id + '-' + v.s.n + '" data-card="' + v.j.id + '-' + v.s.n + '" style="color:' + INK + ';text-decoration:underline">' +
            v.s.n + '. ' + esc(v.s.place) + '</a></div>';
        }).join('');
        var title = esc(v0.s.place.split(/ [–(]/)[0]);
        L.marker([p.lat, p.lng], { icon: icon, title: v0.s.place, keyboard: true })
          .bindPopup('<div style="font:600 16px/1.3 \'Cormorant Garamond\',serif;color:' + INK + '"><b>' + title + '</b>' +
            (approx ? '<div style="font-weight:500;font-style:italic;font-size:13px;color:#6a5740">położenie przybliżone</div>' : '') +
            '<div style="font-weight:500;font-size:14px">' + rows + '</div></div>')
          .addTo(layer);
      });
    }

    var f = document.getElementById('pmap-filters');
    f.innerHTML = '';
    J.forEach(function (j) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'true');
      b.textContent = j.eyebrow;
      function style() {
        var on = active[j.id];
        b.style.cssText = "font:600 14px/1.2 'Cormorant Garamond',serif;cursor:pointer;padding:6px 12px;border:1px solid " + (on ? j.color : '#c9b78f') +
          ';background:' + (on ? j.color : 'rgba(255,252,245,.5)') + ';color:' + (on ? '#fff' : '#5c4a34');
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      b.onclick = function () { active[j.id] = !active[j.id]; style(); draw(); };
      style(); f.appendChild(b);
    });
    draw();
  }

  init();
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-card]');
    if (!a) return;
    e.preventDefault();
    var id = a.getAttribute('data-card'), pd = window.parent.document, parts = id.split('-'), t = pd.querySelectorAll('section#' + parts[0] + ' article')[parts[1] - 1];
    if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); try { window.parent.history.replaceState(null, '', '#' + parts[0]); } catch (x) {} }
  });
})();
