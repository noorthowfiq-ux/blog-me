
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/home");
    } catch (err) {
      const messages = {
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/user-not-found": "No account found. Please sign up first.",
        "auth/wrong-password": "Incorrect email or password.",
        "auth/too-many-requests":
          "Too many attempts. Please wait and try again.",
        "auth/network-request-failed":
          "Network error. Check your internet connection."
      };

      setError(
        messages[err.code] ||
        "Login failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10"
      >
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
          Welcome back
        </p>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Sign in
        </h1>

        <p className="mb-8 text-sm text-gray-500">
          Sign in to your Blog Portfolio account.
        </p>

        <div className="mb-5">
          <label
            htmlFor="login-email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="mb-5">
          <label
            htmlFor="login-password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          New here?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="font-semibold text-blue-600 hover:underline"
          >
            Create an account
          </button>
        </p>
      </form>
    </main>
  );
}

export default Login;

