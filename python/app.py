from flask import Flask, request, jsonify, send_from_directory
from ultralytics import YOLO
import os
import cv2
import numpy as np
from datetime import datetime
from werkzeug.utils import secure_filename
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# === Configuration ===
UPLOAD_FOLDER = 'uploads'
MODEL_PATH = 'my_model.pt'       #model of the system
CONF_THRESHOLD = 0.25            # Minimum confidence threshold for detections

# Ensure the upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load the YOLO model
model = YOLO(MODEL_PATH)

# === Utility Function: Generate Random Colors for Class Labels ===
def generate_colors(num_classes):
    np.random.seed(42)  # For consistent color assignment
    return np.random.randint(0, 255, size=(num_classes, 3), dtype='uint8')

# === Serve Uploaded Files ===
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# === Main Detection Endpoint ===
@app.route('/analyze', methods=['POST'])
def analyze_image():
    # Validate uploaded file
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Secure filename and prepare folder structure
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    image_id = f"image_{timestamp}"
    image_folder = os.path.join(UPLOAD_FOLDER, image_id)
    os.makedirs(image_folder, exist_ok=True)

    image_path = os.path.join(image_folder, filename)
    file.save(image_path)

    # Read image and perform detection
    frame = cv2.imread(image_path)
    results = model(image_path, conf=CONF_THRESHOLD)[0]

    num_classes = len(model.names)
    colors = generate_colors(num_classes)

    object_summary = {}
    conf_scores = []     # confidence scores for calculating "accuracy"

    for det in results.boxes:
        cls_id = int(det.cls.item())
        label = model.names[cls_id]
        conf = det.conf.item()
        xyxy = det.xyxy.cpu().numpy().astype(int)[0]
        color = tuple(int(c) for c in colors[cls_id])

        # Draw bounding box and label (no count summary on image)
        cv2.rectangle(frame, (xyxy[0], xyxy[1]), (xyxy[2], xyxy[3]), color, 2)
        cv2.putText(frame, f"{label} {conf:.2f}", (xyxy[0], xyxy[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        # Update count and confidence
        object_summary[label] = object_summary.get(label, 0) + 1
        conf_scores.append(conf)

    # Calculate mock "accuracy" as mean confidence
    accuracy = round(np.mean(conf_scores) * 100, 2) if conf_scores else 0.0

    # Save annotated result image
    output_img_path = os.path.join(image_folder, "result.jpg")
    cv2.imwrite(output_img_path, frame)

    # Save plain text summary
    output_txt_path = os.path.join(image_folder, "summary.txt")
    with open(output_txt_path, 'w') as f:
        for obj, count in object_summary.items():
            f.write(f"{obj}: {count}\n")

    # Return JSON response
    return jsonify({
        'message': 'Image analyzed',
        'folder': image_id,
        'result_image': f"{image_id}/result.jpg",
        'summary': object_summary,
        'accuracy': accuracy
    })

# === Run the App ===
if __name__ == '__main__':
    app.run(debug=True)
