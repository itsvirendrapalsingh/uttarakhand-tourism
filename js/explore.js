// Client-side search over data/search.json (destinations, treks, itineraries, guides)
(function () {
    var root = document.currentScript.dataset.root;
    function href(root, u) { return root + u; }

    var box = document.getElementById('q'), out = document.getElementById('results'), count = document.getElementById('count');
    var chips = document.querySelectorAll('.chip'), type = 'all', all = [];
    var label = { dest: 'Destination', trek: 'Trek', itin: 'Itinerary', guide: 'Guide' };

    function render() {
        var terms = box.value.toLowerCase().split(/\s+/).filter(Boolean);
        var hits = all.filter(function (d) {
            return (type === 'all' || d.t === type) && terms.every(function (t) { return d.q.indexOf(t) > -1; });
        });
        count.innerHTML = '<strong>' + hits.length + '</strong> result' + (hits.length === 1 ? '' : 's');
        out.textContent = '';
        hits.forEach(function (d, n) {
            var a = document.createElement('a'); a.className = 'dham-card pop-in'; a.style.setProperty('--i', Math.min(n, 12)); a.href = href(root, d.url);
            var h = document.createElement('h3'); h.textContent = d.name;
            var p = document.createElement('p'); p.textContent = d.sub;
            var s = document.createElement('span'); s.textContent = label[d.t];
            a.appendChild(h); a.appendChild(p); a.appendChild(s); out.appendChild(a);
        });
        if (!hits.length) out.textContent = 'No matches. Try a shorter search.';
    }

    all = (window.__DATA && window.__DATA.search) || [];
    if (!all.length) out.textContent = 'Could not load search data. Please refresh.';
    render();
    box.addEventListener('input', render);
    chips.forEach(function (c) {
        c.addEventListener('click', function () {
            chips.forEach(function (x) { x.classList.remove('active'); });
            c.classList.add('active'); type = c.dataset.type; render();
        });
    });
})();
