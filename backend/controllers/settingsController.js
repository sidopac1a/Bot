const { db } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const aiService = require('../services/aiService');
const exportImportService = require('../services/exportImportService');

class SettingsController {
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Simple authentication - يمكن تحسينه
            if (username !== process.env.ADMIN_USERNAME || 
                password !== process.env.ADMIN_PASSWORD) {
                return res.status(401).json({
                    success: false,
                    error: 'بيانات تسجيل الدخول غير صحيحة'
                });
            }

            const token = jwt.sign(
                { username, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                data: {
                    token,
                    user: { username, role: 'admin' }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async logout(req, res) {
        res.json({
            success: true,
            message: 'تم تسجيل الخروج بنجاح'
        });
    }

    async getUser(req, res) {
        res.json({
            success: true,
            data: req.user
        });
    }

    async getSettings(req, res) {
        try {
            const settingsSnapshot = await db.collection('settings').get();
            const settings = {};
            
            settingsSnapshot.forEach(doc => {
                settings[doc.id] = doc.data();
            });

            res.json({
                success: true,
                data: settings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async updateSettings(req, res) {
        try {
            const { category, settings } = req.body;

            await db.collection('settings')
                .doc(category)
                .set(settings, { merge: true });

            // Emit real-time update
            req.io.to('admin').emit('settings-updated', { category, settings });

            res.json({
                success: true,
                message: 'تم تحديث الإعدادات بنجاح'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getAIModels(req, res) {
        try {
            const models = aiService.getAvailableModels();
            res.json({
                success: true,
                data: models
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async exportSettings(req, res) {
        try {
            const exportData = await exportImportService.exportAll();
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 
                `attachment; filename=chatbot-backup-${Date.now()}.json`);
            
            res.json(exportData);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async importSettings(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'لم يتم رفع ملف'
                });
            }

            const result = await exportImportService.importAll(req.file.path);

            res.json({
                success: true,
                message: 'تم استيراد البيانات بنجاح',
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new SettingsController();