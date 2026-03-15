// noteNode.js - a free-form annotation/comment node (no handles)
import { useState } from 'react';
import { BaseNode } from './BaseNode';

export const NoteNode = ({ id, data }) => {
  const [text, setText] = useState(data?.text || 'Add a note...');

  return (
    <BaseNode title="Note" icon="✎" accentColor="#94a3b8" handles={[]} minWidth={200}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: '100%',
          minHeight: '70px',
          resize: 'vertical',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '6px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '12px',
          padding: '6px 8px',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          lineHeight: '1.6',
          fontStyle: 'italic',
        }}
      />
    </BaseNode>
  );
};
