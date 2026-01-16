import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import SearchBar from '../ui/SearchBar';
import Avatar from '../ui/Avatar';
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
                    <div className="header__user">
                        <Avatar
                            src={user.profilePictureUrl}
                            name={`${user.firstName} ${user.lastName}`}
                            size="sm"
                        />
                        <span className="header__user-name">
                            {user.firstName} {user.lastName}
                        </span>
                        <ChevronDown size={16} className="header__user-chevron" />
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
