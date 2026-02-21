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
      <svg width="36" height="46" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.5"/>
          </filter>
        </defs>
        <path d="M18 0 C8 0 0 8 0 18 C0 32 18 46 18 46 C18 46 36 32 36 18 C36 8 28 0 18 0 Z" 
              fill="${color}" stroke="#000" stroke-width="2" filter="url(#shadow)"/>
        <circle cx="18" cy="18" r="10" fill="#FFF"/>
        <circle cx="18" cy="18" r="7" fill="${color}"/>
        <text x="18" y="23" font-size="14" font-weight="bold" text-anchor="middle" fill="#FFF">!</text>
      </svg>
    `
    
    return L.divIcon({
      html: svgIcon,
      className: 'custom-pothole-icon',
      iconSize: [36, 46],
      iconAnchor: [18, 46],
      popupAnchor: [0, -46]
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
          <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx="20" cy="20" r="18" fill="#4CAF50" stroke="#FFF" stroke-width="3" filter="url(#glow)"/>
            <circle cx="20" cy="20" r="12" fill="#2E7D32"/>
            <text x="20" y="27" font-size="20" font-weight="bold" text-anchor="middle" fill="#FFF">A</text>
          </svg>
        `,
        className: 'start-location-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
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
          <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx="20" cy="20" r="18" fill="#2196F3" stroke="#FFF" stroke-width="3" filter="url(#glow2)"/>
            <circle cx="20" cy="20" r="12" fill="#1565C0"/>
            <text x="20" y="27" font-size="20" font-weight="bold" text-anchor="middle" fill="#FFF">B</text>
          </svg>
        `,
        className: 'end-location-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
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

export default function RouteMap({ startLocation, endLocation, reports = [], showAnalysis = true, onCloseAnalysis }) {
  const defaultCenter = [20.5937, 78.9629]
  const mapRef = useRef(null)
  const [potholesOnRoute, setPotholesOnRoute] = useState([])
  const [routeDistance, setRouteDistance] = useState(0)

  // Debug logging
  useEffect(() => {
    console.log('🗺️ RouteMap mounted', { startLocation, endLocation, reportsCount: reports.length })
  }, [])

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

    const nearby = reports.filter(report => {
      if (!report.lat || !report.lon) return false
      return isPointNearRoute(
        { lat: report.lat, lon: report.lon },
        startLocation,
        endLocation,
        300 // 300m threshold
      )
    })

    // Sort by distance from start
    nearby.sort((a, b) => {
      const distA = calculateDistance(startLocation.lat, startLocation.lon, a.lat, a.lon)
      const distB = calculateDistance(startLocation.lat, startLocation.lon, b.lat, b.lon)
      return distA - distB
    })

    setPotholesOnRoute(nearby)
  }, [startLocation, endLocation, reports])

  const getReportSeverity = (report) => {
    if (!report.severity_breakdown) return 'Minor'
    if (report.severity_breakdown.Major > 0) return 'Major'
    if (report.severity_breakdown.Moderate > 0) return 'Moderate'
    return 'Minor'
  }

  // Determine bounds to fit both start and end locations
  const bounds = startLocation && endLocation ? 
    [[startLocation.lat, startLocation.lon], [endLocation.lat, endLocation.lon]] : 
    null

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
            <div style={{ color: '#CBD5E1' }}>📍 <strong>Distance:</strong> {(routeDistance / 1000).toFixed(2)} km</div>
            <div style={{ color: '#CBD5E1' }}>⚠️ <strong>Potholes on route:</strong> {potholesOnRoute.length}</div>
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
              positions={[
                [startLocation.lat, startLocation.lon],
                [endLocation.lat, endLocation.lon]
              ]}
              pathOptions={{
                color: '#000',
                weight: 8,
                opacity: 0.3
              }}
            />
            {/* Main route line */}
            <Polyline
              positions={[
                [startLocation.lat, startLocation.lon],
                [endLocation.lat, endLocation.lon]
              ]}
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
                <strong>🟢 Start Location</strong><br />
                {startLocation.lat.toFixed(5)}, {startLocation.lon.toFixed(5)}
              </Popup>
            </Marker>

            {/* End marker */}
            <Marker position={[endLocation.lat, endLocation.lon]} icon={getEndIcon()}>
              <Popup>
                <strong>🔵 End Location</strong><br />
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
