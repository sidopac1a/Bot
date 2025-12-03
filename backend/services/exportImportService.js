const { db } = require('../config/firebase');
const fs = require('fs').promises;

class ExportImportService {
    async exportAll() {
        try {
            const exportData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                settings: {},
                knowledge: [],
                metadata: {
                    totalSettings: 0,
                    totalKnowledge: 0
                }
            };

            // Export settings
            const settingsSnapshot = await db.collection('settings').get();
            settingsSnapshot.forEach(doc => {
                exportData.settings[doc.id] = doc.data();
                exportData.metadata.totalSettings++;
            });

            // Export knowledge base (processed content only)
            const knowledgeSnapshot = await db.collection('knowledge')
                .where('type', '==', 'processed')
                .get();
            
            knowledgeSnapshot.forEach(doc => {
                const data = doc.data();
                exportData.knowledge.push({
                    content: data.content,
                    timestamp: data.timestamp
                });
                exportData.metadata.totalKnowledge++;
            });

            return exportData;
        } catch (error) {
            console.error('Export error:', error);
            throw new Error('فشل في تصدير البيانات');
        }
    }

    async importAll(filePath) {
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const importData = JSON.parse(fileContent);

            if (!importData.version || !importData.settings) {
                throw new Error('ملف الاستيراد غير صالح');
            }

            const results = {
                settings: 0,
                knowledge: 0,
                errors: []
            };

            // Import settings
            try {
                const batch = db.batch();
                
                Object.entries(importData.settings).forEach(([key, value]) => {
                    const ref = db.collection('settings').doc(key);
                    batch.set(ref, value, { merge: true });
                    results.settings++;
                });

                await batch.commit();
            } catch (error) {
                results.errors.push(`Settings import error: ${error.message}`);
            }

            // Import knowledge
            if (importData.knowledge && importData.knowledge.length > 0) {
                try {
                    const batch = db.batch();
                    
                    importData.knowledge.forEach(item => {
                        const ref = db.collection('knowledge').doc();
                        batch.set(ref, {
                            content: item.content,
                            type: 'processed',
                            status: 'completed',
                            imported: true,
                            timestamp: new Date(),
                            originalTimestamp: item.timestamp
                        });
                        results.knowledge++;
                    });

                    await batch.commit();
                } catch (error) {
                    results.errors.push(`Knowledge import error: ${error.message}`);
                }
            }

            // Clean up
            await fs.unlink(filePath);

            return results;
        } catch (error) {
            console.error('Import error:', error);
            throw new Error('فشل في استيراد البيانات: ' + error.message);
        }
    }
}

module.exports = new ExportImportService();