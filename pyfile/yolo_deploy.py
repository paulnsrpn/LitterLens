import argparse
import os
import sys
import cv2
import numpy as np
from ultralytics import YOLO

def parse_args():
    parser = argparse.ArgumentParser(description="YOLOv8 Image Prediction (Unique Colors with Count Display)")
    parser.add_argument('--model', required=True, help='Path to YOLOv8 model (e.g., best.pt)')
    parser.add_argument('--source', required=True, help='Path to image file or folder of images')
    parser.add_argument('--thresh', type=float, default=0.05, help='Confidence threshold')
    return parser.parse_args()

def load_images(source):
    if os.path.isdir(source):
        images = [os.path.join(source, f) for f in os.listdir(source)
                  if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
        return images
    elif os.path.isfile(source):
        ext = os.path.splitext(source)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png', '.bmp']:
            return [source]
    print(f"[ERROR] Invalid source: {source}")
    sys.exit(1)

# Generate distinct colors for class IDs
def generate_colors(num_classes):
    np.random.seed(42)  # fixed seed for consistent colors
    colors = np.random.randint(0, 255, size=(num_classes, 3), dtype='uint8')
    return colors

def main():
    args = parse_args()

    if not os.path.exists(args.model):
        print("[ERROR] Model file not found.")
        sys.exit(1)

    model = YOLO(args.model)
    images = load_images(args.source)

    # Generate color map
    num_classes = len(model.names)
    colors = generate_colors(num_classes)

    for image_path in images:
        object_summary = {}
        results = model(image_path, conf=args.thresh)[0]
        frame = cv2.imread(image_path)

        for det in results.boxes:
            cls_id = int(det.cls.item())
            label = model.names[cls_id]
            xyxy = det.xyxy.cpu().numpy().astype(int)[0]
            conf = det.conf.item()
            color = tuple(int(c) for c in colors[cls_id])  # unique color for class

            cv2.rectangle(frame, (xyxy[0], xyxy[1]), (xyxy[2], xyxy[3]), color, 2)
            cv2.putText(frame, f"{label} {conf:.2f}", (xyxy[0], xyxy[1]-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            object_summary[label] = object_summary.get(label, 0) + 1

        # Display the total count inside the image window
        y_offset = 30
        for obj, count in object_summary.items():
            text = f"{obj}: {count}"
            cv2.putText(frame, text, (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            y_offset += 30

        cv2.imshow("YOLOv8 Detection", frame)
        key = cv2.waitKey(0)
        if key == ord('q'):
            break

    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()















# import argparse
# import os
# import sys
# import cv2
# import numpy as np
# from ultralytics import YOLO

# def parse_args():
#     parser = argparse.ArgumentParser(description="YOLOv8 Image Prediction (Realtime Threshold with +/- keys)")
#     parser.add_argument('--model', required=True, help='Path to YOLOv8 model (e.g., best.pt)')
#     parser.add_argument('--source', required=True, help='Path to image file or folder of images')
#     parser.add_argument('--thresh', type=float, default=0.01, help='Initial confidence threshold')
#     return parser.parse_args()

# def load_images(source):
#     if os.path.isdir(source):
#         images = [os.path.join(source, f) for f in os.listdir(source)
#                   if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
#         return images
#     elif os.path.isfile(source):
#         ext = os.path.splitext(source)[1].lower()
#         if ext in ['.jpg', '.jpeg', '.png', '.bmp']:
#             return [source]
#     print(f"[ERROR] Invalid source: {source}")
#     sys.exit(1)

# def generate_colors(num_classes):
#     np.random.seed(42)
#     colors = np.random.randint(0, 255, size=(num_classes, 3), dtype='uint8')
#     return colors

# def main():
#     args = parse_args()

#     if not os.path.exists(args.model):
#         print("[ERROR] Model file not found.")
#         sys.exit(1)

#     model = YOLO(args.model)
#     images = load_images(args.source)
#     num_classes = len(model.names)
#     colors = generate_colors(num_classes)

#     cv2.namedWindow("YOLOv8 Detection")

#     for image_path in images:
#         frame_orig = cv2.imread(image_path)
#         results = model(image_path)[0]
#         threshold_value = args.thresh
#         step_size = 0.01  # <-- Now set step to 0.1

#         while True:
#             frame = frame_orig.copy()
#             object_summary = {}

#             for det in results.boxes:
#                 conf = det.conf.item()
#                 if conf < threshold_value:
#                     continue

#                 cls_id = int(det.cls.item())
#                 label = model.names[cls_id]
#                 xyxy = det.xyxy.cpu().numpy().astype(int)[0]
#                 color = tuple(int(c) for c in colors[cls_id])

#                 cv2.rectangle(frame, (xyxy[0], xyxy[1]), (xyxy[2], xyxy[3]), color, 2)
#                 cv2.putText(frame, f"{label} {conf:.2f}", (xyxy[0], xyxy[1]-10),
#                             cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
#                 object_summary[label] = object_summary.get(label, 0) + 1

#             y_offset = 30
#             for obj, count in object_summary.items():
#                 text = f"{obj}: {count}"
#                 cv2.putText(frame, text, (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
#                 y_offset += 30

#             cv2.putText(frame, f"Threshold: {threshold_value:.2f}", (10, y_offset+10), 
#                         cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

#             cv2.imshow("YOLOv8 Detection", frame)
#             key = cv2.waitKey(100)

#             # ✅ Added safe exit if window closed:
#             if cv2.getWindowProperty("YOLOv8 Detection", cv2.WND_PROP_VISIBLE) < 1:
#                 sys.exit(0)

#             if key == ord('+') or key == ord('='):
#                 threshold_value = round(min(1.0, threshold_value + step_size), 2)
#             elif key == ord('-') or key == ord('_'):
#                 threshold_value = round(max(0.01, threshold_value - step_size), 2)
#             elif key == ord('n'):
#                 break
#             elif key == ord('q'):
#                 cv2.destroyAllWindows()
#                 sys.exit(0)

#     cv2.destroyAllWindows()

# if __name__ == "__main__":
#     main()
