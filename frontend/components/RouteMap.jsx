'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue - with error handling
if (typeof window !== 'undefined' && L) {
  try {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  } catch (e) {
    console.warn('Failed to fix Leaflet default icons:', e)
  }
}

// Custom pothole icons with improved visibility
const createCustomIcon = (severity) => {
  if (!L) return null
  try {
    const colors = {
      'Minor': '#FFA500',
      'Moderate': '#FF6500',
      'Major': '#FF0000'
    }
    
    const color = colors[severity] || '#FF0000'
    
    const svgIcon = `
      <svg width="32" height="42" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow-${severity}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
          </filter>
        </defs>
        <!-- Pin shape -->
        <path d="M16 0 C10 0 5 5 5 11 C5 18 16 42 16 42 C16 42 27 18 27 11 C27 5 22 0 16 0 Z" 
              fill="${color}" stroke="#FFFFFF" stroke-width="2" filter="url(#shadow-${severity})"/>
        <!-- Inner circle -->
        <circle cx="16" cy="11" r="5" fill="#FFFFFF"/>
      </svg>
    `
    
    return L.divIcon({
      html: svgIcon,
      className: 'custom-pothole-icon',
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42]
    })
  } catch (e) {
    console.error('Error creating custom icon:', e)
    return null
  }
}

// Start location icon - lazy initialized
let startIcon = null
const getStartIcon = () => {
  if (!startIcon && L) {
    try {
      startIcon = L.divIcon({
        html: `
          <svg width="36" height="48" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
              </filter>
            </defs>
            <path d="M18 0 C11 0 5 6 5 13 C5 21 18 48 18 48 C18 48 31 21 31 13 C31 6 25 0 18 0 Z" 
                  fill="#4CAF50" stroke="#FFFFFF" stroke-width="2.5" filter="url(#glow)"/>
            <circle cx="18" cy="13" r="6" fill="#FFFFFF"/>
            <text x="18" y="17" font-size="12" font-weight="bold" text-anchor="middle" fill="#4CAF50">A</text>
          </svg>
        `,
        className: 'start-location-icon',
        iconSize: [36, 48],
        iconAnchor: [18, 48]
      })
    } catch (e) {
      console.error('Error creating start icon:', e)
    }
  }
  return startIcon
}

// End location icon - lazy initialized
let endIcon = null
const getEndIcon = () => {
  if (!endIcon && L) {
    try {
      endIcon = L.divIcon({
        html: `
          <svg width="36" height="48" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
              </filter>
            </defs>
            <path d="M18 0 C11 0 5 6 5 13 C5 21 18 48 18 48 C18 48 31 21 31 13 C31 6 25 0 18 0 Z" 
                  fill="#2196F3" stroke="#FFFFFF" stroke-width="2.5" filter="url(#glow2)"/>
            <circle cx="18" cy="13" r="6" fill="#FFFFFF"/>
            <text x="18" y="17" font-size="12" font-weight="bold" text-anchor="middle" fill="#2196F3">B</text>
          </svg>
        `,
        className: 'end-location-icon',
        iconSize: [36, 48],
        iconAnchor: [18, 48]
      })
    } catch (e) {
      console.error('Error creating end icon:', e)
    }
  }
  return endIcon
}

// Map bounds adjuster
function MapBoundsSetter({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [bounds, map])
  return null
}

// Calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// Check if a point is near a line (route)
function isPointNearRoute(point, start, end, threshold = 200) {
  // Calculate distance from point to line segment
  const A = point.lat - start.lat
  const B = point.lon - start.lon
  const C = end.lat - start.lat
  const D = end.lon - start.lon

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1

  if (lenSq !== 0) param = dot / lenSq

  let xx, yy

  if (param < 0) {
    xx = start.lat
    yy = start.lon
  } else if (param > 1) {
    xx = end.lat
    yy = end.lon
  } else {
    xx = start.lat + param * C
    yy = start.lon + param * D
  }

  const distance = calculateDistance(point.lat, point.lon, xx, yy)
  return distance <= threshold
}

function isPointNearRouteLine(point, linePoints = [], threshold = 200) {
  if (!linePoints || linePoints.length < 2) return false

  for (let i = 0; i < linePoints.length - 1; i += 1) {
    const start = { lat: linePoints[i][0], lon: linePoints[i][1] }
    const end = { lat: linePoints[i + 1][0], lon: linePoints[i + 1][1] }
    if (isPointNearRoute(point, start, end, threshold)) return true
  }

  return false
}

export default function RouteMap({ startLocation, endLocation, reports = [], showAnalysis = true, onCloseAnalysis }) {
  const defaultCenter = [20.5937, 78.9629]
  const mapRef = useRef(null)
  const [potholesOnRoute, setPotholesOnRoute] = useState([])
  const [routeDistance, setRouteDistance] = useState(0)
  const [routePath, setRoutePath] = useState([])
  const [routeSummary, setRouteSummary] = useState({ distance: 0, duration: 0, steps: [] })
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState('')

  // Debug logging
  useEffect(() => {
    console.log('🗺️ RouteMap mounted', { startLocation, endLocation, reportsCount: reports.length })
  }, [])

  useEffect(() => {
    const fetchRoute = async () => {
      if (!startLocation || !endLocation) {
        setRoutePath([])
        setRouteSummary({ distance: 0, duration: 0, steps: [] })
        setRouteError('')
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY
      if (!apiKey) {
        setRoutePath([])
        setRouteSummary({ distance: 0, duration: 0, steps: [] })
        setRouteError('OpenRouteService API key missing. Add NEXT_PUBLIC_ORS_API_KEY to .env.local')
        return
      }

      setRouteLoading(true)
      setRouteError('')

      try {
        console.log('🚗 Fetching route from ORS API...')
        console.log('API Key present:', !!apiKey)
        console.log('Start:', startLocation)
        console.log('End:', endLocation)

        // Use POST with explicit preference for coordinate array format
        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': apiKey,
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
          },
          body: JSON.stringify({
            coordinates: [
              [startLocation.lon, startLocation.lat],
              [endLocation.lon, endLocation.lat]
            ],
            instructions: true
          })
        })

        console.log('Response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('ORS API Error:', errorData)
          throw new Error(`Route request failed: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()
        console.log('ORS Response:', data)
        console.log('Response keys:', Object.keys(data))
        console.log('Features array:', data?.features)
        console.log('Routes array:', data?.routes)
        
        // OpenRouteService v2 API returns routes array, not features
        const route = data?.routes?.[0] || data?.features?.[0]
        if (!route) {
          console.error('No route in response. Full data:', JSON.stringify(data, null, 2))
          throw new Error(`No route found. API returned: ${JSON.stringify(Object.keys(data))}`)
        }

        console.log('Route object:', route)
        console.log('Route geometry:', route?.geometry)
        console.log('Route geometry type:', typeof route?.geometry)

        // Handle both v2 API format (routes) and GeoJSON format (features)
        let coords = []
        
        if (Array.isArray(route?.geometry?.coordinates)) {
          coords = route.geometry.coordinates
        } else if (Array.isArray(route?.geometry)) {
          coords = route.geometry
        } else if (typeof route?.geometry === 'string') {
          // Handle encoded polyline format
          throw new Error('Encoded polyline geometry not supported. Request unencoded coordinates.')
        } else {
          console.error('Unexpected geometry format:', route?.geometry)
          throw new Error('Invalid geometry format in route response')
        }

        if (!Array.isArray(coords) || coords.length === 0) {
          throw new Error('No coordinates in route geometry')
        }

        console.log('Coordinates array length:', coords.length, 'First coord:', coords[0])

        const path = coords.map(([lon, lat]) => [lat, lon])
        const summary = route?.summary || route?.properties?.summary || {}
        const steps = route?.segments?.[0]?.steps || route?.properties?.segments?.[0]?.steps || []

        console.log('✅ Route fetched successfully:', {
          pathPoints: path.length,
          distance: summary.distance,
          steps: steps.length
        })

        setRoutePath(path)
        setRouteSummary({
          distance: summary.distance || 0,
          duration: summary.duration || 0,
          steps
        })
      } catch (err) {
        console.error('❌ Failed to fetch route:', err)
        setRoutePath([])
        setRouteSummary({ distance: 0, duration: 0, steps: [] })
        setRouteError(`Route error: ${err.message}`)
      } finally {
        setRouteLoading(false)
      }
    }

    fetchRoute()
  }, [startLocation, endLocation])

  // Find potholes on the route
  useEffect(() => {
    if (!startLocation || !endLocation || !reports.length) {
      setPotholesOnRoute([])
      setRouteDistance(0)
      return
    }

    const distance = calculateDistance(
      startLocation.lat,
      startLocation.lon,
      endLocation.lat,
      endLocation.lon
    )
    setRouteDistance(distance)

    const linePoints = routePath.length
      ? routePath
      : [
          [startLocation.lat, startLocation.lon],
          [endLocation.lat, endLocation.lon]
        ]

    const nearby = reports.filter(report => {
      if (!report.lat || !report.lon) return false
      return isPointNearRouteLine(
        { lat: report.lat, lon: report.lon },
        linePoints,
        300
      )
    })

    // Sort by distance from start
    nearby.sort((a, b) => {
      const distA = calculateDistance(startLocation.lat, startLocation.lon, a.lat, a.lon)
      const distB = calculateDistance(startLocation.lat, startLocation.lon, b.lat, b.lon)
      return distA - distB
    })

    setPotholesOnRoute(nearby)
  }, [startLocation, endLocation, reports, routePath])

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const minutes = Math.round(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainder = minutes % 60
    return hours > 0 ? `${hours}h ${remainder}m` : `${minutes} min`
  }

  const getReportSeverity = (report) => {
    if (!report.severity_breakdown) return 'Minor'
    if (report.severity_breakdown.Major > 0) return 'Major'
    if (report.severity_breakdown.Moderate > 0) return 'Moderate'
    return 'Minor'
  }

  // Determine bounds to fit both start and end locations
  const bounds = routePath.length
    ? routePath
    : startLocation && endLocation
      ? [[startLocation.lat, startLocation.lon], [endLocation.lat, endLocation.lon]]
      : null

  const routeLine = routePath.length
    ? routePath
    : startLocation && endLocation
      ? [[startLocation.lat, startLocation.lon], [endLocation.lat, endLocation.lon]]
      : null

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Error Notification */}
      {routeError && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1001,
          backgroundColor: 'rgba(220, 38, 38, 0.95)',
          color: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '12px',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.4)',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>{routeError}</div>
          </div>
        </div>
      )}

      {/* Route Info Panel */}
      {showAnalysis && startLocation && endLocation && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          color: '#E2E8F0',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          minWidth: '320px',
          boxShadow: '0 8px 32px rgba(6, 182, 212, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#06B6D4', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛣️ Route Analysis
            </h3>
            <button
              onClick={onCloseAnalysis}
              style={{
                background: 'none',
                border: 'none',
                color: '#60A5FA',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#06B6D4';
                e.target.style.transform = 'scale(1.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#60A5FA';
                e.target.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: '14px', lineHeight: '2' }}>
            <div style={{ color: '#CBD5E1' }}>
              📍 <strong>Distance:</strong> {((routeSummary.distance || routeDistance) / 1000).toFixed(2)} km
            </div>
            <div style={{ color: '#CBD5E1' }}>
              ⏱️ <strong>ETA:</strong> {formatDuration(routeSummary.duration)}
            </div>
            <div style={{ color: '#CBD5E1' }}>⚠️ <strong>Potholes on route:</strong> {potholesOnRoute.length}</div>
            {routeLoading && (
              <div style={{ color: '#60A5FA' }}>Loading route directions...</div>
            )}
            {routeError && (
              <div style={{ color: '#FCA5A5' }}>{routeError}</div>
            )}
            {potholesOnRoute.length > 0 && (
              <div style={{
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid rgba(148, 163, 184, 0.2)'
              }}>
                <strong style={{ color: '#F87171' }}>Hazards ahead:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#CBD5E1' }}>
                  {potholesOnRoute.slice(0, 5).map((p, idx) => (
                    <li key={p.id} style={{ fontSize: '12px', marginBottom: '4px' }}>
                      {idx + 1}. {getReportSeverity(p)} pothole
                    </li>
                  ))}
                  {potholesOnRoute.length > 5 && <li>... and {potholesOnRoute.length - 5} more</li>}
                </ul>
              </div>
            )}
            {routeSummary.steps.length > 0 && (
              <div style={{
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid rgba(148, 163, 184, 0.2)'
              }}>
                <strong style={{ color: '#93C5FD' }}>Directions:</strong>
                <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#CBD5E1' }}>
                  {routeSummary.steps.slice(0, 6).map((step, idx) => (
                    <li key={`${step.way_points?.[0] || idx}`} style={{ fontSize: '12px', marginBottom: '6px' }}>
                      {step.instruction} ({Math.round(step.distance)} m)
                    </li>
                  ))}
                  {routeSummary.steps.length > 6 && <li>... and {routeSummary.steps.length - 6} more</li>}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={startLocation ? [startLocation.lat, startLocation.lon] : defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ width: '100%', height: '100%', borderRadius: '12px' }}
        ref={mapRef}
      >
        {/* Better map tiles with satellite/street hybrid */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={3}
        />
        
        {/* Alternative: Uncomment for better detailed maps */}
        {/* <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        /> */}

        {/* Fit bounds to show route */}
        {bounds && <MapBoundsSetter bounds={bounds} />}

        {/* Route line with improved visibility */}
        {startLocation && endLocation && (
          <>
            {/* Shadow/outline for route */}
            <Polyline
              positions={routeLine || []}
              pathOptions={{
                color: '#000',
                weight: 8,
                opacity: 0.3
              }}
            />
            {/* Main route line */}
            <Polyline
              positions={routeLine || []}
              pathOptions={{
                color: '#4CAF50',
                weight: 5,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            
            {/* Start marker */}
            <Marker position={[startLocation.lat, startLocation.lon]} icon={getStartIcon()}>
              <Popup>
                <strong>� Start Location</strong><br />
                {startLocation.lat.toFixed(5)}, {startLocation.lon.toFixed(5)}
              </Popup>
            </Marker>

            {/* End marker */}
            <Marker position={[endLocation.lat, endLocation.lon]} icon={getEndIcon()}>
              <Popup>
                <strong>� End Location</strong><br />
                {endLocation.lat.toFixed(5)}, {endLocation.lon.toFixed(5)}
              </Popup>
            </Marker>
          </>
        )}

        {/* All pothole markers on route */}
        {potholesOnRoute.map((report) => {
          const severity = getReportSeverity(report)
          return (
            <Marker
              key={report.id}
              position={[report.lat, report.lon]}
              icon={createCustomIcon(severity)}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: severity === 'Major' ? '#DC143C' : severity === 'Moderate' ? '#FF4500' : '#FFA500' }}>
                    ⚠️ {severity} Pothole
                  </h4>
                  <div style={{ fontSize: '13px' }}>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Description:</strong> {report.description || 'No description'}
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Detections:</strong> {report.total_detections || 0}
                    </p>
                    {report.severity_breakdown && (
                      <div style={{ margin: '8px 0' }}>
                        <strong>Breakdown:</strong>
                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                          {report.severity_breakdown.Major > 0 && <li>Major: {report.severity_breakdown.Major}</li>}
                          {report.severity_breakdown.Moderate > 0 && <li>Moderate: {report.severity_breakdown.Moderate}</li>}
                          {report.severity_breakdown.Minor > 0 && <li>Minor: {report.severity_breakdown.Minor}</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .custom-pothole-icon {
          background: none;
          border: none;
          animation: fadeIn 0.3s ease-out;
        }
        
        .start-location-icon {
          background: none;
          border: none;
          animation: pulse 2s ease-in-out infinite;
        }
        
        .end-location-icon {
          background: none;
          border: none;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        
        .leaflet-popup-content {
          margin: 14px;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          border-radius: 8px !important;
        }
        
        .leaflet-control-zoom a {
          color: #333 !important;
          font-weight: bold !important;
          border-radius: 4px !important;
        }
        
        .leaflet-control-zoom a:hover {
          background-color: #4CAF50 !important;
          color: #FFF !important;
        }
        
        .leaflet-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
      `}</style>
    </div>
  )
}
