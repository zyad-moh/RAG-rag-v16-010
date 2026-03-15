import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CVAnalyzer from './pages/CVAnalyzer';
import JobMatching from './pages/JobMatching';
import SkillGap from './pages/SkillGap';
import ResumeOptimizer from './pages/ResumeOptimizer';
import LearningProjects from './pages/LearningProjects';

import './styles.css';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <h2>CareerAI</h2>
          <nav>
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/cv-analyzer">CV Analyzer</NavLink>
            <NavLink to="/job-matching">Job Matching</NavLink>
            <NavLink to="/skill-gap">Skill Gap Detector</NavLink>
            <NavLink to="/resume-optimizer">Resume Optimizer</NavLink>
            <NavLink to="/learning-projects">Learning & Projects</NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cv-analyzer" element={<CVAnalyzer />} />
            <Route path="/job-matching" element={<JobMatching />} />
            <Route path="/skill-gap" element={<SkillGap />} />
            <Route path="/resume-optimizer" element={<ResumeOptimizer />} />
            <Route path="/learning-projects" element={<LearningProjects />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
