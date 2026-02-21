# Testing Volunteer → Admin Panel Integration

## Prerequisites
1. Backend server running on http://localhost:5000
2. Frontend running on http://localhost:3000

## Test Steps

### 1. Start Backend Server
```bash
cd backend
.venv\Scripts\activate  # Activate virtual environment
python server.py
```
Expected: `Running on http://localhost:5000`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Expected: `Ready on http://localhost:3000`

### 3. Test Volunteer Upload
1. Navigate to: http://localhost:3000/volunteer
2. Click "Choose File" and select an image with potholes
3. Click "Get Location" to capture GPS coordinates
4. (Optional) Add description
5. Click "Upload & Detect"
6. Wait for detection results

Expected Results:
- ✅ "Pothole detected — report saved" message
- ✅ Detection count displayed
- ✅ Wallet coins awarded (+10 SmartCoins)

### 4. Verify Admin Panel Updates
1. Open new tab: http://localhost:3000/admin
2. Log in (if required)
3. Check **Dashboard page**:
   - Total uploads count increases
   - Total detections count updates
   - Severity breakdown updates (Minor/Moderate/Major)

4. Go to **Reports page**:
   - New report appears in the table
   - Click "View" to see details
   - Image preview loads correctly
   - Location coordinates displayed

5. Go to **Map page**:
   - New marker appears at upload location
   - Marker color matches severity:
     - 🟢 Green = Minor
     - 🟡 Yellow = Moderate  
     - 🔴 Red = Major
   - Click marker to see popup with details
   - Active pins list shows new report

### 5. Real-Time Update Test
1. Keep admin panel open (Dashboard or Map page)
2. In volunteer page, upload another image
3. Within 3 seconds, admin panel should automatically update
4. No page refresh needed!

## Expected Data Flow

```
┌─────────────┐
│  Volunteer  │ Upload image + location
│    Page     │──────────────────────┐
└─────────────┘                      │
                                     ▼
                              ┌──────────────┐
                              │   Backend    │
                              │  /upload     │
                              └──────┬───────┘
                                     │ Save
                                     ▼
                              ┌──────────────┐
                              │ reports.json │
                              └──────┬───────┘
                                     │ Poll every 3s
                                     ▼
┌─────────────┐            ┌──────────────┐
│    Admin    │◄───────────│   Backend    │
│    Panel    │  /admin/   │ /admin/stats │
└─────────────┘   stats    └──────────────┘
      │
      ├─► Dashboard (stats)
      ├─► Reports (list + images)
      └─► Map (markers)
```

## Troubleshooting

### Images Not Loading?
- Check browser console for 404 errors
- Verify backend is serving files from `/reports/<filename>`
- Ensure paths use forward slashes (not backslashes)

### Map Markers Not Showing?
- Check if upload included GPS coordinates
- Verify `severity_breakdown` exists in report data
- Open browser dev tools → Network → Check `/admin/stats` response

### Backend Not Connecting?
- Ensure Flask server is running on port 5000
- Check CORS is enabled
- Verify `reports.json` exists in backend folder

### No Real-Time Updates?
- Admin panel polls every 3 seconds automatically
- Check browser console for fetch errors
- Ensure backend `/admin/stats` endpoint is responding

## Data Structure

### Volunteer Upload Payload
```javascript
FormData {
  file: <File>,
  description: "Pothole on Main Street",
  lat: 28.6139,
  lon: 77.2090
}
```

### Backend Response (reports.json)
```json
{
  "id": "1708560000000_a1b2c3d4",
  "timestamp": 1708560000,
  "original_file": "reports/1708560000000_a1b2c3d4_orig_image.jpg",
  "annotated_file": "reports/1708560000000_a1b2c3d4_annot.png",
  "lat": 28.6139,
  "lon": 77.2090,
  "description": "Pothole on Main Street",
  "total_detections": 3,
  "severity_breakdown": {
    "Minor": 1,
    "Moderate": 1,
    "Major": 1
  },
  "detections": [...]
}
```

### Admin Panel Display Format
```json
{
  "id": "RPT-0001",
  "type": "Image",
  "source": "User",
  "lat": 28.6139,
  "lng": 77.2090,
  "location": "Pothole on Main Street",
  "description": "Pothole on Main Street",
  "detections": 3,
  "severity_breakdown": { "Minor": 1, "Moderate": 1, "Major": 1 },
  "status": "In Progress",
  "progress": 25,
  "timestamp": 1708560000,
  "image_path": "/reports/1708560000000_a1b2c3d4_orig_image.jpg",
  "image_with_detections": "/reports/1708560000000_a1b2c3d4_annot.png"
}
```

## Success Criteria
✅ Volunteer can upload images with location
✅ Backend saves data to reports.json
✅ Admin dashboard shows updated statistics
✅ Reports list displays new entries
✅ Image previews load correctly
✅ Map shows markers at upload locations
✅ Marker colors match severity levels
✅ Updates appear within 3 seconds (no refresh)
