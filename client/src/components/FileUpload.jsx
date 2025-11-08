import React, { useState } from "react";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5010";

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return setMessage("Please select a file");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/docs/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message || "Upload successful!");
    } catch (err) {
      setMessage("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
      <h2 className="text-lg font-semibold mb-4">Upload a Document</h2>
      <input
        type="file"
        onChange={handleFileChange}
        className="w-full border border-gray-300 p-2 rounded mb-3"
      />
      <button
        onClick={handleUpload}
        disabled={isUploading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default FileUpload;
