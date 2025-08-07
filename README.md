# LegalBot - AI Legal Assistant

A comprehensive React web application with Express.js backend that provides AI-powered legal assistance using Ollama's lawbot model. Users can ask legal questions, upload documents for analysis, and maintain chat history.

## Features

### 🔐 Authentication System
- User registration and login with JWT authentication
- Secure password hashing with bcrypt
- Session management with Redux Persist

### 💬 AI Chat Interface
- Real-time chat with Ollama's lawbot model
- Chat history and session management
- Document-based Q&A functionality
- Markdown rendering for bot responses

### 📄 Document Management
- Upload PDF, Word documents, and text files
- Automatic text extraction and processing
- Document preview and management
- File size limits and type validation

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Intuitive navigation and user interface
- Real-time loading states and error handling
- Clean, professional layout

## Tech Stack

### Backend
- **Express.js** - Web application framework
- **MySQL** - Database for user data and chat history
- **JWT** - Authentication and authorization
- **Multer** - File upload handling
- **Ollama** - AI model integration (lawbot)
- **PDF-Parse** - PDF text extraction
- **Mammoth** - Word document processing

### Frontend
- **React 18** - User interface library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **React Markdown** - Markdown rendering
- **Axios** - HTTP client

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v16 or higher)
2. **MySQL** database server
3. **Ollama** with the lawbot model installed and running

### Setting up Ollama

1. Install Ollama from [https://ollama.ai](https://ollama.ai)
2. Pull the lawbot model:
   ```bash
   ollama pull lawbot
   ```
3. Verify the model is running:
   ```bash
   ollama list
   ```

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd legal-chatbot
```

### 2. Database Setup
```sql
-- Create database
CREATE DATABASE legal_chatbot;

-- Use the provided schema file
mysql -u root -p legal_chatbot < server/database_schema.sql
```

### 3. Backend Setup
```bash
cd server
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
PORT=8000
DB_HOST=localhost
DB_PORT=3306
DB_DB=legal_chatbot
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

## Running the Application

### 1. Start the Backend Server
```bash
cd server
npm run dev
```
The server will run on http://localhost:8000

### 2. Start the Frontend
```bash
cd frontend
npm start
```
The application will open at http://localhost:3000

### 3. Verify Ollama is Running
Make sure Ollama is running with the lawbot model:
```bash
ollama serve
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Ask Questions**: Start chatting with the AI about legal matters
3. **Upload Documents**: Upload legal documents for analysis and Q&A
4. **Manage Chats**: View previous conversations and continue discussions
5. **Document Library**: Organize and manage uploaded documents

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Chat Management
- `POST /api/chat/create` - Create new chat session
- `POST /api/chat/message` - Send message to AI
- `POST /api/chat/document` - Chat with document context
- `GET /api/chat/history` - Get user's chat history
- `GET /api/chat/:chatId/messages` - Get messages for specific chat

### Document Management
- `POST /api/document/upload` - Upload document
- `GET /api/documents` - Get user's documents
- `GET /api/document/:documentId` - Get document content
- `DELETE /api/document/:documentId` - Delete document

## Project Structure

```
legal-chatbot/
├── server/                 # Backend application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controller/    # Route controllers
│   │   ├── middleware/    # Authentication middleware
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
│   ├── uploads/           # Uploaded documents
│   ├── package.json
│   └── server.js
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── routes/        # Route definitions
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   └── styles/        # CSS files
│   └── package.json
├── database_schema.sql    # Database schema
└── README.md
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- File type validation
- File size limitations
- SQL injection prevention with parameterized queries
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

## Acknowledgments

- Ollama team for the AI model infrastructure
- React and Express.js communities
- Contributors and testers