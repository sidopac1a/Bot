const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');

// Meta WhatsApp webhook verification
router.get('/whatsapp', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
        console.log('Webhook verified');
        res.status(200).send(challenge);
    } else {
        res.status(403).send('Forbidden');
    }
});

// Meta WhatsApp webhook for receiving messages
router.post('/whatsapp', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'whatsapp_business_account') {
            body.entry.forEach(entry => {
                const changes = entry.changes;
                
                changes.forEach(change => {
                    if (change.field === 'messages') {
                        const messages = change.value.messages;
                        
                        if (messages) {
                            messages.forEach(async (message) => {
                                await processIncomingMessage(message, change.value);
                            });
                        }
                    }
                });
            });
        }

        res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function processIncomingMessage(message, messageData) {
    try {
        const messageObj = {
            id: message.id,
            from: message.from,
            to: messageData.metadata.phone_number_id,
            body: message.text?.body || '',
            type: message.type,
            timestamp: new Date(parseInt(message.timestamp) * 1000),
            direction: 'incoming'
        };

        // Save and process message
        await whatsappService.handleIncomingMessage(messageObj);
        
        logger.info('Message processed:', {
            id: message.id,
            from: message.from,
            type: message.type
        });
    } catch (error) {
        logger.error('Error processing incoming message:', error);
    }
}

// Health check for webhook
router.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        service: 'Webhook',
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;