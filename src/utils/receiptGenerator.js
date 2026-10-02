import jsPDF from "jspdf";

function formatAmount(amount) {
  if (amount == null) return "0";
  return new Intl.NumberFormat("fr-FR").format(amount) + " GNF";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function generateEnrollmentReceipt({ enrollment, student, classe, schoolYear }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  let y = 25;

  // Header band
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("EduGérer", pageWidth / 2, 10, { align: "center" });

  // Title
  y = 30;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const title =
    enrollment.enrollment_type === "inscription"
      ? "Reçu d'Inscription"
      : "Reçu de Réinscription";
  doc.text(title, pageWidth / 2, y, { align: "center" });

  // Receipt number
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const receiptNum = `N° ${enrollment.id?.slice(-8).toUpperCase() || "N/A"}`;
  doc.text(receiptNum, pageWidth / 2, y, { align: "center" });

  // Separator line
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);

  // Student info section
  y += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Informations de l'élève", margin, y);

  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const studentLines = [
    `Nom et prénom: ${student?.last_name || ""} ${student?.first_name || ""}`,
    `Email: ${student?.email || "N/A"}`,
    `Téléphone: ${student?.phone || "N/A"}`,
    `Date de naissance: ${formatDate(student?.date_of_birth)}`,
    `Lieu de naissance: ${student?.place_of_birth || "N/A"}`,
    `Nationalité: ${student?.nationality || "N/A"}`,
  ];
  studentLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 6;
  });

  // Enrollment info section
  y += 4;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Détails de l'inscription", margin, y);

  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const enrollmentLines = [
    `Type: ${enrollment.enrollment_type === "inscription" ? "Inscription" : "Réinscription"}`,
    `Classe: ${classe?.name || "N/A"} (${classe?.level || ""})`,
    `Année scolaire: ${schoolYear?.name || "N/A"}`,
    `Date d'inscription: ${formatDate(enrollment.enrollment_date)}`,
    `Statut: ${enrollment.status || "N/A"}`,
  ];
  enrollmentLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 6;
  });

  // Payment section
  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Paiement", margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Montant total:", margin, y);
  doc.setFont("helvetica", "bold");
  doc.text(formatAmount(enrollment.total_amount), pageWidth - margin, y, {
    align: "right",
  });

  // Footer
  y = 270;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Ce reçu a été généré électroniquement par EduGérer.",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 4;
  doc.text(
    `Émis le ${formatDate(new Date().toISOString())}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );

  // Download
  const fileName = `recu_${student?.last_name || "eleve"}_${enrollment.id?.slice(-6) || ""}.pdf`;
  doc.save(fileName);
}
