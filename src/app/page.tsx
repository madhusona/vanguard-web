import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-black text-white flex items-center justify-center font-bold">
            V
          </div>
          <span className="text-xl font-semibold">VanGuard</span>
        </div>

        <nav className="flex gap-4">
          <a
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium bg-black text-white hover:bg-zinc-800"
          >
            Web Login
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 grid gap-12 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Real-Time School Vehicle <br /> Tracking & Safety Platform
          </h1>

          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            VanGuard is a secure, real-time school transportation monitoring
            system that enables schools, administrators, and parents to track
            school vehicles live with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-white font-medium hover:bg-zinc-800"
            >
              Login to Dashboard
            </a>

            <a
              href="/downloads/VanGuard.apk"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-6 py-3 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Download Driver App
            </a>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="flex justify-center">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm w-full max-w-md">
            <p className="text-sm text-zinc-500 mb-2">Live Tracking Preview</p>
            <div className="h-56 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
              Map View (Live GPS)
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Key Features
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Live GPS Tracking",
              desc: "Real-time vehicle location with background tracking support.",
            },
            {
              title: "Secure Authentication",
              desc: "JWT-based secure access for drivers and administrators.",
            },
            {
              title: "Trip Management",
              desc: "Start and end trips with automatic route logging.",
            },
            {
              title: "Public Tracking Links",
              desc: "Share secure, time-limited tracking links with parents.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900"
            >
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Login & App Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 bg-zinc-100 dark:bg-zinc-900 rounded-3xl my-20">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-4">
              Access VanGuard
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Administrators can manage vehicles and drivers through the web
              dashboard. Drivers use the mobile app for secure background GPS
              tracking during trips.
            </p>

            <div className="flex gap-4">
              <a
                href="/login"
                className="rounded-lg bg-black px-6 py-3 text-white font-medium hover:bg-zinc-800"
              >
                Web Dashboard Login
              </a>

              <a
                href="/downloads/VanGuard.apk"
                className="rounded-lg border border-zinc-300 px-6 py-3 font-medium hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Download Android App
              </a>
            </div>
          </div>

          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            <ul className="space-y-2">
              <li>• Android background GPS service</li>
              <li>• Battery-optimized tracking</li>
              <li>• Secure API communication</li>
              <li>• Automatic reconnection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row justify-between gap-4 text-sm text-zinc-500">
          <span>© {new Date().getFullYear()} Lakgiri • VanGuard</span>
          <span>Secure School Transportation Platform</span>
        </div>
      </footer>
    </div>
  );
}