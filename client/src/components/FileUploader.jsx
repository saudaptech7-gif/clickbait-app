
import { useRef, useState } from "react";

export default function FileUploader({ onUpload, uploading = false }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  function selectFile(selectedFile) {
    setError("");

    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop().toLowerCase();

    if (!["json", "csv"].includes(extension)) {
      setError("Please select a JSON or CSV file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be 10 MB or less.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    setError("");

    try {
      await onUpload(file);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (uploadError) {
      setError(uploadError.message || "Upload failed.");
    }
  }

  return (
    <div className="uploader">
      <button
        type="button"
        className="upload-dropzone"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <span className="upload-icon">⇧</span>
        <strong>Choose a JSON or CSV file</strong>
        <span>Click to browse your computer</span>
        <small>Maximum file size: 10 MB</small>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".json,.csv,application/json,text/csv"
        className="visually-hidden"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />

      {file && (
        <div className="selected-file">
          <span className="file-icon">▤</span>
          <div>
            <strong>{file.name}</strong>
            <small>{(file.size / 1024).toFixed(1)} KB</small>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            Remove
          </button>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <button
        type="button"
        className="button button-primary upload-submit"
        disabled={!file || uploading}
        onClick={handleUpload}
      >
        {uploading ? "Uploading..." : "Upload ads"}
      </button>
    </div>
  );
}
