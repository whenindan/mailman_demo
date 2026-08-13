# Mailman Landing

Landing page for [Mailman](https://github.com/whenindan/Mailman), an open-source,
local-first email RAG tool. Built with Vite + React, implementing the
[Claude Design mockup](https://claude.ai/design/p/6a777f42-2e8a-4ce5-a410-1e3495aa7302?file=Mailman+Landing.dc.html).

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Structure

- `src/useDemo.js`: state/logic for the interactive chat demo, sync simulation, and pipeline carousel
- `src/components/`: page sections (Nav, Hero, Terminal, Pipeline, Features, Cli, Footer)
- `src/App.css`: theme tokens (light/dark) and all component styling
