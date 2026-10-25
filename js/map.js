// Leaflet maps (OpenStreetMap tiles): mini maps on pages and the full map page.
(function () {
    var root = document.currentScript.dataset.root || '';
    function href(root, u) { return root + (u.slice(-1) === '/' ? u + 'index.html' : u); }

    var els = document.querySelectorAll('.mini-map, #big-map');
    if (!els.length) return;
    var CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    var JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';

    function load(cb) {
        var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = CSS; document.head.appendChild(l);
        var s = document.createElement('script'); s.src = JS; s.onload = cb;
        s.onerror = function () { els.forEach(function (e) { e.textContent = 'Map could not be loaded.'; }); };
        document.head.appendChild(s);
    }
    function base(el, center, zoom) {
        var m = L.map(el, { scrollWheelZoom: false }).setView(center, zoom);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 14, attribution: '&copy; OpenStreetMap contributors' }).addTo(m);
        return m;
    }
    function popup(name, url) {
        var d = document.createElement('div'), b = document.createElement('strong'); b.textContent = name; d.appendChild(b);
        if (url) { d.appendChild(document.createElement('br')); var a = document.createElement('a'); a.href = href(root, url); a.textContent = 'Open guide'; d.appendChild(a); }
        return d;
    }

    function init() {
        document.querySelectorAll('.mini-map').forEach(function (el) {
            var route = el.dataset.route && JSON.parse(el.dataset.route);
            if (route) {
                var m = base(el, [route[0].lat, route[0].lng], 8), pts = [];
                route.forEach(function (p, i) {
                    pts.push([p.lat, p.lng]);
                    L.marker([p.lat, p.lng]).addTo(m).bindPopup(popup((i + 1) + '. ' + p.name, 'destination/' + p.slug + '/'));
                });
                L.polyline(pts, { dashArray: '6 6' }).addTo(m);
                m.fitBounds(pts, { padding: [30, 30] });
            } else {
                var c = [+el.dataset.lat, +el.dataset.lng], mm = base(el, c, 9);
                L.marker(c).addTo(mm).bindPopup(popup(el.dataset.name));
            }
        });
        var big = document.getElementById('big-map');
        if (big) {
            var map = base(big, [30.1, 79.0], 7), layer = L.layerGroup().addTo(map), data = [];
            var draw = function (kind) {
                layer.clearLayers();
                data.forEach(function (p) {
                    if (kind !== 'all' && p.kind !== kind) return;
                    L.circleMarker([p.lat, p.lng], { radius: 7, color: p.kind === 'trek' ? '#c0392b' : '#1e5b3a', fillOpacity: .8 })
                        .addTo(layer).bindPopup(popup(p.name, p.url));
                });
            };
            data = (window.__DATA && window.__DATA.map) || []; draw('all');
            document.getElementById('map-filter').addEventListener('click', function (e) {
                if (!e.target.dataset.kind) return;
                this.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c === e.target); });
                draw(e.target.dataset.kind);
            });
        }
    }

    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
            if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(init); }
        }, { rootMargin: '200px' });
        els.forEach(function (e) { io.observe(e); });
    } else load(init);
})();
