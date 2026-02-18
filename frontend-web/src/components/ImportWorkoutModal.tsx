
import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, Dumbbell } from 'lucide-react';
import type { WorkoutSession } from '../types';

interface ImportWorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectWorkout: (workout: WorkoutSession) => void;
}

const ImportWorkoutModal = ({ isOpen, onClose, onSelectWorkout }: ImportWorkoutModalProps) => {
    const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadWorkouts();
        }
    }, [isOpen]);

    const loadWorkouts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/WorkoutSessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter only active sessions
            const activeSessions = response.data.filter((session: WorkoutSession) => session.status === 'Active');
            setWorkouts(activeSessions);
        } catch (error) {
            console.error('Error loading workouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWorkouts = workouts.filter(workout =>
        workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (workout.category && workout.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
                <div className="modal-header">
                    <h2>Importer une séance</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="search-box" style={{ marginBottom: '1rem' }}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher une séance..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="loading-state">Chargement...</div>
                    ) : (
                        <div className="workouts-list" style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {filteredWorkouts.length === 0 ? (
                                <div className="empty-state">Aucune séance trouvée</div>
                            ) : (
                                filteredWorkouts.map(workout => (
                                    <div
                                        key={workout.workoutSessionId}
                                        className="workout-item"
                                        style={{
                                            padding: '1rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            transition: 'background 0.2s'
                                        }}
                                        onClick={() => onSelectWorkout(workout)}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            background: '#f3f4f6',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#667eea'
                                        }}>
                                            <Dumbbell size={20} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>{workout.name}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                {workout.category} • {workout.duration || '?'} min • {workout.exerciseCount} exc.
                                            </div>
                                        </div>
                                        <button className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                                            Sélectionner
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportWorkoutModal;
