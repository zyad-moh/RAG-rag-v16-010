import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function JobMatching() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({});

  const fetchJobs = async () => {
    const resp = await axios.get('/api/jobs', { params: filters });
    setJobs(resp.data);
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  return (
    <div>
      <h1>Job Matching Engine</h1>
      <div className="filters">
        {/* simple filter inputs */}
        <input
          placeholder="Search..."
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
        />
        <button onClick={fetchJobs}>Apply Filters</button>
      </div>
      <div className="job-list">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <h2>{job.title}</h2>
            <p>{job.company}</p>
            <p>Match: {job.match}%</p>
            <button>View Details</button>
            <button>Apply Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
