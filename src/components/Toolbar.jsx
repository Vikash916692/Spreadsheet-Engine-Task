/**
 * Toolbar.jsx
 * Top control bar: undo, redo, clear cell, clear all, grid size selector.
 */

import React from 'react';

const SIZE_OPTIONS = [
  { label: '10 × 10', rows: 10, cols: 10 },
  { label: '15 × 15', rows: 15, cols: 15 },
  { label: '20 × 20', rows: 20, cols: 20 },
];

function Toolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearCell,
  onClearAll,
  onResize,
  rows,
}) {
  function handleSizeChange(e) {
    const [r, c] = e.target.value.split('x').map(Number);
    onResize(r, c);
  }

  const currentSize = `${rows}x${rows}`;

  return (
    <div className="toolbar">
      <span className="toolbar-title">Spreadsheet Engine</span>

      <div className="toolbar-group">
        <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          ↩ Undo
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          ↪ Redo
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={onClearCell} title="Clear selected cell">
          ✕ Clear Cell
        </button>
        <button onClick={onClearAll} title="Clear all cells">
          Clear All
        </button>
      </div>

      <div className="toolbar-group">
        <label className="size-label">Grid:</label>
        <select
          value={currentSize}
          onChange={handleSizeChange}
          className="size-select"
          aria-label="Grid size"
        >
          {SIZE_OPTIONS.map((opt) => (
            <option key={opt.label} value={`${opt.rows}x${opt.cols}`}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Toolbar;
