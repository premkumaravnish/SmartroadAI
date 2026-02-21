"""
Copy reports.json from backend to frontend public folder
This allows the frontend to access reports even when backend is offline
"""

import os
import shutil
from pathlib import Path

def main():
    # Get paths
    script_dir = Path(__file__).parent
    backend_reports = script_dir / 'backend' / 'reports.json'
    frontend_public = script_dir / 'frontend' / 'public'
    frontend_reports = frontend_public / 'reports.json'
    
    print("=" * 60)
    print("📋 Copying reports.json to frontend public folder")
    print("=" * 60)
    print()
    
    # Check if backend reports exist
    if not backend_reports.exists():
        print(f"❌ Source file not found: {backend_reports}")
        print("   Make sure you have reports in the backend folder")
        return 1
    
    # Create public folder if it doesn't exist
    frontend_public.mkdir(exist_ok=True)
    print(f"✅ Public folder: {frontend_public}")
    
    # Copy the file
    try:
        shutil.copy2(backend_reports, frontend_reports)
        print(f"✅ Copied: {backend_reports}")
        print(f"   To: {frontend_reports}")
        
        # Get file size
        size_bytes = os.path.getsize(frontend_reports)
        size_kb = size_bytes / 1024
        print(f"   Size: {size_kb:.2f} KB")
        
        # Count reports
        import json
        with open(frontend_reports, 'r', encoding='utf-8') as f:
            reports = json.load(f)
        
        with_location = sum(1 for r in reports if r.get('lat') and r.get('lon'))
        
        print(f"   Total reports: {len(reports)}")
        print(f"   With GPS: {with_location}")
        
        print()
        print("✅ Success! Frontend can now access reports offline")
        print()
        print("📝 Note: The frontend will still try to fetch from backend first,")
        print("   and will use this file as a fallback if backend is unavailable.")
        
        return 0
    except Exception as e:
        print(f"❌ Error copying file: {e}")
        return 1

if __name__ == '__main__':
    import sys
    sys.exit(main())
