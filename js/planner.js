// Trip planner and budget estimator. Runs in the browser; state lives in the URL hash so plans can be shared.
(function () {
    var root = document.currentScript.dataset.root || '';
    var $ = function (id) { return document.getElementById(id); };
    var form = $('planner'), matches = $('matches'), estimate = $('estimate');
    var data = null;
    var fields = ['start', 'month', 'days', 'adults', 'children', 'seniors', 'level', 'pace', 'mode'];

    // Typical hub-to-hub road times (hours) for a rough transfer note; not live
    var HUBS = {
        'Delhi>Haridwar': '4-5 h', 'Delhi>Dehradun': '5-6 h', 'Delhi>Rishikesh': '5-6 h', 'Delhi>Kathgodam': '6-7 h',
        'Dehradun>Haridwar': '1.5-2 h', 'Dehradun>Rishikesh': '1.5 h', 'Haridwar>Rishikesh': '1 h', 'Rishikesh>Haridwar': '1 h',
        'Haridwar>Dehradun': '1.5-2 h', 'Rishikesh>Dehradun': '1.5 h'
    };

    function num(id) { return Math.max(0, +$(id).value || 0); }
    function rate(id) { return [num(id + '-lo'), num(id + '-hi')]; }
    function inr(n) { return 'Rs ' + Math.round(n).toLocaleString('en-IN'); }
    function range(a) { return inr(a[0]) + ' to ' + inr(a[1]); }

    function readHash() {
        var p = new URLSearchParams(location.hash.slice(1));
        fields.forEach(function (f) { if (p.has(f)) $(f).value = p.get(f); });
        if (p.has('interests')) p.get('interests').split(',').forEach(function (v) {
            var c = form.querySelector('input[name=interest][value="' + v + '"]'); if (c) c.checked = true;
        });
    }
    function writeHash() {
        var p = new URLSearchParams();
        fields.forEach(function (f) { p.set(f, $(f).value); });
        p.set('interests', picked().join(','));
        history.replaceState(null, '', '#' + p.toString());
    }
    function picked() { return [].map.call(form.querySelectorAll('input[name=interest]:checked'), function (c) { return c.value; }); }

    function cost(days) {
        var n = num('adults') + num('children') + num('seniors') || 1, level = $('level').value, nights = Math.max(days - 1, 0);
        var roomKey = { budget: 'stay', mid: 'stay-mid', comfort: 'stay-comfort' }[level];
        var rooms = Math.ceil(n / 3), pace = $('pace').value;
        var scale = { budget: 0.6, mid: 1, comfort: 1.9 }[level];   // meals scale relative to the mid rate
        var actScale = { relaxed: 0.5, balanced: 1, fast: 1.6 }[pace];
        var stay = rate(roomKey).map(function (v) { return v * rooms * nights; });
        var meals = rate('meals').map(function (v) { return v * scale * n * days; });
        var mode = $('mode').value;
        var move = mode === 'taxi' ? rate('taxi').map(function (v) { return v * days; })
            : mode === 'bus' ? rate('bus').map(function (v) { return v * n * days; })
            : rate('own').map(function (v) { return v * days; });
        var act = rate('act').map(function (v) { return v * actScale * n * days; });
        var parts = [['Stay (' + rooms + ' room' + (rooms > 1 ? 's' : '') + ', ' + nights + ' night' + (nights === 1 ? '' : 's') + ')', stay], ['Meals', meals], ['Local transport', move], ['Activities', act]];
        var tot = [0, 1].map(function (i) { return parts.reduce(function (s, p) { return s + p[1][i]; }, 0); });
        return { parts: parts, total: tot, n: n };
    }

    function renderEstimate(days) {
        var c = cost(days);
        estimate.innerHTML = '';
        var t = document.createElement('table'); t.className = 'data-table';
        c.parts.forEach(function (p) {
            var r = t.insertRow(); r.insertCell().textContent = p[0]; r.insertCell().textContent = range(p[1]);
        });
        var r = t.insertRow(); r.className = 'total'; r.insertCell().textContent = 'Total for ' + days + ' days, ' + c.n + ' traveller(s)'; r.insertCell().textContent = range(c.total);
        estimate.appendChild(t);
        var n = document.createElement('p'); n.className = 'note';
        n.textContent = 'Based on the placeholder rates above, which you can edit. Excludes travel to your start point, shopping, permits, tips and emergencies. Not a quote.';
        estimate.appendChild(n);
    }

    function score(i, ctx) {
        var s = 0, why = [], warn = [];
        if (i.days > ctx.days) return null;
        s += 10 - (ctx.days - i.days); why.push(i.days + ' day' + (i.days > 1 ? 's' : '') + ' fits your ' + ctx.days);
        if (i.months.indexOf(ctx.month) > -1) { s += 5; why.push('good month'); } else { s -= 8; warn.push('Outside the typical season for this trip. Check conditions.'); }
        var hit = i.tags.filter(function (t) { return ctx.interests.indexOf(t) > -1; });
        if (hit.length) { s += 3 * hit.length; why.push('matches ' + hit.join(', ')); }
        if (i.pace === ctx.pace) { s += 2; why.push(i.pace + ' pace'); }
        else if (ctx.pace === 'relaxed' && i.pace === 'fast') { s -= 3; warn.push('Faster than the pace you asked for.'); }
        if ((ctx.children || ctx.seniors) && i.demanding) { s -= 10; warn.push('Physically demanding; think carefully with children or seniors.'); }
        if (i.start === ctx.start) s += 2;
        else {
            var t = HUBS[ctx.start + '>' + i.start];
            warn.push(t ? 'Allow about ' + t + ' by road from ' + ctx.start + ' to ' + i.start + ' (typical).' : 'Plan a separate transfer from ' + ctx.start + ' to ' + i.start + '; see the transport guide.');
        }
        return { s: s, why: why, warn: warn };
    }

    function render() {
        if (!data) return;
        var ctx = {
            start: $('start').value, month: +$('month').value, days: Math.max(1, num('days')), pace: $('pace').value,
            children: num('children'), seniors: num('seniors'), interests: picked()
        };
        renderEstimate(ctx.days);
        var ranked = data.map(function (i) { return { i: i, r: score(i, ctx) }; }).filter(function (x) { return x.r; })
            .sort(function (a, b) { return b.r.s - a.r.s; }).slice(0, 3);
        matches.textContent = '';
        if (!ranked.length) { matches.textContent = 'No itinerary is short enough. Try more days or browse all itineraries.'; return; }
        ranked.forEach(function (x) {
            var a = document.createElement('a'); a.className = 'dham-card'; a.href = root + 'itinerary/' + x.i.slug + '/index.html';
            var h = document.createElement('h3'); h.textContent = x.i.title;
            var p = document.createElement('p'); p.textContent = x.r.why.join('; ') + '.';
            a.appendChild(h); a.appendChild(p);
            x.r.warn.forEach(function (w) { var s = document.createElement('span'); s.className = 'warn'; s.textContent = w; a.appendChild(s); });
            matches.appendChild(a);
        });
    }

    form.addEventListener('input', function () { writeHash(); render(); });
    $('month').value = new Date().getMonth() + 1;
    readHash();
    data = (window.__DATA && window.__DATA.itineraries) || null;
    if (data) render(); else matches.textContent = 'Could not load itineraries. Please refresh.';
    renderEstimate(Math.max(1, num('days')));
})();
