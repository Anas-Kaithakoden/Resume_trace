'use client';

import { useState } from 'react';

import ResumeForm from '../components/ResumeForm';

type MatchingSkill = {
  skill: string;
  evidence?: string;
};

type MissingSkill = {
  skill: string;
  importance?: string;
};

type WeakArea = {
  area: string;
  reason?: string;
};

type BulletImprovement = {
  original: string;
  suggested: string;
  reason: string;
};

type AnalysisData = {
  overall_match: number;
  matching_skills: MatchingSkill[];
  missing_skills: MissingSkill[];
  weak_areas: WeakArea[];
  ats_issues: string[];
  bullet_improvements: BulletImprovement[];
  recommendations: string[];
};

export default function Page() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'openrouter' | 'groq'>('gemini');
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!resume) {
      alert('Please upload a resume.');
      return;
    }

    if (!jobDescription.trim()) {
      alert('Please enter a job description.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('job_description_text', jobDescription);
      formData.append('model', selectedModel);

      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data: AnalysisData = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error(error);
      alert('Something went wrong while analyzing the resume.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <div className="container">
        <header className="header">
          <h1>Resume Engineering Assistant</h1>
          <p>Analyze your resume against a job description.</p>
        </header>

        <ResumeForm
          resume={resume}
          setResume={setResume}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          onAnalyze={handleAnalyze}
          loading={loading}
        />

        {analysis && (
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
                      {item.evidence && <span className="evidence"> — {item.evidence}</span>}
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
                      <span className="importance"> ({item.importance})</span>
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
                      {item.reason && <span className="evidence"> — {item.reason}</span>}
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
        )}
      </div>
    </main>
  );
}
