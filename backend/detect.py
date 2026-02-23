from ultralytics import YOLO

model = YOLO("pothole.pt")
results = model(r"C:\python\yolo\photo.jpeg", show=True)