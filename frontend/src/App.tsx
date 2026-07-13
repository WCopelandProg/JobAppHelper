import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JobsPage } from "./pages/JobsPage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { SavedJobsPage } from "./pages/SavedJobsPage";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { CoverLettersPage } from "./pages/CoverLettersPage";
import { NetworkingPage } from "./pages/NetworkingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/saved" element={<SavedJobsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/cover-letters" element={<CoverLettersPage />} />
          <Route path="/networking" element={<NetworkingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
