"use client"

import { useState, useEffect } from "react"
import AdminLogin from "../../components/AdminLogin"

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState("All")

  // Check if already logged in
  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (auth) {
      try {
        const { email } = JSON.parse(auth)
        setAdminEmail(email)
        setIsLoggedIn(true)
        fetchPotholeData()
      } catch (e) {
        localStorage.removeItem("adminAuth")
      }
    }
  }, [])

  const fetchPotholeData = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/admin/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error('Failed to fetch pothole data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (email) => {
    setAdminEmail(email)
    setIsLoggedIn(true)
    fetchPotholeData()
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    setIsLoggedIn(false)
    setAdminEmail("")
    setReports([])
  }

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />
  }

  // Calculate stats from actual pothole data
  const totalPotholes = reports.length
  const majorCount = reports.filter(r => r.severity === 'Critical' || r.severity === 'Major').length
  const moderateCount = reports.filter(r => r.severity === 'Moderate').length
  const minorCount = reports.filter(r => r.severity === 'Minor').length
  const pendingCount = reports.filter(r => r.status === 'Pending').length
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length

  // Filter reports by selected severity
  const filteredReports = filterSeverity === 'All' 
    ? reports 
    : filterSeverity === 'Critical'
    ? reports.filter(r => r.severity === 'Critical' || r.severity === 'Major')
    : reports.filter(r => r.severity === filterSeverity)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
      {/* Header with Login/Logout */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-lg">🛣️</div>
            <div>
              <h1 className="text-xl font-bold">SmartRoad</h1>
              <p className="text-xs text-gray-400">Pothole Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-300">
              <span className="text-green-400">●</span> Admin: {adminEmail}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6 hover:border-blue-600/80 transition">
            <div className="text-3xl font-bold text-blue-400">{totalPotholes}</div>
            <div className="text-sm text-gray-300 mt-2">Total Potholes</div>
          </div>

          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-6 hover:border-red-600/80 transition">
            <div className="text-3xl font-bold text-red-400">{majorCount}</div>
            <div className="text-sm text-gray-300 mt-2">Critical Issues</div>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-6 hover:border-yellow-600/80 transition">
            <div className="text-3xl font-bold text-yellow-400">{moderateCount}</div>
            <div className="text-sm text-gray-300 mt-2">Moderate Issues</div>
          </div>

          <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-6 hover:border-green-600/80 transition">
            <div className="text-3xl font-bold text-green-400">{minorCount}</div>
            <div className="text-sm text-gray-300 mt-2">Minor Issues</div>
          </div>

          <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-lg p-6 hover:border-cyan-600/80 transition">
            <div className="text-3xl font-bold text-cyan-400">{pendingCount}</div>
            <div className="text-sm text-gray-300 mt-2">Pending Repairs</div>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterSeverity('All')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filterSeverity === 'All'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            All ({totalPotholes})
          </button>
          <button
            onClick={() => setFilterSeverity('Critical')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filterSeverity === 'Critical'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Critical ({majorCount})
          </button>
          <button
            onClick={() => setFilterSeverity('Moderate')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filterSeverity === 'Moderate'
                ? 'bg-yellow-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Moderate ({moderateCount})
          </button>
          <button
            onClick={() => setFilterSeverity('Minor')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filterSeverity === 'Minor'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Minor ({minorCount})
          </button>
        </div>

        {/* Pothole Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading pothole data...</div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <p className="text-gray-400">No potholes found for this severity level.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, idx) => {
              const severityColor = 
                report.severity === 'Critical' || report.severity === 'Major' ? 'border-red-600 bg-red-900/20' :
                report.severity === 'Moderate' ? 'border-yellow-600 bg-yellow-900/20' :
                'border-green-600 bg-green-900/20'
              
              const severityTextColor =
                report.severity === 'Critical' || report.severity === 'Major' ? 'text-red-400' :
                report.severity === 'Moderate' ? 'text-yellow-400' :
                'text-green-400'

              const statusColor =
                report.status === 'Pending' ? 'bg-orange-600/30 text-orange-300 border-orange-600/50' :
                report.status === 'Assigned' ? 'bg-blue-600/30 text-blue-300 border-blue-600/50' :
                'bg-teal-600/30 text-teal-300 border-teal-600/50'

              return (
                <div key={idx} className={`border-2 ${severityColor} rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer hover:scale-105`}>
                  {/* ID and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs text-gray-400">Pothole ID</div>
                      <div className="text-lg font-bold text-cyan-400">{report.id}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                      {report.status}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-1">📍 Location</div>
                    <div className="text-sm text-gray-200">{report.location}</div>
                  </div>

                  {/* Coordinates */}
                  <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-700/50 p-2 rounded">
                      <div className="text-gray-400">Latitude</div>
                      <div className="text-white font-mono">{report.latitude?.toFixed(4)}</div>
                    </div>
                    <div className="bg-slate-700/50 p-2 rounded">
                      <div className="text-gray-400">Longitude</div>
                      <div className="text-white font-mono">{report.longitude?.toFixed(4)}</div>
                    </div>
                  </div>

                  {/* Severity Badge */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-1">Severity Level</div>
                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${severityTextColor} border ${severityColor}`}>
                      {report.severity}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="pt-3 border-t border-slate-600">
                    <div className="text-xs text-gray-400">Date Detected</div>
                    <div className="text-xs text-gray-300 font-mono">{report.date || report.timestamp || 'N/A'}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <style jsx>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  )
}
