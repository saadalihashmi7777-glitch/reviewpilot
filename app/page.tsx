export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="text-2xl font-bold tracking-tight">
            ReviewPilot
          </a>

          <a
            href="/generate"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Try for Free
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            ✨ AI-powered review responses
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Turn customer reviews into
            <span className="block text-gray-500">
              professional replies in seconds.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            ReviewPilot helps businesses respond to customer reviews
            quickly, professionally, and consistently using AI.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/generate"
              className="rounded-xl bg-gray-900 px-7 py-3.5 font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              Generate a Reply →
            </a>

            <a
              href="#features"
              className="rounded-xl border border-gray-300 px-7 py-3.5 font-semibold text-gray-700 hover:bg-gray-50"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <p className="font-semibold">Customer Review</p>
              <p className="mt-1 text-sm text-gray-500">
                Sarah • ★★★★★
              </p>

              <p className="mt-5 text-gray-700">
                “Amazing service! The staff were friendly and everything
                was handled quickly. I will definitely come back!”
              </p>

              <div className="my-6 border-t border-gray-100" />

              <p className="font-semibold">AI Generated Reply</p>

              <p className="mt-3 leading-7 text-gray-600">
                Hi Sarah — thank you so much for your wonderful review!
                We're thrilled you had such a positive experience with our
                team. We look forward to welcoming you back soon!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-gray-100 bg-gray-50 px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">
              Everything you need to reply better
            </h2>

            <p className="mt-4 text-gray-600">
              Save time while keeping every customer interaction
              professional.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="text-3xl">⚡</div>
              <h3 className="mt-5 text-xl font-bold">
                Reply in seconds
              </h3>
              <p className="mt-3 leading-7 text-gray-600">
                Turn a customer review into a thoughtful response without
                spending minutes writing it yourself.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="text-3xl">🎯</div>
              <h3 className="mt-5 text-xl font-bold">
                Choose your tone
              </h3>
              <p className="mt-3 leading-7 text-gray-600">
                Create professional, friendly, warm, or concise responses
                based on your business style.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 shadow-sm">
              <div className="text-3xl">📋</div>
              <h3 className="mt-5 text-xl font-bold">
                Copy and publish
              </h3>
              <p className="mt-3 leading-7 text-gray-600">
                Copy your finished response with one click and post it
                wherever your customers left their review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">
              Simple pricing
            </h2>

            <p className="mt-4 text-gray-600">
              Start free and upgrade when your business grows.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold">Free</h3>

              <p className="mt-2 text-gray-600">
                For trying ReviewPilot
              </p>

              <div className="mt-6 text-4xl font-bold">
                $0
                <span className="text-base font-normal text-gray-500">
                  /month
                </span>
              </div>

              <ul className="mt-8 space-y-4 text-sm text-gray-700">
                <li>✓ 5 AI replies per month</li>
                <li>✓ Basic tones</li>
                <li>✓ Copy replies</li>
              </ul>

              <a
                href="/generate"
                className="mt-8 block rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold hover:bg-gray-50"
              >
                Start Free
              </a>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border-2 border-gray-900 bg-white p-8 shadow-md">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-1 text-xs font-semibold text-white">
                MOST POPULAR
              </div>

              <h3 className="text-xl font-bold">Pro</h3>

              <p className="mt-2 text-gray-600">
                For growing businesses
              </p>

              <div className="mt-6 text-4xl font-bold">
                $9
                <span className="text-base font-normal text-gray-500">
                  /month
                </span>
              </div>

              <ul className="mt-8 space-y-4 text-sm text-gray-700">
                <li>✓ 100 AI replies per month</li>
                <li>✓ All tones</li>
                <li>✓ Unlimited regeneration</li>
                <li>✓ Copy replies</li>
              </ul>

              <a
              href="/pricing"
                className="mt-8 block rounded-lg bg-gray-900 px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
              >
                Start Pro
              </a>
            </div>

            {/* Business */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold">Business</h3>

              <p className="mt-2 text-gray-600">
                For teams and agencies
              </p>

              <div className="mt-6 text-4xl font-bold">
                $29
                <span className="text-base font-normal text-gray-500">
                  /month
                </span>
              </div>

              <ul className="mt-8 space-y-4 text-sm text-gray-700">
                <li>✓ 500 AI replies per month</li>
                <li>✓ Multiple businesses</li>
                <li>✓ All tones</li>
                <li>✓ Unlimited regeneration</li>
              </ul>

              <a
                href="/pricing"
                className="mt-8 block rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold hover:bg-gray-50"
              >
                Start Business
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              How ReviewPilot works
            </h2>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 font-bold text-white">
                1
              </div>
              <h3 className="mt-5 text-lg font-bold">
                Paste the review
              </h3>
              <p className="mt-2 text-gray-600">
                Enter the customer's review.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 font-bold text-white">
                2
              </div>
              <h3 className="mt-5 text-lg font-bold">
                Choose your tone
              </h3>
              <p className="mt-2 text-gray-600">
                Select the style that fits your business.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 font-bold text-white">
                3
              </div>
              <h3 className="mt-5 text-lg font-bold">
                Generate and copy
              </h3>
              <p className="mt-2 text-gray-600">
                Get an AI response and copy it instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Stop spending time writing review replies.
          </h2>

          <p className="mt-4 text-gray-300">
            Let ReviewPilot create professional responses for you.
          </p>

          <a
            href="/generate"
            className="mt-8 inline-block rounded-xl bg-white px-7 py-3.5 font-semibold text-gray-900 hover:bg-gray-100"
          >
            Try ReviewPilot Free →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-6 pb-10 text-gray-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-sm">
            © 2026 ReviewPilot. All rights reserved.
          </p>

          <p className="text-sm">
            AI-powered review management.
          </p>
        </div>
      </footer>
    </main>
  );
}