"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase";

export default function GeneratePage() {
  const supabase = createClient();

  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState("5");
  const [tone, setTone] = useState("Professional");
  const [review, setReview] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [repliesRemaining, setRepliesRemaining] = useState(8);

  useEffect(() => {
    async function loadUsage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const { count } = await supabase
        .from("review_replies")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      setRepliesRemaining(Math.max(10 - (count ?? 0), 0));
    }

    loadUsage();
  }, []);

  async function handleGenerate() {
    if (!review.trim() || loading) return;

    if (repliesRemaining <= 0) {
      setError(
        "You've used all 10 free replies. Upgrade your plan to generate more."
      );
      return;
    }

    setLoading(true);
    setReply("");
    setError("");
    setCopied(false);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/auth";
        return;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          customerName,
          rating,
          tone,
          review,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate reply.");
      }

      setReply(data.reply);

      if (typeof data.repliesRemaining === "number") {
        setRepliesRemaining(data.repliesRemaining);
      } else {
        setRepliesRemaining((current) => Math.max(current - 1, 0));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!reply) return;

    try {
      await navigator.clipboard.writeText(reply);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Could not copy the reply. Please copy it manually.");
    }
  }

  function useExample() {
    setCustomerName("Sarah");
    setRating("5");
    setTone("Friendly");
    setReview(
      "The service was excellent and the staff were very friendly. Everything was smooth and easy. I would definitely recommend this business!"
    );
    setError("");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <a
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Dashboard
          </a>

          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
            {repliesRemaining} free{" "}
            {repliesRemaining === 1 ? "reply" : "replies"} remaining
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Generate a Review Reply
          </h1>

          <p className="mt-2 text-gray-600">
            Turn any customer review into a thoughtful, professional response.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Customer details
            </h2>

            <button
              type="button"
              onClick={useExample}
              className="text-sm font-semibold text-gray-700 underline underline-offset-4 hover:text-gray-900"
            >
              Use example
            </button>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Customer name
              <span className="ml-1 font-normal text-gray-400">
                (optional)
              </span>
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Sarah"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-sm font-semibold text-gray-800">
              Rating
            </label>

            <div className="flex flex-wrap gap-2">
              {[
                ["5", "★★★★★"],
                ["4", "★★★★☆"],
                ["3", "★★★☆☆"],
                ["2", "★★☆☆☆"],
                ["1", "★☆☆☆☆"],
              ].map(([value, stars]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    rating === value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {stars}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Tone
            </label>

            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            >
              <option>Professional</option>
              <option>Friendly</option>
              <option>Warm</option>
              <option>Concise</option>
            </select>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-800">
                Customer review
              </label>

              <span className="text-xs text-gray-400">
                {review.length}/2000
              </span>
            </div>

            <textarea
              value={review}
              onChange={(e) => {
                if (e.target.value.length <= 2000) {
                  setReview(e.target.value);
                }
              }}
              placeholder="Paste the customer's review here..."
              rows={8}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!review.trim() || loading || repliesRemaining <= 0}
            className="mt-6 w-full rounded-xl bg-gray-900 px-5 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading
              ? "Generating..."
              : repliesRemaining <= 0
                ? "Free Limit Reached"
                : "Generate Reply →"}
          </button>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {reply && (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Generated Reply
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Ready to copy and post.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    {copied ? "✓ Copied" : "Copy Reply"}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading || repliesRemaining <= 0}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400"
                  >
                    {loading ? "Generating..." : "Regenerate"}
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-white p-5">
                <p className="whitespace-pre-wrap leading-7 text-gray-700">
                  {reply}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 text-center text-sm text-gray-500">
          Free plan · {repliesRemaining} replies remaining
        </div>
      </div>
    </main>
  );
}