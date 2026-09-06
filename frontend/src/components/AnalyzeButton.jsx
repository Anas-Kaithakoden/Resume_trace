// AnalyzeButton.jsx
function AnalyzeButton({ onAnalyze, loading, disabled }) {
  return (
    <button
      className="analyze-button"
      onClick={onAnalyze}
      disabled={disabled || loading}
    >
      {loading ? "Analyzing..." : "Analyze Resume"}
    </button>
  );
}

export default AnalyzeButton;

