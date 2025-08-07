const axios = require('axios');
const db = require("../utils/connectDB");

class ChatController {
    // Send message to Ollama and get response
    sendMessage = async (req, res) => {
        try {
            const { message, chatId } = req.body;
            const userId = req.user.user_id;

            if (!message) {
                return res.status(400).json({ message: "Message is required" });
            }

            // Save user message to database
            const userMessageSql = `INSERT INTO chat_messages (chat_id, user_id, message, sender, created_at) VALUES (?, ?, ?, 'user', NOW())`;
            await db.query(userMessageSql, [chatId, userId, message]);

            // Send message to Ollama
            const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
                model: 'lawbot',
                prompt: `You are a legal expert assistant. Please provide helpful and accurate legal information. User question: ${message}`,
                stream: false
            });

            const botResponse = ollamaResponse.data.response;

            // Save bot response to database
            const botMessageSql = `INSERT INTO chat_messages (chat_id, user_id, message, sender, created_at) VALUES (?, ?, ?, 'bot', NOW())`;
            await db.query(botMessageSql, [chatId, userId, botResponse]);

            res.json({
                success: true,
                userMessage: message,
                botResponse: botResponse,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error in chat:', error);
            res.status(500).json({ 
                error: "Unable to process chat message", 
                message: error.message 
            });
        }
    };

    // Create a new chat session
    createChat = async (req, res) => {
        try {
            const userId = req.user.user_id;
            const { title } = req.body;

            const sql = `INSERT INTO chats (user_id, title, created_at) VALUES (?, ?, NOW())`;
            const result = await db.query(sql, [userId, title || 'New Chat']);

            const chatId = result[0].insertId;

            res.json({
                success: true,
                chatId: chatId,
                title: title || 'New Chat'
            });

        } catch (error) {
            console.error('Error creating chat:', error);
            res.status(500).json({ 
                error: "Unable to create chat", 
                message: error.message 
            });
        }
    };

    // Get user's chat history
    getChatHistory = async (req, res) => {
        try {
            const userId = req.user.user_id;

            const sql = `SELECT id, title, created_at FROM chats WHERE user_id = ? ORDER BY created_at DESC`;
            const result = await db.query(sql, [userId]);

            res.json({
                success: true,
                chats: result[0]
            });

        } catch (error) {
            console.error('Error fetching chat history:', error);
            res.status(500).json({ 
                error: "Unable to fetch chat history", 
                message: error.message 
            });
        }
    };

    // Get messages for a specific chat
    getChatMessages = async (req, res) => {
        try {
            const { chatId } = req.params;
            const userId = req.user.user_id;

            // Verify user owns this chat
            const chatSql = `SELECT * FROM chats WHERE id = ? AND user_id = ?`;
            const chatResult = await db.query(chatSql, [chatId, userId]);

            if (chatResult[0].length === 0) {
                return res.status(404).json({ message: "Chat not found" });
            }

            const messagesSql = `SELECT * FROM chat_messages WHERE chat_id = ? ORDER BY created_at ASC`;
            const messagesResult = await db.query(messagesSql, [chatId]);

            res.json({
                success: true,
                chat: chatResult[0][0],
                messages: messagesResult[0]
            });

        } catch (error) {
            console.error('Error fetching chat messages:', error);
            res.status(500).json({ 
                error: "Unable to fetch chat messages", 
                message: error.message 
            });
        }
    };

    // Chat with document analysis
    chatWithDocument = async (req, res) => {
        try {
            const { message, chatId, documentContent } = req.body;
            const userId = req.user.user_id;

            if (!message || !documentContent) {
                return res.status(400).json({ message: "Message and document content are required" });
            }

            // Save user message to database
            const userMessageSql = `INSERT INTO chat_messages (chat_id, user_id, message, sender, created_at) VALUES (?, ?, ?, 'user', NOW())`;
            await db.query(userMessageSql, [chatId, userId, message]);

            // Send message to Ollama with document context
            const prompt = `You are a legal expert assistant. Based on the following document content, please answer the user's question:

Document Content:
${documentContent}

User Question: ${message}

Please provide a detailed legal analysis based on the document provided.`;

            const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
                model: 'lawbot',
                prompt: prompt,
                stream: false
            });

            const botResponse = ollamaResponse.data.response;

            // Save bot response to database
            const botMessageSql = `INSERT INTO chat_messages (chat_id, user_id, message, sender, created_at) VALUES (?, ?, ?, 'bot', NOW())`;
            await db.query(botMessageSql, [chatId, userId, botResponse]);

            res.json({
                success: true,
                userMessage: message,
                botResponse: botResponse,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error in document chat:', error);
            res.status(500).json({ 
                error: "Unable to process document chat", 
                message: error.message 
            });
        }
    };
}

module.exports = ChatController;