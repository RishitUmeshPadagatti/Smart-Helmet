@echo off
REM Test script for helmet detection endpoints (Windows)

setlocal enabledelayedexpansion

set BASE_URL=%1
set TEST_IMAGE=%2

if "!BASE_URL!"=="" (
    set BASE_URL=http://localhost:3000
)

echo.
echo ==========================================
echo Helmet Detection API Test Suite
echo ==========================================
echo.

REM Test 1: Health Check
echo [Test 1] Checking helmet detection service health...
echo URL: !BASE_URL!/helmet-detect/health

curl -s "!BASE_URL!/helmet-detect/health"

echo.
echo.

REM Test 2: File upload and detection
if "!TEST_IMAGE!"=="" (
    echo [Note] To test image upload, provide a test image path:
    echo Usage: test_helmet_detection.bat ^<base_url^> ^<test_image_path^>
    echo.
    echo Example:
    echo test_helmet_detection.bat http://localhost:3000 sample.jpg
    goto :end
)

if not exist "!TEST_IMAGE!" (
    echo [Error] Test image not found: !TEST_IMAGE!
    goto :end
)

echo [Test 2] Uploading image for helmet detection...
echo Image: !TEST_IMAGE!
echo.

curl -X POST "!BASE_URL!/helmet-detect/detect" ^
  -F "image=@!TEST_IMAGE!"

echo.
echo.

:end
echo ==========================================
echo Test completed
echo ==========================================
echo.

endlocal
