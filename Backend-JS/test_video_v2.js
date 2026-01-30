#!/usr/bin/env node

/**
 * Test script to analyze the helmet_violation.mp4 video with full EasyOCR extraction
 */

const { processVideoWithDualModels } = require('./src/utils/videoProcessor');
const path = require('path');
const fs = require('fs');

async function analyzeVideo() {
  try {
    const videoPath = path.join(__dirname, 'uploads', 'helmet_violation.mp4');
    const outputDir = path.join(__dirname, 'test_analysis_output_v2');

    console.log('\n========================================');
    console.log('VIDEO ANALYSIS WITH EASYOCR EXTRACTION');
    console.log('========================================\n');
    console.log(`📹 Input Video: helmet_violation.mp4`);
    console.log(`📁 Output Directory: test_analysis_output_v2\n`);

    // Check if video exists
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process video with dual models
    console.log('⏳ Processing video with YOLO models (vehicle + helmet detection)...\n');
    const result = await processVideoWithDualModels(videoPath, outputDir);

    console.log('\n========================================');
    console.log('ANALYSIS COMPLETE');
    console.log('========================================\n');

    // Display results
    if (result.success) {
      const analytics = result.analytics;

      console.log('📊 ANALYSIS RESULTS:');
      console.log('-----------------------------------------');
      console.log(`✓ Total Frames Processed: ${analytics.total_frames || 'N/A'}`);
      console.log(`✓ Best Violation Score: ${analytics.best_violation_score || 'N/A'}`);
      const violationCount = analytics.violation_frames ? analytics.violation_frames.length : 0;
      console.log(`✓ Violation Frames Extracted: ${violationCount}`);

      if (violationCount > 0) {
        console.log(`\n🔍 Extracted ${violationCount} violation frames`);
        console.log(`📍 Location: ${outputDir}/violation_frames/\n`);

        console.log('📊 PLATE EXTRACTION RESULTS:');
        console.log('-----------------------------------------');
        
        if (analytics.plate_extraction && analytics.plate_extraction.success) {
          console.log(`✅ Primary Plate: ${analytics.plate_extraction.plate}`);
          console.log(`   Frequency: ${analytics.plate_extraction.frequency} votes`);
          
          if (analytics.plate_extraction.plate_2) {
            console.log(`\n✅ Secondary Plate: ${analytics.plate_extraction.plate_2}`);
            console.log(`   Frequency: ${analytics.plate_extraction.frequency_2} votes`);
          }
          
          console.log(`\n📈 Valid Extractions: ${analytics.plate_extraction.validExtractions}/${analytics.plate_extraction.attempts}`);
          console.log(`🎯 Voting Mechanism: ${analytics.plate_extraction.voting_mechanism}`);
          
          if (analytics.plate_extraction.votes) {
            console.log(`\n📊 Vote Distribution:`);
            const sortedVotes = Object.entries(analytics.plate_extraction.votes)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5);
            sortedVotes.forEach(([plate, votes]) => {
              console.log(`   ${plate}: ${votes} votes`);
            });
          }
        } else {
          console.log(`❌ No license plate extracted`);
          if (analytics.plate_extraction) {
            console.log(`   Reason: ${analytics.plate_extraction.error || analytics.plate_extraction.reason || 'Unknown'}`);
          }
        }
      } else {
        console.log(`\n⚠️  No violation frames found in video`);
      }

      console.log('\n📂 OUTPUT FILES:');
      console.log('-----------------------------------------');
      const annotatedVideo = path.join(outputDir, 'annotated_violations.mp4');
      if (fs.existsSync(annotatedVideo)) {
        const stats = fs.statSync(annotatedVideo);
        console.log(`✓ Annotated Video: annotated_violations.mp4 (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      }
      
      const violationDir = path.join(outputDir, 'violation_frames');
      if (fs.existsSync(violationDir)) {
        const frameFiles = fs.readdirSync(violationDir).filter(f => f.endsWith('.jpg'));
        console.log(`✓ Violation Frames: ${frameFiles.length} frames saved`);
        frameFiles.slice(0, 3).forEach(f => console.log(`  ├─ ${f}`));
        if (frameFiles.length > 3) {
          console.log(`  └─ ... and ${frameFiles.length - 3} more`);
        }
      }

      console.log('\n' + '='.repeat(40));
      console.log('✅ COMPLETE');
      console.log('='.repeat(40));
    } else {
      console.error('❌ Analysis failed');
      console.error(result.error);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

analyzeVideo();
