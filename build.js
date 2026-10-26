// Static site generator. No dependencies. Run: node build.js
// content/*.json -> HTML pages, data/*.json, sitemap.xml, robots.txt.
// Hand-written pages (contact.html) only get a refreshed header/footer.
const fs = require('fs');
const path = require('path');

const SITE = 'https://www.uttarakhandtourismcenter.com';
const REVIEWED = '2026-10-25';
const SOCIAL = {}; // e.g. { facebook: 'https://...', instagram: '...' }; icons render only for set keys
const UTDB = { label: 'Uttarakhand Tourism Development Board (official)', url: 'https://uttarakhandtourism.gov.in/' };
const DEFAULT_VERIFICATION = 'Compiled from general knowledge and secondary sources. Distances and times are approximate and were not checked against an official page. Confirm road, permit and opening status before you travel.';
const REGIONS = {
  garhwal: { name: 'Garhwal', intro: 'The western half of Uttarakhand: the Char Dham shrines, Rishikesh and Haridwar, Mussoorie, and treks such as Kedarkantha and Har Ki Dun.' },
  kumaon: { name: 'Kumaon', intro: 'The eastern half of Uttarakhand: the Nainital lakes, Almora, Ranikhet and Kausani, Corbett, and remote Himalayan villages such as Munsiyari.' }
};

const R = p => path.join(__dirname, p);
const read = f => JSON.parse(fs.readFileSync(R('content/' + f), 'utf8'));
const dataJs = (name, obj) => write(`data/${name}.js`, `window.__DATA = window.__DATA || {}; window.__DATA.${name} = ${JSON.stringify(obj)};`);
const write = (f, s) => { fs.mkdirSync(path.dirname(R(f)), { recursive: true }); fs.writeFileSync(R(f), s); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ul = a => `<ul class="bullets">${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const images = read('images.json');
const destinations = fs.readdirSync(R('content/destinations')).filter(f => f.endsWith('.json')).flatMap(f => read('destinations/' + f)).map(d => ({
  safety: [], tips: [], sources: [UTDB], reviewed: REVIEWED, verification: DEFAULT_VERIFICATION,
  budget: 'No verified price list is published on this page. Use the budget estimator and replace its placeholder rates with real quotes.', ...d
}));
const treks = read('treks.json');
const itins = read('itineraries.json');
const guides = read('guides.json');
const months = read('months.json');
const budget = read('budget.json');
const dham = read('chardham.json');
const bySlug = Object.fromEntries(destinations.map(d => [d.slug, d]));

// Directory links need index.html so pages also work when opened from disk (file://).
const explicit = html => html.replace(/href="((?!https?:|\/\/|mailto:|#)[^"#]*\/|)(#[^"]*)?"/g, (m, p, h) => p ? `href="${p}index.html${h || ''}"` : m);

// ---------- shared pieces ----------
const NAV = [
  ['index.html', 'Home'], ['destinations.html', 'Destinations'], ['treks/', 'Treks'], ['itineraries/', 'Itineraries'],
  ['char-dham/', 'Char Dham'], ['best-time/', 'Best Time'], ['plan/', 'Plan'], ['gallery.html', 'Gallery'], ['contact.html', 'Contact']
];
const header = (root, active) => `<header>
        <nav class="navbar">
            <div class="container">
                <div class="logo">
                    <a href="${root}index.html">
                        <img class="logo-mark" src="${root}favicon.svg" alt="" width="34" height="34">
                        <span class="logo-title">Uttarakhand Tourism</span>
                    </a>
                </div>
                <div class="menu-toggle">
                    <i class="fas fa-bars"></i>
                </div>
                <ul class="nav-menu">
${NAV.map(([h, t]) => `                    <li><a href="${root}${h}"${h === active ? ' class="active"' : ''}>${t}</a></li>`).join('\n')}
                    <li><a href="${root}explore/" aria-label="Search"${active === 'explore/' ? ' class="active"' : ''}><i class="fas fa-search"></i></a></li>
                </ul>
            </div>
        </nav>
    </header>`;

const SOCIAL_ICONS = { facebook: 'facebook-f', twitter: 'twitter', instagram: 'instagram', youtube: 'youtube' };
const footer = root => `<footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-logo">
                    <h2>Uttarakhand Tourism</h2>
                    <p>Discover the Land of Gods</p>
                </div>
                <div class="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
${NAV.map(([h, t]) => `                        <li><a href="${root}${h}">${t}</a></li>`).join('\n')}
                        <li><a href="${root}saved/">Saved</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h3>Contact Information</h3>
                    <p><i class="fas fa-map-marker-alt"></i> Tourist Information Center, Dehradun, Uttarakhand</p>
                    <p><i class="fas fa-phone"></i> +91 135 2748041</p>
                    <p><i class="fas fa-envelope"></i> info@uttarakhandtourism.com</p>
                </div>
${Object.keys(SOCIAL).length ? `                <div class="footer-social">
                    <h3>Follow Us</h3>
                    <div class="social-icons">
${Object.entries(SOCIAL).map(([k, u]) => `                        <a href="${esc(u)}" aria-label="${esc(k)}"><i class="fab fa-${SOCIAL_ICONS[k] || k}"></i></a>`).join('\n')}
                    </div>
                </div>
` : ''}            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Uttarakhand Tourism. All Rights Reserved. Information is a guide only; confirm current conditions with official sources before you travel.</p>
            </div>
        </div>
    </footer>`;

const page = ({ root, active, title, desc, canonical, body, jsonld = [], script = '', ogImage = '' }) => explicit(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <link rel="canonical" href="${SITE}/${canonical}">
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
    <meta name="theme-color" content="#123c5a">
    <link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
    <link rel="icon" href="${root}favicon.ico" sizes="48x48">
    <link rel="apple-touch-icon" href="${root}apple-touch-icon.png">
    <link rel="manifest" href="${root}manifest.webmanifest">
    <link rel="alternate" hreflang="en-IN" href="${SITE}/${canonical}">
    <meta property="og:site_name" content="Uttarakhand Tourism">
    <meta property="og:locale" content="en_IN">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${SITE}/${canonical}">
    <meta property="og:image" content="${SITE}/${ogImage || 'og-default.png'}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(desc)}">
    <meta name="twitter:image" content="${SITE}/${ogImage || 'og-default.png'}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
    <link rel="stylesheet" href="${root}css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
${jsonld.map(j => `    <script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body>
    <a class="skip-link" href="#main">Skip to content</a>
    ${header(root, active)}

    <main id="main">
${body}
    </main>

    ${footer(root)}

    <script src="${root}js/script.js"></script>
    <script src="${root}js/tools.js" data-root="${root}"></script>
${script}
</body>
</html>
`);

// responsive photo from content/images.json
const pic = (id, { cls = '', sizes = '(min-width: 900px) 360px, 100vw', eager = false } = {}) => {
  const im = images[id]; if (!im) return '';
  const [s, l] = im.v;
  return `<img class="${cls}" src="__ROOT__${s.path}" srcset="__ROOT__${s.path} ${s.w}w, __ROOT__${l.path} ${l.w}w" sizes="${sizes}" width="${s.w}" height="${s.h}" alt="${esc(im.alt)}"${eager ? '' : ' loading="lazy"'} decoding="async" onerror="this.onerror=null;this.style.visibility='hidden'">`;
};
const withRoot = (html, root) => html.replace(/__ROOT__/g, root);

const heroBlock = (root, title, sub, imgId) => {
  const im = imgId && images[imgId];
  if (!im) return `<section class="guide-hero"><div class="container"><h1>${esc(title)}</h1><p>${esc(sub)}</p></div></section>`;
  return withRoot(`<section class="guide-hero has-img">${pic(imgId, { cls: 'hero-bg', sizes: '100vw', eager: true })}<div class="container"><h1>${esc(title)}</h1><p>${esc(sub)}</p>${im.credit ? `<small class="credit">Photo: ${esc(im.credit)}</small>` : ''}</div></section>`, root);
};

const crumbs = (root, items) => {
  const html = items.map(([t, h], i) => i === items.length - 1 ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${root}${h}">${esc(t)}</a>`).join(' / ');
  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([t, h], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: `${SITE}/${h}` })) };
  return { html: `<nav class="breadcrumbs container" aria-label="Breadcrumb">${html}</nav>`, ld };
};

const sourcesBlock = (list, reviewed) => `<section class="guide-section"><h2>Sources and verification</h2>
<p class="note">Last reviewed ${esc(reviewed)}. Prices, opening dates, road status and permits change often. Confirm with an official source before you travel.</p>
<ul class="bullets">${list.map(s => `<li><a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.label)}</a></li>`).join('')}</ul></section>`;
const faqBlock = faq => faq && faq.length ? `<section class="guide-section"><h2>Frequently asked questions</h2>${faq.map(f => `<details class="faq-detail"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>` : '';
const faqLd = faq => faq && faq.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : [];
const actions = (key, title, url) => `<div class="actions no-print">
    <button type="button" class="btn btn-small save-btn" data-save="${esc(key)}" data-title="${esc(title)}" data-url="${esc(url)}" aria-pressed="false">&#9734; Save</button>
    <button type="button" class="btn btn-small" data-share>Share link</button>
    <button type="button" class="btn btn-small" data-print>Print</button></div>`;
const link = (root, slug) => bySlug[slug] ? `<a href="${root}destination/${slug}/">${esc(bySlug[slug].name)}</a>` : esc(slug);
const card = (href, title, sub, meta, attrs = '', { icon = '', tag = '', tone = '' } = {}) => `<a class="dham-card${icon ? ' has-top' : ''}" href="${href}"${attrs}>${icon ? `<div class="card-top ${tone}"><i class="fas fa-${icon}" aria-hidden="true"></i>${tag ? `<b class="badge">${esc(tag)}</b>` : ''}</div>` : ''}<h3>${esc(title)}</h3><p>${esc(sub)}</p><div class="pills">${String(meta).split(' · ').map(m => `<span>${esc(m)}</span>`).join('')}</div></a>`;
const TYPE_ICON = { dham: 'om', temple: 'om', city: 'city', 'hill-station': 'mountain-sun', town: 'house-chimney', lake: 'water', village: 'tree', meadow: 'seedling', confluence: 'water', park: 'paw', wildlife: 'paw' };
// jump-nav: give each guide section an id and prepend a sticky chip bar
const withJump = html => {
  const items = [];
  const out = html.replace(/<section class="guide-section( no-print)?"><h2>(.*?)<\/h2>/g, (m, np, h) => {
    const id = 's-' + h.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    items.push([id, h.replace(/<[^>]+>/g, '').replace(/^How to reach .*/, 'How to reach').replace(/^Plan around .*/, 'Plan around')]);
    return `<section class="guide-section${np || ''}" id="${id}"><h2>${h}</h2>`;
  });
  const nav = `<nav class="jump no-print" aria-label="On this page">${items.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('')}</nav>`;
  return out.replace('<article>', '<article>' + nav);
};
const strip = rows => `<div class="stat-strip container"><div class="stat-grid">${rows.filter(r => r[1]).map(([k, v, ic]) => `<div><i class="fas fa-${ic}" aria-hidden="true"></i><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div></div>`;
const bucket = d => d <= 1 ? '1' : d === 2 ? '2' : d <= 5 ? '3-5' : '7+';
const seasonOf = m => m <= 2 || m === 12 ? 'winter' : m <= 5 ? 'spring-summer' : m <= 9 ? 'monsoon' : 'autumn';
const mapScripts = `    <script src="__ROOT__data/map.js"></script>\n    <script src="__ROOT__js/map.js" data-root="__ROOT__"></script>`;

const ORG = { '@type': 'Organization', name: 'Uttarakhand Tourism', url: SITE + '/', logo: SITE + '/icon-512.png' };
const place = (d, path) => ({ '@context': 'https://schema.org', '@type': 'TouristDestination', name: d.name, description: d.summary, url: `${SITE}/${path}`, touristType: (d.tags || []).join(', ') || undefined, containedInPlace: { '@type': 'AdministrativeArea', name: 'Uttarakhand, India' }, ...(d.lat ? { geo: { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lng } } : {}) });
const article = (headline, desc, path) => ({ '@context': 'https://schema.org', '@type': 'Article', headline, description: desc, dateModified: REVIEWED, mainEntityOfPage: `${SITE}/${path}`, author: ORG, publisher: ORG });

// ---------- destination page ----------
const destPage = d => {
  const root = '../../';
  const bc = crumbs(root, [['Home', 'index.html'], ['Destinations', 'destinations.html'], [REGIONS[d.region].name, `region/${d.region}/`], [d.name, `destination/${d.slug}/`]]);
  const q = d.quick;
  const nearby = (d.nearby || []).map(n => n.slug && bySlug[n.slug] ? `<a href="${root}destination/${n.slug}/">${esc(n.name)}</a>` : esc(n.name)).join(', ');
  const relItins = itins.filter(i => i.stops.includes(d.slug));
  const relTreks = treks.filter(t => d.district.includes(t.district));
  const related = (relItins.length || relTreks.length) ? `<section class="guide-section"><h2>Plan around ${esc(d.name)}</h2>
        ${relItins.length ? `<h3>Itineraries that include it</h3><ul class="bullets">${relItins.map(i => `<li><a href="${root}itinerary/${i.slug}/">${esc(i.title)}</a> (${i.days} day${i.days > 1 ? 's' : ''})</li>`).join('')}</ul>` : ''}
        ${relTreks.length ? `<h3>Treks in the same district</h3><ul class="bullets">${relTreks.map(t => `<li><a href="${root}trek/${t.slug}/">${esc(t.name)}</a> (${esc(t.difficulty)}, ${t.days} days)</li>`).join('')}</ul>` : ''}</section>` : '';
  const body = withJump(`${heroBlock(root, d.name, d.tagline, d.image)}
        ${strip([['Altitude', d.altitude, 'mountain'], ['Best time', q.bestTime.split(/[;(,]/)[0], 'calendar-days'], ['Suggested stay', q.duration.split(/[;,]/)[0], 'moon'], ['Region', REGIONS[d.region].name, 'location-dot']])}
        ${bc.html}
        <div class="container guide-layout">
            <article>
                ${actions('dest:' + d.slug, d.name, `destination/${d.slug}/`)}
                <p class="lead">${esc(d.summary)}</p>
                <p class="note"><strong>About this page:</strong> ${esc(d.verification)}</p>
                <section class="guide-section"><h2>Things to see</h2>
                    <ul class="bullets">${d.attractions.map(a => `<li><strong>${esc(a.name)}.</strong> ${esc(a.text)}</li>`).join('')}</ul></section>
                <section class="guide-section"><h2>How to reach ${esc(d.name)}</h2>
                    <h3>By road</h3><p>${esc(d.reach.road)}</p>
                    <h3>By rail</h3><p>${esc(d.reach.rail)}</p>
                    <h3>By air</h3><p>${esc(d.reach.air)}</p>
                    ${d.lastMile ? `<h3>The last stretch</h3><p>${esc(d.lastMile)}</p>` : ''}</section>
                <section class="guide-section"><h2>Where to stay</h2><p>${esc(d.stay)}</p></section>
                ${d.food ? `<section class="guide-section"><h2>Food</h2><p>${esc(d.food)}</p></section>` : ''}
                <section class="guide-section"><h2>Budget</h2><p>${esc(d.budget)} <a href="${root}plan/">Open the budget estimator</a>.</p></section>
                <section class="guide-section"><h2>Season and weather</h2><p>${esc(d.season)}</p></section>
                ${d.safety.length ? `<section class="guide-section"><h2>Safety</h2>${ul(d.safety)}</section>` : ''}
                ${d.tips.length ? `<section class="guide-section"><h2>Tips</h2>${ul(d.tips)}</section>` : ''}
                ${related}
                ${d.lat ? `<section class="guide-section no-print"><h2>Map</h2><div class="mini-map" data-lat="${d.lat}" data-lng="${d.lng}" data-name="${esc(d.name)}" role="img" aria-label="Map showing ${esc(d.name)} (approximate location)"></div><p class="note">Approximate location at town level. Use an official or navigation map for exact directions.</p></section>` : ''}
                ${faqBlock(d.faq)}
                ${sourcesBlock(d.sources, d.reviewed)}
            </article>
            <aside class="info-panel" aria-label="Quick facts">
                <h2>Quick facts</h2>
                <dl>
                    <dt>Region</dt><dd>${esc(REGIONS[d.region].name)}, ${esc(d.district)} district</dd>
                    <dt>Altitude</dt><dd>${esc(d.altitude)}</dd>
                    <dt>Best time</dt><dd>${esc(q.bestTime)}</dd>
                    <dt>Suggested stay</dt><dd>${esc(q.duration)}</dd>
                    ${q.roadHead ? `<dt>Road head</dt><dd>${esc(q.roadHead)}</dd>` : ''}
                    <dt>Nearest rail</dt><dd>${esc(q.rail)}</dd>
                    <dt>Nearest airport</dt><dd>${esc(q.air)}</dd>
                    <dt>Nearby</dt><dd>${nearby}</dd>
                </dl>
                ${d.type === 'dham' ? `<a class="btn btn-primary" href="${root}char-dham/">Char Dham overview</a>` : ''}
            </aside>
        </div>`);
  write(`destination/${d.slug}/index.html`, withRoot(page({
    root, active: 'destinations.html', title: `${d.name} Travel Guide - Uttarakhand Tourism`, desc: `${d.tagline}. ${d.summary.slice(0, 110)}`,
    canonical: `destination/${d.slug}/`, body, jsonld: [bc.ld, place(d, `destination/${d.slug}/`), ...faqLd(d.faq)], script: d.lat ? mapScripts : '',
    ogImage: d.image && images[d.image] ? images[d.image].v[1].path : ''
  }), root));
};

// ---------- trek page ----------
const trekPage = t => {
  const root = '../../';
  const bc = crumbs(root, [['Home', 'index.html'], ['Treks', 'treks/'], [t.name, `trek/${t.slug}/`]]);
  const body = withJump(`${heroBlock(root, t.name, t.summary)}
        ${strip([['Difficulty', cap(t.difficulty), 'gauge-high'], ['Duration', t.days + ' days', 'clock'], ['Distance', t.distance, 'route'], ['Altitude', t.altitudeNote, 'mountain'], ['Season', t.season.split(';')[0], 'sun']])}
        ${bc.html}
        <div class="container guide-layout">
            <article>
                ${actions('trek:' + t.slug, t.name, `trek/${t.slug}/`)}
                <p class="note"><strong>About this page:</strong> ${esc(DEFAULT_VERIFICATION)} Never trek high altitude alone or without a registered operator in snow.</p>
                <section class="guide-section"><h2>Highlights</h2>${ul(t.highlights)}</section>
                <section class="guide-section"><h2>Getting to the start</h2><p>${esc(t.start)}</p></section>
                <section class="guide-section"><h2>Itinerary (typical)</h2>
                    <ol class="timeline">${t.stages.map(s => `<li><strong>${esc(s.day)}: ${esc(s.title)}.</strong> ${esc(s.text)}</li>`).join('')}</ol></section>
                <section class="guide-section"><h2>Stay and facilities</h2><p>${esc(t.stay)}</p><p>${esc(t.facilities)}</p></section>
                <section class="guide-section"><h2>Permits</h2><p>${esc(t.permits)}</p></section>
                <section class="guide-section"><h2>What to carry</h2><p>See the <a href="${root}guide/trek-preparation/">trek preparation and packing guide</a> for day-hike, supported-trek and expedition lists.</p></section>
                <section class="guide-section"><h2>Safety and acclimatisation</h2>${ul(t.safety)}</section>
                <section class="guide-section"><h2>Cost</h2><p>${esc(t.cost)} <a href="${root}plan/">Budget estimator</a></p></section>
                <section class="guide-section"><h2>Responsible trekking</h2>${ul(t.responsible)}</section>
                <section class="guide-section"><h2>Who it suits</h2>${ul(t.suits)}</section>
                ${t.lat ? `<section class="guide-section no-print"><h2>Map</h2><div class="mini-map" data-lat="${t.lat}" data-lng="${t.lng}" data-name="${esc(t.name)}" role="img" aria-label="Map of the ${esc(t.name)} trek area (approximate)"></div><p class="note">Approximate area only. Do not navigate by this map.</p></section>` : ''}
                ${faqBlock(t.faq)}
                ${sourcesBlock([UTDB], REVIEWED)}
            </article>
            <aside class="info-panel" aria-label="Trek facts">
                <h2>Trek facts</h2>
                <dl>
                    <dt>Difficulty</dt><dd>${esc(cap(t.difficulty))}</dd>
                    <dt>Experience</dt><dd>${esc(cap(t.level))}</dd>
                    <dt>Duration</dt><dd>${t.days} days</dd>
                    <dt>Distance</dt><dd>${esc(t.distance)}</dd>
                    <dt>Altitude</dt><dd>${esc(t.altitudeNote)}</dd>
                    <dt>Best season</dt><dd>${esc(t.season)}</dd>
                    <dt>Start</dt><dd>${esc(t.base)}, ${esc(REGIONS[t.region].name)}</dd>
                </dl>
            </aside>
        </div>`);
  write(`trek/${t.slug}/index.html`, withRoot(page({
    root, active: 'treks/', title: `${t.name} Trek Guide - Uttarakhand Tourism`, desc: `${t.name}: ${t.difficulty} trek, ${t.days} days, ${t.season}. ${t.summary.slice(0, 100)}`,
    canonical: `trek/${t.slug}/`, body, jsonld: [bc.ld, article(`${t.name} trek guide`, t.summary, `trek/${t.slug}/`), ...faqLd(t.faq)], script: t.lat ? mapScripts : ''
  }), root));
};

const treksIndex = () => {
  const root = '../';
  const bc = crumbs(root, [['Home', 'index.html'], ['Treks', 'treks/']]);
  const opt = a => a.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  const body = `${heroBlock(root, 'Trek finder', 'Filter Uttarakhand treks by difficulty, length, season and altitude')}
        ${bc.html}
        <div class="container">
            <form class="filters no-print" aria-label="Trek filters" onsubmit="return false">
                <label>Difficulty <select data-filter="diff"><option value="">Any</option>${opt([['easy', 'Easy'], ['moderate', 'Moderate'], ['difficult', 'Difficult']])}</select></label>
                <label>Experience <select data-filter="level"><option value="">Any</option>${opt([['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']])}</select></label>
                <label>Length <select data-filter="len"><option value="">Any</option>${opt([['short', '1-3 days'], ['mid', '4-6 days'], ['long', '7+ days']])}</select></label>
                <label>Season <select data-filter="season"><option value="">Any</option>${opt([['winter', 'Winter'], ['spring', 'Spring'], ['summer', 'Summer'], ['monsoon', 'Monsoon'], ['autumn', 'Autumn']])}</select></label>
                <label>Max altitude <select data-filter="alt"><option value="">Any</option>${opt([['low', 'Under 3,500 m'], ['mid', '3,500-4,000 m'], ['high', 'Above 4,000 m']])}</select></label>
            </form>
            <p class="results" id="count" aria-live="polite"></p>
            <div class="dham-grid" data-filter-list>${treks.map(t => {
              const diff = t.difficulty.split('-')[0] === 'easy' ? (t.difficulty === 'easy' ? 'easy' : 'easy moderate') : t.difficulty;
              const len = t.days <= 3 ? 'short' : t.days <= 6 ? 'mid' : 'long';
              const alt = t.maxAltitude < 3500 ? 'low' : t.maxAltitude <= 4000 ? 'mid' : 'high';
              return card(`${root}trek/${t.slug}/`, t.name, t.summary, `${cap(t.difficulty)} · ${t.days} days · ${t.altitudeNote}`,
                ` data-diff="${diff}" data-level="${t.level}" data-len="${len}" data-season="${t.seasons.join(' ')}" data-alt="${alt}"`,
                { icon: 'person-hiking', tag: cap(t.difficulty), tone: 'tone-' + t.difficulty.split('-')[t.difficulty.includes('-') ? 1 : 0] });
            }).join('')}</div>
            <p class="note">Difficulty and season are general guidance. Always check current conditions and permits with a registered operator.</p>
        </div>`;
  write('treks/index.html', page({ root, active: 'treks/', title: 'Uttarakhand Trek Finder - Uttarakhand Tourism', desc: 'Find Uttarakhand treks by difficulty, duration, season and altitude.', canonical: 'treks/', body, jsonld: [bc.ld] }));
};

// ---------- itinerary pages ----------
const itinPage = i => {
  const root = '../../';
  const bc = crumbs(root, [['Home', 'index.html'], ['Itineraries', 'itineraries/'], [i.title, `itinerary/${i.slug}/`]]);
  const stops = i.stops.filter(s => bySlug[s] && bySlug[s].lat).map(s => ({ name: bySlug[s].name, lat: bySlug[s].lat, lng: bySlug[s].lng, slug: s }));
  const monthNames = i.months.map(m => months.months[m - 1].name.slice(0, 3)).join(', ');
  const body = withJump(`${heroBlock(root, i.title, i.summary)}
        ${strip([['Length', i.days + ' day' + (i.days > 1 ? 's' : ''), 'calendar-days'], ['Starts from', i.start, 'location-dot'], ['Pace', cap(i.pace), 'gauge-high'], ['Months', monthNames, 'sun']])}
        ${bc.html}
        <div class="container guide-layout">
            <article>
                ${actions('itin:' + i.slug, i.title, `itinerary/${i.slug}/`)}
                <p class="note"><strong>Check before you go:</strong> driving times are typical estimates for mountain roads, not live traffic. Confirm road status, opening dates and bookings locally.</p>
                <section class="guide-section"><h2>Day by day</h2>
                    <ol class="timeline">${i.plan.map(p => `<li><strong>${esc(p.day)}: ${esc(p.title)}.</strong> ${esc(p.text)}<br><small>Driving: ${esc(p.drive)} &middot; Overnight: ${esc(p.stay)}</small></li>`).join('')}</ol></section>
                <section class="guide-section"><h2>Is it comfortable or rushed?</h2><p><strong>${esc(cap(i.comfort))}.</strong> ${esc(i.note)}</p></section>
                <section class="guide-section"><h2>Seasonal alternatives</h2><p>${esc(i.seasonAlt)}</p></section>
                <section class="guide-section"><h2>Budget</h2><p>Use the <a href="${root}plan/#days=${i.days}">budget estimator</a> with real quotes. No prices are quoted on this page.</p></section>
                ${stops.length ? `<section class="guide-section no-print"><h2>Route map</h2><div class="mini-map" data-route='${esc(JSON.stringify(stops))}' role="img" aria-label="Schematic route map of the stops"></div><p class="note">Straight lines between stops are schematic only, not the road route.</p></section>` : ''}
                <section class="guide-section"><h2>Stops</h2><p>${i.stops.map(s => link(root, s)).join(', ')}</p></section>
            </article>
            <aside class="info-panel" aria-label="Itinerary facts">
                <h2>At a glance</h2>
                <dl>
                    <dt>Length</dt><dd>${i.days} day${i.days > 1 ? 's' : ''}</dd>
                    <dt>Starts from</dt><dd>${esc(i.start)}</dd>
                    <dt>Pace</dt><dd>${esc(cap(i.pace))}</dd>
                    <dt>Comfort</dt><dd>${esc(cap(i.comfort))}</dd>
                    <dt>Typical months</dt><dd>${esc(monthNames)}</dd>
                    <dt>Themes</dt><dd>${esc(i.tags.join(', '))}</dd>
                </dl>
                <a class="btn btn-primary" href="${root}plan/">Open the trip planner</a>
            </aside>
        </div>`);
  write(`itinerary/${i.slug}/index.html`, withRoot(page({
    root, active: 'itineraries/', title: `${i.title} - Itinerary - Uttarakhand Tourism`, desc: `${i.title}: ${i.days}-day itinerary starting from ${i.start}. ${i.summary}`,
    canonical: `itinerary/${i.slug}/`, body, jsonld: [bc.ld, { '@context': 'https://schema.org', '@type': 'TouristTrip', name: i.title, description: i.summary, touristType: i.tags.join(', '), itinerary: { '@type': 'ItemList', itemListElement: i.plan.map((p, n) => ({ '@type': 'ListItem', position: n + 1, name: `${p.day}: ${p.title}`, description: p.text })) } }], script: stops.length ? mapScripts : ''
  }), root));
};

const itinsIndex = () => {
  const root = '../';
  const bc = crumbs(root, [['Home', 'index.html'], ['Itineraries', 'itineraries/']]);
  const body = `${heroBlock(root, 'Itineraries', 'From a single day to two weeks, with realistic driving times')}
        ${bc.html}
        <div class="container">
            <form class="filters no-print" aria-label="Itinerary filters" onsubmit="return false">
                <label>Length <select data-filter="bucket"><option value="">Any</option><option value="1">1 day</option><option value="2">2 days</option><option value="3-5">3-5 days</option><option value="7+">7+ days</option></select></label>
                <label>Theme <select data-filter="tags"><option value="">Any</option>${[...new Set(itins.flatMap(i => i.tags))].sort().map(t => `<option value="${t}">${cap(t)}</option>`).join('')}</select></label>
                <label>Comfort <select data-filter="comfort"><option value="">Any</option><option value="comfortable">Comfortable</option><option value="balanced">Balanced</option><option value="rushed">Rushed</option></select></label>
            </form>
            <p class="results" id="count" aria-live="polite"></p>
            <div class="dham-grid" data-filter-list>${itins.map(i => card(`${root}itinerary/${i.slug}/`, i.title, i.summary, `${i.days} day${i.days > 1 ? 's' : ''} · from ${i.start} · ${cap(i.comfort)}`, ` data-bucket="${bucket(i.days)}" data-tags="${i.tags.join(' ')}" data-comfort="${i.comfort}"`, { icon: 'route', tag: `${i.days} day${i.days > 1 ? 's' : ''}`, tone: 'tone-' + i.comfort })).join('')}</div>
        </div>`;
  write('itineraries/index.html', page({ root, active: 'itineraries/', title: 'Uttarakhand Itineraries - Uttarakhand Tourism', desc: 'One-day to two-week Uttarakhand itineraries with day-by-day plans and realistic driving times.', canonical: 'itineraries/', body, jsonld: [bc.ld] }));
};

// ---------- guides ----------
const guidePage = g => {
  const root = '../../';
  const bc = crumbs(root, [['Home', 'index.html'], ['Plan', 'plan-trip.html'], [g.title, `guide/${g.slug}/`]]);
  const body = `${heroBlock(root, g.title, g.sub)}
        ${bc.html}
        <div class="container guide-single">
            <p class="lead">${esc(g.intro)}</p>
            ${g.sections.map(s => `<section class="guide-section"><h2>${esc(s.h)}</h2>${s.p ? `<p>${esc(s.p)}</p>` : ''}${s.list ? ul(s.list) : ''}</section>`).join('')}
            ${g.links ? `<section class="guide-section"><h2>Official and booking links</h2><ul class="bullets">${g.links.map(l => `<li><a href="${esc(l.url)}" rel="noopener" target="_blank">${esc(l.label)}</a></li>`).join('')}</ul></section>` : ''}
            ${faqBlock(g.faq)}
            ${sourcesBlock([UTDB], REVIEWED)}
        </div>`;
  write(`guide/${g.slug}/index.html`, page({ root, active: 'plan-trip.html', title: `${g.title} - Uttarakhand Tourism`, desc: g.sub + '. ' + g.intro.slice(0, 100), canonical: `guide/${g.slug}/`, body, jsonld: [bc.ld, ...faqLd(g.faq)] }));
};

const bestTimePage = () => {
  const root = '../';
  const bc = crumbs(root, [['Home', 'index.html'], ['Best time to visit', 'best-time/']]);
  const body = `${heroBlock(root, 'Best time to visit Uttarakhand', 'Month by month: weather, snow, roads, treks and Char Dham status')}
        ${bc.html}
        <div class="container guide-single">
            <p class="note">${esc(months.note)}</p>
            <div class="chips no-print" id="month-tabs" role="group" aria-label="Choose a month">${months.months.map(m => `<button type="button" class="chip" data-month="${m.n}">${m.name.slice(0, 3)}</button>`).join('')}</div>
            ${months.months.map(m => `<section class="guide-section month" data-month="${m.n}" id="m-${m.n}"><h2>${m.name}</h2>
                <dl class="facts"><dt>Weather</dt><dd>${esc(m.weather)}</dd><dt>Snow</dt><dd>${esc(m.snow)}</dd><dt>Roads</dt><dd>${esc(m.roads)}</dd><dt>Trekking</dt><dd>${esc(m.treks)}</dd><dt>Char Dham</dt><dd>${esc(m.chardham)}</dd><dt>Wildlife</dt><dd>${esc(m.wildlife)}</dd><dt>Festivals</dt><dd>${esc(m.festivals)}</dd><dt>Crowds</dt><dd>${esc(m.crowd)}</dd><dt>Good picks</dt><dd>${m.go.map(s => link(root, s)).join(', ')}</dd></dl></section>`).join('')}
            <section class="guide-section"><h2>By travel theme</h2>
                <div class="table-wrap"><table class="data-table"><thead><tr><th>Theme</th><th>When</th><th>Where</th></tr></thead><tbody>${months.themes.map(t => `<tr><td>${esc(t.theme)}</td><td>${esc(t.pick)}</td><td>${t.places.map(s => link(root, s)).join(', ')}</td></tr>`).join('')}</tbody></table></div></section>
            ${sourcesBlock([{ label: 'India Meteorological Department (forecasts and alerts)', url: 'https://mausam.imd.gov.in/' }, UTDB], REVIEWED)}
        </div>`;
  write('best-time/index.html', page({ root, active: 'best-time/', title: 'Best Time to Visit Uttarakhand, Month by Month - Uttarakhand Tourism', desc: 'Month-by-month Uttarakhand guide: weather, snow, roads, treks, Char Dham seasons and the best places for each time of year.', canonical: 'best-time/', body, jsonld: [bc.ld] }));
};

// ---------- char dham ----------
const dhamPage = () => {
  const root = '../';
  const bc = crumbs(root, [['Home', 'index.html'], ['Char Dham', 'char-dham/']]);
  const cards = ['yamunotri', 'gangotri', 'kedarnath', 'badrinath'].map(s => bySlug[s]).map(d => card(`${root}destination/${d.slug}/`, d.name, d.tagline, `${d.altitude} · ${d.district}`)).join('');
  const body = `${heroBlock(root, dham.title, 'Yamunotri, Gangotri, Kedarnath and Badrinath')}
        ${bc.html}
        <div class="container guide-single">
            ${actions('guide:char-dham', 'Char Dham guide', 'char-dham/')}
            <p class="lead">${esc(dham.intro)}</p>
            <div class="dham-grid">${cards}</div>
            <section class="guide-section"><h2>Significance</h2><p>${esc(dham.significance)}</p></section>
            <section class="guide-section"><h2>Sequence and duration</h2><p>${esc(dham.sequence)}</p><p>${esc(dham.duration)}</p><p>${esc(dham.startingPoints)}</p>
                <p>See the <a href="${root}itinerary/char-dham-eleven-days/">11-day Char Dham itinerary</a>.</p></section>
            <section class="guide-section"><h2>Opening and closing dates (${dham.seasonYear} season)</h2>
                <p class="note">${esc(dham.seasonNote)}</p>
                <div class="table-wrap"><table class="data-table"><thead><tr><th>Dham</th><th>Opened</th><th>Closing</th></tr></thead>
                <tbody>${dham.dates.map(r => `<tr><td>${esc(r.dham)}</td><td>${esc(r.open)}</td><td>${esc(r.close)}</td></tr>`).join('')}</tbody></table></div></section>
            <section class="guide-section"><h2>Registration</h2>${ul(dham.registration)}</section>
            <section class="guide-section"><h2>Getting around</h2>${ul(dham.transport)}</section>
            <section class="guide-section"><h2>Health and altitude</h2>${ul(dham.health)}</section>
            <section class="guide-section"><h2>Packing checklist</h2>
                <ul class="checklist" data-checklist="chardham">${dham.packing.map((p, i) => `<li><label><input type="checkbox" data-i="${i}"> ${esc(p)}</label></li>`).join('')}</ul></section>
            <section class="guide-section"><h2>Budget</h2><p>${esc(dham.budget)}</p></section>
            ${faqBlock(dham.faq)}
            ${sourcesBlock(dham.sources, dham.reviewed)}
        </div>`;
  write('char-dham/index.html', page({
    root, active: 'char-dham/', title: 'Char Dham Yatra Complete Guide - Uttarakhand Tourism',
    desc: 'Plan the Char Dham yatra: Yamunotri, Gangotri, Kedarnath and Badrinath. Registration, routes, season, health and packing.',
    canonical: 'char-dham/', body, jsonld: [bc.ld, ...faqLd(dham.faq)]
  }));
};

// ---------- regions, hub pages ----------
const regionPage = key => {
  const root = '../../';
  const r = REGIONS[key];
  const list = destinations.filter(d => d.region === key);
  const bc = crumbs(root, [['Home', 'index.html'], ['Destinations', 'destinations.html'], [r.name, `region/${key}/`]]);
  const body = `${heroBlock(root, r.name, r.intro)}
        ${bc.html}
        <div class="container"><div class="dham-grid">${list.map(d => card(`${root}destination/${d.slug}/`, d.name, d.tagline, `${d.altitude} · ${d.district}`)).join('')}</div></div>`;
  write(`region/${key}/index.html`, page({ root, active: 'destinations.html', title: `${r.name} Travel Guide - Uttarakhand Tourism`, desc: r.intro, canonical: `region/${key}/`, body, jsonld: [bc.ld] }));
};

const destinationsHub = () => {
  const root = '';
  const types = [...new Set(destinations.map(d => d.type))].sort();
  const body = `${heroBlock(root, 'Destinations', 'Guides to towns, lakes, hill stations, shrines, parks and villages across Garhwal and Kumaon')}
        <div class="container">
            <form class="filters no-print" aria-label="Destination filters" onsubmit="return false">
                <label>Search <input type="search" data-filter-text placeholder="Name or theme"></label>
                <label>Region <select data-filter="region"><option value="">Both</option><option value="garhwal">Garhwal</option><option value="kumaon">Kumaon</option></select></label>
                <label>Type <select data-filter="type"><option value="">Any</option>${types.map(t => `<option value="${t}">${cap(t.replace('-', ' '))}</option>`).join('')}</select></label>
                <label>Style <select data-filter="tags"><option value="">Any</option>${['peaceful', 'family', 'spiritual', 'adventure', 'lake', 'wildlife', 'trek', 'snow', 'couples'].map(t => `<option value="${t}">${cap(t)}</option>`).join('')}</select></label>
            </form>
            <p class="results" id="count" aria-live="polite"></p>
            <div class="dham-grid" data-filter-list>${destinations.map(d => card(`destination/${d.slug}/`, d.name, d.tagline, `${REGIONS[d.region].name} · ${d.altitude.split(' (')[0]}`, ` data-region="${d.region}" data-type="${d.type}" data-tags="${(d.tags || []).join(' ')}"`, { icon: TYPE_ICON[d.type] || 'mountain', tag: cap(d.type.replace('-', ' ')), tone: 'tone-' + d.region })).join('')}</div>
            <p class="note">See also: <a href="region/garhwal/">Garhwal</a>, <a href="region/kumaon/">Kumaon</a>, <a href="map/">map</a>, <a href="guide/peaceful-places/">peaceful places</a>, <a href="guide/wildlife-parks/">wildlife and parks</a>. Not listed yet: Rudraprayag, Srinagar (Garhwal), Naukuchiatal as a separate page, Abbott Mount, Champawat, Lohaghat, Dharchula, Peora, Sitla and Sari.</p>
        </div>`;
  write('destinations.html', page({ root, active: 'destinations.html', title: 'Top Destinations - Uttarakhand Tourism', desc: 'Browse Uttarakhand destination guides by region, type and travel style.', canonical: 'destinations.html', body }));
};

const planTripHub = () => {
  const root = '';
  const hubs = [
    ['plan/', 'Trip planner and budget estimator', 'Pick dates, days, group and interests to get matching itineraries and a cost range.'],
    ['best-time/', 'Best time to visit', 'Month-by-month weather, roads, treks and Char Dham status.'],
    ['guide/transport/', 'Getting there and around', 'Airports, railheads, buses, taxis and mountain-road tips.'],
    ['guide/stays/', 'Where to stay', 'Hotels, homestays, camps, ashrams and GMVN/KMVN.'],
    ['guide/culture-food-festivals/', 'Culture, food and festivals', 'Local dishes, fairs and visitor etiquette.'],
    ['guide/first-time-visitors/', 'First-time visitor guide', 'Planning, packing, health and common mistakes.'],
    ['guide/trek-preparation/', 'Trek preparation', 'Packing lists for day hikes to expeditions.'],
    ['guide/wildlife-parks/', 'Wildlife and national parks', 'Corbett, Rajaji and more.'],
    ['guide/peaceful-places/', 'Peaceful places', 'Quieter villages and hill stations.'],
    ['itineraries/', 'Itineraries', 'One day to two weeks, with realistic driving times.'],
    ['map/', 'Map', 'Destinations and treks on an interactive map.']
  ];
  const body = `${heroBlock(root, 'Plan Your Trip', 'Everything you need to plan a safe and realistic Uttarakhand journey')}
        <div class="container"><div class="dham-grid">${hubs.map(h => card(h[0], h[1], h[2], 'Open guide')).join('')}</div></div>`;
  write('plan-trip.html', page({ root, active: 'plan/', title: 'Plan Your Trip - Uttarakhand Tourism', desc: 'Planning guides for Uttarakhand: best time, transport, stays, food, itineraries and a trip planner.', canonical: 'plan-trip.html', body }));
};

// ---------- planner, map, saved, explore ----------
const planPage = () => {
  const root = '../';
  const bc = crumbs(root, [['Home', 'index.html'], ['Plan', 'plan/']]);
  const interests = ['spiritual', 'trek', 'lake', 'hill-station', 'wildlife', 'peaceful', 'adventure', 'snow', 'family', 'culture'];
  const rate = (id, label, r) => `<label>${label}<span class="range"><input type="number" id="${id}-lo" value="${r[0]}" min="0" aria-label="${label} low"> to <input type="number" id="${id}-hi" value="${r[1]}" min="0" aria-label="${label} high"></span></label>`;
  const body = `${heroBlock(root, 'Trip planner', 'Get matching itineraries and a cost range. Runs in your browser; nothing is sent anywhere.')}
        ${bc.html}
        <div class="container guide-single">
            <form id="planner" class="planner" onsubmit="return false">
                <fieldset><legend>Your trip</legend>
                    <label>Starting city <select id="start"><option>Delhi</option><option>Dehradun</option><option>Haridwar</option><option>Rishikesh</option><option>Kathgodam</option><option>Other</option></select></label>
                    <label>Month <select id="month">${months.months.map(m => `<option value="${m.n}">${m.name}</option>`).join('')}</select></label>
                    <label>Days available <input type="number" id="days" value="4" min="1" max="14"></label>
                    <label>Adults <input type="number" id="adults" value="2" min="1" max="20"></label>
                    <label>Children <input type="number" id="children" value="0" min="0" max="20"></label>
                    <label>Seniors <input type="number" id="seniors" value="0" min="0" max="20"></label>
                    <label>Budget level <select id="level"><option value="budget">Budget</option><option value="mid" selected>Mid-range</option><option value="comfort">Comfort</option></select></label>
                    <label>Pace <select id="pace"><option value="relaxed">Relaxed</option><option value="balanced" selected>Balanced</option><option value="fast">Fast</option></select></label>
                    <label>Getting around <select id="mode"><option value="taxi">Hired taxi</option><option value="bus">Bus and shared</option><option value="own">Own car</option></select></label>
                </fieldset>
                <fieldset><legend>Interests</legend><div class="checks">${interests.map(t => `<label><input type="checkbox" name="interest" value="${t}"> ${cap(t.replace('-', ' '))}</label>`).join('')}</div></fieldset>
                <fieldset class="rates"><legend>Cost assumptions (placeholders, edit them)</legend>
                    <p class="note">${esc(budget.note)}</p>
                    ${rate('stay', 'Room per night (budget)', budget.stay.budget)}
                    ${rate('stay-mid', 'Room per night (mid)', budget.stay.mid)}
                    ${rate('stay-comfort', 'Room per night (comfort)', budget.stay.comfort)}
                    ${rate('meals', 'Meals per person per day (mid)', budget.mealsPerPersonDay.mid)}
                    ${rate('taxi', 'Taxi per day', budget.transport.taxiPerDay)}
                    ${rate('bus', 'Bus per person per day', budget.transport.busPerPersonDay)}
                    ${rate('own', 'Own car per day (fuel and tolls)', budget.transport.ownCarPerDay)}
                    ${rate('act', 'Activities per person per day (balanced)', budget.activitiesPerPersonDay.balanced)}
                </fieldset>
                <div class="actions no-print"><button type="button" class="btn btn-small" data-share>Copy plan link</button><button type="button" class="btn btn-small" data-print>Print</button></div>
            </form>
            <section class="guide-section" aria-live="polite"><h2>Budget estimate</h2><div id="estimate"></div></section>
            <section class="guide-section" aria-live="polite"><h2>Suggested itineraries</h2><div id="matches" class="dham-grid"></div></section>
            <section class="guide-section"><h2>Checklists</h2>
                <h3>Hill trip</h3>
                <ul class="checklist" data-checklist="hill">${['Layers and a rain jacket', 'Comfortable walking shoes', 'Sun protection', 'Personal medicines', 'Power bank and offline maps', 'Cash for small towns', 'ID and booking copies'].map((p, i) => `<li><label><input type="checkbox" data-i="${i}"> ${p}</label></li>`).join('')}</ul>
                <h3>Before you leave</h3>
                <ul class="checklist" data-checklist="prep">${['Check road and weather status', 'Confirm accommodation and last-mile transport', 'Tell someone your route', 'Register or book permits where needed', 'Buy travel insurance if trekking', 'Download offline maps'].map((p, i) => `<li><label><input type="checkbox" data-i="${i}"> ${p}</label></li>`).join('')}</ul>
                <p>For treks, see the <a href="${root}guide/trek-preparation/">trek packing guide</a>; for Char Dham, the <a href="${root}char-dham/">Char Dham checklist</a>.</p></section>
        </div>`;
  write('plan/index.html', page({
    root, active: 'plan/', title: 'Trip Planner and Budget Estimator - Uttarakhand Tourism', desc: 'Plan an Uttarakhand trip: choose month, days and interests to get matching itineraries and an editable cost estimate.', canonical: 'plan/', body, jsonld: [bc.ld],
    script: `    <script src="${root}data/itineraries.js"></script>\n    <script src="${root}js/planner.js" data-root="${root}"></script>`
  }));
  dataJs('itineraries', (itins.map(i => ({ slug: i.slug, title: i.title, days: i.days, start: i.start, tags: i.tags, months: i.months, pace: i.pace, comfort: i.comfort, demanding: i.demanding, summary: i.summary }))));
  
};

const mapPage = () => {
  const root = '../';
  const bc = crumbs(root, [['Home', 'index.html'], ['Map', 'map/']]);
  const body = `${heroBlock(root, 'Map', 'Destinations and trek areas. Locations are approximate, at town or area level.')}
        ${bc.html}
        <div class="container"><div class="chips no-print" id="map-filter" role="group" aria-label="Filter map"><button class="chip active" data-kind="all">All</button><button class="chip" data-kind="dest">Destinations</button><button class="chip" data-kind="trek">Treks</button></div>
        <div id="big-map" class="big-map" role="img" aria-label="Interactive map of Uttarakhand destinations and treks"></div>
        <p class="note">Map data (c) OpenStreetMap contributors. Use an official or navigation map for exact directions and road status.</p></div>`;
  write('map/index.html', withRoot(page({ root, active: 'explore/', title: 'Map of Uttarakhand Destinations - Uttarakhand Tourism', desc: 'Interactive map of Uttarakhand destinations and trek areas.', canonical: 'map/', body, jsonld: [bc.ld], script: mapScripts }), root));
  dataJs('map', ([
    ...destinations.filter(d => d.lat).map(d => ({ kind: 'dest', name: d.name, lat: d.lat, lng: d.lng, url: `destination/${d.slug}/`, sub: d.tagline })),
    ...treks.filter(t => t.lat).map(t => ({ kind: 'trek', name: t.name, lat: t.lat, lng: t.lng, url: `trek/${t.slug}/`, sub: `${t.difficulty}, ${t.days} days` }))
  ]));
};

const savedPage = () => {
  const root = '../';
  const body = `${heroBlock(root, 'Saved', 'Pages you saved in this browser. Nothing is uploaded.')}
        <div class="container guide-single"><div id="saved-list" class="dham-grid"></div><p id="saved-empty" class="note">Nothing saved yet. Use the Save button on a destination, trek or itinerary.</p></div>`;
  write('saved/index.html', page({ root, active: '', title: 'Saved - Uttarakhand Tourism', desc: 'Pages you saved on this device.', canonical: 'saved/', body }));
};

const explorePage = () => {
  const root = '../';
  const bc = crumbs(root, [['Home', 'index.html'], ['Search', 'explore/']]);
  const body = `${heroBlock(root, 'Search Uttarakhand', 'Destinations, treks, itineraries and guides')}
        ${bc.html}
        <div class="container">
            <form class="explore-controls" role="search" onsubmit="return false">
                <label for="q" class="sr-only">Search</label>
                <input id="q" type="search" placeholder="Try: peaceful, snow, trek, Kumaon, 3 days" autocomplete="off">
                <div class="chips" role="group" aria-label="Filter by type">
                    <button type="button" class="chip active" data-type="all">All</button>
                    <button type="button" class="chip" data-type="dest">Destinations</button>
                    <button type="button" class="chip" data-type="trek">Treks</button>
                    <button type="button" class="chip" data-type="itin">Itineraries</button>
                    <button type="button" class="chip" data-type="guide">Guides</button>
                </div>
            </form>
            <p id="count" class="results" aria-live="polite"></p>
            <div id="results" class="dham-grid"><noscript>Enable JavaScript to search, or browse <a href="${root}destinations.html">destinations</a>.</noscript></div>
        </div>`;
  write('explore/index.html', page({ root, active: 'explore/', title: 'Search - Uttarakhand Tourism', desc: 'Search Uttarakhand destinations, treks, itineraries and guides.', canonical: 'explore/', body, jsonld: [bc.ld], script: `    <script src="${root}data/search.js"></script>\n    <script src="${root}js/explore.js" data-root="${root}"></script>` }));
  const gl = guides.map(g => ({ t: 'guide', name: g.title, url: `guide/${g.slug}/`, sub: g.sub, q: [g.title, g.sub, g.intro].join(' ').toLowerCase() }));
  dataJs('search', ([
    ...destinations.map(d => ({ t: 'dest', name: d.name, url: `destination/${d.slug}/`, sub: d.tagline, q: [d.name, d.type, REGIONS[d.region].name, d.district, d.tagline, d.quick.bestTime, d.quick.duration, ...(d.tags || []), ...d.attractions.map(a => a.name)].join(' ').toLowerCase() })),
    ...treks.map(t => ({ t: 'trek', name: t.name, url: `trek/${t.slug}/`, sub: `${cap(t.difficulty)}, ${t.days} days`, q: [t.name, 'trek', t.difficulty, t.level, t.season, t.base, REGIONS[t.region].name, `${t.days} days`, t.summary].join(' ').toLowerCase() })),
    ...itins.map(i => ({ t: 'itin', name: i.title, url: `itinerary/${i.slug}/`, sub: `${i.days} day${i.days > 1 ? 's' : ''}, from ${i.start}`, q: [i.title, 'itinerary', `${i.days} days`, `${i.days} day`, i.start, ...i.tags, i.pace, i.summary].join(' ').toLowerCase() })),
    { t: 'guide', name: dham.title, url: 'char-dham/', sub: 'Yamunotri, Gangotri, Kedarnath, Badrinath', q: 'char dham yatra pilgrimage yamunotri gangotri kedarnath badrinath registration' },
    { t: 'guide', name: 'Best time to visit, month by month', url: 'best-time/', sub: 'Weather, roads and seasons', q: 'best time month season weather snow monsoon' },
    ...gl
  ]));
};

// ---------- home and gallery ----------
const homePage = () => {
  const root = '';
  const featured = [
    { href: 'destination/rishikesh/', img: 'rishikesh-yoga', t: 'Rishikesh', s: 'Yoga capital on the Ganga' },
    { href: 'char-dham/', img: 'snow-ridge', t: 'Char Dham', s: 'The four Himalayan shrines' },
    { href: 'treks/', img: 'trekker-ridge', t: 'Treks', s: 'From a weekend to a fortnight' }
  ];
  const body = withRoot(`<section class="hero" style="background-image: url('${images.overview.v[1].path}');">
            <div class="hero-content">
                <h1>Welcome to Uttarakhand</h1>
                <h2>The Land of Gods</h2>
                <p>Practical guides to destinations, treks, itineraries and the Char Dham, built to plan a realistic Himalayan trip.</p>
                <a href="destinations.html" class="btn btn-primary">Explore Destinations</a>
            </div>
        </section>

        <section class="intro container">
            <div class="section-header"><h2>Discover Uttarakhand</h2><div class="divider"></div></div>
            <div class="intro-content">
                <div class="intro-text">
                    <p>Nestled in the lap of the Himalayas, Uttarakhand is known as Devbhumi, the Land of Gods. Garhwal in the west holds the Char Dham shrines, Rishikesh and Haridwar; Kumaon in the east has lakes, hill towns and remote valleys.</p>
                    <p>Start with a region, a trek or a ready-made itinerary, check the best month to go, and use the planner to estimate your costs.</p>
                    <a href="plan/" class="btn btn-secondary">Open the Trip Planner</a>
                </div>
                <div class="intro-image">${pic('overview', { sizes: '(min-width: 900px) 540px, 100vw' })}</div>
            </div>
        </section>

        <section class="highlights"><div class="container">
            <div class="section-header"><h2>Plan Your Trip</h2><div class="divider"></div></div>
            <div class="highlights-grid">
                <div class="highlight-card"><div class="card-icon"><i class="fas fa-om"></i></div><h3>Char Dham</h3><p>Registration, routes, seasons and health for the four shrines.</p><a href="char-dham/">Read the guide</a></div>
                <div class="highlight-card"><div class="card-icon"><i class="fas fa-hiking"></i></div><h3>Trek Finder</h3><p>Filter by difficulty, length, season and altitude.</p><a href="treks/">Find a trek</a></div>
                <div class="highlight-card"><div class="card-icon"><i class="fas fa-route"></i></div><h3>Itineraries</h3><p>One day to two weeks, with realistic driving times.</p><a href="itineraries/">Browse itineraries</a></div>
                <div class="highlight-card"><div class="card-icon"><i class="fas fa-calendar-alt"></i></div><h3>Best Time</h3><p>Month-by-month weather, roads and seasons.</p><a href="best-time/">See the calendar</a></div>
            </div>
        </div></section>

        <section class="featured-destinations container">
            <div class="section-header"><h2>Start Here</h2><div class="divider"></div></div>
            <div class="destination-grid">${featured.map(f => `<div class="destination-card">${pic(f.img)}<div class="destination-info"><h3>${f.t}</h3><p>${f.s}</p><a href="${f.href}" class="btn btn-small">Learn More</a></div></div>`).join('')}</div>
            <div class="center-button"><a href="destinations.html" class="btn btn-primary">View All Destinations</a></div>
        </section>`, root);
  write('index.html', page({ root, active: 'index.html', title: 'Uttarakhand Tourism - Discover the Land of Gods', desc: 'Guides to Uttarakhand destinations, treks, itineraries, the Char Dham yatra, best time to visit and a trip planner.', canonical: '', body, ogImage: images.overview.v[1].path, jsonld: [{ '@context': 'https://schema.org', '@graph': [{ ...ORG, '@id': SITE + '/#org' }, { '@type': 'WebSite', url: SITE + '/', name: 'Uttarakhand Tourism', inLanguage: 'en-IN', publisher: { '@id': SITE + '/#org' } }] }] }));
};

const galleryPage = () => {
  const root = '';
  const themes = { mountains: 'Mountains', trekking: 'Trekking', landscape: 'Landscapes', culture: 'Culture' };
  const items = Object.entries(images).map(([id, im]) => `<div class="gallery-item ${im.theme}"><a href="${im.v[1].path}" target="_blank" rel="noopener">${pic(id)}</a><div class="gallery-overlay"><div class="overlay-content"><h3>${esc(themes[im.theme])}</h3><p>${esc(im.alt)}${im.credit ? ` &middot; Photo: ${esc(im.credit)}` : ''}</p></div></div></div>`).join('');
  const body = withRoot(`<section class="guide-hero"><div class="container"><h1>Photo Gallery</h1><p>Photographs of Himalayan landscapes, treks and culture</p></div></section>
        <section class="gallery-overview container">
            <div class="gallery-filter">
                <button class="filter-btn active" data-filter="all">All</button>
                ${Object.entries(themes).map(([k, v]) => `<button class="filter-btn" data-filter="${k}">${v}</button>`).join('')}
            </div>
            <div class="gallery-grid">${items}</div>
            <p class="note">Captions describe what the photo shows and do not claim a specific location unless stated. Credits are taken from the original file names where available; photos without a credit still need their source and licence confirmed.</p>
            <div class="submit-photo-cta"><h2>Share your photos</h2><p>Send high-resolution photos with location, date and a short description. By sending, you confirm you took the photo and agree to us showing it with credit.</p><a href="contact.html" class="btn btn-primary">Contact Us</a></div>
        </section>`, root);
  write('gallery.html', page({ root, active: 'gallery.html', title: 'Gallery - Uttarakhand Tourism', desc: 'Photographs of Uttarakhand mountains, treks and culture.', canonical: 'gallery.html', body }));
};

// ---------- contact (hand-written, chrome only) ----------
const headMeta = (title, desc, canonical) => `<meta name="description" content="${esc(desc)}">
    <link rel="canonical" href="${SITE}/${canonical}">
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
    <meta name="theme-color" content="#123c5a">
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="icon" href="favicon.ico" sizes="48x48">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">
    <link rel="manifest" href="manifest.webmanifest">
    <meta property="og:site_name" content="Uttarakhand Tourism">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${SITE}/${canonical}">
    <meta property="og:image" content="${SITE}/og-default.png">
    <meta name="twitter:card" content="summary_large_image">`;
const refreshChrome = () => {
  for (const f of ['contact.html']) {
    let s = fs.readFileSync(R(f), 'utf8');
    s = s.replace(/<meta name="description"[\s\S]*?(?=<link rel="stylesheet" href="css\/style.css">)/, '').replace('<link rel="stylesheet" href="css/style.css">', () => headMeta('Contact Uttarakhand Tourism', 'Questions about Uttarakhand trips? Find the information centre, contact details and answers to common questions.', 'contact.html') + '\n    <link rel="stylesheet" href="css/style.css">');
    s = explicit(s.replace(/<header>[\s\S]*?<\/header>/, () => header('', f)).replace(/<footer>[\s\S]*?<\/footer>/, () => footer('')));
    fs.writeFileSync(R(f), s);
  }
};

// ---------- sitemap ----------
const sitemap = () => {
  const urls = ['index.html', 'destinations.html', 'gallery.html', 'plan-trip.html', 'contact.html', 'explore/', 'char-dham/', 'best-time/', 'plan/', 'map/', 'treks/', 'itineraries/', 'region/garhwal/', 'region/kumaon/',
    ...destinations.map(d => `destination/${d.slug}/`), ...treks.map(t => `trek/${t.slug}/`), ...itins.map(i => `itinerary/${i.slug}/`), ...guides.map(g => `guide/${g.slug}/`)];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}/${u === 'index.html' ? '' : u}</loc><lastmod>${REVIEWED}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  write('manifest.webmanifest', JSON.stringify({ name: 'Uttarakhand Tourism', short_name: 'Uttarakhand', start_url: '/', display: 'standalone', background_color: '#fcfbf8', theme_color: '#123c5a', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }));
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
};

destinations.forEach(destPage);
treks.forEach(trekPage);
itins.forEach(itinPage);
guides.forEach(guidePage);
Object.keys(REGIONS).forEach(regionPage);
treksIndex(); itinsIndex(); bestTimePage(); dhamPage(); planPage(); mapPage(); savedPage(); explorePage();
homePage(); galleryPage(); destinationsHub(); planTripHub();
refreshChrome(); sitemap();
console.log(`built: ${destinations.length} destinations, ${treks.length} treks, ${itins.length} itineraries, ${guides.length} guides`);
