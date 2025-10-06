import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { HealthMonitoring } from './pages/HealthMonitoring';
import { SafetyReports } from './pages/SafetyReports';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { Training } from './pages/Training';
import { Login } from './components/layout/Login';

// Simple auth check function
const isAuthenticated = () => {
  try {
    return localStorage.getItem('isLoggedIn') === 'true';
  } catch {
    return false;
  }
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Login Route - No Navbar */}
          <Route 
            path="/login" 
            element={
              !isAuthenticated() ? <Login /> : <Navigate to="/" replace />
            } 
          />
          
          {/* Main Routes - With Navbar */}
          <Route 
            path="/*" 
            element={
              <div className="flex">
                <Navbar />
                <main className="flex-1 min-h-screen ml-16 p-4">
                  <Routes>
                    {/* Public Route - Always accessible */}
                    <Route path="/attendance" element={<Attendance />} />
                    
                    {/* Protected Routes - Require login */}
                    <Route 
                      path="/" 
                      element={
                        isAuthenticated() ? <Dashboard /> : <Navigate to="/attendance" replace />
                      } 
                    />
                    <Route 
                      path="/health" 
                      element={
                        isAuthenticated() ? <HealthMonitoring /> : <Navigate to="/attendance" replace />
                      } 
                    />
                    <Route 
                      path="/safety-reports" 
                      element={
                        isAuthenticated() ? <SafetyReports /> : <Navigate to="/attendance" replace />
                      } 
                    />
                    <Route 
                      path="/employees" 
                      element={
                        isAuthenticated() ? <EmployeeManagement /> : <Navigate to="/attendance" replace />
                      } 
                    />
                    <Route 
                      path="/training" 
                      element={
                        isAuthenticated() ? <Training /> : <Navigate to="/attendance" replace />
                      } 
                    />
                    
                    {/* Fallback Route */}
                    <Route 
                      path="*" 
                      element={
                        <Navigate to={isAuthenticated() ? "/" : "/attendance"} replace />
                      } 
                    />
                  </Routes>
                </main>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;