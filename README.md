# Spreadsheet Engine with Formula Evaluation

> **Infollion Task 2 — Software Developer Intern**

A React-based spreadsheet grid that supports direct data entry and formula evaluation, similar to basic Excel functionality. Type values or formulas into any cell, reference other cells, and watch all dependents update automatically.

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

Make sure you have the following installed before proceeding:

| Tool | Version |
|------|---------|
| Node.js | **v16 or higher** |
| npm | **v7 or higher** (bundled with Node) |
| Git | any recent version |

Verify your versions:
```bash
node --version
npm --version
git --version
```

Download Node.js from [nodejs.org](https://nodejs.org) if needed (npm comes included).

---

### Step 1 — Upload to GitHub

If you received this project as a zip file, follow these steps to publish it on GitHub.

**1a. Extract the zip**

Unzip `spreadsheet-engine.zip`. You will get a folder named `spreadsheet-engine/`.

**1b. Create a new GitHub repository**

1. Go to [github.com/new](https://github.com/new)
2. Set the repository name to `spreadsheet-engine`
3. Choose **Public**
4. Leave "Initialize with README" **unchecked**
5. Click **Create repository**

**1c. Open a terminal inside the project folder**

```bash
cd path/to/spreadsheet-engine
```

**1d. Initialise Git and push**

```bash
git init
git add .
git commit -m "Initial commit: Spreadsheet Engine with Formula Evaluation"
git branch -M main
git remote add origin https://github.com/<your-username>/spreadsheet-engine.git
git push -u origin main
```

Replace `<your-username>` with your actual GitHub username. After this your code is live on GitHub.

---

### Step 2 — Clone and Run Locally

Anyone (including you on another machine) can run the project with these four commands:

**2a. Clone the repository**
```bash
git clone https://github.com/<your-username>/spreadsheet-engine.git
```

**2b. Enter the project folder**
```bash
cd spreadsheet-engine
```

**2c. Install dependencies**
```bash
npm install
```
This installs React and all required packages into `node_modules/`. Takes 1–2 minutes on first run.

**2d. Start the development server**
```bash
npm start
```
The app opens automatically at **http://localhost:3000**

The dev server supports hot reloading — edits to source files appear instantly without a manual refresh.

---

### Step 3 — Build for Production

To generate an optimised production-ready bundle:

```bash
npm run build
```

Output goes into the `build/` folder. You can serve it with any static file server.

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
