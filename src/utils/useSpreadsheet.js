/**
 * useSpreadsheet.js
 * Custom React hook that manages spreadsheet state:
 * raw cell data, computed values, history (undo/redo),
 * selected cell, and grid size.
 */

import { useState, useCallback, useMemo } from 'react';
import { computeAll, cellId } from '../utils/formulaEngine';

const DEFAULT_ROWS = 10;
const DEFAULT_COLS = 10;

export function useSpreadsheet() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [rawData, setRawData] = useState({});
  const [selected, setSelected] = useState({ r: 0, c: 0 });

  // Undo/redo history stored as array of rawData snapshots
  const [history, setHistory] = useState([{}]);
  const [historyIdx, setHistoryIdx] = useState(0);

  /** Computed display values derived from rawData */
  const values = useMemo(
    () => computeAll(rawData, rows, cols),
    [rawData, rows, cols]
  );

  /** Commit a new rawData state and push to history */
  const commitData = useCallback(
    (newData) => {
      setRawData(newData);
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIdx + 1);
        return [...trimmed, { ...newData }];
      });
      setHistoryIdx((idx) => idx + 1);
    },
    [historyIdx]
  );

  /** Update a single cell's raw value */
  const setCellValue = useCallback(
    (r, c, value) => {
      const id = cellId(r, c);
      const newData = { ...rawData };
      if (value === '' || value === undefined) {
        delete newData[id];
      } else {
        newData[id] = value;
      }
      commitData(newData);
    },
    [rawData, commitData]
  );

  /** Clear a single cell */
  const clearCell = useCallback(
    (r, c) => setCellValue(r, c, ''),
    [setCellValue]
  );

  /** Clear the entire grid */
  const clearAll = useCallback(() => {
    commitData({});
  }, [commitData]);

  /** Undo */
  const undo = useCallback(() => {
    if (historyIdx <= 0) return;
    const newIdx = historyIdx - 1;
    setHistoryIdx(newIdx);
    setRawData({ ...history[newIdx] });
  }, [history, historyIdx]);

  /** Redo */
  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    const newIdx = historyIdx + 1;
    setHistoryIdx(newIdx);
    setRawData({ ...history[newIdx] });
  }, [history, historyIdx]);

  /** Change grid dimensions — resets all data */
  const resizeGrid = useCallback((newRows, newCols) => {
    setRows(newRows);
    setCols(newCols);
    setRawData({});
    setHistory([{}]);
    setHistoryIdx(0);
    setSelected({ r: 0, c: 0 });
  }, []);

  return {
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
    canUndo: historyIdx > 0,
    canRedo: historyIdx < history.length - 1,
    resizeGrid,
  };
}
