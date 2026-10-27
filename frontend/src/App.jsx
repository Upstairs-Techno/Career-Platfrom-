import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import OjtPage from './pages/OjtPage'
import OjtApplyPage from './pages/OjtApplyPage'
import InternshipPage from './pages/InternshipPage'
import InternshipApplyPage from './pages/InternshipApplyPage'
import ApplicationSuccessPage from './pages/ApplicationSuccessPage'
import NotFoundPage from './pages/NotFoundPage'

import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminOjtApplicationsPage from './pages/admin/AdminOjtApplicationsPage'
import AdminInternshipApplicationsPage from './pages/admin/AdminInternshipApplicationsPage'
import AdminApplicationDetailPage from './pages/admin/AdminApplicationDetailPage'
import AdminReferralsPage from './pages/admin/AdminReferralsPage'
import AdminStudentsPage from './pages/admin/AdminStudentsPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/ojt" element={<OjtPage />} />
        <Route path="/ojt/apply" element={<OjtApplyPage />} />
        <Route path="/internship" element={<InternshipPage />} />
        <Route path="/internship/apply" element={<InternshipApplyPage />} />
        <Route path="/application-success" element={<ApplicationSuccessPage />} />
      </Route>

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin dashboard (protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="ojt" element={<AdminOjtApplicationsPage />} />
        <Route path="internships" element={<AdminInternshipApplicationsPage />} />
        <Route path="applications/:id" element={<AdminApplicationDetailPage />} />
        <Route path="referrals" element={<AdminReferralsPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
