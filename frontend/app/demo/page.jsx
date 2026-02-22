'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import fetchDemoData from '@/services/operations/demoAPI'

const PotholeAlertMap = dynamic(() => import('@/components/PotholeAlertMap'), { ssr: false })

export default function DemoPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [reports, setReports] = useState([])
    const [userLocation, setUserLocation] = useState(null)

    useEffect(() => {
        loadDemo()
        fetchPotholes()
        requestLocation()
    }, [])

    const loadDemo = async () => {
        setLoading(true)
        setError(null)
        try {
            const fetchData = fetchDemoData()
            const result = await fetchData()
            setData(result)
        } catch (err) {
            setError(err.message || "Failed to fetch demo data")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchPotholes = async () => {
        try {
            const response = await fetch('http://localhost:5000/reports')
            if (!response.ok) throw new Error('Failed to fetch reports')
            const pothelesData = await response.json()
            setReports(pothelesData)
        } catch (err) {
            console.error('Error fetching potholes:', err)
        }
    }

    const requestLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => console.log('Location access denied')
            )
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="p-8">
                <h1 className="text-4xl font-bold text-white mb-8">Demo API Test</h1>
                
                {/* Pothole Map */}
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">🗺️ Live Pothole Map</h2>
                    <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                        <PotholeAlertMap reports={reports} userLocation={userLocation} alertRadius={1000} />
                    </div>
                </div>
            </div>
            <div className="max-w-2xl mx-auto p-8 pt-0">
                <h1 className="text-4xl font-bold text-white mb-8">Demo API Test</h1>

                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Backend Connection Status</h2>
                    
                    {loading && (
                        <div className="text-blue-400">
                            <p>Loading data...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900 border border-red-700 rounded p-4">
                            <p className="text-red-200">❌ Error: {error}</p>
                        </div>
                    )}

                    {data && !loading && (
                        <div className="space-y-4">
                            <div className="bg-green-900 border border-green-700 rounded p-4">
                                <p className="text-green-200">✅ Connected Successfully</p>
                            </div>

                            <div className="bg-gray-700 rounded p-4">
                                <h3 className="text-white font-semibold mb-2">Response Data:</h3>
                                <pre className="text-green-400 overflow-auto">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-700 rounded p-4">
                                    <p className="text-gray-400 text-sm">Message</p>
                                    <p className="text-white font-semibold">{data.message}</p>
                                </div>
                                <div className="bg-gray-700 rounded p-4">
                                    <p className="text-gray-400 text-sm">Status</p>
                                    <p className="text-white font-semibold">{data.data.status}</p>
                                </div>
                                <div className="bg-gray-700 rounded p-4">
                                    <p className="text-gray-400 text-sm">Server</p>
                                    <p className="text-white font-semibold">{data.data.serverInfo.name}</p>
                                </div>
                                <div className="bg-gray-700 rounded p-4">
                                    <p className="text-gray-400 text-sm">Type</p>
                                    <p className="text-white font-semibold">{data.data.serverInfo.type}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={loadDemo}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition"
                >
                    {loading ? 'Loading...' : 'Refresh Data'}
                </button>
            </div>
            <div style={{ marginTop:'24px', textAlign:'center', fontSize:'13px', color:'#64748b', fontFamily:"'Exo 2',sans-serif" }}>
              Made with ❤️ by Prem Avnish & Team
            </div>
        </div>
    )
}