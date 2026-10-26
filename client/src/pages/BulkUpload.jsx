
import { useState } from "react";
import { Link } from "react-router-dom";
import FileUploader from "../components/FileUploader";

export default function BulkUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleUpload(file) {
    setUploading(true);
    setError("");
    setResult(null);

    try {
      const response = await onUpload(file);
      setResult(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page-content narrow-page">
      <div className="section-heading page-heading">
        <div>
          <span className="eyebrow">IMPORT CAMPAIGNS</span>
          <h2>Bulk upload</h2>
          <p>Import multiple ads from one JSON or CSV file.</p>
        </div>
      </div>

      <section className="panel upload-panel">
        <div className="upload-intro">
          <span className="large-upload-icon">⇧</span>
          <h2>Import your ad library</h2>
          <p>Choose a file containing the ads you want to save in your database.</p>
        </div>

        <FileUploader onUpload={handleUpload} uploading={uploading} />

        {error && <div className="notice notice-error">{error}</div>}

        {result && (
          <div className="upload-result">
            <h3>Import finished</h3>
            <div className="result-stats">
              <div><strong>{result.insertedCount ?? 0}</strong><span>Inserted</span></div>
              <div><strong>{result.skippedCount ?? 0}</strong><span>Skipped</span></div>
            </div>
            <p>{result.message || "The upload request completed."}</p>
            {Array.isArray(result.errors) && result.errors.length > 0 && (
              <ul className="import-errors">
                {result.errors.slice(0, 10).map((item, index) => (
                  <li key={`${index}-${item}`}>{String(item)}</li>
                ))}
              </ul>
            )}
            <Link to="/ads" className="button button-primary">View ads library</Link>
          </div>
        )}
      </section>

      <section className="panel format-panel">
        <h3>Required file format</h3>
        <p>Every ad must include a valid public image URL.</p>

        <h4>JSON example</h4>
        <pre className="code-sample">{`[
  {
    "title": "Summer Campaign",
    "description": "A sample advertisement",
    "imageUrl": "https://example.com/ad.jpg",
    "dimensions": "1080x1920"
  }
]`}</pre>

        <h4>CSV column names</h4>
        <code className="csv-sample">title,description,imageUrl,dimensions</code>
        <p className="muted-note">The image URLs should point to publicly accessible images, such as your hosted Hugging Face dataset images.</p>
      </section>
    </div>
  );
}
