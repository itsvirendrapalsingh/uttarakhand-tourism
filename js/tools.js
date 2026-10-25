// Shared behaviour for generated pages: filters, save/share/print, checklists, month tabs, saved list.
(function () {
    var root = document.currentScript.dataset.root || '';
    var store = {
        get: function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
        set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    };

    // Card filters: <select data-filter="attr"> against data-attr tokens on cards in [data-filter-list]
    var list = document.querySelector('[data-filter-list]');
    if (list) {
        var cards = [].slice.call(list.children);
        var controls = [].slice.call(document.querySelectorAll('[data-filter], [data-filter-text]'));
        var count = document.getElementById('count');
        var apply = function () {
            var shown = 0;
            cards.forEach(function (c) {
                var ok = controls.every(function (el) {
                    if (el.hasAttribute('data-filter-text')) {
                        var t = el.value.toLowerCase().trim();
                        return !t || c.textContent.toLowerCase().indexOf(t) > -1 || (c.dataset.tags || '').indexOf(t) > -1;
                    }
                    var want = el.value;
                    return !want || (c.dataset[el.dataset.filter] || '').split(' ').indexOf(want) > -1;
                });
                c.hidden = !ok;
                if (ok) shown++;
            });
            if (count) count.textContent = shown + ' of ' + cards.length + ' shown';
        };
        controls.forEach(function (el) { el.addEventListener('input', apply); });
        apply();
    }

    // Save (bookmarks in this browser)
    var saved = store.get('saved', []);
    document.querySelectorAll('[data-save]').forEach(function (b) {
        var paint = function () {
            var on = saved.some(function (s) { return s.k === b.dataset.save; });
            b.innerHTML = on ? '&#9733; Saved' : '&#9734; Save';
            b.setAttribute('aria-pressed', on);
        };
        b.addEventListener('click', function () {
            var i = saved.findIndex(function (s) { return s.k === b.dataset.save; });
            if (i > -1) saved.splice(i, 1); else saved.push({ k: b.dataset.save, t: b.dataset.title, u: b.dataset.url });
            store.set('saved', saved); paint();
        });
        paint();
    });
    var box = document.getElementById('saved-list');
    if (box) {
        box.innerHTML = saved.map(function (s) {
            var a = document.createElement('a'); a.className = 'dham-card'; a.href = root + (s.u.slice(-1) === '/' ? s.u + 'index.html' : s.u);
            var h = document.createElement('h3'); h.textContent = s.t;
            var p = document.createElement('span'); p.textContent = s.k.split(':')[0];
            a.appendChild(h); a.appendChild(p); return a.outerHTML;
        }).join('');
        document.getElementById('saved-empty').hidden = saved.length > 0;
    }

    // Share and print
    document.querySelectorAll('[data-share]').forEach(function (b) {
        b.addEventListener('click', function () {
            var url = location.href;
            if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function () {}); return; }
            if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { b.textContent = 'Link copied'; });
            else window.prompt('Copy this link', url);
        });
    });
    document.querySelectorAll('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

    // Checklists remembered per browser
    document.querySelectorAll('[data-checklist]').forEach(function (ul) {
        var key = 'check-' + ul.dataset.checklist, on = store.get(key, []);
        ul.querySelectorAll('input').forEach(function (c) {
            c.checked = on.indexOf(+c.dataset.i) > -1;
            c.addEventListener('change', function () {
                store.set(key, [].map.call(ul.querySelectorAll('input:checked'), function (x) { return +x.dataset.i; }));
            });
        });
    });

    // Fade-in on scroll
    var rv = document.querySelectorAll('.dham-card, .highlight-card, .destination-card, .guide-section, .intro-content');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var io = new IntersectionObserver(function (es) {
            es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
        }, { rootMargin: '0px 0px -8% 0px' });
        rv.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
    }

    // Month tabs (all months stay visible without JS)
    var tabs = document.getElementById('month-tabs');
    if (tabs) {
        var show = function (n) {
            document.querySelectorAll('.month').forEach(function (s) { s.hidden = s.dataset.month != n; });
            tabs.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c.dataset.month == n); });
        };
        tabs.addEventListener('click', function (e) { if (e.target.dataset.month) show(e.target.dataset.month); });
        show(new Date().getMonth() + 1);
    }
})();
