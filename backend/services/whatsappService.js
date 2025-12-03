const axios = require('axios');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { db } = require('../config/firebase');

class WhatsAppService {
    constructor() {
        this.metaClient = null;
        this.wppClient = null;
        this.connectionType = 'meta'; // 'meta' or 'wpp'
        this.isConnected = false;
        this.qrCode = null;
    }

    async initialize(type = 'meta') {
        this.connectionType = type;
        
        if (type === 'meta') {
            await this.initializeMetaAPI();
        } else {
            await this.initializeWPPConnect();
        }
    }

    async initializeMetaAPI() {
        try {
            this.metaClient = {
                token: process.env.META_ACCESS_TOKEN,
                phoneNumberId: process.env.META_PHONE_NUMBER_ID,
                version: 'v18.0'
            };
            
            // Test connection
            await this.testMetaConnection();
            this.isConnected = true;
            
            console.log('✅ Meta WhatsApp API initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Meta API:', error.message);
            throw error;
        }
    }

    async initializeWPPConnect() {
        try {
            this.wppClient = new Client({
                authStrategy: new LocalAuth({
                    name: 'whatsapp-session'
                }),
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                }
            });

            this.wppClient.on('qr', (qr) => {
                console.log('📱 QR Code received');
                qrcode.toDataURL(qr, (err, url) => {
                    if (!err) {
                        this.qrCode = url;
                    }
                });
            });

            this.wppClient.on('ready', () => {
                console.log('✅ WPPConnect client is ready!');
                this.isConnected = true;
                this.qrCode = null;
            });

            this.wppClient.on('message', async (message) => {
                await this.handleIncomingMessage(message);
            });

            await this.wppClient.initialize();
        } catch (error) {
            console.error('❌ Failed to initialize WPPConnect:', error.message);
            throw error;
        }
    }

    async testMetaConnection() {
        const response = await axios.get(
            `https://graph.facebook.com/v18.0/${this.metaClient.phoneNumberId}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.metaClient.token}`
                }
            }
        );
        return response.data;
    }

    async sendMessage(to, message, mediaUrl = null) {
        if (this.connectionType === 'meta') {
            return await this.sendMetaMessage(to, message, mediaUrl);
        } else {
            return await this.sendWPPMessage(to, message, mediaUrl);
        }
    }

    async sendMetaMessage(to, message, mediaUrl = null) {
        try {
            const payload = {
                messaging_product: "whatsapp",
                to: to,
                type: mediaUrl ? "image" : "text"
            };

            if (mediaUrl) {
                payload.image = {
                    link: mediaUrl,
                    caption: message
                };
            } else {
                payload.text = {
                    body: message
                };
            }

            const response = await axios.post(
                `https://graph.facebook.com/v18.0/${this.metaClient.phoneNumberId}/messages`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.metaClient.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error sending Meta message:', error.response?.data || error.message);
            throw error;
        }
    }

    async sendWPPMessage(to, message, mediaUrl = null) {
        try {
            if (!this.wppClient || !this.isConnected) {
                throw new Error('WPPConnect client not ready');
            }

            if (mediaUrl) {
                const media = await MessageMedia.fromUrl(mediaUrl);
                return await this.wppClient.sendMessage(to, media, { caption: message });
            } else {
                return await this.wppClient.sendMessage(to, message);
            }
        } catch (error) {
            console.error('Error sending WPP message:', error.message);
            throw error;
        }
    }

    async handleIncomingMessage(message) {
        try {
            // Save message to Firebase
            await this.saveMessage({
                id: message.id,
                from: message.from,
                to: message.to,
                body: message.body,
                type: message.type,
                timestamp: new Date(),
                direction: 'incoming'
            });

            // Process with AI if enabled
            const settings = await this.getSettings();
            if (settings.autoReply) {
                const aiResponse = await this.processWithAI(message.body, message.from);
                await this.sendMessage(message.from, aiResponse);
            }
        } catch (error) {
            console.error('Error handling incoming message:', error.message);
        }
    }

    async saveMessage(messageData) {
        try {
            await db.collection('messages').add(messageData);
        } catch (error) {
            console.error('Error saving message:', error.message);
        }
    }

    async getSettings() {
        try {
            const doc = await db.collection('settings').doc('general').get();
            return doc.exists ? doc.data() : {};
        } catch (error) {
            console.error('Error getting settings:', error.message);
            return {};
        }
    }

    async processWithAI(message, userId) {
        const aiService = require('./aiService');
        return await aiService.generateResponse(message, userId);
    }

    getConnectionStatus() {
        return {
            type: this.connectionType,
            connected: this.isConnected,
            qrCode: this.qrCode
        };
    }

    async switchConnection(newType) {
        if (this.connectionType === newType) {
            return;
        }

        // Disconnect current
        if (this.wppClient) {
            await this.wppClient.destroy();
        }

        // Initialize new connection
        await this.initialize(newType);
    }
}

module.exports = new WhatsAppService();