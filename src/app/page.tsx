"use client";

import React from 'react';
import { Shield, MapPin, Lock, Navigation, Download, LayoutDashboard, Zap, Smartphone } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-yellow-100 dark:bg-[#09090b] dark:text-zinc-100">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-xl font-bold text-white shadow-lg dark:bg-white dark:text-black">
              V
            </div>
            <span className="text-xl font-bold tracking-tight">VanGuard</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/login" className="text-sm font-medium transition-colors hover:text-yellow-600 dark:hover:text-yellow-400">
              Admin Portal
            </a>
            <a
              href="/login"
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-700 hover:shadow-lg active:scale-95 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 lg:pt-32">
        <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[800px] -translate-x-1/2 bg-yellow-400/10 blur-[120px] dark:bg-yellow-500/5" />
        
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-800 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500"></span>
                </span>
                Now Live: Version 1.0.0
              </div>
              
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                Precision <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">Tracking</span> for Modern Schools.
              </h1>

              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-600 lg:mx-0 dark:text-zinc-400">
                A high-performance transportation monitoring system. Secure, real-time vehicle telemetry designed for administrators who value reliability over hype.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <a href="/login" className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 font-bold text-white transition-all hover:bg-black hover:shadow-xl dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                  <LayoutDashboard size={20} />
                  Dashboard Access
                </a>
                <a href="https://github.com/madhusona/vanguard-mobile/releases/tag/v1.0.0" className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-8 py-4 font-bold transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-900">
                  <Download size={20} />
                  Driver App
                </a>
              </div>
            </div>

            <div className="relative lg:ml-auto">
              <div className="relative z-10 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs font-medium text-zinc-400">live_tracking_service</span>
                </div>
                <img 
                  src="vanmap.png" 
                  alt="Live Tracking Map" 
                  className="aspect-video w-full rounded-lg object-cover grayscale-[0.2] dark:brightness-90"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-64 w-64 rounded-full bg-yellow-400/20 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section (The "No AI" Bar replacement) */}
      <section className="border-y border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-yellow-500 p-2 text-white">
                <Zap size={24} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-xs">Engineering First</h3>
                <p className="text-lg font-semibold italic text-zinc-800 dark:text-zinc-200">"No AI. Just Reliable Software Engineering."</p>
              </div>
            </div>
            <div className="h-px w-full bg-zinc-200 md:h-12 md:w-px dark:bg-zinc-800" />
            <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              We focus on deterministic systems. Every coordinate and every notification is the result of robust architecture, not probabilistic guesses.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Built for Reliability</h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Everything you need to manage your fleet safely.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Live GPS", icon: <Navigation className="text-blue-500" />, desc: "Sub-second latency tracking with intelligent background syncing." },
            { title: "Secure Auth", icon: <Lock className="text-emerald-500" />, desc: "Enterprise-grade JWT authentication and role-based access." },
            { title: "Trip Logs", icon: <Shield className="text-purple-500" />, desc: "Automated history logging with tamper-proof timestamps." },
            { title: "Public Links", icon: <MapPin className="text-orange-500" />, desc: "Ephemeral tracking links for parents. No account required." },
          ].map((item, idx) => (
            <div key={idx} className="group rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-yellow-500/50 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="mb-4 inline-block rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">{item.icon}</div>
              <h3 className="mb-2 font-bold text-lg">{item.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hardware-Free Section */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-[2.5rem] bg-zinc-900 px-8 py-16 text-white dark:bg-white dark:text-zinc-900 lg:px-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-black">
                <Smartphone size={24} />
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl">Hardware-Free Implementation</h2>
              <p className="text-lg opacity-80">
                Ditch the expensive proprietary GPS boxes. VanGuard turns any driver's smartphone into a high-precision beacon.
              </p>
              <ul className="space-y-3 opacity-90">
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                  Zero upfront hardware costs
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                  Remote OTA updates via Play Store
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                  Optimized for low battery consumption
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm dark:border-black/5 dark:bg-black/5">
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Connection Strength</span>
                  <span className="text-yellow-400">99.9%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div className="h-full w-[99%] rounded-full bg-yellow-400" />
                </div>
                <p className="text-xs opacity-50">Drivers utilize native Android background services for persistent tracking even when the app is minimized.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-12 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
               <div className="h-6 w-6 rounded bg-black text-xs font-bold text-white flex items-center justify-center dark:bg-white dark:text-black">V</div>
               <span className="font-bold">VanGuard</span>
            </div>
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Lakgiri Engineering. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm font-medium text-zinc-500">
              <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}