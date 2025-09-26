import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    // 1. Main layout wrapper
    // This uses flexbox to push the footer to the bottom of the viewport
    <div className="flex flex-col min-h-screen">
      {/* 2. Main content area */}
      {/* This part will grow to fill the available space */}
      <main className="flex-grow">
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </main>

      {/* 3. Footer element */}
      <footer className="w-full py-4 text-center border-t text-sm text-muted-foreground">
        Made with ❤️ by Lalita Khatri
      </footer>
    </div>
  );
}

export default App;