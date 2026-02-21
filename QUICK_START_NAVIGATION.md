# 🗺️ Pothole Alert Navigation - Quick Start

## 🚀 Get Started in 3 Steps

### 1️⃣ Start the Servers

**Backend (Terminal 1):**
```bash
cd backend
python server.py
```
✅ Running on: http://localhost:5000

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
✅ Running on: http://localhost:3000

### 2️⃣ Open Navigation Page

Visit: **http://localhost:3000/navigate**

Or click **"🗺️ Navigate"** in the top menu

### 3️⃣ Start Tracking

1. Click **"▶ Start Live Tracking"**
2. Allow location permissions
3. Drive safely with real-time pothole alerts!

---

## 🎯 What You'll See

### ⚠️ Alert Examples
```
🚨 Major pothole ahead in 45m - Drive carefully!
⚠️ Moderate pothole ahead in 180m - Drive carefully!
⚠️ Minor pothole ahead in 320m - Drive carefully!
```

### 🗺️ Map Markers
- 🔴 **Red** = Major pothole
- 🟠 **Orange-Red** = Moderate pothole  
- 🟠 **Orange** = Minor pothole
- 🔵 **Blue** = Your location

### 📊 Info Panel (Bottom Right)
- Total potholes in system
- Nearby potholes count
- Severity legend

---

## ⚙️ Quick Settings

| Setting | Options | Description |
|---------|---------|-------------|
| **Alert Radius** | 100m - 2km | How far to detect potholes |
| **Alert Zones** | On/Off | Show circles on map |
| **Sound Alerts** | 🔊/🔇 | Audio beeps for warnings |

---

## 📱 Mobile Usage

1. Open on your phone's browser
2. Allow location access
3. Mount phone as dashcam/GPS
4. Get alerts while driving!

**ProTip:** Use landscape mode for better view

---

## 🆘 Troubleshooting

### Location Not Working?
- ✅ Allow location permissions in browser
- ✅ Check if GPS/location services are enabled
- ✅ Make sure you're on HTTPS (production) or localhost (dev)

### No Potholes Showing?
- ✅ Verify backend is running (http://localhost:5000)
- ✅ Check if reports.json has data
- ✅ Try uploading a test report first

### Alerts Not Appearing?
- ✅ Move closer to a pothole location
- ✅ Increase alert radius (try 1km)
- ✅ Wait 60 seconds between alerts (cooldown)

---

## 🎮 Controls

### Buttons
- **📍 Get Location** - One-time position check
- **▶ Start Live Tracking** - Continuous GPS tracking
- **⏹ Stop Tracking** - End navigation session
- **← Back** - Return to home page

### Map Controls
- **Zoom**: +/- buttons or scroll wheel
- **Pan**: Click and drag
- **Marker**: Click for pothole details

---

## 💡 Tips for Best Experience

1. **Start tracking before driving** - Get a GPS lock first
2. **Enable sound alerts** - Hear warnings without looking
3. **Use larger alert radius** - More advance warning time
4. **Keep phone charged** - GPS uses battery
5. **Mount securely** - Don't handle phone while driving

---

## 🎯 Example Scenarios

### City Driving
```
Alert Radius: 500m
Sound: ON
Alert Zones: ON
Speed: 30-60 km/h
```
Perfect for urban roads with frequent stops

### Highway Driving
```
Alert Radius: 1-2km
Sound: ON
Alert Zones: OFF
Speed: 60-100 km/h
```
Longer warning distance for high speeds

### Walking/Cycling
```
Alert Radius: 100-250m
Sound: OFF
Alert Zones: ON
Speed: 5-20 km/h
```
Short range, visual-only alerts

---

## 📸 How to Add Potholes

Found a new pothole? Help the community!

1. Go to **http://localhost:3000/volunteer**
2. Take a photo
3. Location will auto-populate
4. Click **"Detect & Submit"**
5. Your report appears on the map! ✅

---

## 🌟 Features Overview

### Real-Time Features
- ✅ Live GPS tracking
- ✅ Distance calculation to all potholes
- ✅ Auto-updating alerts
- ✅ Speed and heading display

### Safety Features
- ✅ Color-coded severity warnings
- ✅ Audio alerts with cooldown
- ✅ Visual danger zones
- ✅ Multiple simultaneous alerts

### Data Features
- ✅ 5000+ pothole database
- ✅ Auto-refresh every 30 seconds
- ✅ Severity breakdown
- ✅ Timestamp and location data

---

## 🔗 Quick Links

- **Home**: http://localhost:3000
- **Navigation**: http://localhost:3000/navigate
- **Upload**: http://localhost:3000/volunteer
- **Admin**: http://localhost:3000/admin
- **API**: http://localhost:5000/reports

---

## 📖 Full Documentation

For detailed information, see [**NAVIGATION_GUIDE.md**](NAVIGATION_GUIDE.md)

---

## 🚗 **Drive Safely!** ⚠️

**Remember**: Use this as an aid, not a replacement for attentive driving.  
Always prioritize road safety and traffic laws.

---

**Made with ❤️ by Team Achievers**
