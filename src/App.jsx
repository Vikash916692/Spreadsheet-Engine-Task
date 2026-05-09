/**
 * App.jsx
 * Root component. Wires up the spreadsheet hook with Toolbar,
 * FormulaBar, Grid, and a keyboard shortcut handler for Ctrl+Z / Ctrl+Y.
 */

import React, { useEffect, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import Grid from './components/Grid';
import { useSpreadsheet } from './utils/useSpreadsheet';
import { cellId } from './utils/formulaEngine';
import './App.css';

function App() {
  const {
    rows,
    cols,
    rawData,
    values,
    selected,
    setSelected,
    setCellValue,
    clearCell,
    clearAll,
    undo,
    redo,
    canUndo,
    canRedo,
    resizeGrid,
  } = useSpreadsheet();

  const selectedId = cellId(selected.r, selected.c);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Z')) {
        e.preventDefault();
        redo();
      }
    },
    [undo, redo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /** Called when a cell commits an edit */
  function handleCommit(r, c, value) {
    setCellValue(r, c, value);
  }

  /** Called from the formula bar — applies to selected cell */
  function handleFormulaCommit(value) {
    setCellValue(selected.r, selected.c, value);
  }

  return (
    <div className="app">
      <header className="app-header">
        <Toolbar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onClearCell={() => clearCell(selected.r, selected.c)}
          onClearAll={clearAll}
          onResize={resizeGrid}
          rows={rows}
        />
        <FormulaBar
          cellRef={selectedId}
          rawValue={rawData[selectedId] || ''}
          onCommit={handleFormulaCommit}
        />
      </header>

      <main className="app-main">
        <Grid
          rows={rows}
          cols={cols}
          rawData={rawData}
          values={values}
          selected={selected}
          onSelect={(r, c) => setSelected({ r, c })}
          onCommit={handleCommit}
        />
      </main>

      <footer className="app-footer">
        <span className="legend-item formula-color">■ Formula</span>
        <span className="legend-item error-color">■ Error / Circular</span>
        <span className="legend-item">
          Double-click or press F2 to edit · Enter to confirm · Esc to cancel ·
          Arrow keys to navigate · Ctrl+Z / Ctrl+Y to undo/redo
        </span>
      </footer>
    </div>
  );
}

export default App;
