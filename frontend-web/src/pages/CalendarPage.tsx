import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, User, Calendar as CalendarIcon, Plus, Trash2, X, Dumbbell, UtensilsCrossed } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import ImportModal from '../components/ImportModal';
import MacroPieChart from '../components/clients/MacroPieChart';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ScheduledWorkoutSession, ScheduledMeal, CalendarEventType } from '../types';
import type { ClientSummary, MacroPlan } from '../services/client.service';
import { isScheduledWorkout, isScheduledMeal } from '../types';

const CATEGORY_GRADIENTS: Record<string, string> = {
    UpperBody:   'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
    LowerBody:   'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
    Cardio:      'linear-gradient(135deg, #e53935 0%, #b71c1c 100%)',
    Core:        'linear-gradient(135deg, #fb8c00 0%, #e65100 100%)',
    Flexibility: 'linear-gradient(135deg, #8e24aa 0%, #4a148c 100%)',
    Other:       'linear-gradient(135deg, #546e7a 0%, #263238 100%)',
};

const getCategoryGradient = (category?: string): string =>
    (category && CATEGORY_GRADIENTS[category]) || CATEGORY_GRADIENTS.Other;
import { clientService } from '../services/client.service';
import { scheduledWorkoutSessionService } from '../services/scheduledWorkoutSession.service';
import { scheduledMealService } from '../services/scheduledMeal.service';
import './CalendarPage.css';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter, useDraggable, useDroppable, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import toast, { Toaster } from 'react-hot-toast';

// DND Components
function DroppableDay({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const style = {
        backgroundColor: isOver ? 'rgba(102, 126, 234, 0.1)' : undefined,
        height: '100%',
        minHeight: '100px', // Ensure drop target has height even if empty
    };

    return (
        <div ref={setNodeRef} style={style} className={className} data-day-id={id}>
            {children}
        </div>
    );
}

function DraggableSession({ id, children, className, style: propStyle }: { id: string, children: React.ReactNode, className?: string, style?: any }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
    });

    const style = {
        ...propStyle,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 2000 : 10,
        opacity: isDragging ? 0.7 : 1,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={className}>
            {children}
        </div>
    );
}

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'Week' | 'Month'>('Week');
    const [clients, setClients] = useState<ClientSummary[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [scheduledSessions, setScheduledSessions] = useState<ScheduledWorkoutSession[]>([]);
    const [scheduledMeals, setScheduledMeals] = useState<ScheduledMeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [hoveredClient, setHoveredClient] = useState<ClientSummary | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sessionToDeleteId, setSessionToDeleteId] = useState<number | null>(null);
    const [mealToDeleteId, setMealToDeleteId] = useState<number | null>(null);
    const [showWorkouts, setShowWorkouts] = useState(true);
    const [showMeals, setShowMeals] = useState(true);
    const [hoveredEvent, setHoveredEvent] = useState<{
        key: string;
        isWorkout: boolean;
        event: CalendarEventType;
        rect: { top: number; left: number; bottom: number };
    } | null>(null);
    const [clientMacroPlan, setClientMacroPlan] = useState<MacroPlan | null>(null);

    useEffect(() => {
        if (!selectedClient) {
            setClientMacroPlan(null);
            return;
        }
        clientService.getCurrentMacroPlan(selectedClient.coachClientId)
            .then(setClientMacroPlan)
            .catch(() => setClientMacroPlan(null));
    }, [selectedClient]);

    const handleDeleteClick = (e: React.MouseEvent, id: number, isWorkout: boolean = true) => {
        // Prevent drag start
        e.stopPropagation();
        e.preventDefault();
        if (isWorkout) {
            setSessionToDeleteId(id);
            setMealToDeleteId(null);
        } else {
            setMealToDeleteId(id);
            setSessionToDeleteId(null);
        }
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteSession = async () => {
        try {
            if (sessionToDeleteId) {
                await scheduledWorkoutSessionService.deleteScheduledSession(sessionToDeleteId);
                toast.success('Session supprimée');
                if (selectedClient) {
                    loadScheduledSessions(selectedClient.adherentId);
                }
            } else if (mealToDeleteId) {
                await scheduledMealService.deleteScheduledMeal(mealToDeleteId);
                toast.success('Repas supprimé');
                if (selectedClient) {
                    loadScheduledMeals(selectedClient.adherentId);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la suppression');
        } finally {
            setIsDeleteModalOpen(false);
            setSessionToDeleteId(null);
            setMealToDeleteId(null);
        }
    };
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        if (selectedClient) {
            loadScheduledSessions(selectedClient.adherentId);
            loadScheduledMeals(selectedClient.adherentId);
        }
    }, [selectedClient]);

    const loadClients = async () => {
        try {
            setLoading(true);
            const clientsData = await clientService.getMyClients();
            setClients(clientsData);
        } catch (error) {
            console.error('Error loading clients:', error);
            toast.error('Erreur lors du chargement des clients');
        } finally {
            setLoading(false);
        }
    };

    const loadScheduledSessions = async (clientId: number) => {
        try {
            console.log('Loading sessions for client:', clientId);
            const sessions = await scheduledWorkoutSessionService.getScheduledSessionsByClient(clientId);
            setScheduledSessions(sessions);
        } catch (error) {
            console.error('Error loading scheduled sessions:', error);
            toast.error('Erreur lors du chargement des sessions');
            setScheduledSessions([]);
        }
    };

    const loadScheduledMeals = async (clientId: number) => {
        try {
            console.log('Loading meals for client:', clientId);
            const meals = await scheduledMealService.getScheduledMealsByClient(clientId);
            setScheduledMeals(meals);
        } catch (error) {
            console.error('Error loading scheduled meals:', error);
            toast.error('Erreur lors du chargement des repas');
            setScheduledMeals([]);
        }
    };

    // Helper function to get all filtered events (workouts + meals)
    const getFilteredEvents = (): CalendarEventType[] => {
        const events: CalendarEventType[] = [];
        if (showWorkouts) {
            events.push(...scheduledSessions);
        }
        if (showMeals) {
            events.push(...scheduledMeals);
        }
        return events;
    };

    const filteredClients = clients.filter(client =>
        client.adherentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePrevious = () => {
        if (view === 'Week') {
            setCurrentDate(subWeeks(currentDate, 1));
        } else {
            setCurrentDate(subMonths(currentDate, 1));
        }
    };

    const handleNext = () => {
        if (view === 'Week') {
            setCurrentDate(addWeeks(currentDate, 1));
        } else {
            setCurrentDate(addMonths(currentDate, 1));
        }
    };

    const handleWorkoutImported = () => {
        toast.success('Séance importée !');
        if (selectedClient) loadScheduledSessions(selectedClient.adherentId);
        setIsImportModalOpen(false);
    };

    const handleMealImported = () => {
        toast.success('Repas planifié !');
        if (selectedClient) loadScheduledMeals(selectedClient.adherentId);
        setIsImportModalOpen(false);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        // Parse "workout-{id}" format
        const rawId = active.id.toString();
        if (!rawId.startsWith('workout-')) { setActiveId(null); return; }
        const sessionId = Number(rawId.replace('workout-', ''));

        const newDateStr = over.id as string;

        const session = scheduledSessions.find(s => s.scheduledWorkoutSessionId === sessionId);
        if (!session) { setActiveId(null); return; }

        const currentDateStr = format(new Date(session.scheduledDate), 'yyyy-MM-dd');
        if (currentDateStr === newDateStr) { setActiveId(null); return; }

        // Sessions on target day (excluding the dragged one)
        const sessionsOnTargetDay = scheduledSessions.filter(s =>
            s.scheduledWorkoutSessionId !== sessionId &&
            format(new Date(s.scheduledDate), 'yyyy-MM-dd') === newDateStr
        );

        const previousSessions = [...scheduledSessions];
        try {
            // Swap: move sessions from target day back to original day
            for (const swapSession of sessionsOnTargetDay) {
                await scheduledWorkoutSessionService.updateScheduledSession(swapSession.scheduledWorkoutSessionId, {
                    scheduledDate: new Date(currentDateStr + 'T12:00:00.000Z').toISOString(),
                    scheduledTime: swapSession.scheduledTime
                });
            }
            // Move the dragged session to target day
            await scheduledWorkoutSessionService.updateScheduledSession(sessionId, {
                scheduledDate: new Date(newDateStr + 'T12:00:00.000Z').toISOString(),
                scheduledTime: session.scheduledTime
            });
            toast.success(sessionsOnTargetDay.length > 0 ? 'Séances échangées !' : 'Séance déplacée !');
            if (selectedClient) loadScheduledSessions(selectedClient.adherentId);
        } catch (error) {
            console.error('Failed to move session', error);
            toast.error('Erreur lors du déplacement');
            setScheduledSessions(previousSessions);
        }

        setActiveId(null);
    };

    const renderSessionsForMonth = (currentDay: Date) => {
        const filteredEvents = getFilteredEvents();
        const dayEvents = filteredEvents.filter(event => {
            const eventDate = new Date(isScheduledWorkout(event) ? event.scheduledDate : event.scheduledDate);
            return isSameDay(eventDate, currentDay);
        });

        return dayEvents.map((event) => {
            const isWorkout = isScheduledWorkout(event);
            const name = isWorkout ? event.workoutSession?.name : event.meal?.name;
            const time = isWorkout ? event.scheduledTime : event.scheduledTime;
            const color = isWorkout ? '#667eea' : '#f5576c';
            const id = isWorkout ? event.scheduledWorkoutSessionId : event.scheduledMealId;

            return (
                <div
                    key={`${isWorkout ? 'workout' : 'meal'}-${id}`}
                    className="session-item-month"
                    style={{ borderLeft: `3px solid ${color}` }}
                    title={`${time} - ${name}`}
                >
                    <span className="session-time">{time}</span>
                    <span className="session-title">{name}</span>
                </div>
            );
        });
    };

    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        const days: Date[] = [];
        let day = weekStart;

        while (day <= weekEnd) {
            days.push(day);
            day = addDays(day, 1);
        }

        const activeEvent = activeId ? getFilteredEvents().find(e => {
            const isWorkout = isScheduledWorkout(e);
            const id = isWorkout ? e.scheduledWorkoutSessionId : e.scheduledMealId;
            return `${isWorkout ? 'workout' : 'meal'}-${id}` === activeId;
        }) : null;

        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="calendar-grid week-view-simple">
                    <div className="calendar-header" style={{ display: 'flex' }}>
                        {days.map((day, index) => (
                            <div key={index} className="day-header" style={{ flex: 1 }}>
                                <div className="day-name">{format(day, 'EEEE', { locale: fr })}</div>
                                <div className="day-number">{format(day, 'd')}</div>
                            </div>
                        ))}
                    </div>
                    <div className="calendar-body" style={{ display: 'flex', flex: 1 }}>
                        {days.map((day, index) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            // Filter + sort by scheduledTime so pre-workout items appear before the session
                            const dayEvents = getFilteredEvents()
                                .filter(event => isSameDay(new Date(event.scheduledDate), day))
                                .sort((a, b) => (a.scheduledTime ?? '23:59').localeCompare(b.scheduledTime ?? '23:59'));

                            return (
                                <DroppableDay
                                    key={index}
                                    id={dateStr}
                                    className="day-column"
                                >
                                    <div className="day-column-content" style={{ padding: '0.5rem', height: '100%' }}>
                                        {dayEvents.map(event => {
                                            const isWorkout = isScheduledWorkout(event);
                                            const id = isWorkout ? event.scheduledWorkoutSessionId : event.scheduledMealId;
                                            const name = isWorkout ? event.workoutSession?.name : event.meal?.name;
                                            const eventKey = `${isWorkout ? 'workout' : 'meal'}-${id}`;
                                            const pillClass = isWorkout ? 'cal-pill cal-pill--workout' : 'cal-pill cal-pill--meal';

                                            return (
                                                <DraggableSession
                                                    key={eventKey}
                                                    id={eventKey}
                                                    className="cal-pill-wrapper"
                                                >
                                                    <div
                                                        className={pillClass}
                                                        onMouseEnter={(e) => {
                                                            const r = e.currentTarget.getBoundingClientRect();
                                                            setHoveredEvent({
                                                                key: eventKey,
                                                                isWorkout,
                                                                event,
                                                                rect: { top: r.top, left: r.left, bottom: r.bottom }
                                                            });
                                                        }}
                                                        onMouseLeave={() => setHoveredEvent(null)}
                                                    >
                                                        <span className="cal-pill__icon">
                                                            {isWorkout
                                                                ? <Dumbbell size={13} />
                                                                : <UtensilsCrossed size={13} />}
                                                        </span>
                                                        <span className="cal-pill__name">{name}</span>
                                                        <div className="cal-pill__actions">
                                                            <button
                                                                className="cal-pill__del"
                                                                onClick={(e) => handleDeleteClick(e, id, isWorkout)}
                                                                onPointerDown={(e) => e.stopPropagation()}
                                                            >
                                                                <Trash2 size={11} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </DraggableSession>
                                            );
                                        })}
                                    </div>
                                </DroppableDay>
                            );
                        })}
                    </div>

                    <DragOverlay>
                        {activeEvent ? (
                            <div className={isScheduledWorkout(activeEvent) ? 'cal-pill cal-pill--workout' : 'cal-pill cal-pill--meal'}
                                style={{ width: '180px', cursor: 'grabbing', opacity: 0.9, boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}>
                                <span className="cal-pill__icon">
                                    {isScheduledWorkout(activeEvent) ? <Dumbbell size={13} /> : <UtensilsCrossed size={13} />}
                                </span>
                                <span className="cal-pill__name">
                                    {isScheduledWorkout(activeEvent) ? activeEvent.workoutSession?.name : activeEvent.meal?.name}
                                </span>
                            </div>
                        ) : null}
                    </DragOverlay>
                </div>

                {hoveredEvent && (() => {
                    const { event: hovEvt, isWorkout: isW, rect } = hoveredEvent;
                    const estimatedHeight = 80;
                    const placeAbove = rect.bottom + estimatedHeight > window.innerHeight - 10;
                    const top = placeAbove ? rect.top - estimatedHeight - 5 : rect.bottom + 5;
                    const left = Math.min(rect.left, window.innerWidth - 250);
                    return (
                        <div className="cal-pill__tooltip" style={{ position: 'fixed', top, left }}>
                            {isW && isScheduledWorkout(hovEvt) ? (
                                <>
                                    {hovEvt.scheduledTime && <div>🕐 {hovEvt.scheduledTime}</div>}
                                    {hovEvt.workoutSession?.duration && <div>⏱ {hovEvt.workoutSession.duration} min</div>}
                                    {hovEvt.workoutSession?.category && <div>🏷 {hovEvt.workoutSession.category}</div>}
                                    {hovEvt.workoutSession?.exerciseCount != null && <div>💪 {hovEvt.workoutSession.exerciseCount} exercices</div>}
                                </>
                            ) : !isW && isScheduledMeal(hovEvt) ? (() => {
                                const meal = hovEvt.meal;
                                const ings = meal?.ingredients ?? [];
                                const firstThree = ings.slice(0, 3).map(i => i.name).join(', ');
                                const extra = ings.length > 3 ? ` (+${ings.length - 3})` : '';
                                return (
                                    <>
                                        {meal?.totalCalories != null && (
                                            <div>
                                                🔥 {Math.round(meal.totalCalories)} kcal
                                                {meal.totalProteins != null && (
                                                    <span style={{ color: '#6b7280', fontSize: '0.72rem', marginLeft: 6 }}>
                                                        • P:{Math.round(meal.totalProteins)}g C:{Math.round(meal.totalCarbs ?? 0)}g F:{Math.round(meal.totalFats ?? 0)}g
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {ings.length > 0 && (
                                            <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: 2 }}>
                                                {firstThree}{extra}
                                            </div>
                                        )}
                                    </>
                                );
                            })() : null}
                        </div>
                    );
                })()}
            </DndContext>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows: Date[][] = [];
        let days: Date[] = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                days.push(day);
                day = addDays(day, 1);
            }
            rows.push(days);
            days = [];
        }

        return (
            <div className="calendar-grid month-view">
                <div className="calendar-header">
                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((dayName, index) => (
                        <div key={index} className="day-header">
                            {dayName}
                        </div>
                    ))}
                </div>
                <div className="calendar-body">
                    {rows.map((week, weekIndex) => (
                        <div key={weekIndex} className="week-row">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className={`day-cell ${!isSameMonth(day, currentDate) ? 'other-month' : ''}`}
                                    data-date={format(day, 'yyyy-MM-dd')}
                                >
                                    <div className="day-number">{format(day, 'd')}</div>
                                    <div className="day-sessions">
                                        {renderSessionsForMonth(day)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <MainLayout>
            <Toaster />
            <div className="calendar-page">
                <div className="calendar-container">
                    <div className="calendar-header-controls">
                        <div className="calendar-title">
                            <CalendarIcon size={28} />
                            <h1>Calendrier</h1>
                        </div>
                        <div className="calendar-navigation">
                            <button className="nav-button" onClick={handlePrevious}>
                                <ChevronLeft size={20} />
                            </button>
                            <div className="current-period">
                                {view === 'Week'
                                    ? `Semaine du ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: fr })} au ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: fr })}`
                                    : format(currentDate, 'MMMM yyyy', { locale: fr })}
                            </div>
                            <button className="nav-button" onClick={handleNext}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <div className="view-toggle">
                            <button
                                className={`view-button ${view === 'Week' ? 'active' : ''}`}
                                onClick={() => setView('Week')}
                            >
                                Semaine
                            </button>
                            <button
                                className={`view-button ${view === 'Month' ? 'active' : ''}`}
                                onClick={() => setView('Month')}
                            >
                                Mois
                            </button>
                        </div>
                    </div>

                    {/* Event Type Filters */}
                    {selectedClient && (
                        <div className="calendar-filters" style={{
                            display: 'flex',
                            gap: '0.75rem',
                            padding: '0.75rem 1.5rem',
                            background: '#f9fafb',
                            borderBottom: '1px solid #e5e7eb'
                        }}>
                            <button
                                className={`filter-toggle ${showWorkouts ? 'active' : ''}`}
                                onClick={() => setShowWorkouts(!showWorkouts)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    border: showWorkouts ? '2px solid #667eea' : '2px solid transparent',
                                    borderRadius: '8px',
                                    background: showWorkouts ? 'white' : 'transparent',
                                    color: '#667eea',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: showWorkouts ? '600' : '500',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Dumbbell size={18} />
                                Workouts
                            </button>
                            <button
                                className={`filter-toggle ${showMeals ? 'active' : ''}`}
                                onClick={() => setShowMeals(!showMeals)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    border: showMeals ? '2px solid #f5576c' : '2px solid transparent',
                                    borderRadius: '8px',
                                    background: showMeals ? 'white' : 'transparent',
                                    color: '#f5576c',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: showMeals ? '600' : '500',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <UtensilsCrossed size={18} />
                                Repas
                            </button>
                        </div>
                    )}

                    {view === 'Week' ? renderWeekView() : renderMonthView()}
                </div>

                <div className="clients-sidebar">
                    <div className="sidebar-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Clients</h2>
                            {selectedClient && (
                                <button
                                    className="btn-primary"
                                    onClick={() => setIsImportModalOpen(true)}
                                    style={{
                                        fontSize: '0.8rem',
                                        padding: '0.4rem 0.8rem',
                                        display: 'flex',
                                        gap: '0.4rem',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Plus size={14} />
                                    Importer
                                </button>
                            )}
                        </div>
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher un client..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="clients-list">
                        {loading ? (
                            <div className="loading-state">Chargement...</div>
                        ) : filteredClients.length === 0 ? (
                            <div className="empty-state">Aucun client trouvé</div>
                        ) : (
                            filteredClients.map(client => (
                                <div
                                    key={client.adherentId}
                                    className={`client-item ${selectedClient?.adherentId === client.adherentId ? 'selected' : ''}`}
                                    onClick={() => setSelectedClient(client)}
                                    onMouseEnter={() => setHoveredClient(client)}
                                    onMouseLeave={() => setHoveredClient(null)}
                                >
                                    {client.profilePicture ? (
                                        <img
                                            src={client.profilePicture.startsWith('http')
                                                ? client.profilePicture
                                                : `${import.meta.env.VITE_API_URL}${client.profilePicture}`}
                                            alt={client.adherentName}
                                            className="client-avatar"
                                        />
                                    ) : (
                                        <div className="client-avatar-placeholder">
                                            <User size={20} />
                                        </div>
                                    )}
                                    <span className="client-name">{client.adherentName}</span>

                                    {hoveredClient?.adherentId === client.adherentId && (
                                        <div className="client-tooltip">
                                            <h4>{client.adherentName}</h4>
                                            {client.age && <p><strong>Âge:</strong> {client.age} ans</p>}
                                            {client.adherentEmail && <p><strong>Email:</strong> {client.adherentEmail}</p>}
                                            {client.goalSummary && (
                                                <p><strong>Objectif:</strong> {client.goalSummary}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Client info panel: stats + nutrition plan + goal */}
                    {selectedClient && (
                        <div className="client-info-panel">
                            <div className="client-info-stats">
                                {selectedClient.height != null && (
                                    <div className="client-info-stat">
                                        <span className="client-info-stat-label">Taille</span>
                                        <span className="client-info-stat-value">{Math.round(selectedClient.height)} cm</span>
                                    </div>
                                )}
                                {selectedClient.age != null && (
                                    <div className="client-info-stat">
                                        <span className="client-info-stat-label">Âge</span>
                                        <span className="client-info-stat-value">{selectedClient.age} ans</span>
                                    </div>
                                )}
                                {selectedClient.gender && (
                                    <div className="client-info-stat">
                                        <span className="client-info-stat-label">Sexe</span>
                                        <span className="client-info-stat-value">{selectedClient.gender}</span>
                                    </div>
                                )}
                            </div>

                            <div className="client-info-section">
                                <div className="client-info-section-title">🍽 Plan Nutritionnel</div>
                                {clientMacroPlan ? (
                                    <div style={{ height: 180 }}>
                                        <MacroPieChart macroPlan={clientMacroPlan} />
                                    </div>
                                ) : (
                                    <div className="client-info-empty">Pas de plan nutritionnel défini</div>
                                )}
                            </div>

                            <div className="client-info-section">
                                <div className="client-info-section-title">🎯 Objectif</div>
                                {(() => {
                                    const ng = selectedClient.nutritionGoal;
                                    const delta = selectedClient.caloriesDelta;
                                    if (ng === 'Deficit') {
                                        return <div className="client-info-goal client-info-goal--deficit">Déficit calorique{delta != null && ` · −${Math.abs(delta)} kcal`}</div>;
                                    }
                                    if (ng === 'Surplus') {
                                        return <div className="client-info-goal client-info-goal--surplus">Surplus calorique{delta != null && ` · +${Math.abs(delta)} kcal`}</div>;
                                    }
                                    if (ng === 'Maintenance') {
                                        return <div className="client-info-goal client-info-goal--maintain">Maintien</div>;
                                    }
                                    return <div className="client-info-goal client-info-goal--undefined">Objectif à définir</div>;
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {selectedClient && (
                <ImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    selectedClient={selectedClient}
                    currentDate={currentDate}
                    scheduledSessions={scheduledSessions}
                    scheduledMeals={scheduledMeals}
                    onWorkoutImported={handleWorkoutImported}
                    onMealImported={handleMealImported}
                />
            )}

            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', width: '90%' }}>
                        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                            <h3 style={{ margin: 0 }}>Confirmer la suppression</h3>
                            <button className="close-button" onClick={() => setIsDeleteModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ paddingTop: '1rem' }}>
                            <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>Voulez-vous vraiment supprimer cette séance du calendrier ?</p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Annuler</button>
                                <button className="btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={confirmDeleteSession}>Supprimer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default CalendarPage;
