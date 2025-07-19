# from flask import Flask, request, jsonify
# from ultralytics import YOLO
# import os
# import cv2
# import numpy as np
# from datetime import datetime
# from werkzeug.utils import secure_filename
# from flask_cors import CORS


# app = Flask(__name__)
# CORS(app)
# UPLOAD_FOLDER = 'uploads'
# MODEL_PATH = 'my_model.pt'  # Change to your model
# CONF_THRESHOLD = 0.05

# # Create upload folder if not exists
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# model = YOLO(MODEL_PATH)

# def generate_colors(num_classes):
#     np.random.seed(42)
#     return np.random.randint(0, 255, size=(num_classes, 3), dtype='uint8')

# @app.route('/analyze', methods=['POST'])
# def analyze_image():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No file part'}), 400

#     file = request.files['image']
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'}), 400

#     filename = secure_filename(file.filename)
#     timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
#     image_id = f"image_{timestamp}"
#     image_folder = os.path.join(UPLOAD_FOLDER, image_id)
#     os.makedirs(image_folder, exist_ok=True)

#     image_path = os.path.join(image_folder, filename)
#     file.save(image_path)

#     frame = cv2.imread(image_path)
#     results = model(image_path, conf=CONF_THRESHOLD)[0]

#     num_classes = len(model.names)
#     colors = generate_colors(num_classes)
#     object_summary = {}

#     for det in results.boxes:
#         cls_id = int(det.cls.item())
#         label = model.names[cls_id]
#         conf = det.conf.item()
#         xyxy = det.xyxy.cpu().numpy().astype(int)[0]
#         color = tuple(int(c) for c in colors[cls_id])

#         cv2.rectangle(frame, (xyxy[0], xyxy[1]), (xyxy[2], xyxy[3]), color, 2)
#         cv2.putText(frame, f"{label} {conf:.2f}", (xyxy[0], xyxy[1]-10),
#                     cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
#         object_summary[label] = object_summary.get(label, 0) + 1

#     y_offset = 30
#     for obj, count in object_summary.items():
#         cv2.putText(frame, f"{obj}: {count}", (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
#         y_offset += 30

#     output_img_path = os.path.join(image_folder, "result.jpg")
#     cv2.imwrite(output_img_path, frame)

#     output_txt_path = os.path.join(image_folder, "summary.txt")
#     with open(output_txt_path, 'w') as f:
#         for obj, count in object_summary.items():
#             f.write(f"{obj}: {count}\n")

#     return jsonify({
#         'message': 'Image analyzed',
#         'folder': image_id,
#         'result_image': f"{image_id}/result.jpg",
#         'summary': object_summary
#     })

# if __name__ == '__main__':
#     app.run(debug=True)
