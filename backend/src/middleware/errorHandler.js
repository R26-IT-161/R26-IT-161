export const errorHandler = (err, req, res, next) => {
  console.error(err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.message })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID' })
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate field' })
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
