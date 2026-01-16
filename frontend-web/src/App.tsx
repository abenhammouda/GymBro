import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import VerificationPage from './pages/auth/VerificationPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';


// Placeholder pages - will be implemented later
const ClientsPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Clients Page</h1>
    <p>Coming soon...</p>
  </div>
);

const CalendarPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Calendar Page</h1>
    <p>Coming soon...</p>
  </div>
);

const ProgramsPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Programs Page</h1>
    <p>Coming soon...</p>
  </div>
);

const ExercisesPage = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Exercise Library</h1>
    <p>Coming soon...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify" element={<VerificationPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <ClientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/programs"
            element={
              <ProtectedRoute>
                <ProgramsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises"
            element={
              <ProtectedRoute>
                <ExercisesPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

