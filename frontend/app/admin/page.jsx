"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from "recharts";

// Dynamically import map component with SSR disabled (Leaflet requires window)
const PotholeAlertMap = dynamic(
  () => import('../../components/PotholeAlertMap'),
  { ssr: false, loading: () => <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>Loading map...</div> }
);

/* ─────────────────────────────────────────
   GOOGLE FONTS INJECTION
───────────────────────────────────────── */
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Rajdhani:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
};

/* ─────────────────────────────────────────
   INITIAL / LIVE DATA (replaced dummy data)
───────────────────────────────────────── */
const INITIAL_STATS = {
  total_uploads: 0,
  total_detections: 0,
  minor: 0,
  moderate: 0,
  major: 0,
  active_reports: 0,
};

const STATUS_COLORS = {
  "In Progress":       { bg: "rgba(59,130,246,0.18)", text: "#60a5fa", border: "rgba(59,130,246,0.4)" },
  "Under Review":      { bg: "rgba(251,191,36,0.15)", text: "#fbbf24", border: "rgba(251,191,36,0.4)" },
  "Site Verification": { bg: "rgba(168,85,247,0.15)", text: "#c084fc", border: "rgba(168,85,247,0.4)" },
  "Completed":         { bg: "rgba(34,197,94,0.15)",  text: "#4ade80", border: "rgba(34,197,94,0.4)"  },
};

const SEV_COLOR = { Minor: "#4ade80", Moderate: "#fbbf24", Major: "#f87171" };

const MOCK_REPORTS = [];

const UPLOAD_OVER_TIME = [];

const SOURCE_DATA = [];

const REPAIR_RATE = [];

const PIE_DATA = [];

const NOTIFS = [
  { id:1, msg:"New major pothole cluster on NH-48", time:"2m ago",  read:false },
  { id:2, msg:"RPT-0085 escalated to Site Verification", time:"14m ago", read:false },
  { id:3, msg:"RPT-0090 marked Completed by admin", time:"1h ago",  read:true  },
  { id:4, msg:"Backend reconnected after 3s outage", time:"2h ago", read:true  },
];

function formatLocation(r) {
  if (!r) return "";
  if (r.lat !== undefined && r.lng !== undefined && r.lat !== null && r.lng !== null) {
    try { return `${Number(r.lat).toFixed(6)}, ${Number(r.lng).toFixed(6)}`; } catch(e) { /* fallthrough */ }
  }
  if (r.location) return String(r.location);
  if (r.description) return String(r.description);
  return "";
}

/* ─────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────── */
function AnimatedCounter({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  const frame = useRef(null);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return <span>{val.toLocaleString()}</span>;
}

/* ─────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────── */
function Badge({ status }) {
  const c = STATUS_COLORS[status] || { bg:"rgba(100,116,139,0.2)", text:"#94a3b8", border:"rgba(100,116,139,0.4)" };
  return (
    <span style={{
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
      padding: "3px 10px", borderRadius: 999,
      fontSize: 11, fontWeight: 600, fontFamily: "'Exo 2', sans-serif",
      letterSpacing: "0.05em", whiteSpace:"nowrap"
    }}>{status}</span>
  );
}

/* ─────────────────────────────────────────
   SEVERITY BAR
───────────────────────────────────────── */
function SevBar({ s }) {
  const total = s.minor + s.moderate + s.major || 1;
  return (
    <div style={{ display:"flex", gap:2, height:8, borderRadius:4, overflow:"hidden", minWidth:80 }}>
      <div style={{ width:`${(s.minor/total)*100}%`, background:"#4ade80", borderRadius:2 }} title={`Minor: ${s.minor}`}/>
      <div style={{ width:`${(s.moderate/total)*100}%`, background:"#fbbf24", borderRadius:2 }} title={`Mod: ${s.moderate}`}/>
      <div style={{ width:`${(s.major/total)*100}%`, background:"#f87171", borderRadius:2 }} title={`Major: ${s.major}`}/>
    </div>
  );
}

/* ─────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────── */
function ProgressBar({ pct }) {
  const color = pct === 100 ? "#4ade80" : pct > 60 ? "#60a5fa" : pct > 30 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.06)", borderRadius:999, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:999, transition:"width 0.6s ease" }}/>
      </div>
      <span style={{ fontSize:10, color:"#94a3b8", fontFamily:"'IBM Plex Mono',monospace", minWidth:28 }}>{pct}%</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   GLASS CARD
───────────────────────────────────────── */
function GlassCard({ children, style={}, hover=true }) {
  const [hovered, setHovered] = useState(false);
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
  );
}

/* ─────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────── */
const NAV_ITEMS = [
  { id:"dashboard", label:"Dashboard",   icon:"▦" },
  { id:"reports",   label:"Reports",     icon:"☰" },
  { id:"map",       label:"Map View",    icon:"◉" },
  { id:"analytics", label:"Analytics",   icon:"◈" },
  { id:"settings",  label:"Settings",    icon:"⚙" },
];

function Sidebar({ active, setActive, collapsed }) {
  const router = useRouter();
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
          width:34, height:34, borderRadius:8, flexShrink:0,
          background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:16, fontWeight:700, color:"#fff",
          boxShadow: "0 4px 14px rgba(29,78,216,0.5)"
        }}>🛣</div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:15, color:"#e2e8f0", letterSpacing:"0.05em", lineHeight:1 }}>SMARTROAD</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#3b82f6", letterSpacing:"0.15em", marginTop:2 }}>AI ADMIN</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, padding: "12px 8px", display:"flex", flexDirection:"column", gap:2 }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)} style={{
              display:"flex", alignItems:"center", gap:10,
              padding: collapsed ? "10px 0" : "10px 12px",
              borderRadius:10,
              border:"none", cursor:"pointer",
              background: isActive ? "linear-gradient(90deg, rgba(37,99,235,0.35), rgba(37,99,235,0.1))" : "transparent",
              color: isActive ? "#60a5fa" : "#64748b",
              fontFamily:"'Exo 2',sans-serif", fontWeight:isActive?600:400, fontSize:13,
              transition:"all 0.2s", width:"100%",
              justifyContent: collapsed ? "center" : "flex-start",
              position:"relative",
              borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
            }}
            onMouseEnter={e => { if(!isActive) e.currentTarget.style.color="#94a3b8"; e.currentTarget.style.background=isActive?"linear-gradient(90deg, rgba(37,99,235,0.35), rgba(37,99,235,0.1))":"rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.color=isActive?"#60a5fa":"#64748b"; e.currentTarget.style.background=isActive?"linear-gradient(90deg, rgba(37,99,235,0.35), rgba(37,99,235,0.1))":"transparent"; }}
            >
              <span style={{ fontSize:16, lineHeight:1 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding:"12px 8px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => router.push('/')} style={{
          display:"flex", alignItems:"center", gap:10,
          padding: collapsed ? "10px 0" : "10px 12px",
          borderRadius:10, border:"none", cursor:"pointer",
          background:"transparent", color:"#64748b",
          fontFamily:"'Exo 2',sans-serif", fontSize:13, width:"100%",
          justifyContent: collapsed ? "center" : "flex-start",
          transition:"all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.color="#f87171"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.color="#64748b"; e.currentTarget.style.background="transparent"; }}
        >
          <span style={{ fontSize:16 }}>⏻</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TOP NAVBAR
───────────────────────────────────────── */
function Topbar({ page, darkMode, setDarkMode, backendOnline, lastUpdated, sidebarCollapsed, setSidebarCollapsed }) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unread = NOTIFS.filter(n => !n.read).length;

  const titles = { dashboard:"Dashboard Overview", reports:"Reports", map:"Map View", analytics:"Analytics", settings:"Settings" };

  return (
    <div style={{
      height:60, background:"rgba(10,15,30,0.92)", backdropFilter:"blur(20px)",
      borderBottom:"1px solid rgba(255,255,255,0.06)",
      display:"flex", alignItems:"center", padding:"0 20px", gap:16,
      position:"sticky", top:0, zIndex:50,
    }}>
      {/* Collapse toggle */}
      <button onClick={() => setSidebarCollapsed(p=>!p)} style={{
        background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:8, color:"#64748b", width:32, height:32, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0,
      }}>☰</button>

      {/* Page title */}
      <div style={{ flex:1 }}>
        <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:18, color:"#e2e8f0", letterSpacing:"0.05em" }}>
          {titles[page] || page}
        </span>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#475569", marginLeft:12 }}>
          Updated {lastUpdated}
        </span>
      </div>

      {/* Backend status */}
      <div style={{
        display:"flex", alignItems:"center", gap:6, padding:"5px 12px",
        borderRadius:999, fontSize:11, fontFamily:"'IBM Plex Mono',monospace",
        background: backendOnline ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.1)",
        border: backendOnline ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.35)",
        color: backendOnline ? "#4ade80" : "#f87171",
      }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background: backendOnline ? "#4ade80" : "#f87171",
          boxShadow: backendOnline ? "0 0 6px #4ade80" : "0 0 6px #f87171",
          animation: backendOnline ? "pulse 2s infinite" : "none",
          display:"inline-block"
        }}/>
        {backendOnline ? "CONNECTED" : "OFFLINE"}
      </div>

      {/* Dark mode toggle */}
      <button onClick={() => setDarkMode(d=>!d)} style={{
        background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:8, color:"#94a3b8", width:32, height:32, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
      }}>{darkMode ? "☀" : "🌙"}</button>

      {/* Notifications */}
      <div style={{ position:"relative" }}>
        <button onClick={() => { setNotifOpen(o=>!o); setProfileOpen(false); }} style={{
          background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:8, color:"#94a3b8", width:32, height:32, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, position:"relative",
        }}>
          🔔
          {unread > 0 && (
            <span style={{ position:"absolute", top:-4, right:-4, width:16, height:16, borderRadius:"50%",
              background:"#3b82f6", fontSize:9, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:700, fontFamily:"'IBM Plex Mono',monospace"
            }}>{unread}</span>
          )}
        </button>
        {notifOpen && (
          <div style={{
            position:"absolute", right:0, top:40, width:300, zIndex:100,
            background:"rgba(13,20,40,0.98)", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:14, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.6)",
          }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", fontFamily:"'Exo 2',sans-serif", fontWeight:600, fontSize:12, color:"#94a3b8", letterSpacing:"0.1em" }}>
              NOTIFICATIONS
            </div>
            {NOTIFS.map(n => (
              <div key={n.id} style={{
                padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)",
                background: n.read ? "transparent" : "rgba(59,130,246,0.05)",
                display:"flex", gap:8, alignItems:"flex-start",
              }}>
                {!n.read && <span style={{ width:6, height:6, borderRadius:"50%", background:"#3b82f6", marginTop:5, flexShrink:0 }}/>}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color: n.read?"#64748b":"#cbd5e1", fontFamily:"'Exo 2',sans-serif" }}>{n.msg}</div>
                  <div style={{ fontSize:10, color:"#475569", fontFamily:"'IBM Plex Mono',monospace", marginTop:2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile */}
      <div style={{ position:"relative" }}>
        <button onClick={() => { setProfileOpen(o=>!o); setNotifOpen(false); }} style={{
          display:"flex", alignItems:"center", gap:8, cursor:"pointer",
          background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:10, padding:"5px 10px",
        }}>
          <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#1d4ed8,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", fontWeight:700 }}>A</div>
          <span style={{ fontFamily:"'Exo 2',sans-serif", fontSize:12, color:"#cbd5e1", fontWeight:500 }}>Admin</span>
          <span style={{ color:"#475569", fontSize:10 }}>▾</span>
        </button>
        {profileOpen && (
          <div style={{
            position:"absolute", right:0, top:44, width:200, zIndex:100,
            background:"rgba(13,20,40,0.98)", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:12, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.6)",
          }}>
            {["Profile Settings","Change Password","API Keys","Logout"].map(item => (
              <div key={item} style={{ padding:"10px 16px", fontSize:12, color:"#94a3b8", fontFamily:"'Exo 2',sans-serif", cursor:"pointer",
                borderBottom:"1px solid rgba(255,255,255,0.04)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(59,130,246,0.08)"; e.currentTarget.style.color="#60a5fa"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#94a3b8"; }}
              onClick={() => { if (item === 'Logout') { setProfileOpen(false); router.push('/'); } }}
              >{item}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ label, value, icon, accent, sub }) {
  return (
    <GlassCard style={{ padding:"20px", flex:1, minWidth:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Exo 2',sans-serif", fontSize:11, color:"#475569", letterSpacing:"0.12em", fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>
            {label}
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:26, fontWeight:600, color:"#f1f5f9", lineHeight:1 }}>
            <AnimatedCounter target={value} />
          </div>
          {sub && <div style={{ fontFamily:"'Exo 2',sans-serif", fontSize:11, color:"#3b82f6", marginTop:6 }}>{sub}</div>}
        </div>
        <div style={{
          width:44, height:44, borderRadius:12, flexShrink:0,
          background: `${accent}18`, border:`1px solid ${accent}30`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
        }}>{icon}</div>
      </div>
      <div style={{ marginTop:14, height:3, borderRadius:999, background:"rgba(255,255,255,0.04)", overflow:"hidden" }}>
        <div style={{ width:`${Math.min((value/2000)*100,100)}%`, height:"100%", background:`linear-gradient(90deg,${accent},${accent}88)`, borderRadius:999 }}/>
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────
   DASHBOARD PAGE
───────────────────────────────────────── */
function DashboardPage({ stats, reports, backendOnline }) {
  return (
    <div style={{ padding:"24px" }}>
      {/* Offline banner */}
      {!backendOnline && (
        <div style={{
          marginBottom:20, padding:"12px 20px", borderRadius:10,
          background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)",
          color:"#fca5a5", fontFamily:"'Exo 2',sans-serif", fontSize:13,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span>⚠</span> Backend offline — showing cached data. Real-time updates paused.
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:14, marginBottom:28 }}>
        <StatCard label="Total Uploads"     value={stats.total_uploads}   icon="📤" accent="#3b82f6" sub="+12 today"/>
        <StatCard label="Total Detections"  value={stats.total_detections} icon="🔍" accent="#0ea5e9" sub="All time"/>
        <StatCard label="Minor"             value={stats.minor}            icon="🟢" accent="#4ade80" sub="Low severity"/>
        <StatCard label="Moderate"          value={stats.moderate}         icon="🟡" accent="#fbbf24" sub="Medium severity"/>
        <StatCard label="Major"             value={stats.major}            icon="🔴" accent="#f87171" sub="High severity"/>
        <StatCard label="Active Reports"    value={stats.active_reports}   icon="📋" accent="#c084fc" sub="Pending action"/>
      </div>

      {/* Recent activity */}
      <GlassCard hover={false} style={{ padding:"20px" }}>
        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:16, color:"#e2e8f0", letterSpacing:"0.05em", marginBottom:16 }}>
          RECENT ACTIVITY
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
            <thead>
              <tr>
                {["Report ID","Type","Source","Location","Detections","Severity","Status","Progress"].map(h => (
                  <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontFamily:"'Exo 2',sans-serif", fontSize:10, fontWeight:700, color:"#475569", letterSpacing:"0.1em", textTransform:"uppercase", borderBottom:"1px solid rgba(255,255,255,0.06)", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r,i) => (
                <tr key={r.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)", transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(59,130,246,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <td style={{ padding:"10px 12px", fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#60a5fa", whiteSpace:"nowrap" }}>{r.id}</td>
                  <td style={{ padding:"10px 12px", fontFamily:"'Exo 2',sans-serif", fontSize:12 }}>
                    <span style={{ color: r.type==="Video"?"#c084fc":"#94a3b8" }}>{r.type==="Video"?"▶":"🖼"} {r.type}</span>
                  </td>
                  <td style={{ padding:"10px 12px", fontFamily:"'Exo 2',sans-serif", fontSize:12, color:"#94a3b8" }}>{r.source}</td>
                  <td style={{ padding:"10px 12px", fontFamily:"'Exo 2',sans-serif", fontSize:12, color:"#cbd5e1", maxWidth:180, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{formatLocation(r)}</td>
                  <td style={{ padding:"10px 12px", fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#e2e8f0", textAlign:"center" }}>{r.detections}</td>
                  <td style={{ padding:"10px 12px", minWidth:100 }}><SevBar s={r.severity}/></td>
                  <td style={{ padding:"10px 12px" }}><Badge status={r.status}/></td>
                  <td style={{ padding:"10px 12px", minWidth:120 }}><ProgressBar pct={r.progress}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

/* ─────────────────────────────────────────
   REPORTS PAGE
───────────────────────────────────────── */
function ReportsPage({ reports }) {
  const [search, setSearch]               = useState("");
  const [filterSev, setFilterSev]         = useState("All");
  const [filterStatus, setFilterStatus]   = useState("All");
  const [filterSource, setFilterSource]   = useState("All");
  const [selectedReport, setSelectedReport] = useState(null);
  const [page, setPage]                   = useState(0);
  const [editStatus, setEditStatus]       = useState("");
  const [editProgress, setEditProgress]   = useState(0);
  const [notes, setNotes]                 = useState("");
  const [evidenceOpen, setEvidenceOpen]   = useState(false);
  const [artifacts, setArtifacts]         = useState(null);
  const [artifactLog, setArtifactLog]     = useState(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const PER_PAGE = 5;

  const filtered = reports.filter(r => {
    const idStr = String(r.id || '');
    const locStr = String(formatLocation(r) || '');
    const srcStr = String(r.source || '');
    const q = String(search || '').toLowerCase();
    const matchSearch = idStr.toLowerCase().includes(q) ||
      locStr.toLowerCase().includes(q) ||
      srcStr.toLowerCase().includes(q);
    const matchSev = filterSev === "All" || (
      filterSev === "Minor" ? r.severity.minor > r.severity.moderate && r.severity.minor > r.severity.major :
      filterSev === "Moderate" ? r.severity.moderate >= r.severity.major : r.severity.major > 0
    );
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    const matchSource = filterSource === "All" || r.source === filterSource;
    return matchSearch && matchSev && matchStatus && matchSource;
  });

  const paged = filtered.slice(page * PER_PAGE, (page+1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const exportCSV = () => {
    const header = "ID,Type,Source,Location,Detections,Minor,Moderate,Major,Status,Progress\n";
    const rows = filtered.map(r =>
      `${r.id},${r.type},${r.source},"${formatLocation(r)}",${r.detections},${r.severity.minor},${r.severity.moderate},${r.severity.major},${r.status},${r.progress}%`
    ).join("\n");
    const blob = new Blob([header+rows], { type:"text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="smartroad_reports.csv"; a.click();
  };

  const openReport = (r) => { setSelectedReport(r); setEditStatus(r.status); setEditProgress(r.progress); setNotes(""); };

  const fetchArtifacts = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/admin/report/${id}/artifacts`);
      if (!res.ok) throw new Error('no artifacts');
      const data = await res.json();
      if (data?.success) {
        setArtifacts(data.data || null);
        // fetch log content if present
        if (data.data?.log) {
          try {
            const logRes = await fetch(`${backendUrl}${data.data.log}`);
            if (logRes.ok) {
              const txt = await logRes.text();
              try { setArtifactLog(JSON.parse(txt)); } catch(e) { setArtifactLog(txt); }
            }
          } catch(e) { setArtifactLog(null); }
        } else {
          setArtifactLog(null);
        }
      }
    } catch (err) {
      setArtifacts(null);
      setArtifactLog(null);
    }
  };

  if (selectedReport) {
    return (
      <>
        <div style={{ padding:24 }}>
        <button onClick={() => setSelectedReport(null)} style={{
          background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
          color:"#94a3b8", padding:"7px 14px", borderRadius:8, cursor:"pointer",
          fontFamily:"'Exo 2',sans-serif", fontSize:12, marginBottom:20, display:"flex", alignItems:"center", gap:6
        }}>← Back to Reports</button>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          {/* Media preview */}
          <GlassCard style={{ padding:20 }}>
            <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:14, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:14 }}>MEDIA PREVIEW</div>
            <div style={{
              width:"100%", aspectRatio:"16/9", borderRadius:10, overflow:"hidden",
              background:"linear-gradient(135deg,rgba(15,23,42,0.9),rgba(17,24,39,0.9))",
              border:"1px solid rgba(255,255,255,0.07)",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8,
              position:"relative",
            }}>
              {selectedReport.image_with_detections ? (
                selectedReport.image_with_detections.startsWith('data:') || selectedReport.image_with_detections.startsWith('http') ? (
                  <img src={selectedReport.image_with_detections} alt="detection" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                ) : (
                  <img src={`${backendUrl}${selectedReport.image_with_detections}`} alt="detection" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                )
              ) : selectedReport.image_path ? (
                selectedReport.image_path.startsWith('data:') || selectedReport.image_path.startsWith('http') ? (
                  <img src={selectedReport.image_path} alt="uploaded" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                ) : (
                  <img src={`${backendUrl}${selectedReport.image_path}`} alt="uploaded" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                )
              ) : (
                <>
                  <span style={{ fontSize:40 }}>{selectedReport.type==="Video"?"🎥":"📸"}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569" }}>{selectedReport.type} · {selectedReport.source}</span>
                  <div style={{ padding:12, color:'#94a3b8' }}>No preview available</div>
                </>
              )}
            </div>
            <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[["Report ID", selectedReport.id],["Location", formatLocation(selectedReport)],["Detections",selectedReport.detections],["Source",selectedReport.source],["Description", selectedReport.description || "-"]].map(([k,v])=>(
                <div key={k}>
                  <div style={{ fontFamily:"'Exo 2',sans-serif", fontSize:10, color:"#475569", letterSpacing:"0.1em", marginBottom:3 }}>{k}</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"e2e8f0" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              <button onClick={async ()=>{ await fetchArtifacts(selectedReport.id); setEvidenceOpen(true); }} style={{ padding:'8px 12px', borderRadius:8, background:'#0ea5e9', color:'#fff', border:'none', cursor:'pointer' }}>View Evidence</button>
              {selectedReport.artifacts_url && <a href={selectedReport.artifacts_url} target="_blank" rel="noreferrer" style={{ padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.04)', color:'#94a3b8', textDecoration:'none' }}>Open Artifacts Folder</a>}
            </div>
          </GlassCard>

          {/* Right panel */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Severity breakdown */}
            <GlassCard style={{ padding:20 }}>
              <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:14, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:14 }}>SEVERITY BREAKDOWN</div>
              {Object.entries(selectedReport.severity).map(([k,v]) => (
                <div key={k} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontFamily:"'Exo 2',sans-serif", fontSize:12, color: SEV_COLOR[k.charAt(0).toUpperCase()+k.slice(1)] || "#94a3b8", textTransform:"capitalize" }}>{k}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#e2e8f0" }}>{v}</span>
                  </div>
                  <div style={{ height:6, borderRadius:999, background:"rgba(255,255,255,0.05)", overflow:"hidden" }}>
                    <div style={{ width:`${(v/selectedReport.detections)*100}%`, height:"100%", background:SEV_COLOR[k.charAt(0).toUpperCase()+k.slice(1)]||"#94a3b8", borderRadius:999 }}/>
                  </div>
                </div>
              ))}
            </GlassCard>

            {/* Admin controls */}
            <GlassCard style={{ padding:20 }}>
              <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:14, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:14 }}>ADMIN CONTROLS</div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontFamily:"'Exo 2',sans-serif", fontSize:11, color:"#475569", display:"block", marginBottom:6, letterSpacing:"0.08em" }}>STATUS</label>
                <select value={editStatus} onChange={e=>setEditStatus(e.target.value)} style={{
                  width:"100%", padding:"8px 10px", borderRadius:8,
                  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                  color:"#e2e8f0", fontFamily:"'Exo 2',sans-serif", fontSize:12, cursor:"pointer",
                }}>
                  {Object.keys(STATUS_COLORS).map(s=><option key={s} value={s} style={{background:"#0f172a"}}>{s}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontFamily:"'Exo 2',sans-serif", fontSize:11, color:"#475569", display:"block", marginBottom:6, letterSpacing:"0.08em" }}>
                  PROGRESS: <span style={{ color:"#60a5fa", fontFamily:"'IBM Plex Mono',monospace" }}>{editProgress}%</span>
                </label>
                <input type="range" min={0} max={100} value={editProgress} onChange={e=>setEditProgress(+e.target.value)} style={{ width:"100%", accentColor:"#3b82f6" }}/>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontFamily:"'Exo 2',sans-serif", fontSize:11, color:"#475569", display:"block", marginBottom:6, letterSpacing:"0.08em" }}>INTERNAL NOTES</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Add admin notes..." style={{
                  width:"100%", padding:"8px 10px", borderRadius:8,
                  background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                  color:"#e2e8f0", fontFamily:"'Exo 2',sans-serif", fontSize:12, resize:"vertical",
                  boxSizing:"border-box",
                }}/>
              </div>
              <button style={{
                width:"100%", padding:"9px", borderRadius:8, cursor:"pointer",
                background:"linear-gradient(90deg,#1d4ed8,#0ea5e9)",
                border:"none", color:"#fff", fontFamily:"'Exo 2',sans-serif", fontWeight:600, fontSize:13,
                letterSpacing:"0.05em",
              }}>SAVE CHANGES</button>
            </GlassCard>
          </div>
        </div>
      </div>

        
        {evidenceOpen ? (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1200, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:'90%', maxWidth:1100, maxHeight:'90%', overflow:'auto', borderRadius:12, background:'#071029', padding:16, boxShadow:'0 40px 120px rgba(2,6,23,0.8)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:16, color:'#e2e8f0', fontWeight:700 }}>Detection Evidence - Report {selectedReport.id}</div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => { setEvidenceOpen(false); setArtifacts(null); setArtifactLog(null); }} style={{ padding:'6px 10px', borderRadius:8, background:'rgba(255,255,255,0.04)', color:'#94a3b8', border:'none' }}>Close</button>
                </div>
              </div>

              <div style={{ display:'flex', gap:12, marginBottom:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:'#94a3b8', marginBottom:6 }}>Original</div>
                  {artifacts?.original ? (
                    <video controls style={{ width:'100%', borderRadius:8, background:'#000' }} src={`${backendUrl}${artifacts.original}`} />
                  ) : (
                    <div style={{ padding:12, color:'#94a3b8' }}>Original video not available</div>
                  )}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:'#94a3b8', marginBottom:6 }}>Annotated</div>
                  {artifacts?.annotated ? (
                    <video controls style={{ width:'100%', borderRadius:8, background:'#000' }} src={`${backendUrl}${artifacts.annotated}`} />
                  ) : (
                    <div style={{ padding:12, color:'#94a3b8' }}>Annotated video not available</div>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:'#94a3b8', marginBottom:6 }}>Detection Log</div>
                  <div style={{ background:'#041027', border:'1px solid rgba(255,255,255,0.03)', borderRadius:8, padding:10, maxHeight:240, overflow:'auto' }}>
                    <pre style={{ whiteSpace:'pre-wrap', wordBreak:'break-word', color:'#cbd5e1', fontSize:12 }}>{artifactLog ? (typeof artifactLog === 'string' ? artifactLog : JSON.stringify(artifactLog, null, 2)) : 'No detection log available'}</pre>
                  </div>
                </div>
                <div style={{ width:240 }}>
                  <div style={{ fontSize:12, color:'#94a3b8', marginBottom:6 }}>Thumbnails</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {artifacts?.thumbs && artifacts.thumbs.length > 0 ? (
                      artifacts.thumbs.map((t, i) => (
                        <img key={i} src={`${backendUrl}${t}`} style={{ width:'100%', height:80, objectFit:'cover', borderRadius:6 }} />
                      ))
                    ) : (
                      <div style={{ color:'#94a3b8' }}>No thumbnails</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div style={{ padding:24 }}>
      {/* Filters toolbar */}
      <GlassCard hover={false} style={{ padding:"14px 16px", marginBottom:20 }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} placeholder="🔍  Search reports..." style={{
            flex:1, minWidth:200, padding:"7px 12px", borderRadius:8,
            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
            color:"#e2e8f0", fontFamily:"'Exo 2',sans-serif", fontSize:12, outline:"none",
          }}/>
          {[["Severity",["All","Minor","Moderate","Major"],filterSev,setFilterSev],
            ["Status",["All",...Object.keys(STATUS_COLORS)],filterStatus,setFilterStatus],
            ["Source",["All","User","Dashcam","Vehicle Camera"],filterSource,setFilterSource],
          ].map(([label,opts,val,set]) => (
            <select key={label} value={val} onChange={e=>{set(e.target.value);setPage(0);}} style={{
              padding:"7px 10px", borderRadius:8, fontFamily:"'Exo 2',sans-serif", fontSize:12,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
              color:"#94a3b8", cursor:"pointer", outline:"none",
            }}>
              {opts.map(o=><option key={o} value={o} style={{background:"#0f172a"}}>{label}: {o}</option>)}
            </select>
          ))}
          <button onClick={exportCSV} style={{
            padding:"7px 14px", borderRadius:8, cursor:"pointer",
            background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.3)",
            color:"#60a5fa", fontFamily:"'Exo 2',sans-serif", fontSize:12, fontWeight:600,
            whiteSpace:"nowrap",
          }}>⬇ Export CSV</button>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard hover={false} style={{ padding:20 }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
            <thead>
              <tr>
                {["Report ID","Type","Source","Location","Detections","Severity","Status","Progress","Action"].map(h => (
                  <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontFamily:"'Exo 2',sans-serif", fontSize:10, fontWeight:700, color:"#475569", letterSpacing:"0.1em", textTransform:"uppercase", borderBottom:"1px solid rgba(255,255,255,0.06)", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(r => (
                <tr key={r.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)", cursor:"pointer", transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(59,130,246,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  onClick={() => openReport(r)}
                >
                  <td style={{ padding:"10px 12px", fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#60a5fa" }}>{r.id}</td>
                  <td style={{ padding:"10px 12px", fontFamily:"'Exo 2',sans-serif", fontSize:12, color: r.type==="Video"?"#c084fc":"#94a3b8" }}>{r.type==="Video"?"▶":"🖼"} {r.type}</td>
                  <td style={{ padding:"10px 12px", fontFamily:"'Exo 2',sans-serif", fontSize:12, color:"#94a3b8" }}>{r.source}</td>
                  <td style={{ padding:"10px 12px", fontFamily:"'Exo 2',sans-serif", fontSize:12, color:"#cbd5e1", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{formatLocation(r)}</td>
                  <td style={{ padding:"10px 12px", fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#e2e8f0", textAlign:"center" }}>{r.detections}</td>
                  <td style={{ padding:"10px 12px", minWidth:100 }}><SevBar s={r.severity}/></td>
                  <td style={{ padding:"10px 12px" }}><Badge status={r.status}/></td>
                  <td style={{ padding:"10px 12px", minWidth:120 }}><ProgressBar pct={r.progress}/></td>
                  <td style={{ padding:"10px 12px" }}>
                    <button style={{ background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.25)", color:"#60a5fa", padding:"4px 10px", borderRadius:6, cursor:"pointer", fontFamily:"'Exo 2',sans-serif", fontSize:11 }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16, padding:"0 4px" }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#475569" }}>
            {filtered.length} result{filtered.length!==1?"s":""} · page {page+1}/{totalPages||1}
          </span>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{ padding:"5px 12px", borderRadius:6, cursor:page===0?"default":"pointer", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:page===0?"#334155":"#94a3b8", fontFamily:"'Exo 2',sans-serif", fontSize:12 }}>← Prev</button>
            {Array.from({length:totalPages||1},(_,i)=>i).map(i=>(
              <button key={i} onClick={()=>setPage(i)} style={{ padding:"5px 10px", borderRadius:6, cursor:"pointer", background:i===page?"rgba(59,130,246,0.2)":"rgba(255,255,255,0.04)", border:i===page?"1px solid rgba(59,130,246,0.4)":"1px solid rgba(255,255,255,0.08)", color:i===page?"#60a5fa":"#94a3b8", fontFamily:"'IBM Plex Mono',monospace", fontSize:11 }}>{i+1}</button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} style={{ padding:"5px 12px", borderRadius:6, cursor:page>=totalPages-1?"default":"pointer", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:page>=totalPages-1?"#334155":"#94a3b8", fontFamily:"'Exo 2',sans-serif", fontSize:12 }}>Next →</button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAP VIEW PAGE
───────────────────────────────────────── */
function MapPage({ reports }) {
  const [selected, setSelected] = useState(null);

  // Simulate a map with relative positioning on a stylized grid background
  const PIN_COLORS = { "In Progress":"#60a5fa", "Under Review":"#fbbf24", "Site Verification":"#c084fc", "Completed":"#4ade80" };

  // Decide severity level for a report (prefer highest severity present)
  const severityLevel = (r) => {
    if (!r || !r.severity) return 'Minor';
    if ((r.severity.major || 0) > 0) return 'Major';
    if ((r.severity.moderate || 0) > 0) return 'Moderate';
    return 'Minor';
  };

  const SEV_COLOR = { Minor: '#4ade80', Moderate: '#fbbf24', Major: '#f87171' };

  // Normalize lat/lng to canvas coords (Northern India bounding box)
  // Latitude range: ~22N to 35N, Longitude range: ~68E to 92E
  const toXY = (lat, lng) => {
    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return { x: -10, y: -10 };
    const minLat = 22, maxLat = 35, minLng = 68, maxLng = 92;
    const x = ((lng - minLng) / (maxLng - minLng)) * 90 + 5; // percentage with 5% padding
    const y = ((maxLat - lat) / (maxLat - minLat)) * 90 + 5;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16, alignItems:"start" }}>
        {/* Map canvas */}
        <GlassCard hover={false} style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:14, color:"#e2e8f0", letterSpacing:"0.06em" }}>LIVE MAP — NORTHERN INDIA</span>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"'Exo 2',sans-serif", fontSize:11, color:"#94a3b8" }}>
                <span style={{ width:10, height:10, borderRadius:"50%", background:"#FF0000", display:"inline-block", border:"2px solid #FFF" }}/>
                Pothole Locations
              </span>
            </div>
          </div>
          <div style={{ width: '100%', height: 600 }}>
            <PotholeAlertMap reports={reports} showAlertZones={false} />
          </div>

            {/* Coordinates overlay */}
            <div style={{ position:"absolute", bottom:8, right:12, fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(59,130,246,0.4)" }}>
              72°E — 83°E  ·  12°N — 30°N
            </div>
        </GlassCard>

        {/* Report list sidebar */}
        <GlassCard hover={false} style={{ padding:16 }}>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:13, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:12 }}>ACTIVE PINS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {reports.map(r => {
              const color = '#FF0000'; // All pothole pins are red
              const isSel = selected?.id === r.id;
              return (
                <div key={r.id} onClick={() => setSelected(isSel?null:r)} style={{
                  padding:"10px 12px", borderRadius:10, cursor:"pointer",
                  background: isSel ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)",
                  border: isSel ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.05)",
                  transition:"all 0.15s",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }}/>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#60a5fa" }}>{r.id}</span>
                  </div>
                  <div style={{ fontFamily:"'Exo 2',sans-serif", fontSize:11, color:"#94a3b8", marginLeft:14, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{formatLocation(r)}</div>
                  <div style={{ marginLeft:14, marginTop:4 }}><Badge status={r.status}/></div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ANALYTICS PAGE
───────────────────────────────────────── */
const CHART_STYLE = {
  tooltip: {
    contentStyle: { background:"rgba(10,15,30,0.97)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, fontFamily:"'IBM Plex Mono',monospace", fontSize:11 },
    labelStyle: { color:"#94a3b8" },
  },
  grid: { stroke:"rgba(255,255,255,0.05)" },
  axis: { fill:"#475569", fontFamily:"'IBM Plex Mono',monospace", fontSize:10 },
};

function AnalyticsPage({ stats: statsLocal, reports: reportsLocal }) {
  statsLocal = statsLocal || INITIAL_STATS;
  reportsLocal = reportsLocal || [];

  const pieData = [
    { name: 'Minor', value: statsLocal.minor || 0, color: '#4ade80' },
    { name: 'Moderate', value: statsLocal.moderate || 0, color: '#fbbf24' },
    { name: 'Major', value: statsLocal.major || 0, color: '#f87171' },
  ];

  const sourceCounts = reportsLocal.reduce((acc, r) => { acc[r.source] = (acc[r.source] || 0) + 1; return acc; }, {});
  const sourceData = Object.keys(sourceCounts).map(k => ({ source: k, count: sourceCounts[k] }));

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {/* Uploads over time */}
        <GlassCard hover={false} style={{ padding:20 }}>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:13, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:16 }}>UPLOADS & DETECTIONS OVER TIME</div>
          {UPLOAD_OVER_TIME.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={UPLOAD_OVER_TIME}>
              <defs>
                <linearGradient id="gUploads" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                <linearGradient id="gDets" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="100%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" {...CHART_STYLE.grid}/>
              <XAxis dataKey="month" tick={CHART_STYLE.axis}/>
              <YAxis tick={CHART_STYLE.axis}/>
              <Tooltip {...CHART_STYLE.tooltip}/>
              <Legend wrapperStyle={{ fontFamily:"'Exo 2',sans-serif", fontSize:11 }}/>
              <Area type="monotone" dataKey="uploads" stroke="#3b82f6" fill="url(#gUploads)" strokeWidth={2} dot={{ fill:"#3b82f6", r:3 }}/>
              <Area type="monotone" dataKey="detections" stroke="#06b6d4" fill="url(#gDets)" strokeWidth={2} dot={{ fill:"#06b6d4", r:3 }}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding:20, color:'#94a3b8' }}>No time-series data available yet.</div>
          )}
        </GlassCard>

        {/* Severity Distribution */}
        <GlassCard hover={false} style={{ padding:20 }}>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:13, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:16 }}>SEVERITY DISTRIBUTION</div>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((entry,i) => <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2}/>) }
                  </Pie>
                  <Tooltip {...CHART_STYLE.tooltip}/>
                </PieChart>
              </ResponsiveContainer>
            <div style={{ flex:1 }}>
              {PIE_DATA.map(d => (
                <div key={d.name} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontFamily:"'Exo 2',sans-serif", fontSize:12, color:d.color }}>{d.name}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#e2e8f0" }}>{d.value.toLocaleString()}</span>
                  </div>
                  <div style={{ height:4, borderRadius:999, background:"rgba(255,255,255,0.05)" }}>
                    <div style={{ width:`${(d.value/4731)*100}%`, height:"100%", background:d.color, borderRadius:999 }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {/* Source distribution */}
        <GlassCard hover={false} style={{ padding:20 }}>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:13, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:16 }}>SOURCE DISTRIBUTION</div>
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sourceData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" {...CHART_STYLE.grid}/>
              <XAxis dataKey="source" tick={{...CHART_STYLE.axis, fontSize:10}} width={80}/>
              <YAxis tick={CHART_STYLE.axis}/>
              <Tooltip {...CHART_STYLE.tooltip}/>
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {sourceData.map((_,i) => <Cell key={i} fill={["#3b82f6","#06b6d4","#8b5cf6"][i % 3]}/>) }
              </Bar>
            </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding:20, color:'#94a3b8' }}>No source distribution data</div>
          )}
        </GlassCard>

        {/* Monthly repair completion */}
        <GlassCard hover={false} style={{ padding:20 }}>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:13, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:16 }}>MONTHLY REPAIR COMPLETION RATE</div>
          {REPAIR_RATE.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={REPAIR_RATE}>
              <CartesianGrid strokeDasharray="3 3" {...CHART_STYLE.grid}/>
              <XAxis dataKey="month" tick={CHART_STYLE.axis}/>
              <YAxis tick={CHART_STYLE.axis} domain={[0,100]} unit="%"/>
              <Tooltip {...CHART_STYLE.tooltip} formatter={(v)=>[`${v}%`,"Completion"]}/>
              <Line type="monotone" dataKey="rate" stroke="#4ade80" strokeWidth={2.5} dot={{ fill:"#4ade80", r:4, strokeWidth:0 }} activeDot={{ r:6, fill:"#4ade80" }}/>
            </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding:20, color:'#94a3b8' }}>No repair rate data</div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SETTINGS PAGE
───────────────────────────────────────── */
function SettingsPage({ darkMode, setDarkMode, backend }) {
  const [refreshInterval, setRefreshInterval] = useState(3);
  const [emailAlerts, setEmailAlerts]         = useState(true);
  const [majorAlerts, setMajorAlerts]         = useState(true);
  const [autoExport, setAutoExport]           = useState(false);

  return (
    <div style={{ padding:24, maxWidth:640 }}>
      {[
        {
          title:"Appearance",
          rows:[
            { label:"Dark Mode", sub:"Switch between dark and light UI", el:<Toggle value={darkMode} set={setDarkMode}/> },
          ]
        },
        {
          title:"Data & Sync",
          rows:[
            { label:"Auto-Refresh Interval", sub:"Dashboard polling interval in seconds", el:
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="range" min={1} max={10} value={refreshInterval} onChange={e=>setRefreshInterval(+e.target.value)} style={{width:80,accentColor:"#3b82f6"}}/>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#60a5fa",minWidth:20}}>{refreshInterval}s</span>
              </div>
            },
            { label:"Auto-Export", sub:"Auto-export completed reports daily", el:<Toggle value={autoExport} set={setAutoExport}/> },
          ]
        },
        {
          title:"Notifications",
          rows:[
            { label:"Email Alerts", sub:"Receive email for new detections", el:<Toggle value={emailAlerts} set={setEmailAlerts}/> },
            { label:"Major Severity Alerts", sub:"Immediate alert for major pothole clusters", el:<Toggle value={majorAlerts} set={setMajorAlerts}/> },
          ]
        },
        {
          title:"Backend",
          rows:[
            { label:"API Endpoint", sub:"", el:
              <input defaultValue={backend} style={{
                padding:"6px 10px",borderRadius:6,background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8",
                fontFamily:"'IBM Plex Mono',monospace",fontSize:11,width:200
              }}/>
            },
          ]
        },
      ].map(section=>(
        <GlassCard key={section.title} hover={false} style={{ padding:20, marginBottom:16 }}>
          <div style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:13,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:16 }}>{section.title.toUpperCase()}</div>
          {section.rows.map(row=>(
            <div key={row.label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <div>
                <div style={{ fontFamily:"'Exo 2',sans-serif",fontSize:13,color:"#cbd5e1",fontWeight:500 }}>{row.label}</div>
                {row.sub && <div style={{ fontFamily:"'Exo 2',sans-serif",fontSize:11,color:"#475569",marginTop:2 }}>{row.sub}</div>}
              </div>
              {row.el}
            </div>
          ))}
        </GlassCard>
      ))}
    </div>
  );
}

function Toggle({ value, set }) {
  return (
    <div onClick={() => set(v=>!v)} style={{
      width:42,height:22,borderRadius:11,cursor:"pointer",flexShrink:0,
      background: value ? "linear-gradient(90deg,#1d4ed8,#0ea5e9)" : "rgba(255,255,255,0.1)",
      border:"1px solid rgba(255,255,255,0.12)", position:"relative",transition:"all 0.2s",
    }}>
      <div style={{
        position:"absolute",top:2,left: value?20:2,width:16,height:16,borderRadius:"50%",
        background:"#fff",transition:"left 0.2s",boxShadow:"0 2px 6px rgba(0,0,0,0.3)",
      }}/>
    </div>
  );
}

/* ─────────────────────────────────────────
   CSS ANIMATIONS (injected once)
───────────────────────────────────────── */
const GLOBAL_CSS = `
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes ripple { 0%{transform:scale(0.8);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:rgba(255,255,255,0.02)}
  ::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:99px}
  select option { background:#0f172a !important; color:#e2e8f0; }
  textarea { outline:none; }
`;

/* ─────────────────────────────────────────
   ROOT APP
───────────────────────────────────────── */
export default function AdminPage() {
  const [activePage, setActivePage]   = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode]       = useState(true);
  const [stats, setStats]             = useState(INITIAL_STATS);
  const [reports, setReports]         = useState(MOCK_REPORTS);
  const [backendOnline, setBackendOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("just now");
  const tickRef = useRef(null);
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  /* Simulated auto-refresh */
  useEffect(() => {
    // Poll backend for live stats every 3s
    let mounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${backend}/admin/stats`);
        if (!res.ok) throw new Error('no stats');
        const data = await res.json();
        if (data?.success && mounted) {
          const d = data.data || {};
          setStats({
            total_uploads: d.total_uploads || 0,
            total_detections: d.total_detections || 0,
            minor: d.minor || 0,
            moderate: d.moderate || 0,
            major: d.major || 0,
            active_reports: Array.isArray(d.reports) ? d.reports.length : (d.active_reports || 0),
          });
          setReports(Array.isArray(d.reports) ? d.reports : []);
          setBackendOnline(true);
          const now = new Date();
          setLastUpdated(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`);
        }
      } catch (err) {
        setBackendOnline(false);
      }
    };

    fetchStats();
    tickRef.current = setInterval(fetchStats, 3000);
    return () => { mounted = false; clearInterval(tickRef.current); };
  }, []);

  const pages = {
    dashboard: <DashboardPage stats={stats} reports={reports} backendOnline={backendOnline} />,
    reports: <ReportsPage reports={reports} />,
    map: <MapPage reports={reports} />,
    analytics: <AnalyticsPage stats={stats} reports={reports} />,
    settings: <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} backend={backend} />
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <FontLoader/>
      <div style={{
        display:"flex", minHeight:"100vh",
        background: darkMode
          ? "linear-gradient(135deg,#020817 0%,#0a0f1e 50%,#060d1a 100%)"
          : "linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 100%)",
        color: darkMode ? "#e2e8f0" : "#1e293b",
        fontFamily:"'Exo 2',sans-serif",
        transition:"background 0.3s",
      }}>
        <Sidebar active={activePage} setActive={setActivePage} collapsed={sidebarCollapsed}/>
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>
          <Topbar
            page={activePage} darkMode={darkMode} setDarkMode={setDarkMode}
            backendOnline={backendOnline} lastUpdated={lastUpdated}
            sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}
          />
          <main style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
            {pages[activePage]}
          </main>
        </div>
      </div>
    </>
  );
}