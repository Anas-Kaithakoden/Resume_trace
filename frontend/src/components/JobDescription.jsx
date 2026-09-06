// JobDescription.jsx
function JobDescription({ jobDescription, setJobDescription }) {
  return (
    <div className="form-section">
      <label className="section-label">Job Description</label>

      <textarea
        className="job-description"
        placeholder="Paste JD here..."
        value={jobDescription}
        onChange={(event) => setJobDescription(event.target.value)}
      />
    </div>
  );
}

export default JobDescription;

