export default function SessionHistory({ sessions = [], onClear, onViewReport }) {
  return (
    <div className="panel" style={{ marginTop: 'auto' }}>
      <div className="panel-title" style={{ justifyContent: 'space-between' }}>
        <span>Session History</span>
        {sessions.length > 0 && (
          <button onClick={onClear} className="text-btn danger" style={{ fontSize: '0.75rem' }}>
            Clear All
          </button>
        )}
      </div>

      <div className="history-list">
        {sessions.length === 0 ? (
          <div className="history-empty">
            <span className="material-icons">history</span>
            <p>No previous sessions</p>
          </div>
        ) : (
          sessions.map((session, i) => (
            <div key={i} className="history-item" onClick={() => onViewReport(session)}>
              <div className="history-main">
                <span className="history-exercise">{session.exercise}</span>
                <span className="history-date">
                  {new Date(session.timestamp).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="history-meta">
                <span className="history-reps">{session.reps} reps</span>
                {session.romScore && (
                  <span className="history-score" style={{ 
                    color: session.romScore >= 88 ? 'var(--brand-accent)' : 
                           session.romScore >= 65 ? '#f59e0b' : 'var(--status-error)' 
                  }}>
                    {session.romScore}% ROM
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
