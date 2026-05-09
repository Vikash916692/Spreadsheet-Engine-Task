/**
 * FormulaBar.jsx
 * Shows the selected cell reference and its raw formula/value.
 * Allows editing from the formula bar with Enter to commit.
 */

import React, { useState, useEffect, useRef } from 'react';

function FormulaBar({ cellRef, rawValue, onCommit }) {
  const [val, setVal] = useState(rawValue || '');
  const inputRef = useRef(null);

  // Sync when selected cell changes
  useEffect(() => {
    setVal(rawValue || '');
  }, [rawValue, cellRef]);

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommit(val.trim());
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setVal(rawValue || '');
      inputRef.current?.blur();
    }
  }

  return (
    <div className="formula-bar">
      <span className="formula-cell-ref">{cellRef}</span>
      <span className="formula-fx">fx</span>
      <input
        ref={inputRef}
        className="formula-input"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setVal(rawValue || '')}
        placeholder="Enter value or =formula"
        spellCheck={false}
        aria-label="Formula bar"
      />
    </div>
  );
}

export default FormulaBar;
