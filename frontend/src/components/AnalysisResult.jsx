// AnalysisResult.jsx
function AnalysisResult({ analysis }) {
  if (!analysis) {
    return null;
  }

  return (
    <div className="results">

      <div className="match-card">
        <span>Overall Match</span>
        <strong>{analysis.overall_match}%</strong>
      </div>

      <section className="result-section">
        <h2>Matching Skills</h2>

        {analysis.matching_skills.length > 0 ? (
          <ul>
            {analysis.matching_skills.map((item, index) => (
              <li key={index}>
                <strong>{item.skill}</strong>
                {item.evidence && (
                  <span className="evidence">
                    — {item.evidence}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">No matching skills found.</p>
        )}
      </section>

      <section className="result-section">
        <h2>Missing Skills</h2>

        {analysis.missing_skills.length > 0 ? (
          <ul>
            {analysis.missing_skills.map((item, index) => (
              <li key={index}>
                <strong>{item.skill}</strong>
                <span className="importance">
                  ({item.importance})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">No missing skills found.</p>
        )}
      </section>

      <section className="result-section">
        <h2>Weak Areas</h2>

        {analysis.weak_areas.length > 0 ? (
          <ul>
            {analysis.weak_areas.map((item, index) => (
              <li key={index}>
                <strong>{item.area}</strong>
                {item.reason && (
                  <span className="evidence">
                    — {item.reason}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">No weak areas found.</p>
        )}
      </section>

      <section className="result-section">
        <h2>ATS Issues</h2>

        {analysis.ats_issues.length > 0 ? (
          <ul>
            {analysis.ats_issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        ) : (
          <p className="empty">No ATS issues found.</p>
        )}
      </section>

      <section className="result-section">
        <h2>Bullet Improvements</h2>

        {analysis.bullet_improvements.length > 0 ? (
          analysis.bullet_improvements.map((item, index) => (
            <div className="bullet-improvement" key={index}>
              <div>
                <span className="sub-label">Original</span>
                <p>{item.original}</p>
              </div>

              <div>
                <span className="sub-label">Suggested</span>
                <p>{item.suggested}</p>
              </div>

              <div>
                <span className="sub-label">Reason</span>
                <p>{item.reason}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="empty">No bullet improvements.</p>
        )}
      </section>

      <section className="result-section">
        <h2>Recommendations</h2>

        {analysis.recommendations.length > 0 ? (
          <ul>
            {analysis.recommendations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="empty">No recommendations.</p>
        )}
      </section>

    </div>
  );
}

export default AnalysisResult;

