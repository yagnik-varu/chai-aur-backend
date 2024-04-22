/**
 * Wraps an asynchronous request handler function with error handling middleware.
 * @param {Function} requestHandler - The asynchronous request handler function to be wrapped.
 * @returns {Function} - The wrapped request handler function.
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(
            requestHandler(req, res, next)
        ).catch((err) => next(err))
    }
}

export { asyncHandler } 