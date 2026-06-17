import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';

function InstructorDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const assignmentsRes = await API.get('/assignments');
      setAssignments(assignmentsRes.data);

      const submissionsRes = await API.get('/submissions');
      setSubmissions(submissionsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    try {
      const assignmentData = {
        title: newTitle,
        description: newDescription,
        deadline: newDueDate
      };

      await API.post('/assignments', assignmentData);
      setMsg('Assignment created successfully!');
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      fetchDashboardData();
    } catch (error) {
      setErr('Failed to create assignment. Please try again.');
    }
  };

  const handleEvaluateSubmission = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    try {
      const evaluationData = {
        grade: grade,
        feedback: feedback,
        status: 'Evaluated'
      };

      await API.put(`/submissions/${selectedSubmission.id}/evaluate`, evaluationData);
      setMsg(`Submission #${selectedSubmission.id} evaluated successfully!`);
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      fetchDashboardData();
    } catch (error) {
      setErr('Failed to submit evaluation. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Instructor Dashboard</h1>
        <p className="text-gray-600">Create assignments, track student progress, and grade project submissions.</p>
      </div>

      {msg && <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">{msg}</div>}
      {err && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{err}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-indigo-600">Create New Assignment</h2>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Final Fullstack Project"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Prompt *</label>
              <textarea
                rows="3"
                required
                placeholder="Detail the instructions and rules here..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Deadline Date *</label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-2 rounded-lg transition"
            >
              Publish Assignment
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">Student Submissions Grid</h2>

            {submissions.length === 0 ? (
              <p className="text-gray-500 text-sm">No submissions found.</p>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold border-b border-gray-200">
                    <th className="p-3">Student</th>
                    <th className="p-3">Assignment</th>
                    <th className="p-3">Links</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                  {submissions.map((sub) => (
                    <tr key={sub?.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-medium">{sub?.student?.username}</td>
                      <td className="p-3 text-gray-500">{sub?.assignment?.title}</td>
                      <td className="p-3 space-x-2">
                        <a href={sub?.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">GitHub</a>
                        {sub?.deployedUrl && (
                          <a href={sub?.deployedUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Live</a>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          sub?.status === 'Evaluated' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sub?.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-gray-800">{sub?.grade || '-'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => { setSelectedSubmission(sub); setGrade(sub?.grade || ''); setFeedback(sub?.feedback || ''); }}
                          className="text-xs bg-gray-800 hover:bg-gray-900 text-white px-3 py-1 rounded transition"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {selectedSubmission && (
            <div className="bg-gray-50 border border-indigo-100 p-6 rounded-xl shadow-inner space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">
                  Evaluating Submission from <span className="text-indigo-600">{selectedSubmission?.student?.username}</span>
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-sm"
                >
                  ✕ Close Panel
                </button>
              </div>

              <form onSubmit={handleEvaluateSubmission} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numeric / Text Grade *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., A, B+, 95, 100"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Written Feedback *</label>
                  <input
                    type="text"
                    required
                    placeholder="Provide notes, suggestions, or critique..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold p-2.5 rounded-lg transition"
                  >
                    Submit Grade & Set to Evaluated
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default InstructorDashboard;