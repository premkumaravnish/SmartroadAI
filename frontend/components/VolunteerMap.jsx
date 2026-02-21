'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// use CDN icon URLs to avoid bundler image issues
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function SetViewOnChange({ loc }) {
  const map = useMap()
  useEffect(() => {
    if (loc) {
      map.setView([loc.lat, loc.lon], 16, { animate: true })
    }
  }, [loc, map])
  return null
}

export default function VolunteerMap({ location }) {
  const defaultCenter = [20.5937, 78.9629] // India center as fallback
  const mapRef = useRef(null)

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={location ? [location.lat, location.lon] : defaultCenter}
        zoom={location ? 16 : 5}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
        whenCreated={(m) => { mapRef.current = m }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {location && (
          <>
            <Marker position={[location.lat, location.lon]} icon={markerIcon}>
              <Popup>
                Your reported location<br />{location.lat.toFixed(5)}, {location.lon.toFixed(5)}
              </Popup>
            </Marker>
            <SetViewOnChange loc={location} />
          </>
        )}
      </MapContainer>
    </div>
  )
}
