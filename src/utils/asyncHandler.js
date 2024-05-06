import { ApiResponse } from "./ApiResponse.js";

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

// import { ApiResponse } from "./ApiResponse";

// export { asyncHandler } 

// const asyncHandler = (requestHandler) => {
//     console.log("inside async handler");
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next))
//             .then((response) => {
//                 console.log("response",response)
//                 next(response)
//             }
//             ).catch((err) => {
//                 console.log("async error message:", err.message);
//                 console.log("async error request of:", req.originalUrl);
//                 console.log("async error url method:", req.method)
//                 console.log("async error url method:", req.user?._id || null);
//                 console.log("status:False",);
//                 res.status(err.statusCode || 500).json({
//                     success: false,
//                     message: err.message || "Internal Server Error",
//                     error: err, // Optionally, you can send the full error object to the client
//                 });
//             })

//     };
// };

// export { asyncHandler };
const asyncHandler = (requestHandler) => {
    // console.log("inside async handler");
    return async (req, res, next) => {
      try {
        await requestHandler(req, res, next); // Use await for asynchronous operations
      } catch (err) {
        res.status(err.statusCode || 500).json({
          success: false,
          message: err.message || "Internal Server Error",
          error: err, // Optionally, you can send the full error object to the client
        });
      }
    };
  };
  
  export { asyncHandler };
  