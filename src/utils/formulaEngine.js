/**
 * formulaEngine.js
 * Core logic for formula parsing, dependency tracking,
 * circular reference detection, and cell evaluation.
 */

const COL_LABELS = 'ABCDEFGHIJKLMNOPQRST';

/** Convert column index to letter label */
export function colLabel(c) {
  return COL_LABELS[c];
}

/** Get cell ID string from row/col indices, e.g. (0,0) => "A1" */
export function cellId(r, c) {
  return colLabel(c) + (r + 1);
}

/** Parse a cell ID string like "B3" into {r, c} indices */
export function getCellRef(id) {
  const m = id.match(/^([A-T])(\d+)$/);
  if (!m) return null;
  const c = COL_LABELS.indexOf(m[1]);
  const r = parseInt(m[2]) - 1;
  return { r, c };
}

/** Extract all cell references from a formula expression */
export function parseCellRefs(expr) {
  const refs = [];
  const re = /\b([A-T]\d+)\b/g;
  let m;
  while ((m = re.exec(expr)) !== null) refs.push(m[1]);
  return refs;
}

/**
 * Build a dependency graph: maps each cell ID to the list of
 * cell IDs it depends on (i.e., references in its formula).
 */
export function buildDepGraph(rawData, rows, cols) {
  const graph = {};
  for (const id in rawData) {
    const v = rawData[id];
    if (v && v.startsWith('=')) {
      graph[id] = parseCellRefs(v.slice(1)).filter((ref) => {
        const r = getCellRef(ref);
        return r && r.r < rows && r.c < cols;
      });
    } else {
      graph[id] = [];
    }
  }
  return graph;
}

/**
 * Topological sort using DFS.
 * Returns ordered list of cell IDs for safe evaluation.
 * Cycles are not resolved here — use detectCircular first.
 */
export function topoSort(cells, getDeps) {
  const visited = {};
  const order = [];

  function dfs(id, stack) {
    if (stack.includes(id)) return false; // cycle
    if (visited[id]) return true;
    stack.push(id);
    for (const dep of getDeps(id)) {
      if (!dfs(dep, [...stack])) return false;
    }
    visited[id] = true;
    order.push(id);
    return true;
  }

  for (const id of cells) {
    if (!visited[id]) dfs(id, []);
  }
  return order;
}

/**
 * Detect if a given cell is part of a circular dependency.
 * Uses DFS from the target cell through the dependency graph.
 */
export function detectCircular(id, graph) {
  const visited = new Set();

  function dfs(cur, stack) {
    if (stack.has(cur)) return true;
    if (visited.has(cur)) return false;
    visited.add(cur);
    stack.add(cur);
    for (const dep of graph[cur] || []) {
      if (dfs(dep, stack)) return true;
    }
    stack.delete(cur);
    return false;
  }

  return dfs(id, new Set());
}

/** Safe arithmetic evaluation of an expression string */
function safeEval(expr) {
  // Only allow numbers, operators, parentheses, spaces, dots
  if (!/^[\d\s+\-*/().e]+$/i.test(expr)) return '#ERROR';
  try {
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + expr + ')')();
    if (typeof result !== 'number' || !isFinite(result)) return '#ERROR';
    // Round to avoid floating-point noise
    return String(Math.round(result * 1e10) / 1e10);
  } catch {
    return '#ERROR';
  }
}

/**
 * Evaluate a single formula expression given the current cell values.
 * Substitutes cell references with their computed values.
 */
export function evalFormula(expr, values, rows, cols) {
  const refs = parseCellRefs(expr);
  let subst = expr;

  for (const ref of refs) {
    const rv = getCellRef(ref);
    if (!rv || rv.r >= rows || rv.c >= cols) return '#REF';

    const val = values[ref] ?? '';
    // Propagate upstream errors
    if (val === '#CIRCULAR' || val === '#ERROR' || val === '#REF') return val;

    const num = parseFloat(val);
    const replacement = isNaN(num) ? '0' : String(num);
    subst = subst.replace(new RegExp('\\b' + ref + '\\b', 'g'), replacement);
  }

  return safeEval(subst);
}

/**
 * Compute the displayed value of every cell.
 * Returns a map of cellId => displayValue.
 */
export function computeAll(rawData, rows, cols) {
  const graph = buildDepGraph(rawData, rows, cols);
  const values = {};
  const circularSet = new Set();

  // First pass: identify all circular cells
  for (const id in rawData) {
    if (detectCircular(id, graph)) circularSet.add(id);
  }

  // Collect all non-empty cell IDs in grid order
  const allIds = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = cellId(r, c);
      if (rawData[id] !== undefined) allIds.push(id);
    }
  }

  // Topological evaluation order
  const order = topoSort(allIds, (id) => graph[id] || []);

  for (const id of order) {
    if (circularSet.has(id)) {
      values[id] = '#CIRCULAR';
      continue;
    }
    const raw = rawData[id];
    if (!raw) {
      values[id] = '';
      continue;
    }
    if (raw.startsWith('=')) {
      values[id] = evalFormula(raw.slice(1), values, rows, cols);
    } else {
      values[id] = raw;
    }
  }

  return values;
}
