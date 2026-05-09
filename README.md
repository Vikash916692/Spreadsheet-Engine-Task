# Spreadsheet Engine with Formula Evaluation

> **Infollion Task 2 — Software Developer Intern**

A React-based spreadsheet grid that supports direct data entry and formula evaluation, similar to basic Excel functionality. Type values or formulas into any cell, reference other cells, and watch all dependents update automatically.

---

## Live Demo

> _(Deploy to Vercel or Netlify and paste your URL here)_

---

## Features

### Core
- **10×10 grid** (expandable to 15×15 or 20×20) with A–J column labels and 1–10 row numbers
- **Formula evaluation** — enter `=A1+B2`, `=A1*2`, `=(C1+D1)/3` and any arithmetic expression
- **Dependency graph** — tracks which cells depend on which; updates propagate automatically in topological order
- **Circular reference detection** — cells in a cycle display `#CIRCULAR` without freezing or infinite loops
- **Error handling** — invalid formulas show `#ERROR`, bad references show `#REF`

### Bonus
- **Undo / Redo** — full history with Ctrl+Z / Ctrl+Y (or toolbar buttons)
- **Dynamic grid size** — switch between 10×10, 15×15, and 20×20 grids
- **Optimised recalculation** — only recomputes affected cells via topological sort
- **Dark mode** — automatically adapts to system preference

---

## Project Structure

```
spreadsheet-engine/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Cell.jsx          # Individual editable cell
│   │   ├── FormulaBar.jsx    # Top formula/value bar
│   │   ├── Grid.jsx          # Full table renderer
│   │   └── Toolbar.jsx       # Undo/redo/clear/size controls
│   ├── utils/
│   │   ├── formulaEngine.js  # Parsing, dep graph, circular detection, eval
│   │   └── useSpreadsheet.js # React hook: state, history, actions
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

| Tool | Version |
|------|---------|
| Node.js | **v16 or higher** |
| npm | **v7 or higher** (comes with Node) |

Check your versions:
```bash
node --version
npm --version
```

Download Node.js from [nodejs.org](https://nodejs.org) if needed.

---

### Installation & Running Locally

**Step 1 — Clone the repository**
```bash
git clone https://github.com/<your-username>/spreadsheet-engine.git
```

**Step 2 — Navigate into the project folder**
```bash
cd spreadsheet-engine
```

**Step 3 — Install dependencies**
```bash
npm install
```
This downloads React and all required packages into `node_modules/`. It may take 1–2 minutes on first run.

**Step 4 — Start the development server**
```bash
npm start
```
The app opens automatically at **http://localhost:3000**

The development server supports hot reloading — changes to source files reflect instantly without a full page refresh.

---

### Build for Production

```bash
npm run build
```

Creates an optimised production bundle in the `build/` folder, ready for deployment.

---

## How to Use

### Entering values
- Click any cell and start typing to enter a number or text
- Press **Enter** to confirm and move down, **Tab** to confirm and move right
- Press **Escape** to cancel an edit
- Double-click a cell (or press **F2**) to enter edit mode on the existing value

### Entering formulas
- Start with `=` to enter a formula
- Reference cells like `A1`, `B4`, `J10`
- Supports: `+` `-` `*` `/` and parentheses `()`
- Examples:
  - `=A1+B2`
  - `=A1*2`
  - `=(C1+D1)/3`
  - `=B1+C2*D3`

### Keyboard shortcuts
| Key | Action |
|-----|--------|
| Arrow keys | Navigate between cells |
| Enter | Confirm edit, move down |
| Tab | Confirm edit, move right |
| F2 | Edit selected cell |
| Delete / Backspace | Clear selected cell (when not editing) |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Escape | Cancel current edit |

### Error values
| Value | Meaning |
|-------|---------|
| `#ERROR` | Formula could not be evaluated (e.g. `=A1+`) |
| `#CIRCULAR` | Cell is part of a circular dependency chain |
| `#REF` | Formula references a cell outside the grid |

---

## Example Walkthrough

1. Click **A1**, type `5`, press Enter
2. Click **B1**, type `=A1+3`, press Enter → shows **8**
3. Click **C1**, type `=B1*2`, press Enter → shows **16**
4. Click **A1**, change to `10`, press Enter
   - B1 automatically updates to **13**
   - C1 automatically updates to **26**
5. Click **A2**, type `=B2`, press Enter
6. Click **B2**, type `=A2`, press Enter
   - Both show **#CIRCULAR**

---

## Deployment

### Deploy to Vercel (recommended)

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** → import your `spreadsheet-engine` repo
4. Leave all settings as default — Vercel auto-detects Create React App
5. Click **Deploy**

Your app will be live at `https://spreadsheet-engine-<hash>.vercel.app`

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) → **"Add new site"** → **"Import an existing project"**
3. Connect GitHub and select your repo
4. Set:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
5. Click **Deploy site**

---

## Architecture Notes

### Formula Engine (`src/utils/formulaEngine.js`)

The core evaluation pipeline:

1. **`buildDepGraph`** — scans all cells with formulas and extracts cell references using regex. Builds a map of `cellId → [dependencies]`.

2. **`detectCircular`** — runs DFS from each cell through the dependency graph. If any node is revisited in the current DFS stack, a cycle exists.

3. **`topoSort`** — produces a safe evaluation order so every dependency is resolved before the cell that needs it.

4. **`evalFormula`** — substitutes cell references with their current values, then uses `Function()` with a strict allowlist regex to safely evaluate the arithmetic expression.

5. **`computeAll`** — orchestrates the above steps and returns a complete `{ cellId: displayValue }` map.

### State Management (`src/utils/useSpreadsheet.js`)

A custom React hook manages:
- `rawData` — the user-entered strings (`"5"`, `"=A1+3"`, etc.)
- `values` — computed via `useMemo(() => computeAll(...))`, recomputed only when `rawData` or grid size changes
- `history` — array of `rawData` snapshots for undo/redo

---

## License

MIT
