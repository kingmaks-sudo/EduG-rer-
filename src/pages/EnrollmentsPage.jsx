import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { generateEnrollmentReceipt } from "@/utils/receiptGenerator";
import { sendEnrollmentConfirmationEmail } from "@/utils/emailSender";

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState({});
  const [classes, setClasses] = useState({});
  const [schoolYears, setSchoolYears] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [validating, setValidating] = useState(null);
  const [search, setSearch] = useState("");

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

  async function handleValidate(enrollment) {
    const student = students[enrollment.student_id];
    if (!student?.email) {
      setError("Impossible d'envoyer l'email : l'élève n'a pas d'adresse email.");
      return;
    }
    setValidating(enrollment.id);
    try {
      const updated = await base44.entities.Enrollment.update(enrollment.id, {
        status: "confirmée",
      });
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollment.id ? { ...e, ...updated } : e))
      );
      await sendEnrollmentConfirmationEmail({
        enrollment: { ...enrollment, status: "confirmée" },
        student,
        classe: classes[enrollment.class_id],
        schoolYear: schoolYears[enrollment.school_year_id],
      });
    } catch (e) {
      setError("Erreur lors de la validation : " + (e.message || ""));
    } finally {
      setValidating(null);
    }
  }

  const filtered = enrollments.filter((enr) => {
    const student = students[enr.student_id];
    const classe = classes[enr.class_id];
    const haystack = [
      student ? `${student.last_name} ${student.first_name}` : "",
      classe?.name || "",
      enr.enrollment_type || "",
      enr.status || "",
    ].join(" ").toLowerCase();
    return haystack.includes(search.toLowerCase());
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
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Inscriptions</h1>
      <input
        type="text"
        placeholder="Rechercher une inscription..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="space-y-3">
        {filtered.map((enr) => {
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
              <div className="shrink-0 flex flex-col gap-2 sm:flex-row">
                {enr.status !== "confirmée" && (
                  <button
                    onClick={() => handleValidate(enr)}
                    disabled={validating === enr.id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {validating === enr.id ? "Validation..." : "Valider"}
                  </button>
                )}
                <button
                  onClick={() => handleDownload(enr)}
                  disabled={downloading === enr.id}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {downloading === enr.id ? "Génération..." : "Télécharger le reçu"}
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">Aucune inscription trouvée</p>
        )}
      </div>
    </div>
  );
}
