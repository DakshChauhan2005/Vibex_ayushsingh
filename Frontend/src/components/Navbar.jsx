import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logout } from "../store/authSlice";

export default function Navbar({ theme = "light", onToggleTheme }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);

      if (currentScrollY < 24) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef.current && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navClass = ({ isActive }) =>
    `type-display relative text-base font-semibold transition ${
      isActive
        ? "text-brand-900 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-brand-600"
        : "text-brand-700 hover:text-brand-900"
    }`;

  const isDark = theme === "dark";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur ${
        isDark
          ? scrolled
            ? "border-brand-300 bg-transparent shadow-soft"
            : "border-brand-200 bg-transparent"
          : scrolled
            ? "border-brand-200 bg-gradient-to-r from-[#f6f3ef]/95 via-[#edf2ee]/95 to-[#f6f3ef]/95 shadow-soft"
            : "border-brand-100 bg-gradient-to-r from-[#f8f4ef]/95 via-[#eef3ef]/95 to-[#f8f4ef]/95"
      } ${isVisible ? "translate-y-0" : "-translate-y-full"} transition-transform duration-300`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
            O
          </span>
          <span className={`type-brand text-3xl font-bold leading-none ${isDark ? "text-brand-900" : "text-brand-950"}`}>
            OpenCare
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/services" className={navClass}>
            Services
          </NavLink>
          {user ? (
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          ) : (
            <NavLink to="/login" className={navClass}>
              Login
            </NavLink>
          )}
          {user ? (
            <NavLink to="/profile" className={navClass}>
              Profile
            </NavLink>
          ) : null}
          {user ? (
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-sm font-bold text-brand-900 transition hover:bg-brand-100"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-sm font-bold text-brand-900 transition hover:bg-brand-100"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          )}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/register"
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Get Started
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
