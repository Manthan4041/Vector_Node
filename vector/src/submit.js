// submit.js — Enhanced submit with inline results panel + toast notifications
import { useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { toast } from './Toast';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getOrphanNodes: state.getOrphanNodes,
});

export const SubmitButton = () => {
  const { nodes, edges, getOrphanNodes } = useStore(selector, shallow);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (nodes.length === 0) {
      toast.warning('No nodes in the pipeline');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/pipelines/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      const orphans = getOrphanNodes();

      setResult({
        ...data,
        orphanCount: orphans.length,
        orphanNames: orphans.map((n) => n.id).slice(0, 5),
      });

      if (data.is_dag) {
        toast.success('Pipeline is a valid DAG');
      } else {
        toast.error('Pipeline contains a cycle');
      }
    } catch (err) {
      toast.error(`Submit failed: ${err.message}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#0f1623',
      borderTop: '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Results panel (slides up) */}
      {result && (
        <div style={{
          padding: '14px 20px',
          background: 'linear-gradient(180deg, rgba(30,36,51,0.95), rgba(15,22,35,0.95))',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'slideUp 0.25s ease-out',
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}>
          <ResultStat label="Nodes" value={result.num_nodes} color="#22d3ee" />
          <ResultStat label="Edges" value={result.num_edges} color="#a78bfa" />
          <ResultStat
            label="Valid DAG"
            value={result.is_dag ? '✓ Yes' : '✗ No'}
            color={result.is_dag ? '#34d399' : '#f87171'}
          />
          {result.orphanCount > 0 && (
            <ResultStat
              label="Orphan Nodes"
              value={result.orphanCount}
              color="#fbbf24"
              subtitle={result.orphanNames.join(', ')}
            />
          )}
          <button
            onClick={() => setResult(null)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.4)',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => { e.target.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.target.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Submit button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
      }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '10px 40px',
            background: loading
              ? 'rgba(108,99,255,0.4)'
              : 'linear-gradient(135deg, #6C63FF, #8b5cf6)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            boxShadow: loading ? 'none' : '0 4px 16px rgba(108,99,255,0.35)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 20px rgba(108,99,255,0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 16px rgba(108,99,255,0.35)';
          }}
        >
          {loading ? 'Analyzing…' : 'Submit Pipeline'}
        </button>
      </div>
    </div>
  );
};

// ─── Helper: stat card ────────────────────
const ResultStat = ({ label, value, color, subtitle }) => (
  <div style={{ textAlign: 'center', minWidth: '80px' }}>
    <div style={{
      fontSize: '18px', fontWeight: '700', color,
      fontFamily: "'DM Sans', sans-serif",
      lineHeight: 1,
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.35)',
      textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px',
    }}>
      {label}
    </div>
    {subtitle && (
      <div style={{
        fontSize: '9px', color: 'rgba(255,255,255,0.25)',
        marginTop: '2px', maxWidth: '120px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {subtitle}
      </div>
    )}
  </div>
);
