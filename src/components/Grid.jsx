/**
 * Grid.jsx
 * Renders the full spreadsheet grid with header row/columns.
 * Delegates individual cell rendering to Cell.jsx.
 */

import React, { useRef, useEffect } from 'react';
import Cell from './Cell';
import { colLabel, cellId } from '../utils/formulaEngine';

function Grid({
  rows,
  cols,
  rawData,
  values,
  selected,
  onSelect,
  onCommit,
}) {
  const tableRef = useRef(null);

  // Navigate to a different cell, clamped within grid bounds
  function navigate(r, c) {
    const nr = Math.max(0, Math.min(rows - 1, r));
    const nc = Math.max(0, Math.min(cols - 1, c));
    onSelect(nr, nc);
    // Focus the target cell input
    const id = cellId(nr, nc);
    const inp = tableRef.current?.querySelector(`[aria-label="${id}"]`);
    if (inp) inp.focus();
  }

  // Focus selected cell when it changes externally (e.g. undo/redo, toolbar)
  useEffect(() => {
    const id = cellId(selected.r, selected.c);
    const inp = tableRef.current?.querySelector(`[aria-label="${id}"]`);
    if (inp && document.activeElement !== inp) inp.focus();
  }, [selected]);

  return (
    <div className="grid-wrapper" role="grid" aria-label="Spreadsheet grid">
      <table ref={tableRef} className="grid-table">
        <thead>
          <tr>
            {/* Corner cell */}
            <th className="header-corner" scope="col" />
            {/* Column headers A, B, C ... */}
            {Array.from({ length: cols }, (_, c) => (
              <th
                key={c}
                className={`col-header ${
                  selected.c === c ? 'col-header-active' : ''
                }`}
                scope="col"
              >
                {colLabel(c)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {/* Row header 1, 2, 3 ... */}
              <th
                className={`row-header ${
                  selected.r === r ? 'row-header-active' : ''
                }`}
                scope="row"
              >
                {r + 1}
              </th>

              {Array.from({ length: cols }, (_, c) => {
                const id = cellId(r, c);
                return (
                  <Cell
                    key={id}
                    row={r}
                    col={c}
                    cellIdStr={id}
                    rawValue={rawData[id] || ''}
                    displayValue={values[id] || ''}
                    isSelected={selected.r === r && selected.c === c}
                    onSelect={onSelect}
                    onCommit={onCommit}
                    onNavigate={navigate}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Grid;
