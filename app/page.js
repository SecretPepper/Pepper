"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "../lib/supabase"

export default function Home() {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [theme, setTheme] = useState("dark")
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("pepper-theme")
    const initialTheme =
      savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")

    applyTheme(initialTheme)
    setTheme(initialTheme)

    loadPacks()

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription?.unsubscribe?.()
    }
  }, [])

  function applyTheme(value) {
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(value)
    window.localStorage.setItem("pepper-theme", value)
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  async function loadPacks() {
    setLoading(true)
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)

    if (!error) setPacks(data ?? [])
    setLoading(false)
  }

  async function handleAuth() {
    if (!email) {
      setMessage("Enter your email.")
      return
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password: Math.random().toString(36).slice(-12) })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage("Check your email to confirm your account!")
        setEmail("")
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage("Login link sent! Check your inbox.")
        setEmail("")
      }
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setMessage("Signed out.")
  }

  const accountStatus = user ? `Signed in as ${user.email}` : "Not signed in"

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <header className="border-b border-[var(--surface-border)] bg-[var(--surface)]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600/95 text-white shadow-red-600/20">
                P
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-red-400">Pepper</p>
                <h1 className="text-2xl font-semibold text-[var(--foreground)]">Texture Pack Hub</h1>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="rounded-full border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm text-red-200 transition hover:border-red-400 hover:bg-red-600/20">
              Browse
            </Link>
            <Link href="/upload" className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500">
              Upload Pack
            </Link>
            <button
              onClick={toggleTheme}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-red-400 hover:bg-red-600/20"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border surface-border surface-strong p-8 shadow-xl shadow-red-500/10 transition-colors duration-300">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-200">
                Minecraft Resource Packs
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">Find beautiful red & black texture packs made for Minecraft.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--foreground-muted)]">
                Browse the latest community uploads, create an account, and upload your own pack with one click. Designed for a sleek Modrinth-style experience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/upload" className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500">
                  Upload your pack
                </Link>
                <a href="#top-packs" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-200 transition hover:border-red-400">
                  Browse top packs
                </a>
              </div>
            </div>

            <div className="rounded-3xl border surface-border surface-strong p-6 transition-colors duration-300">
              <p className="text-sm uppercase tracking-[0.24em] text-red-400">Quick access</p>
              <p className="mt-3 text-[var(--foreground)]">Manage your account and upload packs.</p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border surface-border bg-[var(--surface)] p-4 transition-colors duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-[var(--foreground-muted)]">Account</p>
                    <span className="rounded-full bg-red-600/10 px-3 py-1 text-xs text-red-200">{user ? "Signed in" : "Guest"}</span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--foreground-muted)]">{accountStatus}</p>
                </div>

                {!user ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsSignUp(false)}
                        className={`flex-1 rounded-2xl py-2 text-xs font-semibold transition ${!isSignUp ? "bg-red-600 text-white" : "border border-white/10 bg-white/5 text-[var(--foreground)]"}`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setIsSignUp(true)}
                        className={`flex-1 rounded-2xl py-2 text-xs font-semibold transition ${isSignUp ? "bg-red-600 text-white" : "border border-white/10 bg-white/5 text-[var(--foreground)]"}`}
                      >
                        Sign Up
                      </button>
                    </div>
                    <label className="block text-sm font-medium text-[var(--foreground)]">Email</label>
                    <input
                      type="email"
                      value={email}
                      placeholder="you@example.com"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-red-500/70"
                    />
                    <button
                      onClick={handleAuth}
                      className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      {isSignUp ? "Create Account" : "Send login link"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={signOut}
                    className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-white/10"
                  >
                    Sign out
                  </button>
                )}

                {message && <p className="text-sm text-[var(--foreground-muted)]">{message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border surface-border surface-strong p-8 transition-colors duration-300">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-red-400">Render setup</p>
              <h3 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">Prepare your pack for a polished preview.</h3>
              <p className="mt-3 max-w-2xl text-[var(--foreground-muted)]">
                Use a clean preview image, add a strong red/black theme, and upload a ZIP or MCPACK file. Your pack will look great in the gallery.
              </p>
            </div>
            <div className="rounded-3xl border surface-border bg-[var(--surface)] p-5 shadow-red-500/5 transition-colors duration-300">
              <div className="mb-4 h-48 rounded-3xl bg-gradient-to-br from-red-600/20 via-black to-slate-900 p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.24em] text-red-200">Render Studio</span>
                  <span className="rounded-full bg-red-600/20 px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-red-100">Preview</span>
                </div>
                <div className="mt-8 flex h-28 items-end justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-6 w-28 rounded-full bg-white/10" />
                    <div className="h-4 w-20 rounded-full bg-white/10" />
                  </div>
                  <div className="h-20 w-20 rounded-3xl bg-white/10" />
                </div>
              </div>
              <div className="space-y-3 text-sm text-[var(--foreground-muted)]">
                <p className="font-semibold text-[var(--foreground)]">Steps for a stronger render</p>
                <ul className="space-y-2 pl-4">
                  <li>• Use a high-quality cover image or icon.</li>
                  <li>• Keep the name short and punchy.</li>
                  <li>• Add a description that highlights your theme.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="top-packs" className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-red-400">Latest uploads</p>
            <h3 className="text-3xl font-semibold text-[var(--foreground)]">Featured resource packs</h3>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="rounded-3xl border surface-border surface-strong p-8 text-[var(--foreground-muted)]">Loading packs…</div>
          ) : packs.length === 0 ? (
            <div className="rounded-3xl border surface-border surface-strong p-8 text-[var(--foreground-muted)]">No packs uploaded yet.</div>
          ) : (
            packs.map((pack) => (
              <article className="rounded-3xl border surface-border bg-[var(--surface)] p-6 shadow-xl shadow-red-500/5 transition hover:-translate-y-1 hover:border-red-600/30" key={pack.id}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="rounded-full bg-red-600/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-red-200">Resource Pack</p>
                  <span className="text-xs text-[var(--foreground-muted)]">{new Date(pack.created_at).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xl font-semibold text-[var(--foreground)]">{pack.name}</h4>
                <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">{pack.description || "A clean pack ready for Minecraft."}</p>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--foreground-muted)]">By {pack.owner_id?.slice(0, 8) ?? "anonymous"}</span>
                  <Link href="/upload" className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500">
                    Upload yours
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
