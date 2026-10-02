import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { generateEnrollmentReceipt } from "@/utils/receiptGenerator";

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState({});
  const [classes, setClasses] = useState({});
  const [schoolYears, setSchoolYears] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [enrData, stuData, clsData, syData] = await Promise.all([
          base44.entities.Enrollment.list({ limit: 100 }),
          base44.entities.Student.list({ limit: 100 }),
          base44.entities.Classe.list({ limit: 100 }),
          base44.entities.SchoolYear.list({ limit: 100 }),
        ]);

        const enrList = Array.isArray(enrData) ? enrData : enrData.items || [];
        const stuList = Array.isArray(stuData) ? stuData : stuData.items || [];
        const clsList = Array.isArray(clsData) ? clsData : clsData.items || [];
        const syList = Array.isArray(syData) ? syData : syData.items || [];

        setEnrollments(enrList);
        setStudents(Object.fromEntries(stuList.map((s) => [s.id, s])));
        setClasses(Object.fromEntries(clsList.map((c) => [c.id, c])));
        setSchoolYears(Object.fromEntries(syList.map((y) => [y.id, y])));
      } catch (e) {
        setError(e.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleDownload(enrollment) {
    setDownloading(enrollment.id);
    try {
      generateEnrollmentReceipt({
        enrollment,
        student: students[enrollment.student_id],
        classe: classes[enrollment.class_id],
        schoolYear: schoolYears[enrollment.school_year_id],
      });
    } catch (e) {
      setError("Erreur lors de la génération du PDF: " + (e.message || ""));
    } finally {
      setDownloading(null);
    }
  }

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
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Inscriptions</h1>
      <div className="space-y-3">
        {enrollments.map((enr) => {
          const student = students[enr.student_id];
          const classe = classes[enr.class_id];
          const sy = schoolYears[enr.school_year_id];
          return (
            <div
              key={enr.id}
              className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900">
                  {student ? `${student.last_name} ${student.first_name}` : "Élève inconnu"}
                </p>
                <p className="text-sm text-gray-500">
                  {enr.enrollment_type === "inscription" ? "Inscription" : "Réinscription"}
                  {" · "}
                  {classe?.name || "Classe N/A"}
                  {" · "}
                  {sy?.name || ""}
                  {" · "}
                  {new Intl.NumberFormat("fr-FR").format(enr.total_amount || 0)} GNF
                </p>
                <span
                  className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    enr.status === "confirmée"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {enr.status}
                </span>
              </div>
              <button
                onClick={() => handleDownload(enr)}
                disabled={downloading === enr.id}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {downloading === enr.id ? "Génération..." : "Télécharger le reçu"}
              </button>
            </div>
          );
        })}
        {enrollments.length === 0 && (
          <p className="text-center text-gray-500 py-8">Aucune inscription trouvée</p>
        )}
      </div>
    </div>
  );
}
