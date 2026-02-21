# Pothole Navigation & Alert System

## Overview
The Pothole Navigation & Alert System provides real-time, traffic-style warnings for potholes - similar to how navigation apps warn about traffic or accidents. This helps drivers avoid road hazards and promotes safer driving.

## Features

### 🗺️ Interactive Map with Live Alerts
- **Real-time location tracking** using GPS
- **Color-coded markers** based on pothole severity:
  - 🟠 **Orange** - Minor potholes
  - 🟠 **Red-Orange** - Moderate potholes  
  - 🔴 **Crimson** - Major potholes

### ⚠️ Traffic-Style Alerts
- **Distance-based warnings** appear at the top of the screen
- **Three alert levels**:
  - **Critical** (< 100m) - Red alert with "Pothole ahead in Xm - Drive carefully!"
  - **High** (100-250m) - Orange-red alert
  - **Warning** (250m-500m) - Orange alert
- **Multiple alerts** show up to 3 nearest potholes simultaneously
- **Auto-updates** as you move

### 🎯 Proximity Detection
- **Customizable alert radius**: 100m, 250m, 500m, 1km, or 2km
- **Visual zones** on map:
  - Red circle (100m) - Critical zone
  - Orange dashed circle - Alert radius
- **Real-time distance calculation** to all reported potholes

### 🔊 Audio Alerts
- **Sound notifications** when entering alert zones
- **60-second cooldown** to prevent alert spam
- **Toggle on/off** for silent navigation

### 📊 Live Statistics
- Total potholes in database
- Nearby potholes count
- Alerts shown during session
- Current location with accuracy
- Speed and heading (when available)

## How to Use

### Starting Navigation

1. **Access the Navigation Page**
   - Click "🗺️ Navigate" in the main navigation menu
   - Or click "Navigate with Alerts" button on the home page
   - Or visit: `http://localhost:3000/navigate`

2. **Get Your Location**
   - Click "📍 Get Location" for one-time position
   - Click "▶ Start Live Tracking" for continuous navigation
   - Allow location permissions when prompted

3. **Customize Settings**
   - **Alert Radius**: Choose detection distance (100m - 2km)
   - **Show Alert Zones**: Toggle visual circles on map
   - **Sound Alerts**: Enable/disable audio warnings

### During Navigation

- **Watch for alerts** at the top of the screen
- **Click markers** on map for detailed pothole information
- **Monitor stats** in bottom-right info panel
- **Adjust zoom** and pan the map as needed

### Stopping Navigation

- Click "⏹ Stop Tracking" to end live tracking
- Your last known location remains visible on the map

## Technical Implementation

### Frontend Components

#### 1. **PotholeAlertMap.jsx**
Main map component with:
- Leaflet/OpenStreetMap integration
- Custom SVG markers for severity levels
- Real-time distance calculations
- Alert zone circles
- Popup information windows

#### 2. **navigate/page.jsx**
Navigation page with:
- GPS location tracking (watchPosition API)
- Backend API integration
- Sound alert system
- Statistics tracking
- Control panel

### Backend API

#### GET `/reports`
Returns all pothole reports with location data:
```json
[
  {
    "id": "1771571183925_4c7c6d91",
    "timestamp": 1771571183,
    "lat": 25.2623,
    "lon": 87.0133,
    "description": "Pothole",
    "total_detections": 1,
    "severity_breakdown": {
      "Minor": 0,
      "Moderate": 1,
      "Major": 0
    },
    "detections": [...]
  }
]
```

### Distance Calculation
Uses the Haversine formula for accurate distance between coordinates:
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Earth's radius in meters
  // ... Haversine calculation
  return distance_in_meters
}
```

## Setup Instructions

### 1. Install Dependencies (Already done if you set up the project)
```bash
cd frontend
npm install leaflet react-leaflet axios
```

### 2. Start Backend Server
```bash
cd backend
pip install -r requirements.txt
python server.py
```

Backend runs on: `http://localhost:5000`

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3000`

### 4. Access Navigation
Navigate to: `http://localhost:3000/navigate`

## Browser Compatibility

### Location Services
- ✅ Chrome, Firefox, Safari, Edge (desktop & mobile)
- 🔒 **HTTPS required** for production (geolocation API restriction)
- 📱 Works best on mobile devices with GPS

### Map Compatibility
- Uses OpenStreetMap (no API key required)
- Leaflet works in all modern browsers
- Responsive design for mobile and desktop

## Privacy & Permissions

### What We Access
- **GPS Location**: Only when you start tracking
- **No data storage**: Location not saved to servers
- **Local processing**: Distance calculations in browser

### Permissions Required
Browser will request:
- "Allow [site] to access your location?"
- This is required for navigation features
- You can revoke permissions anytime in browser settings

## Troubleshooting

### Location Not Working
1. Check browser permissions for location access
2. Ensure HTTPS in production (HTTP works on localhost)
3. Try "Get Location" before "Start Live Tracking"
4. Check if location services are enabled on device

### No Potholes Showing
1. Verify backend is running (`http://localhost:5000`)
2. Check if `reports.json` has data with lat/lon
3. Ensure `reports.json` contains valid coordinates
4. Try uploading a report with location first

### Alerts Not Appearing
1. Check if pothole is within selected alert radius
2. Verify "Show Alert Zones" is enabled  
3. Ensure you're moving/close enough to trigger alerts
4. 60-second cooldown between same pothole alerts

### Map Not Displaying
1. Check internet connection (loads map tiles)
2. Refresh page and wait for assets to load
3. Clear browser cache if issues persist
4. Check browser console for errors (F12)

## Future Enhancements

### Planned Features
- [ ] **Route planning**: Avoid roads with potholes
- [ ] **Turn-by-turn navigation**: Integrated directions
- [ ] **Community reporting**: Report from navigation view
- [ ] **Offline mode**: Downloaded maps and cached data
- [ ] **Voice alerts**: Spoken warnings
- [ ] **Waze-style reporting**: Quick report buttons
- [ ] **Speed-based alerts**: Earlier warnings at higher speeds
- [ ] **Road quality score**: Rate entire routes
- [ ] **Alternative routes**: Suggest pothole-free paths
- [ ] **Share location**: Send ETA with alerts

### Integration Possibilities
- Google Maps API for enhanced navigation
- Mapbox for custom styling
- HERE Maps for offline support
- OpenRouteService for routing
- Traffic data integration
- Weather condition warnings

## API Usage

### Get All Reports
```bash
curl http://localhost:5000/reports
```

### Response Format
```json
[
  {
    "id": "unique_id",
    "timestamp": 1234567890,
    "lat": 12.3456,
    "lon": 78.9012,
    "description": "Large pothole",
    "total_detections": 3,
    "severity_breakdown": {
      "Minor": 1,
      "Moderate": 2,
      "Major": 0
    }
  }
]
```

## Code Examples

### Using PotholeAlertMap Component
```jsx
import PotholeAlertMap from '@/components/PotholeAlertMap'

function MyPage() {
  const userLocation = { lat: 25.2623, lon: 87.0133 }
  const reports = [...] // from API

  return (
    <div style={{ height: '500px' }}>
      <PotholeAlertMap
        userLocation={userLocation}
        reports={reports}
        alertRadius={500}
        showAlertZones={true}
      />
    </div>
  )
}
```

### Tracking User Location
```javascript
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    const location = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    }
    // Update map
  },
  (error) => console.error(error),
  { enableHighAccuracy: true }
)

// Stop tracking
navigator.geolocation.clearWatch(watchId)
```

## Performance Tips

1. **Limit reports loaded**: Filter by region or time
2. **Adjust alert radius**: Smaller = fewer calculations
3. **Throttle position updates**: Don't update on every GPS tick
4. **Cache pothole data**: Refresh every 30 seconds, not every position update
5. **Use map clustering**: For many markers (future enhancement)

## Security Considerations

- Location data never leaves browser during navigation
- Backend only stores submitted reports (on upload)
- No user tracking or analytics
- Reports stored locally in `reports.json`
- Consider authentication for sensitive deployments

## Credits

- **Maps**: OpenStreetMap contributors
- **Map Library**: Leaflet.js + React Leaflet
- **Icon Design**: Custom SVG markers
- **Distance Calculation**: Haversine formula

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Verify backend/frontend are running
4. Check network tab for API calls

---

**Happy and Safe Driving! 🚗💨⚠️**
