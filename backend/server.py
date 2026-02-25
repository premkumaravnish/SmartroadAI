from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import tempfile
import cv2
import base64
import numpy as np
import gc
from ultralytics import YOLO
import json
import shutil
import time
import uuid
from detect_pothole import detect_pothole

# Memory optimization: limit threads
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['MKL_NUM_THREADS'] = '1'
os.environ['OPENBLAS_NUM_THREADS'] = '1'

app = Flask(__name__)
# allow cross-origin requests (development)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Path to model in repo
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'pothole.pt')

# Inference image size (smaller = less RAM)
INFER_SIZE = 416

# Load model once with memory-efficient settings
model = None
try:
    model = YOLO(MODEL_PATH)
    # Warm up with a tiny image to avoid first-request spike
    import numpy as _np
    _dummy = _np.zeros((INFER_SIZE, INFER_SIZE, 3), dtype=_np.uint8)
    model.predict(_dummy, imgsz=INFER_SIZE, verbose=False)
    del _dummy, _np
    gc.collect()
    print(f'Model loaded and warmed up (imgsz={INFER_SIZE})')
except Exception as e:
    print('Failed to load model:', e)


@app.route('/', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'service': 'SmartRoad AI Backend',
        'endpoints': ['/upload', '/reports', '/admin/stats', '/admin/auth', '/admin/reports']
    })


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
        img, detections, total, severity_breakdown, _ = detect_pothole(path, model, imgsz=INFER_SIZE)
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
                'original_file': os.path.relpath(saved_original, os.path.dirname(__file__)).replace('\\', '/'),
                'annotated_file': os.path.relpath(saved_annot, os.path.dirname(__file__)).replace('\\', '/') if saved_annot else None,
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

    # Free memory after each upload
    gc.collect()

    return jsonify(response)


@app.route('/admin/stats', methods=['GET'])
def admin_stats():
    """Get dashboard statistics from reports.json"""
    try:
        reports_path = os.path.join(os.path.dirname(__file__), 'reports.json')
        if not os.path.exists(reports_path):
            return jsonify({
                'success': True,
                'data': {
                    'total_uploads': 0,
                    'total_detections': 0,
                    'minor': 0,
                    'moderate': 0,
                    'major': 0,
                    'active_reports': 0,
                    'reports': []
                }
            })
        
        with open(reports_path, 'r', encoding='utf-8') as rf:
            reports = json.load(rf)
        
        # Calculate statistics from severity_breakdown
        total_uploads = len(reports)
        total_detections = sum(r.get('total_detections', 0) for r in reports)
        minor = sum(r.get('severity_breakdown', {}).get('Minor', 0) for r in reports)
        moderate = sum(r.get('severity_breakdown', {}).get('Moderate', 0) for r in reports)
        major = sum(r.get('severity_breakdown', {}).get('Major', 0) for r in reports)
        
        # Format reports for admin dashboard
        formatted_reports = []
        for idx, report in enumerate(reports[-50:]):  # Latest 50 reports
            # Determine dominant severity
            sev = report.get('severity_breakdown', {})
            if sev.get('Major', 0) > sev.get('Moderate', 0) and sev.get('Major', 0) > sev.get('Minor', 0):
                severity_label = 'Major'
            elif sev.get('Moderate', 0) > sev.get('Minor', 0):
                severity_label = 'Moderate'
            else:
                severity_label = 'Minor'
            
            # Determine file type
            orig_file = report.get('original_file', '')
            is_video = orig_file.lower().endswith(('.mp4', '.avi', '.mov', '.mkv'))
            
            formatted_reports.append({
                'id': f"RPT-{str(report.get('id', idx)).zfill(4)}",
                'type': 'Video' if is_video else 'Image',
                'source': 'User',
                'lat': report.get('lat'),
                'lon': report.get('lon'),
                'location': report.get('description', '') or f"Upload {idx + 1}",
                'description': report.get('description', ''),
                'detections': report.get('total_detections', 0),
                'severity': sev,
                'severity_breakdown': sev,  # Also include for map compatibility
                'status': ['In Progress', 'Under Review', 'Site Verification', 'Completed'][idx % 4],
                'progress': [25, 60, 85, 100][idx % 4],
                'timestamp': report.get('timestamp', int(time.time())),
                'image_path': f"/{report.get('original_file', '').replace('\\', '/')}" if report.get('original_file') else None,
                'image_with_detections': f"/{report.get('annotated_file', '').replace('\\', '/')}" if report.get('annotated_file') else None
            })
        
        return jsonify({
            'success': True,
            'data': {
                'total_uploads': total_uploads,
                'total_detections': total_detections,
                'minor': minor,
                'moderate': moderate,
                'major': major,
                'active_reports': len([r for r in formatted_reports if r['status'] != 'Completed']),
                'reports': formatted_reports
            }
        })
    except Exception as e:
        print(f'Stats error: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/reports', methods=['GET'])
def get_reports():
    """Get all pothole reports with location data for public map view"""
    try:
        reports_path = os.path.join(os.path.dirname(__file__), 'reports.json')
        if not os.path.exists(reports_path):
            return jsonify([])
        
        with open(reports_path, 'r', encoding='utf-8') as rf:
            reports = json.load(rf)
        
        # Format for public map view with severity info
        formatted_reports = []
        for r in reports:
            if r.get('lat') and r.get('lon'):
                sev = r.get('severity_breakdown', {})
                formatted_reports.append({
                    'id': r.get('id', ''),
                    'lat': r['lat'],
                    'lon': r['lon'],
                    'location': r.get('description', 'Pothole detected'),
                    'detections': r.get('total_detections', 0),
                    'severity_breakdown': {
                        'Minor': sev.get('Minor', 0),
                        'Moderate': sev.get('Moderate', 0),
                        'Major': sev.get('Major', 0)
                    },
                    'timestamp': r.get('timestamp', 0),
                    'annotated_file': r.get('annotated_file', '')
                })
        
        return jsonify(formatted_reports)
    except Exception as e:
        print(f'Reports error: {e}')
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


@app.route('/reports/<path:filepath>', methods=['GET'])
def serve_report_file(filepath):
    """Serve report files (images/videos)"""
    try:
        base_dir = os.path.dirname(__file__)
        return send_from_directory(base_dir, filepath)
    except Exception as e:
        print(f'File serve error: {e}')
        return jsonify({'error': 'File not found'}), 404


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
