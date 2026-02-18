import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Dumbbell, Users } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import CreateWorkoutModal from '../components/CreateWorkoutModal';
import AssignClientsModal from '../components/AssignClientsModal';
import './WorkoutSessionsPage.css';
import axios from 'axios';

interface WorkoutSession {
    workoutSessionId: number;
    name: string;
    description?: string;
    coverImageUrl?: string;
    category: string;
    status: string;
    startDate?: string;
    endDate?: string;
    exerciseCount: number;
    assignedClients?: { adherentId: number }[];
    createdAt: string;
    duration?: number;
}

interface Exercise {
    exerciseTemplateId: number;
    name: string;
    category: string;
}

const WorkoutSessionsPage = () => {
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedSessionForAssignment, setSelectedSessionForAssignment] = useState<number | null>(null);
    const [totalClientsCount, setTotalClientsCount] = useState(0);

    const handleEditSession = async (session: WorkoutSession) => {
        try {
            const token = localStorage.getItem('authToken');
            // Charger les détails complets de la session
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/WorkoutSessions/${session.workoutSessionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Session details loaded:', response.data);
            setEditingSession(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error loading session details:', error);
            // En cas d'erreur, utiliser les données de base disponibles
            setEditingSession(session);
            setIsModalOpen(true);
        }
    };

    useEffect(() => {
        loadWorkoutSessions();
        loadExercises();
        loadTotalClients();
    }, []);

    const loadTotalClients = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/CoachClients/my-clients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTotalClientsCount(response.data.length);
        } catch (error) {
            console.error('Error loading total clients:', error);
        }
    };

    const isAllClientsAssigned = (session: WorkoutSession) => {
        if (totalClientsCount === 0) return false;
        return (session.assignedClients?.length || 0) >= totalClientsCount;
    };

    const loadWorkoutSessions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/WorkoutSessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(response.data);
        } catch (error) {
            console.error('Error loading workout sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadExercises = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ExerciseTemplates`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setExercises(response.data);
        } catch (error) {
            console.error('Error loading exercises:', error);
        }
    };


    const handleCreateWorkout = async (workoutData: any) => {
        try {
            const token = localStorage.getItem('authToken');

            // Création du FormData requis par le backend [FromForm]
            const formData = new FormData();
            formData.append('name', workoutData.name);
            formData.append('category', 'General'); // Valeur par défaut si non spécifiée
            formData.append('status', 'Active');
            formData.append('exercises', JSON.stringify(workoutData.exercises));

            // Ajouter la durée si elle existe
            if (workoutData.duration) {
                formData.append('duration', workoutData.duration.toString());
            }

            if (editingSession) {
                // Mode édition - PUT request
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/WorkoutSessions/${editingSession.workoutSessionId}`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            } else {
                // Mode création - POST request
                await axios.post(`${import.meta.env.VITE_API_URL}/api/WorkoutSessions`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            loadWorkoutSessions(); // Recharger la liste
            setIsModalOpen(false);
            setEditingSession(null);
        } catch (error) {
            console.error('Error saving workout:', error);
            alert(`Erreur lors de ${editingSession ? 'la modification' : 'la création'} de la session`);
        }
    };


    const filteredSessions = sessions.filter(session => {
        return session.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'status-badge-active';
            case 'draft':
                return 'status-badge-draft';
            case 'archived':
                return 'status-badge-archived';
            default:
                return 'status-badge-draft';
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Upper Body': '#667eea',
            'Lower Body': '#764ba2',
            'Core': '#f093fb',
            'Cardio': '#fa709a',
            'Flexibility': '#4facfe',
            'Full Body': '#43e97b'
        };
        return colors[category] || '#667eea';
    };

    return (
        <MainLayout>
            <div className="workout-sessions-page">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Workout Sessions</h1>
                        <p>Manage your workout programs and training sessions</p>
                    </div>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        New Workout
                    </button>
                </div>

                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search workouts by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading workout sessions...</p>
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <div className="empty-state">
                        <Dumbbell size={64} />
                        <h3>No workout sessions found</h3>
                        <p>Create your first workout session to get started</p>
                        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                            <Plus size={20} />
                            Create Workout Session
                        </button>
                    </div>
                ) : (
                    <div className="sessions-grid">
                        {filteredSessions.map(session => (
                            <div key={session.workoutSessionId} className="session-card">
                                <div
                                    className="session-cover"
                                    style={{
                                        backgroundImage: session.coverImageUrl
                                            ? `url(${session.coverImageUrl.startsWith('http') ? session.coverImageUrl : `${import.meta.env.VITE_API_URL}${session.coverImageUrl}`})`
                                            : `linear-gradient(135deg, ${getCategoryColor(session.category)} 0%, ${getCategoryColor(session.category)}dd 100%)`
                                    }}
                                >
                                    <div className="session-overlay">
                                        <span
                                            className="category-badge"
                                            style={{ backgroundColor: getCategoryColor(session.category) }}
                                        >
                                            {session.category}
                                        </span>
                                        <span className={`status-badge ${getStatusBadgeClass(session.status)}`}>
                                            {session.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="session-content">
                                    <h3>{session.name}</h3>
                                    {session.description && (
                                        <p className="session-description">{session.description}</p>
                                    )}

                                    <div className="session-meta">
                                        <div className="meta-item">
                                            <Dumbbell size={16} />
                                            <span>{session.exerciseCount} Exercises</span>
                                        </div>
                                        {session.startDate && (
                                            <div className="meta-item">
                                                <Calendar size={16} />
                                                <span>{new Date(session.startDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="session-actions">
                                        <button
                                            className="btn-secondary"
                                            onClick={() => handleEditSession(session)}
                                        >
                                            View
                                        </button>
                                        <button
                                            className={`btn-assign ${isAllClientsAssigned(session) ? 'disabled' : ''}`}
                                            onClick={() => {
                                                if (!isAllClientsAssigned(session)) {
                                                    setSelectedSessionForAssignment(session.workoutSessionId);
                                                    setIsAssignModalOpen(true);
                                                }
                                            }}
                                            disabled={isAllClientsAssigned(session)}
                                            title={isAllClientsAssigned(session) ? 'Tous les clients sont déjà assignés à cette session' : 'Assigner des clients à cette session'}
                                        >
                                            <Users size={18} />
                                            Assigner
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateWorkoutModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingSession(null);
                }}
                onSave={handleCreateWorkout}
                exercises={exercises}
                editingSession={editingSession}
            />

            {selectedSessionForAssignment && (
                <AssignClientsModal
                    isOpen={isAssignModalOpen}
                    onClose={() => {
                        setIsAssignModalOpen(false);
                        setSelectedSessionForAssignment(null);
                    }}
                    workoutSessionId={selectedSessionForAssignment}
                    onAssignmentComplete={() => {
                        loadWorkoutSessions();
                    }}
                />
            )}
        </MainLayout>
    );
};

export default WorkoutSessionsPage;
