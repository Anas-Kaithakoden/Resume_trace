// ResumeUpload.jsx
function ResumeUpload({ resume, setResume }) {
  function handleFileChange(event) {
    const file = event.target.files[0];

    if (file) {
      setResume(file);
    }
  }

  return (
    <div className="form-section">
      <label className="section-label">Upload Resume</label>

      <label className="upload-box">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />

        <span>
          {resume
            ? resume.name
            : "Drop PDF / DOCX or choose file"}
        </span>
      </label>
    </div>
  );
}

export default ResumeUpload;

