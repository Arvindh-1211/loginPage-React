import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MessageCircle, FileText, LogOut, User } from 'lucide-react';
import { setAuth } from '../store/authSlice';

const Navigation = () => {
    const { username, role } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(setAuth({}));
        navigate('/login');
    };

    const navItems = [
        {
            path: '/chat',
            icon: MessageCircle,
            label: 'Chat',
            description: 'Ask legal questions'
        },
        {
            path: '/documents',
            icon: FileText,
            label: 'Documents',
            description: 'Manage documents'
        }
    ];

    if (role === 'admin') {
        navItems.push({
            path: '/admin',
            icon: User,
            label: 'Admin',
            description: 'Admin dashboard'
        });
    }

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">LB</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">LegalBot</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition duration-200 ${
                                        isActive 
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                    title={item.description}
                                >
                                    <Icon size={18} />
                                    <span className="hidden sm:block font-medium">{item.label}</span>
                                </Link>
                            );
                        })}

                        <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 font-medium text-sm">
                                        {username?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-gray-700">
                                    {username}
                                </span>
                                {role === 'admin' && (
                                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                        Admin
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-md transition duration-200"
                                title="Logout"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:block">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;