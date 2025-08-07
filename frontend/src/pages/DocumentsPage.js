import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FileText, Upload, Trash2, Eye, Download } from 'lucide-react';
import axios from 'axios';

const DocumentsPage = () => {
    const { token } = useSelector(state => state.auth);
    const [documents, setDocuments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${token}` }
    });

    const fetchDocuments = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/documents', getAuthHeaders());
            setDocuments(response.data.documents);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError('Failed to fetch documents');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await axios.post('http://localhost:8000/api/document/upload', formData, {
                ...getAuthHeaders(),
                headers: {
                    ...getAuthHeaders().headers,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setSuccess('Document uploaded successfully!');
            fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            setError(error.response?.data?.message || 'Failed to upload document');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const deleteDocument = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/api/document/${documentId}`, getAuthHeaders());
            setSuccess('Document deleted successfully!');
            fetchDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            setError('Failed to delete document');
        }
    };

    const viewDocument = async (documentId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/document/${documentId}`, getAuthHeaders());
            setSelectedDocument(response.data.document);
            setShowPreview(true);
        } catch (error) {
            console.error('Error fetching document content:', error);
            setError('Failed to load document content');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('text')) return '📃';
        return '📁';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
                            <p className="text-gray-600 mt-1">Upload and manage your legal documents</p>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                        >
                            <Upload size={20} />
                            <span>{isUploading ? 'Uploading...' : 'Upload Document'}</span>
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
                        {success}
                    </div>
                )}

                {/* Upload Guidelines */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Supported File Types</h3>
                    <p className="text-sm text-blue-700">
                        • PDF documents (.pdf)<br/>
                        • Microsoft Word documents (.doc, .docx)<br/>
                        • Plain text files (.txt)<br/>
                        • Maximum file size: 10MB
                    </p>
                </div>

                {/* Documents Grid */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Your Documents ({documents.length})
                        </h2>
                    </div>

                    {documents.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                            <p className="text-gray-500 mb-4">Upload your first document to get started</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                            >
                                <Upload size={16} />
                                <span>Upload Document</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                            {documents.map(doc => (
                                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">
                                                {getFileIcon(doc.file_type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {doc.filename}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(doc.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteDocument(doc.id)}
                                            className="text-red-400 hover:text-red-600 transition duration-200"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {doc.file_type.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
                                        </span>
                                        <button
                                            onClick={() => viewDocument(doc.id)}
                                            className="text-blue-600 hover:text-blue-800 transition duration-200"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Document Preview Modal */}
                {showPreview && selectedDocument && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {selectedDocument.filename}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Uploaded on {new Date(selectedDocument.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowPreview(false);
                                        setSelectedDocument(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Extracted Text:</h4>
                                    <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-96 overflow-y-auto">
                                        {selectedDocument.extractedText || 'No text content available.'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setShowPreview(false);
                                        setSelectedDocument(null);
                                    }}
                                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentsPage;