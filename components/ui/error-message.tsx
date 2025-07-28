import React from "react";

function ErrorMessage({ error }: { error: string | undefined }) {
  return (
    <div className="bg-gray-300 border border-gray-500 p-5 text-sm m-5 rounded">
      {error}
    </div>
  );
}

export default ErrorMessage;
