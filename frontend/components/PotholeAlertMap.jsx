'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
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

// Custom red pin icon for all pothole locations
const createCustomIcon = (severity) => {
  if (!L) return null
  try {
    // All pothole pins are red for better visibility
    const color = '#FF0000'
    
    const svgIcon = `
      <svg width="36" height="46" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.6"/>
          </filter>
        </defs>
        <path d="M18 0 C8 0 0 8 0 18 C0 32 18 46 18 46 C18 46 36 32 36 18 C36 8 28 0 18 0 Z" 
              fill="${color}" stroke="#FFFFFF" stroke-width="2.5" filter="url(#shadow)"/>
        <circle cx="18" cy="18" r="10" fill="#FFF"/>
        <circle cx="18" cy="18" r="7" fill="${color}"/>
        <text x="18" y="23" font-size="14" font-weight="bold" text-anchor="middle" fill="#FFF">⚠</text>
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

// User location icon with pulse animation - lazy initialized
let userIcon = null
const getUserIcon = () => {
  if (!userIcon && L) {
    try {
      userIcon = L.divIcon({
        html: `
          <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx="16" cy="16" r="14" fill="#4A90E2" stroke="#FFF" stroke-width="3" filter="url(#glow)" opacity="0.3"/>
            <circle cx="16" cy="16" r="10" fill="#4A90E2" stroke="#FFF" stroke-width="3"/>
            <circle cx="16" cy="16" r="5" fill="#FFF"/>
          </svg>
        `,
        className: 'user-location-icon pulse-anim',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    } catch (e) {
      console.error('Error creating user icon:', e)
    }
  }
  return userIcon
}

// Component to handle map view updates
function SetViewOnChange({ loc }) {
  const map = useMap()
  useEffect(() => {
    if (loc) {
      map.setView([loc.lat, loc.lon], map.getZoom(), { animate: true })
    }
  }, [loc, map])
  return null
}

// Calculate distance between two coordinates (in meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

export default function PotholeAlertMap({ userLocation, reports = [], alertRadius = 500, showAlertZones = true }) {
  const [showStatistics, setShowStatistics] = useState(true)
  const defaultCenter = [20.5937, 78.9629] // India center
  const mapRef = useRef(null)
  const [nearbyPotholes, setNearbyPotholes] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])

  // Debug logging
  useEffect(() => {
    console.log('🗺️ PotholeAlertMap mounted', { userLocation, reportsCount: reports.length })
  }, [])

  // Check for nearby potholes and trigger alerts
  useEffect(() => {
    if (!userLocation || !reports.length) {
      setNearbyPotholes([])
      setActiveAlerts([])
      return
    }

    const nearby = []
    const alerts = []

    reports.forEach((report) => {
      // Skip reports without valid coordinates
      if (!report.lat || !report.lon) return;
      
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lon,
        report.lat,
        report.lon
      )

      if (distance <= alertRadius) {
        nearby.push({ ...report, distance })
        
        // Determine alert level based on distance and severity
        let alertLevel = 'warning'
        let alertDistance = Math.round(distance)
        
        if (distance <= 100) {
          alertLevel = 'critical'
        } else if (distance <= 250) {
          alertLevel = 'high'
        }

        const severity = report.severity_breakdown 
          ? (report.severity_breakdown.Major > 0 ? 'Major' : 
             report.severity_breakdown.Moderate > 0 ? 'Moderate' : 'Minor')
          : 'Unknown'

        alerts.push({
          id: report.id,
          distance: alertDistance,
          severity,
          alertLevel,
          message: `${severity} pothole ahead in ${alertDistance}m - Drive carefully!`
        })
      }
    })

    // Sort by distance
    nearby.sort((a, b) => a.distance - b.distance)
    alerts.sort((a, b) => a.distance - b.distance)

    setNearbyPotholes(nearby)
    setActiveAlerts(alerts)
  }, [userLocation, reports, alertRadius])

  // Get severity for a report
  const getReportSeverity = (report) => {
    if (!report.severity_breakdown) return 'Minor'
    if (report.severity_breakdown.Major > 0) return 'Major'
    if (report.severity_breakdown.Moderate > 0) return 'Moderate'
    return 'Minor'
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Alert Panel */}
      {activeAlerts.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          maxWidth: '90%',
          width: '500px'
        }}>
          {activeAlerts.slice(0, 3).map((alert, idx) => (
            <div
              key={alert.id}
              style={{
                backgroundColor: alert.alertLevel === 'critical' ? '#DC143C' :
                                alert.alertLevel === 'high' ? '#FF4500' : '#FFA500',
                color: '#FFF',
                padding: '12px 20px',
                borderRadius: '8px',
                marginBottom: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                fontWeight: 'bold',
                fontSize: '14px',
                animation: 'pulse 2s ease-in-out infinite',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Statistics Panel */}
      {showStatistics && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 8px 32px rgba(6, 182, 212, 0.2)',
          width: '280px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#06B6D4' }}>
              Pothole Alerts
            </h3>
            <button
              onClick={() => setShowStatistics(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#60A5FA',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0',
                width: '20px',
                height: '20px',
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
          <div style={{ fontSize: '13px', color: '#CBD5E1' }}>
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🚨 <strong>Total:</strong> {reports.length}
            </div>
            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ <strong>Nearby:</strong> {nearbyPotholes.length}
            </div>
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '12px' }}>
                <span style={{ color: '#FFA500', fontSize: '14px' }}>●</span> Minor
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '12px' }}>
                <span style={{ color: '#FF6500', fontSize: '14px' }}>●</span> Moderate
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ color: '#FF0000', fontSize: '14px' }}>●</span> Major
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lon] : defaultCenter}
        zoom={userLocation ? 15 : 5}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
        ref={mapRef}
      >
        {/* Better quality map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={3}
        />
        
        {/* Alternative: Uncomment for cleaner maps */}
        {/* <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        /> */}

        {/* User location marker and alert radius */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lon]} icon={getUserIcon()}>
              <Popup>
                <strong>Your Location</strong><br />
                {userLocation.lat.toFixed(5)}, {userLocation.lon.toFixed(5)}
              </Popup>
            </Marker>
            
            {showAlertZones && (
              <>
                {/* Alert radius circle */}
                <Circle
                  center={[userLocation.lat, userLocation.lon]}
                  radius={alertRadius}
                  pathOptions={{
                    color: '#FFA500',
                    fillColor: '#FFA500',
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                />
                
                {/* Critical zone (100m) */}
                <Circle
                  center={[userLocation.lat, userLocation.lon]}
                  radius={100}
                  pathOptions={{
                    color: '#DC143C',
                    fillColor: '#DC143C',
                    fillOpacity: 0.15,
                    weight: 2
                  }}
                />
              </>
            )}
            
            <SetViewOnChange loc={userLocation} />
          </>
        )}

        {/* Pothole markers */}
        {reports.filter(r => r.lat && r.lon).map((report) => {
          const severity = getReportSeverity(report)
          const isNearby = nearbyPotholes.some(p => p.id === report.id)
          
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
                    <p style={{ margin: '4px 0' }}>
                      <strong>Location:</strong> {report.lat ? report.lat.toFixed(5) : 'N/A'}, {report.lon ? report.lon.toFixed(5) : 'N/A'}
                    </p>
                    {isNearby && userLocation && report.lat && report.lon && (
                      <p style={{ 
                        margin: '8px 0 0 0', 
                        padding: '6px',
                        backgroundColor: '#FFF3CD',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        color: '#856404'
                      }}>
                        ⚠️ {Math.round(calculateDistance(userLocation.lat, userLocation.lon, report.lat, report.lon))}m away
                      </p>
                    )}
                    {report.timestamp && (
                      <p style={{ margin: '4px 0', fontSize: '11px', color: '#666' }}>
                        Reported: {new Date(report.timestamp * 1000).toLocaleDateString()}
                      </p>
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
            transform: scale(1.1);
            opacity: 0.7;
          }
        }
        
        .custom-pothole-icon {
          background: none;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .custom-pothole-icon:hover {
          transform: scale(1.15);
          z-index: 1000 !important;
        }
        
        .user-location-icon {
          background: none;
          border: none;
        }
        
        .pulse-anim {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .leaflet-popup-content {
          margin: 14px;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        
        .leaflet-control-zoom a {
          color: #333 !important;
          font-weight: bold !important;
        }
        
        .leaflet-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
      `}</style>
    </div>
  )
}
