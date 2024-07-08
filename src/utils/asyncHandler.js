export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    return Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

export const asyncHandlerTryCatch =
  (requestHandler) => async (err, req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      res.status(error.code || 500).json({
        success: false,
        message: error.message,
      });
    }
  };
