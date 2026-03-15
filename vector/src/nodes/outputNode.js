// outputNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode, NodeField, inputStyle, selectStyle } from './BaseNode';

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');

  const handles = [
    { id: `${id}-value`, type: 'target', position: Position.Left },
  ];

  return (
    <BaseNode title="Output" icon="←" accentColor="#f472b6" handles={handles}>
      <NodeField label="Name">
        <input style={inputStyle} type="text" value={currName} onChange={(e) => setCurrName(e.target.value)} />
      </NodeField>
      <NodeField label="Type">
        <select style={selectStyle} value={outputType} onChange={(e) => setOutputType(e.target.value)}>
          <option value="Text">Text</option>
          <option value="Image">Image</option>
        </select>
      </NodeField>
    </BaseNode>
  );
};
