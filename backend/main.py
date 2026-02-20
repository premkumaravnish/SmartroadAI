from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import os
from datetime import datetime
import base64
import tempfile

# Initialize the app
app = FastAPI(title="SmartRoad API", version="1.0.0")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
try:
    model = YOLO("pothole.pt")
except:
    print("Warning: pothole.pt not found, using default model")
    model = YOLO("yolov8n.pt")

# Helper function to classify severity based on area
def classify_severity(area):
    if area < 5000:
        return "Minor"
    elif area < 20000:
        return "Moderate"
    else:
        return "Major"

# Helper function to get color based on severity
def get_severity_color(severity):
    colors = {
        "Minor": (0, 255, 0),      # Green
        "Moderate": (0, 255, 255),  # Yellow
        "Major": (0, 0, 255)        # Red
    }
    return colors.get(severity, (0, 255, 0))

# Helper function to detect potholes in frame/image
def detect_potholes(image_array):
    """Run YOLO detection on image and return results"""
    results = model(image_array)
    detections = []
    
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0]
            conf = float(box.conf[0])
            
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            
            # Calculate area
            width = x2 - x1
            height = y2 - y1
            area = width * height
            
            severity = classify_severity(area)
            
            detections.append({
                "bbox": [x1, y1, x2, y2],
                "confidence": round(conf, 2),
                "area": area,
                "severity": severity,
                "width": width,
                "height": height
            })
    
    return detections

# Helper function to draw detections on image
def draw_detections(image, detections):
    """Draw bounding boxes and labels on image"""
    for detection in detections:
        x1, y1, x2, y2 = detection["bbox"]
        severity = detection["severity"]
        conf = detection["confidence"]
        
        color = get_severity_color(severity)
        
        # Draw bounding box
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
        
        # Put label
        label = f"{severity} ({conf:.2f})"
        cv2.putText(image, label, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    
    return image

# Helper function to convert image to base64
def image_to_base64(image_array):
    """Convert numpy array to base64 string"""
    _, buffer = cv2.imencode('.jpg', image_array)
    return base64.b64encode(buffer).decode('utf-8')

# ============== ROOT ENDPOINTS ==============

@app.get("/")
def read_root():
    return {
        "message": "SmartRoad Backend API",
        "version": "1.0.0",
        "endpoints": {
            "demo": "/demo",
            "detect_image": "/detect/image",
            "detect_video": "/detect/video",
            "health": "/health"
        }
    }

@app.get("/demo")
def read_demo():
    """Demo endpoint"""
    return {
        "success": True,
        "message": "SmartRoad Backend is working!",
        "data": {
            "timestamp": datetime.now().isoformat(),
            "status": "Backend API is connected",
            "serverInfo": {
                "name": "SmartRoad Backend",
                "version": "1.0.0",
                "type": "FastAPI"
            }
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }

# ============== IMAGE DETECTION ENDPOINTS ==============

@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    """
    Detect potholes in uploaded image
    
    Returns:
    - detections: List of detected potholes with coordinates and severity
    - image_with_detections: Base64 encoded image with drawn detections
    - statistics: Summary of detections
    """
    
    try:
        # Read uploaded file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Detect potholes
        detections = detect_potholes(image)
        
        # Draw detections on image
        image_with_detections = draw_detections(image.copy(), detections)
        
        # Convert to base64
        image_base64 = image_to_base64(image_with_detections)
        
        # Calculate statistics
        severity_count = {
            "Minor": len([d for d in detections if d["severity"] == "Minor"]),
            "Moderate": len([d for d in detections if d["severity"] == "Moderate"]),
            "Major": len([d for d in detections if d["severity"] == "Major"])
        }
        
        return {
            "success": True,
            "message": "Image detection completed",
            "detections": detections,
            "image_with_detections": image_base64,
            "statistics": {
                "total_detections": len(detections),
                "severity_breakdown": severity_count,
                "image_height": image.shape[0],
                "image_width": image.shape[1]
            },
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

# ============== VIDEO DETECTION ENDPOINTS ==============

@app.post("/detect/video")
async def detect_video(file: UploadFile = File(...)):
    """
    Detect potholes in uploaded video
    Processes every 2nd frame for performance optimization
    
    Returns:
    - frame_detections: Detections for each processed frame
    - summary: Overall statistics
    """
    
    try:
        # Save uploaded video to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            contents = await file.read()
            tmp_file.write(contents)
            tmp_path = tmp_file.name
        
        # Open video
        cap = cv2.VideoCapture(tmp_path)
        
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Invalid video file")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        frame_count = 0
        processed_frames = 0
        all_detections = []
        frame_results = []
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Process every 2nd frame for performance
            if frame_count % 2 != 0:
                continue
            
            processed_frames += 1
            
            # Resize frame for faster processing
            frame = cv2.resize(frame, (640, 480))
            
            # Detect potholes
            detections = detect_potholes(frame)
            
            if detections:
                all_detections.extend(detections)
                frame_results.append({
                    "frame_number": frame_count,
                    "detections": detections,
                    "detection_count": len(detections)
                })
        
        cap.release()
        
        # Clean up temporary file
        os.unlink(tmp_path)
        
        # Calculate statistics
        severity_count = {
            "Minor": len([d for d in all_detections if d["severity"] == "Minor"]),
            "Moderate": len([d for d in all_detections if d["severity"] == "Moderate"]),
            "Major": len([d for d in all_detections if d["severity"] == "Major"])
        }
        
        return {
            "success": True,
            "message": "Video detection completed",
            "video_info": {
                "total_frames": total_frames,
                "processed_frames": processed_frames,
                "fps": fps
            },
            "frame_detections": frame_results,
            "statistics": {
                "total_detections": len(all_detections),
                "severity_breakdown": severity_count,
                "frames_with_detections": len(frame_results)
            },
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

# ============== ITEMS ENDPOINT ==============

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "query": q}