import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <span className="font-bold text-lg text-blue-700">EduGérer</span>
            <div className="flex gap-1">
              <NavLink to="/" className={linkClass} end>
                Élèves
              </NavLink>
              <NavLink to="/inscriptions" className={linkClass}>
                Inscriptions
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
