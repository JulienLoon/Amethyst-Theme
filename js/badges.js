/*
  Amethyst-Theme - kwaliteitsbadges op kaarten (Jellyfin 12)
  Wordt geladen door js/amethyst.js. Toont 4K, Dolby Vision, HDR10+/HDR/HLG
  en Atmos / DTS:X linksboven op film- en afleveringskaarten.
*/
(function () {
    'use strict';

    if (window.__amethystBadges) return;
    window.__amethystBadges = true;

    var TYPES = { Movie: 1, Episode: 1, Video: 1, MusicVideo: 1 };
    var BATCH = 50;

    var cache = Object.create(null); // id -> [[tekst, soort], ...]
    var queue = [];
    var queued = Object.create(null);
    var flushTimer = null;

    function api() {
        var c = window.ApiClient;
        return c && c.getCurrentUserId && c.getCurrentUserId() ? c : null;
    }

    function badgesFor(item) {
        var streams = item.MediaStreams || [];
        var out = [];

        var video = streams.filter(function (s) { return s.Type === 'Video'; })[0];
        if (video) {
            if ((video.Width || 0) >= 3200 || (video.Height || 0) >= 2000) out.push(['4K', 'res']);

            var range = video.VideoRangeType || '';
            if (/^DOVI/.test(range)) out.push(['DV', 'dv']);
            else if (/HDR10Plus/.test(range)) out.push(['HDR10+', 'hdr']);
            else if (/HDR10/.test(range)) out.push(['HDR', 'hdr']);
            else if (/HLG/.test(range)) out.push(['HLG', 'hdr']);
        }

        var audio = streams.filter(function (s) { return s.Type === 'Audio'; }).map(function (s) {
            return [s.Profile, s.DisplayTitle, s.Title].join(' ');
        }).join(' | ');
        if (/atmos/i.test(audio)) out.push(['Atmos', 'audio']);
        else if (/DTS[:-]?X/i.test(audio)) out.push(['DTS:X', 'audio']);

        return out;
    }

    function render(card, list) {
        card.setAttribute('data-am-badges', 'done');
        if (!list.length) return;
        var host = card.querySelector('.cardScalable');
        if (!host || host.querySelector('.am-badges')) return;

        var wrap = document.createElement('div');
        wrap.className = 'am-badges';
        list.forEach(function (b) {
            var span = document.createElement('span');
            span.className = 'am-badge am-badge-' + b[1];
            span.textContent = b[0];
            wrap.appendChild(span);
        });
        host.appendChild(wrap);
    }

    function apply(id) {
        var cards = document.querySelectorAll('.card[data-id="' + CSS.escape(id) + '"]');
        for (var i = 0; i < cards.length; i++) render(cards[i], cache[id]);
    }

    function flush() {
        flushTimer = null;
        var client = api();
        if (!client) {
            flushTimer = setTimeout(flush, 1000);
            return;
        }

        var ids = queue.splice(0, BATCH);
        var done = function (items) {
            items.forEach(function (item) { cache[item.Id] = badgesFor(item); });
            ids.forEach(function (id) {
                if (!cache[id]) cache[id] = [];
                delete queued[id];
                apply(id);
            });
        };

        client.getJSON(client.getUrl('Items', {
            userId: client.getCurrentUserId(),
            Ids: ids.join(','),
            Fields: 'MediaStreams',
            EnableImages: false,
            EnableUserData: false
        })).then(function (res) {
            done(res.Items || []);
        }).catch(function () {
            done([]);
        });

        if (queue.length) flushTimer = setTimeout(flush, 0);
    }

    function scan() {
        var cards = document.querySelectorAll('.card[data-id]:not([data-am-badges])');
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var id = card.getAttribute('data-id');
            if (!TYPES[card.getAttribute('data-type')]) {
                card.setAttribute('data-am-badges', 'skip');
            } else if (cache[id]) {
                render(card, cache[id]);
            } else {
                card.setAttribute('data-am-badges', 'pending');
                if (!queued[id]) {
                    queued[id] = true;
                    queue.push(id);
                }
            }
        }
        // Even wachten zodat een hele rij kaarten in een request gaat
        if (queue.length && !flushTimer) flushTimer = setTimeout(flush, 120);
    }

    var scheduled = false;
    function schedule() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () {
            scheduled = false;
            scan();
        });
    }

    function start() {
        new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
        // Na het laden is er soms nog geen ingelogde gebruiker en komt er geen DOM-wijziging meer
        var tries = 0;
        var poll = setInterval(function () {
            schedule();
            if (api() || ++tries > 60) clearInterval(poll);
        }, 500);
        schedule();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
