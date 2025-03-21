# import requests
# import json
# import base64


# image_path = 'image6.jpg'

# with open (image_path, "rb") as image_file:
#     encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    

# url = 'http://localhost:11434/api/generate'
# payload = {
#     "model": "llava",
#     "prompt": "You are a strict fruits and vegetable quality inspector. Analyze the fruit/vegetable in the image and rate its freshness on a scale of 1 to 10, with 1 being the least fresh and 10 being the most fresh. Provide only the rating, no further explanation.",
#     "stream": False,
#     "images": [encoded_string]
# }

# response = requests.post(url, data=json.dumps(payload), headers={'Content-Type': 'application/json'})

# print(response.json().get("response"))

from ultralytics import YOLO
import cv2
import numpy as np
import os
import requests
import json
import base64

# ------------------- Configuration -------------------
YOLO_MODEL_PATH = "best.pt"
INPUT_IMAGE_PATH = "image7.jpg"
CROPPED_FOLDER = "cropped_images"
LLAVA_API_URL = 'http://localhost:11434/api/generate'
LLAVA_MODEL_NAME = 'llava'

FRESHNESS_PROMPT = (
    "You are a strict fruits and vegetable quality inspector. "
    "Analyze the fruit/vegetable in the image and rate its freshness "
    "on a scale of 1 to 10, with 1 being the least fresh and 10 being the most fresh. "
    "Provide only the rating, no further explanation."
)

# ------------------- YOLO Detection & Cropping -------------------

# Load YOLO model
model = YOLO(YOLO_MODEL_PATH)

image = cv2.imread(INPUT_IMAGE_PATH)

results = model(image)[0]

class_names = model.names

boxes = results.boxes.xyxy.cpu().numpy().astype(np.int32)
scores = results.boxes.conf.cpu().numpy()
class_ids = results.boxes.cls.cpu().numpy().astype(np.int32)

highest_accuracy_detections = {}
for box, score, cls_id in zip(boxes, scores, class_ids):
    if cls_id not in highest_accuracy_detections or score > highest_accuracy_detections[cls_id]['score']:
        highest_accuracy_detections[cls_id] = {'box': box, 'score': score}

# Create folder for cropped images
os.makedirs(CROPPED_FOLDER, exist_ok=True)


def get_freshness_rating(image_path):
    with open(image_path, "rb") as img_file:
        encoded_img = base64.b64encode(img_file.read()).decode('utf-8')

    payload = {
        "model": LLAVA_MODEL_NAME,
        "prompt": FRESHNESS_PROMPT,
        "stream": False,
        "images": [encoded_img]
    }

    response = requests.post(LLAVA_API_URL,
                             data=json.dumps(payload),
                             headers={'Content-Type': 'application/json'})

    if response.status_code == 200:
        rating_text = response.json().get("response").strip()
        return rating_text
    else:
        return "API Error"

# Process each detection: Crop & Check Freshness
for cls_id, detection in highest_accuracy_detections.items():
    class_name = class_names[cls_id]
    x1, y1, x2, y2 = detection['box']
    
    # Crop image
    cropped_img = image[y1:y2, x1:x2]
    
    # Save cropped image
    cropped_image_path = os.path.join(CROPPED_FOLDER, f"{class_name}_crop.jpg")
    cv2.imwrite(cropped_image_path, cropped_img)
    
    print(f"Cropped image saved: {cropped_image_path}")

    # Get freshness rating from LLaVA API
    freshness_rating = get_freshness_rating(cropped_image_path)
    
    print(f"✅ Freshness rating for '{class_name}': {freshness_rating}/10\n")
