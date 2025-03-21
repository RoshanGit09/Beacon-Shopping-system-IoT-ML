# from ultralytics import YOLO
# import cv2

# # Load your trained YOLOv11 model
# model = YOLO("best.pt")

# # Specify the image or video source
# source = "image7.jpg"  # or .mp4 for video, or 0 for webcam

# # Run inference
# results = model(source)

# # Process results (assuming single image)
# for result in results:
#     boxes = result.boxes  
#     probs = result.probs  
    
#     # Display annotated image
#     annotated_image = result.plot()
#     cv2.imshow("YOLOv11 Predictions", annotated_image)
#     cv2.waitKey(0)  # Wait until a key is pressed

# cv2.destroyAllWindows()


from ultralytics import YOLO
import cv2
import numpy as np
import os


model = YOLO("best.pt")


image_path = "image2.jpg"
image = cv2.imread(image_path)


results = model(image)[0]


class_names = model.names  # Class names provided by the model itself


boxes = results.boxes.xyxy.cpu().numpy().astype(np.int32)
scores = results.boxes.conf.cpu().numpy()
class_ids = results.boxes.cls.cpu().numpy().astype(np.int32)


highest_accuracy_detections = {}


for box, score, cls_id in zip(boxes, scores, class_ids):
    if cls_id not in highest_accuracy_detections or score > highest_accuracy_detections[cls_id]['score']:
        highest_accuracy_detections[cls_id] = {
            'box': box,
            'score': score
        }


output_folder = "cropped_images"
os.makedirs(output_folder, exist_ok=True)


for cls_id, detection in highest_accuracy_detections.items():
    class_name = class_names[cls_id]
    x1, y1, x2, y2 = detection['box']
    cropped_img = image[y1:y2, x1:x2]
    
    output_path = os.path.join(output_folder, f"{class_names[cls_id]}_crop.jpg")
    cv2.imwrite(output_path, cropped_img)
    print(f"Cropped image saved: {output_path}")
 