/**
 * License Plate OCR Handler using Tesseract.js
 * Extracts license plate text from violation images
 */

const Tesseract = require('tesseract.js');
const fsSync = require('fs');
const fs = require('fs').promises;
const sharp = require('sharp');
const path = require('path');

class LicensePlateOCRHandler {
  constructor() {
    console.log('[OCR] Multi-pass Tesseract handler initialized');
  }

  /**
   * Stricter license plate validation.
   */
  isValidPlateText(text) {
    if (!text) return false;
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleaned.length < 4 || cleaned.length > 10) return false;
    const hasLetter = /[A-Z]/.test(cleaned);
    const hasNumber = /[0-9]/.test(cleaned);
    return hasLetter && hasNumber;
  }

  /**
   * Creates multiple preprocessed versions of the license plate region.
   */
  async createPreprocessedImages(imagePath) {
    const processingPasses = [];
    const outputDir = path.dirname(imagePath);
    const baseName = path.basename(imagePath, path.extname(imagePath));

    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const cropHeight = Math.floor(metadata.height * 0.5); // Crop bottom 50%
      const cropTop = metadata.height - cropHeight;

      const croppedImage = image.extract({ left: 0, top: cropTop, width: metadata.width, height: cropHeight });

      // Pass 1: High Contrast
      const pass1Path = path.join(outputDir, `${baseName}_pass1_contrast.jpg`);
      await croppedImage.clone().greyscale().normalise().sharpen().toFile(pass1Path);
      processingPasses.push({ path: pass1Path, type: 'contrast' });

      // Pass 2: Binary Threshold
      const pass2Path = path.join(outputDir, `${baseName}_pass2_binary.jpg`);
      await croppedImage.clone().threshold(128).toFile(pass2Path);
      processingPasses.push({ path: pass2Path, type: 'binary' });
      
      // Pass 3: Inverted Binary
      const pass3Path = path.join(outputDir, `${baseName}_pass3_inverted.jpg`);
      await croppedImage.clone().threshold(128).negate().toFile(pass3Path);
      processingPasses.push({ path: pass3Path, type: 'inverted' });

      console.log(`[OCR] Created ${processingPasses.length} preprocessed images.`);
      return processingPasses;
    } catch (error) {
      console.error(`[OCR] Preprocessing failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Runs OCR on a single image file.
   */
  async runOCRPass(filePath) {
    try {
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    } catch (error) {
      console.warn(`[OCR] Pass failed for ${path.basename(filePath)}: ${error.message}`);
      return [];
    }
  }

  /**
   * Extract plates by running multiple OCR passes.
   */
  async extractPlatesFromImage(imagePath) {
    let preprocessedImages = [];
    const allFoundPlates = [];

    try {
      if (!fsSync.existsSync(imagePath)) {
        console.warn(`[OCR] Image not found: ${imagePath}`);
        return [];
      }

      preprocessedImages = await this.createPreprocessedImages(imagePath);
      if (preprocessedImages.length === 0) return [];

      for (const pass of preprocessedImages) {
        console.log(`[OCR] Running pass: ${pass.type}`);
        const lines = await this.runOCRPass(pass.path);
        for (const line of lines) {
          if (this.isValidPlateText(line)) {
            const plate = line.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            allFoundPlates.push({
              plate_number: plate,
              raw: line,
              source_pass: pass.type
            });
            console.log(`[OCR] Candidate found in ${pass.type} pass: ${plate}`);
          }
        }
      }

      // Deduplicate and return the best results
      const uniquePlates = [...new Map(allFoundPlates.map(item => [item['plate_number'], item])).values()];
      console.log(`[OCR] Found ${uniquePlates.length} unique valid license plates.`);
      return uniquePlates;

    } catch (error) {
      console.error(`[OCR] Main extraction error: ${error.message}`);
      return [];
    } finally {
      // Cleanup all generated preprocessed files
      for (const img of preprocessedImages) {
        try { await fs.unlink(img.path); } catch (e) { /* ignore */ }
      }
    }
  }
}

module.exports = LicensePlateOCRHandler;


module.exports = LicensePlateOCRHandler;
