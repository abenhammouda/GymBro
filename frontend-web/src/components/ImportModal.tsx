import { useState, useEffect } from 'react';
import { X, Search, Dumbbell, UtensilsCrossed, Pill, ChevronRight, ChevronLeft } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type {
    WorkoutSession,
    ScheduledWorkoutSession,
    ScheduledMeal,
    MealTab,
    Meal,
} from '../types';
import type { ClientSummary } from '../services/client.service';
import { scheduledWorkoutSessionService } from '../services/scheduledWorkoutSession.service';
import { scheduledMealService } from '../services/scheduledMeal.service';
import { mealTabService } from '../services/mealTab.service';
import { mealService } from '../services/meal.service';
import { supplementSetService } from '../services/supplementSet.service';
import api from '../services/api';

type Step = 'select' | 'workout' | 'meal' | 'supplement';
type MealSubStep = 'pick' | 'date';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedClient: ClientSummary;
    currentDate: Date;
    scheduledSessions: ScheduledWorkoutSession[];
    scheduledMeals: ScheduledMeal[];
    onWorkoutImported: () => void;
    onMealImported: () => void;
}

const TIMING_LABELS: Record<string, string> = {
    PreMeal: 'Avant repas',
    PostMeal: 'Après repas',
    PreWorkout: 'Avant entraînement',
    PostWorkout: 'Après entraînement',
};

const ImportModal = ({
    isOpen,
    onClose,
    selectedClient,
    currentDate,
    scheduledSessions,
    scheduledMeals,
    onWorkoutImported,
    onMealImported,
}: ImportModalProps) => {
    const [step, setStep] = useState<Step>('select');

    // Workout step
    const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
    const [workoutSearch, setWorkoutSearch] = useState('');
    const [workoutLoading, setWorkoutLoading] = useState(false);

    // Meal step
    const [mealSubStep, setMealSubStep] = useState<MealSubStep>('pick');
    const [tabs, setTabs] = useState<MealTab[]>([]);
    const [selectedTabId, setSelectedTabId] = useState<number | null>(null);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [mealSearch, setMealSearch] = useState('');
    const [mealLoading, setMealLoading] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('12:00');

    // Supplement step
    const [supplementSets, setSupplementSets] = useState<any[]>([]);
    const [supplementLoading, setSupplementLoading] = useState(false);

    // Reset on open/close
    useEffect(() => {
        if (isOpen) {
            setStep('select');
            setWorkoutSearch('');
            setMealSearch('');
            setMealSubStep('pick');
            setSelectedMeal(null);
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            setScheduleDate(format(weekStart, 'yyyy-MM-dd'));
        }
    }, [isOpen, currentDate]);

    // Load workouts when entering workout step
    useEffect(() => {
        if (step === 'workout' && workouts.length === 0) {
            setWorkoutLoading(true);
            api.get('/WorkoutSessions')
                .then(r => setWorkouts(r.data.filter((s: WorkoutSession) => s.status === 'Active')))
                .catch(console.error)
                .finally(() => setWorkoutLoading(false));
        }
    }, [step]);

    // Load tabs when entering meal step
    useEffect(() => {
        if (step === 'meal' && tabs.length === 0) {
            setMealLoading(true);
            mealTabService.getAllTabs()
                .then(t => {
                    setTabs(t);
                    if (t.length > 0) setSelectedTabId(t[0].mealTabId);
                })
                .catch(console.error)
                .finally(() => setMealLoading(false));
        }
    }, [step]);

    // Load meals when tab changes
    useEffect(() => {
        if (selectedTabId == null) return;
        setMealLoading(true);
        mealService.getMealsByTab(selectedTabId)
            .then(setMeals)
            .catch(console.error)
            .finally(() => setMealLoading(false));
    }, [selectedTabId]);

    // Load supplements when entering supplement step
    useEffect(() => {
        if (step === 'supplement' && supplementSets.length === 0) {
            setSupplementLoading(true);
            supplementSetService.getAll()
                .then(setSupplementSets)
                .catch(console.error)
                .finally(() => setSupplementLoading(false));
        }
    }, [step]);

    const handleImportWorkout = async (workout: WorkoutSession) => {
        try {
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

            // Find the first day of the week that has no workout yet
            const targetDay = weekDays.find(day =>
                scheduledSessions.filter(s => isSameDay(new Date(s.scheduledDate), day)).length === 0
            ) ?? weekDays[0];

            const targetDate = new Date(targetDay);
            targetDate.setHours(12, 0, 0, 0);

            await scheduledWorkoutSessionService.createScheduledSession({
                workoutSessionId: workout.workoutSessionId,
                adherentId: selectedClient.adherentId,
                scheduledDate: targetDate.toISOString(),
                scheduledTime: '09:00',
            });
            onWorkoutImported();
            onClose();
        } catch {
            alert("Erreur lors de l'import");
        }
    };

    const handleSelectMeal = (meal: Meal) => {
        setSelectedMeal(meal);
        setMealSubStep('date');
    };

    const handleImportMeal = async () => {
        if (!selectedMeal) return;
        try {
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
            await Promise.all(weekDays.map(day => {
                const d = new Date(day);
                d.setHours(12, 0, 0, 0);
                return scheduledMealService.createScheduledMeal({
                    mealId: selectedMeal.mealId,
                    adherentId: selectedClient.adherentId,
                    scheduledDate: d.toISOString(),
                    scheduledTime: scheduleTime || undefined,
                });
            }));
            onMealImported();
            onClose();
        } catch {
            alert("Erreur lors de l'import du repas");
        }
    };

    // Build history from existing scheduled items
    const history = [
        ...scheduledSessions.map(s => ({
            type: 'workout' as const,
            name: s.workoutSession?.name ?? 'Séance',
            date: s.scheduledDate,
            createdAt: s.createdAt ?? s.scheduledDate,
        })),
        ...scheduledMeals.map(m => ({
            type: 'meal' as const,
            name: m.meal?.name ?? 'Repas',
            date: m.scheduledDate,
            createdAt: m.createdAt ?? m.scheduledDate,
        })),
    ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    const filteredWorkouts = workouts.filter(w =>
        w.name.toLowerCase().includes(workoutSearch.toLowerCase()) ||
        (w.category?.toLowerCase().includes(workoutSearch.toLowerCase()) ?? false)
    );

    const filteredMeals = meals.filter(m =>
        m.name.toLowerCase().includes(mealSearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {step !== 'select' && (
                            <button
                                onClick={() => { setStep('select'); setMealSubStep('pick'); setSelectedMeal(null); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        {mealSubStep === 'date' && step === 'meal' && (
                            <button
                                onClick={() => setMealSubStep('pick')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <h2 style={{ margin: 0 }}>
                            {step === 'select' && 'Importer'}
                            {step === 'workout' && 'Séances d\'entraînement'}
                            {step === 'meal' && (mealSubStep === 'pick' ? 'Meals (Repas)' : `Planifier : ${selectedMeal?.name}`)}
                            {step === 'supplement' && 'Supplements (Compléments)'}
                        </h2>
                    </div>
                    <button className="close-button" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>

                    {/* ── SELECT SCREEN ── */}
                    {step === 'select' && (
                        <>
                            <p style={{ color: '#6b7280', marginBottom: '1.25rem' }}>Que souhaitez-vous importer ?</p>

                            {/* Type cards */}
                            {[
                                { key: 'workout', icon: <Dumbbell size={24} color="#3b82f6" />, bg: '#eff6ff', title: 'Séances d\'entraînement', desc: 'Importez des séances d\'entraînement existantes' },
                                { key: 'meal', icon: <UtensilsCrossed size={24} color="#f5576c" />, bg: '#fff1f2', title: 'Meals (Repas)', desc: 'Importez des repas et leurs informations nutritionnelles' },
                                { key: 'supplement', icon: <Pill size={24} color="#8b5cf6" />, bg: '#f5f3ff', title: 'Supplements (Compléments)', desc: 'Importez des compléments alimentaires' },
                            ].map(item => (
                                <div
                                    key={item.key}
                                    onClick={() => setStep(item.key as Step)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        padding: '1rem 1.25rem', border: '1px solid #e5e7eb', borderRadius: '12px',
                                        cursor: 'pointer', marginBottom: '0.75rem', transition: 'all 0.15s',
                                        background: 'white',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                                >
                                    <div style={{ width: 44, height: 44, borderRadius: '10px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: '#111827' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{item.desc}</div>
                                    </div>
                                    <ChevronRight size={18} color="#9ca3af" />
                                </div>
                            ))}

                            {/* History */}
                            {history.length > 0 && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 600, color: '#374151' }}>Historique des importations</span>
                                    </div>
                                    {history.map((h, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: i < history.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '8px', background: h.type === 'workout' ? '#eff6ff' : '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {h.type === 'workout' ? <Dumbbell size={16} color="#3b82f6" /> : <UtensilsCrossed size={16} color="#f5576c" />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#111827' }}>
                                                    {h.type === 'workout' ? 'Séances' : 'Meals'} – {h.name}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                                    {format(new Date(h.date), 'd MMM yyyy à HH:mm', { locale: fr })}
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: '999px' }}>Terminé</span>
                                            <ChevronRight size={16} color="#9ca3af" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── WORKOUT STEP ── */}
                    {step === 'workout' && (
                        <>
                            <div className="search-box" style={{ marginBottom: '1rem' }}>
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Rechercher une séance..."
                                    value={workoutSearch}
                                    onChange={e => setWorkoutSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            {workoutLoading ? (
                                <div className="loading-state">Chargement...</div>
                            ) : (
                                <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {filteredWorkouts.length === 0 ? (
                                        <div className="empty-state">Aucune séance trouvée</div>
                                    ) : filteredWorkouts.map(w => (
                                        <div
                                            key={w.workoutSessionId}
                                            style={{ padding: '0.9rem 1rem', border: '1px solid #e5e7eb', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer', background: 'white', transition: 'background 0.15s' }}
                                            onClick={() => handleImportWorkout(w)}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                                        >
                                            <div style={{ width: 40, height: 40, background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Dumbbell size={20} color="#3b82f6" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{w.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{w.category} • {w.duration ?? '?'} min • {w.exerciseCount} exc.</div>
                                            </div>
                                            <button className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Sélectionner</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── MEAL STEP : PICK ── */}
                    {step === 'meal' && mealSubStep === 'pick' && (
                        <>
                            {/* Tab chips */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {tabs.map(t => (
                                    <button
                                        key={t.mealTabId}
                                        onClick={() => setSelectedTabId(t.mealTabId)}
                                        style={{
                                            padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                                            background: selectedTabId === t.mealTabId ? '#f5576c' : '#f3f4f6',
                                            color: selectedTabId === t.mealTabId ? 'white' : '#374151',
                                            border: selectedTabId === t.mealTabId ? '1px solid #f5576c' : '1px solid #e5e7eb',
                                        }}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                            <div className="search-box" style={{ marginBottom: '1rem' }}>
                                <Search size={18} />
                                <input type="text" placeholder="Rechercher un repas..." value={mealSearch} onChange={e => setMealSearch(e.target.value)} autoFocus />
                            </div>
                            {mealLoading ? (
                                <div className="loading-state">Chargement...</div>
                            ) : (
                                <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {filteredMeals.length === 0 ? (
                                        <div className="empty-state">Aucun repas trouvé</div>
                                    ) : filteredMeals.map(m => (
                                        <div
                                            key={m.mealId}
                                            style={{ padding: '0.9rem 1rem', border: '1px solid #e5e7eb', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer', background: 'white', transition: 'background 0.15s' }}
                                            onClick={() => handleSelectMeal(m)}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                                        >
                                            <div style={{ width: 40, height: 40, background: '#fff1f2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <UtensilsCrossed size={20} color="#f5576c" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{m.name}</div>
                                                {m.totalCalories != null && (
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                        {Math.round(m.totalCalories)} kcal • P:{Math.round(m.totalProteins ?? 0)}g • C:{Math.round(m.totalCarbs ?? 0)}g • F:{Math.round(m.totalFats ?? 0)}g
                                                    </div>
                                                )}
                                            </div>
                                            <button className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Sélectionner</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── MEAL STEP : DATE ── */}
                    {step === 'meal' && mealSubStep === 'date' && selectedMeal && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ padding: '1rem', background: '#fff1f2', borderRadius: '10px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <UtensilsCrossed size={20} color="#f5576c" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{selectedMeal.name}</div>
                                    {selectedMeal.totalCalories != null && (
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                            {Math.round(selectedMeal.totalCalories)} kcal
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#6b7280' }}>
                                Ce repas sera planifié sur <strong>les 7 jours de la semaine</strong> affichée.
                            </p>
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Heure (optionnel)</label>
                                <input
                                    type="time"
                                    value={scheduleTime}
                                    onChange={e => setScheduleTime(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <button
                                className="btn-primary"
                                onClick={handleImportMeal}
                                style={{ alignSelf: 'flex-end', padding: '0.6rem 1.5rem' }}
                            >
                                Planifier pour toute la semaine
                            </button>
                        </div>
                    )}

                    {/* ── SUPPLEMENT STEP ── */}
                    {step === 'supplement' && (
                        <>
                            {supplementLoading ? (
                                <div className="loading-state">Chargement...</div>
                            ) : supplementSets.length === 0 ? (
                                <div className="empty-state">Aucun complément configuré</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {supplementSets.map((s: any) => (
                                        <div
                                            key={s.supplementSetId}
                                            style={{ padding: '0.9rem 1rem', border: '1px solid #e5e7eb', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.9rem', opacity: 0.7 }}
                                        >
                                            <div style={{ width: 40, height: 40, background: '#f5f3ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Pill size={20} color="#8b5cf6" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{TIMING_LABELS[s.timing] ?? s.timing}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{s.groups?.length ?? 0} groupe(s)</div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', background: '#ede9fe', padding: '3px 10px', borderRadius: '999px' }}>Bientôt disponible</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
