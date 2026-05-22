import React, { useState, useEffect, useCallback } from 'react';
import { Users, ChevronRight, Search, UserCheck, PauseCircle, UserX, Edit3, Apple, FileText, Camera, BarChart2, CalendarDays } from 'lucide-react';
import { clientService } from '../services/client.service';
import type { ClientSummary, ClientProfile, CreateMacroPlanRequest } from '../services/client.service';
import MainLayout from '../components/layout/MainLayout';
import MacroPieChart from '../components/clients/MacroPieChart';
import ClientCalendar from '../components/clients/ClientCalendar';
import toast from 'react-hot-toast';
import './ClientsPage.css';

type StatusTab = 'all' | 'Active' | 'Paused' | 'Inactive';

const STATUS_TABS: { key: StatusTab; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'all', label: 'Tous', icon: Users, color: '#6366f1' },
    { key: 'Active', label: 'Actifs', icon: UserCheck, color: '#34d399' },
    { key: 'Paused', label: 'En Pause', icon: PauseCircle, color: '#fbbf24' },
    { key: 'Inactive', label: 'Inactifs', icon: UserX, color: '#f87171' },
];


const WORK_NATURE_LABELS: Record<string, string> = {
    Sedentary: 'Sédentaire (bureau)',
    LightActivity: 'Légèrement actif',
    ModerateActivity: 'Modérément actif',
    ActiveWork: 'Travail physique',
    VeryActive: 'Très physique',
};

const GOAL_LABELS: Record<string, string> = {
    WeightLoss: '🔥 Perte de poids',
    MuscleGain: '💪 Prise de masse',
    Maintenance: '⚖️ Maintien',
    Endurance: '🏃 Endurance',
    Flexibility: '🧘 Flexibilité',
};

const ClientsPage: React.FC = () => {
    const [statusTab, setStatusTab] = useState<StatusTab>('all');
    const [search, setSearch] = useState('');
    const [clients, setClients] = useState<ClientSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [showMacroForm, setShowMacroForm] = useState(false);
    const [macroForm, setMacroForm] = useState({ calories: 2000, protein: 150, carbs: 200, fat: 65, notes: '' });
    const [savingMacro, setSavingMacro] = useState(false);

    const loadClients = useCallback(async () => {
        setLoading(true);
        try {
            const status = statusTab === 'all' ? undefined : statusTab;
            const data = await clientService.getMyClients(status);
            setClients(data);
        } catch {
            toast.error('Erreur lors du chargement des clients');
        } finally {
            setLoading(false);
        }
    }, [statusTab]);

    useEffect(() => { loadClients(); }, [loadClients]);

    const loadProfile = useCallback(async (coachClientId: number) => {
        setProfileLoading(true);
        setProfile(null);
        try {
            const data = await clientService.getClientProfile(coachClientId);
            setProfile(data);
            if (data.currentMacroPlan) {
                setMacroForm({
                    calories: data.currentMacroPlan.calories,
                    protein: data.currentMacroPlan.proteinGrams,
                    carbs: data.currentMacroPlan.carbsGrams,
                    fat: data.currentMacroPlan.fatGrams,
                    notes: data.currentMacroPlan.notes ?? '',
                });
            }
        } catch {
            toast.error('Erreur lors du chargement du profil');
        } finally {
            setProfileLoading(false);
        }
    }, []);

    const handleSelectClient = (coachClientId: number) => {
        setSelectedId(coachClientId);
        loadProfile(coachClientId);
    };

    const handleStatusChange = async (coachClientId: number, newStatus: string) => {
        try {
            await clientService.updateClientStatus(coachClientId, newStatus);
            toast.success('Statut mis à jour');
            loadClients();
            if (selectedId === coachClientId) loadProfile(coachClientId);
        } catch {
            toast.error('Erreur lors de la mise à jour du statut');
        }
    };

    const handleSaveMacros = async () => {
        if (!selectedId) return;
        setSavingMacro(true);
        try {
            const req: CreateMacroPlanRequest = {
                coachClientId: selectedId,
                calories: macroForm.calories,
                proteinGrams: macroForm.protein,
                carbsGrams: macroForm.carbs,
                fatGrams: macroForm.fat,
                notes: macroForm.notes || undefined,
            };
            await clientService.createMacroPlan(req);
            toast.success('Plan de macros enregistré !');
            setShowMacroForm(false);
            loadProfile(selectedId);
        } catch {
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setSavingMacro(false);
        }
    };

    const filtered = clients.filter(c =>
        c.adherentName.toLowerCase().includes(search.toLowerCase()) ||
        (c.adherentEmail ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const counts = {
        all: clients.length,
        Active: clients.filter(c => c.status === 'Active').length,
        Paused: clients.filter(c => c.status === 'Paused').length,
        Inactive: clients.filter(c => c.status === 'Inactive').length,
    };

    const statusBadgeClass = (s: string) => {
        if (s === 'Active') return 'badge badge--active';
        if (s === 'Paused') return 'badge badge--paused';
        return 'badge badge--inactive';
    };

    const statusLabel = (s: string) => {
        if (s === 'Active') return 'Actif';
        if (s === 'Paused') return 'En Pause';
        if (s === 'Inactive') return 'Inactif';
        return s;
    };

    return (
        <MainLayout>
            <div className="clients-page">
                {/* ── LEFT PANEL ── */}
                <div className="clients-list-panel">
                    <div className="clients-list-header">
                        <div className="clients-list-title">
                            <h1>Clients <span className="clients-count">{clients.length}</span></h1>
                        </div>
                        <div className="clients-search">
                            <Search size={15} />
                            <input
                                type="text"
                                placeholder="Rechercher un client..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Status tabs */}
                    <div className="status-tabs">
                        {STATUS_TABS.map(tab => (
                            <button
                                key={tab.key}
                                className={`status-tab ${statusTab === tab.key ? 'status-tab--active' : ''}`}
                                style={statusTab === tab.key ? { '--tab-color': tab.color } as React.CSSProperties : {}}
                                onClick={() => setStatusTab(tab.key)}
                            >
                                <tab.icon size={13} />
                                {tab.label}
                                <span className="status-tab-count">{counts[tab.key]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Client rows */}
                    <div className="clients-list">
                        {loading ? (
                            <div className="clients-list-loading">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="client-row-skeleton" />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="clients-empty">
                                <Users size={40} />
                                <p>Aucun client trouvé</p>
                            </div>
                        ) : (
                            filtered.map(client => (
                                <div
                                    key={client.coachClientId}
                                    className={`client-row ${selectedId === client.coachClientId ? 'client-row--selected' : ''}`}
                                    onClick={() => handleSelectClient(client.coachClientId)}
                                >
                                    <div className="client-row-avatar">
                                        {client.profilePicture ? (
                                            <img src={client.profilePicture} alt={client.adherentName} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {client.adherentName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className={`status-dot status-dot--${client.status.toLowerCase()}`} />
                                    </div>
                                    <div className="client-row-info">
                                        <div className="client-row-name">{client.adherentName}</div>
                                        <div className="client-row-meta">
                                            {client.age && <span>{client.age} ans</span>}
                                            {client.goalSummary && <span>· {client.goalSummary}</span>}
                                        </div>
                                    </div>
                                    <div className="client-row-right">
                                        <span className={statusBadgeClass(client.status)}>
                                            {statusLabel(client.status)}
                                        </span>
                                        {client.lastWeight && (
                                            <span className="client-weight">{client.lastWeight} kg</span>
                                        )}
                                        <ChevronRight size={14} className="client-row-arrow" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── RIGHT PANEL – Profile ── */}
                {selectedId ? (
                    <div className="client-profile-panel">
                        {profileLoading ? (
                            <div className="profile-loading">
                                <div className="profile-skeleton-header" />
                                <div className="profile-skeleton-body" />
                            </div>
                        ) : profile ? (
                            <>
                                {/* Profile Header */}
                                <div className="profile-header">
                                    <div className="profile-header-avatar">
                                        {profile.adherent.profilePicture ? (
                                            <img src={profile.adherent.profilePicture} alt={profile.adherent.name} />
                                        ) : (
                                            <div className="avatar-placeholder avatar-placeholder--lg">
                                                {profile.adherent.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-header-info">
                                        <h2>{profile.adherent.name}</h2>
                                        <p>{profile.adherent.email}</p>
                                        <div className="profile-header-badges">
                                            <span className={statusBadgeClass(profile.status)}>
                                                {statusLabel(profile.status)}
                                            </span>
                                            {profile.adherent.goalType && (
                                                <span className="badge badge--goal">
                                                    {GOAL_LABELS[profile.adherent.goalType] ?? profile.adherent.goalType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Status quick-change */}
                                    <div className="profile-header-actions">
                                        {profile.status !== 'Active' && (
                                            <button className="btn btn--ghost" onClick={() => handleStatusChange(selectedId, 'Active')}>
                                                <UserCheck size={14} /> Activer
                                            </button>
                                        )}
                                        {profile.status !== 'Paused' && (
                                            <button className="btn btn--ghost" onClick={() => handleStatusChange(selectedId, 'Paused')}>
                                                <PauseCircle size={14} /> Pause
                                            </button>
                                        )}
                                        {profile.status !== 'Inactive' && (
                                            <button className="btn btn--ghost btn--danger" onClick={() => handleStatusChange(selectedId, 'Inactive')}>
                                                <UserX size={14} /> Inactif
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Stats strip */}
                                <div className="profile-stats-strip">
                                    {profile.adherent.height && (
                                        <div className="stat-chip">
                                            <span className="stat-chip-label">Taille</span>
                                            <span className="stat-chip-value">{profile.adherent.height} cm</span>
                                        </div>
                                    )}
                                    {profile.adherent.initialWeight && (
                                        <div className="stat-chip">
                                            <span className="stat-chip-label">Poids initial</span>
                                            <span className="stat-chip-value">{profile.adherent.initialWeight} kg</span>
                                        </div>
                                    )}
                                    {profile.adherent.age && (
                                        <div className="stat-chip">
                                            <span className="stat-chip-label">Age</span>
                                            <span className="stat-chip-value">{profile.adherent.age} ans</span>
                                        </div>
                                    )}
                                    {profile.adherent.gender && (
                                        <div className="stat-chip">
                                            <span className="stat-chip-label">Sexe</span>
                                            <span className="stat-chip-value">{profile.adherent.gender}</span>
                                        </div>
                                    )}
                                    {profile.adherent.workNature && (
                                        <div className="stat-chip">
                                            <span className="stat-chip-label">Travail</span>
                                            <span className="stat-chip-value">
                                                {WORK_NATURE_LABELS[profile.adherent.workNature] ?? profile.adherent.workNature}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* ── All sections at once ── */}
                                <div className="profile-body-grid">

                                    {/* LEFT COLUMN — Aperçu + Plan Nutritionnel */}
                                    <div className="profile-col">

                                        {/* Aperçu */}
                                        <div className="profile-section">
                                            <div className="section-header">
                                                <h3><FileText size={13} /> Aperçu</h3>
                                            </div>
                                            {profile.adherent.intakePhotos.length === 0 ? (
                                                <div className="no-photos">
                                                    <Camera size={24} />
                                                    <p>Aucune photo de souscription</p>
                                                </div>
                                            ) : (
                                                <div className="intake-photos-grid">
                                                    {profile.adherent.intakePhotos.map(p => (
                                                        <div key={p.intakePhotoId} className="intake-photo-card">
                                                            <img src={p.photoUrl} alt={p.photoType} />
                                                            <span className="intake-photo-label">{p.photoType}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {profile.notes && (
                                                <>
                                                    <h3 style={{ marginTop: '0.75rem' }}>Notes coaching</h3>
                                                    <p className="profile-notes">{profile.notes}</p>
                                                </>
                                            )}
                                        </div>

                                        {/* Macros */}
                                        <div className="profile-section">
                                            <div className="section-header">
                                                <h3><Apple size={13} /> Plan nutritionnel</h3>
                                                <button className="btn btn--sm" onClick={() => setShowMacroForm(!showMacroForm)}>
                                                    <Edit3 size={13} /> {showMacroForm ? 'Annuler' : 'Modifier'}
                                                </button>
                                            </div>
                                            {profile.currentMacroPlan ? (
                                                <>
                                                    <div className="chart-container" style={{ height: 220 }}>
                                                        <MacroPieChart macroPlan={profile.currentMacroPlan} />
                                                    </div>
                                                    <div className="macros-strip">
                                                        <div className="macro-chip macro-chip--protein">
                                                            <span className="macro-chip-label">Protéines</span>
                                                            <span className="macro-chip-value">{profile.currentMacroPlan.proteinGrams}g</span>
                                                        </div>
                                                        <div className="macro-chip macro-chip--carbs">
                                                            <span className="macro-chip-label">Glucides</span>
                                                            <span className="macro-chip-value">{profile.currentMacroPlan.carbsGrams}g</span>
                                                        </div>
                                                        <div className="macro-chip macro-chip--fat">
                                                            <span className="macro-chip-label">Lipides</span>
                                                            <span className="macro-chip-value">{profile.currentMacroPlan.fatGrams}g</span>
                                                        </div>
                                                    </div>
                                                    <p className="macros-since">
                                                        Actif depuis le {new Date(profile.currentMacroPlan.startDate).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </>
                                            ) : (
                                                <div className="no-macros">
                                                    <BarChart2 size={28} />
                                                    <p>Aucun plan de macros défini</p>
                                                    <button className="btn btn--primary" onClick={() => setShowMacroForm(true)}>
                                                        Créer un plan
                                                    </button>
                                                </div>
                                            )}
                                            {showMacroForm && (
                                                <div className="macro-form">
                                                    <h4>Nouveau plan de macros</h4>
                                                    <div className="macro-form-grid">
                                                        <label>
                                                            <span>Calories (kcal)</span>
                                                            <input type="number" value={macroForm.calories} min={500} max={6000}
                                                                onChange={e => setMacroForm(f => ({ ...f, calories: +e.target.value }))} />
                                                        </label>
                                                        <label>
                                                            <span>Protéines (g)</span>
                                                            <input type="number" value={macroForm.protein} min={0} max={600}
                                                                onChange={e => setMacroForm(f => ({ ...f, protein: +e.target.value }))} />
                                                        </label>
                                                        <label>
                                                            <span>Glucides (g)</span>
                                                            <input type="number" value={macroForm.carbs} min={0} max={800}
                                                                onChange={e => setMacroForm(f => ({ ...f, carbs: +e.target.value }))} />
                                                        </label>
                                                        <label>
                                                            <span>Lipides (g)</span>
                                                            <input type="number" value={macroForm.fat} min={0} max={400}
                                                                onChange={e => setMacroForm(f => ({ ...f, fat: +e.target.value }))} />
                                                        </label>
                                                    </div>
                                                    <label className="macro-form-notes">
                                                        <span>Notes</span>
                                                        <textarea value={macroForm.notes} rows={2}
                                                            onChange={e => setMacroForm(f => ({ ...f, notes: e.target.value }))}
                                                            placeholder="Consignes particulières..." />
                                                    </label>
                                                    <div className="macro-form-actions">
                                                        <button className="btn btn--primary" onClick={handleSaveMacros} disabled={savingMacro}>
                                                            {savingMacro ? 'Enregistrement...' : 'Enregistrer le plan'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    {/* RIGHT COLUMN — Calendrier pleine hauteur */}
                                    <div className="profile-col">
                                        <div className="profile-section profile-section--full">
                                            <div className="section-header">
                                                <h3><CalendarDays size={13} /> Calendrier</h3>
                                                <span className="section-sub">Séances &amp; repas planifiés</span>
                                            </div>
                                            <ClientCalendar adherentId={profile.adherent.adherentId} />
                                        </div>
                                    </div>
                                </div>

                            </>
                        ) : null}
                    </div>
                ) : (
                    <div className="client-profile-empty">
                        <Users size={52} />
                        <h3>Sélectionnez un client</h3>
                        <p>Cliquez sur un client pour voir son profil complet</p>
                    </div>
                )}
            </div>
        </MainLayout >
    );
};

export default ClientsPage;
