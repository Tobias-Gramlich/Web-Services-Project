import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SendEmailPage } from './pages/SendEmailPage';
import { ActivatePage } from './pages/ActivatePage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthCheckPage } from './pages/AuthCheckPage';
import { ChangeUsernamePage } from './pages/ChangeUsernamePage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { MatchmakingPage } from './pages/MatchmakingPage';
import { DeleteAccountPage } from './pages/DeleteAccountPage';
import { PostColorSchemePage } from './pages/PostColorSchemePage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/send-email" element={<SendEmailPage />} />
        <Route path="/activate" element={<ActivatePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/post-color-scheme" element={<PostColorSchemePage />} />
        <Route path="/auth-check" element={<AuthCheckPage />} />
        <Route path="/change-username" element={<ChangeUsernamePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/matchmaking" element={<MatchmakingPage />} />
        <Route path="/delete-account" element={<DeleteAccountPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}