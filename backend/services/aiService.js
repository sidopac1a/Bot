const axios = require('axios');
const { db } = require('../config/firebase');

class AIService {
    constructor() {
        this.models = {
            'gpt-4': {
                name: 'GPT-4',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            },
            'gpt-3.5-turbo': {
                name: 'GPT-3.5 Turbo',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            },
            'deepseek': {
                name: 'DeepSeek',
                endpoint: 'https://api.deepseek.com/v1/chat/completions',
                headers: {
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        };
    }

    async generateResponse(message, userId) {
        try {
            const settings = await this.getAISettings();
            const selectedModel = settings.model || 'gpt-3.5-turbo';
            
            // Get knowledge base context
            const context = await this.getKnowledgeContext(message);
            
            // Build prompt
            const systemPrompt = this.buildSystemPrompt(settings.prompt, context);
            
            // Generate response
            const response = await this.callAIModel(selectedModel, systemPrompt, message);
            
            // Log the conversation
            await this.logConversation(userId, message, response);
            
            return response;
        } catch (error) {
            console.error('AI Service Error:', error.message);
            return settings.fallbackMessage || 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة لاحقاً.';
        }
    }

    async callAIModel(modelKey, systemPrompt, userMessage) {
        const model = this.models[modelKey];
        if (!model) {
            throw new Error(`Model ${modelKey} not supported`);
        }

        const payload = {
            model: modelKey,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        };

        const response = await axios.post(model.endpoint, payload, {
            headers: model.headers,
            timeout: 30000
        });

        return response.data.choices[0].message.content;
    }

    buildSystemPrompt(basePrompt, knowledgeContext) {
        let prompt = basePrompt || 'أنت مساعد ذكي باللغة العربية. أجب بطريقة مفيدة ومهذبة.';
        
        if (knowledgeContext && knowledgeContext.length > 0) {
            prompt += '\n\nالمعلومات ذات الصلة:\n';
            knowledgeContext.forEach(item => {
                prompt += `- ${item.content}\n`;
            });
            prompt += '\nاستخدم هذه المعلومات في إجابتك إذا كانت ذات صلة بسؤال المستخدم.';
        }

        return prompt;
    }

    async getKnowledgeContext(query) {
        try {
            // Simple keyword matching - يمكن تحسينها باستخدام vector search
            const knowledgeSnapshot = await db.collection('knowledge')
                .where('type', '==', 'processed')
                .limit(5)
                .get();

            const context = [];
            knowledgeSnapshot.forEach(doc => {
                const data = doc.data();
                if (this.isRelevant(query, data.content)) {
                    context.push(data);
                }
            });

            return context;
        } catch (error) {
            console.error('Error getting knowledge context:', error.message);
            return [];
        }
    }

    isRelevant(query, content) {
        // Simple relevance check - يمكن تحسينها
        const queryWords = query.toLowerCase().split(' ');
        const contentLower = content.toLowerCase();
        
        return queryWords.some(word => 
            word.length > 3 && contentLower.includes(word)
        );
    }

    async getAISettings() {
        try {
            const doc = await db.collection('settings').doc('ai').get();
            return doc.exists ? doc.data() : {};
        } catch (error) {
            console.error('Error getting AI settings:', error.message);
            return {};
        }
    }

    async logConversation(userId, message, response) {
        try {
            await db.collection('conversations').add({
                userId,
                message,
                response,
                timestamp: new Date(),
                model: (await this.getAISettings()).model || 'gpt-3.5-turbo'
            });
        } catch (error) {
            console.error('Error logging conversation:', error.message);
        }
    }

    getAvailableModels() {
        return Object.keys(this.models).map(key => ({
            id: key,
            name: this.models[key].name
        }));
    }
}

module.exports = new AIService();