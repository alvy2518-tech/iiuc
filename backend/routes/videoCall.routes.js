const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const videoCallController = require('../controllers/videoCall.controller');

// All routes require authentication
router.use(authenticate);

// Generate video call token
router.post('/token', videoCallController.generateVideoCallToken);

// Start a video call
router.post('/start', videoCallController.startVideoCall);

// End a video call
router.put('/:callId/end', videoCallController.endVideoCall);

// Get video call history for a conversation
router.get('/conversation/:conversationId/history', videoCallController.getVideoCallHistory);

module.exports = router;
