# Amethyst-Theme

Een donker, glassy en transparant paars thema voor **Jellyfin 12.x**, met Inter als lettertype.

- Langzaam bewegende aurora-achtergrond in violet, orchidee en indigo
- Zwevende glazen header en glazen zijmenu
- Kaarten met lift en paarse gloed bij hover
- Detailpagina's met fanart en een scrim, zodat de tekst ook bij felle afbeeldingen leesbaar blijft
- Alle standaard-blauwe accenten van Jellyfin worden paars, via het `--jf-palette-*` palet van Jellyfin 12
- Werkt op desktop en mobiel, en houdt rekening met `prefers-reduced-motion`

## Installatie

Dashboard > General > **Custom CSS Code**:

```css
@import url("https://cdn.jsdelivr.net/gh/JulienLoon/Amethyst-Theme@main/theme.css");
```

Opslaan en de pagina hard verversen (Ctrl/Cmd + Shift + R).

> jsDelivr cachet `@main` een tijd. Wil je een update meteen zien, vervang dan `@main` door een commit-hash, of ververs de cache via
> `https://purge.jsdelivr.net/gh/JulienLoon/Amethyst-Theme@main/theme.css`.

## Optioneel: echte zoekbalk in de navbar

Met alleen CSS opent de zoekbalk in de navbar de zoekpagina. Met JavaScript wordt het een echt zoekveld: je typt in de navbar en de resultaten verschijnen live. `/` of `Ctrl/Cmd + K` zet de focus in het veld en `Esc` maakt het leeg.

1. Installeer de [JavaScript Injector](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector)-plugin. Voeg daarvoor in Dashboard > Plugins > Catalog > ⚙️ deze repository toe:
   `https://raw.githubusercontent.com/n00bcodr/jellyfin-plugins/main/12/manifest.json`. Installeer daarna de plugin en herstart de server.
2. Ga naar Dashboard > Plugins > JavaScript Injector > **Add Script**, plak dit en vink **Enabled** aan:

```js
(function () {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/gh/JulienLoon/Amethyst-Theme@main/js/navbar-search.js';
    document.head.appendChild(s);
})();
```

Op mobiel blijft het een zoekicoon.

## Opbouw

| Bestand | Inhoud |
| --- | --- |
| `theme.css` | Alle opmaak, ingedeeld in genummerde secties (achtergrond, header, kaarten, detailpagina, speler, login ...) |
| `colors/amethyst.css` | Alle kleuren, de aurora-gradient en het Jellyfin-palet |
| `js/navbar-search.js` | Optioneel: echte zoekbalk in de navbar (via JavaScript Injector) |

## Eigen kleurvariant

1. Kopieer `colors/amethyst.css` naar bijvoorbeeld `colors/rose.css`.
2. Pas `--am-accent-rgb`, `--am-aurora` en de `--jf-palette-*` waarden aan.
3. Wijzig de tweede `@import` in `theme.css` naar je nieuwe bestand.
