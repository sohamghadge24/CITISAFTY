import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, Activity, Navigation, AlertTriangle, LayoutDashboard, HelpCircle, Mail, LogIn, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import '../../styles/Header.css';

const Header = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="premium-header glass-panel">
            <div className="header-left">
                <NavLink to="/" className="brand">
                    <ShieldCheck className="logo-icon" />
                    <span className="brand-text">SafeCity <span>Intelligence</span></span>
                </NavLink>
            </div>

            <div className="header-spacer"></div>
            <div className="header-right">
                <NavLink to="/how-it-works" className="icon-link" title="How It Works">
                    <HelpCircle size={20} />
                </NavLink>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <NavLink to="/login" className="login-btn glass-button">
                    <LogIn size={18} />
                    <span>Sign In</span>
                </NavLink>
            </div>
        </header>
    );
};

export default Header;
