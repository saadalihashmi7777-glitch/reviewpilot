"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase";

export default function PricingPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpgrade() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to start checkout."
        );
      }

      if (!data.url) {
        throw new Error(
          "Stripe checkout URL was not returned."
        );
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("CHECKOUT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <a
          href="/dashboard"
          className="font-semibold text-gray-700 hover:underline"
        >
          ← Back to Dashboard
        </a>

        {/* Heading */}
        <div className="mt-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Simple pricing
          </h1>

          <p className="mt-3 text-gray-600">
            Start free. Upgrade when you need more replies.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-10 grid max-w-4xl gap-8 md:grid-cols-2">

          {/* FREE PLAN */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-gray-900">
              Free
            </h2>

            <p className="mt-2 text-gray-600">
              Perfect for trying ReviewPilot.
            </p>

            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900">
                $0
              </span>

              <span className="text-gray-500">
                /month
              </span>
            </div>

            <div className="mt-8 space-y-3 text-gray-700">
              <p>✓ 10 AI replies</p>
              <p>✓ Reply history</p>
              <p>✓ Professional tone</p>
              <p>✓ Friendly tone</p>
              <p>✓ Warm tone</p>
              <p>✓ Concise tone</p>
            </div>

            <a
              href="/dashboard"
              className="mt-8 block rounded-xl border px-5 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
            >
              Current plan
            </a>
          </div>

          {/* PRO PLAN */}
          <div className="relative rounded-2xl border-2 border-gray-900 bg-white p-8 shadow-md">

            <div className="absolute right-6 top-6 rounded-full bg-gray-900 px-3 py-1 text-xs font-bold text-white">
              RECOMMENDED
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Pro
            </h2>

            <p className="mt-2 text-gray-600">
              For businesses that need unlimited replies.
            </p>

            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900">
                $9
              </span>

              <span className="text-gray-500">
                /month
              </span>
            </div>

            <div className="mt-8 space-y-3 text-gray-700">
              <p>✓ Unlimited AI replies</p>
              <p>✓ Reply history</p>
              <p>✓ All response tones</p>
              <p>✓ Priority generation</p>
              <p>✓ No monthly reply limit</p>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Opening checkout..."
                : "Upgrade to Pro →"}
            </button>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <p className="mt-4 text-center text-xs text-gray-500">
              Secure checkout powered by Stripe.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}