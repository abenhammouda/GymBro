import React, { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';
import './MainLayout.css';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { user } = useAuth();

    const handleSearch = (query: string) => {
        console.log('Search query:', query);
        // TODO: Implement global search functionality
    };

    return (
        <div className="main-layout">
            <Sidebar user={user || undefined} />
            <div className="main-layout__content">
                <Header user={user || undefined} onSearch={handleSearch} />
                <main className="main-layout__main">{children}</main>
            </div>
        </div>
    );
};

export default MainLayout;
