import { ROM_CONFIG } from '../utils/romConfig';

export default function VideoReferenceModal({ isOpen, onClose, exerciseId }) {
  if (!isOpen) return null;
  
  const videoUrl = ROM_CONFIG[exerciseId]?.videoUrl;

  return (
    <div className="video-modal-overlay">
      <div className="video-modal-content">
        <div className="panel-title">
          <span>Clinical Reference Form</span>
          <button onClick={onClose} className="clear-btn">
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="demo-video-container">
          {videoUrl ? (
            <iframe 
              src={videoUrl} 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <div className="therapist-empty">
              No reference video available for this exercise.
            </div>
          )}
        </div>
        <div className="diagnosis-block">
          <div className="diagnosis-status">Key Clinical Points</div>
          <p className="diagnosis-advice">
            {ROM_CONFIG[exerciseId]?.clinicalAdvice}
          </p>
        </div>
      </div>
    </div>
  );
}
