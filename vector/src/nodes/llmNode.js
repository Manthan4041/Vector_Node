// llmNode.js
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const LLMNode = ({ id }) => {
  const handles = [
    { id: `${id}-system`, type: 'target', position: Position.Left, style: { top: '33%' } },
    { id: `${id}-prompt`, type: 'target', position: Position.Left, style: { top: '66%' } },
    { id: `${id}-response`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode title="LLM" icon="✦" accentColor="#a78bfa" handles={handles}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>system</span>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>response →</span>
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>prompt</div>
        <div style={{ marginTop: '6px', padding: '6px 8px', background: 'rgba(167,139,250,0.08)', borderRadius: '6px', fontSize: '11px', color: 'rgba(167,139,250,0.8)' }}>
          Language Model
        </div>
      </div>
    </BaseNode>
  );
};
