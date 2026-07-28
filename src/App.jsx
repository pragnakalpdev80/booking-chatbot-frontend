import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProviderSelector from "./components/ProviderSelector";
import Chatbot from "./pages/Chatbot";
import ProviderRegister from "./pages/ProviderRegister";
import ProviderLogin from "./pages/ProviderLogin";
import ProviderDashboard from "./pages/ProviderDashboard";
import Settings from "./pages/Settings";
import MockPayment from "./pages/MockPayment";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import AllAppointments from "./pages/AllAppointments";
import CancelledAppointments from "./pages/CancelledAppointments";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/provider/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProviderSelector />} />
      <Route path="/chat" element={<Navigate to="/" replace />} />
      <Route path="/:providerSlug/chat" element={<Chatbot />} />
      <Route path="/mock-pay/:orderId" element={<MockPayment />} />
      <Route path="/provider/register" element={<ProviderRegister />} />
      <Route path="/provider/login" element={<ProviderLogin />} />
      <Route
        path="/provider"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="all-appointments" element={<AllAppointments />} />
        <Route path="cancelled-appointments" element={<CancelledAppointments />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/login" element={<Navigate to="/provider/login" replace />} />
      <Route path="/register" element={<Navigate to="/provider/register" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
