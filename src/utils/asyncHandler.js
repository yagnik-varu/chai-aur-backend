/**
 * Wraps an asynchronous request handler function with error handling middleware.
 * @param {Function} requestHandler - The asynchronous request handler function to be wrapped.
 * @returns {Function} - The wrapped request handler function.
 */
// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(
//             requestHandler(req, res, next)
//         ).catch((err) => next(err))
//     }
// }

// export { asyncHandler } 

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error",
                error: err, // Optionally, you can send the full error object to the client
            });
        });
    };
};

export { asyncHandler };