import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";

import './styles/fonts.ts';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// import RedirectToDashboard from "./components/pages/RedirectToDashboard.tsx";
import HomeEntry from './components/pages/HomeEntry';
import ProtectedRoute from './components/common/ProtectedRoute';

import App from './App.tsx'
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import LoginPage from "./pages/member/LoginPage.tsx";
import RegisterPage from "./pages/member/RegisterPage.tsx";
import ForgotPasswordPage from "./pages/member/ForgotPasswordPage.tsx";
import Profile from "./pages/member/Profile.tsx";
import ContractRegisterForm from "./pages/contracts/ContractRegisterForm.tsx";
import ContractList from "./pages/contracts/ContractList.tsx";
import ContractDetail from "./pages/contracts/ContractDetail.tsx";
import Clients from "./pages/clients/Clients.tsx"
import Payments from "./pages/payments/Payments.tsx"
import View from "./pages/contracts/View.tsx";
import Pay from "./pages/contracts/Pay.tsx";
import Proposal from "./pages/proposals/Proposal.tsx"
import ProposalDetail from "./pages/proposals/ProposalDetail.tsx"
import ContractSign from "./pages/contracts/ContractSign.tsx"
import TermOfUse from "./pages/etc/TermOfUse.tsx";
import PrivacyPolicy from "./pages/etc/PrivacyPolicy.tsx";
// import OnboardTest from "./pages/OnboardTest.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // { index: true, element: <Navigate to="/dashboard" replace /> },
      // { index: true, element: <RedirectToDashboard /> },
      { index: true, element: <HomeEntry /> },
      { 
        path: 'dashboard', 
        element: (
          <ProtectedRoute>
            <Dashboard /> 
          </ProtectedRoute>
        )
      },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { 
        path: "profile", 
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ) 
      },
      // { path: "dashboard", element: <Dashboard /> },
      { path: "contracts", element: <ContractList /> },
      { path: "contracts/:id", element: <ContractDetail /> },
      { path: "contracts/:id/sign", element: <ContractSign /> },
      { path: "contracts/:id/view", element: <View /> },
      { path: "contracts/:id/pay", element: <Pay /> },
      { path: "contracts/new", element: <ContractRegisterForm /> },
      { path: "clients", element: <Clients /> },
      { path: "payments", element: <Payments /> },
      {
        path: "proposals",
        children: [
          { 
            path: "new", element: (
              <ProtectedRoute>
                <Proposal />
              </ProtectedRoute>
            )
          },
          { path: ":id", element: <ProposalDetail /> },
        ],
      },
      { path: "term-of-use", element: <TermOfUse /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      // { path: "onboard", element: <OnboardTest /> },
    ],
  }
]);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
