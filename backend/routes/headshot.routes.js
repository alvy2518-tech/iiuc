const express = require('express');
const router = express.Router();
const headshotController = require('../controllers/headshot.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/v1/headshots/generate
 * @desc    Generate a professional headshot from uploaded image
 * @access  Private (Candidate)
 */
router.post('/generate', authenticate, headshotController.generateHeadshot);

/**
 * @route   GET /api/v1/headshots/history
 * @desc    Get headshot generation history for authenticated candidate
 * @access  Private (Candidate)
 */
router.get('/history', authenticate, headshotController.getHeadshotHistory);

/**
 * @route   DELETE /api/v1/headshots/:id
 * @desc    Delete a specific headshot from history
 * @access  Private (Candidate)
 */
router.delete('/:id', authenticate, headshotController.deleteHeadshot);

module.exports = router;
