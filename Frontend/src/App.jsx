import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { fetchMe } from "./store/authSlice";

function AppShell({ theme, onToggleTheme }) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-app">
      {!hideNavbar ? <Navbar theme={theme} onToggleTheme={onToggleTheme} /> : null}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Footer theme={theme} />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [theme, setTheme] = useState(() => localStorage.getItem("oc_theme") || "light");

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch, token]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("oc_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    document.documentElement.classList.add("theme-switching");
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-switching");
    }, 260);
  };

  return <AppShell theme={theme} onToggleTheme={toggleTheme} />;
}
