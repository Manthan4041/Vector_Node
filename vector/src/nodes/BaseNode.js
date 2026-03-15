// BaseNode.js
// Core abstraction for all pipeline nodes.
// Pass: title, icon, handles[], accentColor, minWidth, minHeight, children

import { Handle } from 'reactflow';

export const BaseNode = ({
  title,
  icon,
  children,
  handles = [],
  accentColor = '#6C63FF',
  minWidth = 220,
  minHeight = 90,
}) => {
  return (
    <div
      style={{
        minWidth,
        minHeight,
        background: 'linear-gradient(145deg, #1e2433, #252d40)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: `3px solid ${accentColor}`,
        borderRadius: '10px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        overflow: 'visible',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 12px 6px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {icon && <span style={{ fontSize: '13px' }}>{icon}</span>}
        <span
          style={{
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: accentColor,
          }}
        >
          {title}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px' }}>{children}</div>

      {/* Handles */}
      {handles.map((h) => (
        <Handle
          key={h.id}
          type={h.type}
          position={h.position}
          id={h.id}
          style={{
            background: accentColor,
            border: '2px solid #1a2035',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            ...h.style,
          }}
        />
      ))}
    </div>
  );
};

// ─── Shared field primitives ─────────────────────────────────────────────────

export const NodeField = ({ label, children }) => (
  <div style={{ marginBottom: '8px' }}>
    {label && (
      <label
        style={{
          display: 'block',
          fontSize: '10px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        {label}
      </label>
    )}
    {children}
  </div>
);

export const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '12px',
  padding: '5px 8px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  transition: 'border-color 0.15s',
};

export const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
  paddingRight: '24px',
};
