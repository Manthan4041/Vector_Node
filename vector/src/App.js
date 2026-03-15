import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { ToastProvider } from './Toast';
import './index.css';

function App() {
  return (
    <ToastProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f1623' }}>
        <header style={{
          padding: '10px 20px',
          background: '#0d1320',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '6px',
            background: 'linear-gradient(135deg, #6C63FF, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px',
          }}>
            ⚡
          </div>
          <span style={{
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            fontWeight: '700',
            fontSize: '15px',
            color: '#fff',
            letterSpacing: '0.02em',
          }}>
            VectorShift
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginLeft: '2px', fontFamily: "'DM Sans', sans-serif" }}>
            Pipeline Builder
          </span>

          {/* Keyboard shortcut hints */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Sans', sans-serif" }}>
            <span>Ctrl+S Save</span>
            <span>Ctrl+Z Undo</span>
            <span>Ctrl+Y Redo</span>
            <span>Del Delete</span>
          </div>
        </header>
        <PipelineToolbar />
        <PipelineUI />
        <SubmitButton />
      </div>
    </ToastProvider>
  );
}

export default App;
