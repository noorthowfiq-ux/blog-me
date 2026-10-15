
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";

function Navbar() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setLogoutError("");

    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Unable to sign out. Please try again.");
    }
  }

  const linkClass =
    "text-sm font-medium text-gray-600 transition hover:text-blue-600";

  return (
    <header className="relative z-10 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          to="/home"
          className="text-xl font-bold tracking-tight text-gray-900"
        >
          Blog<span className="text-blue-600">Portfolio.</span>
        </Link>

        <button
          type="button"
          className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 md:hidden"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-full flex-col gap-5 border-b border-gray-200 bg-white px-5 py-5 md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0`}
        >
          <Link
            to="/home"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            to="/blogs"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Blogs
          </Link>

          <Link to="/admin" className={linkClass} onClick={() => setMenuOpen(false)}>
            Admin
</Link>

          {!authLoading &&
            (user ? (
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                <span
                  className="max-w-56 truncate text-sm text-gray-500"
                  title={user.email || ""}
                >
                  {user.email}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            ))}
        </div>
      </nav>

      {logoutError && (
        <p className="px-5 pb-3 text-right text-sm text-red-600" role="alert">
          {logoutError}
        </p>
      )}
    </header>
  );
}

export default Navbar;
