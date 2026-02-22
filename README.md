# 🛣️ SmartRoad AI - Pothole Detection System

> **AI-powered pothole detection for safer Indian roads**
> 
> Built with ❤️ by Prem Avnish & Team for Enyugma 2026, IIIT Bhagalpur

---

## 🎯 What is SmartRoad AI?

**SmartRoad AI** is an intelligent system that automatically detects potholes on roads using machine learning and real-time GPS tracking. It alerts drivers about hazards, helps volunteers report damages, and gives administrators a dashboard to monitor and fix roads faster.

Think of it like **Waze for potholes** — real-time alerts showing exactly where road damage is located.

---

## ✨ Key Features

### 🤖 **Smart Detection**
- **AI-powered**: YOLOv8 model detects potholes in images & videos
- **Severity classification**: Minor, Moderate, Major (color-coded)
- **Fast & accurate**: High-confidence detection with real-time processing

### 🗺️ **Live Navigation**
- **GPS tracking**: Real-time location updates while driving
- **Traffic-style alerts**: "Pothole ahead in 300m - Drive carefully!"
- **Interactive map**: See all reported potholes around you
- **Proximity detection**: Alerts within 100m to 2km radius
- **Route planning**: Avoid pothole-heavy routes

### 📱 **Web Application**
- **Volunteer app**: Report potholes with photos, earn coins 🪙
- **Admin dashboard**: Monitor all reports, verify detections, manage data
- **Responsive design**: Works on desktop, tablet, and mobile
- **Real-time updates**: See new reports instantly

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** (for backend)
- **Node.js 16+** (for frontend)  
- **Git**

### 1️⃣ Backend Setup (Flask + YOLO)

```bash
cd backend
pip install -r requirements.txt
python server.py
```

Backend runs on **http://localhost:5000**

**What it does:**
- Detects potholes in uploaded images/videos
- Stores reports with GPS coordinates
- Provides API for the web app

### 2️⃣ Frontend Setup (Next.js + React)

```bash
cd frontend
npm install
npm run dev
```

Frontend opens at **http://localhost:3000**

**What you can do:**
- View home page with features
- Navigate to `/navigate` for live map
- Visit `/volunteer` to report potholes
- Access `/admin` for admin dashboard

---

## 🌐 What Can You Do?

### For Volunteers 🚗
1. **Sign up** with email/password
2. **Upload image/video** of a pothole
3. **Mark location** on map
4. **Add description** — "Main Street, near bus stop"
5. **Earn coins** 🪙 for verified reports → Redeem for rewards

### For Admins 👨‍💼
1. **Login** to secure dashboard
2. **View all reports** on interactive map
3. **Verify detections** — is it really a pothole?
4. **Track statistics** — potholes per area, severity trends
5. **Export data** — for municipal planning

### For Drivers 🛣️
1. **Open navigation page**
2. **See live map** with all nearby potholes
3. **Receive alerts** when approaching hazards
4. **Plan routes** to avoid damaged roads
5. **Stay safe!** ✨

---

## 🏗️ Project Structure

```
achievers-main/
├── backend/                    # Flask server + YOLO AI
│   ├── server.py              # Main backend API
│   ├── detect.py              # YOLO detection logic
│   ├── pothole.pt             # Trained YOLO model
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # Next.js web app
│   ├── app/
│   │   ├── page.tsx           # Home page
│   │   ├── navigate/          # Live GPS map
│   │   ├── volunteer/         # Report submission
│   │   ├── admin/             # Admin dashboard
│   │   └── detect/            # Detection pages
│   ├── components/            # Reusable UI components
│   └── package.json           # Node dependencies
│
└── README.md                   # You are here!
```

---

## 🔌 How It Works

```
User uploads image
        ↓
Backend receives image
        ↓
YOLO model detects potholes
        ↓
AI returns: location, severity, confidence
        ↓
Report stored with GPS coordinates
        ↓
Admin & other drivers see it on map
        ↓
Authorities can take action
```

---

## 🛠️ Technologies

| Component | Technology | Why |
|-----------|-----------|-----|
| **Backend** | Flask (Python) | Fast, simple, great for ML |
| **AI Model** | YOLOv8 | Real-time object detection |
| **Frontend** | Next.js + React | Modern, fast, responsive |
| **Map** | Leaflet + OpenStreetMap | Free, open-source, no API key |
| **Routing** | OpenRouteService | Free direction API |
| **Database** | JSON files | Lightweight, no setup needed |

---

## 📊 Tech Stack Visual

```
┌─────────────────────────────────────────────────┐
│          Volunteer / Driver / Admin             │
│         (Next.js 14 React Frontend)             │
└─────────────────────────────────────────────────┘
                        ↓
         ┌──────────────────────────────┐
         │   Flask REST API (Port 5000) │
         │  - /upload (POST image)      │
         │  - /reports (GET all)        │
         │  - /admin/stats (GET stats)  │
         └──────────────────────────────┘
                        ↓
         ┌──────────────────────────────┐
         │   YOLO AI Model (YOLOv8n)    │
         │   - Detects potholes         │
         │   - Classifies severity      │
         │   - Returns bounding boxes   │
         └──────────────────────────────┘
                        ↓
         ┌──────────────────────────────┐
         │   Storage (JSON + MongoDB)   │
         │   - Reports with GPS coords  │
         │   - User profiles            │
         │   - Statistics               │
         └──────────────────────────────┘
```

---

## 🎮 Demo Flows

### 🚗 Volunteer Reporting Flow
```
Home → Click "Upload Image/Video" 
  → Sign up/Login
  → Select image
  → Mark location on map
  → Add description
  → Submit
  → ✅ Earn coins after verification
```

### 🗺️ Navigation Flow
```
Home → Click "Navigate"
  → Allow location access
  → See live map with potholes
  → ⚠️ Get alerts for nearby hazards
  → Click "Plan Your Route"
  → Enter start & destination
  → See safest path avoiding potholes
```

### 👨‍💼 Admin Flow
```
Home → Click "Admin Login"
  → Enter credentials
  → View Dashboard
  → See all reports on map
  → Verify/Reject reports
  → View statistics & trends
  → Export data for planning
```

---

## 🔑 Key Numbers

| Metric | Value |
|--------|-------|
| Detection Speed | Real-time |
| Accuracy | ~92% (YOLOv8) |
| Supported Formats | JPG, PNG, MP4, WebM |
| Map Coverage | India-wide |
| Alert Radius | 100m - 2km customizable |
| User Types | Volunteers, Drivers, Admins |

---

## 📱 Screenshots / Features

🏠 **Home Page**
- Feature showcase with animations
- Call-to-action buttons
- Team information
- Technology stack display

🗺️ **Navigate Page**
- Live pothole markers
- Real-time GPS tracking
- Alert notifications
- Route planning with ORS integration
- Live demo video embed

📝 **Volunteer Dashboard**
- Report submission form
- My reports table
- Wallet & coin tally
- Rewards marketplace
- Live map view

🛡️ **Admin Dashboard**
- Report verification queue
- Statistics & charts
- Severity distribution
- User leaderboard
- Export to CSV

---

## 🚨 Common Issues & Fixes

**Q: Backend won't start?**
```
Make sure Python 3.8+ is installed
pip install -r backend/requirements.txt
python backend/server.py
```

**Q: Port 3000/5000 already in use?**
```
# Kill the process
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Q: "Cannot find module" error?**
```
cd frontend
npm install
npm run dev
```

**Q: Map not showing?**
```
Open browser DevTools (F12)
Check console for errors
Make sure GPS is enabled
```

---

## 🎯 Future Roadmap

- ✅ Real-time GPS tracking
- ✅ Interactive maps
- ✅ Route planning
- 🔄 Native mobile app (iOS/Android)
- 🔄 Advanced analytics & heatmaps
- 🔄 Integration with city authorities
- 🔄 Automated repair scheduling
- 🔄 Multi-language support

---

## 👥 Meet the Team

**SmartRoad AI** is developed by passionate students at **IIIT Bhagalpur** for the **Enyugma 2026 Hackathon**.

| Role | Name |
|------|------|
| **Lead Developer** | Prem Avnish |
| **Co-Lead** | Nirbhay Kumar |
| **Tech Lead** | Priyanshu Yadav |
| **Research & Advisory** | Nishu Singh, Jayram Kumar |

---

## 📚 Full Documentation

- **[Navigation Guide](NAVIGATION_GUIDE.md)** — How to use the map & alerts
- **[Admin Guide](ADMIN_SETUP_GUIDE.md)** — Admin dashboard setup
- **[Implementation Details](IMPLEMENTATION_DETAILS.md)** — Technical deep dive

---

## 🔗 Links & Resources

- 📹 **[Live Demo Video](https://drive.google.com/file/d/1psvhooxza9FjLu7IN84f61SU7YM2nhWp/view)**
- 🧠 **[YOLO Documentation](https://docs.ultralytics.com)**
- 📱 **[Next.js Docs](https://nextjs.org/docs)**
- 🗺️ **[Leaflet Maps](https://leafletjs.com)**
- 🛣️ **[OpenRouteService](https://openrouteservice.org)**

---

## 📞 Support & Issues

Found a bug? Have a suggestion? 

📧 **Email**: team@smartroad.ai  
🐙 **GitHub**: [Nirbhayjr/smart-road](https://github.com/Nirbhayjr/smart-road)  
💬 **Contact**: Open an issue on GitHub

---

## 📄 License

This project is open source and made for educational purposes during Enyugma 2026 Hackathon.

---

## 🙏 Acknowledgments

- **IIIT Bhagalpur** — Host institution
- **Enyugma 2026** — Hackathon platform
- **YOLOv8** — AI detection model
- **Next.js & React** — Frontend framework
- **Flask** — Backend framework
- **OpenStreetMap** — Map data

---

<div align="center">

**Made with ❤️ by Prem Avnish & Team**

*Building safer roads, one pothole at a time.*

</div>
