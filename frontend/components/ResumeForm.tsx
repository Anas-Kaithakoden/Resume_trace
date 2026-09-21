'use client';

import type { Dispatch, SetStateAction } from 'react';

type ResumeFormProps = {
  resume: File | null;
  setResume: Dispatch<SetStateAction<File | null>>;
  jobDescription: string;
  setJobDescription: Dispatch<SetStateAction<string>>;
  selectedModel: 'gemini' | 'openrouter' | 'groq';
  setSelectedModel: Dispatch<SetStateAction<'gemini' | 'openrouter' | 'groq'>>;
  onAnalyze: () => void;
  loading: boolean;
};

export default function ResumeForm({
  resume,
  setResume,
  jobDescription,
  setJobDescription,
  selectedModel,
  setSelectedModel,
  onAnalyze,
  loading,
}: ResumeFormProps) {
  return (
    <div className="input-card">
      <div className="form-section">
        <label className="section-label">Upload Resume (PDF or DOCX)</label>
        <label className={`upload-box ${resume ? 'has-file' : ''}`}>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(event) => setResume(event.target.files?.[0] ?? null)}
          />
          <div className="upload-box-content">
            <span className="upload-icon">📄</span>
            <div className="upload-text-group">
              <span className="upload-title">
                {resume ? resume.name : 'Click to select or drag and drop your resume'}
              </span>
              <span className="upload-subtitle">
                {resume
                  ? `${(resume.size / 1024).toFixed(1)} KB • Click to replace`
                  : 'Supported formats: PDF, DOCX (up to 10MB)'}
              </span>
            </div>
          </div>
        </label>
      </div>

      <div className="form-section">
        <label className="section-label">AI Engine</label>
        <select
          className="model-select"
          value={selectedModel}
          onChange={(event) =>
            setSelectedModel(
              event.target.value as 'gemini' | 'openrouter' | 'groq',
            )
          }
        >
          <option value="gemini">Google Gemini 2.5 Flash</option>
          <option value="openrouter">OpenRouter (DeepSeek / free)</option>
          <option value="groq">Groq (Llama 3.3 70B)</option>
        </select>
      </div>

      <div className="form-section">
        <label className="section-label">Target Job Description</label>
        <textarea
          className="job-description"
          placeholder="Paste the target job description, requirements, or qualifications here..."
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
        />
      </div>

      <div className="button-container">
        <button
          className="analyze-button"
          onClick={onAnalyze}
          disabled={!resume || !jobDescription.trim() || loading}
        >
          {loading ? (
            <span className="button-loading-text">
              <span className="spinner" /> Analyzing Resume...
            </span>
          ) : (
            'Analyze Resume'
          )}
        </button>
      </div>
    </div>
  );
}
