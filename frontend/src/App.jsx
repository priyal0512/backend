console.log("APP.JSX LOADED FROM HERE!");
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Uploads from './pages/Uploads';
import Validations from './pages/Validations';
import Reports from './pages/Reports';
import ChatbotPage from './pages/ChatbotPage';
import Compare from './pages/Compare';   // ⭐ NEW IMPORT

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="uploads" element={<Uploads />} />
            <Route path="validations" element={<Validations />} />
            <Route path="reports" element={<Reports />} />
            <Route path="chatbot" element={<ChatbotPage />} />

            {/* ⭐ NEW COMPARE ROUTE */}
            <Route path="compare" element={<Compare />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
