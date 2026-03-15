// toolbar.js — Enhanced toolbar with node palette + action buttons
import { useRef } from 'react';
import { DraggableNode } from './draggableNode';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  undo: state.undo,
  redo: state.redo,
  past: state.past,
  future: state.future,
  savePipeline: state.savePipeline,
  exportPipeline: state.exportPipeline,
  importPipeline: state.importPipeline,
  clearPipeline: state.clearPipeline,
});

const ActionBtn = ({ icon, label, onClick, disabled = false, danger = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      padding: '5px 10px', borderRadius: '6px',
      background: disabled ? 'rgba(255,255,255,0.02)' : danger ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${disabled ? 'rgba(255,255,255,0.04)' : danger ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.08)'}`,
      color: disabled ? 'rgba(255,255,255,0.15)' : danger ? '#f87171' : 'rgba(255,255,255,0.6)',
      fontSize: '11px', fontWeight: '500', cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      transition: 'all 0.15s',
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = danger ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.1)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = disabled ? 'rgba(255,255,255,0.02)' : danger ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.05)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <span style={{ fontSize: '12px' }}>{icon}</span>
    <span>{label}</span>
  </button>
);

export const PipelineToolbar = () => {
  const fileInputRef = useRef(null);
  const { undo, redo, past, future, savePipeline, exportPipeline, importPipeline, clearPipeline } =
    useStore(selector, shallow);

  const nodes = [
    { type: 'customInput', label: 'Input', icon: '→', color: '#22d3ee' },
    { type: 'llm', label: 'LLM', icon: '✦', color: '#a78bfa' },
    { type: 'customOutput', label: 'Output', icon: '←', color: '#f472b6' },
    { type: 'text', label: 'Text', icon: 'T', color: '#fbbf24' },
    { type: 'filter', label: 'Filter', icon: '⟁', color: '#34d399' },
    { type: 'transform', label: 'Transform', icon: '⟳', color: '#fb923c' },
    { type: 'api', label: 'API', icon: '⇌', color: '#60a5fa' },
    { type: 'merge', label: 'Merge', icon: '⊕', color: '#c084fc' },
    { type: 'note', label: 'Note', icon: '✎', color: '#94a3b8' },
  ];

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      importPipeline(ev.target.result);
    };
    reader.readAsText(file);
    e.target.value = ''; // reset for re-import
  };

  return (
    <div
      style={{
        padding: '8px 16px',
        background: '#131929',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* Node palette */}
      <span style={{
        fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
        whiteSpace: 'nowrap', fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}>
        Nodes
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {nodes.map((n) => (
          <DraggableNode key={n.type} type={n.type} label={n.label} icon={n.icon} color={n.color} />
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <ActionBtn icon="↶" label="Undo" onClick={undo} disabled={past.length === 0} />
        <ActionBtn icon="↷" label="Redo" onClick={redo} disabled={future.length === 0} />
        <ActionBtn icon="💾" label="Save" onClick={savePipeline} />
        <ActionBtn icon="↓" label="Export" onClick={exportPipeline} />
        <ActionBtn icon="↑" label="Import" onClick={handleImport} />
        <ActionBtn icon="✗" label="Clear" onClick={clearPipeline} danger />
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={onFileSelected}
      />
    </div>
  );
};
