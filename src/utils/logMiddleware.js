import Activity from "../models/Activity.model.js";

async function logMiddleware(req, res, next) {
  try {
    let responseBodyData;
    const startTime = new Date();

    // Capture the response body data
    const originalJson = res.json;
    console.log(originalJson)
    res.json = function (data) {
      responseBodyData = data;
      originalJson.call(res, data);
    };

    res.on("finish", async () => { // Use res.on("end") for reliability
      const endTime = new Date();
      try{
        console.log(req);
        await Activity.create({
          method: req.method,
          url: req.originalUrl,
          eventInitiatedBy: req.user?._id || null,
          responseMessage: responseBodyData.message,
          responseBody: JSON.stringify(responseBodyData.data) || null,
          statusCode: responseBodyData.statusCode || responseBodyData.error?.statusCode,
          status: responseBodyData.error ? "Failed" : "Success",
          startTime: startTime,
          duration: endTime - startTime,
        });
      } catch (error) {
        console.error("Error creating Activity document:", error);
      }
    });

    next();
  } catch (error) {
    console.error("Error in middleware:", error);
  }
}

export default logMiddleware;
