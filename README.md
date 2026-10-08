<p align="center"><img src="logos/amethyst-logo-320.png" width="140" alt="Amethyst-Theme logo"></p>

# Amethyst-Theme

Een donker, glassy en transparant paars thema voor **Jellyfin 12.x**, met Inter als lettertype.

- Langzaam bewegende aurora-achtergrond in violet, orchidee en indigo
- Zwevende glazen header en glazen zijmenu
- Kaarten met lift en paarse gloed bij hover
- Detailpagina's met fanart en een scrim, zodat de tekst ook bij felle afbeeldingen leesbaar blijft
- Alle standaard-blauwe accenten van Jellyfin worden paars, via het `--jf-palette-*` palet van Jellyfin 12
- Werkt op desktop en mobiel, en houdt rekening met `prefers-reduced-motion` en `prefers-reduced-transparency`
- Optioneel (via JavaScript): spotlight-banner op de homepage, kwaliteitsbadges (4K, Dolby Vision, HDR, Atmos), een echte zoekbalk en het thema op het beheer-dashboard

## Installatie

Dashboard > General > **Custom CSS Code**:

```css
@import url("https://cdn.jsdelivr.net/gh/JulienLoon/Amethyst-Theme@main/theme.css");
```

Opslaan en de pagina hard verversen (Ctrl/Cmd + Shift + R).

> jsDelivr cachet `@main` een tijd. Wil je een update meteen zien, vervang dan `@main` door een commit-hash, of ververs de cache via
> `https://purge.jsdelivr.net/gh/JulienLoon/Amethyst-Theme@main/theme.css`.

## Lite-modus (tv's en tragere apparaten)

Blur en de bewegende achtergrond zijn zwaar voor tv's, oude tablets en goedkope telefoons. Zet deze regel **onder** de import van het thema om ze uit te zetten:

```css
@import url("https://cdn.jsdelivr.net/gh/JulienLoon/Amethyst-Theme@main/lite.css");
```

Bij de tv-layout van Jellyfin, en als het systeem om minder transparantie vraagt, gaat de lite-modus vanzelf aan.

## Optioneel: scripts

Met JavaScript krijgt het thema extra functies:

| Onderdeel | Wat het doet |
| --- | --- |
| `spotlight` | Grote banner bovenaan de homepage met recent toegevoegde titels, met fanart, logo, info en een play-knop |
| `badges` | 4K, DV, HDR10+/HDR/HLG en Atmos/DTS:X linksboven op film- en afleveringskaarten |
| `navbarSearch` | Echte zoekbalk in de navbar: je typt en de resultaten verschijnen live. `/` of `Ctrl/Cmd + K` zet de focus erin, `Esc` maakt het veld leeg. Op mobiel blijft het een icoon. |
| `dashboard` | Het thema ook op het beheer-dashboard. Jellyfin laadt daar zelf geen Custom CSS. |

1. Installeer de [JavaScript Injector](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector)-plugin. Voeg daarvoor in Dashboard > Plugins > Catalog > ⚙️ deze repository toe:
   `https://raw.githubusercontent.com/n00bcodr/jellyfin-plugins/main/12/manifest.json`. Installeer daarna de plugin en herstart de server.
2. Ga naar Dashboard > Plugins > JavaScript Injector > **Add Script**, plak dit en vink **Enabled** aan:

```js
(function () {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/gh/JulienLoon/Amethyst-Theme@main/js/amethyst.js';
    document.head.appendChild(s);
})();
```

Alles staat standaard aan. Wil je iets aanpassen, zet dan bovenaan in hetzelfde script een config:

```js
window.AmethystConfig = {
    badges: false,                 // onderdeel uitzetten
    lite: true,                    // lite-modus op elk apparaat
    spotlight: {
        limit: 5,                  // aantal titels (standaard 8)
        interval: 10000,           // ms per titel (standaard 8000)
        sortBy: 'Random',          // standaard 'DateCreated'
        types: 'Movie',            // standaard 'Movie,Series'
        labels: { eyebrow: 'Nieuw', play: 'Afspelen', resume: 'Verder kijken', info: 'Meer info' }
    }
};
```

> Heb je eerder alleen `js/navbar-search.js` geladen? Dat blijft werken. Vervang het door `js/amethyst.js` voor de andere onderdelen.

## Opbouw

| Bestand | Inhoud |
| --- | --- |
| `theme.css` | Alle opmaak, ingedeeld in genummerde secties (achtergrond, header, kaarten, detailpagina, speler, login ...) |
| `colors/amethyst.css` | Alle kleuren, de aurora-gradient en het Jellyfin-palet |
| `lite.css` | Lite-modus: geen blur, geen animaties |
| `js/amethyst.js` | Script-loader en config (via JavaScript Injector) |
| `js/spotlight.js` | Spotlight-banner op de homepage |
| `js/badges.js` | Kwaliteitsbadges op kaarten |
| `js/navbar-search.js` | Echte zoekbalk in de navbar |
| `logos/` | Logo (de 320px-versie staat op de loginpagina) |

## Eigen kleurvariant

1. Kopieer `colors/amethyst.css` naar bijvoorbeeld `colors/rose.css`.
2. Pas `--am-accent-rgb`, `--am-aurora` en de `--jf-palette-*` waarden aan.
3. Wijzig de `@import` van `colors/amethyst.css` in `theme.css` naar je nieuwe bestand.
