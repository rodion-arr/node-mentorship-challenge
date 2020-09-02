module.exports = (error, req, res, next) => {
  res.status(500)
  return res.json({
    error: error.message
  })
}
