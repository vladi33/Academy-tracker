export function getErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data

  if (responseData?.errors) {
    const firstValidationError = Object.values(responseData.errors)[0]
    if (firstValidationError) return firstValidationError
  }

  if (responseData?.message) return responseData.message
  if (typeof responseData === 'string' && responseData.trim()) return responseData
  return fallbackMessage
}