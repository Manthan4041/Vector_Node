// draggableNode.js
export const DraggableNode = ({ type, label, icon, color = '#6C63FF' }) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType }));
    event.dataTransfer.effectAllowed = 'move';
    event.target.style.opacity = '0.7';
  };

  return (
    <div
      className={type}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => { event.target.style.opacity = '1'; }}
      style={{
        cursor: 'grab',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '7px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderTop: `2px solid ${color}`,
        transition: 'background 0.15s, transform 0.1s',
        userSelect: 'none',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
      draggable
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {icon && <span style={{ fontSize: '12px', color }}>{icon}</span>}
      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: '500' }}>{label}</span>
    </div>
  );
};
