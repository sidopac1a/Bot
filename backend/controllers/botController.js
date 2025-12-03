const whatsappService = require('../services/whatsappService');
const { db } = require('../config/firebase');

class BotController {
    async getStatus(req, res) {
        try {
            const status = whatsappService.getConnectionStatus();
            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async connect(req, res) {
        try {
            const { type = 'meta' } = req.body;
            await whatsappService.initialize(type);
            
            res.json({
                success: true,
                message: 'تم الاتصال بنجاح'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async disconnect(req, res) {
        try {
            if (whatsappService.wppClient) {
                await whatsappService.wppClient.destroy();
            }
            whatsappService.isConnected = false;
            
            res.json({
                success: true,
                message: 'تم قطع الاتصال بنجاح'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async switchConnection(req, res) {
        try {
            const { type } = req.body;
            await whatsappService.switchConnection(type);
            
            res.json({
                success: true,
                message: `تم التبديل إلى ${type} بنجاح`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getQRCode(req, res) {
        try {
            const status = whatsappService.getConnectionStatus();
            res.json({
                success: true,
                data: {
                    qrCode: status.qrCode,
                    available: !!status.qrCode
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new BotController();