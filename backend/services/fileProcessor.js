const fs = require('fs').promises;
const pdf = require('pdf-parse');
const xlsx = require('xlsx');

class FileProcessor {
    async processPDF(filePath) {
        try {
            const pdfBuffer = await fs.readFile(filePath);
            const data = await pdf(pdfBuffer);
            return data.text;
        } catch (error) {
            console.error('PDF processing error:', error);
            throw new Error('فشل في معالجة ملف PDF');
        }
    }

    async processText(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return content;
        } catch (error) {
            console.error('Text processing error:', error);
            throw new Error('فشل في معالجة الملف النصي');
        }
    }

    async processExcel(filePath) {
        try {
            const workbook = xlsx.readFile(filePath);
            let content = '';

            // Process all sheets
            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
                
                content += `--- ${sheetName} ---\n`;
                jsonData.forEach(row => {
                    if (row.length > 0) {
                        content += row.join(' | ') + '\n';
                    }
                });
                content += '\n';
            });

            return content;
        } catch (error) {
            console.error('Excel processing error:', error);
            throw new Error('فشل في معالجة ملف Excel');
        }
    }

    // Split content into chunks for better AI processing
    splitContent(content, maxChunkSize = 1000) {
        const chunks = [];
        const sentences = content.split(/[.!?]+/);
        
        let currentChunk = '';
        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > maxChunkSize) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            } else {
                currentChunk += sentence + '. ';
            }
        }
        
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }
}

module.exports = new FileProcessor();