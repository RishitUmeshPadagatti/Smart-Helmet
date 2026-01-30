#!/usr/bin/env node

/**
 * Simple test to directly test OCR extraction without video processing
 */

const { runOCROnViolationImage } = require('./src/utils/videoProcessor');
const path = require('path');
const fs = require('fs');

async function testOCROnly() {
  try {
    const outputDir = path.join(__dirname, 'test_analysis_output');
    const violationFramesDir = path.join(outputDir, 'violation_frames');
    
    // Check if violation frames exist
    if (!fs.existsSync(violationFramesDir)) {
      console.log(`❌ Violation frames directory does not exist: ${violationFramesDir}`);
      return;
    }
    
    // Get list of violation frames
    const frameFiles = fs.readdirSync(violationFramesDir)
      .filter(f => f.endsWith('.jpg'))
      .sort();
    
    if (frameFiles.length === 0) {
      console.log(`❌ No violation frames found in ${violationFramesDir}`);
      return;
    }
    
    console.log('\n========================================');
    console.log('OCR EXTRACTION TEST (EXISTING FRAMES)');
    console.log('========================================\n');
    console.log(`Violation Frames Directory: ${violationFramesDir}`);
    console.log(`Number of Frames: ${frameFiles.length}\n`);
    
    // Create a mock analytics object with violation frames
    const analytics = {
      violation_frames: frameFiles
    };
    
    // Run OCR
    console.log(`🔍 Running EasyOCR extraction on ${frameFiles.length} frames...\n`);
    const result = await runOCROnViolationImage(analytics, outputDir);
    
    // Display results
    console.log('\n========================================');
    console.log('OCR EXTRACTION RESULTS');
    console.log('========================================\n');
    
    console.log(`\nFull result object:\n${JSON.stringify(result.plate_extraction, null, 2)}\n`);
    
    if (result.plate_extraction.success) {
      console.log('✅ LICENSE PLATE DETECTED');
      console.log(`Plate: ${result.plate_extraction.plate}`);
      console.log(`Confidence: ${(result.plate_extraction.confidence * 100).toFixed(1)}%`);
      console.log(`Valid Extractions: ${result.plate_extraction.validExtractions}/${result.plate_extraction.attempts}`);
      console.log(`Voting Mechanism: ${result.plate_extraction.voting_mechanism}`);
    } else {
      console.log('❌ NO PLATE DETECTED');
      console.log(`Reason: ${result.plate_extraction.reason || result.plate_extraction.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testOCROnly();
