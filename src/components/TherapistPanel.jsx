import { ROM_CONFIG, getDiagnosis } from '../utils/romConfig';

export default function TherapistPanel({ exerciseId, repROMScores = [], latestROM = null, latestAngle = null }) {
  const config = ROM_CONFIG[exerciseId];
  const hasData = repROMScores.length > 0;

  const avgROM = hasData
    ? Math.round(repROMScores.reduce((a, b) => a + b, 0) / repROMScores.length)
    : null;

  const diagnosis = getDiagnosis(exerciseId, avgROM);

  const trend = repROMScores.length >= 3
    ? repROMScores[repROMScores.length - 1] - repROMScores[0]
    : null;

  const statusColor = { optimal: 'var(--brand-accent)', mild: '#f59e0b', moderate: '#f97316', severe: 'var(--status-error)' };

  const getStatusLabel = (status) => {
    const labels = {
      optimal: 'Great Job!',
      mild: 'Good',
      moderate: 'Keep Going',
      severe: 'Focus on Form'
    };
    return labels[status] || 'In Progress';
  };

  return (
    <div className="panel ux-therapist-panel">
      <div className="panel-title">
        <span>Live Progress</span>
        <span className="panel-subtitle">{repROMScores.length} reps completed</span>
      </div>

      {!hasData ? (
        <div className="therapist-empty" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>fitness_center</span>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Complete your first repetition to see your progress!</p>
        </div>
      ) : (
        <>
          {/* Big Score Display */}
          <div className="ux-score-display" style={{ textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(0, 102, 179, 0.05), rgba(0, 166, 126, 0.05))', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: diagnosis ? statusColor[diagnosis.status] : 'var(--brand-primary)', lineHeight: '1' }}>
              {avgROM}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginTop: '0.25rem' }}>
              {getStatusLabel(diagnosis?.status)}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rom-stats-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="rom-stat" style={{ background: 'var(--bg-muted)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
              <span className="rom-stat-val" style={{ fontSize: '1.25rem' }}>{latestROM ?? '—'}</span>
              <span className="rom-stat-key">Last Rep</span>
            </div>
            {latestAngle != null && (
              <div className="rom-stat" style={{ background: 'var(--bg-muted)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                <span className="rom-stat-val" style={{ fontSize: '1.25rem' }}>{Math.round(latestAngle)}°</span>
                <span className="rom-stat-key">Best Angle</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="rom-section" style={{ background: 'var(--bg-muted)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Range of Motion</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--brand-primary)' }}>Target: {config?.normalRange}</span>
            </div>
            <div className="rom-bar-track" style={{ height: '12px', borderRadius: '6px' }}>
              <div
                className="rom-bar-fill"
                style={{
                  width: `${avgROM ?? 0}%`,
                  background: diagnosis ? `linear-gradient(90deg, ${statusColor[diagnosis.status]}, ${statusColor[diagnosis.status]}dd)` : 'var(--brand-primary)',
                  borderRadius: '6px',
                  transition: 'width 0.5s ease'
                }}
              />
            </div>
          </div>

          {/* Rep Dots Visual */}
          <div className="rep-dots-row">
            <span className="rep-dots-label">Your Progress</span>
            <div className="rep-dots" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '0.5rem' }}>
              {repROMScores.map((score, i) => (
                <div
                  key={i}
                  className="rep-dot"
                  title={`Rep ${i + 1}: ${score}%`}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: score >= 88 ? 'var(--brand-accent)' : score >= 65 ? '#f59e0b' : score >= 40 ? '#f97316' : 'var(--status-error)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: '700'
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
