import React, { useState } from "react";
import axios from "axios";

export default function SkillGap() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const calcSkill = async () => {
    try {
      setLoading(true);
      const skills = JSON.parse(localStorage.getItem("skills"));
      const resp = await axios.post(
        "http://localhost:5000/api/v1/nlp/index/skill_gap/1",
        {
          user_skill:skills
        }
      );
      localStorage.setItem("gap_skills", JSON.stringify(resp.data.answer));
      setData(resp.data.answer);
      console.log("Process finished", resp.data);

    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "50px",
      fontFamily: "Arial"
    }}>

      <h1>Skill Gap Detector</h1>

      <button
        onClick={calcSkill}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Calc Skill
      </button>

      {loading && <p>Calculating...</p>}

      {data && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            width: "400px",
            background: "#f9f9f9"
          }}
        >
          <h3>Result:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

    </div>
  );
}