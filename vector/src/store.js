// store.js — Enhanced Zustand store with undo/redo, save/load, auto-save

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "reactflow";
import { toast } from "./Toast";

const STORAGE_KEY = "vectorshift_pipeline";
const MAX_HISTORY = 50;

// ─── Helpers ──────────────────────────────────────────────

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.nodes) && Array.isArray(data.edges)) {
      return data;
    }
  } catch { /* ignore corrupt data */ }
  return null;
};

const saveToStorage = (state) => {
  try {
    const data = {
      nodes: state.nodes,
      edges: state.edges,
      nodeIDs: state.nodeIDs || {},
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* storage full or unavailable */ }
};

// ─── Handle type definitions for connection validation ───
// Maps handle id patterns to data types
const HANDLE_TYPES = {
  value: "any",
  output: "any",
  response: "text",
  input: "any",
  body: "json",
  headers: "json",
  error: "text",
  system: "text",
  prompt: "text",
  true: "any",
  false: "any",
};

const getHandleDataType = (handleId) => {
  if (!handleId) return "any";
  const parts = handleId.split("-");
  const suffix = parts[parts.length - 1];
  return HANDLE_TYPES[suffix] || "any";
};

// ─── Store ────────────────────────────────────────────────
const initial = loadFromStorage();

export const useStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    nodes: initial?.nodes || [],
    edges: initial?.edges || [],
    nodeIDs: initial?.nodeIDs || {},

    // Undo/Redo history
    past: [],
    future: [],

    // Clipboard
    clipboard: null,

    // ─── History helpers ────────────────────
    pushHistory: () => {
      const { nodes, edges, nodeIDs, past } = get();
      const snapshot = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), nodeIDs: { ...nodeIDs } };
      const newPast = [...past, snapshot].slice(-MAX_HISTORY);
      set({ past: newPast, future: [] });
    },

    undo: () => {
      const { past, nodes, edges, nodeIDs } = get();
      if (past.length === 0) return;
      const prev = past[past.length - 1];
      const current = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), nodeIDs: { ...nodeIDs } };
      set({
        nodes: prev.nodes,
        edges: prev.edges,
        nodeIDs: prev.nodeIDs,
        past: past.slice(0, -1),
        future: [current, ...get().future],
      });
    },

    redo: () => {
      const { future, nodes, edges, nodeIDs } = get();
      if (future.length === 0) return;
      const next = future[0];
      const current = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), nodeIDs: { ...nodeIDs } };
      set({
        nodes: next.nodes,
        edges: next.edges,
        nodeIDs: next.nodeIDs,
        past: [...get().past, current],
        future: future.slice(1),
      });
    },

    // ─── Node ID generation ─────────────────
    getNodeID: (type) => {
      const newIDs = { ...get().nodeIDs };
      if (newIDs[type] === undefined) {
        newIDs[type] = 0;
      }
      newIDs[type] += 1;
      set({ nodeIDs: newIDs });
      return `${type}-${newIDs[type]}`;
    },

    // ─── Node operations ────────────────────
    addNode: (node) => {
      get().pushHistory();
      set({ nodes: [...get().nodes, node] });
    },

    deleteNode: (nodeId) => {
      get().pushHistory();
      set({
        nodes: get().nodes.filter((n) => n.id !== nodeId),
        edges: get().edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        ),
      });
    },

    deleteSelectedNodes: () => {
      const selected = get().nodes.filter((n) => n.selected);
      if (selected.length === 0) return;
      get().pushHistory();
      const selectedIds = new Set(selected.map((n) => n.id));
      set({
        nodes: get().nodes.filter((n) => !selectedIds.has(n.id)),
        edges: get().edges.filter(
          (e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)
        ),
      });
    },

    duplicateNode: (nodeId) => {
      const node = get().nodes.find((n) => n.id === nodeId);
      if (!node) return;
      get().pushHistory();
      const newId = get().getNodeID(node.type);
      const newNode = {
        ...JSON.parse(JSON.stringify(node)),
        id: newId,
        position: { x: node.position.x + 40, y: node.position.y + 40 },
        data: { ...JSON.parse(JSON.stringify(node.data)), id: newId },
        selected: false,
      };
      set({ nodes: [...get().nodes, newNode] });
    },

    duplicateSelectedNodes: () => {
      const selected = get().nodes.filter((n) => n.selected);
      if (selected.length === 0) return;
      get().pushHistory();
      const newNodes = [];
      selected.forEach((node) => {
        const newId = get().getNodeID(node.type);
        newNodes.push({
          ...JSON.parse(JSON.stringify(node)),
          id: newId,
          position: { x: node.position.x + 40, y: node.position.y + 40 },
          data: { ...JSON.parse(JSON.stringify(node.data)), id: newId },
          selected: false,
        });
      });
      set({ nodes: [...get().nodes, ...newNodes] });
    },

    // ─── Copy/Paste ─────────────────────────
    copySelectedNodes: () => {
      const selected = get().nodes.filter((n) => n.selected);
      if (selected.length === 0) return;
      set({ clipboard: JSON.parse(JSON.stringify(selected)) });
      toast.info(`Copied ${selected.length} node(s)`);
    },

    pasteNodes: () => {
      const { clipboard } = get();
      if (!clipboard || clipboard.length === 0) return;
      get().pushHistory();
      const newNodes = clipboard.map((node) => {
        const newId = get().getNodeID(node.type);
        return {
          ...JSON.parse(JSON.stringify(node)),
          id: newId,
          position: { x: node.position.x + 60, y: node.position.y + 60 },
          data: { ...JSON.parse(JSON.stringify(node.data)), id: newId },
          selected: true,
        };
      });
      // Deselect all existing
      const updatedNodes = get().nodes.map((n) => ({ ...n, selected: false }));
      set({ nodes: [...updatedNodes, ...newNodes] });
      toast.info(`Pasted ${newNodes.length} node(s)`);
    },

    // ─── ReactFlow callbacks ────────────────
    onNodesChange: (changes) => {
      // Push history for removals or position changes that are done
      const hasRemoval = changes.some((c) => c.type === "remove");
      const hasDimensionChange = changes.some(
        (c) => c.type === "dimensions"
      );
      if (hasRemoval) get().pushHistory();
      set({ nodes: applyNodeChanges(changes, get().nodes) });
    },

    onEdgesChange: (changes) => {
      const hasRemoval = changes.some((c) => c.type === "remove");
      if (hasRemoval) get().pushHistory();
      set({ edges: applyEdgeChanges(changes, get().edges) });
    },

    onConnect: (connection) => {
      get().pushHistory();
      set({
        edges: addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: true,
            markerEnd: {
              type: MarkerType.Arrow,
              height: "20px",
              width: "20px",
            },
          },
          get().edges
        ),
      });
    },

    // ─── Connection validation ──────────────
    isValidConnection: (connection) => {
      // Prevent self-connections
      if (connection.source === connection.target) return false;

      // Prevent duplicate connections
      const exists = get().edges.some(
        (e) =>
          e.source === connection.source &&
          e.target === connection.target &&
          e.sourceHandle === connection.sourceHandle &&
          e.targetHandle === connection.targetHandle
      );
      if (exists) return false;

      // Type compatibility check
      const srcType = getHandleDataType(connection.sourceHandle);
      const tgtType = getHandleDataType(connection.targetHandle);
      if (srcType !== "any" && tgtType !== "any" && srcType !== tgtType) {
        return false;
      }

      return true;
    },

    // ─── Field update ───────────────────────
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
          return node;
        }),
      });
    },

    // ─── Save / Load / Export / Import ──────
    savePipeline: () => {
      saveToStorage(get());
      toast.success("Pipeline saved");
    },

    loadPipeline: () => {
      const data = loadFromStorage();
      if (data) {
        get().pushHistory();
        set({ nodes: data.nodes, edges: data.edges, nodeIDs: data.nodeIDs || {} });
        toast.success("Pipeline loaded");
      } else {
        toast.warning("No saved pipeline found");
      }
    },

    clearPipeline: () => {
      get().pushHistory();
      set({ nodes: [], edges: [], nodeIDs: {} });
      toast.info("Canvas cleared");
    },

    exportPipeline: () => {
      const data = {
        nodes: get().nodes,
        edges: get().edges,
        nodeIDs: get().nodeIDs,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pipeline_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Pipeline exported");
    },

    importPipeline: (jsonString) => {
      try {
        const data = JSON.parse(jsonString);
        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error("Invalid pipeline format");
        }
        get().pushHistory();
        set({
          nodes: data.nodes,
          edges: data.edges,
          nodeIDs: data.nodeIDs || {},
        });
        toast.success(`Imported ${data.nodes.length} nodes, ${data.edges.length} edges`);
      } catch (err) {
        toast.error(`Import failed: ${err.message}`);
      }
    },

    // ─── Validation helpers ─────────────────
    getOrphanNodes: () => {
      const { nodes, edges } = get();
      const connectedIds = new Set();
      edges.forEach((e) => {
        connectedIds.add(e.source);
        connectedIds.add(e.target);
      });
      return nodes.filter((n) => !connectedIds.has(n.id) && n.type !== "note");
    },

    selectAllNodes: () => {
      set({
        nodes: get().nodes.map((n) => ({ ...n, selected: true })),
      });
    },
  }))
);

// ─── Auto-save subscriber ─────────────────────────────────
let saveTimeout = null;
useStore.subscribe(
  (state) => ({ nodes: state.nodes, edges: state.edges }),
  () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveToStorage(useStore.getState());
    }, 1000);
  },
  { equalityFn: (a, b) => a.nodes === b.nodes && a.edges === b.edges }
);
