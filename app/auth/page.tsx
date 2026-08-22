"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase";

type Mode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const [supabase, setSupabase] = useState<
    ReturnType<typeof createClient> | null
  >(null);

  useEffect(() => {
    const client = createClient();
    setSupabase(client);

    async function checkUser() {
      const {
        data: { user },
      } = await client.auth.getUser();

      if (user) {
        window.location.href = "/dashboard";
      }
    }

    checkUser();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");

    if (!supabase) {
      setMessage("Please wait a moment and try again.");
      return;
    }

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    if (!resetMode && !password) {
      setMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      // =========================
      // FORGOT PASSWORD
      // =========================
      if (resetMode) {
        const { error } =
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "https://reviewpilot-brown.vercel.app/auth/reset-password",
          });

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage(
          "Password reset email sent. Please check your inbox."
        );

        return;
      }

      // =========================
      // LOGIN
      // =========================
      if (mode === "login") {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) {
          setMessage(error.message);
          return;
        }

        window.location.href = "/dashboard";
      }

      // =========================
      // SIGN UP
      // =========================
      else {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (error) {
          setMessage(error.message);
          return;
        }

        if (data.session) {
          window.location.href = "/dashboard";
        } else {
          setMessage(
            "Account created. Please check your email to confirm your account."
          );
        }
      }
    } catch (error: any) {
      setMessage(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">

        {/* Logo / Title */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl font-bold text-white shadow-lg">
            R
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">
            Review<span className="text-indigo-600">Pilot</span>
          </h1>

          <p className="mt-2 text-gray-500">
            {resetMode
              ? "Reset your password."
              : mode === "login"
              ? "Welcome back! Log in to continue."
              : "Create your ReviewPilot account."}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              required
            />
          </div>

          {/* Password */}
          {!resetMode && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>

                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetMode(true);
                      setMessage("");
                    }}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                required
                minLength={6}
              />
            </div>
          )}

          {/* Message */}
          {message && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
              {message}
            </div>
          )}

          {/* Main Button */}
          <button
            type="submit"
            disabled={loading || !supabase}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 font-bold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : resetMode
              ? "Send Reset Email"
              : mode === "login"
              ? "Log in →"
              : "Create account →"}
          </button>
        </form>

        {/* Bottom navigation */}
        <div className="mt-7 text-center text-sm text-gray-600">

          {resetMode ? (
            <button
              type="button"
              onClick={() => {
                setResetMode(false);
                setMessage("");
              }}
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              ← Back to login
            </button>
          ) : mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setMessage("");
                }}
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
              >
                Log in
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          AI-powered review responses for local businesses.
        </p>

      </div>
    </main>
  );
}