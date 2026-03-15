// ui.js — Pipeline canvas with keyboard shortcuts, context menu, connection validation
import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { FilterNode } from './nodes/filterNode';
import { TransformNode } from './nodes/transformNode';
import { ApiNode } from './nodes/apiNode';
import { MergeNode } from './nodes/mergeNode';
import { NoteNode } from './nodes/noteNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  filter: FilterNode,
  transform: TransformNode,
  api: ApiNode,
  merge: MergeNode,
  note: NoteNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  isValidConnection: state.isValidConnection,
  undo: state.undo,
  redo: state.redo,
  savePipeline: state.savePipeline,
  deleteSelectedNodes: state.deleteSelectedNodes,
  duplicateSelectedNodes: state.duplicateSelectedNodes,
  duplicateNode: state.duplicateNode,
  deleteNode: state.deleteNode,
  copySelectedNodes: state.copySelectedNodes,
  pasteNodes: state.pasteNodes,
  selectAllNodes: state.selectAllNodes,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const {
    nodes, edges, getNodeID, addNode,
    onNodesChange, onEdgesChange, onConnect,
    isValidConnection, undo, redo, savePipeline,
    deleteSelectedNodes, duplicateSelectedNodes,
    duplicateNode, deleteNode,
    copySelectedNodes, pasteNodes, selectAllNodes,
  } = useStore(selector, shallow);

  const getInitNodeData = (nodeID, type) => ({ id: nodeID, nodeType: `${type}` });

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      if (event?.dataTransfer?.getData('application/reactflow')) {
        const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        const type = appData?.nodeType;
        if (!type) return;
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        const nodeID = getNodeID(type);
        addNode({ id: nodeID, type, position, data: getInitNodeData(nodeID, type) });
      }
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // ─── Keyboard shortcuts ───────────────────
  useEffect(() => {
    const handler = (e) => {
      // Ignore when typing in input/textarea/select
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (ctrl && e.key === 's') {
        e.preventDefault();
        savePipeline();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNodes();
      } else if (ctrl && e.key === 'd') {
        e.preventDefault();
        duplicateSelectedNodes();
      } else if (ctrl && e.key === 'c') {
        e.preventDefault();
        copySelectedNodes();
      } else if (ctrl && e.key === 'v') {
        e.preventDefault();
        pasteNodes();
      } else if (ctrl && e.key === 'a') {
        e.preventDefault();
        selectAllNodes();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, savePipeline, deleteSelectedNodes, duplicateSelectedNodes, copySelectedNodes, pasteNodes, selectAllNodes]);

  // ─── Context menu ─────────────────────────
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    });
  }, []);

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: null,
    });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleContextAction = useCallback((action) => {
    if (!contextMenu) return;
    switch (action) {
      case 'delete':
        if (contextMenu.nodeId) deleteNode(contextMenu.nodeId);
        else deleteSelectedNodes();
        break;
      case 'duplicate':
        if (contextMenu.nodeId) duplicateNode(contextMenu.nodeId);
        else duplicateSelectedNodes();
        break;
      case 'copy':
        copySelectedNodes();
        break;
      case 'paste':
        pasteNodes();
        break;
      case 'selectAll':
        selectAllNodes();
        break;
      default: break;
    }
    setContextMenu(null);
  }, [contextMenu, deleteNode, deleteSelectedNodes, duplicateNode, duplicateSelectedNodes, copySelectedNodes, pasteNodes, selectAllNodes]);

  // Close context menu on any click
  useEffect(() => {
    if (contextMenu) {
      const close = () => setContextMenu(null);
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [contextMenu]);

  const menuItems = contextMenu?.nodeId
    ? [
      { label: 'Duplicate', shortcut: 'Ctrl+D', action: 'duplicate', icon: '⊕' },
      { label: 'Delete', shortcut: 'Del', action: 'delete', icon: '✗' },
      { label: 'Copy', shortcut: 'Ctrl+C', action: 'copy', icon: '⎘' },
    ]
    : [
      { label: 'Paste', shortcut: 'Ctrl+V', action: 'paste', icon: '⎗' },
      { label: 'Select All', shortcut: 'Ctrl+A', action: 'selectAll', icon: '☐' },
    ];

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: 'calc(100vh - 130px)', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
        connectionLineStyle={{ stroke: '#6C63FF', strokeWidth: 2 }}
        isValidConnection={isValidConnection}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={closeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        defaultEdgeOptions={{
          style: { stroke: '#6C63FF', strokeWidth: 1.5 },
        }}
      >
        <Background color="rgba(255,255,255,0.04)" gap={gridSize} variant="dots" />
        <Controls
          style={{
            background: '#1e2433',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        />
        <MiniMap
          style={{
            background: '#131929',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
          }}
          nodeColor="#6C63FF"
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000,
          }}
        >
          {menuItems.map((item) => (
            <div
              key={item.action}
              className="context-menu-item"
              onClick={(e) => { e.stopPropagation(); handleContextAction(item.action); }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', width: '16px', textAlign: 'center', opacity: 0.7 }}>{item.icon}</span>
                <span>{item.label}</span>
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{item.shortcut}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
