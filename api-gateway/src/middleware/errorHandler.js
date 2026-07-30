const errorHandler = (err, req, res, next) => {
  console.error('[API Gateway] Error:', err.message);

  if (err.response) {
    return res.status(err.response.status).json(err.response.data);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
