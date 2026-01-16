import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import ClientListWidget from '../components/dashboard/ClientListWidget';
import ChatPopup from '../components/ChatPopup';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();

    // Mock data - will be replaced with API calls
    const mockClients = [
        {
            id: 1,
            firstName: 'Melissa',
            lastName: 'Dubois',
            currentWeight: 68.5,
            weightChange: -2.3,
            program: '4 Week Fat Loss Plan',
            status: 'Active' as const,
        },
        {
            id: 2,
            firstName: 'Antoine',
            lastName: 'Martin',
            currentWeight: 82.3,
            weightChange: 0.4,
            program: 'Muscle Building Program',
            status: 'Active' as const,
        },
        {
            id: 3,
            firstName: 'Sophie',
            lastName: 'Lefevre',
            currentWeight: 55.0,
            weightChange: -0.4,
            program: 'Beginner Fitness',
            status: 'Active' as const,
        },
        {
            id: 4,
            firstName: 'Kevin',
            lastName: 'Bernard',
            currentWeight: 88.5,
            weightChange: -0.8,
            program: 'Advanced Strength',
            status: 'Active' as const,
        },
        {
            id: 5,
            firstName: 'Julian',
            lastName: 'Dupont',
            currentWeight: 75.0,
            weightChange: -0.2,
            program: 'Cardio Excellence',
            status: 'Active' as const,
        },
    ];

    const handleViewAllClients = () => {
        navigate('/clients');
    };

    return (
        <MainLayout>
            <div className="dashboard-page">
                <div className="dashboard-page__header">
                    <h1 className="dashboard-page__title">Dashboard</h1>
                    <p className="dashboard-page__subtitle">
                        Welcome back! Here's an overview of your coaching activity.
                    </p>
                </div>

                <div className="dashboard-page__grid">
                    <div className="dashboard-page__section">
                        <ClientListWidget clients={mockClients} onViewAll={handleViewAllClients} />
                    </div>

                    <div className="dashboard-page__section">
                        {/* Performance chart will go here */}
                        <div className="dashboard-page__placeholder">
                            <p>Performance Chart Coming Soon</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Popup */}
            <ChatPopup />
        </MainLayout>
    );
};

export default DashboardPage;
