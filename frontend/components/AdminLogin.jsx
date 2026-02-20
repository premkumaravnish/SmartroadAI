"use client"

import { useState } from "react"

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Simple validation for demo
      if (!email || !password) {
        setError("Please enter email and password")
        setLoading(false)
        return
      }

      // For demo: accept admin@smartroad.ai / admin123
      if (email === "admin@smartroad.ai" && password === "admin123") {
        // Store auth token in localStorage
        localStorage.setItem("adminAuth", JSON.stringify({ email, token: "admin_token_" + Date.now() }))
        onLogin(email)
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans flex items-center justify-center">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="fixed top-0 left-0 w-[600px] h-[400px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-purple-600/6 rounded-full blur-[100px] pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl border border-white/[0.1] bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl shadow-blue-500/10">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/20">⬡</div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">SmartRoad</span>
                <span className="text-cyan-400 font-extrabold text-2xl tracking-tight">AI</span>
              </div>
              <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mt-1">Admin Console</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-white mb-2.5 tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartroad.ai"
                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.02] text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-colors duration-200"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-white mb-2.5 tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.02] text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-colors duration-200"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-base hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/40 active:scale-95 shadow-lg shadow-blue-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-[11px] text-white/40 text-center mb-3 font-mono">Demo Credentials</p>
            <div className="space-y-1 text-[11px] text-white/30 font-mono">
              <p><span className="text-white/50">Email:</span> admin@smartroad.ai</p>
              <p><span className="text-white/50">Password:</span> admin123</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-[10px] text-white/20 font-mono">
            SmartRoad AI © 2026 • Municipal Operations
          </div>
        </div>
      </div>
    </div>
  )
}
