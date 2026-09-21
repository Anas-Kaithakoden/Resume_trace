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
        <label className="section-label">Upload Resume</label>
        <label className="upload-box">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(event) => setResume(event.target.files?.[0] ?? null)}
          />
          <span>{resume ? resume.name : 'Drop PDF / DOCX or choose file'}</span>
        </label>
      </div>

      <div className="form-section">
        <label className="section-label">Model</label>
        <select
          className="job-description"
          value={selectedModel}
          onChange={(event) =>
            setSelectedModel(
              event.target.value as 'gemini' | 'openrouter' | 'groq',
            )
          }
        >
          <option value="gemini">Gemini 2.5 Flash</option>
          <option value="openrouter">OpenRouter (DeepSeek / free)</option>
          <option value="groq">Groq (Llama 3.3)</option>
        </select>
      </div>

      <div className="form-section">
        <label className="section-label">Job Description</label>
        <textarea
          className="job-description"
          placeholder="Paste JD here..."
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
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>
    </div>
  );
}
