import './App.css';
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import Navigation from './components/Navigation';

function App() {
    const { token } = useSelector(state => state.auth);
    const location = useLocation();
    
    // Don't show navigation on login/signup pages
    const hideNavigation = ['/login', '/signup'].includes(location.pathname);
    const showNavigation = token && !hideNavigation;

    return (
        <div className="App">
            {showNavigation && <Navigation />}
            <Outlet />
        </div>
    );
}

export default App;
