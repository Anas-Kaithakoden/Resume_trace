'use client';

import { useState } from 'react';

export type MatchingSkill = {
  skill: string;
  evidence?: string;
};

export type MissingSkill = {
  skill: string;
  importance?: string;
};

export type WeakArea = {
  area: string;
  reason?: string;
};

export type BulletImprovement = {
  original: string;
  suggested: string;
  reason: string;
};

export type AnalysisData = {
  overall_match: number;
  matching_skills: MatchingSkill[];
  missing_skills: MissingSkill[];
  weak_areas: WeakArea[];
  ats_issues: string[];
  bullet_improvements: BulletImprovement[];
  recommendations: string[];
  resume_text?: string | null;
};

type AnalysisResultsProps = {
  analysis: AnalysisData;
  onNewAnalysis?: () => void;
};

export default function AnalysisResults({ analysis, onNewAnalysis }: AnalysisResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'skills' | 'bullets' | 'ats'>('all');

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Determine match rating description
  const getMatchLabel = (score: number) => {
    if (score >= 80) return 'Strong Alignment';
    if (score >= 60) return 'Moderate Alignment';
    if (score >= 40) return 'Partial Match — Needs Work';
    return 'Low Match — Significant Gaps';
  };

  return (
    <div className="analysis-panel">
      {/* Overview Score Card */}
      <div className="score-card">
        <div className="score-content">
          <span className="score-subtitle">Match Rating</span>
          <div className="score-number-row">
            <span className="score-number">{analysis.overall_match}%</span>
            <span className="score-badge">{getMatchLabel(analysis.overall_match)}</span>
          </div>
          <div className="score-track">
            <div
              className="score-fill"
              style={{ width: `${Math.min(100, Math.max(0, analysis.overall_match))}%` }}
            />
          </div>
        </div>
        {onNewAnalysis && (
          <button type="button" className="score-reset-btn" onClick={onNewAnalysis}>
            New Upload
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tab-row">
        <button
          type="button"
          className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Insights
        </button>
        <button
          type="button"
          className={`filter-tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills ({analysis.matching_skills.length + analysis.missing_skills.length})
        </button>
        <button
          type="button"
          className={`filter-tab ${activeTab === 'bullets' ? 'active' : ''}`}
          onClick={() => setActiveTab('bullets')}
        >
          Bullet Edits ({analysis.bullet_improvements.length})
        </button>
        <button
          type="button"
          className={`filter-tab ${activeTab === 'ats' ? 'active' : ''}`}
          onClick={() => setActiveTab('ats')}
        >
          ATS & Weaknesses ({analysis.ats_issues.length + analysis.weak_areas.length})
        </button>
      </div>

      <div className="analysis-scroll-area">
        {/* Bullet Improvements Section (Prominent like in reference photo) */}
        {(activeTab === 'all' || activeTab === 'bullets') && (
          <section className="analysis-section">
            <div className="section-header-row">
              <h2 className="section-title">Bullet-Point Improvements</h2>
              <span className="count-tag">{analysis.bullet_improvements.length} suggestions</span>
            </div>

            {analysis.bullet_improvements.length > 0 ? (
              <div className="bullet-cards-stack">
                {analysis.bullet_improvements.map((item, index) => (
                  <div className="bullet-edit-card" key={index}>
                    <div className="bullet-edit-top">
                      <span className="bullet-pill">Suggestion #{index + 1}</span>
                      <button
                        type="button"
                        className="copy-bullet-btn"
                        onClick={() => handleCopyBullet(item.suggested, index)}
                        title="Copy suggested text"
                      >
                        {copiedIndex === index ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="bullet-comparison">
                      <div className="bullet-original-box">
                        <span className="diff-label">Current Resume</span>
                        <p>{item.original}</p>
                      </div>
                      <div className="bullet-suggested-box">
                        <span className="diff-label">Recommended Version</span>
                        <p>{item.suggested}</p>
                      </div>
                    </div>

                    {item.reason && (
                      <div className="bullet-reason-box">
                        <span className="reason-label">Rationale:</span> {item.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No bullet improvements generated.</p>
            )}
          </section>
        )}

        {/* Skills Section */}
        {(activeTab === 'all' || activeTab === 'skills') && (
          <>
            {/* Matching Skills */}
            <section className="analysis-section">
              <div className="section-header-row">
                <h2 className="section-title">Matching Skills & Evidence</h2>
                <span className="count-tag">{analysis.matching_skills.length} matched</span>
              </div>

              {analysis.matching_skills.length > 0 ? (
                <div className="skills-grid">
                  {analysis.matching_skills.map((item, index) => (
                    <div className="skill-card matched" key={index}>
                      <div className="skill-title-row">
                        <span className="status-dot-matched" />
                        <strong>{item.skill}</strong>
                      </div>
                      {item.evidence && <p className="skill-evidence">"{item.evidence}"</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No matching skills detected.</p>
              )}
            </section>

            {/* Missing Skills */}
            <section className="analysis-section">
              <div className="section-header-row">
                <h2 className="section-title">Missing Requirements</h2>
                <span className="count-tag">{analysis.missing_skills.length} missing</span>
              </div>

              {analysis.missing_skills.length > 0 ? (
                <div className="skills-grid">
                  {analysis.missing_skills.map((item, index) => {
                    const importance = item.importance?.toLowerCase() || 'medium';
                    return (
                      <div className="skill-card missing" key={index}>
                        <div className="skill-title-row">
                          <span className="status-dot-missing" />
                          <strong>{item.skill}</strong>
                          <span className={`importance-tag tag-${importance}`}>{importance}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-message">No missing skills flagged.</p>
              )}
            </section>
          </>
        )}

        {/* Weak Areas & ATS Issues */}
        {(activeTab === 'all' || activeTab === 'ats') && (
          <>
            <section className="analysis-section">
              <div className="section-header-row">
                <h2 className="section-title">Weak or Under-Supported Areas</h2>
                <span className="count-tag">{analysis.weak_areas.length}</span>
              </div>

              {analysis.weak_areas.length > 0 ? (
                <ul className="monochrome-list">
                  {analysis.weak_areas.map((item, index) => (
                    <li className="monochrome-list-item" key={index}>
                      <strong>{item.area}</strong>
                      {item.reason && <p className="item-detail">{item.reason}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-message">No weak areas identified.</p>
              )}
            </section>

            <section className="analysis-section">
              <div className="section-header-row">
                <h2 className="section-title">ATS Scanning Observations</h2>
                <span className="count-tag">{analysis.ats_issues.length}</span>
              </div>

              {analysis.ats_issues.length > 0 ? (
                <ul className="monochrome-list">
                  {analysis.ats_issues.map((issue, index) => (
                    <li className="monochrome-list-item warning" key={index}>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-message">No ATS issues found.</p>
              )}
            </section>
          </>
        )}

        {/* Recommendations */}
        {activeTab === 'all' && (
          <section className="analysis-section">
            <div className="section-header-row">
              <h2 className="section-title">Strategic Action Items</h2>
              <span className="count-tag">{analysis.recommendations.length}</span>
            </div>

            {analysis.recommendations.length > 0 ? (
              <ol className="recommendations-list">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="recommendation-item">
                    <span className="rec-number">{index + 1}</span>
                    <span className="rec-text">{rec}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="empty-message">No specific recommendations provided.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
