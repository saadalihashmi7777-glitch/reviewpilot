"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase";

type Reply = {
  id: string;
  customer_name: string | null;
  rating: number | null;
  tone: string | null;
  review: string;
  reply: string;
  created_at: string;
};

export default function DashboardPage() {
  const [supabase, setSupabase] =
    useState<ReturnType<typeof createClient> | null>(null);

  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("free");
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = createClient();
    setSupabase(client);

    async function loadDashboard() {
      const {
        data: { user },
      } = await client.auth.getUser();

      if (!user) {
        window.location.href = "/auth";
        return;
      }

      setEmail(user.email || "");

      const { data: planData, error: planError } = await client
        .from("user_plans")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (planError) {
        console.error("Plan error:", planError);
      }

      setPlan(planData?.plan || "free");

      const { data, error } = await client
        .from("review_replies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Replies error:", error);
      }

      if (data) {
        setReplies(data);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  async function handleLogout() {
    if (!supabase) return;

    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  const repliesGenerated = replies.length;

  const repliesRemaining =
    plan === "pro"
      ? "Unlimited"
      : Math.max(10 - repliesGenerated, 0);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ReviewPilot
            </h1>

            <p className="mt-1 text-gray-600">
              Welcome back, {email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Log out
          </button>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Replies generated
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {repliesGenerated}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Replies remaining
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {repliesRemaining}
            </p>

            {plan === "free" && (
              <p className="mt-1 text-sm text-gray-500">
                Free plan limit: 10 replies
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Current plan
            </p>

            <p className="mt-2 text-3xl font-bold capitalize text-gray-900">
              {plan}
            </p>

            {plan === "free" && (
              <a
                href="/pricing"
                className="mt-3 inline-block text-sm font-semibold text-gray-700 underline underline-offset-4 hover:text-gray-900"
              >
                Upgrade to Pro →
              </a>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Generate a new reply
              </h2>

              <p className="mt-2 text-gray-600">
                Turn customer reviews into professional responses with AI.
              </p>
            </div>

            <a
              href="/generate"
              className="rounded-xl bg-gray-900 px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
            >
              Generate Reply →
            </a>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Recent replies
            </h2>

            {replies.length > 0 && (
              <span className="text-sm text-gray-500">
                {replies.length} total
              </span>
            )}
          </div>

          {replies.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-10 text-center">
              <p className="text-gray-500">
                No replies yet.
              </p>

              <a
                href="/generate"
                className="mt-3 inline-block font-semibold text-gray-900 hover:underline"
              >
                Generate your first reply →
              </a>
            </div>
          ) : (
            <div className="mt-6 space-y-5">

              {replies.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 p-5"
                >

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.customer_name || "Customer"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {"★".repeat(item.rating || 5)}
                        {" · "}
                        {item.tone || "Professional"}
                      </p>
                    </div>

                    <p className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>

                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-semibold text-gray-700">
                      Customer review
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {item.review}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-5">
                    <p className="text-sm font-semibold text-gray-700">
                      Your reply
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {item.reply}
                    </p>
                  </div>

                </div>
              ))}

            </div>
          )}
        </section>

        {plan === "free" && (
          <section className="mt-8 rounded-2xl bg-gray-900 p-8 text-white">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Need unlimited replies?
                </h2>

                <p className="mt-2 text-gray-300">
                  Upgrade to ReviewPilot Pro for unlimited AI-generated
                  responses.
                </p>
              </div>

              <a
                href="/pricing"
                className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-gray-900 hover:bg-gray-100"
              >
                View Pro Plan →
              </a>

            </div>
          </section>
        )}

      </div>
    </main>
  );
}