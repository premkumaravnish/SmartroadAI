#!/usr/bin/env python3
"""
Pothole Navigation System - Setup Verification Script
Checks if all components are properly configured for the navigation feature
"""

import os
import json
import sys
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: NOT FOUND - {filepath}")
        return False

def check_reports_data(filepath):
    """Check if reports.json has valid data"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if not isinstance(data, list):
            print(f"❌ reports.json: Invalid format (not a list)")
            return False
        
        total = len(data)
        with_location = sum(1 for r in data if r.get('lat') and r.get('lon'))
        
        print(f"✅ reports.json: {total} reports, {with_location} with GPS coordinates")
        
        if with_location == 0:
            print(f"⚠️  WARNING: No reports have GPS coordinates for map display")
            return False
        
        return True
    except json.JSONDecodeError:
        print(f"❌ reports.json: Invalid JSON format")
        return False
    except Exception as e:
        print(f"❌ reports.json: Error reading file - {e}")
        return False

def check_frontend_dependencies():
    """Check if required npm packages are installed"""
    package_json = Path(__file__).parent / 'frontend' / 'package.json'
    
    if not package_json.exists():
        print("❌ frontend/package.json: NOT FOUND")
        return False
    
    try:
        with open(package_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        deps = data.get('dependencies', {})
        required = ['leaflet', 'react-leaflet', 'axios', 'next', 'react']
        
        missing = []
        for pkg in required:
            if pkg in deps:
                print(f"✅ npm package: {pkg} ({deps[pkg]})")
            else:
                print(f"❌ npm package: {pkg} NOT FOUND")
                missing.append(pkg)
        
        if missing:
            print(f"\n⚠️  Install missing packages: npm install {' '.join(missing)}")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Error checking package.json: {e}")
        return False

def check_backend_dependencies():
    """Check if Python dependencies are installed"""
    try:
        import flask
        print(f"✅ Python package: flask ({flask.__version__})")
    except ImportError:
        print(f"❌ Python package: flask NOT INSTALLED")
        return False
    
    try:
        import flask_cors
        print(f"✅ Python package: flask-cors")
    except ImportError:
        print(f"❌ Python package: flask-cors NOT INSTALLED")
        return False
    
    try:
        from ultralytics import YOLO
        print(f"✅ Python package: ultralytics (YOLO)")
    except ImportError:
        print(f"❌ Python package: ultralytics NOT INSTALLED")
        return False
    
    return True

def check_components():
    """Check if navigation components exist"""
    base = Path(__file__).parent / 'frontend'
    
    components = {
        'PotholeAlertMap.jsx': base / 'components' / 'PotholeAlertMap.jsx',
        'Navigate page': base / 'app' / 'navigate' / 'page.jsx',
        'Test alerts page': base / 'app' / 'test-alerts' / 'page.jsx',
    }
    
    all_exist = True
    for name, path in components.items():
        if not check_file_exists(path, name):
            all_exist = False
    
    return all_exist

def main():
    print("=" * 60)
    print("🗺️  POTHOLE NAVIGATION SYSTEM - SETUP CHECK")
    print("=" * 60)
    print()
    
    base_dir = Path(__file__).parent
    checks_passed = 0
    checks_total = 0
    
    # Check backend files
    print("📁 BACKEND FILES")
    print("-" * 60)
    checks_total += 1
    if check_file_exists(base_dir / 'backend' / 'server.py', 'Backend server'):
        checks_passed += 1
    
    checks_total += 1
    reports_path = base_dir / 'backend' / 'reports.json'
    if check_file_exists(reports_path, 'Reports database'):
        if check_reports_data(reports_path):
            checks_passed += 1
    
    checks_total += 1
    if check_file_exists(base_dir / 'backend' / 'pothole.pt', 'YOLO model'):
        checks_passed += 1
    
    print()
    
    # Check frontend files
    print("📁 FRONTEND COMPONENTS")
    print("-" * 60)
    checks_total += 1
    if check_components():
        checks_passed += 1
    
    print()
    
    # Check dependencies
    print("📦 BACKEND DEPENDENCIES")
    print("-" * 60)
    checks_total += 1
    if check_backend_dependencies():
        checks_passed += 1
    
    print()
    
    print("📦 FRONTEND DEPENDENCIES")
    print("-" * 60)
    checks_total += 1
    if check_frontend_dependencies():
        checks_passed += 1
    
    print()
    
    # Check documentation
    print("📖 DOCUMENTATION")
    print("-" * 60)
    docs = {
        'Navigation Guide': base_dir / 'NAVIGATION_GUIDE.md',
        'Quick Start': base_dir / 'QUICK_START_NAVIGATION.md',
        'README': base_dir / 'README.md',
    }
    
    for name, path in docs.items():
        checks_total += 1
        if check_file_exists(path, name):
            checks_passed += 1
    
    # Summary
    print()
    print("=" * 60)
    print(f"📊 SUMMARY: {checks_passed}/{checks_total} checks passed")
    print("=" * 60)
    
    if checks_passed == checks_total:
        print("✅ All checks passed! System is ready to use.")
        print()
        print("🚀 NEXT STEPS:")
        print("   1. Start backend:  cd backend && python server.py")
        print("   2. Start frontend: cd frontend && npm run dev")
        print("   3. Navigate to:    http://localhost:3000/navigate")
        print()
        return 0
    else:
        print(f"⚠️  {checks_total - checks_passed} issues found. Please fix them before using the system.")
        print()
        print("📖 See NAVIGATION_GUIDE.md for setup instructions")
        print()
        return 1

if __name__ == '__main__':
    sys.exit(main())
