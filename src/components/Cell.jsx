/**
 * Cell.jsx
 * Individual spreadsheet cell. Supports read mode (shows computed value)
 * and edit mode (shows raw formula/value). Handles keyboard navigation.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

function getDisplayClass(raw, displayVal) {
  if (
    displayVal === '#ERROR' ||
    displayVal === '#CIRCULAR' ||
    displayVal === '#REF'
  ) {
    return 'cell-error';
  }
  if (raw && raw.startsWith('=')) return 'cell-formula';
  return '';
}

function Cell({
  row,
  col,
  cellIdStr,
  rawValue,
  displayValue,
  isSelected,
  onSelect,
  onCommit,
  onNavigate,
}) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  const inputRef = useRef(null);

  // When this cell becomes selected externally and edit is triggered
  useEffect(() => {
    if (!isSelected && editing) {
      handleCommit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  const handleCommit = useCallback(() => {
    if (!editing) return;
    setEditing(false);
    onCommit(row, col, editVal.trim());
  }, [editing, editVal, onCommit, row, col]);

  const startEdit = useCallback(
    (initialChar) => {
      const startVal =
        initialChar !== undefined ? initialChar : rawValue || '';
      setEditVal(startVal);
      setEditing(true);
    },
    [rawValue]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!editing) {
        switch (e.key) {
          case 'Enter':
          case 'F2':
            e.preventDefault();
            startEdit();
            break;
          case 'Delete':
          case 'Backspace':
            onCommit(row, col, '');
            break;
          case 'ArrowUp':
            e.preventDefault();
            onNavigate(row - 1, col);
            break;
          case 'ArrowDown':
            e.preventDefault();
            onNavigate(row + 1, col);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            onNavigate(row, col - 1);
            break;
          case 'ArrowRight':
            e.preventDefault();
            onNavigate(row, col + 1);
            break;
          case 'Tab':
            e.preventDefault();
            onNavigate(row, col + 1);
            break;
          default:
            // Start editing on printable character
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
              startEdit(e.key);
            }
            break;
        }
      } else {
        switch (e.key) {
          case 'Escape':
            setEditing(false);
            setEditVal(rawValue || '');
            break;
          case 'Enter':
            e.preventDefault();
            handleCommit();
            onNavigate(row + 1, col);
            break;
          case 'Tab':
            e.preventDefault();
            handleCommit();
            onNavigate(row, col + 1);
            break;
          default:
            break;
        }
      }
    },
    [editing, startEdit, handleCommit, onCommit, onNavigate, rawValue, row, col]
  );

  const displayClass = getDisplayClass(rawValue, displayValue);
  const shownValue = editing ? editVal : displayValue || '';

  return (
    <td
      className={`cell ${isSelected ? 'cell-selected' : ''}`}
      onMouseDown={() => {
        if (!isSelected) onSelect(row, col);
      }}
    >
      <input
        ref={inputRef}
        className={`cell-input ${displayClass}`}
        value={shownValue}
        readOnly={!editing}
        tabIndex={0}
        aria-label={cellIdStr}
        onChange={(e) => setEditVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (!isSelected) onSelect(row, col);
        }}
        onDoubleClick={() => startEdit()}
        onBlur={() => {
          if (editing) handleCommit();
        }}
        title={
          displayValue === '#CIRCULAR'
            ? 'Circular reference detected'
            : displayValue === '#ERROR'
            ? 'Invalid formula'
            : displayValue === '#REF'
            ? 'Invalid cell reference'
            : ''
        }
      />
    </td>
  );
}

export default React.memo(Cell);
