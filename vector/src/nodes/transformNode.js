// transformNode.js - applies a transformation to data
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField, selectStyle, inputStyle } from './BaseNode';

export const TransformNode = ({ id, data }) => {
  const [transformType, setTransformType] = useState(data?.transformType || 'uppercase');
  const [customCode, setCustomCode] = useState(data?.customCode || '');

  const handles = [
    { id: `${id}-input`, type: 'target', position: Position.Left },
    { id: `${id}-output`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode title="Transform" icon="⟳" accentColor="#fb923c" handles={handles} minWidth={230}>
      <NodeField label="Operation">
        <select style={selectStyle} value={transformType} onChange={(e) => setTransformType(e.target.value)}>
          <option value="uppercase">Uppercase</option>
          <option value="lowercase">Lowercase</option>
          <option value="trim">Trim</option>
          <option value="json_parse">JSON Parse</option>
          <option value="custom">Custom</option>
        </select>
      </NodeField>
      {transformType === 'custom' && (
        <NodeField label="Expression">
          <input style={inputStyle} type="text" placeholder="x => x.split('').reverse().join('')" value={customCode} onChange={(e) => setCustomCode(e.target.value)} />
        </NodeField>
      )}
    </BaseNode>
  );
};
