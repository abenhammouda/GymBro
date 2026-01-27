import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Users, Calendar } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import ChatPopup from '../components/ChatPopup';
import programService from '../services/program.service';
import type { Program, ProgramStatus } from '../types';
import './ProgramsPage.css';

const ProgramsPage: React.FC = () => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const statusFilters = [
        { label: 'All', value: 'All', count: 0 },
        { label: 'Active', value: 'Active', count: 0 },
        { label: 'Draft', value: 'Draft', count: 0 },
        { label: 'Completed', value: 'Completed', count: 0 },
        { label: 'Cancelled', value: 'Cancelled', count: 0 },
    ];

    useEffect(() => {
        loadPrograms();
    }, []);

    useEffect(() => {
        filterPrograms();
    }, [programs, selectedStatus, searchQuery]);

    const loadPrograms = async () => {
        try {
            setIsLoading(true);
            const data = await programService.getPrograms();
            setPrograms(data);
            setError('');
        } catch (err: any) {
            console.error('Error loading programs:', err);
            setError('Failed to load programs');
            // Mock data for development
            setPrograms([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterPrograms = () => {
        let filtered = programs;

        // Filter by status
        if (selectedStatus !== 'All') {
            filtered = filtered.filter(p => p.status === selectedStatus);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredPrograms(filtered);
    };

    const getStatusBadgeClass = (status: ProgramStatus): string => {
        const statusMap: Record<ProgramStatus, string> = {
            'Active': 'status-active',
            'Draft': 'status-draft',
            'Completed': 'status-completed',
            'Cancelled': 'status-cancelled'
        };
        return statusMap[status];
    };

    const getStatusCounts = () => {
        const counts = {
            All: programs.length,
            Active: programs.filter(p => p.status === 'Active').length,
            Draft: programs.filter(p => p.status === 'Draft').length,
            Completed: programs.filter(p => p.status === 'Completed').length,
            Cancelled: programs.filter(p => p.status === 'Cancelled').length,
        };
        return counts;
    };

    const formatDateRange = (startDate?: string, endDate?: string): string => {
        if (!startDate || !endDate) return 'No dates set';

        const start = new Date(startDate);
        const end = new Date(endDate);

        const formatDate = (date: Date) => {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };

        return `${formatDate(start)} - ${formatDate(end)}`;
    };

    const counts = getStatusCounts();

    return (
        <MainLayout>
            <div className="programs-page">
                <div className="page-header">
                    <h1>Programs</h1>
                    <button className="btn-new-program">
                        <Plus size={20} />
                        New Program
                    </button>
                </div>

                {/* Search Bar */}
                <div className="search-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search programs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Status Filters */}
                <div className="status-filters">
                    {statusFilters.map(filter => (
                        <button
                            key={filter.value}
                            className={`status-filter-btn ${selectedStatus === filter.value ? 'active' : ''}`}
                            onClick={() => setSelectedStatus(filter.value)}
                        >
                            {filter.label} ({counts[filter.value as keyof typeof counts]})
                        </button>
                    ))}
                    <button className="more-filters-btn">
                        <MoreVertical size={16} />
                    </button>
                </div>

                {/* Programs Grid */}
                {isLoading ? (
                    <div className="loading">Loading programs...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : filteredPrograms.length === 0 ? (
                    <div className="empty-state">
                        <p>No programs found</p>
                        <button className="btn-new-program">
                            <Plus size={20} />
                            Create Your First Program
                        </button>
                    </div>
                ) : (
                    <div className="programs-grid">
                        {filteredPrograms.map(program => (
                            <div key={program.programId} className="program-card">
                                {/* Cover Image */}
                                <div className="program-cover">
                                    {program.coverImageUrl ? (
                                        <img src={program.coverImageUrl} alt={program.name} />
                                    ) : (
                                        <div className="no-image-placeholder">
                                            <Calendar size={48} />
                                        </div>
                                    )}
                                    <div className={`status-badge ${getStatusBadgeClass(program.status)}`}>
                                        {program.status.toUpperCase()}
                                    </div>
                                </div>

                                {/* Program Info */}
                                <div className="program-info">
                                    <div className="program-header">
                                        <h3>{program.name}</h3>
                                        <button className="menu-btn">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>

                                    <div className="program-meta">
                                        <span className="program-dates">
                                            {formatDateRange(program.startDate, program.endDate)}
                                        </span>
                                    </div>

                                    {program.currentWeek && (
                                        <div className="program-progress">
                                            <span className="progress-text">
                                                Week {program.currentWeek} of {program.duration}
                                            </span>
                                        </div>
                                    )}

                                    <div className="program-footer">
                                        <div className="clients-count">
                                            <Users size={16} />
                                            <span>{program.clientsAssigned} Clients Assigned</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ChatPopup />
        </MainLayout>
    );
};

export default ProgramsPage;
