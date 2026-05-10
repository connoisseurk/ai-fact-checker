import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a PDF");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);

    try {
      setLoading(true);

      const response = await fetch("https://ai-fact-checker-1-zle3.onrender.com/api/factcheck", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      setResults(data.results || []);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Verified") return "#00ff99";
    if (status === "False") return "#ff4d4d";
    if (status === "Inaccurate") return "#ffb347";
    return "#cccccc";
  };

  return (
    <div className="app">
      <div className="container">
        <h1>AI Powered Fact Checker</h1>

        <p className="subtitle">
          Upload documents and verify facts using AI + Live Web Search
        </p>

        <div className="uploadBox">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button onClick={handleUpload}>
            Check Facts
          </button>
        </div>

        {loading && (
          <div className="loading">
            Analyzing Facts...
          </div>
        )}

        <div className="results">
          {results.map((item, index) => (
            <div className="card" key={index}>
              <h3>
                {typeof item.claim === "object"
                  ? JSON.stringify(item.claim)
                  : item.claim}
              </h3>

              <span
                className="status"
                style={{
                  backgroundColor: getStatusColor(item.status)
                }}
              >
                {typeof item.status === "object"
                  ? JSON.stringify(item.status)
                  : item.status}
              </span>

              <p>
                <strong>Explanation:</strong>
                <br />
                {typeof item.explanation === "object"
                  ? JSON.stringify(item.explanation)
                  : item.explanation}
              </p>

              <p>
                <strong>Real Fact:</strong>
                <br />
                {typeof item.real_fact === "object"
                  ? JSON.stringify(item.real_fact)
                  : item.real_fact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;