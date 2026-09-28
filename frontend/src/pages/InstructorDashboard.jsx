import { useCallback, useEffect, useState } from 'react'
import API from '../api/axiosConfig'
import { getErrorMessage } from '../utils/getErrorMessage'

function InstructorDashboard() {
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await API.get('/submissions')
      setSubmissions(response.data)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not load submissions.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleCreateAssignment = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSubmitting(true)

    try {
      await API.post('/assignments', {
        title: newTitle,
        description: newDescription,
        deadline: newDueDate,
      })
      setMessage('Assignment created successfully!')
      setNewTitle('')
      setNewDescription('')
      setNewDueDate('')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Failed to create assignment.'))
    } finally {
      setIsSubmitting(false)
    }
  }

const handleEvaluateSubmission = async (event) => {
  event.preventDefault()

  setMessage('')
  setError('')

  if (!selectedSubmission) {
    return
  }

  const numericGrade = Number(grade)
  const normalizedFeedback = feedback.trim()

  if (
    !Number.isInteger(numericGrade) ||
    numericGrade < 2 ||
    numericGrade > 6
  ) {
    setError('Grade must be a whole number between 2 and 6.')
    return
  }

  if (!normalizedFeedback) {
    setError('Feedback is required.')
    return
  }

  setIsSubmitting(true)

  try {
    await API.put(
      `/submissions/${selectedSubmission.id}/evaluate`,
      {
        grade: numericGrade,
        feedback: normalizedFeedback,
      },
    )

    setSubmissions((currentSubmissions) =>
      currentSubmissions.map((submission) =>
        submission.id === selectedSubmission.id
          ? {
              ...submission,
              status: 'EVALUATED',
              grade: numericGrade,
              feedback: normalizedFeedback,
            }
          : submission,
      ),
    )

    setMessage(
      `Submission #${selectedSubmission.id} evaluated successfully!`,
    )

    setSelectedSubmission(null)
    setGrade('')
    setFeedback('')
  } catch (requestError) {
    setError(
      getErrorMessage(
        requestError,
        'Failed to submit evaluation.',
      ),
    )
  } finally {
    setIsSubmitting(false)
  }
}

  const openReview = (submission) => {
    setSelectedSubmission(submission)
    setGrade(submission.grade ?? '')
    setFeedback(submission.feedback ?? '')
    setMessage('')
    setError('')
  }

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Instructor Dashboard</h1>
        <p className="text-gray-600">Create assignments, track student progress, and grade project submissions.</p>
      </div>

      {message && <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">{message}</div>}
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-indigo-600">Create New Assignment</h2>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="assignment-title">Assignment Title *</label>
              <input
                id="assignment-title"
                type="text"
                required
                maxLength={150}
                placeholder="e.g., Final Fullstack Project"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="assignment-description">Description / Prompt *</label>
              <textarea
                id="assignment-description"
                rows="3"
                required
                maxLength={5000}
                placeholder="Detail the instructions and rules here..."
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="assignment-deadline">Deadline *</label>
              <input
                id="assignment-deadline"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={newDueDate}
                onChange={(event) => setNewDueDate(event.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-2 rounded-lg transition disabled:opacity-60"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </form>
        </section>

        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">Student Submissions</h2>

            {isLoading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : submissions.length === 0 ? (
              <p className="text-gray-500 text-sm">No submissions found.</p>
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
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
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-medium">{submission.student.username}</td>
                      <td className="p-3 text-gray-500">{submission.assignment.title}</td>
                      <td className="p-3 space-x-2">
                        <a href={submission.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">GitHub</a>
                        {submission.deployedUrl && (
                          <a href={submission.deployedUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Live</a>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          submission.status === 'EVALUATED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {submission.status === 'EVALUATED' ? 'Evaluated' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-gray-800">
                          {submission.grade === null ? '-' : `${submission.grade}/6`}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => openReview(submission)}
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
          </section>

          {selectedSubmission && (
            <section className="bg-gray-50 border border-indigo-100 p-6 rounded-xl shadow-inner space-y-4">
              <div className="flex justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Evaluating <span className="text-indigo-600">{selectedSubmission.student.username}</span>
                </h3>
                <button onClick={() => setSelectedSubmission(null)} className="text-gray-500 hover:text-gray-700 font-bold text-sm">
                  Close
                </button>
              </div>

              <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedSubmission.description}</p>

              <form onSubmit={handleEvaluateSubmission} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                 <label
                   className="block text-sm font-medium text-gray-700 mb-1"
                   htmlFor="submission-grade"
                 >
                   Grade (2–6) *
                 </label>

                 <input
                   id="submission-grade"
                   type="number"
                   required
                   min="2"
                   max="6"
                   step="1"
                   value={grade}
                   onChange={(event) => setGrade(event.target.value)}
                   className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                 />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="submission-feedback">Written Feedback *</label>
                  <textarea
                    id="submission-feedback"
                    rows="3"
                    required
                    maxLength={5000}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    className="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold p-2.5 rounded-lg transition disabled:opacity-60"
                  >
                    {isSubmitting ? 'Saving...' : 'Submit Grade & Mark Evaluated'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default InstructorDashboard
