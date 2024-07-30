import { useState } from "react";
import axios from "axios";

const AddClassroom = () => {
  const [classroomCode, setClassroomCode] = useState("");
  const [testCode, setTestCode] = useState("");
  const [questionPaper, setQuestionPaper] = useState("");
  const [markingScheme, setMarkingScheme] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!classroomCode || !testCode || !questionPaper || !markingScheme) {
      setMessage("Please fill in all fields.");
      return;
    }

    const data = {
      classroom_code: classroomCode,
      test_code: testCode,
      question_paper: questionPaper,
      marking_scheme: markingScheme,
    };

    try {
      setSubmitting(true);
      const response = await axios.post(
        "https://paper2digits-ykkbeoj4ga-el.a.run.app/add-classroom",
        data
      );
      setMessage("Classroom added successfully.");
      console.log(response.data);
    } catch (error) {
      setMessage("Failed to add classroom.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Add Classroom
        </h2>
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
          <label
            htmlFor="questionPaper"
            className="block text-sm font-medium text-gray-700"
          >
            Question Paper
          </label>
          <input
            id="questionPaper"
            type="text"
            value={questionPaper}
            onChange={(e) => setQuestionPaper(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="markingScheme"
            className="block text-sm font-medium text-gray-700"
          >
            Marking Scheme
          </label>
          <input
            id="markingScheme"
            type="text"
            value={markingScheme}
            onChange={(e) => setMarkingScheme(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {submitting ? "Submitting..." : "Add Classroom"}
          </button>
        </div>
        {message && (
          <div className="mt-4 text-center text-sm text-gray-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddClassroom;
