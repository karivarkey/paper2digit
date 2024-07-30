import { useState } from "react";
import axios from "axios";

const HomePage = () => {
  const [file, setFile] = useState(null);
  const [classroomCode, setClassroomCode] = useState("");
  const [testCode, setTestCode] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !classroomCode || !testCode) {
      setMessage("Please fill in all fields and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("classroom_code", classroomCode);
    formData.append("test_code", testCode);

    try {
      setUploading(true);
      const response = await axios.post(
        "https://paper2digits-ykkbeoj4ga-el.a.run.app/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("File uploaded successfully.");
      console.log(response.data);
    } catch (error) {
      setMessage("File upload failed.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Upload Your Answer Script
        </h2>
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            Upload PDF
          </label>
          <input
            id="file"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="classroomCode"
            className="block text-sm font-medium text-gray-700"
          >
            Classroom Code
          </label>
          <input
            id="classroomCode"
            type="text"
            value={classroomCode}
            onChange={(e) => setClassroomCode(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="testCode"
            className="block text-sm font-medium text-gray-700"
          >
            Test Code
          </label>
          <input
            id="testCode"
            type="text"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
        {message && (
          <div className="mt-4 text-center text-sm text-gray-700">
            {message}
          </div>
        )}
        <div className="text-center">
          <a className="text-xs text-blue-600 text-center" href="/newClass">
            Create a new classroom
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
