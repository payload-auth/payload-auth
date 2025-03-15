import React from "react";

export default function AfterLogin() {
  return (
    <div className="mt-8 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Login to the admin panel.
      </p>
      <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
        You'll be redirected to the dashboard momentarily.
      </p>
    </div>
  );
}
