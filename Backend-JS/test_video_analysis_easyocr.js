#!/usr/bin/env node

/**
 * Test script to analyze video with EasyOCR-based plate extraction
 */

const { processVideoWithDualModels } = require('./src/utils/videoProcessor');
const path = require('path');
const fs = require('fs');

async function analyzeVideo() {
  try {
    const videoPath = path.join(__dirname, 'uploads', '1769656673531-726217ca-e272-4845-a77c-4b303d80f93b-22.mp4');
    const outputDir = path.join(__dirname, 'test_analysis_output');

    console.log('\n========================================');
    console.log('VIDEO ANALYSIS WITH EASYOCR PLATE EXTRACTION');
    console.log('========================================\n');
    console.log(`Input Video: ${videoPath}`);
    console.log(`Output Directory: ${outputDir}\n`);

    // Check if video exists
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    // Process video with dual models
    const result = await processVideoWithDualModels(videoPath, outputDir);

    console.log('\n========================================');
    console.log('VIDEO ANALYSIS COMPLETE');
    console.log('========================================\n');

    // Display results
    if (result.success) {
      const analytics = result.analytics;

      console.log('📊 ANALYSIS RESULTS:');
      console.log('-----------------------------------------');
      console.log(`✓ Total Frames Processed: ${analytics.total_frames}`);
      console.log(`✓ Best Violation Score: ${analytics.best_violation_score}`);
      console.log(`✓ Processing Status: ${analytics.processing_complete ? 'COMPLETE' : 'INCOMPLETE'}`);

      console.log('\n📹 OUTPUT FILES:');
      console.log('-----------------------------------------');
      console.log(`✓ Annotated Video: ${analytics.annotated_video}`);
      if (analytics.violation_frames) {
        console.log(`✓ Violation Frames: ${analytics.violation_frames.length} frames saved`);
      }

      console.log('\n🔍 LICENSE PLATE EXTRACTION (EasyOCR + Frequency Voting):');
      console.log('-----------------------------------------');
      if (analytics.plate_extraction) {
        const plateInfo = analytics.plate_extraction;
        console.log(`✓ Extraction Success: ${plateInfo.success}`);
        if (plateInfo.success) {
          console.log(`✓ Detected Plate: ${plateInfo.plate}`);
          console.log(`✓ Confidence: ${(plateInfo.confidence * 100).toFixed(1)}%`);
          console.log(`✓ Found in ${plateInfo.validExtractions}/${plateInfo.attempts} frames`);
          console.log(`✓ Voting Mechanism: ${plateInfo.voting_mechanism}`);
          if (plateInfo.allExtractions) {
            console.log(`✓ All Extractions: ${plateInfo.allExtractions.join(', ')}`);
          }
        } else {
          console.log(`✗ Error: ${plateInfo.reason || plateInfo.error}`);
        }
      }

      console.log('\n📂 OUTPUT DIRECTORY:');
      console.log('-----------------------------------------');
      const fullOutputPath = path.resolve(outputDir);
      console.log(`Full Path: ${fullOutputPath}\n`);

      // List output files
      if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir);
        console.log('Generated Files:');
        files.forEach(file => {
          const filePath = path.join(outputDir, file);
          const stat = fs.statSync(filePath);
          if (!stat.isDirectory()) {
            const size = (stat.size / 1024 / 1024).toFixed(2);
            console.log(`  📄 ${file} (${size} MB)`);
          } else {
            console.log(`  📁 ${file}/`);
            const subFiles = fs.readdirSync(filePath);
            subFiles.forEach(subFile => {
              console.log(`    ├─ ${subFile}`);
            });
          }
        });
      }

      console.log('\n========================================');
      console.log('✅ ANALYSIS SUCCESSFUL');
      console.log('========================================\n');

      // Final output summary
      console.log('FINAL OUTPUT:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`License Plate: ${analytics.plate_extraction?.plate || 'Not extracted'}`);
      console.log(`Confidence: ${analytics.plate_extraction?.confidence ? (analytics.plate_extraction.confidence * 100).toFixed(1) + '%' : 'N/A'}`);
      console.log(`Annotated Video: ${analytics.annotated_video}`);
      console.log(`Violation Frames: ${outputDir}/violation_frames/`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return { success: true, analytics };
    } else {
      console.error('\n❌ Analysis failed:', result.message);
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run analysis
analyzeVideo().then(summary => {
  process.exit(summary.success ? 0 : 1);
});
