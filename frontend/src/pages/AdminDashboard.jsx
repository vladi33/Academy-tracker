import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import API from '../api/axiosConfig'
import useAuth from '../hooks/useAuth'
import { getErrorMessage } from '../utils/getErrorMessage'

function StatCard({
  label,
  value,
  description,
}) {
  return (
    <article className="rounded-xl bg-white p-5 shadow-md">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-xs text-gray-500">
          {description}
        </p>
      )}
    </article>
  )
}

function AdminDashboard() {
  const { user: authenticatedUser } = useAuth()

  const [users, setUsers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [activeItemId, setActiveItemId] = useState(null)
  const [activeItemType, setActiveItemType] = useState('')

  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] =
    useState('ALL')

  const [
    assignmentSearch,
    setAssignmentSearch,
  ] = useState('')

  const [
    submissionSearch,
    setSubmissionSearch,
  ] = useState('')

  const [
    submissionStatusFilter,
    setSubmissionStatusFilter,
  ] = useState('ALL')

  const [
    submissionGradeFilter,
    setSubmissionGradeFilter,
  ] = useState('ALL')

  const fetchDashboardData = useCallback(async () => {
    setError('')
    setIsLoading(true)

    try {
      const [
        usersResponse,
        assignmentsResponse,
        submissionsResponse,
      ] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/assignments'),
        API.get('/admin/submissions'),
      ])

      setUsers(usersResponse.data)
      setAssignments(assignmentsResponse.data)
      setSubmissions(submissionsResponse.data)
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Failed to load administrator data.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const startProcessing = (type, id) => {
    setActiveItemType(type)
    setActiveItemId(id)
  }

  const stopProcessing = () => {
    setActiveItemType('')
    setActiveItemId(null)
  }

  const isProcessing = (type, id) =>
    activeItemType === type &&
    activeItemId === id

  const handleRoleChange = async (
    userId,
    newRole,
  ) => {
    setError('')
    setMessage('')
    startProcessing('user', userId)

    try {
      const response = await API.put(
        `/admin/users/${userId}/role`,
        {
          role: newRole,
        },
      )

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? response.data
            : user,
        ),
      )

      setMessage(
        'User role updated successfully.',
      )
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Failed to update the user role.',
        ),
      )
    } finally {
      stopProcessing()
    }
  }

  const handleDeleteUser = async (
    selectedUser,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedUser.username}"?`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')
    startProcessing('user', selectedUser.id)

    try {
      await API.delete(
        `/admin/users/${selectedUser.id}`,
      )

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) =>
            user.id !== selectedUser.id,
        ),
      )

      setMessage('User deleted successfully.')
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Failed to delete the user.',
        ),
      )
    } finally {
      stopProcessing()
    }
  }

  const handleDeleteAssignment = async (
    assignment,
  ) => {
    if (assignment.submissionCount > 0) {
      setMessage('')
      setError(
        'This assignment cannot be deleted because it has submissions.',
      )
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${assignment.title}"?`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')
    startProcessing(
      'assignment',
      assignment.id,
    )

    try {
      await API.delete(
        `/admin/assignments/${assignment.id}`,
      )

      setAssignments((currentAssignments) =>
        currentAssignments.filter(
          (currentAssignment) =>
            currentAssignment.id !== assignment.id,
        ),
      )

      setMessage(
        'Assignment deleted successfully.',
      )
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Failed to delete the assignment.',
        ),
      )
    } finally {
      stopProcessing()
    }
  }

  const handleDeleteSubmission = async (
    submission,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the submission from "${submission.studentUsername}" for "${submission.assignmentTitle}"?`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')
    startProcessing(
      'submission',
      submission.id,
    )

    try {
      await API.delete(
        `/admin/submissions/${submission.id}`,
      )

      setSubmissions((currentSubmissions) =>
        currentSubmissions.filter(
          (currentSubmission) =>
            currentSubmission.id !== submission.id,
        ),
      )

      setAssignments((currentAssignments) =>
        currentAssignments.map((assignment) =>
          assignment.id === submission.assignmentId
            ? {
                ...assignment,
                submissionCount: Math.max(
                  0,
                  assignment.submissionCount - 1,
                ),
              }
            : assignment,
        ),
      )

      setMessage(
        'Submission deleted successfully.',
      )
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          'Failed to delete the submission.',
        ),
      )
    } finally {
      stopProcessing()
    }
  }

  const getRoleBadgeClasses = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'INSTRUCTOR':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getSubmissionStatusClasses = (
    status,
  ) => {
    switch (status) {
      case 'EVALUATED':
        return 'bg-green-100 text-green-800'
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDeadline = (deadline) => {
    if (!deadline) {
      return '-'
    }

    return new Intl.DateTimeFormat(
      'en-GB',
      {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      },
    ).format(
      new Date(`${deadline}T00:00:00`),
    )
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return '-'
    }

    return new Intl.DateTimeFormat(
      'en-GB',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    ).format(new Date(dateTime))
  }

  const isDeadlineExpired = (deadline) => {
    if (!deadline) {
      return false
    }

    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const deadlineDate =
      new Date(`${deadline}T00:00:00`)

    return deadlineDate < currentDate
  }

  const statistics = useMemo(() => {
    const studentCount = users.filter(
      (user) => user.role === 'STUDENT',
    ).length

    const instructorCount = users.filter(
      (user) => user.role === 'INSTRUCTOR',
    ).length

    const administratorCount = users.filter(
      (user) => user.role === 'ADMIN',
    ).length

    const evaluatedCount = submissions.filter(
      (submission) =>
        submission.status === 'EVALUATED',
    ).length

    const awaitingEvaluationCount =
      submissions.filter(
        (submission) =>
          submission.status !== 'EVALUATED',
      ).length

    const gradedSubmissions =
      submissions.filter(
        (submission) =>
          Number.isInteger(submission.grade),
      )

    const gradeTotal =
      gradedSubmissions.reduce(
        (total, submission) =>
          total + submission.grade,
        0,
      )

    const averageGrade =
      gradedSubmissions.length > 0
        ? (
            gradeTotal /
            gradedSubmissions.length
          ).toFixed(2)
        : '-'

    return {
      studentCount,
      instructorCount,
      administratorCount,
      evaluatedCount,
      awaitingEvaluationCount,
      averageGrade,
    }
  }, [users, submissions])

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      userSearch.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        user.username
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesRole =
        userRoleFilter === 'ALL' ||
        user.role === userRoleFilter

      return matchesSearch && matchesRole
    })
  }, [
    users,
    userSearch,
    userRoleFilter,
  ])

  const filteredAssignments = useMemo(() => {
    const normalizedSearch =
      assignmentSearch.trim().toLowerCase()

    return assignments.filter((assignment) => {
      const searchableText = [
        assignment.title,
        assignment.description,
        assignment.deadline,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(
        normalizedSearch,
      )
    })
  }, [
    assignments,
    assignmentSearch,
  ])

  const filteredSubmissions = useMemo(() => {
    const normalizedSearch =
      submissionSearch.trim().toLowerCase()

    return submissions.filter((submission) => {
      const searchableText = [
        submission.studentUsername,
        submission.assignmentTitle,
        submission.githubUrl,
        submission.deployedUrl,
        submission.status,
        submission.feedback,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        searchableText.includes(
          normalizedSearch,
        )

      const matchesStatus =
        submissionStatusFilter === 'ALL' ||
        submission.status ===
          submissionStatusFilter

      let matchesGrade = true

      if (
        submissionGradeFilter === 'GRADED'
      ) {
        matchesGrade =
          Number.isInteger(submission.grade)
      } else if (
        submissionGradeFilter === 'UNGRADED'
      ) {
        matchesGrade =
          submission.grade == null
      } else if (
        submissionGradeFilter !== 'ALL'
      ) {
        matchesGrade =
          submission.grade ===
          Number(submissionGradeFilter)
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGrade
      )
    })
  }, [
    submissions,
    submissionSearch,
    submissionStatusFilter,
    submissionGradeFilter,
  ])

  if (isLoading) {
    return (
      <div className="flex flex-grow items-center justify-center">
        <p className="text-gray-600">
          Loading administrator data...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-gray-600">
          Manage users, assignments and submissions.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-100 p-3 text-green-700">
          {message}
        </div>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current Academy Tracker statistics.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total users"
            value={users.length}
            description="All registered accounts"
          />

          <StatCard
            label="Students"
            value={statistics.studentCount}
            description="Accounts with the STUDENT role"
          />

          <StatCard
            label="Instructors"
            value={statistics.instructorCount}
            description="Accounts with the INSTRUCTOR role"
          />

          <StatCard
            label="Administrators"
            value={statistics.administratorCount}
            description="Accounts with the ADMIN role"
          />

          <StatCard
            label="Assignments"
            value={assignments.length}
            description="All created assignments"
          />

          <StatCard
            label="Submissions"
            value={submissions.length}
            description="All submitted projects"
          />

          <StatCard
            label="Evaluated"
            value={statistics.evaluatedCount}
            description={`${statistics.awaitingEvaluationCount} awaiting evaluation`}
          />

          <StatCard
            label="Average grade"
            value={
              statistics.averageGrade === '-'
                ? '-'
                : `${statistics.averageGrade}/6`
            }
            description="Calculated from graded submissions"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-md">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Users
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredUsers.length} of{' '}
                {users.length} users
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px_auto]">
              <label className="block">
                <span className="sr-only">
                  Search users
                </span>

                <input
                  type="search"
                  value={userSearch}
                  onChange={(event) =>
                    setUserSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search by username"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <label className="block">
                <span className="sr-only">
                  Filter users by role
                </span>

                <select
                  value={userRoleFilter}
                  onChange={(event) =>
                    setUserRoleFilter(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="ALL">
                    All roles
                  </option>

                  <option value="STUDENT">
                    Students
                  </option>

                  <option value="INSTRUCTOR">
                    Instructors
                  </option>

                  <option value="ADMIN">
                    Administrators
                  </option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setUserSearch('')
                  setUserRoleFilter('ALL')
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="p-6 text-gray-500">
            {users.length === 0
              ? 'No users were found.'
              : 'No users match the selected filters.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-6 py-4">
                    ID
                  </th>

                  <th className="px-6 py-4">
                    Username
                  </th>

                  <th className="px-6 py-4">
                    Current role
                  </th>

                  <th className="px-6 py-4">
                    Change role
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const isCurrentUser =
                    user.username ===
                    authenticatedUser?.username

                  const isAdministrator =
                    user.role === 'ADMIN'

                  const actionsDisabled =
                    isProcessing(
                      'user',
                      user.id,
                    ) ||
                    isCurrentUser ||
                    isAdministrator

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.id}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {user.username}

                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-gray-500">
                            (you)
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClasses(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          disabled={actionsDisabled}
                          onChange={(event) =>
                            handleRoleChange(
                              user.id,
                              event.target.value,
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                        >
                          {isAdministrator && (
                            <option value="ADMIN">
                              ADMIN
                            </option>
                          )}

                          <option value="STUDENT">
                            STUDENT
                          </option>

                          <option value="INSTRUCTOR">
                            INSTRUCTOR
                          </option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={actionsDisabled}
                          onClick={() =>
                            handleDeleteUser(user)
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {isProcessing(
                            'user',
                            user.id,
                          )
                            ? 'Processing...'
                            : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-md">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Assignments
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Showing{' '}
                {filteredAssignments.length} of{' '}
                {assignments.length} assignments
              </p>
            </div>

            <div className="flex w-full max-w-xl gap-3">
              <label className="flex-grow">
                <span className="sr-only">
                  Search assignments
                </span>

                <input
                  type="search"
                  value={assignmentSearch}
                  onChange={(event) =>
                    setAssignmentSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search title or description"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  setAssignmentSearch('')
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <p className="p-6 text-gray-500">
            {assignments.length === 0
              ? 'No assignments were found.'
              : 'No assignments match the search.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-6 py-4">
                    ID
                  </th>

                  <th className="px-6 py-4">
                    Assignment
                  </th>

                  <th className="px-6 py-4">
                    Deadline
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Submissions
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredAssignments.map(
                  (assignment) => {
                    const expired =
                      isDeadlineExpired(
                        assignment.deadline,
                      )

                    const hasSubmissions =
                      assignment.submissionCount > 0

                    const processing =
                      isProcessing(
                        'assignment',
                        assignment.id,
                      )

                    return (
                      <tr
                        key={assignment.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {assignment.id}
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {assignment.title}
                          </p>

                          <p className="mt-1 max-w-xl text-sm text-gray-500">
                            {assignment.description}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDeadline(
                            assignment.deadline,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              expired
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {expired
                              ? 'Expired'
                              : 'Active'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                            {
                              assignment.submissionCount
                            }
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={
                              processing ||
                              hasSubmissions
                            }
                            title={
                              hasSubmissions
                                ? 'Delete the submissions before deleting this assignment'
                                : 'Delete assignment'
                            }
                            onClick={() =>
                              handleDeleteAssignment(
                                assignment,
                              )
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {processing
                              ? 'Deleting...'
                              : hasSubmissions
                                ? 'Has submissions'
                                : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    )
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-md">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Submissions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Showing{' '}
                {filteredSubmissions.length} of{' '}
                {submissions.length} submissions
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_190px_190px_auto]">
              <label>
                <span className="sr-only">
                  Search submissions
                </span>

                <input
                  type="search"
                  value={submissionSearch}
                  onChange={(event) =>
                    setSubmissionSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search student or assignment"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <label>
                <span className="sr-only">
                  Filter by status
                </span>

                <select
                  value={
                    submissionStatusFilter
                  }
                  onChange={(event) =>
                    setSubmissionStatusFilter(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="ALL">
                    All statuses
                  </option>

                  <option value="SUBMITTED">
                    Submitted
                  </option>

                  <option value="EVALUATED">
                    Evaluated
                  </option>
                </select>
              </label>

              <label>
                <span className="sr-only">
                  Filter by grade
                </span>

                <select
                  value={
                    submissionGradeFilter
                  }
                  onChange={(event) =>
                    setSubmissionGradeFilter(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="ALL">
                    All grades
                  </option>

                  <option value="GRADED">
                    Graded
                  </option>

                  <option value="UNGRADED">
                    Not graded
                  </option>

                  <option value="2">
                    Grade 2
                  </option>

                  <option value="3">
                    Grade 3
                  </option>

                  <option value="4">
                    Grade 4
                  </option>

                  <option value="5">
                    Grade 5
                  </option>

                  <option value="6">
                    Grade 6
                  </option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setSubmissionSearch('')
                  setSubmissionStatusFilter(
                    'ALL',
                  )
                  setSubmissionGradeFilter(
                    'ALL',
                  )
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <p className="p-6 text-gray-500">
            {submissions.length === 0
              ? 'No submissions were found.'
              : 'No submissions match the selected filters.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-6 py-4">
                    ID
                  </th>

                  <th className="px-6 py-4">
                    Student
                  </th>

                  <th className="px-6 py-4">
                    Assignment
                  </th>

                  <th className="px-6 py-4">
                    Submitted
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Grade
                  </th>

                  <th className="px-6 py-4">
                    Links
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions.map(
                  (submission) => {
                    const processing =
                      isProcessing(
                        'submission',
                        submission.id,
                      )

                    return (
                      <tr
                        key={submission.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {submission.id}
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {
                              submission.studentUsername
                            }
                          </p>

                          <p className="text-xs text-gray-500">
                            User ID:{' '}
                            {submission.studentId}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {
                              submission.assignmentTitle
                            }
                          </p>

                          <p className="text-xs text-gray-500">
                            Assignment ID:{' '}
                            {
                              submission.assignmentId
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDateTime(
                            submission.submittedAt,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSubmissionStatusClasses(submission.status)}`}
                          >
                            {submission.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {submission.grade == null ? (
                            <span className="text-sm text-gray-500">
                              Not graded
                            </span>
                          ) : (
                            <span className="font-semibold text-gray-900">
                              {submission.grade}/6
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1 text-sm">
                            {submission.githubUrl ? (
                              <a
                                href={
                                  submission.githubUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                GitHub
                              </a>
                            ) : (
                              <span className="text-gray-400">
                                No GitHub
                              </span>
                            )}

                            {submission.deployedUrl ? (
                              <a
                                href={
                                  submission.deployedUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                Deployed project
                              </a>
                            ) : (
                              <span className="text-gray-400">
                                Not deployed
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={processing}
                            onClick={() =>
                              handleDeleteSubmission(
                                submission,
                              )
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {processing
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    )
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminDashboard