#!/usr/bin/env python3
"""
Debug script to test complete plate extraction pipeline
"""

import sys
sys.path.insert(0, 'ML_model')

from easyocr_plate_extractor import PlateExtractor, TextCleaner
from pathlib import Path
import json

frame_dir = Path("test_analysis_output/violation_frames")
frames = sorted(list(frame_dir.glob("*.jpg")))

print("Testing text cleaner...")
test_texts = ['~09 AQ:3439', '09 AQ<3439']
for text in test_texts:
    cleaned = TextCleaner.clean_plate_text(text)
    print(f"  {text} -> {cleaned}")

print("\nInitializing EasyOCR extractor...")
extractor = PlateExtractor()

print(f"\nProcessing {len(frames)} frames...")
frame_paths = [str(f.resolve()) for f in frames]

result = extractor.extract_from_violation_frames(frame_paths)

print(f"\nResult: {json.dumps(result, indent=2)}")
