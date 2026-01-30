#!/usr/bin/env python3
"""
Diagnostic script to test EasyOCR on violation frames
"""

import cv2
import easyocr
from pathlib import Path
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize EasyOCR
print("Initializing EasyOCR...")
reader = easyocr.Reader(['en'], gpu=False, verbose=False)
print("EasyOCR initialized")

frame_dir = Path("test_analysis_output/violation_frames")
frames = sorted(list(frame_dir.glob("*.jpg")))[:3]  # Test first 3 frames

for frame_path in frames:
    print(f"\n========== Testing {frame_path.name} ==========")
    img = cv2.imread(str(frame_path))
    
    if img is None:
        print("Failed to read image")
        continue
    
    h, w = img.shape[:2]
    print(f"Image dimensions: {w}x{h}")
    
    # Test on entire image
    print("\nTesting OCR on full image...")
    results = reader.readtext(img, detail=1)
    print(f"Found {len(results)} text regions")
    
    for (bbox, text, conf) in results:
        print(f"  Text: '{text}' | Confidence: {conf:.2f}")
    
    # Test on bottom half
    print(f"\nTesting OCR on bottom 60% ({int(h*0.4)}-{h})...")
    bottom_60 = img[int(h*0.4):h, :]
    results = reader.readtext(bottom_60, detail=1)
    print(f"Found {len(results)} text regions")
    
    for (bbox, text, conf) in results:
        print(f"  Text: '{text}' | Confidence: {conf:.2f}")
