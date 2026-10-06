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

## Opbouw

| Bestand | Inhoud |
| --- | --- |
| `theme.css` | Alle opmaak, ingedeeld in genummerde secties (achtergrond, header, kaarten, detailpagina, speler, login ...) |
| `colors/amethyst.css` | Alle kleuren, de aurora-gradient en het Jellyfin-palet |

## Eigen kleurvariant

1. Kopieer `colors/amethyst.css` naar bijvoorbeeld `colors/rose.css`.
2. Pas `--am-accent-rgb`, `--am-aurora` en de `--jf-palette-*` waarden aan.
3. Wijzig de tweede `@import` in `theme.css` naar je nieuwe bestand.
