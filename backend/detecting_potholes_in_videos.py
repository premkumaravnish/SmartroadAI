from ultralytics import YOLO
import cv2

# Load pothole-trained model
model = YOLO(r"D:\smartroad\backend\pothole.pt")

# Open video file
cap = cv2.VideoCapture(r"D:\smartroad\backend\assests\vid2.mp4")

# Get original FPS of video
fps = cap.get(cv2.CAP_PROP_FPS)
delay = int(1000 / fps)  # Maintain original speed

frame_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1

    # 🔥 Skip frames for speed (change 2 to 3 or 4 if needed)
    if frame_count % 2 != 0:
        continue

    # 🔥 Resize frame to speed up detection
    frame = cv2.resize(frame, (640, 480))

    # Run YOLO detection
    results = model(frame)

    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0]
            conf = float(box.conf[0])

            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

            # Calculate area
            width = x2 - x1
            height = y2 - y1
            area = width * height

            # Severity classification
            if area < 5000:
                severity = "Minor"
                color = (0, 255, 0)
            elif area < 20000:
                severity = "Moderate"
                color = (0, 255, 255)
            else:
                severity = "Major"
                color = (0, 0, 255)

            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

            label = f"{severity} ({conf:.2f})"
            cv2.putText(frame, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6, color, 2)

    cv2.imshow("Pothole Detection", frame)

    # Maintain original video speed
    if cv2.waitKey(delay) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
