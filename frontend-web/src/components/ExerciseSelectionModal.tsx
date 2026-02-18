import React, { useState, useEffect } from 'react';
import { Search, Trash2, Plus, Minus } from 'lucide-react';
import Modal from './ui/Modal';
import exerciseTemplateService from '../services/exerciseTemplate.service';
import type { ExerciseTemplate, CreateWorkoutSessionExerciseRequest } from '../types';
import './ExerciseSelectionModal.css';

interface ExerciseSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (exercises: CreateWorkoutSessionExerciseRequest[]) => void;
    initialExercises?: CreateWorkoutSessionExerciseRequest[];
}

interface SelectedExercise extends CreateWorkoutSessionExerciseRequest {
    exerciseTemplate?: ExerciseTemplate;
}

const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialExercises = []
}) => {
    const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [isLoading, setIsLoading] = useState(false);

    const categories = ['Tous', 'Pectoraux', 'Épaules', 'Dos', 'Jambes', 'Core', 'Cardio'];

    useEffect(() => {
        loadExercises();
    }, []);

    useEffect(() => {
        if (initialExercises.length > 0) {
            loadInitialExercises();
        }
    }, [initialExercises]);

    const loadExercises = async () => {
        try {
            setIsLoading(true);
            const data = await exerciseTemplateService.getExerciseTemplates();
            setExercises(data);
        } catch (error) {
            console.error('Error loading exercises:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadInitialExercises = async () => {
        const exercisesWithDetails = await Promise.all(
            initialExercises.map(async (ex) => {
                const template = exercises.find(e => e.exerciseTemplateId === ex.exerciseTemplateId);
                return {
                    ...ex,
                    exerciseTemplate: template
                };
            })
        );
        setSelectedExercises(exercisesWithDetails);
    };

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Tous' || ex.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const isExerciseSelected = (exerciseId: number) => {
        return selectedExercises.some(ex => ex.exerciseTemplateId === exerciseId);
    };

    const handleToggleExercise = (exercise: ExerciseTemplate) => {
        if (isExerciseSelected(exercise.exerciseTemplateId)) {
            setSelectedExercises(prev =>
                prev.filter(ex => ex.exerciseTemplateId !== exercise.exerciseTemplateId)
            );
        } else {
            setSelectedExercises(prev => [...prev, {
                exerciseTemplateId: exercise.exerciseTemplateId,
                orderIndex: prev.length,
                sets: 3,
                reps: 12,
                restSeconds: 60,
                exerciseTemplate: exercise
            }]);
        }
    };

    const handleUpdateExercise = (exerciseId: number, field: string, value: number) => {
        setSelectedExercises(prev => prev.map(ex =>
            ex.exerciseTemplateId === exerciseId
                ? { ...ex, [field]: value }
                : ex
        ));
    };

    const handleRemoveExercise = (exerciseId: number) => {
        setSelectedExercises(prev =>
            prev.filter(ex => ex.exerciseTemplateId !== exerciseId)
                .map((ex, index) => ({ ...ex, orderIndex: index }))
        );
    };

    const handleSave = () => {
        const exercisesToSave = selectedExercises.map(({ exerciseTemplate, ...ex }) => ex);
        onSave(exercisesToSave);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Sélectionner les exercices"
            size="large"
        >
            <div className="exercise-selection-modal">
                {/* Search and Filters */}
                <div className="selection-header">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher des exercices..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="category-filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Exercise List */}
                <div className="exercise-list">
                    {isLoading ? (
                        <p>Chargement...</p>
                    ) : (
                        filteredExercises.map(exercise => {
                            const selected = selectedExercises.find(
                                ex => ex.exerciseTemplateId === exercise.exerciseTemplateId
                            );
                            const isSelected = !!selected;

                            return (
                                <div
                                    key={exercise.exerciseTemplateId}
                                    className={`exercise-item ${isSelected ? 'selected' : ''}`}
                                >
                                    <div className="exercise-main" onClick={() => handleToggleExercise(exercise)}>
                                        <div className="exercise-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => { }}
                                            />
                                        </div>

                                        {exercise.thumbnailUrl && (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}${exercise.thumbnailUrl}`}
                                                alt={exercise.name}
                                                className="exercise-thumbnail"
                                            />
                                        )}

                                        <div className="exercise-info">
                                            <h4>{exercise.name}</h4>
                                            <span className="exercise-category">{exercise.category}</span>
                                        </div>
                                    </div>

                                    {isSelected && selected && (
                                        <div className="exercise-config">
                                            <div className="config-group">
                                                <label>Séries</label>
                                                <div className="number-input">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateExercise(
                                                            exercise.exerciseTemplateId,
                                                            'sets',
                                                            Math.max(1, selected.sets - 1)
                                                        )}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={selected.sets}
                                                        onChange={(e) => handleUpdateExercise(
                                                            exercise.exerciseTemplateId,
                                                            'sets',
                                                            parseInt(e.target.value) || 1
                                                        )}
                                                        min="1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateExercise(
                                                            exercise.exerciseTemplateId,
                                                            'sets',
                                                            selected.sets + 1
                                                        )}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="config-group">
                                                <label>Répétitions</label>
                                                <div className="number-input">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateExercise(
                                                            exercise.exerciseTemplateId,
                                                            'reps',
                                                            Math.max(1, selected.reps - 1)
                                                        )}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={selected.reps}
                                                        onChange={(e) => handleUpdateExercise(
                                                            exercise.exerciseTemplateId,
                                                            'reps',
                                                            parseInt(e.target.value) || 1
                                                        )}
                                                        min="1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateExercise(
                                                            exercise.exerciseTemplateId,
                                                            'reps',
                                                            selected.reps + 1
                                                        )}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="config-group">
                                                <label>Repos (sec)</label>
                                                <input
                                                    type="number"
                                                    value={selected.restSeconds}
                                                    onChange={(e) => handleUpdateExercise(
                                                        exercise.exerciseTemplateId,
                                                        'restSeconds',
                                                        parseInt(e.target.value) || 0
                                                    )}
                                                    min="0"
                                                    className="rest-input"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                className="btn-remove"
                                                onClick={() => handleRemoveExercise(exercise.exerciseTemplateId)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Actions */}
                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onClose}
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        className="btn-submit"
                        onClick={handleSave}
                        disabled={selectedExercises.length === 0}
                    >
                        Ajouter les exercices ({selectedExercises.length})
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ExerciseSelectionModal;
