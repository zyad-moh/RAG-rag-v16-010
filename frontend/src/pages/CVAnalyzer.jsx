import React, { useState, useCallback } from 'react';
import axios from 'axios';

export default function CVAnalyzer() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [skills, setSkills] = useState([]);

  const handleFileChange = useCallback((e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setFile(f);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const onDragOver = useCallback((e) => e.preventDefault(), []);

  const analyze = async () => {
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("file", file);

    console.log("Step 1: uploading file");

    const uploadResp = await axios.post(
      "http://localhost:5000/api/v1/data/upload/1",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    console.log("Upload finished", uploadResp.data);

    console.log("Step 2: starting process endpoint");

    const processResp = await axios.post(
      "http://localhost:5000/api/v1/data/process/1",
      {
        chunk_size: 3,
        overlap_size: 2,
        do_reset : 1
      }
    );

    console.log("Process finished", processResp.data);

  } catch (error) {
    console.error("Error happened:", error.response?.data || error.message);
  }
};

  const startAnalyz = async () => {

  const resp = await axios.post(
    "http://localhost:5000/api/v1/nlp/index/answer/1",
    {}
  );
  const parsed = JSON.parse(resp.data.answer);
  localStorage.setItem("skills", JSON.stringify(parsed.skills));
  setSkills(resp.data.answer);   // تخزين المهارات
  console.log("Process finished", resp.data.answer);
};

  return (
    <div className="cv-page">
      <h1 className="page-title">CV Analyzer</h1>
      <p className="page-subtitle">Upload your resume for a detailed analysis of skills, experience, and completeness.</p>

      <div className="cv-grid">
        <div className="upload-card">
          <h3>Upload Your Resume</h3>

          <div
            className={`upload-dropzone ${file ? 'has-file' : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            role="button"
            tabIndex={0}
          >
            {!file ? (
              <div className="upload-empty">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#9aa0ad" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 5 17 10" />
                  <line x1="12" y1="5" x2="12" y2="17" />
                </svg>
                <p>Drag & drop your resume here, or click to browse</p>
                <input className="file-input" type="file" onChange={handleFileChange} />
              </div>
            ) : (
              <div className="upload-file">
                <div className="file-info">
                  <strong>{file.name}</strong>
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <button className="remove-btn" onClick={() => setFile(null)}>Remove</button>
              </div>
            )}
          </div>

          <button className="analyze-btn" onClick={analyze} disabled={!file}>Analyze Resume</button>
          <button className="analyze-btn" onClick={startAnalyz} disabled={!file}>Start Analyz</button>
        </div>

        <div className="result-card">
          {!analysis ? (
            <div className="no-resume">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#c1c6cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="13" x2="12" y2="17" />
                <line x1="12" y1="9" x2="12" y2="11" />
              </svg>
              <h3>No Resume Uploaded</h3>
              <p>Upload your resume on the left to see a comprehensive analysis here.</p>
            </div>
          ) : (
            <div className="analysis-result">
              <h3>Analysis</h3>
              <pre>{JSON.stringify(analysis, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
