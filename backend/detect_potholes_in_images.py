from ultralytics import YOLO
import cv2

# Load your pothole-trained model
model = YOLO(r"D:\smartroad\backend\pothole.pt")

# Load image
image_path = r"D:\smartroad\backend\assests\ml.jpg"
image = cv2.imread(image_path)

# Run detection
results = model(image)

for r in results:
    boxes = r.boxes

    for box in boxes:
        # Get coordinates
        x1, y1, x2, y2 = box.xyxy[0]
        conf = float(box.conf[0])

        # Convert to int
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

        # Calculate area
        width = x2 - x1
        height = y2 - y1
        area = width * height

        # Severity classification
        if area < 5000:
            severity = "Minor"
        elif area < 20000:
            severity = "Moderate"
        else:
            severity = "Major"

        # Draw bounding box
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 0, 255), 2)

        # Put label
        label = f"{severity} ({conf:.2f})"
        cv2.putText(image, label, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                    (0, 255, 0), 2)

# Show result
cv2.imshow("Pothole Detection", image)
cv2.waitKey(0)
cv2.destroyAllWindows()
