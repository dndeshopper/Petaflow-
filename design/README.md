# PetalFlow Design Source

**Sorgente ufficiale dell'interfaccia:** `PetalFlow-Dashboard-standalone.html`

## File

| File | Descrizione |
|------|-------------|
| `PetalFlow-Dashboard-standalone.html` | File originale caricato (bundle) |
| `dashboard.html` | HTML estratto e processato |
| `sections/` | Sidebar, header, right-panel suddivisi |
| `styles.css` | Stili estratti dal design |
| `manifest.json` | Metadati sync |

## Nel codice

L'HTML viene incorporato in:

- `lib/design/html-sections.ts` — stringhe HTML generate (auto)
- `components/design/design-app-shell.tsx` — layout app che usa l'HTML
- `public/design/preview.html` — anteprima statica

## Aggiornare il design

Dopo aver modificato `PetalFlow-Dashboard-standalone.html`:

```bash
npm run sync-design
```

Questo rigenera `html-sections.ts` e le sezioni in `design/sections/`.
