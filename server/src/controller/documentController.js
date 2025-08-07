const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const db = require("../utils/connectDB");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, Word documents, and text files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

class DocumentController {
    // Middleware for handling file upload
    uploadMiddleware = upload.single('document');

    // Upload and process document
    uploadDocument = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const userId = req.user.user_id;
            const filePath = req.file.path;
            const fileName = req.file.originalname;
            const fileType = req.file.mimetype;

            let extractedText = '';

            // Extract text based on file type
            if (fileType === 'application/pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                const pdfData = await pdfParse(dataBuffer);
                extractedText = pdfData.text;
            } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                       fileType === 'application/msword') {
                const result = await mammoth.extractRawText({ path: filePath });
                extractedText = result.value;
            } else if (fileType === 'text/plain') {
                extractedText = fs.readFileSync(filePath, 'utf8');
            }

            // Save document info to database
            const sql = `INSERT INTO documents (user_id, filename, file_path, file_type, extracted_text, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
            const result = await db.query(sql, [userId, fileName, filePath, fileType, extractedText]);

            const documentId = result[0].insertId;

            // Clean up uploaded file (optional - you might want to keep it)
            // fs.unlinkSync(filePath);

            res.json({
                success: true,
                documentId: documentId,
                fileName: fileName,
                extractedText: extractedText.substring(0, 500) + '...', // Preview
                message: "Document uploaded and processed successfully"
            });

        } catch (error) {
            console.error('Error uploading document:', error);
            
            // Clean up file on error
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            }

            res.status(500).json({ 
                error: "Unable to process document", 
                message: error.message 
            });
        }
    };

    // Get user's uploaded documents
    getUserDocuments = async (req, res) => {
        try {
            const userId = req.user.user_id;

            const sql = `SELECT id, filename, file_type, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC`;
            const result = await db.query(sql, [userId]);

            res.json({
                success: true,
                documents: result[0]
            });

        } catch (error) {
            console.error('Error fetching documents:', error);
            res.status(500).json({ 
                error: "Unable to fetch documents", 
                message: error.message 
            });
        }
    };

    // Get specific document content
    getDocumentContent = async (req, res) => {
        try {
            const { documentId } = req.params;
            const userId = req.user.user_id;

            const sql = `SELECT * FROM documents WHERE id = ? AND user_id = ?`;
            const result = await db.query(sql, [documentId, userId]);

            if (result[0].length === 0) {
                return res.status(404).json({ message: "Document not found" });
            }

            const document = result[0][0];

            res.json({
                success: true,
                document: {
                    id: document.id,
                    filename: document.filename,
                    fileType: document.file_type,
                    extractedText: document.extracted_text,
                    createdAt: document.created_at
                }
            });

        } catch (error) {
            console.error('Error fetching document content:', error);
            res.status(500).json({ 
                error: "Unable to fetch document content", 
                message: error.message 
            });
        }
    };

    // Delete document
    deleteDocument = async (req, res) => {
        try {
            const { documentId } = req.params;
            const userId = req.user.user_id;

            // Get document info first
            const selectSql = `SELECT * FROM documents WHERE id = ? AND user_id = ?`;
            const selectResult = await db.query(selectSql, [documentId, userId]);

            if (selectResult[0].length === 0) {
                return res.status(404).json({ message: "Document not found" });
            }

            const document = selectResult[0][0];

            // Delete file from filesystem
            if (fs.existsSync(document.file_path)) {
                fs.unlinkSync(document.file_path);
            }

            // Delete from database
            const deleteSql = `DELETE FROM documents WHERE id = ? AND user_id = ?`;
            await db.query(deleteSql, [documentId, userId]);

            res.json({
                success: true,
                message: "Document deleted successfully"
            });

        } catch (error) {
            console.error('Error deleting document:', error);
            res.status(500).json({ 
                error: "Unable to delete document", 
                message: error.message 
            });
        }
    };
}

module.exports = DocumentController;