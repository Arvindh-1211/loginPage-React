const express = require("express");
const Router = express.Router;

const HelloController = require("../controller/hello");
const authController = require("../controller/authController");
const ChatController = require("../controller/chatController");
const DocumentController = require("../controller/documentController");
const {authMiddleware, roleMiddleware} = require("../middleware/authMiddleware");

const helloController = new HelloController();
const AuthController = new authController();
const chatController = new ChatController();
const documentController = new DocumentController();

const router = Router();

// Auth routes (no authentication required)
router.route('/login')
    .post(AuthController.login);

router.route('/register')
    .post(AuthController.register);

// Protected routes (authentication required)
router.use(authMiddleware);

router.route('/hello')
    .get(helloController.sendHello);

router.route('/user')
    .get(roleMiddleware(['admin']), helloController.getUser);

// Chat routes
router.route('/chat/create')
    .post(chatController.createChat);

router.route('/chat/message')
    .post(chatController.sendMessage);

router.route('/chat/history')
    .get(chatController.getChatHistory);

router.route('/chat/:chatId/messages')
    .get(chatController.getChatMessages);

router.route('/chat/document')
    .post(chatController.chatWithDocument);

// Document routes
router.route('/document/upload')
    .post(documentController.uploadMiddleware, documentController.uploadDocument);

router.route('/documents')
    .get(documentController.getUserDocuments);

router.route('/document/:documentId')
    .get(documentController.getDocumentContent)
    .delete(documentController.deleteDocument);

module.exports = router;