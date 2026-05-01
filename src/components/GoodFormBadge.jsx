export default function GoodFormBadge({ isCorrectForm }) {
  if (!isCorrectForm) return null;
  return (
    <div className="good-form-badge">
      <span className="material-icons">check_circle</span>
      Excellent Form
    </div>
  );
}
