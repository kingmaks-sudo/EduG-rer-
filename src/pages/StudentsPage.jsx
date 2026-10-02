import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = ["Tous", "Primaire", "Collège", "Lycée"];

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState({});
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [openClass, setOpenClass] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [stuData, clsData, enrData] = await Promise.all([
          base44.entities.Student.list({ limit: 5000 }),
          base44.entities.Classe.list({ limit: 5000 }),
          base44.entities.Enrollment.list({ limit: 5000 }),
        ]);
        const toList = (d) => (Array.isArray(d) ? d : d.items || []);
        setStudents(toList(stuData));
        setClasses(Object.fromEntries(toList(clsData).map((c) => [c.id, c])));
        setEnrollments(toList(enrData));
      } catch (e) {
        setError(e.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Map student_id -> class_id (latest enrollment wins)
  const studentClassMap = useMemo(() => {
    const map = {};
    enrollments.forEach((e) => {
      map[e.student_id] = e.class_id;
    });
    return map;
  }, [enrollments]);

  // Group students by class, then class by level
  const grouped = useMemo(() => {
    const byClass = {};
    students.forEach((s) => {
      const classId = studentClassMap[s.id];
      const classe = classId ? classes[classId] : null;
      const level = classe?.level || "Non classé";
      const classKey = classe?.id || "none";
      const classLabel = classe?.name?.trim() || "Sans classe";
      if (!byClass[level]) byClass[level] = {};
      if (!byClass[level][classKey])
        byClass[level][classKey] = { label: classLabel, students: [] };
      byClass[level][classKey].students.push(s);
    });
    return byClass;
  }, [students, classes, studentClassMap]);

  // Category counts for tabs
  const categoryCounts = useMemo(() => {
    const counts = { Tous: students.length, Primaire: 0, Collège: 0, Lycée: 0, "Non classé": 0 };
    students.forEach((s) => {
      const classId = studentClassMap[s.id];
      const level = classId ? classes[classId]?.level : null;
      const key = level || "Non classé";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [students, classes, studentClassMap]);

  // Filtered + grouped view for the selected category
  const visibleGroups = useMemo(() => {
    const q = search.toLowerCase();
    const levels = category === "Tous" ? Object.keys(grouped) : [category];
    const result = [];
    levels.forEach((level) => {
      const classMap = grouped[level];
      if (!classMap) return;
      Object.entries(classMap).forEach(([classKey, { label, students: stuList }]) => {
        const filtered = stuList.filter((s) => {
          const name = `${s.first_name} ${s.last_name}`.toLowerCase();
          return name.includes(q) || (s.email || "").toLowerCase().includes(q);
        });
        if (filtered.length > 0)
          result.push({ level, classKey, label, students: filtered });
      });
    });
    return result;
  }, [grouped, category, search]);

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

      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher un élève..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Category tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setOpenClass(null);
            }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
            <span className="ml-1 text-xs opacity-70">
              ({categoryCounts[cat] || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Grouped by class */}
      <div className="space-y-3">
        {visibleGroups.map(({ level, classKey, label, students: stuList }) => {
          const isOpen = openClass === `${level}-${classKey}`;
          return (
            <div key={`${level}-${classKey}`} className="bg-white shadow rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  setOpenClass(isOpen ? null : `${level}-${classKey}`)
                }
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      level === "Primaire"
                        ? "bg-blue-100 text-blue-700"
                        : level === "Collège"
                        ? "bg-purple-100 text-purple-700"
                        : level === "Lycée"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {level}
                  </span>
                  <span className="font-medium text-gray-900 truncate">{label}</span>
                </div>
                <span className="shrink-0 ml-2 text-sm text-gray-500">
                  {stuList.length} élève{stuList.length > 1 ? "s" : ""}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-gray-100">
                  {stuList.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {s.last_name} {s.first_name}
                        </p>
                        {s.email && (
                          <p className="text-xs text-gray-500 truncate">{s.email}</p>
                        )}
                      </div>
                      {s.phone && (
                        <span className="shrink-0 ml-2 text-xs text-gray-400">
                          {s.phone}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {visibleGroups.length === 0 && (
          <p className="text-center text-gray-500 py-8">Aucun élève trouvé</p>
        )}
      </div>
    </div>
  );
}
