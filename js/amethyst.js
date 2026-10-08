/*
  Amethyst-Theme - script-loader (Jellyfin 12)

  Laden via de JavaScript Injector-plugin:
    (function () {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/gh/JulienLoon/Amethyst-Theme@main/js/amethyst.js';
        document.head.appendChild(s);
    })();

  Onderdelen aan/uit zetten: zet VOOR de loader een config, bijvoorbeeld
    window.AmethystConfig = { badges: false, lite: true, spotlight: { limit: 5 } };

  - navbarSearch  echte zoekbalk in de navbar          (standaard aan)
  - spotlight     grote banner bovenaan de homepage    (standaard aan)
  - badges        4K / DV / HDR / Atmos op kaarten     (standaard aan)
  - dashboard     thema ook op het beheer-dashboard    (standaard aan)
  - lite          geen blur en geen animaties          (standaard uit)
*/
(function () {
    'use strict';

    if (window.__amethyst) return;
    window.__amethyst = true;

    var cfg = Object.assign({
        navbarSearch: true,
        spotlight: true,
        badges: true,
        dashboard: true,
        lite: false
    }, window.AmethystConfig);

    // Andere bestanden staan naast dit script (werkt ook met een commit-hash of fork)
    var self = document.currentScript && document.currentScript.src;
    var base = self ? self.replace(/[^/]*$/, '') : 'https://cdn.jsdelivr.net/gh/JulienLoon/Amethyst-Theme@main/js/';

    function load(file) {
        var s = document.createElement('script');
        s.src = base + file;
        document.head.appendChild(s);
    }

    if (cfg.lite) document.documentElement.classList.add('am-lite');
    if (cfg.navbarSearch) load('navbar-search.js');
    if (cfg.spotlight) load('spotlight.js');
    if (cfg.badges) load('badges.js');

    // Jellyfin haalt de Custom CSS weg op het dashboard. Dan voegen we theme.css
    // zelf toe, en schakelen hem weer uit zodra de Custom CSS terug is.
    if (cfg.dashboard) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = base + '../theme.css';
        link.disabled = true;
        document.head.appendChild(link);

        var queued = false;
        var check = function () {
            queued = false;
            link.disabled = true;
            var themed = getComputedStyle(document.documentElement).getPropertyValue('--am-accent-rgb').trim();
            link.disabled = !!themed;
        };
        var schedule = function () {
            if (queued) return;
            queued = true;
            requestAnimationFrame(check);
        };
        new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
        window.addEventListener('hashchange', schedule);
        schedule();
    }
})();
