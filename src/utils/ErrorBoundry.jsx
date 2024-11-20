import React from "react";
//import "./ErrorHandler.css"; // Add appropriate styles

const ErrorBoundry = ({ errorCode, onRetry }) => {
  let title = "Something went wrong";
  let message = "An unexpected error occurred.";
  let buttonLabel = "Retry";

  switch (errorCode) {
    case 404:
      title = "404 - Page Not Found";
      message = "The page you are looking for does not exist.";
      buttonLabel = "Go Back";
      break;
    case 500:
      title = "500 - Internal Server Error";
      message = "Our servers are facing issues. Please try again later.";
      break;
    case 403:
      title = "403 - Forbidden";
      message = "You don't have permission to access this resource.";
      break;
    default:
      title = "Error";
      message = "An error occurred. Please try again.";
      break;
  }

  return (
    <div className="error-handler">
      <h1>{title}</h1>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="error-handler-button">
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default ErrorBoundry;
