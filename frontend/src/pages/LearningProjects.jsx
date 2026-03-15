import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function LearningProjects() {
  const [recommendation, setRecommendation] = useState("");
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [gapSkills, setGapSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

  
    const storedGap = localStorage.getItem("gap_skills");

    if (storedGap) {
      setGapSkills(JSON.parse(storedGap));
    }

  }, []);


  const getRecommendations = async () => {

    try {

      setLoading(true);

      const storedGap = JSON.parse(localStorage.getItem("gap_skills"));

      const resp = await axios.post(
        "http://localhost:5000/api/v1/nlp/index/learning_recommendtion/1",
        {
          user_gap_skill: storedGap
        }
      );

      console.log("Recommendation response:", resp.data);

      setRecommendation(resp.data.answer);

    } catch (error) {

      console.error("Error:", error);

    } finally {

      setLoading(false);

    }

  };


  return (
    <div>

      <h1>Learning & Project Recommendations</h1>

      {/* Skill Gap Section */}
      <h2>Skill Gap (What you should learn)</h2>

      <ul>
        {gapSkills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>


      {}
      <button onClick={getRecommendations}>
        Get Learning Recommendations
      </button>

      {loading && <p>Loading recommendations...</p>}


      <pre>
      {recommendation}
      </pre>


    </div>
  );
}