import { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';
import type { AssignedClient } from '../types';
import { clientService } from '../services/client.service';
import { workoutSessionService } from '../services/workoutSession.service';
import { scheduledWorkoutSessionService } from '../services/scheduledWorkoutSession.service';
import { nextMonday } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import './AssignClientsModal.css';

interface AssignClientsModalProps {
    isOpen: boolean;
    onClose: () => void;
    workoutSessionId: number;
    onAssignmentComplete: () => void;
}

const AssignClientsModal = ({ isOpen, onClose, workoutSessionId, onAssignmentComplete }: AssignClientsModalProps) => {
    const [allClients, setAllClients] = useState<AssignedClient[]>([]);
    const [selectedClients, setSelectedClients] = useState<AssignedClient[]>([]);
    const [initiallyAssignedIds, setInitiallyAssignedIds] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [hoveredClient, setHoveredClient] = useState<AssignedClient | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (isOpen) {
            loadClients();
            loadAssignedClients();
        }
    }, [isOpen, workoutSessionId]);

    const loadClients = async () => {
        try {
            setLoading(true);
            const clients = await clientService.getMyClients();
            setAllClients(clients);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAssignedClients = async () => {
        try {
            const assigned = await workoutSessionService.getAssignedClients(workoutSessionId);
            setSelectedClients(assigned);
            // Track initially assigned client IDs to prevent deselection
            setInitiallyAssignedIds(new Set(assigned.map(c => c.adherentId)));
        } catch (error) {
            console.error('Error loading assigned clients:', error);
        }
    };

    const isInitiallyAssigned = (adherentId: number) => {
        return initiallyAssignedIds.has(adherentId);
    };

    const handleClientToggle = (client: AssignedClient) => {
        // Prevent deselection of initially assigned clients
        if (isInitiallyAssigned(client.adherentId)) {
            toast.error('Ce client est déjà assigné et ne peut pas être désassigné', {
                duration: 3000,
                position: 'top-center',
            });
            return;
        }

        const isSelected = selectedClients.some(c => c.adherentId === client.adherentId);
        if (isSelected) {
            setSelectedClients(selectedClients.filter(c => c.adherentId !== client.adherentId));
        } else {
            setSelectedClients([...selectedClients, client]);
        }
    };

    const handleRemoveClient = (adherentId: number) => {
        // Prevent removal of initially assigned clients
        if (isInitiallyAssigned(adherentId)) {
            toast.error('Ce client est déjà assigné et ne peut pas être désassigné', {
                duration: 3000,
                position: 'top-center',
            });
            return;
        }
        setSelectedClients(selectedClients.filter(c => c.adherentId !== adherentId));
    };

    const handleAssign = async () => {
        try {
            setLoading(true);
            const adherentIds = selectedClients.map(c => c.adherentId);
            await workoutSessionService.assignClients(workoutSessionId, adherentIds);

            // Schedule sessions for NEWLY assigned clients
            const newAssignments = selectedClients.filter(c => !isInitiallyAssigned(c.adherentId));

            if (newAssignments.length > 0) {
                // Calculate start date: Next Monday
                const today = new Date();
                const nextMondayDate = nextMonday(today);

                // Schedule for each new client
                const schedulePromises = newAssignments.map(client =>
                    scheduledWorkoutSessionService.bulkScheduleSessions(
                        workoutSessionId,
                        client.adherentId,
                        nextMondayDate,
                        2 // Default: 2 sessions per week as requested
                    )
                );

                await Promise.all(schedulePromises);

                toast.success(`Session assignée et planifiée pour ${newAssignments.length} client(s)!`, {
                    duration: 4000,
                    position: 'top-center',
                    icon: '✅',
                });
            }

            onAssignmentComplete();
            onClose();
        } catch (error) {
            console.error('Error assigning clients:', error);
            toast.error('Erreur lors de l\'assignation des clients', {
                duration: 4000,
                position: 'top-center',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMouseEnter = (client: AssignedClient, event: React.MouseEvent) => {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setTooltipPosition({
            x: rect.right + 10,
            y: rect.top
        });
        setHoveredClient(client);
    };

    const handleMouseLeave = () => {
        setHoveredClient(null);
    };

    const filteredClients = allClients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isClientSelected = (adherentId: number) => {
        return selectedClients.some(c => c.adherentId === adherentId);
    };

    if (!isOpen) return null;

    return (
        <>
            <Toaster />
            <div className="modal-overlay" onClick={onClose}>
                <div className="assign-clients-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Assigner des clients</h2>
                        <button className="close-button" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="modal-body">
                        {/* Selected Clients Tags */}
                        {selectedClients.length > 0 && (
                            <div className="selected-clients-tags">
                                {selectedClients.map(client => (
                                    <div
                                        key={client.adherentId}
                                        className={`client-tag ${isInitiallyAssigned(client.adherentId) ? 'disabled' : ''}`}
                                    >
                                        {client.profilePicture ? (
                                            <img
                                                src={client.profilePicture.startsWith('http')
                                                    ? client.profilePicture
                                                    : `${import.meta.env.VITE_API_URL}${client.profilePicture}`}
                                                alt={client.name}
                                                className="tag-avatar"
                                            />
                                        ) : (
                                            <div className="tag-avatar-placeholder">
                                                <User size={16} />
                                            </div>
                                        )}
                                        <span>{client.name}</span>
                                        {!isInitiallyAssigned(client.adherentId) && (
                                            <button
                                                className="remove-tag"
                                                onClick={() => handleRemoveClient(client.adherentId)}
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher un client..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Clients List */}
                        <div className="clients-list">
                            {loading ? (
                                <div className="loading-state">Chargement...</div>
                            ) : filteredClients.length === 0 ? (
                                <div className="empty-state">Aucun client trouvé</div>
                            ) : (
                                filteredClients.map(client => {
                                    const isAssigned = isInitiallyAssigned(client.adherentId);
                                    return (
                                        <div
                                            key={client.adherentId}
                                            className={`client-item ${isClientSelected(client.adherentId) ? 'selected' : ''} ${isAssigned ? 'disabled' : ''}`}
                                            onClick={() => handleClientToggle(client)}
                                            onMouseEnter={(e) => handleMouseEnter(client, e)}
                                            onMouseLeave={handleMouseLeave}
                                            title={isAssigned ? 'Ce client est déjà assigné' : ''}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isClientSelected(client.adherentId)}
                                                onChange={() => { }}
                                                className="client-checkbox"
                                                disabled={isAssigned}
                                            />
                                            <span className="client-name">{client.name}</span>
                                            {client.profilePicture ? (
                                                <img
                                                    src={client.profilePicture.startsWith('http')
                                                        ? client.profilePicture
                                                        : `${import.meta.env.VITE_API_URL}${client.profilePicture}`}
                                                    alt={client.name}
                                                    className="client-avatar"
                                                />
                                            ) : (
                                                <div className="client-avatar-placeholder">
                                                    <User size={20} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn-secondary" onClick={onClose} disabled={loading}>
                            Annuler
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleAssign}
                            disabled={loading || selectedClients.length === 0}
                        >
                            {loading ? 'Assignation...' : 'Assigner'}
                        </button>
                    </div>

                    {/* Tooltip */}
                    {hoveredClient && (
                        <div
                            className="client-tooltip"
                            style={{
                                left: `${tooltipPosition.x}px`,
                                top: `${tooltipPosition.y}px`
                            }}
                        >
                            <h4>{hoveredClient.name}</h4>
                            {hoveredClient.age && <p><strong>Âge:</strong> {hoveredClient.age} ans</p>}
                            <p><strong>Email:</strong> {hoveredClient.email}</p>
                            {hoveredClient.phoneNumber && (
                                <p><strong>Téléphone:</strong> {hoveredClient.phoneNumber}</p>
                            )}
                            {hoveredClient.goal && (
                                <p><strong>Objectif:</strong> {hoveredClient.goal}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AssignClientsModal;
