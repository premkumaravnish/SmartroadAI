'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// dynamically import maps to avoid SSR issues (client-only)
const VolunteerMap = dynamic(() => import('../../components/VolunteerMap'), { ssr: false })
const PotholeAlertMap = dynamic(() => import('../../components/PotholeAlertMap'), { ssr: false })

export default function VolunteerPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [desc, setDesc] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [watchId, setWatchId] = useState(null)
  const [liveLocation, setLiveLocation] = useState(false)
  const [detectionResult, setDetectionResult] = useState(null)
  const [wallet, setWallet] = useState(12)
  const [reports, setReports] = useState([])
  const fileRef = useRef(null)

  useEffect(() => {
    fetchPotholes()
  }, [])

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

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(f)

    // request location automatically when file selected
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
      (err) => setError('Location access denied')
    )
  }

  // Live location watch
  const startLiveLocation = () => {
    if (!navigator.geolocation) return setError('Geolocation not supported')
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      },
      (err) => setError('Location access denied'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    )
    setWatchId(id)
    setLiveLocation(true)
    setError(null)
  }

  const stopLiveLocation = () => {
    if (watchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
    }
    setWatchId(null)
    setLiveLocation(false)
  }

  const handleSubmit = async () => {
    if (!file) return setError('Please choose an image or video to upload')
    setLoading(true)
    setError(null)

    // ensure we have location (try to get it if not)
    if (!location && navigator.geolocation) {
      await new Promise((res) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
            res()
          },
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
        method: 'POST',
        body: fd,
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        setError(err.error || 'Upload failed')
        setLoading(false)
        return
      }

      const data = await resp.json()

      // handle detection result and user feedback
      if (data.total_detections && data.total_detections > 0) {
        // show detection summary and success
        setDetectionResult(data)

        // sync wallet from server if provided, otherwise award locally
        if (data && typeof data.wallet === 'number') {
          setWallet(data.wallet)
        } else {
          setWallet((w) => w + 10)
        }

        alert(data.message || 'Pothole detected — report saved.')
      } else {
        // no detections
        setDetectionResult(null)
        alert(data.message || 'No pothole detected in the provided media.')
      }

      setError(null)
      setLoading(false)
      // do not redirect automatically; user can click Done
    } catch (err) {
      console.error(err)
      setError('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="volunteer-page min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="volunteer-card rounded-xl p-10 border border-gray-700 shadow-lg">
        <div className="volunteer-hero">
          <h1>Report a Pothole</h1>
        </div>
        <p className="text-center text-lg text-gray-300 mb-6">Help your city — upload media and earn SmartCoins for validated reports.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Upload Video Card */}
          <div className="glass-card">
            <h3 className="card-title">Upload Video</h3>
            <p className="card-desc mb-4">Record a short video or upload an image of the pothole.</p>
            <div className="flex flex-col gap-3">
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="btn-cta">Choose File</button>
              <p className="text-xs text-gray-400">{file ? file.name : 'No file chosen'}</p>
            </div>
          </div>

          {/* Upload Location Card */}
          <div className="glass-card">
            <h3 className="card-title">Upload Location</h3>
              <div className="mt-3 mb-4 rounded overflow-hidden border border-gray-700 bg-gray-900" style={{height: 160}}>
                <div style={{width: '100%', height: '100%'}}>
                  {/* Live Leaflet map */}
                  <div style={{width: '100%', height: '100%'}}>
                    {/* VolunteerMap is imported below via dynamic client component */}
                    {/* We render it with the current location (if any) */}
                    <div style={{width: '100%', height: '100%'}}>
                      {/* placeholder while component loads */}
                        <VolunteerMap location={location} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <button onClick={requestLocation} className="btn-cta">Get Current Location</button>
                <p className="text-xs text-gray-400 mt-0">{location ? `${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}` : 'No location'}</p>
              </div>
          </div>

          {/* Description Card */}
          <div className="glass-card">
            <h3 className="card-title">Description</h3>
            <p className="card-desc mb-3">Provide any details that help identify the pothole (optional).</p>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Add details about the pothole..." className="description-textarea w-full" rows={4} />
            <div className="mt-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" className="rounded" />
                <span>Mark as Critical</span>
              </label>
            </div>
          </div>
          {/* Wallet placeholder left intentionally blank to match floating wallet */}
          <div></div>
        </div>

        <div className="mt-8 text-center">
          <button onClick={handleSubmit} disabled={loading} className="btn-cta px-8 py-3">{loading ? 'Submitting...' : 'Submit Report'}</button>
        </div>

        {/* Floating wallet box top-right */}
        <div className="wallet-floating">
          <div className="coin-badge">$</div>
          <div>
            <div className="text-sm text-gray-300">Your Wallet</div>
            <div className="text-blue-200 font-semibold">{wallet} SR Coins</div>
          </div>
        </div>

        {/* Results pane */}
        {detectionResult && (
          <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Detection Results</h2>
              <div className="text-sm text-green-300">+10 SR Coins awarded</div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {detectionResult.annotated ? (
                  <img src={detectionResult.annotated} alt="annotated" className="w-full rounded border border-gray-700 shadow-inner" />
                ) : (
                  <div className="text-gray-400">Annotated image unavailable</div>
                )}
              </div>

              <div>
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-4">
                  <p className="text-gray-400 text-sm">Total Detections</p>
                  <p className="text-3xl font-bold text-blue-300">{detectionResult.total_detections}</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-green-900/20 border border-green-700 rounded">Minor: {detectionResult.severity_breakdown.Minor || 0}</div>
                  <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded">Moderate: {detectionResult.severity_breakdown.Moderate || 0}</div>
                  <div className="p-3 bg-red-900/20 border border-red-700 rounded">Major: {detectionResult.severity_breakdown.Major || 0}</div>
                </div>

                <div className="mt-6">
                  <button onClick={() => { setDetectionResult(null); router.push('/') }} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">Done</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
