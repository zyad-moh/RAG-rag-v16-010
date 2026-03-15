import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ResumeOptimizer() {
  const [analysis, setAnalysis] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('resume', file);
    axios.post('/api/resume/optimize', form).then((resp) => setAnalysis(resp.data));
  };

  return (
    <div>
      <h1>Smart Resume Optimizer</h1>
      <input type="file" onChange={handleFile} />
      {analysis && <pre>{JSON.stringify(analysis, null, 2)}</pre>}
    </div>
  );
}
