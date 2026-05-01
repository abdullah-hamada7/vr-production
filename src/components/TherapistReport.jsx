import { FileText, Printer, X, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

export default function TherapistReport({ data, onClose }) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-overlay">
      <div className="report-modal">
        <header className="report-header no-print">
          <div className="report-header-left">
            <FileText size={20} />
            <span>Clinical Performance Report</span>
          </div>
          <div className="report-actions">
            <button onClick={handlePrint} className="report-btn print-btn">
              <Printer size={16} /> Print PDF
            </button>
            <button onClick={onClose} className="report-btn close-btn">
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="report-paper">
          <div className="report-title-section">
            <div className="report-brand">Rehabilitation</div>
            <h1>Therapist Assessment Report</h1>
            <p className="report-date">{new Date(data.timestamp).toLocaleString()}</p>
          </div>

          <div className="report-grid">
            <div className="report-section">
              <h3>Exercise Details</h3>
              <div className="report-field">
                <span className="label">Protocol:</span>
                <span className="value">{data.exercise}</span>
              </div>
              <div className="report-field">
                <span className="label">Total Reps:</span>
                <span className="value">{data.reps}</span>
              </div>
              <div className="report-field">
                <span className="label">Duration:</span>
                <span className="value">{data.duration}s</span>
              </div>
            </div>

            <div className="report-section">
              <h3>Clinical Metrics</h3>
              <div className="metric-row">
                <div className="metric-card">
                  <span className="metric-label">Avg. ROM Score</span>
                  <span className="metric-value">{data.romScore}%</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Stability Score</span>
                  <span className="metric-value">{data.latestStability ? Math.round(data.latestStability) : 'N/A'}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="report-divider"></div>

          <div className="report-analysis">
            <h3>Diagnostic Observations</h3>

            <div className="observation-item">
              <Activity className="obs-icon" size={18} />
              <div>
                <strong>Bilateral Symmetry:</strong>
                <p>
                  {data.latestAsymmetry !== null
                    ? `Joint angle deviation detected at ${Math.round(data.latestAsymmetry)}°. ${data.latestAsymmetry > 15 ? 'Significant asymmetry noted; monitor for compensatory patterns.' : 'Within normal therapeutic limits.'}`
                    : 'Unilateral analysis performed. No symmetry data available.'}
                </p>
              </div>
            </div>

            <div className="observation-item">
              <CheckCircle className="obs-icon" size={18} />
              <div>
                <strong>Kinetic Chain & Weight Distribution:</strong>
                <p>
                  {data.latestStability > 85
                    ? 'Excellent joint-to-joint alignment maintained.'
                    : 'Minor stability drift detected. Recommend base-of-support focus.'}
                  {" "}
                  {data.weightShift > 10
                    ? 'Significant lateral weight shift detected; likely compensatory strategy.'
                    : 'Weight distribution remains centered.'}
                </p>
              </div>
            </div>

            <div className="observation-item">
              <FileText className="obs-icon" size={18} />
              <div>
                <strong>Phase Timing (TUT):</strong>
                <p>
                  Eccentric: {data.phaseTiming?.eccentric?.toFixed(1)}s | Concentric: {data.phaseTiming?.concentric?.toFixed(1)}s.
                  {data.phaseTiming?.eccentric < data.phaseTiming?.concentric
                    ? " Eccentric phase is faster than concentric; suggest slower descent for motor control."
                    : " Good eccentric control observed."}
                </p>
              </div>
            </div>

            {data.romScore < 70 && (
              <div className="observation-item warning">
                <AlertTriangle className="obs-icon" size={18} />
                <div>
                  <strong>Mobility Warning:</strong>
                  <p>Sub-optimal Range of Motion (ROM) detected. This may indicate joint stiffness or muscle guarding.</p>
                </div>
              </div>
            )}
          </div>

          <div className="report-footer">
            <p>This report was generated using real-time anatomical tracking via Rehabilitation. All metrics are calculated relative to clinical rehabilitation benchmarks.</p>
            <div className="signature-line">
              <span>Patient Signature</span>
              <span>Therapist/Clinician Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
