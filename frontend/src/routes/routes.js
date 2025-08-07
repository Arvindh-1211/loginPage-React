import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboard from "../pages/AdminDashboard";
import ChatPage from "../pages/ChatPage";
import DocumentsPage from "../pages/DocumentsPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";

const routes = [
    {
        path: '/',
        element:
            <ProtectedRoute>
                <ChatPage />
            </ProtectedRoute>
    },
    {
        path: '/chat',
        element:
            <ProtectedRoute>
                <ChatPage />
            </ProtectedRoute>
    },
    {
        path: '/documents',
        element:
            <ProtectedRoute>
                <DocumentsPage />
            </ProtectedRoute>
    },
    {
        path: '/login',
        element: <LoginPage />
    },
    {
        path: '/signup',
        element: <SignupPage />
    },
    {
        path: '/admin',
        element:
            <ProtectedRoute users={['admin']}>
                <AdminDashboard />
            </ProtectedRoute>
    }
];

export default routes;