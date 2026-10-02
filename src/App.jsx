import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Routes>
        <Route
          path="/"
          element={
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Base44 App
              </h1>
              <p className="text-gray-600">
                Connected to Base44 backend. App ID:{" "}
                {import.meta.env.VITE_BASE44_APP_ID}
              </p>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
