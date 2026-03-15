// apiNode.js - makes HTTP requests
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField, inputStyle, selectStyle } from './BaseNode';

export const ApiNode = ({ id, data }) => {
  const [method, setMethod] = useState(data?.method || 'GET');
  const [url, setUrl] = useState(data?.url || '');

  const handles = [
    { id: `${id}-body`, type: 'target', position: Position.Left, style: { top: '40%' } },
    { id: `${id}-headers`, type: 'target', position: Position.Left, style: { top: '70%' } },
    { id: `${id}-response`, type: 'source', position: Position.Right, style: { top: '40%' } },
    { id: `${id}-error`, type: 'source', position: Position.Right, style: { top: '70%' } },
  ];

  const methodColors = { GET: '#34d399', POST: '#60a5fa', PUT: '#fbbf24', DELETE: '#f87171' };

  return (
    <BaseNode title="API Request" icon="⇌" accentColor="#60a5fa" handles={handles} minWidth={240}>
      <NodeField label="Method">
        <select style={{ ...selectStyle, color: methodColors[method] || '#e2e8f0' }} value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </NodeField>
      <NodeField label="URL">
        <input style={inputStyle} type="text" placeholder="https://api.example.com/endpoint" value={url} onChange={(e) => setUrl(e.target.value)} />
      </NodeField>
    </BaseNode>
  );
};
