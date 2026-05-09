import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Dumbbell, FolderKanban, UtensilsCrossed, Pill, Moon, Sun } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useTheme } from '../../contexts/ThemeContext';
import './Sidebar.css';

interface SidebarProps {
    user?: {
        firstName: string;
        lastName: string;
        profilePictureUrl?: string;
    };
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
    const { theme, toggleTheme } = useTheme();

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/clients', icon: Users, label: 'Clients' },
        { path: '/programs', icon: FolderKanban, label: 'Programs' },
        { path: '/workouts', icon: Dumbbell, label: 'Workout Sessions' },
        { path: '/calendar', icon: Calendar, label: 'Calendar' },
        { path: '/exercises', icon: Dumbbell, label: 'Exercise Library' },
        { path: '/meals', icon: UtensilsCrossed, label: 'Meals' },
        { path: '/supplements', icon: Pill, label: 'Compléments' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar__header">
                <div className="sidebar__logo">
                    <Dumbbell size={32} className="sidebar__logo-icon" />
                    <span className="sidebar__logo-text">COACHFLOW</span>
                </div>
            </div>

            <nav className="sidebar__nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
                        }
                    >
                        <item.icon size={20} className="sidebar__nav-icon" />
                        <span className="sidebar__nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar__footer">
                {/* Theme toggle */}
                <button
                    className="sidebar__theme-toggle"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                >
                    {theme === 'dark' ? (
                        <Sun size={18} className="sidebar__theme-icon sidebar__theme-icon--sun" />
                    ) : (
                        <Moon size={18} className="sidebar__theme-icon sidebar__theme-icon--moon" />
                    )}
                </button>

                {user && (
                    <div className="sidebar__user">
                        <Avatar
                            src={user.profilePictureUrl}
                            name={`${user.firstName} ${user.lastName}`}
                            size="md"
                        />
                        <div className="sidebar__user-info">
                            <div className="sidebar__user-name">
                                {user.firstName} {user.lastName}
                            </div>
                            <div className="sidebar__user-role">Coach</div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
