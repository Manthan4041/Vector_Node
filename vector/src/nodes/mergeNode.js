// mergeNode.js - combines multiple inputs into one output
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField, selectStyle } from './BaseNode';

export const MergeNode = ({ id, data }) => {
  const [strategy, setStrategy] = useState(data?.strategy || 'concat');
  const [inputCount] = useState(data?.inputCount || 3);

  const handles = [
    ...Array.from({ length: inputCount }, (_, i) => ({
      id: `${id}-input-${i}`,
      type: 'target',
      position: Position.Left,
      style: { top: `${20 + (i / (inputCount - 1)) * 60}%` },
    })),
    { id: `${id}-output`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode title="Merge" icon="⊕" accentColor="#c084fc" handles={handles} minWidth={220}>
      <NodeField label="Strategy">
        <select style={selectStyle} value={strategy} onChange={(e) => setStrategy(e.target.value)}>
          <option value="concat">Concatenate</option>
          <option value="json">JSON Object</option>
          <option value="array">Array</option>
          <option value="template">Template</option>
        </select>
      </NodeField>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
        {inputCount} inputs → 1 output
      </div>
    </BaseNode>
  );
};
