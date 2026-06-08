const express = require('express');
const router = express.Router();
const meetingsController = require('../controllers/meetings');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, meetingsController.createMeeting);
router.get('/:id', authenticateToken, meetingsController.getMeeting);
router.get('/', authenticateToken, meetingsController.listMeetings);
router.post('/:id/analyze', authenticateToken, meetingsController.analyzeMeeting);

module.exports = router;
