import { useState, useEffect, useRef } from 'react';
import {
    Plus, Search, Dumbbell, MoreVertical, Power, Copy, Trash2,
    Activity, Heart, ChevronsUp, Move
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import CreateWorkoutModal from '../components/CreateWorkoutModal';
import Pagination from '../components/common/Pagination';
import './WorkoutSessionsPage.css';
import axios from 'axios';

interface WorkoutExerciseDto {
    exerciseTemplateId: number;
    exerciseName: string;
    exerciseCategory?: string;
    orderIndex: number;
    sets: number;
    reps: number;
    restSeconds: number;
}

interface WorkoutSession {
    workoutSessionId: number;
    name: string;
    description?: string;
    category: string;
    status: string;
    startDate?: string;
    endDate?: string;
    exerciseCount: number;
    createdAt: string;
    updatedAt?: string;
    duration?: number;
    muscleGroups?: string[];
    assignedClientsCount?: number;
    exercises?: WorkoutExerciseDto[];
}

interface Exercise {
    exerciseTemplateId: number;
    name: string;
    category: string;
}

// ──────────────────────────────────────────────────────────
// Muscle group → icon + color mapping (used for the row leading icons)
// ──────────────────────────────────────────────────────────
const MUSCLE_VISUAL: Record<string, { Icon: any; bg: string; fg: string; label: string }> = {
    'Pectoraux':   { Icon: Heart,      bg: '#fee2e2', fg: '#dc2626', label: 'Pectoraux' },
    'Dos':         { Icon: ChevronsUp, bg: '#dbeafe', fg: '#2563eb', label: 'Dos' },
    'Épaules':     { Icon: Move,       bg: '#fef3c7', fg: '#d97706', label: 'Épaules' },
    'Bras':        { Icon: Dumbbell,   bg: '#ede9fe', fg: '#7c3aed', label: 'Bras' },
    'Jambes':      { Icon: Activity,   bg: '#d1fae5', fg: '#059669', label: 'Jambes' },
    'Core':        { Icon: Activity,   bg: '#fce7f3', fg: '#db2777', label: 'Core' },
    'Cardio':      { Icon: Heart,      bg: '#ffe4e6', fg: '#e11d48', label: 'Cardio' },
    'Flexibility': { Icon: Move,       bg: '#e0e7ff', fg: '#4f46e5', label: 'Flexibility' },
    'Other':       { Icon: Dumbbell,   bg: '#f3f4f6', fg: '#6b7280', label: 'Autre' },
};

const getMuscleVisual = (group?: string) =>
    (group && MUSCLE_VISUAL[group]) || MUSCLE_VISUAL['Other'];

const WorkoutSessionsPage = () => {
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [muscleFilter, setMuscleFilter] = useState<string>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Close kebab menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        if (openMenuId !== null) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [openMenuId]);

    useEffect(() => {
        loadWorkoutSessions();
        loadExercises();
    }, []);

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

    // ──────────────────────────────────────────────────────
    // CRUD actions
    // ──────────────────────────────────────────────────────

    const handleEditSession = async (session: WorkoutSession) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/WorkoutSessions/${session.workoutSessionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingSession(response.data);
            setModalMode('edit');
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error loading session details:', error);
            setEditingSession(session);
            setModalMode('edit');
            setIsModalOpen(true);
        }
    };

    const handleNewWorkout = () => {
        setEditingSession(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleDuplicate = async (session: WorkoutSession) => {
        setOpenMenuId(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/WorkoutSessions/${session.workoutSessionId}/duplicate-draft`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // workoutSessionId = 0 → modal will treat as new on save (POST not PUT)
            setEditingSession({ ...response.data, workoutSessionId: 0 });
            setModalMode('duplicate');
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error duplicating workout:', error);
            alert('Impossible de dupliquer la session');
        }
    };

    const handleToggleStatus = async (session: WorkoutSession) => {
        setOpenMenuId(null);
        const newStatus = session.status === 'Active' ? 'Draft' : 'Active';
        try {
            const token = localStorage.getItem('authToken');
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/WorkoutSessions/${session.workoutSessionId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadWorkoutSessions();
        } catch (error: any) {
            const msg = error?.response?.data?.message
                || 'Impossible de changer le statut de cette session';
            alert(msg);
        }
    };

    const handleDelete = async (session: WorkoutSession) => {
        setOpenMenuId(null);
        if (!confirm(`Supprimer définitivement la session "${session.name}" ?`)) return;
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/WorkoutSessions/${session.workoutSessionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadWorkoutSessions();
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Impossible de supprimer cette session';
            alert(msg);
        }
    };

    const handleSaveWorkout = async (workoutData: any) => {
        try {
            const token = localStorage.getItem('authToken');
            const formData = new FormData();
            formData.append('name', workoutData.name);
            formData.append('category', workoutData.category || 'General');
            formData.append('status', workoutData.status || 'Active');
            formData.append('exercises', JSON.stringify(workoutData.exercises));
            if (workoutData.duration) formData.append('duration', workoutData.duration.toString());

            // Edit only when we have a real existing id (modalMode === 'edit')
            const isEdit = modalMode === 'edit'
                && editingSession
                && editingSession.workoutSessionId > 0;

            if (isEdit) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/WorkoutSessions/${editingSession!.workoutSessionId}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/WorkoutSessions`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
                );
            }

            loadWorkoutSessions();
            setIsModalOpen(false);
            setEditingSession(null);
            setModalMode('create');
        } catch (error) {
            console.error('Error saving workout:', error);
            alert(`Erreur lors de ${modalMode === 'edit' ? 'la modification' : 'la création'} de la session`);
        }
    };

    // ──────────────────────────────────────────────────────
    // Filtering & helpers
    // ──────────────────────────────────────────────────────

    const filteredSessions = sessions.filter(s => {
        if (!s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (statusFilter !== 'All' && s.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
        if (muscleFilter !== 'All' && !(s.muscleGroups || []).includes(muscleFilter)) return false;
        return true;
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const pageStart = (safePage - 1) * pageSize;
    const paginatedSessions = filteredSessions.slice(pageStart, pageStart + pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, muscleFilter, pageSize]);

    const formatRelativeDate = (iso?: string) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <MainLayout>
            <div className="ws-page">
                <div className="ws-header">
                    <div>
                        <h1>Workouts</h1>
                        <p>Créez et gérez vos programmes d'entraînement</p>
                    </div>
                    <button className="ws-btn-primary" onClick={handleNewWorkout}>
                        <Plus size={18} />
                        Nouveau Workout
                    </button>
                </div>

                <div className="ws-toolbar">
                    <div className="ws-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher des workouts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="ws-filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">Statut: Tous</option>
                        <option value="Active">Actif</option>
                        <option value="Draft">Brouillon</option>
                        <option value="Archived">Archivé</option>
                    </select>
                    <select
                        className="ws-filter-select"
                        value={muscleFilter}
                        onChange={(e) => setMuscleFilter(e.target.value)}
                    >
                        <option value="All">Groupe musculaire: Tous</option>
                        {Object.keys(MUSCLE_VISUAL).map(g => (
                            <option key={g} value={g}>{MUSCLE_VISUAL[g].label}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="ws-loading">
                        <div className="ws-spinner" />
                        <p>Chargement…</p>
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <div className="ws-empty">
                        <Dumbbell size={56} />
                        <h3>Aucune workout trouvée</h3>
                        <p>Créez votre première session pour commencer</p>
                        <button className="ws-btn-primary" onClick={handleNewWorkout}>
                            <Plus size={18} />
                            Créer une session
                        </button>
                    </div>
                ) : (
                    <div className="ws-table-wrap">
                        <table className="ws-table">
                            <thead>
                                <tr>
                                    <th>Workout</th>
                                    <th className="ws-col-num">Exercices</th>
                                    <th>Groupes musculaires</th>
                                    <th>Statut</th>
                                    <th>Mise à jour</th>
                                    <th className="ws-col-actions" />
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSessions.map((session, rowIndex) => {
                                    const groups = session.muscleGroups || [];
                                    const primary = getMuscleVisual(groups[0]);
                                    const PrimaryIcon = primary.Icon;
                                    const visibleGroups = groups.slice(0, 3);
                                    const extraCount = Math.max(0, groups.length - visibleGroups.length);
                                    const isAssigned = (session.assignedClientsCount || 0) > 0;
                                    const isMenuOpen = openMenuId === session.workoutSessionId;
                                    const flipMenu = paginatedSessions.length > 2
                                        && rowIndex >= paginatedSessions.length - 2;

                                    return (
                                        <tr key={session.workoutSessionId} onClick={() => handleEditSession(session)}>
                                            <td>
                                                <div className="ws-workout-cell">
                                                    <div
                                                        className="ws-icon-stack"
                                                        title={groups.join(', ')}
                                                    >
                                                        {/* Primary icon */}
                                                        <span
                                                            className="ws-muscle-icon"
                                                            style={{ background: primary.bg, color: primary.fg }}
                                                        >
                                                            <PrimaryIcon size={18} />
                                                        </span>
                                                        {/* Secondary mini-icons */}
                                                        {groups.slice(1, 3).map((g, idx) => {
                                                            const v = getMuscleVisual(g);
                                                            const VIcon = v.Icon;
                                                            return (
                                                                <span
                                                                    key={`${g}-${idx}`}
                                                                    className="ws-muscle-icon-mini"
                                                                    style={{ background: v.bg, color: v.fg }}
                                                                >
                                                                    <VIcon size={11} />
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="ws-workout-text">
                                                        <span className="ws-workout-name">{session.name}</span>
                                                        <span className="ws-workout-sub">
                                                            {session.category && session.category !== 'General'
                                                                ? session.category
                                                                : (groups[0] || 'Multi-groupes')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="ws-col-num">
                                                <span className="ws-muted">{session.exerciseCount} exercices</span>
                                            </td>
                                            <td>
                                                <div className="ws-chips">
                                                    {visibleGroups.length === 0 && (
                                                        <span className="ws-chip ws-chip-empty">—</span>
                                                    )}
                                                    {visibleGroups.map(g => (
                                                        <span key={g} className="ws-chip">{MUSCLE_VISUAL[g]?.label || g}</span>
                                                    ))}
                                                    {extraCount > 0 && (
                                                        <span className="ws-chip ws-chip-more">+{extraCount}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`ws-status ws-status-${(session.status || '').toLowerCase()}`}>
                                                    <span className="ws-status-dot" />
                                                    {session.status === 'Active' ? 'Actif'
                                                        : session.status === 'Draft' ? 'Brouillon'
                                                            : session.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="ws-date-cell">
                                                    <span>{formatRelativeDate(session.updatedAt || session.createdAt)}</span>
                                                    {isAssigned && (
                                                        <span className="ws-date-sub">
                                                            {session.assignedClientsCount} client{(session.assignedClientsCount || 0) > 1 ? 's' : ''} assigné{(session.assignedClientsCount || 0) > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td
                                                className="ws-col-actions"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="ws-action-wrap" ref={isMenuOpen ? menuRef : null}>
                                                    <button
                                                        className="ws-kebab-btn"
                                                        onClick={() => setOpenMenuId(isMenuOpen ? null : session.workoutSessionId)}
                                                        aria-label="Actions"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {isMenuOpen && (
                                                        <div className={`ws-action-menu ${flipMenu ? 'flip-up' : ''}`}>
                                                            <button
                                                                className="ws-menu-item"
                                                                onClick={() => handleToggleStatus(session)}
                                                                disabled={isAssigned && session.status === 'Active'}
                                                                title={
                                                                    isAssigned && session.status === 'Active'
                                                                        ? 'Cette session est assignée à un ou plusieurs clients'
                                                                        : ''
                                                                }
                                                            >
                                                                <Power size={15} />
                                                                {session.status === 'Active' ? 'Désactiver' : 'Activer'}
                                                            </button>
                                                            <button
                                                                className="ws-menu-item"
                                                                onClick={() => handleDuplicate(session)}
                                                            >
                                                                <Copy size={15} />
                                                                Dupliquer
                                                            </button>
                                                            <div className="ws-menu-sep" />
                                                            <button
                                                                className="ws-menu-item ws-menu-item-danger"
                                                                onClick={() => handleDelete(session)}
                                                                disabled={isAssigned}
                                                                title={
                                                                    isAssigned
                                                                        ? 'Cette session est assignée à un ou plusieurs clients'
                                                                        : ''
                                                                }
                                                            >
                                                                <Trash2 size={15} />
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <Pagination
                            page={safePage}
                            pageCount={totalPages}
                            pageSize={pageSize}
                            totalItems={filteredSessions.length}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    </div>
                )}
            </div>

            <CreateWorkoutModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingSession(null);
                    setModalMode('create');
                }}
                onSave={handleSaveWorkout}
                exercises={exercises}
                editingSession={editingSession as any}
            />
        </MainLayout>
    );
};

export default WorkoutSessionsPage;
