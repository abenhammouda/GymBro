import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, User, Calendar as CalendarIcon, Plus, Trash2, X, Dumbbell, UtensilsCrossed } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import ImportWorkoutModal from '../components/ImportWorkoutModal';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AssignedClient, ScheduledWorkoutSession, WorkoutSession, ScheduledMeal, Meal, CalendarEventType } from '../types';
import { isScheduledWorkout, isScheduledMeal } from '../types';
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
    const [clients, setClients] = useState<AssignedClient[]>([]);
    const [selectedClient, setSelectedClient] = useState<AssignedClient | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [scheduledSessions, setScheduledSessions] = useState<ScheduledWorkoutSession[]>([]);
    const [scheduledMeals, setScheduledMeals] = useState<ScheduledMeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isImportMealModalOpen, setIsImportMealModalOpen] = useState(false);
    const [hoveredClient, setHoveredClient] = useState<AssignedClient | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sessionToDeleteId, setSessionToDeleteId] = useState<number | null>(null);
    const [mealToDeleteId, setMealToDeleteId] = useState<number | null>(null);
    const [showWorkouts, setShowWorkouts] = useState(true);
    const [showMeals, setShowMeals] = useState(true);

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
        client.name.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleImportWorkout = async (workout: WorkoutSession) => {
        if (!selectedClient) return;

        try {
            // Schedule for the Monday of the current view
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            const targetDate = new Date(weekStart);
            targetDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues with UTC conversion

            // Validate Max 2 sessions constraint
            const sessionsOnTargetDay = scheduledSessions.filter(s =>
                isSameDay(new Date(s.scheduledDate), targetDate)
            );

            if (sessionsOnTargetDay.length >= 2) {
                toast.error(`Le Lundi est complet (max 2 séances). Veuillez déplacer une session avant d'importer.`);
                return;
            }

            await scheduledWorkoutSessionService.createScheduledSession({
                workoutSessionId: workout.workoutSessionId,
                adherentId: selectedClient.adherentId,
                scheduledDate: targetDate.toISOString(),
                scheduledTime: '09:00'
            });

            toast.success(`Séance "${workout.name}" importée !`);
            loadScheduledSessions(selectedClient.adherentId);
            setIsImportModalOpen(false);
        } catch (error) {
            console.error('Error importing workout:', error);
            toast.error("Erreur lors de l'import");
        }
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

        const sessionId = Number(active.id);
        const newDateStr = over.id as string;

        // Find existing session
        const session = scheduledSessions.find(s => s.scheduledWorkoutSessionId === sessionId);
        if (!session) {
            setActiveId(null);
            return;
        }

        // Check if date actually changed
        const currentDateStr = format(new Date(session.scheduledDate), 'yyyy-MM-dd');
        if (currentDateStr === newDateStr) {
            setActiveId(null);
            return;
        }

        // Validate Max 2 sessions constraint
        const sessionsOnTargetDay = scheduledSessions.filter(s =>
            s.scheduledWorkoutSessionId !== sessionId && // exclude current
            format(new Date(s.scheduledDate), 'yyyy-MM-dd') === newDateStr
        );

        if (sessionsOnTargetDay.length >= 2) {
            toast.error("Maximum 2 séances par jour autorisées !");
            setActiveId(null);
            return;
        }

        // Optimistic update
        const previousSessions = [...scheduledSessions];
        const updatedSession = { ...session, scheduledDate: new Date(newDateStr).toISOString() };

        setScheduledSessions(prev => prev.map(s => s.scheduledWorkoutSessionId === sessionId ? updatedSession : s));

        try {
            await scheduledWorkoutSessionService.updateScheduledSession(sessionId, {
                scheduledDate: new Date(newDateStr).toISOString(),
                scheduledTime: session.scheduledTime // Keep time
            });
            toast.success('Session déplacée !');
        } catch (error) {
            console.error("Failed to move session", error);
            toast.error("Erreur lors du déplacement");
            setScheduledSessions(previousSessions); // Revert
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
                    <div className="calendar-body" style={{ display: 'flex', flex: 1, overflowY: 'auto' }}>
                        {days.map((day, index) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            // Filter events for this day (workouts + meals)
                            const dayEvents = getFilteredEvents().filter(event => {
                                return isSameDay(new Date(event.scheduledDate), day);
                            });

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
                                            const imageUrl = isWorkout ? event.workoutSession?.coverImageUrl : event.meal?.imageUrl;
                                            const gradient = isWorkout
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

                                            return (
                                                <DraggableSession
                                                    key={`${isWorkout ? 'workout' : 'meal'}-${id}`}
                                                    id={`${isWorkout ? 'workout' : 'meal'}-${id}`}
                                                    className="calendar-session-card-wrapper"
                                                >
                                                    <div
                                                        className="calendar-session-card"
                                                        style={{
                                                            background: 'white',
                                                            borderRadius: '12px',
                                                            minHeight: '100px',
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            overflow: 'hidden',
                                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                        }}
                                                    >
                                                        {/* Image on the left */}
                                                        <div style={{
                                                            width: '120px',
                                                            minWidth: '120px',
                                                            backgroundImage: imageUrl
                                                                ? `url(${imageUrl.startsWith('http')
                                                                    ? imageUrl
                                                                    : `${import.meta.env.VITE_API_URL}${imageUrl}`
                                                                })`
                                                                : gradient,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            flexShrink: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            {!imageUrl && (
                                                                isWorkout ? <Dumbbell size={32} color="white" /> : <UtensilsCrossed size={32} color="white" />
                                                            )}
                                                        </div>

                                                        {/* Content on the right */}
                                                        <div style={{
                                                            flex: 1,
                                                            padding: '0.75rem',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'space-between',
                                                            gap: '0.5rem'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                                <div className="calendar-session-card-title" title={name} style={{
                                                                    fontWeight: '600',
                                                                    fontSize: '0.95rem',
                                                                    color: '#1f2937',
                                                                    lineHeight: '1.3',
                                                                    flex: 1
                                                                }}>
                                                                    {name}
                                                                </div>
                                                                <button
                                                                    className="delete-session-btn"
                                                                    onClick={(e) => handleDeleteClick(e, id, isWorkout)}
                                                                    onPointerDown={(e) => e.stopPropagation()}
                                                                    style={{
                                                                        background: '#fee2e2',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        padding: '6px',
                                                                        cursor: 'pointer',
                                                                        color: '#dc2626',
                                                                        display: 'flex',
                                                                        flexShrink: 0,
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.background = '#fecaca';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.background = '#fee2e2';
                                                                    }}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>

                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                                {event.scheduledTime && (
                                                                    <div style={{
                                                                        fontSize: '0.8rem',
                                                                        color: '#6b7280',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.25rem'
                                                                    }}>
                                                                        <CalendarIcon size={12} />
                                                                        {event.scheduledTime}
                                                                    </div>
                                                                )}
                                                                {isWorkout && event.workoutSession?.duration && (
                                                                    <div style={{
                                                                        fontSize: '0.8rem',
                                                                        color: '#6b7280'
                                                                    }}>
                                                                        {event.workoutSession.duration} min
                                                                    </div>
                                                                )}
                                                            </div>
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
                            <div className="calendar-session-card" style={{
                                width: '250px',
                                cursor: 'grabbing',
                                boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
                                background: 'white',
                                borderRadius: '12px',
                                minHeight: '100px',
                                display: 'flex',
                                flexDirection: 'row',
                                overflow: 'hidden'
                            }}>
                                {/* Image on the left */}
                                <div style={{
                                    width: '100px',
                                    minWidth: '100px',
                                    backgroundImage: isScheduledWorkout(activeEvent) && activeEvent.workoutSession?.coverImageUrl
                                        ? `url(${activeEvent.workoutSession.coverImageUrl.startsWith('http')
                                            ? activeEvent.workoutSession.coverImageUrl
                                            : `${import.meta.env.VITE_API_URL}${activeEvent.workoutSession.coverImageUrl}`
                                        })`
                                        : isScheduledMeal(activeEvent) && activeEvent.meal?.imageUrl
                                            ? `url(${activeEvent.meal.imageUrl.startsWith('http')
                                                ? activeEvent.meal.imageUrl
                                                : `${import.meta.env.VITE_API_URL}${activeEvent.meal.imageUrl}`
                                            })`
                                            : isScheduledWorkout(activeEvent)
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    flexShrink: 0
                                }} />

                                {/* Content on the right */}
                                <div style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <div className="calendar-session-card-title" style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            color: '#1f2937',
                                            lineHeight: '1.3',
                                            flex: 1
                                        }}>
                                            {isScheduledWorkout(activeEvent) ? activeEvent.workoutSession?.name : activeEvent.meal?.name}
                                        </div>
                                        <div style={{ opacity: 0.5, color: '#dc2626' }}><Trash2 size={14} /></div>
                                    </div>
                                    <div className="calendar-session-card-duration" style={{
                                        fontSize: '0.85rem',
                                        color: isScheduledWorkout(activeEvent) ? '#667eea' : '#f5576c',
                                        fontWeight: '500'
                                    }}>
                                        {isScheduledWorkout(activeEvent) && activeEvent.workoutSession?.duration ? `⏱️ ${activeEvent.workoutSession.duration} min` : ''}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </div>
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
                                            alt={client.name}
                                            className="client-avatar"
                                        />
                                    ) : (
                                        <div className="client-avatar-placeholder">
                                            <User size={20} />
                                        </div>
                                    )}
                                    <span className="client-name">{client.name}</span>

                                    {hoveredClient?.adherentId === client.adherentId && (
                                        <div className="client-tooltip">
                                            <h4>{client.name}</h4>
                                            {client.age && <p><strong>Âge:</strong> {client.age} ans</p>}
                                            <p><strong>Email:</strong> {client.email}</p>
                                            {client.phoneNumber && (
                                                <p><strong>Téléphone:</strong> {client.phoneNumber}</p>
                                            )}
                                            {client.goal && (
                                                <p><strong>Objectif:</strong> {client.goal}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {selectedClient && (
                <ImportWorkoutModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onSelectWorkout={handleImportWorkout}
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
