import { useCallback, useEffect, useMemo, useState } from 'react'
import API from '../api/axiosConfig'
import { getErrorMessage } from '../utils/getErrorMessage'

function getCurrentLocalDate() {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function StudentDashboard() {
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [githubUrl, setGithubUrl] = useState('')
  const [deployedUrl, setDeployedUrl] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submissionsByAssignment = useMemo(
    () => new Map(submissions.map((submission) => [submission.assignment.id, submission])),
    [submissions],
  )

  const fetchDashboardData = useCallback(async () => {
    try {
      const [assignmentsResponse, submissionsResponse] = await Promise.all([
        API.get('/assignments'),
        API.get('/submissions'),
      ])
      setAssignments(assignmentsResponse.data)
      setSubmissions(submissionsResponse.data)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not load dashboard data.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleProjectSubmit = async (event) => {
    event.preventDefault()
    if (!selectedAssignment) {
        return

        }

    if (selectedAssignment.deadline < getCurrentLocalDate()) {
      setMessage('')
      setError('The deadline for this assignment has passed.')
      setSelectedAssignment(null)
      return
    }

    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      await API.post('/submissions', {
        assignmentId: selectedAssignment.id,
        githubUrl,
        deployedUrl: deployedUrl || null,
        description,
      })
      setMessage('Project submitted successfully!')
      setGithubUrl('')
      setDeployedUrl('')
      setDescription('')
      setSelectedAssignment(null)
      await fetchDashboardData()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Submission failed. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl w-full mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-gray-600">Review assignments, submit projects, and check grades or feedback.</p>
      </div>

      {message && <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">{message}</div>}
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="flex flex-col md:flex-row gap-6 items-start w-full">
        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full md:w-1/2">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Assignments & Feedback</h2>

          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : assignments.length === 0 ? (
            <p className="text-gray-500">No assignments are available.</p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
              const submission = submissionsByAssignment.get(assignment.id)
              const deadlineExpired = assignment.deadline < getCurrentLocalDate()
              const canSubmit = !submission && !deadlineExpired
              const hasGrade =
                submission?.grade !== null &&
                submission?.grade !== undefined

                return (
                  <article
                    key={assignment.id}
                    onClick={() => canSubmit && setSelectedAssignment(assignment)}
                    className={`p-4 border rounded-lg transition ${
                      selectedAssignment?.id === assignment.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    } ${canSubmit ? 'cursor-pointer hover:border-gray-300' : 'cursor-default'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-gray-700 break-words">{assignment.title}</h3>
                      <span className="text-red-500 font-medium text-sm shrink-0 whitespace-nowrap">
                        Due: {new Date(`${assignment.deadline}T00:00:00`).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 break-words">{assignment.description}</p>

                   {hasGrade ? (
                     <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                       <span className="font-bold text-green-700">
                         Grade: {submission.grade}/6
                       </span>

                       {submission.feedback && (
                         <p className="text-gray-600 italic mt-1 break-words">
                           {submission.feedback}
                         </p>
                       )}
                     </div>
                   ) : submission ? (
                     <span className="inline-block mt-3 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                      Awaiting evaluation
                     </span>
                   ) : deadlineExpired ? (
                     <span className="inline-block mt-3 text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                       The deadline has passed.
                     </span>
                   ) : (
                     <span className="inline-block mt-3 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-medium">
                      Not yet delivered
                     </span>
                   )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full md:w-1/2">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">Submit Your Project</h2>

          {selectedAssignment ? (
            <p className="text-sm text-gray-500 mb-4">
              Submitting for: <span className="font-bold text-gray-700">{selectedAssignment.title}</span>
            </p>
          ) : (
            <p className="text-sm text-amber-600 mb-4 font-medium">Select an unsubmitted assignment to unlock the form.</p>
          )}

          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="github-url">GitHub Repository URL *</label>
              <input
                id="github-url"
                type="url"
                required
                disabled={!selectedAssignment || isSubmitting}
                placeholder="https://github.com/your-username/repo-name"
                value={githubUrl}
                onChange={(event) => setGithubUrl(event.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deployed-url">Deployed Application URL</label>
              <input
                id="deployed-url"
                type="url"
                disabled={!selectedAssignment || isSubmitting}
                placeholder="https://your-app.example.com"
                value={deployedUrl}
                onChange={(event) => setDeployedUrl(event.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="submission-description">Brief Description / Notes *</label>
              <textarea
                id="submission-description"
                rows="4"
                required
                disabled={!selectedAssignment || isSubmitting}
                placeholder="Describe your project, technologies used, or startup instructions..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedAssignment || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Project'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default StudentDashboard
