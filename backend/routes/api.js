const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middlewares/auth');

// Controllers
const botController = require('../controllers/botController');
const messageController = require('../controllers/messageController');
const settingsController = require('../controllers/settingsController');
const knowledgeController = require('../controllers/knowledgeController');

// Multer configuration for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'text/plain', 
                             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                             'application/vnd.ms-excel'];
        cb(null, allowedTypes.includes(file.mimetype));
    }
});

// Authentication routes
router.post('/auth/login', settingsController.login);
router.post('/auth/logout', auth, settingsController.logout);
router.get('/auth/me', auth, settingsController.getUser);

// Bot management
router.get('/bot/status', auth, botController.getStatus);
router.post('/bot/connect', auth, botController.connect);
router.post('/bot/disconnect', auth, botController.disconnect);
router.post('/bot/switch', auth, botController.switchConnection);
router.get('/bot/qr', auth, botController.getQRCode);

// Messages
router.get('/messages', auth, messageController.getMessages);
router.get('/messages/stats', auth, messageController.getStats);
router.post('/messages/send', auth, messageController.sendMessage);
router.delete('/messages/:id', auth, messageController.deleteMessage);

// Settings
router.get('/settings', auth, settingsController.getSettings);
router.put('/settings', auth, settingsController.updateSettings);
router.get('/settings/ai-models', auth, settingsController.getAIModels);

// Knowledge Base
router.get('/knowledge', auth, knowledgeController.getKnowledge);
router.post('/knowledge/upload', auth, upload.single('file'), knowledgeController.uploadFile);
router.delete('/knowledge/:id', auth, knowledgeController.deleteKnowledge);
router.get('/knowledge/process/:id', auth, knowledgeController.processFile);

// Import/Export
router.get('/export', auth, settingsController.exportSettings);
router.post('/import', auth, upload.single('file'), settingsController.importSettings);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

module.exports = router;