import { useState, useEffect } from 'react';

export default function SessionHistory({ sessions = [], onClear, onViewReport }) {
  // Collapsed by default on mobile, expanded on tablet+
  const [isExpanded, setIsExpanded] = useState(() => window.innerWidth >= 768);

  // Keep in sync if window is resized
  useEffect(() => {
    const onResize = () => setIsExpanded(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const listHeight = sessions.length === 0 ? '120px' : `${sessions.length * 76 + 16}px`;

  return (
    <div className="panel">
      <div className="history-section-header" onClick={() => setIsExpanded(e => !e)}>
        <div className="panel-title" style={{ border: 'none', padding: 0, margin: 0, fontSize: '1rem' }}>
          Session History
          {sessions.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 500, marginLeft: '0.5rem' }}>
              ({sessions.length})
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {sessions.length > 0 && (
            <button
              onClick={e => { e.stopPropagation(); onClear(); }}
              className="text-btn danger"
              style={{ fontSize: '0.75rem' }}
            >
              Clear
            </button>
          )}
          <button className={`history-toggle-btn ${isExpanded ? '' : 'collapsed'}`} aria-label="Toggle history">
            <span className="material-icons">expand_more</span>
          </button>
        </div>
      </div>

      <div
        className={`history-list-wrapper ${isExpanded ? '' : 'collapsed'}`}
        style={{ maxHeight: isExpanded ? listHeight : '0px' }}
      >
        <div className="history-list" style={{ paddingTop: '0.75rem' }}>
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
    </div>
  );
}
