import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';

function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [githubUrl, setGithubUrl] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');
  const [description, setDescription] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  const getDecodedToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const decoded = getDecodedToken();
  const currentStudent = decoded?.sub || decoded?.username || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assignmentsRes = await API.get('/assignments');
        const submissionsRes = await API.get('/submissions');

        setAssignments(assignmentsRes.data);
        setSubmissions(submissionsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [refresh]);

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const submissionPayload = {
      assignment: { id: selectedAssignment.id },
      githubUrl,
      deployedUrl,
      description
    };

    try {
      await API.post('/submissions', submissionPayload);
      setMessage('Project submitted successfully!');

      setGithubUrl('');
      setDeployedUrl('');
      setDescription('');
      setSelectedAssignment(null);
      setRefresh(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setError('Submission failed. Please check backend log.');
    }
  };

return (
    <div className="p-6 max-w-6xl w-full mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-gray-600">Review your active assignments, submit your projects, and check grades or feedback.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start w-full">

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full md:w-1/2 shrink-0">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Active Assignments & Feedback</h2>

          <div className="space-y-4">
            {assignments.map((asm) => {
              const sub = submissions.find(s =>
                s?.assignment?.id === asm.id &&
                s?.student?.username === currentStudent
              );

              return (
                <div
                  key={asm.id}
                  onClick={() => setSelectedAssignment(asm)}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedAssignment?.id === asm.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-gray-700 truncate">{asm.title}</h3>
                    <span className="text-red-500 font-medium text-sm shrink-0 whitespace-nowrap">
                      Due Date: {asm.deadline ? new Date(asm.deadline).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 break-words">{asm.description}</p>

                  {sub?.grade ? (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <span className="font-bold text-green-700">Grade: {sub.grade}</span>
                      {sub.feedback && <p className="text-gray-600 italic mt-1 break-words"> {sub.feedback} </p>}
                    </div>
                  ) : sub ? (
                    <span className="inline-block mt-3 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                      Pending Evaluation
                    </span>
                  ) : (
                    <span className="inline-block mt-3 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-medium">
                      Not Submitted Yet
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full md:w-1/2 shrink-0">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">Submit Your Project</h2>

          {selectedAssignment ? (
            <p className="text-sm text-gray-500 mb-4 truncate">
              Submitting for: <span className="font-bold text-gray-700">{selectedAssignment.title}</span>
            </p>
          ) : (
            <p className="text-sm text-amber-600 mb-4 font-medium">⚠️ Select an assignment from the left panel to unlock the form.</p>
          )}

          {message && <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-lg text-sm">{message}</div>}
          {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Repository URL *</label>
              <input
                type="url" required disabled={!selectedAssignment}
                placeholder="https://github.com/your-username/repo-name"
                value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deployed Application URL (Optional)</label>
              <input
                type="url" disabled={!selectedAssignment}
                placeholder="https://your-app.netlify.app"
                value={deployedUrl} onChange={(e) => setDeployedUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description / Notes *</label>
              <textarea
                rows="4" required disabled={!selectedAssignment}
                placeholder="Describe your project, technologies used, or startup instructions..."
                value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              ></textarea>
            </div>

            <button
              type="submit" disabled={!selectedAssignment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Project
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;