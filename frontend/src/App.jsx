
import { useState } from "react";

import "./App.css";

import ResumeUpload from "./components/ResumeUpload";
import JobDescription from "./components/JobDescription";
import AnalyzeButton from "./components/AnalyzeButton";
import AnalysisResult from "./components/AnalysisResult";



function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!resume) {
      alert("Please upload a resume.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter a job description.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("resume", resume);
      formData.append("job_description_text", jobDescription);

      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const data = await response.json();

      setAnalysis(data);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while analyzing the resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <main className="container">

        <header className="header">
          <h1>Resume Engineering Assistant</h1>
          <p>
            Analyze your resume against a job description.
          </p>
        </header>

        <div className="input-card">

          <ResumeUpload
            resume={resume}
            setResume={setResume}
          />

          <JobDescription
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
          />

          <div className="button-container">
            <AnalyzeButton
              onAnalyze={handleAnalyze}
              loading={loading}
              disabled={!resume || !jobDescription.trim()}
            />
          </div>

        </div>

        <AnalysisResult analysis={analysis} />

      </main>
    </div>
  );
}

export default App;

