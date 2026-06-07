const express = require('express');
const router = express.Router();
const actionItemsController = require('../controllers/actionItems');
const authenticateToken = require('../middleware/auth');

router.get('/overdue', authenticateToken, actionItemsController.getOverdueActionItems);
router.post('/', authenticateToken, actionItemsController.createActionItem);
router.patch('/:id/status', authenticateToken, actionItemsController.updateStatus);
router.get('/', authenticateToken, actionItemsController.listActionItems);

module.exports = router;
