import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.entities.Student.list({ limit: 100 })
      .then((data) => {
        const list = Array.isArray(data) ? data : data.items || [];
        setStudents(list);
      })
      .catch((e) => setError(e.message || "Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const name = `${s.first_name} ${s.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || (s.email || "").toLowerCase().includes(search.toLowerCase());
  });

  if (loading)
    return <p className="text-center text-gray-500 py-8">Chargement...</p>;
  if (error)
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <p className="font-medium">Erreur</p>
        <p className="text-sm">{error}</p>
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Élèves</h1>
      <input
        type="text"
        placeholder="Rechercher un élève..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Téléphone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {s.last_name} {s.first_name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{s.email}</td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{s.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-500">—</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">Aucun élève trouvé</p>
        )}
      </div>
    </div>
  );
}
