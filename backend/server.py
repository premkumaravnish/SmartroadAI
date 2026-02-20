from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import tempfile
import cv2
import base64
import numpy as np
from ultralytics import YOLO
import json
import shutil
import time
import uuid
from detect_pothole import detect_pothole

app = Flask(__name__)
# allow cross-origin requests (development)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Path to model in repo
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'pothole.pt')

# Load model once
model = None
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print('Failed to load model:', e)


@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    f = request.files['file']
    if f.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    filename = secure_filename(f.filename)
    tmpdir = tempfile.mkdtemp(prefix='smartroad_')
    path = os.path.join(tmpdir, filename)
    f.save(path)

    # read optional metadata from form
    lat = request.form.get('lat')
    lon = request.form.get('lon')
    description = request.form.get('description', '')

    # Run detection using unified detector (auto-detects image/video)
    if model is None:
        return jsonify({'error': 'Model not loaded on server'}), 500

    try:
        img, detections, total, severity_breakdown, _ = detect_pothole(path, model)
    except Exception as e:
        print(f'Detection error: {e}')
        return jsonify({'error': f'Detection error: {e}'}), 500

    response = {
        'total_detections': total,
        'severity_breakdown': severity_breakdown,
        'detections': detections,
    }

    # Award coins server-side when at least one detection found
    try:
        wallets_path = os.path.join(os.path.dirname(__file__), 'wallets.json')
        # load existing or initialize
        if os.path.exists(wallets_path):
            with open(wallets_path, 'r', encoding='utf-8') as wf:
                wallets = json.load(wf)
        else:
            wallets = {}

        # use a simple global counter key for now
        if total > 0:
            wallets['global_wallet'] = wallets.get('global_wallet', 0) + 10
        # save back
        with open(wallets_path, 'w', encoding='utf-8') as wf:
            json.dump(wallets, wf)

        # include wallet value in response for clients to sync
        response['wallet'] = wallets.get('global_wallet', 0)
    except Exception as e:
        # don't fail detection on wallet persistence issues
        print('Wallet persistence error:', e)

    # Encode annotated image as PNG base64
    buf = None
    try:
        if img is not None:
            _, buf = cv2.imencode('.png', img)
            b64 = base64.b64encode(buf).decode('utf-8')
            annotated_data = f"data:image/png;base64,{b64}"
            response['annotated'] = annotated_data
        else:
            response['annotated'] = None
    except Exception as e:
        print(f'Annotation encoding error: {e}')
        response['annotated'] = None

    # Persist report when detections found
    try:
        reports_dir = os.path.join(os.path.dirname(__file__), 'reports')
        os.makedirs(reports_dir, exist_ok=True)

        reports_path = os.path.join(os.path.dirname(__file__), 'reports.json')

        if total > 0:
            # unique filename
            uid = str(int(time.time() * 1000)) + '_' + uuid.uuid4().hex[:8]
            saved_original = os.path.join(reports_dir, f"{uid}_orig_{filename}")
            saved_annot = os.path.join(reports_dir, f"{uid}_annot.png")

            # move or copy original uploaded file
            try:
                shutil.move(path, saved_original)
            except Exception:
                try:
                    shutil.copy(path, saved_original)
                except Exception:
                    saved_original = path

            # save annotated image bytes
            try:
                if buf is not None:
                    with open(saved_annot, 'wb') as af:
                        af.write(buf.tobytes())
            except Exception:
                saved_annot = None

            # build report entry
            entry = {
                'id': uid,
                'timestamp': int(time.time()),
                'original_file': os.path.relpath(saved_original, os.path.dirname(__file__)),
                'annotated_file': os.path.relpath(saved_annot, os.path.dirname(__file__)) if saved_annot else None,
                'lat': float(lat) if lat else None,
                'lon': float(lon) if lon else None,
                'description': description,
                'total_detections': total,
                'severity_breakdown': severity_breakdown,
                'detections': detections,
            }

            # append to reports.json
            if os.path.exists(reports_path):
                try:
                    with open(reports_path, 'r', encoding='utf-8') as rf:
                        reports = json.load(rf)
                except Exception:
                    reports = []
            else:
                reports = []

            reports.append(entry)
            with open(reports_path, 'w', encoding='utf-8') as rf:
                json.dump(reports, rf, indent=2)

            response['message'] = 'Pothole detected and report saved'
        else:
            response['message'] = 'No pothole detected'
    except Exception as e:
        print('Report persistence error:', e)
        response['message'] = response.get('message', '') or 'Processed, but failed to save report'

    return jsonify(response)


@app.route('/admin/stats', methods=['GET'])
def admin_stats():
    """Get dashboard statistics from reports.json"""
    try:
        reports_path = os.path.join(os.path.dirname(__file__), 'reports.json')
        if not os.path.exists(reports_path):
            return jsonify({
                'total_detections': 0,
                'critical_issues': 0,
                'moderate_issues': 0,
                'minor_issues': 0,
                'pending_repairs': 0,
                'resolved_cases': 0,
                'avg_repair_time': '0h',
                'monthly_budget': '₹0L'
            })
        
        with open(reports_path, 'r', encoding='utf-8') as rf:
            reports = json.load(rf)
        
        # Calculate statistics
        total_detections = len(reports)
        critical = sum(1 for r in reports if r.get('severity_breakdown', {}).get('Major', 0) > 0)
        moderate = sum(1 for r in reports if r.get('severity_breakdown', {}).get('Moderate', 0) > 0)
        minor = sum(1 for r in reports if r.get('severity_breakdown', {}).get('Minor', 0) > 0)
        
        # Mock data for demo
        pending_repairs = int(total_detections * 0.25)  # 25% pending
        resolved_cases = int(total_detections * 0.60)  # 60% resolved
        
        return jsonify({
            'total_detections': total_detections,
            'critical_issues': critical,
            'moderate_issues': moderate,
            'minor_issues': minor,
            'pending_repairs': pending_repairs,
            'resolved_cases': resolved_cases,
            'avg_repair_time': '38h',
            'monthly_budget': '₹48.2L'
        })
    except Exception as e:
        print(f'Stats error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/admin/reports', methods=['GET'])
def admin_reports():
    """Get all reports/pothole data"""
    try:
        reports_path = os.path.join(os.path.dirname(__file__), 'reports.json')
        if not os.path.exists(reports_path):
            return jsonify([])
        
        with open(reports_path, 'r', encoding='utf-8') as rf:
            reports = json.load(rf)
        
        # Format reports for frontend
        formatted_reports = []
        for idx, report in enumerate(reports[:20]):  # Return latest 20
            severity = 'Critical' if report.get('severity_breakdown', {}).get('Major', 0) > 0 else \
                       'Moderate' if report.get('severity_breakdown', {}).get('Moderate', 0) > 0 else 'Minor'
            
            formatted_reports.append({
                'id': f"PH-{4400 + idx}",
                'location': f"Location {idx + 1}",
                'latitude': report.get('lat', 0),
                'longitude': report.get('lon', 0),
                'severity': severity,
                'status': ['Pending', 'Assigned', 'Completed'][idx % 3],
                'contractor': ['Unassigned', 'RK Infra Pvt Ltd', 'City Roads Corp'][idx % 3],
                'date': report.get('timestamp', ''),
                'detections': report.get('total_detections', 0),
                'description': report.get('description', '')
            })
        
        return jsonify(formatted_reports)
    except Exception as e:
        print(f'Reports error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/admin/auth', methods=['POST'])
def admin_auth():
    """Simple admin authentication"""
    try:
        data = request.get_json()
        email = data.get('email', '')
        password = data.get('password', '')
        
        # Simple hardcoded credentials for demo (change in production)
        if email == 'admin@smartroad.ai' and password == 'admin123':
            return jsonify({
                'success': True,
                'token': f'admin_token_{int(time.time())}',
                'email': email
            })
        
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    except Exception as e:
        print(f'Auth error: {e}')
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
