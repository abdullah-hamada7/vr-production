export default function ErrorOverlay({ feedback }) {
  if (feedback.type !== 'error') return null;
  return (
    <div className="error-overlay">
      <div className="error-text-en">{feedback.textEn}</div>
    </div>
  );
}
