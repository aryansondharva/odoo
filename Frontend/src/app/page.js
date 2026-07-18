"use client"
import Link from "next/link";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <main className="max-w-4xl text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-white dark:via-slate-300 dark:to-white">
            OdooHack2026
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto dark:text-slate-400">
            A premium full-stack Next.js web application integrated with an Express/Prisma backend. Complete with authentication, session handling, user profiles, and responsive layouts.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center gap-4"
        >
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Create Account</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto"
        >
          <div className="p-5 bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-2">Next.js 14 App Router</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Modern frontend architecture with route handlers, server rendering optimization, and layouts.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-2">Express & Postgres</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Robust Express API with Prisma ORM mapping to a local/cloud PostgreSQL database.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl dark:bg-slate-900 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-2">Pre-built Auth</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Complete login, register, password reset, and state management using Zustand and Axios.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
