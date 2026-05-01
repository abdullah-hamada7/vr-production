import { useEffect, useRef, useState } from 'react';
import './index.css';

import { speak } from './utils/speech';
import { saveSession, getSessions, clearSessions } from './utils/sessionStorage';
import { drawSkeleton } from './utils/canvasDrawing';
import { ROM_CONFIG } from './utils/romConfig';

import TherapistPanel from './components/TherapistPanel';
import SessionHistory from './components/SessionHistory';
import TherapistReport from './components/TherapistReport';
import ErrorOverlay from './components/ErrorOverlay';
import GoodFormBadge from './components/GoodFormBadge';
import PreSessionScreen from './components/PreSessionScreen';
import VideoReferenceModal from './components/VideoReferenceModal';

import { getExercise, getExerciseInitialStage } from './exercises';

export default function App() {
  // Remove splash screen after its animation completes (approx 3.5s)
  useEffect(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      const timer = setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 600);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameId = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Tracking refs
  const stageRef = useRef(getExerciseInitialStage('squats'));
  const repsRef = useRef(0);
  const startTimeRef = useRef(null);
  const currentExerciseRef = useRef(null);

  // ROM tracking
  const peakAngleRef = useRef(null);
  const prevAngleRef = useRef(null);
  const smoothedAngleRef = useRef(null);
  const baselineAngleRef = useRef(ROM_CONFIG['squats']?.startAngle ?? 165);

  // Phase Timing (TUT)
  const phaseStartTimeRef = useRef(null);
  const phaseDurationsRef = useRef({ eccentric: 0, concentric: 0 });

  // State
  const [sessionPhase, _setSessionPhase] = useState('SETUP'); // SETUP, ACTIVE, COMPLETE
  const sessionPhaseRef = useRef('SETUP');
  const setSessionPhase = (val) => {
    sessionPhaseRef.current = val;
    _setSessionPhase(val);
  };

  const [selectedExerciseId, setSelectedExerciseId] = useState('squats');
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState({ textEn: 'Ready to start', type: 'neutral' });
  const [isCameraReady, setIsCameraReady] = useState(false);
  // 'NONE' | 'CAMERA' | 'FILE'
  const [sourceType, setSourceType] = useState('NONE');
  const sourceTypeRef = useRef('NONE');
  const [sessions, setSessions] = useState(getSessions);
  
  const [latestROM, setLatestROM] = useState(null);
  const [latestAngle, setLatestAngle] = useState(null);
  const [, setLatestAsymmetry] = useState(null);
  const [, setLatestStability] = useState(null);
  const [repROMScores, setRepROMScores] = useState([]);
  const [targetReps, setTargetReps] = useState(10);
  const [showReport, setShowReport] = useState(false);
  const [currentReportData, setCurrentReportData] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCorrectForm, setIsCorrectForm] = useState(false);

  // Refs for values used inside MediaPipe callback
  const targetRepsRef = useRef(10);
  const finishSessionRef = useRef(null);
  const repROMScoresRef = useRef([]);
  const latestAsymmetryRef = useRef(null);
  const latestStabilityRef = useRef(null);
  useEffect(() => { targetRepsRef.current = targetReps; }, [targetReps]);

  useEffect(() => {
    currentExerciseRef.current = getExercise(selectedExerciseId);

    if (!window.Pose) {
      console.error('MediaPipe Pose not found');
      return;
    }

    const pose = new window.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    pose.onResults(onResults);
    poseRef.current = pose;

    return () => {
      stopCamera();
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    currentExerciseRef.current = getExercise(selectedExerciseId);
    resetSession();
  }, [selectedExerciseId]); // eslint-disable-line

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => fitCanvas());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  function fitCanvas() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!video || !canvas || !container || !video.videoWidth) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const videoAspect = video.videoWidth / video.videoHeight;
    const containerAspect = containerW / containerH;

    let renderW, renderH, offsetX, offsetY;

    if (videoAspect > containerAspect) {
      // Video is wider → fit width, letterbox top/bottom
      renderW = containerW;
      renderH = Math.round(containerW / videoAspect);
      offsetX = 0;
      offsetY = Math.round((containerH - renderH) / 2);
    } else {
      // Video is taller → fit height, pillarbox left/right
      renderH = containerH;
      renderW = Math.round(containerH * videoAspect);
      offsetX = Math.round((containerW - renderW) / 2);
      offsetY = 0;
    }

    canvas.style.left   = `${offsetX}px`;
    canvas.style.top    = `${offsetY}px`;
    canvas.style.width  = `${renderW}px`;
    canvas.style.height = `${renderH}px`;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  function updateFeedback(textEn, type, isCorrect = false) {
    setIsCorrectForm(isCorrect);
    setFeedback({ textEn, type });
    
    // Speak all clinical guidance (errors and form corrections)
    if (type !== 'neutral') {
      speak(textEn);
    }
  }

  function onResults(results) {
    const canvasElement = canvasRef.current;
    const videoElement = videoRef.current;
    if (!canvasElement || !videoElement) return;

    const ctx = canvasElement.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results && results.poseLandmarks && videoElement.videoWidth > 0) {
      const exercise = currentExerciseRef.current;
      if (!exercise) { ctx.restore(); return; }

      drawSkeleton(ctx, results.poseLandmarks, window.POSE_CONNECTIONS);

      if (sessionPhaseRef.current !== 'ACTIVE') {
        ctx.restore();
        return;
      }

      try {
        const analysis = exercise.analyze(results.poseLandmarks, stageRef.current);
        if (!analysis) { ctx.restore(); return; }

        const cfg = ROM_CONFIG[exercise.id];
        if (cfg && analysis.angles) {
          let rawAngle = analysis.angles[cfg.primaryKey];

          if (rawAngle != null) {
            if (rawAngle < 5 || rawAngle > 200) rawAngle = prevAngleRef.current ?? (cfg?.startAngle ?? 165);
            const prevRaw = prevAngleRef.current;
            const isExtremeJump = prevRaw !== null && Math.abs(rawAngle - prevRaw) > 40;
            prevAngleRef.current = rawAngle;

            if (!isExtremeJump) {
              if (smoothedAngleRef.current === null) smoothedAngleRef.current = rawAngle;
              else smoothedAngleRef.current = (smoothedAngleRef.current * 0.8) + (rawAngle * 0.2);

              const initialStage = getExerciseInitialStage(selectedExerciseId);
              if (stageRef.current === initialStage && !analysis.isGoodRep) {
                baselineAngleRef.current = (baselineAngleRef.current * 0.98) + (rawAngle * 0.02);
              }

              if (analysis.stage !== stageRef.current) {
                // Stage just changed — start fresh peak for new phase
                peakAngleRef.current = rawAngle;
              } else {
                // Within same phase — track minimum (deepest) angle
                if (peakAngleRef.current === null || rawAngle < peakAngleRef.current) {
                  peakAngleRef.current = rawAngle;
                }
              }

              if (analysis.stage !== stageRef.current) {
                const now = Date.now();
                if (phaseStartTimeRef.current) {
                  const duration = (now - phaseStartTimeRef.current) / 1000;
                  if (stageRef.current === 'DOWN') phaseDurationsRef.current.eccentric = duration;
                  if (stageRef.current === 'UP') phaseDurationsRef.current.concentric = duration;
                }
                phaseStartTimeRef.current = now;
              }
            }
          }

          if (analysis.isGoodRep) {
            const newReps = repsRef.current + 1;
            repsRef.current = newReps;
            setReps(newReps);
            if (!startTimeRef.current) startTimeRef.current = Date.now();
            const repPeak = peakAngleRef.current ?? rawAngle ?? (cfg?.startAngle ?? 165);
            const range = Math.abs(baselineAngleRef.current - cfg.targetAngle);
            const achieved = Math.abs(baselineAngleRef.current - repPeak);
            let score = Math.round((achieved / range) * 100);
            score = Math.max(0, Math.min(100, score));
            setLatestROM(score);
            setLatestAngle(repPeak);
            setRepROMScores(prev => { const next = [...prev, score]; repROMScoresRef.current = next; return next; });
            if (analysis.angles) {
              if (analysis.angles.asymmetry !== undefined) { setLatestAsymmetry(analysis.angles.asymmetry); latestAsymmetryRef.current = analysis.angles.asymmetry; }
              if (analysis.angles.stability !== undefined) { setLatestStability(analysis.angles.stability); latestStabilityRef.current = analysis.angles.stability; }
            }
            peakAngleRef.current = null;
            // Auto-finish when target reached
            if (newReps >= targetRepsRef.current) {
              setTimeout(() => finishSessionRef.current?.(), 800);
            }
          }
        }
        if (analysis.stage) stageRef.current = analysis.stage;
        if (analysis.feedback) updateFeedback(analysis.feedback.textEn || analysis.feedback.text, analysis.feedback.type || 'neutral', analysis.isCorrectForm);
      } catch (err) { console.error('Analysis error:', err); }
    } else if (results && !results.poseLandmarks && sessionPhaseRef.current === 'ACTIVE') {
      updateFeedback('Position yourself in view to begin', 'neutral', false);
    }
    ctx.restore();
  }

  // Stops only the frame-pump loop — does NOT wipe the video source.
  function stopAnalysis() {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }

  // Fully tears down whichever source is active (camera stream OR file).
  function stopSource() {
    if (cameraRef.current) { cameraRef.current.stop(); cameraRef.current = null; }
    stopAnalysis();
    if (videoRef.current) { videoRef.current.srcObject = null; videoRef.current.src = ''; }
    setIsCameraReady(false);
    setSourceType('NONE');
    sourceTypeRef.current = 'NONE';
  }

  // Legacy alias used by the MediaPipe cleanup effect and exercise change.
  function stopCamera() { stopSource(); }

  async function startCamera() {
    stopSource();
    await new Promise(r => setTimeout(r, 50));
    const video = videoRef.current;
    if (!video) { console.error('Video element not found for camera start'); return; }
    video.style.transform = 'scaleX(-1)';
    if (canvasRef.current) canvasRef.current.style.transform = 'scaleX(-1)';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      video.srcObject = stream;
      const onMetadataLoaded = () => {
        if (canvasRef.current) { canvasRef.current.width = video.videoWidth; canvasRef.current.height = video.videoHeight; }
        video.play();
        cameraRef.current = { stop: () => stream.getTracks().forEach(t => t.stop()) };
        setSourceType('CAMERA');
        sourceTypeRef.current = 'CAMERA';
        setIsCameraReady(true);
        fitCanvas();
        pumpFrames();
      };
      if (video.readyState >= 2) onMetadataLoaded();
      else video.onloadedmetadata = onMetadataLoaded;
    } catch (err) { console.error('Camera denied:', err); setIsCameraReady(false); }
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    stopSource();
    const video = videoRef.current;
    if (!video) return;
    video.style.transform = 'none';
    if (canvasRef.current) canvasRef.current.style.transform = 'none';
    video.srcObject = null;
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      if (canvasRef.current) { canvasRef.current.width = video.videoWidth; canvasRef.current.height = video.videoHeight; }
      // Lazy load: pause at frame 0, do NOT start analysis yet.
      video.pause();
      video.currentTime = 0;
      setSourceType('FILE');
      sourceTypeRef.current = 'FILE';
      setIsCameraReady(true);
      fitCanvas();
    };
  }

  async function pumpFrames() {
    const video = videoRef.current;
    if (!video || (!video.srcObject && !video.src)) return;
    if (video.readyState >= 2 && video.videoWidth > 0 && poseRef.current) {
      try { await poseRef.current.send({ image: video }); } catch (err) { console.error(err); }
    }
    animationFrameId.current = requestAnimationFrame(pumpFrames);
  }

  function resetSession() {
    repsRef.current = 0;
    stageRef.current = getExerciseInitialStage(selectedExerciseId);
    startTimeRef.current = null;
    peakAngleRef.current = null;
    prevAngleRef.current = null;
    smoothedAngleRef.current = null;
    // Use the exercise's clinical start angle, not a hardcoded 165
    const cfg = ROM_CONFIG[selectedExerciseId];
    baselineAngleRef.current = cfg?.startAngle ?? 165;
    repROMScoresRef.current = [];
    latestAsymmetryRef.current = null;
    latestStabilityRef.current = null;
    setReps(0); setRepROMScores([]); setLatestROM(null);
    setLatestAngle(null); setLatestAsymmetry(null); setLatestStability(null);
    phaseStartTimeRef.current = null;
    phaseDurationsRef.current = { eccentric: 0, concentric: 0 };
    // Clear any active video source (camera or file)
    stopSource();
    setSessionPhase('SETUP');
    setIsCorrectForm(false);
    updateFeedback('Ready to start', 'neutral');
  }

  function startSession() {
    // Reset clinical data but preserve source state before overwriting phase
    repsRef.current = 0;
    stageRef.current = getExerciseInitialStage(selectedExerciseId);
    startTimeRef.current = null;
    peakAngleRef.current = null;
    prevAngleRef.current = null;
    smoothedAngleRef.current = null;
    const cfg = ROM_CONFIG[selectedExerciseId];
    baselineAngleRef.current = cfg?.startAngle ?? 165;
    repROMScoresRef.current = [];
    latestAsymmetryRef.current = null;
    latestStabilityRef.current = null;
    setReps(0); setRepROMScores([]); setLatestROM(null);
    setLatestAngle(null); setLatestAsymmetry(null); setLatestStability(null);
    phaseStartTimeRef.current = null;
    phaseDurationsRef.current = { eccentric: 0, concentric: 0 };
    setIsCorrectForm(false);
    setSessionPhase('ACTIVE');
    speak('Session started');
    // If a file is loaded, start playback + analysis now
    if (sourceTypeRef.current === 'FILE') {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play();
        pumpFrames();
      }
    }
  }

  function finishSession() {
    if (repsRef.current > 0) {
      const exercise = currentExerciseRef.current;
      const scores = repROMScoresRef.current;
      const avgROM = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      const sessionData = {
        exercise: exercise ? exercise.name : 'Unknown',
        reps: repsRef.current, romScore: avgROM,
        latestAsymmetry: latestAsymmetryRef.current, latestStability: latestStabilityRef.current,
        phaseTiming: { ...phaseDurationsRef.current },
        duration: startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0,
        timestamp: new Date().toISOString()
      };
      saveSession(sessionData); 
      setSessions(getSessions()); 
      setCurrentReportData(sessionData); 
      setShowReport(true);
      speak('Session complete');
    }
    setSessionPhase('COMPLETE');
    // We don't call resetSession immediately to keep the clinical data visible in TherapistPanel
  }

  // Keep ref updated after every render
  finishSessionRef.current = finishSession;

  return (
    <div className="app-container">
      <VideoReferenceModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} exerciseId={selectedExerciseId} />
      <header className="header">
        <div className="header-brand">
          <span className="brand-meta">
            <span className="material-icons" style={{ fontSize: '0.75rem', verticalAlign: 'middle', color: 'var(--brand-accent)' }}>verified_user</span>
            Clinical System
          </span>
          <h1>Rehab<span>AI</span> Pro</h1>
        </div>
        <div className="header-actions">
          {sessionPhase === 'ACTIVE' && (
            <div className="reps-counter-mobile">
              <span className="reps-current">{reps}</span>
              <span className="reps-divider">/</span>
              <span className="reps-target">{targetReps}</span>
            </div>
          )}
          {sessionPhase === 'ACTIVE' && (
            <button onClick={finishSession} className="finish-btn-mobile">
              <span className="material-icons">stop</span>
            </button>
          )}
        </div>
        <div className="medical-seal">
          <span className="material-icons" style={{ color: 'white', fontSize: '1rem' }}>health_and_safety</span>
        </div>
      </header>

      <div className="main-content">
        <div className="stage-area">
          <div ref={containerRef} className={`video-container ${isCameraReady ? 'active' : ''} orientation-${ROM_CONFIG[selectedExerciseId]?.orientation || 'portrait'}`}>
            <ErrorOverlay feedback={feedback} />
            <GoodFormBadge isCorrectForm={isCorrectForm} />
            
            {/* Video and Canvas are always in DOM to keep refs stable, but hidden when not ready */}
            <video 
              ref={videoRef} 
              playsInline 
              muted 
            ></video>
            <canvas 
              ref={canvasRef} 
              className="output-canvas"
            ></canvas>

            {sessionPhase === 'ACTIVE' && isCameraReady && (
              <div className="feedback-display">
                <div className="feedback-bubble">
                  {feedback.textEn}
                </div>
              </div>
            )}

            {!isCameraReady && (
              <div className="wallpaper-container">
                <div className="wallpaper-image"></div>
                <div className="wallpaper-overlay">
                  <div className="wallpaper-content">
                    <span className="material-icons">videocam_off</span>
                    <h3>Camera is Off</h3>
                    <p>Enable camera from the panel below to start</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="console-area sidebar">
          {(sessionPhase === 'SETUP' || sessionPhase === 'COMPLETE') ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sessionPhase === 'COMPLETE' && (
                <button 
                  onClick={resetSession} 
                  className="action-btn primary"
                  style={{ width: '100%', marginBottom: '1rem' }}
                >
                  <span className="material-icons">add</span>
                  New Session
                </button>
              )}
              <PreSessionScreen 
                selectedExercise={selectedExerciseId}
                setSelectedExercise={setSelectedExerciseId}
                onStartSession={startSession}
                isCameraReady={isCameraReady}
                sourceType={sourceType}
                onStartCamera={startCamera}
                onStopSource={stopSource}
                onOpenVideo={() => setIsVideoModalOpen(true)}
                onFileUpload={() => fileInputRef.current?.click()}
                targetReps={targetReps}
                onTargetRepsChange={setTargetReps}
              />
              <SessionHistory sessions={sessions} onClear={() => { clearSessions(); setSessions([]); }} onViewReport={(s) => { setCurrentReportData(s); setShowReport(true); }} />
            </div>
          ) : (
            <>
              <TherapistPanel exerciseId={selectedExerciseId} repROMScores={repROMScores} latestROM={latestROM} latestAngle={latestAngle} />
              <SessionHistory sessions={sessions} onClear={() => { clearSessions(); setSessions([]); }} onViewReport={(s) => { setCurrentReportData(s); setShowReport(true); }} />
            </>
          )}
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/*" style={{ display: 'none' }} />
      {showReport && <TherapistReport data={currentReportData} onClose={() => setShowReport(false)} />}

      {/* Sticky bottom CTA — mobile only, shown during SETUP */}
      {sessionPhase === 'SETUP' && (
        <div className="sticky-cta no-print">
          <button
            onClick={startSession}
            disabled={!isCameraReady}
            className="start-btn-mobile"
            style={{ width: '100%' }}
          >
            <span className="material-icons">
              {!isCameraReady ? 'videocam_off' : sourceType === 'FILE' ? 'play_circle' : 'play_arrow'}
            </span>
            {!isCameraReady
              ? 'Enable camera or upload video'
              : sourceType === 'FILE'
              ? 'Analyze Video'
              : 'Start Session'}
          </button>
        </div>
      )}
    </div>
  );
}
