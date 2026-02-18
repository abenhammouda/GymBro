import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import './CreateWorkoutModal.css';

interface Exercise {
    exerciseTemplateId: number;
    name: string;
    category: string;
}

interface SelectedExercise extends Exercise {
    sets: number;
    reps: number;
    restSeconds: number;
}

interface CreateWorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (workoutData: any) => void;
    exercises: Exercise[];
    editingSession?: {
        workoutSessionId: number;
        name: string;
        description?: string;
        coverImageUrl?: string;
        category: string;
        status: string;
        startDate?: string;
        endDate?: string;
        exerciseCount: number;
        createdAt: string;
        duration?: number;
        exercises?: Array<{
            exerciseTemplateId: number;
            exerciseName: string;
            exerciseCategory?: string;
            orderIndex: number;
            sets: number;
            reps: number;
            restSeconds: number;
        }>;
    } | null;
}

const CreateWorkoutModal = ({ isOpen, onClose, onSave, exercises, editingSession }: CreateWorkoutModalProps) => {
    const [workoutName, setWorkoutName] = useState('');
    const [duration, setDuration] = useState<number>(60); // Durée en minutes
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
    const [selectedExerciseIds, setSelectedExerciseIds] = useState<number[]>([]);
    const [configuredExercises, setConfiguredExercises] = useState<SelectedExercise[]>([]);

    // Groupes musculaires disponibles
    const muscleGroups = [
        'Pectoraux',
        'Épaules',
        'Dos',
        'Jambes',
        'Core',
        'Cardio',
        'Flexibility'
    ];

    // Initialize form when editing a session
    useEffect(() => {
        console.log('🔄 useEffect triggered', { editingSession, exercisesCount: exercises.length });

        if (editingSession) {
            console.log('📝 editingSession data:', editingSession);
            setWorkoutName(editingSession.name);
            setDuration(editingSession.duration || 60);

            // Charger la catégorie si disponible
            console.log('📁 Category check:', editingSession.category);
            if (editingSession.category && editingSession.category !== 'General') {
                console.log('✅ Setting muscle group:', editingSession.category);
                setSelectedMuscleGroup(editingSession.category);
            }

            // Charger les exercices configurés
            console.log('💪 Exercise check:', editingSession.exercises);
            if (editingSession.exercises && editingSession.exercises.length > 0) {
                console.log('✅ Loading', editingSession.exercises.length, 'exercises');
                const loadedExercises: SelectedExercise[] = editingSession.exercises.map(exercise => {
                    // Trouver l'exercice dans la liste globale pour info supplémentaire
                    const exerciseTemplate = exercises.find(ex => ex.exerciseTemplateId === exercise.exerciseTemplateId);

                    return {
                        exerciseTemplateId: exercise.exerciseTemplateId,
                        name: exercise.exerciseName || exerciseTemplate?.name || 'Exercice',
                        category: exercise.exerciseCategory || exerciseTemplate?.category || '',
                        sets: exercise.sets,
                        reps: exercise.reps,
                        restSeconds: exercise.restSeconds
                    };
                });

                console.log('✅ Loaded exercises:', loadedExercises);
                setConfiguredExercises(loadedExercises);
                setSelectedExerciseIds(loadedExercises.map(ex => ex.exerciseTemplateId));

                // Définir le groupe musculaire basé sur le premier exercice si pas de catégorie
                if (!editingSession.category || editingSession.category === 'General') {
                    const firstExerciseCategory = loadedExercises[0]?.category;
                    if (firstExerciseCategory) {
                        setSelectedMuscleGroup(firstExerciseCategory);
                    }
                }
            }
        } else {
            // Reset form when creating new session
            setWorkoutName('');
            setDuration(60);
            setSelectedMuscleGroup('');
            setSelectedExerciseIds([]);
            setConfiguredExercises([]);
        }
    }, [editingSession, exercises]);

    // Filtrer les exercices par groupe musculaire sélectionné
    const filteredExercises = selectedMuscleGroup
        ? exercises.filter(ex => ex.category === selectedMuscleGroup)
        : [];

    // Gérer le changement de groupe musculaire
    const handleMuscleGroupChange = (category: string) => {
        setSelectedMuscleGroup(category);
        // Réinitialiser la sélection d'exercices si on change de groupe
        setSelectedExerciseIds([]);
        setConfiguredExercises([]);
    };

    // Gérer la sélection multiple d'exercices
    const handleExercisesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const options = event.target.options;
        const selected: number[] = [];

        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(parseInt(options[i].value));
            }
        }

        setSelectedExerciseIds(selected);

        // Mettre à jour la liste configurée
        const newConfigured: SelectedExercise[] = selected.map(id => {
            const exercise = exercises.find(ex => ex.exerciseTemplateId === id);
            const existing = configuredExercises.find(ex => ex.exerciseTemplateId === id);

            if (existing) {
                return existing; // Garder la config existante
            } else if (exercise) {
                return {
                    ...exercise,
                    sets: 3,
                    reps: 12,
                    restSeconds: 60
                };
            }
            return null;
        }).filter(Boolean) as SelectedExercise[];

        setConfiguredExercises(newConfigured);
    };

    // Mettre à jour les paramètres d'un exercice
    const updateExerciseParam = (exerciseId: number, field: keyof SelectedExercise, value: number) => {
        setConfiguredExercises(prev =>
            prev.map(ex =>
                ex.exerciseTemplateId === exerciseId
                    ? { ...ex, [field]: value }
                    : ex
            )
        );
    };

    // Incrémenter/décrémenter le temps de repos par 15 secondes
    const adjustRestTime = (exerciseId: number, increment: boolean) => {
        setConfiguredExercises(prev =>
            prev.map(ex => {
                if (ex.exerciseTemplateId === exerciseId) {
                    const newRest = increment
                        ? ex.restSeconds + 15
                        : Math.max(0, ex.restSeconds - 15);
                    return { ...ex, restSeconds: newRest };
                }
                return ex;
            })
        );
    };

    // Formater le temps de repos (secondes -> "Xmn Ysec" si > 60)
    const formatRestTime = (seconds: number): string => {
        if (seconds >= 60) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return secs > 0 ? `${minutes}mn ${secs}sec` : `${minutes}mn`;
        }
        return `${seconds}sec`;
    };

    // Formater la durée (minutes -> "Xh Ymn" si >= 60)
    const formatDuration = (minutes: number): string => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}mn` : `${hours}h`;
        }
        return `${minutes}mn`;
    };

    // Retirer un exercice de la configuration
    const removeExercise = (exerciseId: number) => {
        setSelectedExerciseIds(prev => prev.filter(id => id !== exerciseId));
        setConfiguredExercises(prev =>
            prev.filter(ex => ex.exerciseTemplateId !== exerciseId)
        );
    };

    // Sauvegarder la workout session
    const handleSave = () => {
        if (!workoutName.trim() || configuredExercises.length === 0) {
            alert('Veuillez remplir le nom et ajouter au moins un exercice');
            return;
        }

        const workoutData = {
            name: workoutName,
            description: '',
            duration: duration, // Durée en minutes
            exercises: configuredExercises.map((ex, index) => ({
                exerciseTemplateId: ex.exerciseTemplateId,
                orderIndex: index,
                sets: ex.sets,
                reps: ex.reps,
                restSeconds: ex.restSeconds
            }))
        };

        onSave(workoutData);
        handleClose();
    };

    // Fermer et réinitialiser
    const handleClose = () => {
        setWorkoutName('');
        setDuration(60);
        setSelectedMuscleGroup('');
        setSelectedExerciseIds([]);
        setConfiguredExercises([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content create-workout-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editingSession ? 'Modifier la Workout Session' : 'Créer une Workout Session'}</h2>
                    <button className="close-btn" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Nom de la session */}
                    <div className="form-group">
                        <label>Nom de la session *</label>
                        <input
                            type="text"
                            placeholder="Ex: Upper Body Blast"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    {/* Durée de la session */}
                    <div className="form-group">
                        <label>Durée de la session</label>
                        <div className="number-input">
                            <button onClick={() => setDuration(Math.max(15, duration - 15))}>-</button>
                            <span className="rest-display">{formatDuration(duration)}</span>
                            <button onClick={() => setDuration(duration + 15)}>+</button>
                        </div>
                    </div>

                    {/* 1. Sélection du groupe musculaire (dropdown) */}
                    <div className="form-group">
                        <label>1. Sélectionner un groupe musculaire</label>
                        <select
                            value={selectedMuscleGroup}
                            onChange={(e) => handleMuscleGroupChange(e.target.value)}
                            className="form-select"
                        >
                            <option value="">-- Choisir un groupe --</option>
                            {muscleGroups.map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                    </div>

                    {/* 2. Sélection des exercices (multi-select dropdown) */}
                    {selectedMuscleGroup && (
                        <div className="form-group">
                            <label>2. Sélectionner les exercices (maintenir Ctrl pour sélection multiple)</label>
                            {filteredExercises.length === 0 ? (
                                <p className="no-exercises">Aucun exercice disponible pour ce groupe</p>
                            ) : (
                                <select
                                    multiple
                                    value={selectedExerciseIds.map(String)}
                                    onChange={handleExercisesChange}
                                    className="form-select-multiple"
                                    size={Math.min(filteredExercises.length, 8)}
                                >
                                    {filteredExercises.map(exercise => (
                                        <option
                                            key={exercise.exerciseTemplateId}
                                            value={exercise.exerciseTemplateId}
                                        >
                                            {exercise.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* 3. Configuration des exercices sélectionnés */}
                    {configuredExercises.length > 0 && (
                        <div className="configured-exercises-section">
                            <h3>3. Configurer les exercices ({configuredExercises.length})</h3>
                            <div className="configured-exercises-list">
                                {configuredExercises.map((exercise) => (
                                    <div key={exercise.exerciseTemplateId} className="configured-exercise-card">
                                        <div className="exercise-header">
                                            <span className="exercise-title">{exercise.name}</span>
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeExercise(exercise.exerciseTemplateId)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="exercise-params">
                                            {/* Séries */}
                                            <div className="param-group">
                                                <label>Séries</label>
                                                <div className="number-input">
                                                    <button onClick={() => updateExerciseParam(exercise.exerciseTemplateId, 'sets', Math.max(1, exercise.sets - 1))}>-</button>
                                                    <input
                                                        type="number"
                                                        value={exercise.sets}
                                                        onChange={(e) => updateExerciseParam(exercise.exerciseTemplateId, 'sets', parseInt(e.target.value) || 1)}
                                                        min="1"
                                                    />
                                                    <button onClick={() => updateExerciseParam(exercise.exerciseTemplateId, 'sets', exercise.sets + 1)}>+</button>
                                                </div>
                                            </div>

                                            {/* Répétitions */}
                                            <div className="param-group">
                                                <label>Reps</label>
                                                <div className="number-input">
                                                    <button onClick={() => updateExerciseParam(exercise.exerciseTemplateId, 'reps', Math.max(1, exercise.reps - 1))}>-</button>
                                                    <input
                                                        type="number"
                                                        value={exercise.reps}
                                                        onChange={(e) => updateExerciseParam(exercise.exerciseTemplateId, 'reps', parseInt(e.target.value) || 1)}
                                                        min="1"
                                                    />
                                                    <button onClick={() => updateExerciseParam(exercise.exerciseTemplateId, 'reps', exercise.reps + 1)}>+</button>
                                                </div>
                                            </div>

                                            {/* Repos */}
                                            <div className="param-group">
                                                <label>Repos</label>
                                                <div className="number-input rest-input">
                                                    <button onClick={() => adjustRestTime(exercise.exerciseTemplateId, false)}>-</button>
                                                    <span className="rest-display">{formatRestTime(exercise.restSeconds)}</span>
                                                    <button onClick={() => adjustRestTime(exercise.exerciseTemplateId, true)}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={handleClose}>
                        Annuler
                    </button>
                    <button
                        className="btn-save"
                        onClick={handleSave}
                        disabled={!workoutName.trim() || configuredExercises.length === 0}
                    >
                        <Plus size={20} />
                        {editingSession ? 'Mettre à jour' : 'Créer la session'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkoutModal;
