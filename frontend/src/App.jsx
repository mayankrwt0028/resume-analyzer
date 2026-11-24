
import { useState } from "react";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    setError("");
    setResult(null);

    if (!file) {
      setResume(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setResume(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5 MB.");
      setResume(null);
      return;
    }

    setResume(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume) {
      setError("Please upload your resume first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("resume", resume);

    try {
      const response = await fetch(
        "http://localhost:5000/api/resume/analyze",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analysis failed");
      }

      setResult(data);

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#d97706";
    return "#dc2626";
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Needs Improvement";
    return "Needs Significant Work";
  };

  const analysis = result?.analysis;
  const layout = result?.layout || [];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">R</div>
          <span>ResumeIQ</span>
        </div>
        <span className="topbar-label">AI Resume Reviewer</span>
      </header>

      <main className="main-container">

        <section className="hero">
          
          <h1>Make your resume <span>stand out.</span></h1>
          <p>
            Get an honest review of your resume, discover areas
            for improvement, and make your next application stronger.
          </p>
        </section>

        {!result && (
          <section className="upload-card">
            <div className="card-heading">
              <h2>Upload your resume</h2>
              <p>Upload a PDF to receive your detailed analysis.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="upload-area">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                />

                <div className="upload-icon">↑</div>

                <h3>
                  {resume ? resume.name : "Choose your resume"}
                </h3>

                <p>
                  {resume
                    ? "PDF selected successfully"
                    : "Click to browse PDF files"}
                </p>

                <span>PDF format · Maximum 5 MB</span>
              </label>

              {resume && (
                <div className="selected-file">
                  <span>📄 {resume.name}</span>
                  <button
                    type="button"
                    onClick={() => setResume(null)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <button
                className="analyze-button"
                type="submit"
                disabled={loading || !resume}
              >
                {loading ? "Analyzing Resume..." : "Analyze My Resume →"}
              </button>

              {loading && (
                <p className="loading-note">
                  AI is reviewing your resume. This may take a little time.
                </p>
              )}
            </form>
          </section>
        )}

        {result && analysis && (
          <section className="results-section">

            <div className="results-header">
              <div>
                <span className="eyebrow">YOUR RESUME REPORT</span>
                <h2>Analysis completed</h2>
                <p>{result.fileName} · {result.totalPages} page(s)</p>
              </div>

              <button
                className="secondary-button"
                onClick={() => {
                  setResult(null);
                  setResume(null);
                  setError("");
                }}
              >
                Analyze another resume
              </button>
            </div>

            <div className="overview-grid">

              <div className="score-card">
                <span className="section-label">OVERALL SCORE</span>

                <div
                  className="score-circle"
                  style={{
                    "--score-color": getScoreColor(analysis.overallScore),
                    "--score": `${Math.min(100, Math.max(0, analysis.overallScore))}%`
                  }}
                >
                  <div>
                    <strong>{analysis.overallScore}</strong>
                    <span>/100</span>
                  </div>
                </div>

                <h3>{getScoreLabel(analysis.overallScore)}</h3>
                <p>{analysis.summary}</p>
              </div>

              <div className="category-card">
                <h3>Category breakdown</h3>

                {(analysis.categories || []).map((item, index) => (
                  <div className="category-item" key={index}>
                    <div className="category-heading">
                      <span>{item.name}</span>
                      <strong>{item.score}/100</strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(0, item.score))}%`,
                          background: getScoreColor(item.score)
                        }}
                      />
                    </div>

                    <p>{item.feedback}</p>
                  </div>
                ))}
              </div>

            </div>

            <div className="report-card">
              <h3>Resume layout analysis</h3>
              <p className="muted">
                Measured PDF layout metrics. These are indicators,
                not a definitive visual design score.
              </p>

              {layout.map((page) => (
                <div className="layout-page" key={page.pageNumber}>
                  <h4>Page {page.pageNumber}</h4>

                  <div className="layout-grid">
                    <div>
                      <span>Left margin</span>
                      <strong>{page.margins.left} pt</strong>
                    </div>
                    <div>
                      <span>Right margin</span>
                      <strong>{page.margins.right} pt</strong>
                    </div>
                    <div>
                      <span>Top margin</span>
                      <strong>{page.margins.top} pt</strong>
                    </div>
                    <div>
                      <span>Bottom margin</span>
                      <strong>{page.margins.bottom} pt</strong>
                    </div>
                    <div>
                      <span>Alignment consistency</span>
                      <strong>{page.alignmentPercentage}%</strong>
                    </div>
                    <div>
                      <span>Average line spacing</span>
                      <strong>{page.averageLineSpacing} pt</strong>
                    </div>
                    <div>
                      <span>Average text height</span>
                      <strong>{page.averageTextHeight} pt</strong>
                    </div>
                    <div>
                      <span>Total text lines</span>
                      <strong>{page.totalLines}</strong>
                    </div>
                  </div>

                  {page.warnings?.length > 0 && (
                    <div className="layout-warnings">
                      <strong>Layout observations</strong>
                      {page.warnings.map((warning, index) => (
                        <p key={index}>• {warning}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="two-column">

              <div className="report-card">
                <h3>What you're doing well</h3>
                {(analysis.strengths || []).map((item, index) => (
                  <div className="list-item strength" key={index}>
                    <span>✓</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>

              <div className="report-card">
                <h3>Areas to improve</h3>
                {(analysis.weaknesses || []).map((item, index) => (
                  <div className="list-item weakness" key={index}>
                    <span>!</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>

            </div>


          </section>
        )}

      </main>

     
    </div>
  );
}

export default App;
