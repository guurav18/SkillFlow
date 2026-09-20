import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// Client Pages
import { ClientDashboard } from '../pages/client/ClientDashboard';
import { CreateProjectPage } from '../pages/client/CreateProjectPage';
import { MyProjectsPage } from '../pages/client/MyProjectsPage';
import { ProjectDetailsPage } from '../pages/client/ProjectDetailsPage';

// Freelancer Pages
import { FreelancerDashboard } from '../pages/freelancer/FreelancerDashboard';
import { BrowseProjectsPage } from '../pages/freelancer/BrowseProjectsPage';
import { FreelancerProjectDetailsPage } from '../pages/freelancer/FreelancerProjectDetailsPage';
import { MyApplicationsPage } from '../pages/freelancer/MyApplicationsPage';
import { FreelancerMyProjectsPage } from '../pages/freelancer/FreelancerMyProjectsPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';

// Phase 2 Workspace Page
import { ProjectWorkspacePage } from '../pages/workspace/ProjectWorkspacePage';

// Phase 2 Enhancement — Workflow
import { WorkflowPage } from '../pages/workflow/WorkflowPage';
import { BusinessPage } from '../pages/BusinessPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/browse" element={<BrowseProjectsPage />} />
        <Route path="/freelancer/browse" element={<BrowseProjectsPage />} />

        {/* Dedicated Phase 2 Project Workspace */}
        <Route
          path="/projects/:projectId/workspace"
          element={
            <ProtectedRoute allowedRoles={['client', 'freelancer', 'admin']}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProjectWorkspacePage />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Phase 2 Enhancement — Global Workflow */}
        <Route
          path="/workflow"
          element={
            <ProtectedRoute allowedRoles={['client', 'freelancer']}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <WorkflowPage />
              </div>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Client Protected Dashboard Routes */}
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="projects" element={<MyProjectsPage />} />
        <Route path="create-project" element={<CreateProjectPage />} />
        <Route path="projects/:id" element={<ProjectDetailsPage />} />
        <Route path="analytics" element={<BusinessPage />} />
        <Route path="invoices" element={<BusinessPage />} />
        <Route path="notifications" element={<BusinessPage />} />
        <Route index element={<Navigate to="/client/dashboard" replace />} />
      </Route>

      {/* Freelancer Protected Dashboard Routes */}
      <Route
        path="/freelancer"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<FreelancerDashboard />} />
        <Route path="browse" element={<BrowseProjectsPage />} />
        <Route path="projects/:id" element={<FreelancerProjectDetailsPage />} />
        <Route path="applications" element={<MyApplicationsPage />} />
        <Route path="projects" element={<FreelancerMyProjectsPage />} />
        <Route path="analytics" element={<BusinessPage />} />
        <Route path="invoices" element={<BusinessPage />} />
        <Route path="notifications" element={<BusinessPage />} />
        <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
      </Route>

      {/* Admin Protected Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<BusinessPage />} />
        <Route path="invoices" element={<BusinessPage />} />
        <Route path="notifications" element={<BusinessPage />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
