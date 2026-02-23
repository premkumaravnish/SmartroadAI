'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import axios from 'axios'

const RouteMap = dynamic(() => import('../../components/RouteMap'), { ssr: false })

export default function PlanRoutePage() {
  const router = useRouter()
  const [startInput, setStartInput] = useState('')
  const [endInput, setEndInput] = useState('')
  const [startLocation, setStartLocation] = useState(null)
  const [endLocation, setEndLocation] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searching, setSearching] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState({ start: [], end: [] })

  // Fetch pothole reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '')
        const response = await axios.get(`${BACKEND_URL}/reports`)
        setReports(response.data || [])
      } catch (err) {
        try {
          const localResponse = await fetch('/reports.json')
          if (localResponse.ok) {
            const data = await localResponse.json()
            setReports(data || [])
          }
        } catch (localErr) {
          console.error('Error fetching reports:', err, localErr)
        }
      }
    }

    fetchReports()
  }, [])

  // Search for location using OpenStreetMap Nominatim API
  const searchLocation = async (query, type) => {
    if (!query || query.length < 3) {
      setLocationSuggestions(prev => ({ ...prev, [type]: [] }))
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      const suggestions = Array.isArray(data.results) ? data.results : []

      setLocationSuggestions(prev => ({ ...prev, [type]: suggestions }))
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  // Handle location selection
  const selectLocation = (location, type) => {
    if (type === 'start') {
      setStartLocation(location)
      setStartInput(location.name)
      setLocationSuggestions(prev => ({ ...prev, start: [] }))
    } else {
      setEndLocation(location)
      setEndInput(location.name)
      setLocationSuggestions(prev => ({ ...prev, end: [] }))
    }
  }

  // Get current location
  const getCurrentLocation = (type) => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          name: 'Current Location'
        }
        selectLocation(location, type)
        setError(null)
      },
      (err) => {
        setError(`Location error: ${err.message}`)
      }
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0A0A0A', 
      color: '#FFF',
      paddingTop: '70px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1A1A1A',
        padding: '20px',
        borderBottom: '2px solid #333',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>
            🛣️ Plan Route & Avoid Potholes
          </h1>
          <p style={{ margin: 0, color: '#AAA', fontSize: '14px' }}>
            Enter start and end locations to see potholes on your route
          </p>
        </div>
        
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#333',
            color: '#FFF',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Route Input Panel */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#1A1A1A',
          padding: '30px',
          borderRadius: '12px',
          border: '2px solid #333',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>📍 Enter Your Route</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Start Location */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#AAA',
                fontWeight: 'bold'
              }}>
                🟢 From Location A
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={startInput}
                  onChange={(e) => {
                    setStartInput(e.target.value)
                    searchLocation(e.target.value, 'start')
                  }}
                  placeholder="Enter starting location..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0A0A0A',
                    color: '#FFF',
                    border: '2px solid #4CAF50',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                
                {locationSuggestions.start.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #4CAF50',
                    borderRadius: '6px',
                    marginTop: '4px',
                    zIndex: 1001,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {locationSuggestions.start.map((loc, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectLocation(loc, 'start')}
                        style={{
                          padding: '12px',
                          borderBottom: '1px solid #333',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#1A1A1A'}
                      >
                        📍 {loc.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => getCurrentLocation('start')}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  width: '100%'
                }}
              >
                📍 Use Current Location
              </button>
            </div>

            {/* End Location */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#AAA',
                fontWeight: 'bold'
              }}>
                🔵 To Location B
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={endInput}
                  onChange={(e) => {
                    setEndInput(e.target.value)
                    searchLocation(e.target.value, 'end')
                  }}
                  placeholder="Enter destination..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#0A0A0A',
                    color: '#FFF',
                    border: '2px solid #2196F3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                
                {locationSuggestions.end.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2196F3',
                    borderRadius: '6px',
                    marginTop: '4px',
                    zIndex: 1001,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {locationSuggestions.end.map((loc, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectLocation(loc, 'end')}
                        style={{
                          padding: '12px',
                          borderBottom: '1px solid #333',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#1A1A1A'}
                      >
                        📍 {loc.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => getCurrentLocation('end')}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  width: '100%'
                }}
              >
                📍 Use Current Location
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div style={{
              backgroundColor: '#5D1F1F',
              color: '#FF6B6B',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              ❌ {error}
            </div>
          )}

          {searching && (
            <div style={{
              backgroundColor: '#1F3D5D',
              color: '#64B5F6',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              ⏳ Searching locations...
            </div>
          )}

          {startLocation && endLocation && (
            <div style={{
              backgroundColor: '#1F5D1F',
              color: '#81C784',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              ✅ Route ready! Found {reports.length} potholes in database
            </div>
          )}
        </div>

        {/* Map */}
        {startLocation && endLocation ? (
          <div style={{
            height: 'calc(100vh - 350px)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid #333'
          }}>
            <RouteMap
              startLocation={startLocation}
              endLocation={endLocation}
              reports={reports}
            />
          </div>
        ) : (
          <div style={{
            height: 'calc(100vh - 350px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1A1A1A',
            borderRadius: '12px',
            border: '2px solid #333',
            color: '#AAA',
            fontSize: '18px'
          }}>
            {startLocation || endLocation 
              ? '⏳ Please enter both locations' 
              : '📍 Enter start and end locations to see the route and potholes'}
          </div>
        )}
      </div>
    </div>
  )
}
