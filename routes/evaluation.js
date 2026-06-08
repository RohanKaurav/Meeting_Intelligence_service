const express = require('express');
const router = express.Router();

router.get('/evaluation', (req, res) => {
    return res.status(200).json({
        candidateName: "Rohan Kaurav",
        email: "rohan05kaurav@gmail.com", 
        repositoryUrl: "https://github.com/RohanKaurav/Meeting_Intelligence_service.git",
        deployedUrl: "deploy ke baad",
        externalIntegration: "Discord Webhook",
        features: [
            "Authentication",
            "AI Analysis",
            "Reminder Scheduler"
        ]
    });
});

module.exports = router;
