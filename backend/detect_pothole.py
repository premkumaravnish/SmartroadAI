"""
Unified pothole detection for both images and videos.
Handles deduplication of detections across video frames using IoU overlap.
"""

import cv2
import os
from ultralytics import YOLO


def classify_severity(area):
    """Classify pothole severity based on bbox area."""
    if area < 5000:
        return 'Minor'
    elif area < 20000:
        return 'Moderate'
    else:
        return 'Major'


def calculate_iou(box1, box2):
    """
    Calculate Intersection over Union (IoU) between two bboxes.
    box1, box2: [x1, y1, x2, y2]
    """
    x1_min, y1_min, x1_max, y1_max = box1
    x2_min, y2_min, x2_max, y2_max = box2

    # Intersection area
    inter_xmin = max(x1_min, x2_min)
    inter_ymin = max(y1_min, y2_min)
    inter_xmax = min(x1_max, x2_max)
    inter_ymax = min(y1_max, y2_max)

    if inter_xmax < inter_xmin or inter_ymax < inter_ymin:
        return 0.0

    inter_area = (inter_xmax - inter_xmin) * (inter_ymax - inter_ymin)

    # Union area
    box1_area = (x1_max - x1_min) * (y1_max - y1_min)
    box2_area = (x2_max - x2_min) * (y2_max - y2_min)
    union_area = box1_area + box2_area - inter_area

    if union_area == 0:
        return 0.0

    return inter_area / union_area


def detect_image(image_path, model):
    """
    Detect potholes in a single image.
    Returns: (img_with_boxes, detections_list, total, severity_breakdown, annotated_base64)
    """
    img = cv2.imread(image_path)
    if img is None:
        return None, [], 0, {'Minor': 0, 'Moderate': 0, 'Major': 0}, None

    # Run detection
    results = model(img)

    detections = []
    total = 0
    severity_breakdown = {'Minor': 0, 'Moderate': 0, 'Major': 0}

    for r in results:
        boxes = getattr(r, 'boxes', [])
        for box in boxes:
            try:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
            except Exception:
                coords = box.xyxy[0]
                x1, y1, x2, y2 = int(coords[0]), int(coords[1]), int(coords[2]), int(coords[3])
                conf = float(box.conf[0]) if hasattr(box, 'conf') else 0.0

            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            width = x2 - x1
            height = y2 - y1
            area = width * height
            severity = classify_severity(area)

            detections.append({
                'bbox': [x1, y1, x2, y2],
                'confidence': round(conf, 3),
                'area': area,
                'severity': severity,
            })

            total += 1
            severity_breakdown[severity] = severity_breakdown.get(severity, 0) + 1

    # Draw bounding boxes
    for d in detections:
        x1, y1, x2, y2 = d['bbox']
        conf = d['confidence']
        sev = d['severity']
        color = (0, 255, 0) if sev == 'Minor' else (0, 200, 255) if sev == 'Moderate' else (0, 0, 255)
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
        label = f"{sev} ({conf:.2f})"
        cv2.putText(img, label, (x1, max(10, y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    return img, detections, total, severity_breakdown, None


def detect_video(video_path, model, iou_threshold=0.5, frame_skip=2):
    """
    Detect potholes in video, deduplicate across frames using IoU.
    
    Args:
        video_path: Path to video file
        model: YOLO model
        iou_threshold: IoU threshold for deduplication (default 0.5)
        frame_skip: Skip frames for speed (e.g., 2 = process every 2nd frame)
    
    Returns:
        (last_frame_with_boxes, unique_detections_list, unique_total, severity_breakdown, None)
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return None, [], 0, {'Minor': 0, 'Moderate': 0, 'Major': 0}, None

    unique_detections = []  # List of unique detections across all frames
    frame_count = 0
    processed_frame = None

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        # Skip frames for speed
        if frame_count % frame_skip != 0:
            continue

        # Resize frame to speed up detection
        frame_resized = cv2.resize(frame, (640, 480))

        # Run detection
        results = model(frame_resized)

        frame_detections = []
        for r in results:
            boxes = getattr(r, 'boxes', [])
            for box in boxes:
                try:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                except Exception:
                    coords = box.xyxy[0]
                    x1, y1, x2, y2 = int(coords[0]), int(coords[1]), int(coords[2]), int(coords[3])
                    conf = float(box.conf[0]) if hasattr(box, 'conf') else 0.0

                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                width = x2 - x1
                height = y2 - y1
                area = width * height
                severity = classify_severity(area)

                frame_detections.append({
                    'bbox': [x1, y1, x2, y2],
                    'confidence': round(conf, 3),
                    'area': area,
                    'severity': severity,
                })

        # Deduplicate: only add if IoU < threshold with existing detections
        for det in frame_detections:
            is_duplicate = False
            for existing in unique_detections:
                iou = calculate_iou(det['bbox'], existing['bbox'])
                if iou >= iou_threshold:
                    is_duplicate = True
                    # Update confidence if this detection is higher
                    if det['confidence'] > existing['confidence']:
                        existing['confidence'] = det['confidence']
                    break

            if not is_duplicate:
                unique_detections.append(det)

        processed_frame = frame_resized.copy()

    cap.release()

    # Calculate totals from unique detections
    total = len(unique_detections)
    severity_breakdown = {'Minor': 0, 'Moderate': 0, 'Major': 0}
    for d in unique_detections:
        severity_breakdown[d['severity']] += 1

    # Draw on last processed frame (or any frame for annotation)
    if processed_frame is not None:
        for d in unique_detections:
            x1, y1, x2, y2 = d['bbox']
            conf = d['confidence']
            sev = d['severity']
            color = (0, 255, 0) if sev == 'Minor' else (0, 200, 255) if sev == 'Moderate' else (0, 0, 255)
            cv2.rectangle(processed_frame, (x1, y1), (x2, y2), color, 2)
            label = f"{sev} ({conf:.2f})"
            cv2.putText(processed_frame, label, (x1, max(10, y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    return processed_frame, unique_detections, total, severity_breakdown, None


def detect_pothole(file_path, model, is_video=None):
    """
    Main entry point: detect potholes in image or video.
    
    Args:
        file_path: Path to image or video file
        model: Loaded YOLO model
        is_video: If None, auto-detect; if True/False, force type
    
    Returns:
        (annotated_image, detections, total, severity_breakdown)
    """
    if is_video is None:
        # Auto-detect based on file extension
        video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'}
        ext = os.path.splitext(file_path)[1].lower()
        is_video = ext in video_extensions

    if is_video:
        return detect_video(file_path, model)
    else:
        return detect_image(file_path, model)
