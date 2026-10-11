export const errorHandler = (err, req, res, next) => {
  console.error(err)

  // The response already started streaming (e.g. a PDF); the connection can't carry a JSON error
  if (res.headersSent) return next(err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.message })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate field' })
  }

  const status = err.status || 500
  // Don't leak internals of unexpected errors in production
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error'
  res.status(status).json({ error: message })
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
