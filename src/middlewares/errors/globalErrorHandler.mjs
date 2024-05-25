const globalErrorHandler = (err, req, res, next) => {

  let code = err.code || 500;
  let message = err.message || 'Internal Server Error';


  if (err.code === 11000) {
    code = 409;
    message = 'Duplicate field value entered';
  }

  return res.status(500).json({
    status: 'error',
    code,
    message
  });
};

export default globalErrorHandler;
