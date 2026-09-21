'use client';

import { useState, useEffect } from 'react';
import ResumeForm from '../components/ResumeForm';
import AnalysisResults, { AnalysisData } from '../components/AnalysisResults';
import ResumeDocumentViewer from '../components/ResumeDocumentViewer';

export default function Page() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'openrouter' | 'groq'>('gemini');
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);

  // Manage PDF object URL lifecycle
  useEffect(() => {
    if (!resume) {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      return;
    }

    if (resume.name.toLowerCase().endsWith('.pdf') || resume.type === 'application/pdf') {
      const url = URL.createObjectURL(resume);
      setPdfUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    }
  }, [resume]);

  async function handleAnalyze() {
    if (!resume) {
      alert('Please upload a resume file (PDF or DOCX).');
      return;
    }

    if (!jobDescription.trim()) {
      alert('Please provide a job description.');
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
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to analyze resume');
      }

      const data: AnalysisData = await response.json();
      setAnalysis(data);
      setShowEditDrawer(false);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Something went wrong while analyzing the resume.');
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    setAnalysis(null);
    setShowEditDrawer(false);
  };

  return (
    <main className="app-shell">
      {/* Top Navigation Bar */}
      <header className="app-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-title">Resume_trace</span>
            <span className="brand-tag">Engineering Assistant</span>
          </div>

          {analysis && (
            <div className="navbar-center-info">
              <span className="navbar-file-label">
                <span className="doc-icon">📄</span>
                {resume?.name}
              </span>
              <span className="navbar-score-badge">
                Match: <strong>{analysis.overall_match}%</strong>
              </span>
            </div>
          )}

          <div className="navbar-actions">
            {analysis ? (
              <>
                <button
                  type="button"
                  className="nav-btn secondary"
                  onClick={() => setShowEditDrawer(!showEditDrawer)}
                >
                  {showEditDrawer ? 'Close Editor' : 'Edit Input / Model'}
                </button>
                <button
                  type="button"
                  className="nav-btn primary"
                  onClick={handleReset}
                >
                  + New Analysis
                </button>
              </>
            ) : (
              <span className="navbar-hint">Upload resume & JD to start</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {!analysis ? (
        /* Initial Upload Form View */
        <div className="landing-container">
          <div className="landing-hero">
            <h1>Resume Engineering Assistant</h1>
            <p>
              Analyze your resume evidence directly against job requirements.
              Receive grounded match scores, missing qualification alerts, ATS feedback, and tailored bullet-point recommendations.
            </p>
          </div>

          <div className="landing-form-wrapper">
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
          </div>
        </div>
      ) : (
        /* Two-Column Side-by-Side Split Workspace */
        <div className="workspace-container">
          {/* Optional slide-down or overlay drawer to edit inputs */}
          {showEditDrawer && (
            <div className="drawer-overlay" onClick={() => setShowEditDrawer(false)}>
              <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
                <div className="drawer-header">
                  <h3>Modify Inputs & Re-run Analysis</h3>
                  <button
                    type="button"
                    className="drawer-close-btn"
                    onClick={() => setShowEditDrawer(false)}
                  >
                    ✕
                  </button>
                </div>
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
              </div>
            </div>
          )}

          <div className="split-workspace">
            {/* Left Panel: Analyzed Data */}
            <section className="workspace-panel left-panel">
              <div className="panel-inner">
                <div className="panel-title-bar">
                  <h2>Analysis & Tailoring Suggestions</h2>
                  <span className="panel-status">Grounded Insights</span>
                </div>
                <AnalysisResults
                  analysis={analysis}
                  onNewAnalysis={() => setShowEditDrawer(true)}
                />
              </div>
            </section>

            {/* Right Panel: Uploaded Resume in Document Form */}
            <section className="workspace-panel right-panel">
              <div className="panel-inner">
                <div className="panel-title-bar">
                  <h2>Candidate Resume Document</h2>
                  <span className="panel-status">File Preview</span>
                </div>
                <ResumeDocumentViewer
                  resumeFile={resume}
                  resumeText={analysis.resume_text || null}
                  pdfUrl={pdfUrl}
                />
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
