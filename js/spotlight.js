/*
  Amethyst-Theme - spotlight-banner op de homepage (Jellyfin 12)
  Wordt geladen door js/amethyst.js. Instellen via window.AmethystConfig.spotlight:
    {
      limit: 8,                    // aantal titels
      interval: 8000,              // ms per titel
      types: 'Movie,Series',
      sortBy: 'DateCreated',       // of 'Random', 'CommunityRating' ...
      labels: { eyebrow: 'Recently added', play: 'Play', resume: 'Resume', info: 'More info' }
    }
*/
(function () {
    'use strict';

    if (window.__amethystSpotlight) return;
    window.__amethystSpotlight = true;

    var userCfg = (window.AmethystConfig || {}).spotlight;
    var cfg = Object.assign({
        limit: 8,
        interval: 8000,
        types: 'Movie,Series',
        sortBy: 'DateCreated'
    }, userCfg);
    var labels = Object.assign({
        eyebrow: 'Recently added',
        play: 'Play',
        resume: 'Resume',
        info: 'More info'
    }, userCfg && userCfg.labels);

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var RETRY_MS = 30000;

    var items = null;
    var loadedFor = null;
    var failedAt = 0;
    var root = null;
    var index = 0;
    var timer = null;
    var paused = false;

    function api() {
        var c = window.ApiClient;
        return c && c.getCurrentUserId && c.getCurrentUserId() ? c : null;
    }

    function el(tag, className, text) {
        var e = document.createElement(tag);
        if (className) e.className = className;
        if (text != null) e.textContent = text;
        return e;
    }

    function icon(name) {
        var i = el('span', 'material-icons', name);
        i.setAttribute('aria-hidden', 'true');
        return i;
    }

    function runtime(ticks) {
        var min = Math.round(ticks / 600000000);
        if (!min) return '';
        return min >= 60 ? Math.floor(min / 60) + 'h ' + (min % 60) + 'm' : min + 'm';
    }

    function resumeTicks(item) {
        return (item.UserData && item.UserData.PlaybackPositionTicks) || 0;
    }

    function load(client) {
        var userId = client.getCurrentUserId();
        loadedFor = userId;
        items = null;
        if (root) {
            root.remove();
            root = null;
        }
        client.getJSON(client.getUrl('Items', {
            userId: userId,
            IncludeItemTypes: cfg.types,
            Recursive: true,
            SortBy: cfg.sortBy,
            SortOrder: 'Descending',
            Limit: cfg.limit,
            ImageTypes: 'Backdrop',
            EnableUserData: true,
            Fields: 'Overview,Genres,ProductionYear,OfficialRating,CommunityRating,RunTimeTicks'
        })).then(function (res) {
            if (loadedFor !== userId) return;
            items = res.Items || [];
            mount();
        }).catch(function () {
            loadedFor = null;
            failedAt = Date.now();
        });
    }

    function openDetails(client, item) {
        location.hash = '#/details?id=' + item.Id + '&serverId=' + client.serverId();
    }

    // Afspelen via de eigen sessie: de webclient krijgt een "PlayNow" en start de speler zelf
    function play(client, item) {
        client.getJSON(client.getUrl('Sessions', { deviceId: client.deviceId() })).then(function (sessions) {
            if (!sessions.length) throw new Error('no session');
            var params = { playCommand: 'PlayNow', itemIds: item.Id };
            if (resumeTicks(item)) params.startPositionTicks = resumeTicks(item);
            return client.ajax({ type: 'POST', url: client.getUrl('Sessions/' + sessions[0].Id + '/Playing', params) });
        }).catch(function () {
            openDetails(client, item);
        });
    }

    function buildSlide(client, item, i) {
        var slide = el('div', 'am-spotlight-slide');
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', (i + 1) + ' / ' + items.length + ': ' + item.Name);

        var bg = el('img', 'am-spotlight-bg');
        bg.alt = '';
        bg.decoding = 'async';
        if (i > 0) bg.loading = 'lazy';
        bg.src = client.getUrl('Items/' + item.Id + '/Images/Backdrop/0', {
            tag: item.BackdropImageTags && item.BackdropImageTags[0],
            maxWidth: 1920,
            quality: 85
        });
        slide.appendChild(bg);

        var content = el('div', 'am-spotlight-content');
        content.appendChild(el('span', 'am-spotlight-eyebrow', labels.eyebrow));

        if (item.ImageTags && item.ImageTags.Logo) {
            var logo = el('img', 'am-spotlight-logo');
            logo.alt = item.Name;
            logo.src = client.getUrl('Items/' + item.Id + '/Images/Logo', { tag: item.ImageTags.Logo, maxHeight: 260 });
            content.appendChild(logo);
        } else {
            content.appendChild(el('h2', 'am-spotlight-title', item.Name));
        }

        var meta = el('div', 'am-spotlight-meta');
        if (item.ProductionYear) meta.appendChild(el('span', null, item.ProductionYear));
        if (item.OfficialRating) meta.appendChild(el('span', 'am-spotlight-rating', item.OfficialRating));
        if (item.RunTimeTicks && item.Type !== 'Series') meta.appendChild(el('span', null, runtime(item.RunTimeTicks)));
        if (item.CommunityRating) {
            var star = el('span', 'am-spotlight-star');
            star.appendChild(icon('star'));
            star.appendChild(document.createTextNode(item.CommunityRating.toFixed(1)));
            meta.appendChild(star);
        }
        if (item.Genres && item.Genres.length) meta.appendChild(el('span', null, item.Genres.slice(0, 3).join(' · ')));
        content.appendChild(meta);

        if (item.Overview) content.appendChild(el('p', 'am-spotlight-overview', item.Overview));

        var actions = el('div', 'am-spotlight-actions');
        var playBtn = el('button', 'am-spotlight-btn am-spotlight-play');
        playBtn.type = 'button';
        playBtn.appendChild(icon('play_arrow'));
        playBtn.appendChild(document.createTextNode(resumeTicks(item) ? labels.resume : labels.play));
        playBtn.addEventListener('click', function () { play(client, item); });

        var infoBtn = el('button', 'am-spotlight-btn am-spotlight-info');
        infoBtn.type = 'button';
        infoBtn.appendChild(icon('info_outline'));
        infoBtn.appendChild(document.createTextNode(labels.info));
        infoBtn.addEventListener('click', function () { openDetails(client, item); });

        actions.appendChild(playBtn);
        actions.appendChild(infoBtn);
        content.appendChild(actions);
        slide.appendChild(content);
        return slide;
    }

    function build(client) {
        var section = el('section', 'am-spotlight');
        section.setAttribute('aria-roledescription', 'carousel');
        section.setAttribute('aria-label', 'Spotlight');

        items.forEach(function (item, i) {
            section.appendChild(buildSlide(client, item, i));
        });

        if (items.length > 1) {
            var controls = el('div', 'am-spotlight-controls');
            var prev = el('button', 'am-spotlight-arrow');
            prev.type = 'button';
            prev.setAttribute('aria-label', 'Previous');
            prev.appendChild(icon('chevron_left'));
            prev.addEventListener('click', function () { go(index - 1); });

            var dots = el('div', 'am-spotlight-dots');
            items.forEach(function (item, i) {
                var dot = el('button', 'am-spotlight-dot');
                dot.type = 'button';
                dot.setAttribute('aria-label', item.Name);
                dot.addEventListener('click', function () { go(i); });
                dots.appendChild(dot);
            });

            var next = el('button', 'am-spotlight-arrow');
            next.type = 'button';
            next.setAttribute('aria-label', 'Next');
            next.appendChild(icon('chevron_right'));
            next.addEventListener('click', function () { go(index + 1); });

            controls.appendChild(prev);
            controls.appendChild(dots);
            controls.appendChild(next);
            section.appendChild(controls);
        }

        // Pauzeren zolang de gebruiker ermee bezig is
        section.addEventListener('mouseenter', function () { paused = true; restart(); });
        section.addEventListener('mouseleave', function () { paused = false; restart(); });
        section.addEventListener('focusin', function () { paused = true; restart(); });
        section.addEventListener('focusout', function (e) {
            if (!section.contains(e.relatedTarget)) {
                paused = false;
                restart();
            }
        });
        section.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') go(index - 1);
            else if (e.key === 'ArrowRight') go(index + 1);
            else return;
            e.preventDefault();
            e.stopPropagation();
        });

        // Vegen op touchscreens
        var startX = null;
        section.addEventListener('pointerdown', function (e) {
            if (e.pointerType !== 'mouse') startX = e.clientX;
        });
        section.addEventListener('pointerup', function (e) {
            if (startX == null) return;
            var dx = e.clientX - startX;
            startX = null;
            if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        });

        index = 0;
        render(section);
        return section;
    }

    function render(section) {
        var slides = section.querySelectorAll('.am-spotlight-slide');
        var dots = section.querySelectorAll('.am-spotlight-dot');
        for (var i = 0; i < slides.length; i++) {
            var active = i === index;
            slides[i].classList.toggle('is-active', active);
            slides[i].setAttribute('aria-hidden', active ? 'false' : 'true');
            slides[i].inert = !active;
            if (dots[i]) dots[i].setAttribute('aria-current', active ? 'true' : 'false');
        }
    }

    function go(i) {
        if (!root || !items.length) return;
        index = (i + items.length) % items.length;
        render(root);
        restart();
    }

    function restart() {
        clearInterval(timer);
        timer = null;
        if (paused || reducedMotion || !items || items.length < 2) return;
        timer = setInterval(function () {
            // Alleen doordraaien als de banner echt zichtbaar is
            if (document.hidden || !root || !root.isConnected || root.offsetParent === null) return;
            go(index + 1);
        }, cfg.interval);
    }

    function mount() {
        var client = api();
        if (!client) return;

        if (loadedFor !== client.getCurrentUserId()) {
            if (Date.now() - failedAt > RETRY_MS) load(client);
            return;
        }
        if (!items || !items.length) return;

        var sections = document.querySelector('#homeTab .homeSectionsContainer');
        if (!sections) return;

        if (!root) {
            root = build(client);
            restart();
        }
        if (root.nextElementSibling !== sections) {
            sections.parentNode.insertBefore(root, sections);
        }
    }

    var queued = false;
    function schedule() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
            queued = false;
            mount();
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
        window.addEventListener('hashchange', schedule);
        schedule();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
