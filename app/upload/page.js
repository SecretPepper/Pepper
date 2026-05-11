"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../lib/supabase"

export default function Upload() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [email, setEmail] = useState("")
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState("")
  const [theme, setTheme] = useState("dark")
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("pepper-theme")
    const initialTheme =
      savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")

    applyTheme(initialTheme)
    setTheme(initialTheme)

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }

    loadSession()
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

  async function handleAuth() {
    if (!email) {
      setStatus("Enter your email.")
      return
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password: Math.random().toString(36).slice(-12) })
      if (error) {
        setStatus(error.message)
      } else {
        setStatus("Check your email to confirm your account!")
        setEmail("")
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) {
        setStatus(error.message)
      } else {
        setStatus("Login link sent! Check your inbox.")
        setEmail("")
      }
    }
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
  }

  async function createPack() {
    const { data } = await supabase.auth.getUser()
    const currentUser = data.user

    if (!currentUser) {
      setStatus("Please sign in before uploading.")
      return
    }

    if (!name.trim() || !file) {
      setStatus("Give your pack a name and choose a file.")
      return
    }

    setStatus("Uploading pack...")
    const fileName = `${Date.now()}_${file.name}`
    const storagePath = `${currentUser.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("resource-packs")
      .upload(storagePath, file, { cacheControl: "3600", upsert: true })

    if (uploadError) {
      setStatus(`Upload failed: ${uploadError.message}`)
      return
    }

    const { error: insertError } = await supabase.from("projects").insert({
      name: name.trim(),
      owner_id: currentUser.id,
      description: description.trim() || null
    })

    if (insertError) {
      setStatus(`Database error: ${insertError.message}`)
      return
    }

    setStatus("Pack uploaded successfully! Redirecting…")
    setTimeout(() => router.push("/"), 1400)
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border surface-border surface-strong px-6 py-5 shadow-xl shadow-red-500/10 transition-colors duration-300 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-red-400">Upload</p>
            <h1 className="text-3xl font-semibold text-[var(--foreground)]">Submit your resource pack</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-600/20"
            >
              Back to browse
            </Link>
            <button
              onClick={toggleTheme}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-red-400 hover:bg-red-600/20"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-3xl border surface-border surface-strong p-8 shadow-lg shadow-red-600/5 transition-colors duration-300">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[var(--foreground)]">Pack name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Red Ember Texture Pack"
                className="w-full rounded-2xl border border-white/10 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-red-500/70"
              />

              <label className="block text-sm font-medium text-[var(--foreground)]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description for your pack."
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-red-500/70"
              />

              <label className="block text-sm font-medium text-[var(--foreground)]">Pack file</label>
              <input
                type="file"
                accept=".zip,.mcpack,.rar,.tar,.gz"
                onChange={handleFileChange}
                className="w-full rounded-2xl border border-white/10 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />

              <button
                onClick={createPack}
                className="w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Upload pack
              </button>

              {status && <p className="text-sm text-[var(--foreground-muted)]">{status}</p>}
            </div>
          </div>

          <aside className="rounded-3xl border surface-border surface-strong p-8 shadow-lg shadow-red-500/5 transition-colors duration-300">
            <div className="space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-red-400">Account</p>
                <p className="mt-3 text-[var(--foreground)]">{user ? `Signed in as ${user.email}` : "Sign in to enable uploads."}</p>
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
                <p className="text-sm text-[var(--foreground-muted)]">Ready to upload! Select your pack file and give it a name.</p>
              )}

              <div className="rounded-2xl border surface-border bg-[var(--surface)] p-4 transition-colors duration-300">
                <p className="text-sm uppercase tracking-[0.24em] text-red-400">Render setup</p>
                <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                  Use a strong preview image and a short name. A clear description helps your texture pack stand out.
                </p>
              </div>

              {status && <p className="text-sm text-[var(--foreground-muted)]">{status}</p>}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
