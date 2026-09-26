#!/usr/bin/env python3
"""
Build script for Email Archive ML Assistant Thunderbird extension.
Creates an .xpi package file in the _builds folder.

Usage:
    python utils/build_xpi.py

The .xpi file will be named: EmailArchive4Thunderbird_YYYYMMDD_hhmm.xpi
"""

import os
import zipfile
from datetime import datetime
from pathlib import Path


def build_xpi():
    # Get the project root directory (parent of utils folder)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Create _builds folder if it doesn't exist
    builds_dir = project_root / "_builds"
    builds_dir.mkdir(exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    xpi_filename = f"EmailArchive4Thunderbird_{timestamp}.xpi"
    xpi_path = builds_dir / xpi_filename
    
    # Files and folders to include in the extension
    include_items = [
        "manifest.json",
        "background",
        "pages",
        "icons",
        "LICENSE",
    ]
    
    # Create the XPI (ZIP) file
    print(f"Building extension package...")
    print(f"Project root: {project_root}")
    print(f"Output: {xpi_path}")
    print()
    
    files_added = 0
    
    with zipfile.ZipFile(xpi_path, 'w', zipfile.ZIP_DEFLATED) as xpi:
        for item_name in include_items:
            item_path = project_root / item_name
            
            if not item_path.exists():
                print(f"  Warning: {item_name} not found, skipping...")
                continue
            
            if item_path.is_file():
                # Add single file
                xpi.write(item_path, item_name)
                print(f"  Added: {item_name}")
                files_added += 1
            elif item_path.is_dir():
                # Add directory recursively
                for file_path in item_path.rglob("*"):
                    if file_path.is_file():
                        # Calculate relative path from project root
                        arcname = file_path.relative_to(project_root)
                        xpi.write(file_path, arcname)
                        print(f"  Added: {arcname}")
                        files_added += 1
    
    print()
    print(f"Build complete!")
    print(f"  Files packaged: {files_added}")
    print(f"  Output file: {xpi_path}")
    print(f"  File size: {xpi_path.stat().st_size / 1024:.1f} KB")
    
    return xpi_path


if __name__ == "__main__":
    build_xpi()

