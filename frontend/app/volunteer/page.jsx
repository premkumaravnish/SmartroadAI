'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const VolunteerMap = dynamic(() => import('../../components/VolunteerMap'), { ssr: false })
const PotholeAlertMap = dynamic(() => import('../../components/PotholeAlertMap'), { ssr: false })

/* ─────────────────────────────────────────
   GOOGLE FONTS INJECTION
───────────────────────────────────────── */
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Rajdhani:wght@400;500;600;700&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])
  return null
}

/* ─────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────── */
function AnimatedCounter({ target, duration = 1200 }) {
  const [val, setVal] = useState(0)
  const frame = useRef(null)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration])
  return <span>{val.toLocaleString()}</span>
}

/* ─────────────────────────────────────────
   GLASS CARD
───────────────────────────────────────── */
function GlassCard({ children, style = {}, hover = true }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: hovered ? "rgba(30,58,138,0.18)" : "rgba(15,23,42,0.7)",
        border: hovered ? "1px solid rgba(96,165,250,0.35)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: hovered
          ? "0 8px 40px rgba(59,130,246,0.18), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ label, value, icon, accent, sub }) {
  return (
    <GlassCard style={{ padding: "20px", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 11, color: "#475569", letterSpacing: "0.12em", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
            {label}
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 26, fontWeight: 600, color: "#f1f5f9", lineHeight: 1 }}>
            <AnimatedCounter target={value} />
          </div>
          {sub && <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 11, color: "#10b981", marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${accent}18`, border: `1px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{icon}</div>
      </div>
      <div style={{ marginTop: 14, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min((value / 100) * 100, 100)}%`, height: "100%", background: `linear-gradient(90deg,${accent},${accent}88)`, borderRadius: 999 }} />
      </div>
    </GlassCard>
  )
}

/* ─────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "upload", label: "Report Pothole", icon: "📤" },
  { id: "my-reports", label: "My Reports", icon: "☰" },
  { id: "map", label: "Live Map", icon: "◉" },
  { id: "rewards", label: "Rewards", icon: "🪙" },
]

function Sidebar({ active, setActive, collapsed, user }) {
  const router = useRouter()
  return (
    <div style={{
      width: collapsed ? 64 : 220,
      minHeight: "100vh",
      background: "linear-gradient(180deg, rgba(10,15,30,0.98) 0%, rgba(8,12,28,0.98) 100%)",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column",
      transition: "width 0.3s ease",
      position: "relative", zIndex: 10, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "24px 0" : "24px 20px",
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        justifyContent: collapsed ? "center" : "flex-start",
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: "linear-gradient(135deg, #10b981, #059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: "#fff",
          boxShadow: "0 4px 14px rgba(16,185,129,0.5)"
        }}>🛣</div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0", letterSpacing: "0.05em", lineHeight: 1 }}>SMARTROAD</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#10b981", letterSpacing: "0.15em", marginTop: 2 }}>VOLUNTEER</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => setActive(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: collapsed ? "10px 0" : "10px 12px",
              borderRadius: 10,
              border: "none", cursor: "pointer",
              background: isActive ? "linear-gradient(90deg, rgba(16,185,129,0.35), rgba(16,185,129,0.1))" : "transparent",
              color: isActive ? "#34d399" : "#64748b",
              fontFamily: "'Exo 2',sans-serif", fontWeight: isActive ? 600 : 400, fontSize: 13,
              transition: "all 0.2s", width: "100%",
              justifyContent: collapsed ? "center" : "flex-start",
              position: "relative",
              borderLeft: isActive ? "2px solid #10b981" : "2px solid transparent",
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = isActive ? "linear-gradient(90deg, rgba(16,185,129,0.35), rgba(16,185,129,0.1))" : "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = isActive ? "#34d399" : "#64748b"; e.currentTarget.style.background = isActive ? "linear-gradient(90deg, rgba(16,185,129,0.35), rgba(16,185,129,0.1))" : "transparent"; }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* User profile + Logout */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {!collapsed && user && (
          <div style={{ padding: "8px 12px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg,#10b981,#059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "#fff", fontWeight: 700
            }}>{user.name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#e2e8f0", fontWeight: 500 }}>{user.name}</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#475569" }}>{user.email}</div>
            </div>
          </div>
        )}
        <button onClick={() => {
          localStorage.removeItem('smartroad_user')
          router.push('/')
        }} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: collapsed ? "10px 0" : "10px 12px",
          borderRadius: 10, border: "none", cursor: "pointer",
          background: "transparent", color: "#64748b",
          fontFamily: "'Exo 2',sans-serif", fontSize: 13, width: "100%",
          justifyContent: collapsed ? "center" : "flex-start",
          transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ fontSize: 16 }}>⏻</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   TOPBAR
───────────────────────────────────────── */
function Topbar({ page, backendOnline, sidebarCollapsed, setSidebarCollapsed, wallet, user }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const titles = { dashboard: "Dashboard", upload: "Report a Pothole", "my-reports": "My Reports", map: "Live Pothole Map", rewards: "Rewards & Wallet" }

  return (
    <div style={{
      height: 60, background: "rgba(10,15,30,0.92)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", padding: "0 20px", gap: 16,
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <button onClick={() => setSidebarCollapsed(p => !p)} style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8, color: "#64748b", width: 32, height: 32, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0,
      }}>☰</button>

      <div style={{ flex: 1 }}>
        <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 18, color: "#e2e8f0", letterSpacing: "0.05em" }}>
          {titles[page] || page}
        </span>
      </div>

      {/* Backend status */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
        borderRadius: 999, fontSize: 11, fontFamily: "'IBM Plex Mono',monospace",
        background: backendOnline ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.1)",
        border: backendOnline ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.35)",
        color: backendOnline ? "#4ade80" : "#f87171",
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%", background: backendOnline ? "#4ade80" : "#f87171",
          boxShadow: backendOnline ? "0 0 6px #4ade80" : "0 0 6px #f87171",
          display: "inline-block"
        }} />
        {backendOnline ? "ONLINE" : "OFFLINE"}
      </div>

      {/* Wallet mini */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "5px 14px",
        borderRadius: 999, fontSize: 12,
        background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))",
        border: "1px solid rgba(16,185,129,0.3)",
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981, #059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(16,185,129,0.4)",
        }}>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 10, color: "#fff" }}>SR</span>
        </div>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: "#34d399" }}>
          {wallet} SR
        </span>
      </div>

      {/* Profile */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setProfileOpen(o => !o)} style={{
          display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "5px 10px",
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: "linear-gradient(135deg,#10b981,#059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#fff", fontWeight: 700
          }}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#cbd5e1", fontWeight: 500 }}>
            {user?.name || 'User'}
          </span>
          <span style={{ color: "#475569", fontSize: 10 }}>▾</span>
        </button>
        {profileOpen && (
          <div style={{
            position: "absolute", right: 0, top: 44, width: 200, zIndex: 100,
            background: "rgba(13,20,40,0.98)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}>
            {["My Profile", "Settings", "Help Center", "Logout"].map(item => (
              <div key={item} style={{
                padding: "10px 16px", fontSize: 12, color: "#94a3b8", fontFamily: "'Exo 2',sans-serif", cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.08)"; e.currentTarget.style.color = "#34d399"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                onClick={() => {
                  if (item === 'Logout') { localStorage.removeItem('smartroad_user'); router.push('/'); }
                  setProfileOpen(false);
                }}
              >{item}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   DASHBOARD PAGE
───────────────────────────────────────── */
function DashboardPage({ wallet, totalReports, totalDetections, backendOnline, setActive, user }) {
  return (
    <div style={{ padding: "24px" }}>
      {!backendOnline && (
        <div style={{
          marginBottom: 20, padding: "12px 20px", borderRadius: 10,
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#fca5a5", fontFamily: "'Exo 2',sans-serif", fontSize: 13,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span>⚠</span> Backend offline — some features may be unavailable.
        </div>
      )}

      {/* Welcome banner */}
      <GlassCard hover={false} style={{
        padding: "28px 32px", marginBottom: 24,
        background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.08))",
        border: "1px solid rgba(16,185,129,0.25)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 22, color: "#e2e8f0", marginBottom: 4 }}>
              Welcome back, {user?.name || 'Volunteer'}! 👋
            </div>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "#94a3b8" }}>
              Help your city by reporting potholes. Earn SmartCoins for every validated report.
            </div>
          </div>
          <button onClick={() => setActive('upload')} style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            border: "none", color: "#fff", padding: "12px 28px", borderRadius: 10,
            fontFamily: "'Exo 2',sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(16,185,129,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(16,185,129,0.4)"; }}
          >
            📤 Report New Pothole
          </button>
        </div>
      </GlassCard>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="My Reports" value={totalReports} icon="📋" accent="#3b82f6" sub="Total submissions" />
        <StatCard label="Detections" value={totalDetections} icon="🔍" accent="#0ea5e9" sub="Confirmed potholes" />
        <StatCard label="SR Coins" value={wallet} icon="🪙" accent="#10b981" sub="Earned total" />
        <StatCard label="Rank" value={1} icon="🏆" accent="#fbbf24" sub="Top contributor" />
      </div>

      {/* Quick actions */}
      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 12 }}>QUICK ACTIONS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <GlassCard style={{ padding: 24, cursor: "pointer" }}>
          <div onClick={() => setActive('upload')} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📸</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0", letterSpacing: "0.05em", marginBottom: 6 }}>UPLOAD IMAGE</div>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#64748b" }}>Upload a photo for AI pothole analysis</div>
          </div>
        </GlassCard>
        <GlassCard style={{ padding: 24, cursor: "pointer" }}>
          <div onClick={() => setActive('upload')} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎥</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0", letterSpacing: "0.05em", marginBottom: 6 }}>UPLOAD VIDEO</div>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#64748b" }}>Video for multi-frame detection</div>
          </div>
        </GlassCard>
        <GlassCard style={{ padding: 24, cursor: "pointer" }}>
          <div onClick={() => setActive('map')} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0", letterSpacing: "0.05em", marginBottom: 6 }}>LIVE MAP</div>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#64748b" }}>View reported potholes on map</div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   UPLOAD / REPORT PAGE
───────────────────────────────────────── */
function UploadPage({ file, setFile, preview, setPreview, desc, setDesc, location, setLocation, error, setError, loading, handleSubmit, detectionResult, setDetectionResult, fileRef, wallet }) {
  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(f)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setError('Location access denied')
      )
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) return setError('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setError('Location access denied')
    )
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Left: Upload area */}
        <GlassCard hover={false} style={{ padding: 24 }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 16 }}>
            UPLOAD MEDIA
          </div>

          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: "none" }} />

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: "2px dashed rgba(16,185,129,0.3)",
              borderRadius: 14,
              padding: preview ? 0 : "40px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: "rgba(16,185,129,0.04)",
              transition: "all 0.2s",
              overflow: "hidden",
              minHeight: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.6)"; e.currentTarget.style.background = "rgba(16,185,129,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)"; e.currentTarget.style.background = "rgba(16,185,129,0.04)"; }}
          >
            {preview ? (
              <div style={{ width: "100%", position: "relative" }}>
                {file?.type?.startsWith('video') ? (
                  <video src={preview} controls style={{ width: "100%", borderRadius: 12, maxHeight: 280 }} />
                ) : (
                  <img src={preview} alt="Preview" style={{ width: "100%", borderRadius: 12, maxHeight: 280, objectFit: "cover" }} />
                )}
                <div style={{
                  position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "#4ade80",
                  padding: "4px 10px", borderRadius: 8, fontSize: 11, fontFamily: "'IBM Plex Mono',monospace",
                }}>
                  ✓ {file?.name}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 42, marginBottom: 12 }}>📤</div>
                <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 14, color: "#94a3b8", marginBottom: 4 }}>
                  Click to upload or drag & drop
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#475569" }}>
                  Supports: JPG, PNG, MP4, AVI | Max 50MB
                </div>
              </div>
            )}
          </div>

          {file && (
            <button onClick={() => { setFile(null); setPreview(null) }} style={{
              marginTop: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171", padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
              fontFamily: "'Exo 2',sans-serif",
            }}>✕ Remove File</button>
          )}
        </GlassCard>

        {/* Right: Location + Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Location */}
          <GlassCard hover={false} style={{ padding: 24, flex: 1 }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 14 }}>
              LOCATION
            </div>
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", height: 150, marginBottom: 12 }}>
              <VolunteerMap location={location} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={requestLocation} style={{
                background: "linear-gradient(135deg,#10b981,#059669)", border: "none", color: "#fff",
                padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                fontFamily: "'Exo 2',sans-serif", fontWeight: 600,
                boxShadow: "0 2px 10px rgba(16,185,129,0.3)",
              }}>📍 Get Location</button>
              {location && (
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#4ade80" }}>
                  {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
                </span>
              )}
            </div>
          </GlassCard>

          {/* Description */}
          <GlassCard hover={false} style={{ padding: 24, flex: 1 }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: 14 }}>
              DESCRIPTION
            </div>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe the pothole — size, road name, landmarks nearby..."
              style={{
                width: "100%", minHeight: 80, background: "rgba(15,23,42,0.6)",
                border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10,
                color: "#e2e8f0", padding: "12px 14px", fontSize: 13,
                fontFamily: "'Exo 2',sans-serif", resize: "vertical", outline: "none",
                transition: "border-color 0.2s", boxSizing: "border-box",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
            />
            <label style={{
              display: "flex", alignItems: "center", gap: 8, marginTop: 10,
              fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#94a3b8", cursor: "pointer",
            }}>
              <input type="checkbox" style={{ accentColor: "#f87171" }} />
              <span>⚠ Mark as Critical / Dangerous</span>
            </label>
          </GlassCard>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: 16, padding: "10px 18px", borderRadius: 10,
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#fca5a5", fontFamily: "'Exo 2',sans-serif", fontSize: 13,
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Submit button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <button onClick={handleSubmit} disabled={loading} style={{
          background: loading ? "rgba(100,116,139,0.3)" : "linear-gradient(135deg, #10b981, #059669)",
          border: "none", color: "#fff", padding: "14px 48px", borderRadius: 12,
          fontFamily: "'Exo 2',sans-serif", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 6px 30px rgba(16,185,129,0.4)",
          transition: "all 0.2s", letterSpacing: "0.05em",
          display: "flex", alignItems: "center", gap: 10,
        }}
        >
          {loading ? (
            <>
              <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Analyzing with AI...
            </>
          ) : (
            <>🚀 Submit Report & Earn Coins</>
          )}
        </button>
      </div>

      {/* Detection Results */}
      {detectionResult && (
        <GlassCard hover={false} style={{
          padding: 24,
          background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))",
          border: "1px solid rgba(16,185,129,0.25)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 18, color: "#e2e8f0", letterSpacing: "0.05em" }}>
              DETECTION RESULTS
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 16px",
              borderRadius: 999, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 6px rgba(16,185,129,0.4)",
              }}>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 8, color: "#fff" }}>SR</span>
              </div>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, fontSize: 13, color: "#34d399" }}>+10 SR Coins Earned!</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              {detectionResult.annotated ? (
                <img src={detectionResult.annotated} alt="annotated" style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }} />
              ) : (
                <div style={{
                  height: 200, borderRadius: 12, background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#475569",
                  fontFamily: "'Exo 2',sans-serif", fontSize: 13,
                }}>Annotated image unavailable</div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <GlassCard hover={false} style={{ padding: "16px 20px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 11, color: "#64748b", letterSpacing: "0.1em", fontWeight: 600 }}>TOTAL DETECTIONS</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 32, fontWeight: 700, color: "#60a5fa", lineHeight: 1.3 }}>{detectionResult.total_detections}</div>
              </GlassCard>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div style={{ padding: "12px", borderRadius: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", textAlign: "center" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 20, fontWeight: 700, color: "#4ade80" }}>{detectionResult.severity_breakdown?.Minor || 0}</div>
                  <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.1em" }}>MINOR</div>
                </div>
                <div style={{ padding: "12px", borderRadius: 10, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", textAlign: "center" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 20, fontWeight: 700, color: "#fbbf24" }}>{detectionResult.severity_breakdown?.Moderate || 0}</div>
                  <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.1em" }}>MODERATE</div>
                </div>
                <div style={{ padding: "12px", borderRadius: 10, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", textAlign: "center" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 20, fontWeight: 700, color: "#f87171" }}>{detectionResult.severity_breakdown?.Major || 0}</div>
                  <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.1em" }}>MAJOR</div>
                </div>
              </div>

              <button onClick={() => setDetectionResult(null)} style={{
                background: "linear-gradient(135deg, #10b981, #059669)", border: "none", color: "#fff",
                padding: "10px 24px", borderRadius: 10, fontFamily: "'Exo 2',sans-serif", fontWeight: 600,
                fontSize: 13, cursor: "pointer", marginTop: 8,
              }}>✓ Done — Report Saved</button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   MY REPORTS PAGE
───────────────────────────────────────── */
function MyReportsPage({ reports }) {
  return (
    <div style={{ padding: 24 }}>
      <GlassCard hover={false} style={{ padding: 20 }}>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 16, color: "#e2e8f0", letterSpacing: "0.05em", marginBottom: 16 }}>
          YOUR SUBMITTED REPORTS
        </div>
        {reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>📭</div>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 14, color: "#64748b" }}>No reports yet. Start by uploading a pothole image!</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr>
                  {["ID", "Date", "Location", "Detections", "Severity", "Status"].map(h => (
                    <th key={h} style={{
                      padding: "8px 12px", textAlign: "left",
                      fontFamily: "'Exo 2',sans-serif", fontSize: 10, fontWeight: 700,
                      color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase",
                      borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 10).map((r, i) => (
                  <tr key={r.id || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#34d399" }}>RPT-{String(r.id || i).padStart(4, '0')}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#94a3b8" }}>
                      {r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#cbd5e1", maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.lat && r.lon ? `${Number(r.lat).toFixed(4)}, ${Number(r.lon).toFixed(4)}` : r.description || 'N/A'}
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "#e2e8f0", textAlign: "center" }}>
                      {r.total_detections || r.detections || 0}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", gap: 2, height: 8, borderRadius: 4, overflow: "hidden", minWidth: 80 }}>
                        <div style={{ width: `${((r.severity_breakdown?.Minor || 0) / Math.max((r.total_detections || 1), 1)) * 100}%`, background: "#4ade80", borderRadius: 2 }} />
                        <div style={{ width: `${((r.severity_breakdown?.Moderate || 0) / Math.max((r.total_detections || 1), 1)) * 100}%`, background: "#fbbf24", borderRadius: 2 }} />
                        <div style={{ width: `${((r.severity_breakdown?.Major || 0) / Math.max((r.total_detections || 1), 1)) * 100}%`, background: "#f87171", borderRadius: 2 }} />
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{
                        background: "rgba(16,185,129,0.15)", color: "#34d399",
                        border: "1px solid rgba(16,185,129,0.3)",
                        padding: "3px 10px", borderRadius: 999,
                        fontSize: 11, fontWeight: 600, fontFamily: "'Exo 2',sans-serif",
                      }}>Submitted</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

/* ─────────────────────────────────────────
   MAP PAGE
───────────────────────────────────────── */
function MapPage({ reports }) {
  return (
    <div style={{ padding: 24 }}>
      <GlassCard hover={false} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 16, color: "#e2e8f0", letterSpacing: "0.05em" }}>
            LIVE POTHOLE MAP
          </div>
          <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#64748b", marginTop: 2 }}>
            {reports.length} potholes reported across your area
          </div>
        </div>
        <div style={{ height: 500 }}>
          <PotholeAlertMap />
        </div>
      </GlassCard>
    </div>
  )
}

/* ─────────────────────────────────────────
   REWARDS PAGE
───────────────────────────────────────── */
function RewardsPage({ wallet }) {
  const rewards = [
    { name: "Bus Pass (1 Day)", cost: 50, icon: "🚌", desc: "Free city bus travel for 24 hours" },
    { name: "Coffee Voucher", cost: 30, icon: "☕", desc: "Redeemable at partner cafes" },
    { name: "Movie Ticket", cost: 100, icon: "🎬", desc: "Single movie ticket at any PVR" },
    { name: "Tree Planting", cost: 20, icon: "🌳", desc: "A tree planted in your name" },
    { name: "City Tour Pass", cost: 150, icon: "🏛️", desc: "Free heritage city tour" },
    { name: "Gym Day Pass", cost: 40, icon: "💪", desc: "1-day gym access at partner venues" },
  ]

  return (
    <div style={{ padding: 24 }}>
      {/* Wallet Card */}
      <GlassCard hover={false} style={{
        padding: "32px",
        background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08), rgba(59,130,246,0.06))",
        border: "1px solid rgba(16,185,129,0.25)",
        marginBottom: 28,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          {/* Coin */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669, #0ea5e9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(16,185,129,0.4), inset 0 2px 4px rgba(255,255,255,0.2)",
            position: "relative",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #34d399)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid rgba(255,255,255,0.2)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)",
            }}>
              <span style={{ fontSize: 28, fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>SR</span>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#94a3b8", letterSpacing: "0.12em", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
              YOUR SMARTROAD WALLET
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 42, fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>
                <AnimatedCounter target={wallet} />
              </span>
              <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 16, color: "#34d399", fontWeight: 600 }}>SR Coins</span>
            </div>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#64748b", marginTop: 6 }}>
              Earn 10 coins per verified pothole report
            </div>
          </div>

          {/* Earning summary */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 600, color: "#34d399" }}>+10</div>
              <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "#475569", letterSpacing: "0.1em" }}>PER REPORT</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 600, color: "#fbbf24" }}>x2</div>
              <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: "#475569", letterSpacing: "0.1em" }}>MAJOR BONUS</div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Rewards Grid */}
      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 16, color: "#e2e8f0", letterSpacing: "0.05em", marginBottom: 16 }}>
        REDEEM REWARDS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {rewards.map((r, i) => (
          <GlassCard key={i} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ fontSize: 32 }}>{r.icon}</div>
              <div style={{
                padding: "4px 10px", borderRadius: 999,
                background: wallet >= r.cost ? "rgba(16,185,129,0.12)" : "rgba(100,116,139,0.12)",
                border: `1px solid ${wallet >= r.cost ? "rgba(16,185,129,0.3)" : "rgba(100,116,139,0.2)"}`,
              }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 600,
                  color: wallet >= r.cost ? "#34d399" : "#64748b",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 6, fontWeight: 800, color: "#fff",
                  }}>SR</span>
                  {r.cost}
                </span>
              </div>
            </div>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{r.name}</div>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#64748b", marginBottom: 14 }}>{r.desc}</div>
            <button
              disabled={wallet < r.cost}
              style={{
                width: "100%",
                background: wallet >= r.cost ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(100,116,139,0.15)",
                border: "none", color: wallet >= r.cost ? "#fff" : "#475569",
                padding: "8px 16px", borderRadius: 8,
                fontFamily: "'Exo 2',sans-serif", fontWeight: 600, fontSize: 12,
                cursor: wallet >= r.cost ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >{wallet >= r.cost ? 'Redeem Now' : 'Not Enough Coins'}</button>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   USER LOGIN SCREEN
───────────────────────────────────────── */
function UserLoginScreen({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSignUp && !name) return setError('Please enter your name')
    if (!email || !password) return setError('Please fill in all fields')
    const userData = {
      name: isSignUp ? name : email.split('@')[0],
      email,
      wallet: 12,
      loggedIn: true,
      joinedDate: new Date().toISOString()
    }
    localStorage.setItem('smartroad_user', JSON.stringify(userData))
    onLogin(userData)
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1526 50%, #0a1628 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <FontLoader />
      {/* Background effects */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "20%", left: "10%", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)",
          filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "15%", width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)",
          filter: "blur(60px)",
        }} />
      </div>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, boxShadow: "0 8px 32px rgba(16,185,129,0.4)",
          }}>🛣</div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 22, color: "#e2e8f0", letterSpacing: "0.05em" }}>
            SMARTROAD <span style={{ color: "#10b981" }}>VOLUNTEER</span>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#475569", marginTop: 4, letterSpacing: "0.1em" }}>
            POTHOLE DETECTION NETWORK
          </div>
        </div>

        {/* Login card */}
        <div style={{
          background: "rgba(15,23,42,0.8)", border: "1px solid rgba(16,185,129,0.15)",
          borderRadius: 20, padding: 36,
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontWeight: 700, fontSize: 20, color: "#e2e8f0" }}>
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </div>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "#64748b", marginTop: 4 }}>
              {isSignUp ? 'Join the pothole detection network' : 'Sign in to continue reporting'}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {isSignUp && (
              <div>
                <label style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 8 }}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0",
                    fontFamily: "'Exo 2',sans-serif", fontSize: 14, outline: "none",
                    transition: "border-color 0.2s", boxSizing: "border-box",
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"}
                  onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>
            )}
            <div>
              <label style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 8 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0",
                  fontFamily: "'Exo 2',sans-serif", fontSize: 14, outline: "none",
                  transition: "border-color 0.2s", boxSizing: "border-box",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
            <div>
              <label style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 8 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0",
                  fontFamily: "'Exo 2',sans-serif", fontSize: 14, outline: "none",
                  transition: "border-color 0.2s", boxSizing: "border-box",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>

            {error && (
              <div style={{
                padding: "8px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: "#fca5a5",
              }}>⚠ {error}</div>
            )}

            <button type="submit" style={{
              background: "linear-gradient(135deg, #10b981, #059669)", border: "none", color: "#fff",
              padding: "14px 24px", borderRadius: 12, fontFamily: "'Exo 2',sans-serif", fontWeight: 700,
              fontSize: 15, cursor: "pointer", marginTop: 4,
              boxShadow: "0 6px 30px rgba(16,185,129,0.35)",
              transition: "transform 0.2s, box-shadow 0.2s",
              letterSpacing: "0.02em",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 40px rgba(16,185,129,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 30px rgba(16,185,129,0.35)"; }}
            >
              {isSignUp ? 'Create Account →' : 'Sign In →'}
            </button>

            <div style={{ textAlign: "center", marginTop: 4 }}>
              <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "#64748b" }}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError('') }} style={{
                background: "none", border: "none", color: "#34d399", cursor: "pointer",
                fontFamily: "'Exo 2',sans-serif", fontSize: 13, fontWeight: 600,
              }}>{isSignUp ? 'Sign In' : 'Sign Up'}</button>
            </div>
          </form>

          {/* Benefits */}
          <div style={{
            marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", justifyContent: "center", gap: 20,
          }}>
            {[
              { icon: "🪙", label: "Earn Coins" },
              { icon: "📊", label: "Track Reports" },
              { icon: "🏆", label: "Leaderboard" },
            ].map((b, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{b.icon}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#475569", letterSpacing: "0.1em" }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN VOLUNTEER PAGE
───────────────────────────────────────── */
export default function VolunteerPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activePage, setActivePage] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)

  // Upload state
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [desc, setDesc] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [detectionResult, setDetectionResult] = useState(null)
  const [wallet, setWallet] = useState(12)
  const [reports, setReports] = useState([])
  const fileRef = useRef(null)

  // Check login status
  useEffect(() => {
    const stored = localStorage.getItem('smartroad_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.loggedIn) {
          setUser(parsed)
          setWallet(parsed.wallet || 12)
        }
      } catch (e) { /* ignore */ }
    }
    setIsLoading(false)
  }, [])

  // Fetch reports & check backend
  useEffect(() => {
    fetchPotholes()
    checkBackend()
    const interval = setInterval(checkBackend, 10000)
    return () => clearInterval(interval)
  }, [])

  const checkBackend = async () => {
    try {
      const res = await fetch('http://localhost:5000/reports', { method: 'HEAD' })
      setBackendOnline(res.ok)
    } catch { setBackendOnline(false) }
  }

  const fetchPotholes = async () => {
    try {
      const response = await fetch('http://localhost:5000/reports')
      if (!response.ok) throw new Error('Failed')
      const data = await response.json()
      setReports(data)
      setBackendOnline(true)
    } catch (err) {
      console.error('Error fetching potholes:', err)
      setBackendOnline(false)
    }
  }

  const handleSubmit = async () => {
    if (!file) return setError('Please choose an image or video to upload')
    setLoading(true)
    setError(null)

    if (!location && navigator.geolocation) {
      await new Promise((res) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => { setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }); res() },
          () => res()
        )
      })
    }

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('description', desc || '')
      if (location) {
        fd.append('lat', location.lat)
        fd.append('lon', location.lon)
      }

      const resp = await fetch('http://localhost:5000/upload', {
        method: 'POST', body: fd,
        headers: { 'Accept': 'application/json' },
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        setError(err.error || 'Upload failed')
        setLoading(false)
        return
      }

      const data = await resp.json()

      if (data.total_detections && data.total_detections > 0) {
        setDetectionResult(data)
        const newWallet = typeof data.wallet === 'number' ? data.wallet : wallet + 10
        setWallet(newWallet)
        // Update stored user
        const stored = localStorage.getItem('smartroad_user')
        if (stored) {
          const parsed = JSON.parse(stored)
          parsed.wallet = newWallet
          localStorage.setItem('smartroad_user', JSON.stringify(parsed))
        }
        fetchPotholes()
      } else {
        setDetectionResult(null)
        alert(data.message || 'No pothole detected in the provided media.')
      }

      setError(null)
    } catch (err) {
      console.error(err)
      setError('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setWallet(userData.wallet || 12)
  }

  // Loading screen
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FontLoader />
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
            animation: "pulse 1.5s infinite",
          }}>🛣</div>
          <div style={{ fontFamily: "'Exo 2',sans-serif", color: "#64748b", fontSize: 13 }}>Loading SmartRoad...</div>
        </div>
      </div>
    )
  }

  // Show login if not logged in
  if (!user) {
    return <UserLoginScreen onLogin={handleLogin} />
  }

  const totalDetections = reports.reduce((sum, r) => sum + (r.total_detections || r.detections || 0), 0)

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1526 50%, #0a1628 100%)",
      fontFamily: "'Exo 2', 'Inter', sans-serif",
      color: "#e2e8f0",
    }}>
      <FontLoader />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      <Sidebar active={activePage} setActive={setActivePage} collapsed={sidebarCollapsed} user={user} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>
        <Topbar
          page={activePage}
          backendOnline={backendOnline}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          wallet={wallet}
          user={user}
        />

        <div style={{ flex: 1, overflow: "auto" }}>
          {activePage === "dashboard" && (
            <DashboardPage
              wallet={wallet}
              totalReports={reports.length}
              totalDetections={totalDetections}
              backendOnline={backendOnline}
              setActive={setActivePage}
              user={user}
            />
          )}
          {activePage === "upload" && (
            <UploadPage
              file={file} setFile={setFile}
              preview={preview} setPreview={setPreview}
              desc={desc} setDesc={setDesc}
              location={location} setLocation={setLocation}
              error={error} setError={setError}
              loading={loading}
              handleSubmit={handleSubmit}
              detectionResult={detectionResult}
              setDetectionResult={setDetectionResult}
              fileRef={fileRef}
              wallet={wallet}
            />
          )}
          {activePage === "my-reports" && <MyReportsPage reports={reports} />}
          {activePage === "map" && <MapPage reports={reports} />}
          {activePage === "rewards" && <RewardsPage wallet={wallet} />}
        </div>
      </div>
    </div>
  )
}
