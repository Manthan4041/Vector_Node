// textNode.js - Part 3: auto-resize + {{variable}} handle detection
import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode, NodeField } from './BaseNode';

const VAR_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

const extractVariables = (text) => {
  const vars = [];
  const seen = new Set();
  let match;
  VAR_REGEX.lastIndex = 0;
  while ((match = VAR_REGEX.exec(text)) !== null) {
    if (!seen.has(match[1])) {
      seen.add(match[1]);
      vars.push(match[1]);
    }
  }
  return vars;
};

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const [variables, setVariables] = useState(() => extractVariables(data?.text || '{{input}}'));
  const textareaRef = useRef(null);
  const mirrorRef = useRef(null);

  // Auto-resize: sync textarea size to a hidden mirror div
  useEffect(() => {
    if (mirrorRef.current && textareaRef.current) {
      const mirror = mirrorRef.current;
      mirror.textContent = currText + '\n';
      const newHeight = Math.max(60, mirror.scrollHeight);
      textareaRef.current.style.height = newHeight + 'px';
    }
  }, [currText]);

  const handleChange = (e) => {
    const val = e.target.value;
    setCurrText(val);
    setVariables(extractVariables(val));
  };

  // Calculate dynamic width based on longest line
  const lines = currText.split('\n');
  const longestLine = Math.max(...lines.map((l) => l.length), 10);
  const dynWidth = Math.min(Math.max(220, longestLine * 7.5 + 40), 520);

  const accentColor = '#fbbf24';

  return (
    <div
      style={{
        minWidth: dynWidth,
        background: 'linear-gradient(145deg, #1e2433, #252d40)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: `3px solid ${accentColor}`,
        borderRadius: '10px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'visible',
        transition: 'min-width 0.15s ease',
      }}
    >
      {/* Header */}
      <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '13px' }}>T</span>
        <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: accentColor }}>
          Text
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px', paddingLeft: variables.length > 0 ? '24px' : '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Text
        </div>
        <div style={{ position: 'relative' }}>
          {/* Hidden mirror for height measurement */}
          <div
            ref={mirrorRef}
            style={{
              position: 'absolute',
              visibility: 'hidden',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '12px',
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
              padding: '5px 8px',
              width: '100%',
              boxSizing: 'border-box',
              minHeight: '60px',
              top: 0,
              left: 0,
              pointerEvents: 'none',
            }}
          />
          <textarea
            ref={textareaRef}
            value={currText}
            onChange={handleChange}
            style={{
              width: '100%',
              minHeight: '60px',
              resize: 'none',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#e2e8f0',
              fontSize: '12px',
              padding: '5px 8px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
              lineHeight: '1.5',
            }}
          />
        </div>
      </div>

      {/* Variable input handles (left) */}
      {variables.map((varName, i) => {
        const topPct = variables.length === 1
          ? 50
          : 20 + (i / (variables.length - 1)) * 60;
        return (
          <Handle
            key={varName}
            type="target"
            position={Position.Left}
            id={`${id}-${varName}`}
            style={{
              top: `${topPct}%`,
              background: accentColor,
              border: '2px solid #1a2035',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '9px',
                color: accentColor,
                whiteSpace: 'nowrap',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: '600',
                pointerEvents: 'none',
              }}
            >
              {varName}
            </span>
          </Handle>
        );
      })}

      {/* Output handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        style={{
          background: accentColor,
          border: '2px solid #1a2035',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};
