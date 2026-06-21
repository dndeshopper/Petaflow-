# PetalFlow — Logo animato · Pacchetto di integrazione

In questa cartella c'è **un solo file** da usare:

- `PetalFlowLogo.jsx` — il logo animato, **autonomo**: petalo + loghi (YouTube / X / Meta ricolorati in #8C77EE) sono già incorporati nel file come immagini base64. **Nessuna dipendenza esterna, nessuna immagine da caricare.**

---

## ⬇️ Come procedere (3 passi)

1. Copia `PetalFlowLogo.jsx` dentro il tuo progetto, es. `src/components/PetalFlowLogo.jsx`
2. Apri **Cursor** e incolla il prompt qui sotto nella chat (Cmd/Ctrl + L).
3. Fai commit & push → Vercel ridistribuisce in automatico.

---

## 📋 PROMPT DA INCOLLARE SU CURSOR

```
Ho aggiunto il file `src/components/PetalFlowLogo.jsx`: è un logo animato React
autonomo (nessuna dipendenza, immagini già incorporate in base64).

Voglio che questo logo animato compaia OGNI VOLTA che la pagina si carica e
all'accesso a PetalFlow. Procedi così:

1. Importa il componente dove serve:
   import PetalFlowLogo from "@/components/PetalFlowLogo";
   (adatta il path "@/components/..." al mio alias; se non ho alias usa il path
    relativo corretto, es. "../components/PetalFlowLogo")

2. Inseriscilo nei punti chiave del sito:
   - Nell'header / navbar in alto a sinistra:  <PetalFlowLogo size={48} />
   - Nella pagina/schermata di LOGIN o di accesso a PetalFlow, centrato sopra
     il form:  <PetalFlowLogo size={140} showWordmark />
   - (Opzionale) come splash all'avvio della home/hero.

3. L'animazione deve ripartire a ogni caricamento di pagina: il componente è
   già animato in CSS puro e riparte da solo a ogni mount, quindi NON serve
   logica extra. Assicurati solo che il componente sia montato a ogni load
   (non memoizzato in modo da non rimontare).

4. Se il progetto è Next.js App Router e lo importi in un Server Component,
   aggiungi "use client" in cima a PetalFlowLogo.jsx (in fondo a queste note
   ti spiego le props).

Props disponibili:
  - size        (number, px)   default 140 — dimensione del marchio
  - feedSpeed   (number, sec)  default 6   — velocità di scorrimento dei loghi
  - showWordmark(boolean)      default false — mostra il testo "PetalFlow" sotto
  - className / style          per posizionamento custom

Esempi:
  <PetalFlowLogo size={48} />                       // header
  <PetalFlowLogo size={140} showWordmark />         // login / hero
  <PetalFlowLogo size={64} feedSpeed={4} />         // più veloce

Mostrami i file che hai modificato e dove hai inserito il logo.
```

---

## ⚙️ Note tecniche

- **Performance**: animazioni in CSS puro su `transform` → GPU-accelerated, nessun re-render durante il loop.
- **Font del wordmark**: usa "Manrope" se disponibile, altrimenti il system font (fallback già impostato). Per averlo identico, aggiungi nel tuo `index.html` / layout:
  `<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&display=swap" rel="stylesheet">`
- **Next.js (App Router)**: se lo importi in un Server Component, metti `"use client"` come prima riga di `PetalFlowLogo.jsx`. In Pages Router o Vite/CRA non serve.
- **Accessibilità**: rispetta `prefers-reduced-motion` (si ferma per chi ha ridotto le animazioni).
- **Proporzioni**: il marchio è disegnato a 420px e scalato in blocco → le proporzioni restano identiche a qualunque `size`.
