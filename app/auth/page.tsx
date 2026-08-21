"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase";

type Mode = "login" | "signup" | "forgot" | "reset";

export default function AuthPage() {
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkResetSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        const hash = window.location.hash;

        if (hash.includes("type=recovery")) {
          setMode("reset");
        }
      }
    };

    checkResetSession();
  }, []);

  function clearMessages() {
    setMessage("");
    setError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    clearMessages();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      window.location.href = "/generate";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to log in."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    clearMessages();

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setMessage(
        "Account created! Please check your email to confirm your account."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    clearMessages();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        }
      );

      if (error) {
        throw error;
      }

      setMessage(
        "Password reset email sent. Check your inbox."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    clearMessages();

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setMessage(
        "Password updated successfully. You can now log in."
      );

      setNewPassword("");

      setTimeout(() => {
        window.location.href = "/auth";
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update password."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: Mode) {
    clearMessages();
    setMode(newMode);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <a
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to ReviewPilot
        </a>

        {mode === "login" && (
          <>
            <h1 className="mt-8 text-3xl font-bold text-gray-900">
              Welcome back
            </h1>

            <p className="mt-2 text-gray-600">
              Log in to your ReviewPilot account.
            </p>

            <form onSubmit={handleLogin} className="mt-8">
              <label className="mb-2 block text-sm font-semibold">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

              <label className="mb-2 mt-6 block text-sm font-semibold">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <button
              onClick={() => switchMode("forgot")}
              className="mt-5 w-full text-center text-sm font-semibold text-gray-700 hover:underline"
            >
              Forgot password?
            </button>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?

              <button
                onClick={() => switchMode("signup")}
                className="ml-2 font-semibold text-gray-900 hover:underline"
              >
                Sign up
              </button>
            </div>
          </>
        )}

        {mode === "signup" && (
          <>
            <h1 className="mt-8 text-3xl font-bold text-gray-900">
              Create your account
            </h1>

            <p className="mt-2 text-gray-600">
              Start using ReviewPilot today.
            </p>

            <form onSubmit={handleSignup} className="mt-8">
              <label className="mb-2 block text-sm font-semibold">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

              <label className="mb-2 mt-6 block text-sm font-semibold">
                Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?

              <button
                onClick={() => switchMode("login")}
                className="ml-2 font-semibold text-gray-900 hover:underline"
              >
                Log in
              </button>
            </div>
          </>
        )}

        {mode === "forgot" && (
          <>
            <h1 className="mt-8 text-3xl font-bold text-gray-900">
              Reset your password
            </h1>

            <p className="mt-2 text-gray-600">
              Enter your email and we'll send you a password reset link.
            </p>

            <form
              onSubmit={handleForgotPassword}
              className="mt-8"
            >
              <label className="mb-2 block text-sm font-semibold">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300"
              >
                {loading
                  ? "Sending..."
                  : "Send Reset Link"}
              </button>
            </form>

            <button
              onClick={() => switchMode("login")}
              className="mt-6 w-full text-center text-sm font-semibold text-gray-700 hover:underline"
            >
              ← Back to login
            </button>
          </>
        )}

        {mode === "reset" && (
          <>
            <h1 className="mt-8 text-3xl font-bold text-gray-900">
              Choose a new password
            </h1>

            <p className="mt-2 text-gray-600">
              Enter a new password for your ReviewPilot account.
            </p>

            <form
              onSubmit={handleResetPassword}
              className="mt-8"
            >
              <label className="mb-2 block text-sm font-semibold">
                New password
              </label>

              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300"
              >
                {loading
                  ? "Updating..."
                  : "Update Password"}
              </button>
            </form>
          </>
        )}

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}