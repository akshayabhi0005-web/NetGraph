import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { AppLayout } from '../components/layout/AppLayout';

// Public Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { TermsPage } from '../pages/TermsPage';

// Authenticated Pages
import { DashboardPage } from '../pages/DashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SkillAnalysisPage } from '../pages/SkillAnalysisPage';
import { CareerMatchesPage } from '../pages/CareerMatchesPage';
import { SkillGapPage } from '../pages/SkillGapPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { GraphExplorerPage } from '../pages/GraphExplorerPage';
import { CareerPathsPage } from '../pages/CareerPathsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { ResumeBuilderPage } from '../pages/ResumeBuilderPage';
import { SettingsPage } from '../pages/SettingsPage';

export const routesConfig = [
  // Public Routes (Section 7.3)
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/terms', element: <TermsPage /> },

  // Protected Authenticated Routes (Section 7.3)
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/profile/edit', element: <ProfilePage /> },
      { path: '/skill-analysis', element: <SkillAnalysisPage /> },
      { path: '/career-matches', element: <CareerMatchesPage /> },
      { path: '/skill-gap', element: <SkillGapPage /> },
      { path: '/analytics', element: <AnalyticsPage /> },
      { path: '/graph-explorer', element: <GraphExplorerPage /> },
      { path: '/career-paths', element: <CareerPathsPage /> },
      { path: '/reports', element: <ReportsPage /> },
      { path: '/resume-builder', element: <ResumeBuilderPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to="/" replace /> },
];

export const router =
  typeof window !== 'undefined'
    ? createBrowserRouter(routesConfig)
    : ({} as any);


