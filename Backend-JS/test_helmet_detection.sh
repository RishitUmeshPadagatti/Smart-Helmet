#!/bin/bash
# Test script for helmet detection endpoints

set -e

BASE_URL="${1:-http://localhost:3000}"
TEST_IMAGE="${2:-test_image.jpg}"

echo "=========================================="
echo "Helmet Detection API Test Suite"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}[Test 1]${NC} Checking helmet detection service health..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/helmet-detect/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed (HTTP 200)${NC}"
    echo "Response:"
    echo "$BODY" | jq '.'
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    exit 1
fi

echo ""

# Test 2: File upload and detection
if [ ! -f "$TEST_IMAGE" ]; then
    echo -e "${YELLOW}[Warning]${NC} Test image not found: $TEST_IMAGE"
    echo "To run the full test, provide a test image path:"
    echo "  ./test_helmet_detection.sh <base_url> <test_image_path>"
    echo ""
    echo "Example:"
    echo "  ./test_helmet_detection.sh http://localhost:3000 sample.jpg"
    exit 0
fi

echo -e "${YELLOW}[Test 2]${NC} Uploading image for helmet detection..."
echo "Image: $TEST_IMAGE"

DETECT_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -F "image=@${TEST_IMAGE}" \
  "${BASE_URL}/helmet-detect/detect")

HTTP_CODE=$(echo "$DETECT_RESPONSE" | tail -n1)
BODY=$(echo "$DETECT_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Image upload and detection succeeded (HTTP 200)${NC}"
    echo "Response:"
    echo "$BODY" | jq '.'
    
    # Extract key information
    SUCCESS=$(echo "$BODY" | jq -r '.success')
    DECISION=$(echo "$BODY" | jq -r '.detection.summary.decision')
    COUNT=$(echo "$BODY" | jq -r '.detection.detection_count')
    
    echo ""
    echo "Summary:"
    echo "  Detection Success: $SUCCESS"
    echo "  Helmet Decision: $DECISION"
    echo "  Objects Detected: $COUNT"
else
    echo -e "${RED}✗ Image upload failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "All tests completed successfully!"
echo "==========================================${NC}"
