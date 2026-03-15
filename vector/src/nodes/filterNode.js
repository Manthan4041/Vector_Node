// filterNode.js - filters data based on a condition
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField, inputStyle, selectStyle } from './BaseNode';

export const FilterNode = ({ id, data }) => {
  const [condition, setCondition] = useState(data?.condition || '');
  const [operator, setOperator] = useState(data?.operator || 'contains');

  const handles = [
    { id: `${id}-input`, type: 'target', position: Position.Left },
    { id: `${id}-true`, type: 'source', position: Position.Right, style: { top: '35%' } },
    { id: `${id}-false`, type: 'source', position: Position.Right, style: { top: '65%' } },
  ];

  return (
    <BaseNode title="Filter" icon="⟁" accentColor="#34d399" handles={handles} minWidth={230}>
      <NodeField label="Operator">
        <select style={selectStyle} value={operator} onChange={(e) => setOperator(e.target.value)}>
          <option value="contains">Contains</option>
          <option value="equals">Equals</option>
          <option value="startsWith">Starts With</option>
          <option value="regex">Regex</option>
        </select>
      </NodeField>
      <NodeField label="Value">
        <input style={inputStyle} type="text" placeholder="filter value..." value={condition} onChange={(e) => setCondition(e.target.value)} />
      </NodeField>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
        <span>true ↑</span>
        <span>false ↓</span>
      </div>
    </BaseNode>
  );
};
