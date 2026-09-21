'use client';

import { useState } from 'react';

type ResumeDocumentViewerProps = {
  resumeFile: File | null;
  resumeText: string | null;
  pdfUrl: string | null;
};

export default function ResumeDocumentViewer({
  resumeFile,
  resumeText,
  pdfUrl,
}: ResumeDocumentViewerProps) {
  const isPdf = resumeFile?.name.toLowerCase().endsWith('.pdf') || resumeFile?.type === 'application/pdf';
  const [viewMode, setViewMode] = useState<'document' | 'pdf'>(isPdf && pdfUrl ? 'document' : 'document');
  const [fontSize, setFontSize] = useState<number>(14);

  // Helper to structure raw resume text into sections and lines for clean reading
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];

    // Common resume section keywords to highlight
    const sectionKeywords = [
      'EXPERIENCE',
      'WORK EXPERIENCE',
      'EMPLOYMENT HISTORY',
      'EDUCATION',
      'SKILLS',
      'TECHNICAL SKILLS',
      'PROJECTS',
      'CERTIFICATIONS',
      'AWARDS',
      'PUBLICATIONS',
      'SUMMARY',
      'PROFESSIONAL SUMMARY',
      'OBJECTIVE',
      'CONTACT',
    ];

    let inBulletList = false;
    let bulletBuffer: string[] = [];

    const flushBullets = (keyIndex: number) => {
      if (bulletBuffer.length > 0) {
        elements.push(
          <ul key={`bullets-${keyIndex}`} className="resume-paper-bullet-list">
            {bulletBuffer.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        );
        bulletBuffer = [];
      }
      inBulletList = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushBullets(idx);
        return;
      }

      // Check if this line looks like a major section heading
      const cleanUpper = trimmed.toUpperCase().replace(/[^A-Z\s]/g, '').trim();
      const isHeading =
        sectionKeywords.includes(cleanUpper) ||
        (trimmed.length < 35 && trimmed === trimmed.toUpperCase() && /^[A-Z\s&/]{3,}$/.test(trimmed));

      if (isHeading) {
        flushBullets(idx);
        elements.push(
          <h3 key={`heading-${idx}`} className="resume-paper-heading">
            {trimmed}
          </h3>
        );
        return;
      }

      // Check if bullet point
      const isBullet =
        trimmed.startsWith('•') ||
        trimmed.startsWith('- ') ||
        trimmed.startsWith('* ') ||
        trimmed.startsWith('– ') ||
        trimmed.startsWith('— ');

      if (isBullet) {
        inBulletList = true;
        const cleanedBullet = trimmed.replace(/^[•\-*–—]\s*/, '');
        bulletBuffer.push(cleanedBullet);
        return;
      }

      // If we were in bullets and hit a regular line, flush
      if (inBulletList) {
        flushBullets(idx);
      }

      // First few lines are often candidate name / contact info
      if (idx < 4 && (trimmed.includes('@') || trimmed.includes('|') || trimmed.includes('•') || trimmed.includes('linkedin.com') || trimmed.includes('github.com'))) {
        elements.push(
          <p key={`contact-${idx}`} className="resume-paper-contact">
            {trimmed}
          </p>
        );
        return;
      }

      if (idx === 0 && trimmed.length < 40) {
        elements.push(
          <h1 key={`name-${idx}`} className="resume-paper-name">
            {trimmed}
          </h1>
        );
        return;
      }

      // Regular paragraph or job sub-heading
      elements.push(
        <p key={`line-${idx}`} className="resume-paper-line">
          {trimmed}
        </p>
      );
    });

    flushBullets(lines.length);

    return elements;
  };

  return (
    <div className="resume-viewer-card">
      <div className="resume-viewer-header">
        <div className="resume-file-info">
          <span className="resume-badge">{resumeFile?.name.split('.').pop()?.toUpperCase() || 'FILE'}</span>
          <span className="resume-filename" title={resumeFile?.name || 'Uploaded Resume'}>
            {resumeFile?.name || 'Uploaded Resume'}
          </span>
        </div>

        <div className="resume-viewer-actions">
          {isPdf && pdfUrl && (
            <div className="view-toggle-group">
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'document' ? 'active' : ''}`}
                onClick={() => setViewMode('document')}
              >
                Document View
              </button>
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'pdf' ? 'active' : ''}`}
                onClick={() => setViewMode('pdf')}
              >
                Original PDF
              </button>
            </div>
          )}

          {viewMode === 'document' && (
            <div className="font-zoom-controls">
              <button
                type="button"
                className="zoom-btn"
                onClick={() => setFontSize((f) => Math.max(11, f - 1))}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                className="zoom-btn"
                onClick={() => setFontSize((f) => Math.min(18, f + 1))}
                title="Increase font size"
              >
                A+
              </button>
            </div>
          )}

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="open-file-btn"
              title="Open file in new tab"
            >
              Open File ↗
            </a>
          )}
        </div>
      </div>

      <div className="resume-viewer-body">
        {viewMode === 'pdf' && pdfUrl ? (
          <div className="resume-pdf-container">
            <iframe
              src={pdfUrl}
              title="Uploaded Resume PDF Preview"
              className="resume-pdf-frame"
            />
          </div>
        ) : (
          <div className="resume-paper-wrapper">
            <div className="resume-paper" style={{ fontSize: `${fontSize}px` }}>
              {resumeText ? (
                renderFormattedText(resumeText)
              ) : (
                <div className="resume-paper-empty">
                  <p>Resume text could not be extracted or is empty.</p>
                  {pdfUrl && (
                    <button
                      type="button"
                      className="fallback-switch-btn"
                      onClick={() => setViewMode('pdf')}
                    >
                      Switch to Original PDF View
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
