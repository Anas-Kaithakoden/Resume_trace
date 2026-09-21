'use client';

import type { Dispatch, SetStateAction } from 'react';

type ResumeFormProps = {
  resume: File | null;
  setResume: Dispatch<SetStateAction<File | null>>;
  jobDescription: string;
  setJobDescription: Dispatch<SetStateAction<string>>;
  onAnalyze: () => void;
  loading: boolean;
};

export default function ResumeForm({
  resume,
  setResume,
  jobDescription,
  setJobDescription,
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
