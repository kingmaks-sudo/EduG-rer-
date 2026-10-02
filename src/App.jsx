import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import StudentsPage from "@/pages/StudentsPage";
import EnrollmentsPage from "@/pages/EnrollmentsPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<StudentsPage />} />
        <Route path="/inscriptions" element={<EnrollmentsPage />} />
      </Routes>
    </Layout>
  );
}
