import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Chatbot from "./pages/Chatbot";
import ProviderLogin from "./pages/ProviderLogin";
import ProviderDashboard from "./pages/ProviderDashboard";
import Settings from "./pages/Settings";
import DashboardLayout from "./components/dashboard/DashboardLayout";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/provider/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Chatbot />} />
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
        <Route path="settings" element={<Settings />} />
      </Route>
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
