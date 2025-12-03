const { db } = require('../config/firebase');
const fileProcessor = require('../services/fileProcessor');
const fs = require('fs').promises;

class KnowledgeController {
    async getKnowledge(req, res) {
        try {
            const { type, page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            let query = db.collection('knowledge')
                .orderBy('timestamp', 'desc');

            if (type) {
                query = query.where('type', '==', type);
            }

            const snapshot = await query
                .offset(offset)
                .limit(parseInt(limit))
                .get();

            const knowledge = [];
            snapshot.forEach(doc => {
                knowledge.push({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate()
                });
            });

            res.json({
                success: true,
                data: {
                    knowledge,
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

    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'لم يتم رفع ملف'
                });
            }

            // Save file info to database
            const fileDoc = await db.collection('knowledge').add({
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
                status: 'uploaded',
                type: 'file',
                timestamp: new Date()
            });

            res.json({
                success: true,
                message: 'تم رفع الملف بنجاح',
                data: {
                    id: fileDoc.id,
                    filename: req.file.originalname
                }
            });

            // Process file in background
            this.processFileAsync(fileDoc.id, req.file);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async processFileAsync(fileId, file) {
        try {
            // Update status
            await db.collection('knowledge').doc(fileId).update({
                status: 'processing'
            });

            // Process file based on type
            let content = '';
            switch (file.mimetype) {
                case 'application/pdf':
                    content = await fileProcessor.processPDF(file.path);
                    break;
                case 'text/plain':
                    content = await fileProcessor.processText(file.path);
                    break;
                case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                case 'application/vnd.ms-excel':
                    content = await fileProcessor.processExcel(file.path);
                    break;
                default:
                    throw new Error('نوع ملف غير مدعوم');
            }

            // Save processed content
            await db.collection('knowledge').add({
                sourceFileId: fileId,
                content: content,
                status: 'processed',
                type: 'processed',
                timestamp: new Date()
            });

            // Update original file status
            await db.collection('knowledge').doc(fileId).update({
                status: 'completed',
                processedAt: new Date()
            });

            // Clean up file
            await fs.unlink(file.path);

        } catch (error) {
            console.error('File processing error:', error);
            
            // Update status to error
            await db.collection('knowledge').doc(fileId).update({
                status: 'error',
                error: error.message,
                processedAt: new Date()
            });
        }
    }

    async processFile(req, res) {
        try {
            const { id } = req.params;
            const doc = await db.collection('knowledge').doc(id).get();
            
            if (!doc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'الملف غير موجود'
                });
            }

            const fileData = doc.data();
            
            res.json({
                success: true,
                data: {
                    id: doc.id,
                    status: fileData.status,
                    filename: fileData.filename,
                    processedAt: fileData.processedAt?.toDate()
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async deleteKnowledge(req, res) {
        try {
            const { id } = req.params;
            
            // Get the document first
            const doc = await db.collection('knowledge').doc(id).get();
            if (!doc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'العنصر غير موجود'
                });
            }

            // Delete related processed content if this is a source file
            if (doc.data().type === 'file') {
                const relatedSnapshot = await db.collection('knowledge')
                    .where('sourceFileId', '==', id)
                    .get();
                
                const batch = db.batch();
                relatedSnapshot.forEach(relatedDoc => {
                    batch.delete(relatedDoc.ref);
                });
                await batch.commit();
            }

            // Delete the main document
            await db.collection('knowledge').doc(id).delete();

            res.json({
                success: true,
                message: 'تم الحذف بنجاح'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new KnowledgeController();