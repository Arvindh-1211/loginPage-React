import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Send, FileText, Upload, MessageCircle, Plus, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const ChatPage = () => {
    const { token, username } = useSelector(state => state.auth);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchChatHistory();
        fetchDocuments();
    }, []);

    useEffect(() => {
        if (currentChatId) {
            fetchChatMessages(currentChatId);
        }
    }, [currentChatId]);

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${token}` }
    });

    const fetchChatHistory = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/chat/history', getAuthHeaders());
            setChats(response.data.chats);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    const fetchChatMessages = async (chatId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/chat/${chatId}/messages`, getAuthHeaders());
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        }
    };

    const fetchDocuments = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/documents', getAuthHeaders());
            setDocuments(response.data.documents);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const createNewChat = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/chat/create', 
                { title: 'New Chat' }, 
                getAuthHeaders()
            );
            const newChatId = response.data.chatId;
            setCurrentChatId(newChatId);
            setMessages([]);
            fetchChatHistory();
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    };

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = message;
        setMessage('');
        setIsLoading(true);
        setError('');

        // Add user message to UI immediately
        const newUserMessage = {
            message: userMessage,
            sender: 'user',
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, newUserMessage]);

        try {
            let chatId = currentChatId;
            
            // Create new chat if none exists
            if (!chatId) {
                const chatResponse = await axios.post('http://localhost:8000/api/chat/create', 
                    { title: userMessage.substring(0, 50) + '...' }, 
                    getAuthHeaders()
                );
                chatId = chatResponse.data.chatId;
                setCurrentChatId(chatId);
                fetchChatHistory();
            }

            // Send message to appropriate endpoint based on document selection
            let response;
            if (selectedDocument) {
                // Get document content first
                const docResponse = await axios.get(`http://localhost:8000/api/document/${selectedDocument.id}`, getAuthHeaders());
                
                response = await axios.post('http://localhost:8000/api/chat/document', {
                    message: userMessage,
                    chatId: chatId,
                    documentContent: docResponse.data.document.extractedText
                }, getAuthHeaders());
            } else {
                response = await axios.post('http://localhost:8000/api/chat/message', {
                    message: userMessage,
                    chatId: chatId
                }, getAuthHeaders());
            }

            // Add bot response to UI
            const botMessage = {
                message: response.data.botResponse,
                sender: 'bot',
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('document', file);

        try {
            await axios.post('http://localhost:8000/api/document/upload', formData, {
                ...getAuthHeaders(),
                headers: {
                    ...getAuthHeaders().headers,
                    'Content-Type': 'multipart/form-data'
                }
            });
            fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            setError('Failed to upload document. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">LegalBot</h1>
                    <p className="text-sm text-gray-600">Welcome, {username}</p>
                </div>

                {/* New Chat Button */}
                <div className="p-4">
                    <button
                        onClick={createNewChat}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                    >
                        <Plus size={16} />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Chats</h3>
                    {chats.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => setCurrentChatId(chat.id)}
                            className={`w-full text-left p-3 rounded-md transition duration-200 ${
                                currentChatId === chat.id 
                                    ? 'bg-blue-50 border border-blue-200' 
                                    : 'hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-start space-x-2">
                                <MessageCircle size={16} className="mt-1 text-gray-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {chat.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(chat.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Documents Section */}
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Documents</h3>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                            <Upload size={16} />
                        </button>
                    </div>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {documents.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => setSelectedDocument(selectedDocument?.id === doc.id ? null : doc)}
                                className={`w-full text-left p-2 rounded text-xs transition duration-200 ${
                                    selectedDocument?.id === doc.id 
                                        ? 'bg-green-50 border border-green-200' 
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <FileText size={12} />
                                    <span className="truncate">{doc.filename}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    {selectedDocument && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                            <p className="text-green-800">📎 {selectedDocument.filename}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-20">
                            <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">Welcome to LegalBot</h3>
                            <p>Ask any legal question or upload a document to get started.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-3xl px-4 py-3 rounded-lg ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-200'
                                    }`}
                                >
                                    {msg.sender === 'bot' ? (
                                        <ReactMarkdown className="prose prose-sm max-w-none">
                                            {msg.message}
                                        </ReactMarkdown>
                                    ) : (
                                        <p>{msg.message}</p>
                                    )}
                                    <p className={`text-xs mt-1 ${
                                        msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                        {formatTime(msg.created_at)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t border-gray-200 bg-white p-4">
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask a legal question..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!message.trim() || isLoading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;