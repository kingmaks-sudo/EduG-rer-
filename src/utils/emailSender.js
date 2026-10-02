import { base44 } from "@/api/base44Client";

function formatAmount(amount) {
  if (amount == null) return "0";
  return new Intl.NumberFormat("fr-FR").format(amount) + " GNF";
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Sends a confirmation email with receipt details to the student.
 * @param {object} params - { enrollment, student, classe, schoolYear }
 * @returns {Promise<void>}
 */
export async function sendEnrollmentConfirmationEmail({
  enrollment,
  student,
  classe,
  schoolYear,
}) {
  const studentName = `${student?.last_name || ""} ${student?.first_name || ""}`.trim();
  const receiptNum = enrollment.id?.slice(-8).toUpperCase() || "N/A";
  const enrollmentType =
    enrollment.enrollment_type === "inscription" ? "Inscription" : "Réinscription";

  const body = [
    `Bonjour ${studentName},`,
    "",
    `Votre ${enrollmentType.toLowerCase()} a été validée avec succès. Voici le récapitulatif de votre reçu :`,
    "",
    `N° de reçu : ${receiptNum}`,
    `Type : ${enrollmentType}`,
    `Classe : ${classe?.name || "N/A"}${classe?.level ? " (" + classe.level + ")" : ""}`,
    `Année scolaire : ${schoolYear?.name || "N/A"}`,
    `Date d'inscription : ${formatDate(enrollment.enrollment_date)}`,
    `Statut : ${enrollment.status || "confirmée"}`,
    `Montant total : ${formatAmount(enrollment.total_amount)}`,
    "",
    "Vous pouvez télécharger le reçu PDF complet depuis votre espace EduGérer.",
    "",
    "Cordialement,",
    "L'équipe EduGérer",
  ].join("\n");

  await base44.integrations.Core.SendEmail({
    to: student?.email,
    subject: `Confirmation d'${enrollmentType.toLowerCase()} — Reçu N° ${receiptNum}`,
    body,
    from_name: "EduGérer",
  });
}
