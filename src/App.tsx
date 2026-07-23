import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { Attendance } from "./pages/Attendance";
import { HealthMonitoring } from "./pages/HealthMonitoring";
import { SafetyReports } from "./pages/SafetyReports";
import { EmployeeManagement } from "./pages/EmployeeManagement";
import { Training } from "./pages/Training";
import { Login } from "./components/layout/Login";

const isAuthenticated = () => {
  try {
    return localStorage.getItem("isLoggedIn") === "true";
  } catch {
    return false;
  }
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <Navbar />
      <main className="flex-1 min-h-screen lg:ml-16 transition-all duration-300">
        <div className="p-4 lg:pr-14 lg:pb-4 sm:pt-6 lg:pt-8">{children}</div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated() ? <Login /> : <Navigate to="/" replace />
            }
          />

          <Route
            path="/"
            element={
              isAuthenticated() ? (
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/attendance"
            element={
              <MainLayout>
                <Attendance />
              </MainLayout>
            }
          />

          <Route
            path="/health"
            element={
              isAuthenticated() ? (
                <MainLayout>
                  <HealthMonitoring />
                </MainLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/safety-reports"
            element={
              isAuthenticated() ? (
                <MainLayout>
                  <SafetyReports />
                </MainLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/employees"
            element={
              isAuthenticated() ? (
                <MainLayout>
                  <EmployeeManagement />
                </MainLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/training"
            element={
              isAuthenticated() ? (
                <MainLayout>
                  <Training />
                </MainLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
