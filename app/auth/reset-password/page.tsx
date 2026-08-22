"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function checkRecoverySession() {
      try {
        // Check whether Supabase already created a session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setSessionReady(true);
          setCheckingSession(false);
          return;
        }

        // Supabase may return recovery information through the URL
        const hash = window.location.hash;

        if (hash) {
          const params = new URLSearchParams(hash.substring(1));

          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");
          const type = params.get("type");

          if (accessToken && refreshToken && type === "recovery") {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              setMessage(error.message);
            } else {
              setSessionReady(true);
            }

            setCheckingSession(false);
            return;
          }
        }

        setMessage(
          "Your password reset link is invalid or has expired. Please request a new reset email."
        );
        setCheckingSession(false);
      } catch (error: any) {
        setMessage(
          error?.message ||
            "Unable to verify the password reset session."
        );
        setCheckingSession(false);
      }
    }

    checkRecoverySession();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");

    if (!sessionReady) {
      setMessage(
        "Password reset session is missing. Please request a new reset email."
      );
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "Password updated successfully. Redirecting to login..."
      );

      setTimeout(() => {
        window.location.href = "/auth";
      }, 2000);
    } catch (error: any) {
      setMessage(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl font-bold text-white shadow-lg">
            R
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Verifying reset link...
          </h1>

          <p className="mt-2 text-gray-500">
            Please wait a moment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">

        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl font-bold text-white shadow-lg">
            R
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">
            Review<span className="text-indigo-600">Pilot</span>
          </h1>

          <p className="mt-2 text-gray-500">
            {sessionReady
              ? "Create a new password for your account."
              : "Password reset"}
          </p>
        </div>

        {!sessionReady ? (
          <div className="mt-8">
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {message}
            </div>

            <a
              href="/auth"
              className="mt-5 block w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-center font-bold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700"
            >
              Back to Login
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleReset}
            className="mt-8 space-y-5"
          >

            {/* New Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                New password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                minLength={6}
                required
                className="mt-2 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Confirm new password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="••••••••"
                minLength={6}
                required
                className="mt-2 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Message */}
            {message && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
                {message}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 font-bold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>
          </form>
        )}

        {/* Login */}
        <div className="mt-7 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <a
            href="/auth"
            className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
          >
            Log in
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          AI-powered review responses for local businesses.
        </p>
      </div>
    </main>
  );
}