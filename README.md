# Amethyst-Theme

Een donker, glassy en transparant paars thema voor Jellyfin 12.x, met Inter als lettertype.

## Installatie

Dashboard > General > Custom CSS Code:

```css
@import url("https://cdn.jsdelivr.net/gh/JulienLoon/Amethyst-Theme@main/theme.css");
```

Opslaan en de pagina verversen (Ctrl/Cmd + Shift + R).

## Opbouw

- `theme.css`: alle opmaak (header, menu, kaarten, knoppen, dialogen, login, speler).
- `colors/violet.css`: alle kleuren en de achtergrond-gradient als CSS-variabelen. Kopieer dit bestand voor een andere kleurvariant en pas de `@import` in `theme.css` aan.

## Aanpassen

Wijzig in `colors/violet.css`:
- `--v-accent-r/g/b`: de hoofdkleur.
- `--v-bg-gradient`: de achtergrond-gradient.
- `--v-glass*`: hoe transparant de panelen zijn.
