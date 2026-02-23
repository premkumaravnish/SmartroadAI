'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const PotholeAlertMap = dynamic(() => import('@/components/PotholeAlertMap'), { ssr: false })

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartroadai.onrender.com/'

export default function DemoPage() {
    const [backendStatus, setBackendStatus] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [reports, setReports] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [stats, setStats] = useState(null)
    const [videoLoaded, setVideoLoaded] = useState(false)

    useEffect(() => {
        checkBackend()
        fetchPotholes()
        fetchStats()
        requestLocation()
    }, [])

    const checkBackend = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(BACKEND_URL + 'reports')
            if (response.ok) {
                setBackendStatus('connected')
            } else {
                setBackendStatus('error')
                setError('Backend returned status ' + response.status)
            }
        } catch (err) {
            setBackendStatus('error')
            setError('Cannot connect to backend. Server may be starting up (free tier cold start ~30s).')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchPotholes = async () => {
        try {
            const response = await fetch(BACKEND_URL + 'reports')
            if (!response.ok) throw new Error('Failed to fetch reports')
            const data = await response.json()
            setReports(data)
        } catch (err) {
            console.error('Error fetching potholes:', err)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch(BACKEND_URL + 'admin/stats')
            if (!response.ok) throw new Error('Failed to fetch stats')
            const data = await response.json()
            setStats(data)
        } catch (err) {
            console.error('Error fetching stats:', err)
        }
    }

    const requestLocation = () => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => console.log('Location access denied')
            )
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0f1c 0%, #0f172a 40%, #1a1035 100%)',
            fontFamily: "'Exo 2', sans-serif",
            paddingTop: '80px',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

                {/* Hero Header */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <span style={{
                        display: 'inline-block', padding: '6px 18px', borderRadius: '20px',
                        background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontSize: '13px',
                        fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px',
                        border: '1px solid rgba(59,130,246,0.2)',
                    }}>Live Demo</span>
                    <h1 style={{
                        fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: '#e2e8f0',
                        margin: '0 0 12px', lineHeight: 1.2,
                    }}>SmartRoad AI <span style={{ color: '#3b82f6' }}>in Action</span></h1>
                    <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                        Watch our YOLOv8-powered AI detect and classify potholes in real-time from dashcam footage
                    </p>
                </div>

                {/* === VIDEO SECTION === */}
                <div style={{
                    background: 'rgba(15,23,42,0.7)', borderRadius: '20px', padding: '28px',
                    border: '1px solid rgba(59,130,246,0.2)', marginBottom: '40px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                        }}>🎬</div>
                        <div>
                            <h2 style={{ color: '#e2e8f0', fontSize: '22px', fontWeight: 700, margin: 0 }}>
                                Pothole Detection Demo
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '13px', margin: '2px 0 0' }}>
                                Real-time YOLOv8 detection with severity classification
                            </p>
                        </div>
                    </div>

                    {/* Video Container */}
                    <div style={{
                        position: 'relative', width: '100%', paddingBottom: '56.25%',
                        borderRadius: '14px', overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: '#000',
                    }}>
                        {!videoLoaded && (
                            <div style={{
                                position: 'absolute', inset: 0, display: 'flex',
                                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(15,23,42,0.9)', zIndex: 1,
                            }}>
                                <div style={{
                                    width: '48px', height: '48px', border: '3px solid rgba(59,130,246,0.2)',
                                    borderTopColor: '#3b82f6', borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                }} />
                                <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '16px' }}>Loading video...</p>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        )}
                        <iframe
                            src="https://drive.google.com/file/d/1Y65HhQVmwkp7SuQ8lBAVS6bVTi-RCanj/preview"
                            style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                border: 'none',
                            }}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            onLoad={() => setVideoLoaded(true)}
                        />
                    </div>

                    {/* Video Info Bar */}
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px',
                        padding: '16px 20px', borderRadius: '12px',
                        background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)',
                    }}>
                        {[
                            { icon: '🤖', label: 'Model', value: 'YOLOv8 (pothole.pt)' },
                            { icon: '📊', label: 'Classes', value: 'Potholes' },
                            { icon: '⚡', label: 'Severity', value: 'Minor / Moderate / Major' },
                            { icon: '🎯', label: 'Type', value: 'Real-time Detection' },
                        ].map((item) => (
                            <div key={item.label} style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '11px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                                    <p style={{ color: '#e2e8f0', fontSize: '14px', margin: 0, fontWeight: 600 }}>{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* === STATUS CARDS === */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px', marginBottom: '36px',
                }}>
                    {/* Backend Status */}
                    <div style={{
                        background: 'rgba(15,23,42,0.6)', borderRadius: '16px', padding: '24px',
                        border: backendStatus === 'connected' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
                        backdropFilter: 'blur(10px)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: loading ? '#f59e0b' : backendStatus === 'connected' ? '#22c55e' : '#ef4444',
                                boxShadow: loading ? '0 0 8px #f59e0b' : backendStatus === 'connected' ? '0 0 8px #22c55e' : '0 0 8px #ef4444',
                            }} />
                            <span style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Backend Status</span>
                        </div>
                        <p style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                            {loading ? 'Checking...' : backendStatus === 'connected' ? 'Connected' : 'Offline'}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>
                            {BACKEND_URL.replace(/\/$/, '')}
                        </p>
                    </div>

                    {/* Reports Count */}
                    <div style={{
                        background: 'rgba(15,23,42,0.6)', borderRadius: '16px', padding: '24px',
                        border: '1px solid rgba(59,130,246,0.2)', backdropFilter: 'blur(10px)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '20px' }}>📊</span>
                            <span style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Reports</span>
                        </div>
                        <p style={{ color: '#3b82f6', fontSize: '36px', fontWeight: 700, margin: 0 }}>{reports.length}</p>
                        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>Pothole reports in database</p>
                    </div>

                    {/* Severity Stats */}
                    <div style={{
                        background: 'rgba(15,23,42,0.6)', borderRadius: '16px', padding: '24px',
                        border: '1px solid rgba(168,85,247,0.2)', backdropFilter: 'blur(10px)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '20px' }}>⚠️</span>
                            <span style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Severity Breakdown</span>
                        </div>
                        {stats ? (
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div>
                                    <p style={{ color: '#22c55e', fontSize: '20px', fontWeight: 700, margin: 0 }}>{stats.severity_breakdown?.Minor || 0}</p>
                                    <p style={{ color: '#64748b', fontSize: '11px' }}>Minor</p>
                                </div>
                                <div>
                                    <p style={{ color: '#f59e0b', fontSize: '20px', fontWeight: 700, margin: 0 }}>{stats.severity_breakdown?.Moderate || 0}</p>
                                    <p style={{ color: '#64748b', fontSize: '11px' }}>Moderate</p>
                                </div>
                                <div>
                                    <p style={{ color: '#ef4444', fontSize: '20px', fontWeight: 700, margin: 0 }}>{stats.severity_breakdown?.Major || 0}</p>
                                    <p style={{ color: '#64748b', fontSize: '11px' }}>Major</p>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Loading...</p>
                        )}
                    </div>

                    {/* Location Status */}
                    <div style={{
                        background: 'rgba(15,23,42,0.6)', borderRadius: '16px', padding: '24px',
                        border: '1px solid rgba(16,185,129,0.2)', backdropFilter: 'blur(10px)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '20px' }}>📍</span>
                            <span style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Location</span>
                        </div>
                        <p style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                            {userLocation ? 'Detected' : 'Pending'}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>
                            {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}` : 'Allow location access'}
                        </p>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
                        display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                        <span style={{ fontSize: '18px' }}>⚠️</span>
                        <p style={{ color: '#fca5a5', margin: 0, fontSize: '14px' }}>{error}</p>
                    </div>
                )}

                {/* === LIVE POTHOLE MAP === */}
                <div style={{
                    background: 'rgba(15,23,42,0.6)', borderRadius: '16px', padding: '24px',
                    border: '1px solid rgba(59,130,246,0.15)', marginBottom: '36px',
                    backdropFilter: 'blur(10px)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <h2 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                            🗺️ Live Pothole Map
                        </h2>
                        <button
                            onClick={() => { fetchPotholes(); fetchStats(); checkBackend(); }}
                            style={{
                                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                                color: '#60a5fa', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => { e.target.style.background = 'rgba(59,130,246,0.25)'; }}
                            onMouseOut={(e) => { e.target.style.background = 'rgba(59,130,246,0.15)'; }}
                        >🔄 Refresh Data</button>
                    </div>
                    <div style={{ height: '450px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <PotholeAlertMap reports={reports} userLocation={userLocation} alertRadius={1000} />
                    </div>
                </div>

                {/* === RECENT REPORTS TABLE === */}
                {reports.length > 0 && (
                    <div style={{
                        background: 'rgba(15,23,42,0.6)', borderRadius: '16px', padding: '24px',
                        border: '1px solid rgba(59,130,246,0.15)', marginBottom: '48px',
                        backdropFilter: 'blur(10px)',
                    }}>
                        <h2 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                            📋 Recent Pothole Reports
                        </h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                        {['#', 'Location', 'Detections', 'Severity', 'Coordinates'].map((h) => (
                                            <th key={h} style={{
                                                padding: '10px 12px', textAlign: 'left', color: '#94a3b8',
                                                fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600,
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.slice(0, 10).map((r, i) => {
                                        const maxSev = (r.severity_breakdown?.Major > 0) ? 'Major' : (r.severity_breakdown?.Moderate > 0) ? 'Moderate' : 'Minor';
                                        const sevColor = maxSev === 'Major' ? '#ef4444' : maxSev === 'Moderate' ? '#f59e0b' : '#22c55e';
                                        return (
                                            <tr key={r.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{i + 1}</td>
                                                <td style={{ padding: '10px 12px', color: '#e2e8f0', fontSize: '13px' }}>{r.location || r.description || 'Unknown'}</td>
                                                <td style={{ padding: '10px 12px', color: '#60a5fa', fontSize: '13px', fontWeight: 600 }}>{r.detections || r.total_detections || 0}</td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <span style={{
                                                        background: sevColor + '18', color: sevColor, padding: '3px 10px',
                                                        borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                                                    }}>{maxSev}</span>
                                                </td>
                                                <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
                                                    {r.lat ? `${Number(r.lat).toFixed(4)}, ${Number(r.lon).toFixed(4)}` : 'N/A'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}