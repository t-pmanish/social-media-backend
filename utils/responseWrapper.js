const successMessage = (statusCode, rejult) => {
  return {
    status: "ok",
    statusCode,
    rejult,
  };
};

const errorMessage = (statusCode, message) => {
  return {
    status: "error",
    statusCode,
    message,
  };
};

module.exports = {
  successMessage,
  errorMessage,
};
