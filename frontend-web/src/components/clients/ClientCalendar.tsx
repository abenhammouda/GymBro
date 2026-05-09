import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, UtensilsCrossed, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ScheduledWorkoutSession, ScheduledMeal } from '../../types';
import { scheduledWorkoutSessionService } from '../../services/scheduledWorkoutSession.service';
import { scheduledMealService } from '../../services/scheduledMeal.service';
import './ClientCalendar.css';

interface ClientCalendarProps {
    adherentId: number;
}

const ClientCalendar: React.FC<ClientCalendarProps> = ({ adherentId }) => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [sessions, setSessions] = useState<ScheduledWorkoutSession[]>([]);
    const [meals, setMeals] = useState<ScheduledMeal[]>([]);
    const [loading, setLoading] = useState(true);

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [s, m] = await Promise.all([
                scheduledWorkoutSessionService.getScheduledSessionsByClient(adherentId),
                scheduledMealService.getScheduledMealsByClient(adherentId),
            ]);
            setSessions(s);
            setMeals(m);
        } catch {
            setSessions([]);
            setMeals([]);
        } finally {
            setLoading(false);
        }
    }, [adherentId]);

    useEffect(() => { load(); }, [load]);

    const sessionsForDay = (day: Date) =>
        sessions.filter(s => isSameDay(new Date(s.scheduledDate), day));

    const mealsForDay = (day: Date) =>
        meals.filter(m => isSameDay(new Date(m.scheduledDate), day));

    const isToday = (day: Date) => isSameDay(day, new Date());



    return (
        <div className="client-calendar">
            {/* Week navigation */}
            <div className="client-cal-nav">
                <button className="client-cal-nav-btn" onClick={() => setCurrentWeek(w => subWeeks(w, 1))}>
                    <ChevronLeft size={16} />
                </button>
                <div className="client-cal-period">
                    <Calendar size={14} />
                    <span>
                        {format(weekStart, 'd MMM', { locale: fr })} –{' '}
                        {format(weekEnd, 'd MMM yyyy', { locale: fr })}
                    </span>
                    <button
                        className="client-cal-today-btn"
                        onClick={() => setCurrentWeek(new Date())}
                    >
                        Aujourd'hui
                    </button>
                </div>
                <button className="client-cal-nav-btn" onClick={() => setCurrentWeek(w => addWeeks(w, 1))}>
                    <ChevronRight size={16} />
                </button>
            </div>

            {loading ? (
                <div className="client-cal-loading">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="client-cal-day-skeleton" />
                    ))}
                </div>
            ) : (
                <>
                    {/* Day columns */}
                    <div className="client-cal-grid">
                        {days.map(day => {
                            const daySessions = sessionsForDay(day);
                            const dayMeals = mealsForDay(day);
                            const hasEvents = daySessions.length > 0 || dayMeals.length > 0;

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`client-cal-day ${isToday(day) ? 'client-cal-day--today' : ''}`}
                                >
                                    {/* Day header */}
                                    <div className="client-cal-day-header">
                                        <span className="client-cal-day-name">
                                            {format(day, 'EEE', { locale: fr })}
                                        </span>
                                        <span className={`client-cal-day-num ${isToday(day) ? 'client-cal-day-num--today' : ''}`}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    {/* Events */}
                                    <div className="client-cal-day-events">
                                        {daySessions.map(s => (
                                            <div key={`w-${s.scheduledWorkoutSessionId}`} className="client-cal-event client-cal-event--workout">
                                                <div className="client-cal-event-icon">
                                                    <Dumbbell size={11} />
                                                </div>
                                                <div className="client-cal-event-body">
                                                    <span className="client-cal-event-name">
                                                        {s.workoutSession?.name ?? 'Séance'}
                                                    </span>
                                                    {s.scheduledTime && (
                                                        <span className="client-cal-event-time">{s.scheduledTime}</span>
                                                    )}
                                                    {s.workoutSession?.duration && (
                                                        <span className="client-cal-event-meta">{s.workoutSession.duration} min</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {dayMeals.map(m => (
                                            <div key={`m-${m.scheduledMealId}`} className="client-cal-event client-cal-event--meal">
                                                <div className="client-cal-event-icon">
                                                    <UtensilsCrossed size={11} />
                                                </div>
                                                <div className="client-cal-event-body">
                                                    <span className="client-cal-event-name">
                                                        {m.meal?.name ?? 'Repas'}
                                                    </span>
                                                    {m.scheduledTime && (
                                                        <span className="client-cal-event-time">{m.scheduledTime}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {!hasEvents && (
                                            <div className="client-cal-day-empty">—</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="client-cal-summary">
                        <span><Dumbbell size={13} /> {sessions.length} séance{sessions.length !== 1 ? 's' : ''} au total</span>
                        <span><UtensilsCrossed size={13} /> {meals.length} repas au total</span>
                        <span className="client-cal-summary-week">
                            Cette semaine : {days.reduce((n, d) => n + sessionsForDay(d).length + mealsForDay(d).length, 0)} événement(s)
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};

export default ClientCalendar;
