import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";

import { Provider } from 'react-redux';
import {store} from './store';

import './styles/fonts.ts';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// import RedirectToDashboard from "./components/RedirectToDashboard.tsx";
import HomeEntry from './components/HomeEntry';
import ProtectedRoute from './components/ProtectedRoute';

import App from './App.tsx'
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import LoginPage from "./pages/member/LoginPage.tsx";
import RegisterPage from "./pages/member/RegisterPage.tsx";
import ForgotPasswordPage from "./pages/member/ForgotPasswordPage.tsx";
import ContractRegisterForm from "./pages/contracts/ContractRegisterForm.tsx";
import ContractList from "./pages/contracts/ContractList.tsx";
import ContractDetail from "./pages/contracts/ContractDetail.tsx";
import Clients from "./pages/clients/Clients.tsx"
import Payments from "./pages/payments/Payments.tsx"
import View from "./pages/contracts/View.tsx";
import Pay from "./pages/contracts/Pay.tsx";
import Proposal from "./pages/proposals/Proposal.tsx"
import ProposalDetail from "./pages/proposals/ProposalDetail.tsx"
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
      // { path: "dashboard", element: <Dashboard /> },
      { path: "contracts", element: <ContractList /> },
      { path: "contracts/:id", element: <ContractDetail /> },
      { path: "contracts/:id/view", element: <View /> },
      { path: "contracts/:id/pay", element: <Pay /> },
      { path: "contracts/new", element: <ContractRegisterForm /> },
      { path: "clients", element: <Clients /> },
      { path: "payments", element: <Payments /> },
      {
        path: "proposals",
        children: [
          { path: "new", element: <Proposal /> },
          { path: ":id", element: <ProposalDetail /> },
        ],
      },
      // { path: "onboard", element: <OnboardTest /> },
    ],
  }
]);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
)
