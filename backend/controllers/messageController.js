const { db } = require('../config/firebase');
const whatsappService = require('../services/whatsappService');

class MessageController {
    async getMessages(req, res) {
        try {
            const { page = 1, limit = 50, from, to } = req.query;
            const offset = (page - 1) * limit;

            let query = db.collection('messages')
                .orderBy('timestamp', 'desc');

            if (from) {
                query = query.where('from', '==', from);
            }

            if (to) {
                query = query.where('to', '==', to);
            }

            const snapshot = await query
                .offset(offset)
                .limit(parseInt(limit))
                .get();

            const messages = [];
            snapshot.forEach(doc => {
                messages.push({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate()
                });
            });

            res.json({
                success: true,
                data: {
                    messages,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: snapshot.size
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getStats(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            // Get today's messages
            const todaySnapshot = await db.collection('messages')
                .where('timestamp', '>=', today)
                .get();

            // Get yesterday's messages
            const yesterdaySnapshot = await db.collection('messages')
                .where('timestamp', '>=', yesterday)
                .where('timestamp', '<', today)
                .get();

            // Count by direction
            const todayIncoming = todaySnapshot.docs.filter(doc => 
                doc.data().direction === 'incoming').length;
            const todayOutgoing = todaySnapshot.docs.filter(doc => 
                doc.data().direction === 'outgoing').length;

            res.json({
                success: true,
                data: {
                    today: {
                        total: todaySnapshot.size,
                        incoming: todayIncoming,
                        outgoing: todayOutgoing
                    },
                    yesterday: {
                        total: yesterdaySnapshot.size
                    },
                    change: {
                        percentage: yesterdaySnapshot.size > 0 ? 
                            ((todaySnapshot.size - yesterdaySnapshot.size) / yesterdaySnapshot.size * 100).toFixed(1) : 0
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async sendMessage(req, res) {
        try {
            const { to, message, mediaUrl } = req.body;

            const result = await whatsappService.sendMessage(to, message, mediaUrl);

            // Save to database
            await db.collection('messages').add({
                from: 'bot',
                to,
                body: message,
                type: mediaUrl ? 'media' : 'text',
                timestamp: new Date(),
                direction: 'outgoing',
                mediaUrl
            });

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            await db.collection('messages').doc(id).delete();

            res.json({
                success: true,
                message: 'تم حذف الرسالة بنجاح'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new MessageController();