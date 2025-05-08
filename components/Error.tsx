import React from 'react';

interface ErrorProps {
  error: Error;
  onRetry: () => void;
}

const ErrorComponent: React.FC<ErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong.</h1>
      <p className="text-gray-700 mb-4">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorComponent;
