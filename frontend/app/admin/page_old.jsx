"use client"

import { useState, useEffect } from "react"
import AdminLogin from "../../components/AdminLogin"

const overviewStats = [
  { label: "Total Detected",    value: "12,847", sub: "+234 today",      icon: "⬡",  color: "blue",   gradient: "from-blue-500/20 to-blue-600/5",   border: "border-blue-500/30",   text: "text-blue-400"  },
  { label: "Critical (Lvl 3)",  value: "1,203",  sub: "24hr response",   icon: "🔴", color: "red",    gradient: "from-red-500/20 to-red-600/5",     border: "border-red-500/30",    text: "text-red-400"   },
  { label: "Moderate (Lvl 2)",  value: "4,891",  sub: "7-day SLA",       icon: "🟡", color: "yellow", gradient: "from-yellow-500/20 to-yellow-600/5",border: "border-yellow-500/30", text: "text-yellow-400"},
  { label: "Minor (Lvl 1)",     value: "6,753",  sub: "30-day schedule",  icon: "🟢", color: "green",  gradient: "from-green-500/20 to-green-600/5",  border: "border-green-500/30",  text: "text-green-400" },
  { label: "Pending Repairs",   value: "3,291",  sub: "Awaiting dispatch",icon: "⏳", color: "orange", gradient: "from-orange-500/20 to-orange-600/5",border: "border-orange-500/30", text: "text-orange-400"},
  { label: "Resolved Cases",    value: "9,556",  sub: "+47 today",        icon: "✅", color: "teal",   gradient: "from-teal-500/20 to-teal-600/5",   border: "border-teal-500/30",   text: "text-teal-400"  },
  { label: "Avg Repair Time",   value: "38 hrs", sub: "-2hrs this week",  icon: "⚡", color: "purple", gradient: "from-purple-500/20 to-purple-600/5",border: "border-purple-500/30", text: "text-purple-400"},
  { label: "Budget (This Mo.)", value: "₹48.2L", sub: "72% utilized",    icon: "💰", color: "cyan",   gradient: "from-cyan-500/20 to-cyan-600/5",   border: "border-cyan-500/30",   text: "text-cyan-400"  },
];

const potholes = [
  { id: "PH-4401", location: "NH-44 Bypass, Patna",          ward: "W-07", gps: "25.5941° N, 85.1376° E", severity: "Critical", depth: "14cm", width: "42cm", traffic: "High",   status: "Pending",   contractor: "Unassigned",        date: "20 Feb 2026" },
  { id: "PH-4399", location: "Gandhi Maidan Rd, Patna",       ward: "W-02", gps: "25.6124° N, 85.1540° E", severity: "Moderate", depth: "7cm",  width: "22cm", traffic: "Medium", status: "Assigned",  contractor: "RK Infra Pvt Ltd",  date: "19 Feb 2026" },
  { id: "PH-4395", location: "Boring Road, Patna",            ward: "W-11", gps: "25.6073° N, 85.1195° E", severity: "Minor",    depth: "2cm",  width: "8cm",  traffic: "Low",    status: "Completed", contractor: "City Roads Corp",   date: "18 Feb 2026" },
  { id: "PH-4391", location: "Frazer Road, Patna",            ward: "W-04", gps: "25.6200° N, 85.1400° E", severity: "Critical", depth: "18cm", width: "55cm", traffic: "High",   status: "Assigned",  contractor: "SkyBuild Ltd",      date: "17 Feb 2026" },
  { id: "PH-4388", location: "Kankarbagh Main Rd, Patna",     ward: "W-09", gps: "25.5880° N, 85.1500° E", severity: "Moderate", depth: "9cm",  width: "28cm", traffic: "Medium", status: "Pending",   contractor: "Unassigned",        date: "17 Feb 2026" },
  { id: "PH-4382", location: "Exhibition Road, Patna",        ward: "W-03", gps: "25.6150° N, 85.1490° E", severity: "Minor",    depth: "1cm",  width: "6cm",  traffic: "Low",    status: "Completed", contractor: "Bihar Road Works",  date: "16 Feb 2026" },
  { id: "PH-4379", location: "Bailey Road, Patna",            ward: "W-06", gps: "25.6290° N, 85.1128° E", severity: "Critical", depth: "16cm", width: "48cm", traffic: "High",   status: "Pending",   contractor: "Unassigned",        date: "16 Feb 2026" },
  { id: "PH-4374", location: "Danapur-Khagaul Road",          ward: "W-14", gps: "25.6140° N, 85.0670° E", severity: "Moderate", depth: "6cm",  width: "19cm", traffic: "Medium", status: "Assigned",  contractor: "RK Infra Pvt Ltd",  date: "15 Feb 2026" },
];

const contractors = ["Unassigned", "RK Infra Pvt Ltd", "SkyBuild Ltd", "City Roads Corp", "Bihar Road Works", "NH Projects Ltd", "Urban Fix Co."];

const citizenStats = [
  { label: "Total Submissions",       value: "18,440", icon: "📱", text: "text-blue-400",   border: "border-blue-500/20",   bg: "bg-blue-500/10"   },
  { label: "Duplicate Reports Merged",value: "4,217",  icon: "🔁", text: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  { label: "AI Validation Accuracy",  value: "98.2%",  icon: "🧠", text: "text-cyan-400",   border: "border-cyan-500/20",   bg: "bg-cyan-500/10"   },
  { label: "Spam Filtered",           value: "1,093",  icon: "🚫", text: "text-red-400",    border: "border-red-500/20",    bg: "bg-red-500/10"    },
];

const alerts = [
  { type: "critical", icon: "🚨", title: "PH-4401 — NH-44 Bypass, Patna",        desc: "Critical pothole (18cm deep). Deadline: 21 Feb 2026. No contractor assigned yet.",     badge: "OVERDUE" },
  { type: "critical", icon: "🚨", title: "PH-4379 — Bailey Road, Patna",           desc: "Critical pothole reported 16 Feb. 24hr SLA breached. Requires immediate escalation.", badge: "SLA BREACH" },
  { type: "warning",  icon: "⚠️",  title: "Ward W-07 — High Accident Zone",         desc: "7 critical potholes clustered within 1.2km stretch. Traffic advisory recommended.",   badge: "HIGH RISK" },
  { type: "warning",  icon: "⚠️",  title: "Ward W-11 — 3 Overdue Moderate Repairs", desc: "Moderate repairs scheduled >10 days ago with no status update from contractors.",     badge: "OVERDUE"   },
  { type: "info",     icon: "ℹ️",  title: "Budget 72% Utilized — Mid-Month",        desc: "Feb 2026 repair budget at ₹34.7L of ₹48.2L. Recommend review before month-end.",     badge: "ADVISORY"  },
];

const wardData = [
  { ward: "W-02", name: "Gandhi Maidan",  count: 312,  pct: 88 },
  { ward: "W-04", name: "Frazer Road",    count: 278,  pct: 78 },
  { ward: "W-06", name: "Bailey Road",    count: 409,  pct: 100 },
  { ward: "W-07", name: "NH-44 Bypass",   count: 392,  pct: 96 },
  { ward: "W-09", name: "Kankarbagh",     count: 225,  pct: 62 },
  { ward: "W-11", name: "Boring Road",    count: 187,  pct: 51 },
];

const monthlyBudget = [
  { month: "Sep", spent: 28, allocated: 45 },
  { month: "Oct", spent: 39, allocated: 45 },
  { month: "Nov", spent: 42, allocated: 48 },
  { month: "Dec", spent: 31, allocated: 50 },
  { month: "Jan", spent: 44, allocated: 50 },
  { month: "Feb", spent: 34, allocated: 48 },
];

const severityStyle = (s) => {
  if (s === "Critical") return "bg-red-500/15 text-red-400 border border-red-500/30";
  if (s === "Moderate") return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30";
  return "bg-green-500/15 text-green-400 border border-green-500/30";
};

const statusStyle = (s) => {
  if (s === "Pending")   return "bg-orange-500/15 text-orange-400 border border-orange-500/30";
  if (s === "Assigned")  return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
  return "bg-teal-500/15 text-teal-400 border border-teal-500/30";
};

const alertStyle = (t) => {
  if (t === "critical") return { wrap: "border-red-500/30 bg-red-500/5",    badge: "bg-red-500/20 text-red-400 border-red-500/40",    dot: "bg-red-500"    };
  if (t === "warning")  return { wrap: "border-yellow-500/30 bg-yellow-500/5",badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",dot: "bg-yellow-500"};
  return                       { wrap: "border-blue-500/30 bg-blue-500/5",   badge: "bg-blue-500/20 text-blue-400 border-blue-500/40",   dot: "bg-blue-500"   };
};

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [activeTab, setActiveTab]     = useState("overview");
  const [selectedContractor, setSelectedContractor] = useState(contractors[0]);
  const [priority, setPriority]       = useState("High");
  const [repairCost, setRepairCost]   = useState("");
  const [deadline, setDeadline]       = useState("");
  const [repairStatus, setRepairStatus] = useState("Assigned");
  const [savedMsg, setSavedMsg]       = useState(false);
  const [tableFilter, setTableFilter] = useState("All");
  const [stats, setStats]             = useState(null);
  const [reports, setReports]         = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Check if already logged in
  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (auth) {
      try {
        const { email } = JSON.parse(auth)
        setAdminEmail(email)
        setIsLoggedIn(true)
        fetchDashboardData()
      } catch (e) {
        localStorage.removeItem("adminAuth")
      }
    }
  }, [])

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setLoadingData(true)
      const [statsRes, reportsRes] = await Promise.all([
        fetch('http://localhost:5000/admin/stats'),
        fetch('http://localhost:5000/admin/reports')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReports(reportsData)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleLogin = (email) => {
    setAdminEmail(email)
    setIsLoggedIn(true)
    fetchDashboardData()
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    setIsLoggedIn(false)
    setAdminEmail("")
    setStats(null)
    setReports([])
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />
  }

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const filteredPotholes = tableFilter === "All"
    ? potholes
    : potholes.filter((p) => p.severity === tableFilter || p.status === tableFilter);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="fixed top-0 left-0 w-[600px] h-[400px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-purple-600/6 rounded-full blur-[100px] pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0f1e]/90 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 lg:px-10 h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">⬡</div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">SmartRoad</span>
              <span className="text-cyan-400 font-extrabold text-base tracking-tight ml-1">AI</span>
            </div>
            <span className="hidden sm:inline ml-2 text-[10px] font-mono text-white/30 border border-white/10 rounded px-2 py-0.5 tracking-widest uppercase">Admin Console</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07]">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                {adminEmail.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-white/70 font-medium">{adminEmail.split('@')[0]}</span>
              <span className="text-[10px] font-mono text-green-400 bg-green-400/10 border border-green-500/20 rounded px-1.5 py-0.5">LIVE</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors duration-200">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 lg:px-10 pt-8 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-cyan-400/80 tracking-[0.2em] uppercase">Municipal Operations Center</span>
              <span className="w-1 h-1 rounded-full bg-cyan-400/50"></span>
              <span className="text-[10px] font-mono text-white/30">Patna Metropolitan Region</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">Pothole Management Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>System Online</span>
            <span className="text-white/20">|</span>
            <span>Last sync: just now</span>
            <span className="text-white/20">|</span>
            <span className="text-white/30">Fri 20 Feb 2026</span>
          </div>
        </div>
      </div>

      <main className="px-6 lg:px-10 py-6 space-y-8">
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
            {loadingData ? (
              <div className="col-span-full text-center py-8 text-white/40">Loading dashboard data...</div>
            ) : (
              <>
                {/* Total Detections */}
                <div className={`relative rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-blue-600/5 p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200 cursor-default group overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-xl pointer-events-none" />
                  <div className="flex items-start justify-between"><span className="text-lg leading-none">⬡</span><span className="text-[9px] font-mono text-blue-400 opacity-60">↗</span></div>
                  <div><div className="text-xl font-extrabold tracking-tight text-blue-400">{stats?.total_detections || 0}</div><div className="text-[10px] text-white/50 mt-0.5 leading-tight font-medium">Total Detections</div><div className="text-[9px] text-white/30 mt-1 font-mono">+234 today</div></div>
                </div>

                {/* Critical Issues */}
                <div className={`relative rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-600/5 p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200 cursor-default group overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-xl pointer-events-none" />
                  <div className="flex items-start justify-between"><span className="text-lg leading-none">🔴</span><span className="text-[9px] font-mono text-red-400 opacity-60">↗</span></div>
                  <div><div className="text-xl font-extrabold tracking-tight text-red-400">{stats?.critical_issues || 0}</div><div className="text-[10px] text-white/50 mt-0.5 leading-tight font-medium">Critical (Lvl 3)</div><div className="text-[9px] text-white/30 mt-1 font-mono">24hr response</div></div>
                </div>

                {/* Moderate Issues */}
                <div className={`relative rounded-xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200 cursor-default group overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-xl pointer-events-none" />
                  <div className="flex items-start justify-between"><span className="text-lg leading-none">🟡</span><span className="text-[9px] font-mono text-yellow-400 opacity-60">↗</span></div>
                  <div><div className="text-xl font-extrabold tracking-tight text-yellow-400">{stats?.moderate_issues || 0}</div><div className="text-[10px] text-white/50 mt-0.5 leading-tight font-medium">Moderate (Lvl 2)</div><div className="text-[9px] text-white/30 mt-1 font-mono">7-day SLA</div></div>
                </div>

                {/* Minor Issues */}
                <div className={`relative rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/20 to-green-600/5 p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200 cursor-default group overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-xl pointer-events-none" />
                  <div className="flex items-start justify-between"><span className="text-lg leading-none">🟢</span><span className="text-[9px] font-mono text-green-400 opacity-60">↗</span></div>
                  <div><div className="text-xl font-extrabold tracking-tight text-green-400">{stats?.minor_issues || 0}</div><div className="text-[10px] text-white/50 mt-0.5 leading-tight font-medium">Minor (Lvl 1)</div><div className="text-[9px] text-white/30 mt-1 font-mono">30-day schedule</div></div>
                </div>

                {/* Pending Repairs */}
                <div className={`relative rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-orange-600/5 p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200 cursor-default group overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-xl pointer-events-none" />
                  <div className="flex items-start justify-between"><span className="text-lg leading-none">⏳</span><span className="text-[9px] font-mono text-orange-400 opacity-60">↗</span></div>
                  <div><div className="text-xl font-extrabold tracking-tight text-orange-400">{stats?.pending_repairs || 0}</div><div className="text-[10px] text-white/50 mt-0.5 leading-tight font-medium">Pending Repairs</div><div className="text-[9px] text-white/30 mt-1 font-mono">Awaiting dispatch</div></div>
                </div>

                {/* Resolved Cases */}
                <div className={`relative rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/20 to-teal-600/5 p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200 cursor-default group overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-xl pointer-events-none" />
                  <div className="flex items-start justify-between"><span className="text-lg leading-none">✅</span><span className="text-[9px] font-mono text-teal-400 opacity-60">↗</span></div>
                  <div><div className="text-xl font-extrabold tracking-tight text-teal-400">{stats?.resolved_cases || 0}</div><div className="text-[10px] text-white/50 mt-0.5 leading-tight font-medium">Resolved Cases</div><div className="text-[9px] text-white/30 mt-1 font-mono">+47 today</div></div>
                </div>

                {/* Avg Repair Time */}
                <div className={`relative rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-purple-600/5 p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200 cursor-default group overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-xl pointer-events-none" />
                  <div className="flex items-start justify-between"><span className="text-lg leading-none">⚡</span><span className="text-[9px] font-mono text-purple-400 opacity-60">↗</span></div>
                  <div><div className="text-xl font-extrabold tracking-tight text-purple-400">{stats?.avg_repair_time || '0h'}</div><div className="text-[10px] text-white/50 mt-0.5 leading-tight font-medium">Avg Repair Time</div><div className="text-[9px] text-white/30 mt-1 font-mono">-2hrs this week</div></div>
                </div>

                {/* Monthly Budget */}
                <div className={`relative rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200 cursor-default group overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-xl pointer-events-none" />
                  <div className="flex items-start justify-between"><span className="text-lg leading-none">💰</span><span className="text-[9px] font-mono text-cyan-400 opacity-60">↗</span></div>
                  <div><div className="text-xl font-extrabold tracking-tight text-cyan-400">{stats?.monthly_budget || '₹0L'}</div><div className="text-[10px] text-white/50 mt-0.5 leading-tight font-medium">Budget (This Mo.)</div><div className="text-[9px] text-white/30 mt-1 font-mono">72% utilized</div></div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Detection Table */}
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden p-6">
          <h2 className="font-bold text-base text-white mb-4">Real-Time Detection Table</h2>
          {loadingData ? (
            <p className="text-[11px] text-white/40">Loading detections...</p>
          ) : reports.length === 0 ? (
            <p className="text-[11px] text-white/40">No detections available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-medium text-white/60">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-white/60">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-white/60">Severity</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-white/60">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-white/60">Contractor</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 10).map((report, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-sm text-white">{report.id}</td>
                      <td className="px-4 py-3 text-sm text-white/70">{report.location}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          report.severity === 'Critical' ? 'bg-red-500/15 text-red-400' :
                          report.severity === 'Moderate' ? 'bg-yellow-500/15 text-yellow-400' :
                          'bg-green-500/15 text-green-400'
                        }`}>
                          {report.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'Pending' ? 'bg-orange-500/15 text-orange-400' :
                          report.status === 'Assigned' ? 'bg-blue-500/15 text-blue-400' :
                          'bg-teal-500/15 text-teal-400'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/70">{report.contractor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="border-t border-white/[0.05] pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs">⬡</div>
            <span className="text-xs text-white/30 font-mono">SmartRoad AI — Admin Console · Enyugma 2026, IIIT Bhagalpur</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-white/20">
            <a href="https://github.com/Nirbhayjr/smart-road" target="_blank" rel="noreferrer" className="hover:text-white/50 transition-colors">GitHub</a>
            <span>v2.4.1</span>
            <span className="text-green-400/60 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-green-400/60 inline-block"></span>All systems normal</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
