export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false })
    
    if (error) {
      const errors = error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      return res.status(400).json({ errors })
    }

    req.body = value
    next()
  }
}
