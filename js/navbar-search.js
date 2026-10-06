/*
  Amethyst-Theme - echte zoekbalk in de navbar (Jellyfin 12)

  Laden via de JavaScript Injector-plugin:
    (function () {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/gh/JulienLoon/Amethyst-Theme@main/js/navbar-search.js';
        document.head.appendChild(s);
    })();

  - Typen zoekt live (op de zoekpagina) of springt naar de zoekpagina
  - "/" of Ctrl/Cmd+K focust het veld, Esc maakt leeg
  - Zonder dit script valt het thema terug op de CSS-zoekknop
*/
(function () {
    'use strict';

    if (window.__amethystNavSearch) return;
    window.__amethystNavSearch = true;

    var DEBOUNCE_MS = 250;
    var LABEL = 'Search…';
    var timer = null;

    function isSearchRoute() {
        return /^#\/search(\?|$)/.test(location.hash);
    }

    function queryFromUrl() {
        var q = location.hash.split('?')[1] || '';
        return new URLSearchParams(q).get('query') || '';
    }

    // React-gecontroleerd invoerveld: waarde via de native setter zetten, dan 'input' afvuren
    function setReactInputValue(input, value) {
        var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function runSearch(value, field) {
        if (isSearchRoute()) {
            var pageInput = document.querySelector('#searchPage:not(.hide) #searchTextInput');
            if (pageInput) {
                setReactInputValue(pageInput, value);
                return;
            }
        }
        if (!value) return;
        location.hash = '#/search?query=' + encodeURIComponent(value);
        // De zoekpagina pakt na het laden zelf focus; daarna terug naar de navbar
        [80, 300, 700].forEach(function (ms) {
            setTimeout(function () {
                if (document.activeElement !== field) {
                    field.focus();
                    field.setSelectionRange(field.value.length, field.value.length);
                }
            }, ms);
        });
    }

    function build() {
        var form = document.createElement('form');
        form.className = 'am-navsearch';
        form.setAttribute('role', 'search');
        form.innerHTML =
            '<span class="material-icons am-navsearch-icon" aria-hidden="true">search</span>' +
            '<input class="am-navsearch-input" type="search" autocomplete="off" spellcheck="false" aria-label="Search">' +
            '<kbd class="am-navsearch-kbd" aria-hidden="true">/</kbd>' +
            '<button class="am-navsearch-clear" type="button" aria-label="Clear" tabindex="-1">' +
            '<span class="material-icons" aria-hidden="true">close</span></button>';

        var field = form.querySelector('input');
        field.placeholder = LABEL;

        var sync = function () {
            form.classList.toggle('has-value', field.value.length > 0);
        };

        field.addEventListener('input', function () {
            sync();
            clearTimeout(timer);
            var value = field.value.trim();
            timer = setTimeout(function () { runSearch(value, field); }, DEBOUNCE_MS);
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearTimeout(timer);
            runSearch(field.value.trim(), field);
        });

        field.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                if (field.value) {
                    field.value = '';
                    sync();
                    runSearch('', field);
                } else {
                    field.blur();
                }
                e.stopPropagation();
            }
        });

        form.querySelector('.am-navsearch-clear').addEventListener('click', function () {
            field.value = '';
            sync();
            runSearch('', field);
            field.focus();
        });

        form.__field = form.querySelector('input');
        form.__sync = sync;
        return form;
    }

    var form = build();

    // React tekent de toolbar opnieuw bij navigeren: het veld steeds terugzetten naast de zoekknop
    function mount() {
        var anchor = document.querySelector('.MuiAppBar-root a[aria-label="Search"]');
        if (!anchor) return;
        if (form.nextElementSibling !== anchor || !form.isConnected) {
            anchor.parentNode.insertBefore(form, anchor);
        }
        document.documentElement.classList.add('am-js-navsearch');

        // URL -> veld (bv. bij terugknop of een directe link)
        var q = queryFromUrl();
        if (isSearchRoute() && document.activeElement !== form.__field && form.__field.value !== q) {
            form.__field.value = q;
            form.__sync();
        }
        if (!isSearchRoute() && document.activeElement !== form.__field && form.__field.value) {
            form.__field.value = '';
            form.__sync();
        }
        document.documentElement.classList.toggle('am-on-search', isSearchRoute());
    }

    function start() {
        new MutationObserver(function () { mount(); }).observe(document.body, { childList: true, subtree: true });
        window.addEventListener('hashchange', mount);
        mount();
    }

    // Sneltoetsen: "/" en Ctrl/Cmd+K
    document.addEventListener('keydown', function (e) {
        var t = e.target;
        var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
        var isSlash = e.key === '/' && !typing;
        var isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
        if ((isSlash || isCmdK) && form.isConnected && form.offsetParent !== null) {
            e.preventDefault();
            form.__field.focus();
            form.__field.select();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
