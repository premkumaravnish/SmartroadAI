Pothole Detection System |
 Built by Achievers | Hackathon Project

An AI-powered Pothole Detection System developed for smart road monitoring and safer transportation. This project uses Deep Learning and Computer Vision to detect potholes in real-time from images and video streams.

👥 Team Achievers (Hackathon Monitoring Project)

This project is actively developed and monitored under our Hackathon team.

👑 Team Lead: Prem

🤝 Co-Lead: Nirbhay

💻 Technical Lead: Priyanshu

📊 Research & Advisory: Nishu, Jayram

🎯 Project Objective

Road potholes are a major cause of:

Road accidents

Vehicle damage

Traffic disruption

Our goal is to build an automated AI-based solution that:

Detects potholes in real-time

Works on CCTV / dashcam footage

Can be integrated with smart city systems

Helps authorities take faster action

🧠 Technologies Used

🐍 Python

🔥 PyTorch

🎯 YOLO (You Only Look Once)

📷 OpenCV (cv2)

📊 NumPy

📦 TorchVision

## ✨ Key Features

### 🤖 AI-Powered Detection
- Real-time pothole detection using YOLO
- Severity classification (Minor, Moderate, Major)
- Image and video analysis support
- High accuracy detection with confidence scores

### 🗺️ **NEW: Navigation & Traffic-Style Alerts**
- **Live GPS tracking** with real-time location updates
- **Traffic-style warnings**: "Pothole ahead - Drive carefully!"
- **Color-coded severity markers** on interactive maps
- **Proximity alerts** with customizable detection radius (100m - 2km)
- **Visual alert zones** showing danger areas
- **Audio alerts** with smart cooldown system
- **Speed and distance tracking** for better navigation
- Works just like Google Maps or Waze traffic alerts!

📖 [**View Complete Navigation Guide →**](NAVIGATION_GUIDE.md)

### 📱 Web Application
- Modern React/Next.js frontend
- Volunteer reporting system with GPS
- Admin dashboard for monitoring
- Real-time report submission
- Responsive mobile-friendly design

⚙️ How It Works

Collect and prepare pothole dataset

Train YOLO model on annotated images

Detect potholes in:

Images

Recorded videos

Live camera feed

Draw bounding boxes around detected potholes

Output detection confidence score

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access Features
- **Home**: http://localhost:3000
- **Navigation & Alerts**: http://localhost:3000/navigate  
- **Upload Reports**: http://localhost:3000/volunteer
- **Admin Dashboard**: http://localhost:3000/admin

Future Improvements

✅ ~~GPS tagging of potholes~~ **IMPLEMENTED**

✅ ~~Real-time alert system~~ **IMPLEMENTED**  

✅ ~~Interactive map visualization~~ **IMPLEMENTED**

📍 Route planning to avoid potholes

☁️ Cloud integration

📱 Native mobile app

🛰️ Smart city dashboard integration

🔊 Voice navigation alerts

🗺️ Turn-by-turn navigation

## 📋 Documentation

- [**Navigation & Alert System Guide**](NAVIGATION_GUIDE.md) - Complete guide for the new map feature
- [**Admin Setup Guide**](ADMIN_SETUP_GUIDE.md) - Admin panel configuration
- [**UI/UX Improvements**](UI_UX_IMPROVEMENTS.md) - Design documentation
