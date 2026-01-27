import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../ui/SearchBar';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
    user?: {
        firstName: string;
        lastName: string;
        profilePictureUrl?: string;
    };
    onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSearch }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header__search">
                <SearchBar
                    placeholder="Search clients, programs, or exercises..."
                    onSearch={onSearch}
                />
            </div>

            <div className="header__actions">
                <button className="header__notification-btn">
                    <Bell size={20} />
                    <span className="header__notification-badge">3</span>
                </button>

                {user && (
                    <div className="header__user-wrapper" ref={dropdownRef}>
                        <button
                            className="header__user"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <Avatar
                                src={user.profilePictureUrl}
                                name={`${user.firstName} ${user.lastName}`}
                                size="sm"
                            />
                            <span className="header__user-name">
                                {user.firstName} {user.lastName}
                            </span>
                            <ChevronDown
                                size={16}
                                className={`header__user-chevron ${isDropdownOpen ? 'header__user-chevron--open' : ''}`}
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="header__dropdown">
                                <button className="header__dropdown-item" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
