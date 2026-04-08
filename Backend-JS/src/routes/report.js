// src/routes/report.js
const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/email');

router.post('/send-report', async (req, res) => {
  try {
    const reportData = req.body;

    if (!reportData || !reportData.type) {
      return res.status(400).json({ error: 'Missing report data or type' });
    }

    const result = await sendEmail(reportData);
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Report sending failed:', error);
    res.status(500).json({ 
      error: 'Failed to send report email', 
      message: error.message 
    });
  }
});

module.exports = router;
