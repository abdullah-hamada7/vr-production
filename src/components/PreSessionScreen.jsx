import { exercises } from '../exercises';

const exerciseIcons = {
  squats: 'fitness_center',
  bicepCurls: 'sports_gymnastics',
  lunges: 'directions_walk',
  heelSlides: 'accessibility_new',
  straightLegRaise: 'self_improvement',
  anklePump: 'swap_vert',
  quadSets: 'speed'
};

const exerciseDescriptions = {
  squats: 'Knee & hip strength',
  bicepCurls: 'Arm rehabilitation',
  lunges: 'Balance & coordination',
  heelSlides: 'Knee mobility',
  straightLegRaise: 'Quad strengthening',
  anklePump: 'Calf & circulation',
  quadSets: 'Thigh muscle control'
};

export default function PreSessionScreen({ selectedExercise, setSelectedExercise, onStartSession, isCameraReady, onStartCamera, onStopCamera, onOpenVideo, onFileUpload, targetReps, onTargetRepsChange }) {
  return (
    <div className="pre-session-mobile">
      <div className="mobile-header">
        <h2>New Session</h2>
        <p>Complete these steps to begin</p>
      </div>

      {/* Step 1: Choose Exercise */}
      <div className="mobile-step">
        <div className="step-badge">1</div>
        <div className="step-content">
          <h3>Select Exercise</h3>
          <div className="exercise-grid-mobile">
            {Object.values(exercises).map(ex => (
              <button
                key={ex.id}
                onClick={() => setSelectedExercise(ex.id)}
                className={`exercise-card-mobile ${selectedExercise === ex.id ? 'selected' : ''}`}
                aria-pressed={selectedExercise === ex.id}
              >
                <div className="card-icon-wrapper">
                  <span className="material-icons">{exerciseIcons[ex.id] || 'medical_services'}</span>
                  {selectedExercise === ex.id && (
                    <span className="check-mark">✓</span>
                  )}
                </div>
                <span className="exercise-name">{ex.name}</span>
                <span className="exercise-desc">{exerciseDescriptions[ex.id]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Camera */}
      <div className="mobile-step">
        <div className="step-badge">2</div>
        <div className="step-content">
          <h3>Camera</h3>
          {!isCameraReady ? (
            <div className="camera-buttons-mobile">
              <button onClick={onStartCamera} className="btn-primary-mobile">
                <span className="material-icons">videocam</span>
                Turn On Camera
              </button>
              <button onClick={onFileUpload} className="btn-secondary-mobile">
                <span className="material-icons">upload_file</span>
                Upload Video
              </button>
            </div>
          ) : (
            <div className="camera-active-mobile">
              <div className="camera-status">
                <span className="material-icons pulse-icon">check_circle</span>
                <span>Camera Active</span>
              </div>
              <button onClick={onStopCamera} className="btn-text-mobile">
                Turn Off
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Reps */}
      <div className="mobile-step">
        <div className="step-badge">3</div>
        <div className="step-content">
          <h3>Repetitions</h3>
          <div className="reps-selector-mobile">
            <button 
              onClick={() => onTargetRepsChange(Math.max(1, targetReps - 1))} 
              className="rep-btn"
              aria-label="Decrease reps"
            >−</button>
            <div className="rep-display">
              <input 
                type="number"
                value={targetReps}
                onChange={(e) => onTargetRepsChange(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="rep-input-field"
                min="1"
                max="100"
              />
              <span className="rep-label">Target Reps</span>
            </div>
            <button 
              onClick={() => onTargetRepsChange(Math.min(100, targetReps + 1))} 
              className="rep-btn"
              aria-label="Increase reps"
            >+</button>
          </div>
        </div>
      </div>

      {/* Tutorial Link */}
      <button onClick={onOpenVideo} className="help-link-mobile">
        <span className="material-icons">help</span>
        How to do this exercise?
      </button>

      {/* Start Button */}
      <button 
        onClick={onStartSession}
        disabled={!isCameraReady}
        className="start-btn-mobile"
      >
        <span className="material-icons">{isCameraReady ? 'play_arrow' : 'videocam_off'}</span>
        {isCameraReady ? 'Start Now' : 'Enable camera first'}
      </button>
    </div>
  );
}
