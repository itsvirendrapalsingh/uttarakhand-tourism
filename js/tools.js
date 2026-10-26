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
        var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var first = true;
        var apply = function () {
            var shown = 0, n = 0;
            cards.forEach(function (c) {
                var ok = controls.every(function (el) {
                    if (el.hasAttribute('data-filter-text')) {
                        var t = el.value.toLowerCase().trim();
                        return !t || c.textContent.toLowerCase().indexOf(t) > -1 || (c.dataset.tags || '').indexOf(t) > -1;
                    }
                    var want = el.value;
                    return !want || (c.dataset[el.dataset.filter] || '').split(' ').indexOf(want) > -1;
                });
                if (ok) shown++;
                if (calm || first) { c.hidden = !ok; return; }
                clearTimeout(c._t);
                if (ok) {
                    var was = c.hidden;
                    c.hidden = false; c.classList.remove('out', 'pop-in');
                    if (was) { void c.offsetWidth; c.style.setProperty('--i', Math.min(n++, 12)); c.classList.add('pop-in'); }
                } else if (!c.hidden) {
                    c.classList.remove('pop-in'); c.classList.add('out');
                    c._t = setTimeout(function () { c.hidden = true; c.classList.remove('out'); }, 180);
                }
            });
            controls.forEach(function (el) { if (el.tagName === 'SELECT') el.classList.toggle('is-set', !!el.value); });
            if (reset) reset.hidden = !controls.some(function (el) { return el.value; });
            if (count) {
                count.innerHTML = 'Showing <strong>' + shown + '</strong> of ' + cards.length;
                if (!calm && !first) { count.classList.remove('bump'); void count.offsetWidth; count.classList.add('bump'); }
            }
            var none = list.parentNode.querySelector('.no-match');
            if (!shown && !none) { none = document.createElement('p'); none.className = 'no-match note'; none.textContent = 'Nothing matches those filters. Try clearing one.'; list.after(none); }
            if (none) none.hidden = shown > 0;
            first = false;
        };
        var form = document.querySelector('form.filters'), reset = null;
        if (form) {
            reset = document.createElement('button'); reset.type = 'button'; reset.className = 'btn btn-small reset-btn'; reset.hidden = true;
            reset.innerHTML = '<i class="fas fa-rotate-left"></i> Clear filters';
            reset.addEventListener('click', function () { controls.forEach(function (el) { el.value = ''; }); apply(); });
            form.appendChild(reset);
        }
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
            store.set('saved', saved); paint(); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
        });
        paint();
    });
    var box = document.getElementById('saved-list');
    if (box) {
        box.innerHTML = saved.map(function (s) {
            var a = document.createElement('a'); a.className = 'dham-card'; a.href = root + (s.u);
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

    // Ripple on buttons and chips
    document.addEventListener('pointerdown', function (e) {
        var el = e.target.closest && e.target.closest('.btn, .chip, .jump a');
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var r = el.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
        s.className = 'ripple'; s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
        el.appendChild(s); setTimeout(function () { s.remove(); }, 600);
    });

    // Scroll progress bar + back-to-top
    var bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
    var top = document.createElement('button'); top.type = 'button'; top.className = 'to-top'; top.setAttribute('aria-label', 'Back to top'); top.innerHTML = '<i class="fas fa-arrow-up"></i>';
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }); document.body.appendChild(top);
    var tick = false;
    window.addEventListener('scroll', function () {
        if (tick) return; tick = true;
        requestAnimationFrame(function () {
            var h = document.documentElement.scrollHeight - innerHeight;
            bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
            top.classList.toggle('show', scrollY > 600); tick = false;
        });
    }, { passive: true });

    // Jump-nav scroll spy
    var jump = document.querySelector('.jump');
    if (jump && 'IntersectionObserver' in window) {
        var links = {}; [].forEach.call(jump.querySelectorAll('a'), function (a) { links[a.getAttribute('href').slice(1)] = a; });
        var spy = new IntersectionObserver(function (es) {
            es.forEach(function (e) {
                if (!e.isIntersecting || !links[e.target.id]) return;
                [].forEach.call(jump.querySelectorAll('a.on'), function (x) { x.classList.remove('on'); });
                var a = links[e.target.id]; a.classList.add('on');
                jump.scrollTo({ left: a.offsetLeft - jump.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
            });
        }, { rootMargin: '-25% 0px -65% 0px' });
        Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
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
